
    // ── Import Questions ──────────────────────────
    let importQuestions = [];

    function openImportModal() {
      importQuestions = [];
      document.getElementById('importPreviewArea').classList.add('hidden');
      document.getElementById('importPreviewList').innerHTML = '';
      document.getElementById('importErrorList').innerHTML = '';
      document.getElementById('importErrorList').classList.add('hidden');
      document.getElementById('importModalError').classList.add('hidden');
      document.getElementById('importFileInput').value = '';
      document.getElementById('importConfirmBtn').disabled = true;
      document.getElementById('importModal').classList.remove('hidden');
    }

    function clearImport() {
      importQuestions = [];
      document.getElementById('importPreviewArea').classList.add('hidden');
      document.getElementById('importFileInput').value = '';
      document.getElementById('importConfirmBtn').disabled = true;
    }

    function handleImportDrop(event) {
      event.preventDefault();
      document.getElementById('importDropZone').classList.remove('drag-over');
      const file = event.dataTransfer.files[0];
      if (file) handleImportFile(file);
    }

    function handleImportFile(file) {
      if (!file) return;
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'json') {
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) throw new Error('File JSON phải là một mảng câu hỏi');
            loadImportPreview(data);
          } catch (err) {
            showErr('importModalError', 'Lỗi đọc file JSON: ' + err.message);
          }
        };
        reader.readAsText(file);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
            const parsed = rows.map(row => {
              let choices = row.choices;
              try { if (typeof choices === 'string') choices = JSON.parse(choices); } catch (_) { }
              if (!Array.isArray(choices)) choices = String(choices || '').split('|').map(s => s.trim()).filter(Boolean);
              let correct_answer = row.correct_answer;
              try { if (typeof correct_answer === 'string' && correct_answer) correct_answer = JSON.parse(correct_answer); } catch (_) { }
              let tags = row.tags;
              if (typeof tags === 'string') tags = tags.split(',').map(t => t.trim()).filter(Boolean);
              else if (!Array.isArray(tags)) tags = [];
              return {
                title: String(row.title || '').trim(),
                description: String(row.description || '').trim(),
                question_type: String(row.question_type || 'single').trim(),
                choices,
                correct_index: row.correct_index !== '' ? Number(row.correct_index) : undefined,
                correct_answer: Array.isArray(correct_answer) ? correct_answer : null,
                explanation: String(row.explanation || '').trim(),
                tags,
                difficulty: Number(row.difficulty) || 0
              };
            });
            loadImportPreview(parsed);
          } catch (err) {
            showErr('importModalError', 'Lỗi đọc file XLSX: ' + err.message);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        showErr('importModalError', 'Chỉ hỗ trợ file .json và .xlsx');
      }
    }

    function loadImportPreview(data) {
      document.getElementById('importModalError').classList.add('hidden');
      const valid = [];
      const errors = [];
      const QTYPE_SHORT = { single: 'Một đáp án', multiple: 'Nhiều đáp án', matching: 'Nối đôi', ordering: 'Sắp xếp' };

      data.forEach((q, i) => {
        const qType = q.question_type || 'single';
        if (!q.title || !q.description || !Array.isArray(q.choices) || q.choices.length < 2) {
          errors.push(`Câu ${i + 1} "${q.title || '(không tiêu đề)'}": Thiếu tiêu đề, nội dung hoặc đáp án`);
          return;
        }
        if (qType === 'single' && (q.correct_index === undefined || q.correct_index === null || q.correct_index === '')) {
          errors.push(`Câu ${i + 1} "${q.title}": Thiếu correct_index`);
          return;
        }
        valid.push({ ...q, _rowNum: i + 1 });
      });

      importQuestions = valid;

      const previewEl = document.getElementById('importPreviewList');
      previewEl.innerHTML = valid.map((q, i) => `
    <div class="import-preview-row">
      <span class="text-gray-400">${i + 1}</span>
      <span class="text-gray-800 font-medium truncate" title="${esc(q.title)}">${esc(q.title)}</span>
      <span class="qtype-badge qtype-${q.question_type || 'single'}" style="font-size:10px">${QTYPE_SHORT[q.question_type || 'single'] || q.question_type}</span>
      <span class="text-amber-500">${'★'.repeat(q.difficulty || 0)}<span class="text-gray-200">${'★'.repeat(5 - (q.difficulty || 0))}</span></span>
    </div>`).join('') || '<p class="text-xs text-gray-400 text-center py-4">Không có câu hỏi hợp lệ</p>';

      const errorEl = document.getElementById('importErrorList');
      if (errors.length > 0) {
        errorEl.innerHTML = errors.map(e => `<div class="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">${esc(e)}</div>`).join('');
        errorEl.classList.remove('hidden');
      } else {
        errorEl.innerHTML = '';
        errorEl.classList.add('hidden');
      }

      document.getElementById('importPreviewCount').textContent = `(${valid.length} hợp lệ${errors.length ? ', ' + errors.length + ' lỗi' : ''})`;
      document.getElementById('importPreviewArea').classList.remove('hidden');
      document.getElementById('importConfirmBtn').disabled = valid.length === 0;
    }

    async function confirmImport() {
      if (importQuestions.length === 0) return;
      const btn = document.getElementById('importConfirmBtn');
      btn.disabled = true;
      btn.textContent = 'Đang import...';

      const payload = importQuestions.map(({ _rowNum, ...q }) => q);
      const res = await api('/questions/import', { method: 'POST', body: { questions: payload } });
      const data = await res.json();
      btn.textContent = 'Import câu hỏi';

      if (!res.ok) {
        showErr('importModalError', data.error || 'Import thất bại');
        btn.disabled = false;
        return;
      }

      document.getElementById('importModal').classList.add('hidden');
      await loadAll();
      const msg = data.errors && data.errors.length > 0
        ? `Đã import ${data.imported} câu hỏi.\nCó ${data.errors.length} lỗi:\n` + data.errors.join('\n')
        : `Đã import thành công ${data.imported} câu hỏi!`;
      alert(msg);
    }
    // ── AI Account Requests ─────────────────────────────────
    async function loadAIRequests() {
      const tbody = document.getElementById('aiRequestsTable');
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-400 py-12 text-sm">Đang tải...</td></tr>';
      const res = await api('/ai-requests');
      if (!res.ok) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-red-400 py-12 text-sm">Lỗi tải dữ liệu</td></tr>';
        return;
      }
      const data = await res.json();
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-gray-400 py-12 text-sm">Không có yêu cầu nào</td></tr>';
        return;
      }

      tbody.innerHTML = data.map(r => {
        const name = r.profiles?.display_name || 'Không xác định';
        const org = r.profiles?.organization || '';

        let stBadge = '';
        if (r.status === 'pending') stBadge = '<span class="status-badge bg-amber-100 text-amber-700">Chờ duyệt</span>';
        else if (r.status === 'approved') stBadge = '<span class="status-badge bg-emerald-100 text-emerald-700">Đã cấp</span>';
        else stBadge = '<span class="status-badge bg-red-100 text-red-700">Từ chối</span>';

        return `
    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td class="px-5 py-3">
        <div class="font-semibold text-gray-900">${esc(name)}</div>
        ${org ? `<div class="text-xs text-gray-500 mt-0.5">${esc(org)}</div>` : ''}
      </td>
      <td class="px-5 py-3 font-mono text-blue-600 font-semibold">${r.score}/100</td>
      <td class="px-5 py-3 text-center">
        <span class="inline-flex px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700">${r.recommended_tier}</span>
        ${r.allocated_tier && r.allocated_tier !== r.recommended_tier ? `<br/><span class="text-[10px] text-gray-400 mt-1 block">(Đã cấp: ${r.allocated_tier})</span>` : ''}
      </td>
      <td class="px-5 py-3 text-center">${stBadge}</td>
      <td class="px-5 py-3 text-xs text-gray-500">${new Date(r.created_at).toLocaleString('vi-VN')}</td>
      <td class="px-5 py-3 text-center">
        ${r.status === 'pending' ? `
          <div class="flex items-center justify-center gap-2">
            <button onclick="updateAIRequest('${r.id}', 'approved')" class="btn-sm btn-edit bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100">Duyệt</button>
            <button onclick="updateAIRequest('${r.id}', 'rejected')" class="btn-sm btn-delete bg-red-50 text-red-600 border-red-200 hover:bg-red-100">Từ chối</button>
          </div>
        ` : `<span class="text-xs text-gray-400 italic">Đã xử lý</span>`}
      </td>
    </tr>`;
      }).join('');
    }

    async function updateAIRequest(id, status) {
      let allocated_tier = null;
      if (status === 'approved') {
        const override = prompt('Nhập hạng cấp phát (Free, Pro, Max). Để trống nếu đồng ý với hạng đề xuất.');
        if (override !== null && override.trim() !== '') {
          const valid = override.trim();
          if (!['Free', 'Pro', 'Max'].includes(valid)) {
            alert('Hạng không hợp lệ (chỉ nhập Free, Pro, Max)');
            return;
          }
          allocated_tier = valid;
        }
      }

      const res = await api(`/ai-requests/${id}`, {
        method: 'PUT',
        body: { status, allocated_tier }
      });

      if (!res.ok) {
        const data = await res.json();
        alert('Lỗi: ' + (data.error || 'Có lỗi xảy ra'));
        return;
      }

      loadAIRequests();
    }

    // ── Practice Sets ─────────────────────────────────────────
    let allPracticeSets = [];
    let psSelectedIds = new Set();
    let allQuestionsForPs = [];
    let scaleRowCount = 0;

    async function loadPracticeSets() {
      const res = await api('/practice-sets');
      if (!res.ok) return;
      allPracticeSets = await res.json();
      renderPracticeSets();
    }

    function renderPracticeSets() {
      const el = document.getElementById('practiceSetList');
      if (!allPracticeSets.length) {
        el.innerHTML = `<div class="card p-10 text-center animate-fade-up">
      <p class="text-gray-400 font-medium">Chưa có bộ ôn tập nào</p>
    </div>`; return;
      }
      el.innerHTML = allPracticeSets.map(s => `
    <div class="card p-5 animate-fade-up">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-bold text-gray-800">${esc(s.name)}</h3>
            ${s.is_public
          ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Công khai</span>'
          : '<span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Ẩn</span>'}
          </div>
          ${s.description ? `<p class="text-sm text-gray-500">${esc(s.description)}</p>` : ''}
          <p class="text-xs text-gray-400 mt-1">${s.questionCount} câu hỏi · Tạo ${new Date(s.created_at).toLocaleDateString('vi-VN')}</p>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button onclick="viewPracticeDetail('${s.id}')" class="btn-sm" style="background:#f0f9ff;color:#0284c7;border:1px solid #bae6fd">Chi tiết</button>
          <button onclick="viewPracticeResults('${s.id}','${esc(s.name)}')" class="btn-sm btn-purple">Kết quả</button>
          <button onclick="editPracticeSet('${s.id}')" class="btn-sm btn-edit">Sửa</button>
          <button onclick="deletePracticeSet('${s.id}')" class="btn-sm btn-delete">Xoá</button>
        </div>
      </div>
    </div>
  `).join('');
    }

    async function openPracticeSetModal(editId) {
      document.getElementById('psEditId').value = editId || '';
      document.getElementById('practiceSetModalTitle').textContent = editId ? 'Chỉnh sửa bộ ôn tập' : 'Thêm bộ ôn tập';
      document.getElementById('psName').value = '';
      document.getElementById('psDesc').value = '';
      document.getElementById('psPublic').checked = true;
      document.getElementById('psQSearch').value = '';
      document.getElementById('scaleRows').innerHTML = '';
      scaleRowCount = 0;
      psSelectedIds = new Set();

      allQuestionsForPs = allQuestions.length ? allQuestions : [];

      if (editId) {
        const s = allPracticeSets.find(x => x.id === editId);
        if (s) {
          document.getElementById('psName').value = s.name;
          document.getElementById('psDesc').value = s.description || '';
          document.getElementById('psPublic').checked = s.is_public;
          psSelectedIds = new Set(s.question_ids || []);
          if (Array.isArray(s.scoring_scale) && s.scoring_scale.length) {
            s.scoring_scale.forEach(row => addScaleRow(row));
          }
        }
      }

      filterPsQuestions();
      document.getElementById('practiceSetModal').classList.remove('hidden');
    }

    function closePracticeSetModal() {
      document.getElementById('practiceSetModal').classList.add('hidden');
    }

    function filterPsQuestions() {
      const q = document.getElementById('psQSearch').value.toLowerCase();
      const filtered = allQuestionsForPs.filter(x =>
        x.title.toLowerCase().includes(q) || (x.description || '').toLowerCase().includes(q)
      );
      const typeLabels = { single: 'Chọn 1', multiple: 'Chọn nhiều', matching: 'Nối đôi', ordering: 'Sắp xếp' };
      const list = document.getElementById('psQList');
      list.innerHTML = filtered.slice(0, 100).map(q => {
        const checked = psSelectedIds.has(q.id);
        return `
      <label class="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition">
        <input type="checkbox" ${checked ? 'checked' : ''} onchange="togglePsQuestion('${q.id}', this.checked)"
          class="w-4 h-4 rounded text-indigo-600"/>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-700 truncate">${esc(q.title)}</p>
          <p class="text-xs text-gray-400">${typeLabels[q.question_type] || q.question_type}</p>
        </div>
      </label>`;
      }).join('') || '<div class="text-center text-gray-400 py-6 text-sm">Không tìm thấy</div>';

      document.getElementById('psQCount').textContent = `${psSelectedIds.size} đã chọn`;
    }

    function togglePsQuestion(id, checked) {
      if (checked) psSelectedIds.add(id); else psSelectedIds.delete(id);
      document.getElementById('psQCount').textContent = `${psSelectedIds.size} đã chọn`;
    }

    function addScaleRow(data) {
      scaleRowCount++;
      const id = scaleRowCount;
      const div = document.createElement('div');
      div.id = `scale-row-${id}`;
      div.className = 'flex items-center gap-2';
      div.innerHTML = `
    <input type="number" placeholder="Từ" min="0" max="100" value="${data?.min ?? ''}"
      class="field w-16 text-sm py-1.5" id="scale-min-${id}"/>
    <span class="text-gray-400 text-sm">–</span>
    <input type="number" placeholder="Đến" min="0" max="100" value="${data?.max ?? ''}"
      class="field w-16 text-sm py-1.5" id="scale-max-${id}"/>
    <input type="text" placeholder="Nhãn (VD: Xuất sắc)" value="${data?.label ?? ''}"
      class="field flex-1 text-sm py-1.5" id="scale-label-${id}"/>
    <input type="color" value="${data?.color ?? '#6366f1'}" class="w-8 h-8 rounded cursor-pointer border border-gray-200" id="scale-color-${id}"/>
    <button type="button" onclick="document.getElementById('scale-row-${id}').remove()" class="text-gray-300 hover:text-red-400 transition">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>`;
      document.getElementById('scaleRows').appendChild(div);
    }

    function collectScale() {
      const rows = document.querySelectorAll('#scaleRows > div[id^="scale-row-"]');
      if (!rows.length) return null;
      const scale = [];
      for (const row of rows) {
        const id = row.id.replace('scale-row-', '');
        const min = parseInt(document.getElementById(`scale-min-${id}`).value);
        const max = parseInt(document.getElementById(`scale-max-${id}`).value);
        const label = document.getElementById(`scale-label-${id}`).value.trim();
        const color = document.getElementById(`scale-color-${id}`).value;
        if (isNaN(min) || isNaN(max) || !label) continue;
        scale.push({ min, max, label, color });
      }
      return scale.length ? scale : null;
    }

    async function savePracticeSet() {
      const name = document.getElementById('psName').value.trim();
      if (!name) { alert('Vui lòng nhập tên bộ ôn tập'); return; }

      const editId = document.getElementById('psEditId').value;
      const body = {
        name,
        description: document.getElementById('psDesc').value.trim(),
        is_public: document.getElementById('psPublic').checked,
        question_ids: [...psSelectedIds],
        scoring_scale: collectScale()
      };

      const url = editId ? `/practice-sets/${editId}` : '/practice-sets';
      const method = editId ? 'PUT' : 'POST';
      const res = await api(url, { method, body });
      if (!res.ok) { const e = await res.json(); alert(e.error || 'Lỗi lưu'); return; }
      closePracticeSetModal();
      loadPracticeSets();
    }

    async function editPracticeSet(id) {
      await openPracticeSetModal(id);
    }

    function viewPracticeDetail(id) {
      const s = allPracticeSets.find(x => x.id === id);
      if (!s) return;

      document.getElementById('pdName').textContent = s.name;

      // Meta badges
      const metaEl = document.getElementById('pdMeta');
      metaEl.innerHTML = s.is_public
        ? '<span class="text-[11px] bg-green-400/20 text-green-200 border border-green-300/30 px-2 py-0.5 rounded-full font-medium">Công khai</span>'
        : '<span class="text-[11px] bg-white/10 text-white/60 border border-white/20 px-2 py-0.5 rounded-full font-medium">Ẩn</span>';

      // Description
      const descWrap = document.getElementById('pdDescWrap');
      if (s.description) {
        document.getElementById('pdDesc').textContent = s.description;
        descWrap.classList.remove('hidden');
      } else {
        descWrap.classList.add('hidden');
      }

      // Stats
      const qIds = s.question_ids || [];
      document.getElementById('pdQCount').textContent = qIds.length;
      document.getElementById('pdVisibility').textContent = s.is_public ? 'Công khai' : 'Ẩn';
      document.getElementById('pdCreated').textContent = new Date(s.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

      // Question list
      const typeLabel = { single: 'Chọn 1', multiple: 'Chọn nhiều', matching: 'Nối đôi', ordering: 'Sắp xếp' };
      const typeColor = { single: '#2563eb', multiple: '#7c3aed', matching: '#d97706', ordering: '#059669' };
      const pdQ = document.getElementById('pdQuestions');
      if (!qIds.length) {
        pdQ.innerHTML = '<p class="text-sm text-gray-400 italic">Chưa có câu hỏi nào.</p>';
      } else {
        pdQ.innerHTML = qIds.map((qid, i) => {
          const q = allQuestions.find(x => x.id === qid);
          const label = q?.question_type || 'single';
          const color = typeColor[label] || '#64748b';
          return `<div class="flex items-center gap-3 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0">${i+1}</span>
            <span class="flex-1 text-sm text-gray-800 font-medium leading-snug">${q ? esc(q.title) : '<span class="text-gray-400 italic text-xs">Câu hỏi không tồn tại</span>'}</span>
            ${q ? `<span class="text-[10px] font-semibold px-1.5 py-0.5 rounded" style="background:${color}18;color:${color}">${typeLabel[label]||label}</span>` : ''}
          </div>`;
        }).join('');
      }

      // Scoring scale
      const scaleWrap = document.getElementById('pdScaleWrap');
      const scaleEl   = document.getElementById('pdScale');
      const scale = s.scoring_scale;
      if (scale && scale.length) {
        const maxPct = Math.max(...scale.map(r => r.min_pct || 0));
        scaleEl.innerHTML = scale.map(row => {
          const pct = row.min_pct || 0;
          const bar = maxPct > 0 ? Math.round(pct / 100 * 100) : 0;
          return `<div class="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50">
            <div class="w-3 h-3 rounded-full flex-shrink-0" style="background:${row.color||'#94a3b8'}"></div>
            <span class="text-sm font-semibold text-gray-700 w-28 flex-shrink-0">${esc(row.label||'')}</span>
            <div class="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div class="h-1.5 rounded-full" style="width:${bar}%;background:${row.color||'#94a3b8'}"></div>
            </div>
            <span class="text-xs text-gray-400 flex-shrink-0">≥ ${pct}%</span>
          </div>`;
        }).join('');
        scaleWrap.classList.remove('hidden');
      } else {
        scaleWrap.classList.add('hidden');
      }

      // Edit button
      document.getElementById('pdEditBtn').onclick = () => {
        document.getElementById('practiceDetailModal').classList.add('hidden');
        editPracticeSet(id);
      };

      document.getElementById('practiceDetailModal').classList.remove('hidden');
    }

    async function deletePracticeSet(id) {
      if (!confirm('Xoá bộ ôn tập này? Toàn bộ kết quả liên quan cũng sẽ bị xoá.')) return;
      const res = await api(`/practice-sets/${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); alert(e.error || 'Lỗi xoá'); return; }
      loadPracticeSets();
    }

    async function viewPracticeResults(setId, setName) {
      document.getElementById('practiceResultsTitle').textContent = `Kết quả: ${setName}`;
      document.getElementById('practiceResultsTable').innerHTML = '<tr><td colspan="6" class="text-center text-gray-400 py-8 text-sm">Đang tải...</td></tr>';
      document.getElementById('practiceResultsModal').classList.remove('hidden');

      const res = await api(`/practice-sets/${setId}/results`);
      const rows = res.ok ? await res.json() : [];

      document.getElementById('practiceResultsCount').textContent = `${rows.length} kết quả`;

      if (!rows.length) {
        document.getElementById('practiceResultsTable').innerHTML = '<tr><td colspan="6" class="text-center text-gray-400 py-8 text-sm">Chưa có kết quả nào</td></tr>';
        return;
      }

      document.getElementById('practiceResultsTable').innerHTML = rows.map(r => `
    <tr class="border-b border-gray-50 hover:bg-gray-50 transition">
      <td class="px-4 py-3 font-medium text-gray-800">${esc(r.user_name)}</td>
      <td class="px-4 py-3 text-gray-500 text-sm">${esc(r.organization || '-')}</td>
      <td class="px-4 py-3 text-center font-semibold text-gray-700">${r.score}/${r.total}</td>
      <td class="px-4 py-3 text-center font-bold text-indigo-600">${r.pct}%</td>
      <td class="px-4 py-3 text-center"><span class="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">${esc(r.level_label)}</span></td>
      <td class="px-4 py-3 text-gray-400 text-xs">${new Date(r.completed_at).toLocaleString('vi-VN')}</td>
    </tr>
  `).join('');
    }

  