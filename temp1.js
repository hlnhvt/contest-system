
    let adminPassword = '';
    let topicGroups = [];
    let currentTopicGroupFilter = '';
    let allContests = [];
    let allQuestions = [];
    let assignContestId = '';
    let assignSelected = [];
    const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const CL = ['A', 'B', 'C', 'D'];

    let filterBookmarked = false;
    let filterDifficulty = 0;
    let modalDifficulty = 0;
    let currentPage = 1;
    let pageSize = 15;
    let filteredQuestions = [];
    let selectedQIds = new Set();
    let isDeleting = false;
    const DIFF_LABELS = ['', 'Rất dễ', 'Dễ', 'Trung bình', 'Khó', 'Rất khó'];

    // ── Question type modal state ────────────────
    let currentQType = 'single';
    let singleChoices = ['', '', '', ''];
    let singleCorrect = -1;
    let multiChoices = ['', '', '', ''];
    let multiCorrects = [];        // indices of correct answers
    let matchPairs = [{ l: '', r: '' }, { l: '', r: '' }];
    let orderItems = ['', '', ''];

    const QTYPE_LABELS = { single: 'Một đáp án', multiple: 'Nhiều đáp án', matching: 'Nối đôi', ordering: 'Sắp xếp' };
    const CHOICE_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#ea580c'];

    const IC = {
      clock: `<svg class="w-3.5 h-3.5 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      flag: `<svg class="w-3.5 h-3.5 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21V5m0 0h13l-3 4 3 4H3"/></svg>`,
      assign: `<svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
      view: `<svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
      edit: `<svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
      trash: `<svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
      doc: `<svg class="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
      bulb: `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
      emptyFlag: `<svg class="w-10 h-10 mb-2 text-gray-200 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 21V5m0 0h13l-3 4 3 4H3"/></svg>`,
      emptyBulb: `<svg class="w-10 h-10 mb-2 text-gray-200 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`,
      publish: `<svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      lock: `<svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`
    };

    // ── Auth ──────────────────────────────────────
    async function adminLogin() {
      const pass = document.getElementById('adminPass').value;
      const res = await fetch('/api/admin/verify', { headers: { 'x-admin-password': pass } });
      if (!res.ok) {
        document.getElementById('loginError').textContent = 'Mật khẩu không đúng';
        document.getElementById('loginError').classList.remove('hidden');
        return;
      }
      adminPassword = pass;
      localStorage.setItem('adminPass', pass);
      document.getElementById('loginPage').classList.add('hidden');
      document.getElementById('mainApp').classList.remove('hidden');
      loadAll();
    }
    document.getElementById('adminPass').addEventListener('keydown', e => { if (e.key === 'Enter') adminLogin(); });

    function api(path, opts = {}) {
      return fetch('/api/admin' + path, {
        ...opts,
        headers: { 'x-admin-password': adminPassword, 'Content-Type': 'application/json', ...(opts.headers || {}) },
        body: opts.body ? JSON.stringify(opts.body) : undefined
      });
    }

    async function loadAll() {
      const [cr, qr, pr, tr] = await Promise.all([api('/contests'), api('/questions'), api('/practice-sets'), api('/topic-groups')]);
      allContests = await cr.json();
      allQuestions = await qr.json();
      allPracticeSets = pr.ok ? await pr.json() : [];
      topicGroups = tr.ok ? await tr.json() : [];
      renderTopicGroupSelects();
      selectedQIds.clear();
      renderContests();
      filterQuestions();
      populateSubFilter();
    }

    // ── Tabs ──────────────────────────────────────
    function showTab(tab) {
      ['contests', 'questions', 'submissions', 'airequests', 'practice', 'topicgroups'].forEach(t => {
        document.getElementById(`pane-${t}`).classList.toggle('hidden', t !== tab);
        const nav = document.getElementById(`nav-${t}`);
        if(nav) nav.className = t === tab ? 'nav-item active' : 'nav-item';
      });
      if (tab === 'submissions') loadSubmissions();
      if (tab === 'airequests') loadAIRequests();
      if (tab === 'practice') loadPracticeSets();
      if (tab === 'topicgroups') renderTopicGroups();
    }

    // ── Contests ──────────────────────────────────
    function renderContests() {
      const el = document.getElementById('contestList');
      const q = document.getElementById('contestSearch')?.value.trim().toLowerCase() || '';

      const filtered = allContests.filter(c => {
        if (!q) return true;
        return (c.name || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
      });

      if (!filtered.length) {
        el.innerHTML = `<div class="card p-10 text-center animate-fade-up">
      ${IC.emptyFlag}
      <p class="text-gray-400 font-medium">${q ? 'Không tìm thấy kỳ thi phù hợp' : 'Chưa có kỳ thi nào'}</p>
    </div>`; return;
      }
      el.innerHTML = filtered.map((c, i) => {
        const now = Date.now(), s = new Date(c.start_time).getTime(), e = new Date(c.end_time).getTime();
        const st = now < s ? 'upcoming' : now <= e ? 'running' : 'ended';
        const stLbl = { running: 'Đang diễn ra', upcoming: 'Sắp diễn ra', ended: 'Đã kết thúc' }[st];
        return `
    <div class="contest-card animate-fade-up stagger-${Math.min(i + 1, 3)}">
      <div class="flex items-start gap-4 flex-wrap">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2.5 mb-2 flex-wrap">
            <h3 class="font-bold text-gray-900">${esc(c.name)}</h3>
            <span class="status-badge status-${st}">${stLbl}</span>
          </div>
          ${c.description ? `<p class="text-gray-400 text-xs mb-2">${esc(c.description)}</p>` : ''}
          <div class="flex gap-4 text-xs text-gray-400 flex-wrap">
            <span>${IC.clock}${fmt(c.start_time)}</span>
            <span>${IC.flag}${fmt(c.end_time)}</span>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap flex-shrink-0 items-start">
          <button onclick="openAssignModal('${c.id}','${esc(c.name)}')" class="btn-sm btn-purple">${IC.assign}Câu hỏi</button>
          <button onclick="openParticipantsModal('${c.id}','${esc(c.name)}')" class="btn-sm btn-copy">👥 Thí sinh</button>
          <a href="/contest?id=${c.id}" target="_blank" class="btn-sm btn-edit" style="text-decoration:none">${IC.view}Xem</a>
          <button onclick="openContestModal('${c.id}')" class="btn-sm btn-edit">${IC.edit}Sửa</button>
          ${c.is_published
            ? `<button onclick="publishContest('${c.id}',false)" class="btn-sm" style="border-color:#fbbf24;color:#92400e;background:#fffbeb">${IC.lock}Đóng băng lại</button>`
            : `<button onclick="publishContest('${c.id}',true)" class="btn-sm" style="border-color:#6ee7b7;color:#065f46;background:#ecfdf5">${IC.publish}Công khai kết quả</button>`
          }
          <button onclick="deleteContest('${c.id}')" class="btn-sm btn-delete">${IC.trash}Xoá</button>
        </div>
      </div>
    </div>`;
      }).join('');
    }

    let contestScaleRowCount = 0;
    function addContestScaleRow(data) {
      contestScaleRowCount++;
      const id = contestScaleRowCount;
      const div = document.createElement('div');
      div.id = `cscale-row-${id}`;
      div.className = 'flex items-center gap-2';
      div.innerHTML = `
    <input type="number" placeholder="Từ" min="0" max="100" value="${data?.min ?? ''}"
      class="field w-16 text-sm py-1.5" id="cscale-min-${id}"/>
    <span class="text-gray-400 text-sm">–</span>
    <input type="number" placeholder="Đến" min="0" max="100" value="${data?.max ?? ''}"
      class="field w-16 text-sm py-1.5" id="cscale-max-${id}"/>
    <input type="text" placeholder="Nhãn (VD: Xuất sắc)" value="${data?.label ?? ''}"
      class="field flex-1 text-sm py-1.5" id="cscale-label-${id}"/>
    <input type="color" value="${data?.color ?? '#3b82f6'}" class="w-8 h-8 rounded cursor-pointer border border-gray-200" id="cscale-color-${id}"/>
    <button type="button" onclick="document.getElementById('cscale-row-${id}').remove()" class="text-gray-300 hover:text-red-400 transition">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>`;
      document.getElementById('contestScaleRows').appendChild(div);
    }

    function collectContestScale() {
      const rows = document.querySelectorAll('#contestScaleRows > div[id^="cscale-row-"]');
      if (!rows.length) return null;
      const scale = [];
      for (const row of rows) {
        const id = row.id.replace('cscale-row-', '');
        const min = parseInt(document.getElementById(`cscale-min-${id}`).value);
        const max = parseInt(document.getElementById(`cscale-max-${id}`).value);
        const label = document.getElementById(`cscale-label-${id}`).value.trim();
        const color = document.getElementById(`cscale-color-${id}`).value;
        if (isNaN(min) || isNaN(max) || !label) continue;
        scale.push({ min, max, label, color });
      }
      return scale.length ? scale : null;
    }

    function openContestModal(id) {
      document.getElementById('contestEditId').value = id || '';
      document.getElementById('contestModalTitle').textContent = id ? 'Sửa kỳ thi' : 'Tạo kỳ thi mới';
      document.getElementById('contestModalError').classList.add('hidden');
      document.getElementById('contestScaleRows').innerHTML = '';

      const psBlock = document.getElementById('cPracticeSetBlock');
      const psSelect = document.getElementById('cPracticeSet');
      const psInfo = document.getElementById('cPracticeSetInfo');
      if (id) {
        const c = allContests.find(x => x.id === id);
        document.getElementById('cName').value = c.name;
        document.getElementById('cDesc').value = c.description || '';
        document.getElementById('cStart').value = toLocal(c.start_time);
        document.getElementById('cEnd').value = toLocal(c.end_time);
        document.getElementById('cRequireLogin').checked = !!c.require_login;
        document.getElementById('cIsAI').checked = !!c.is_ai_assessment;
        if (c.scoring_scale && c.scoring_scale.length > 0) {
          c.scoring_scale.forEach(s => addContestScaleRow(s));
        }
        psBlock.classList.add('hidden');
      } else {
        ['cName', 'cDesc'].forEach(i => document.getElementById(i).value = '');
        const now = toLocal(new Date().toISOString());
        document.getElementById('cStart').value = now;
        document.getElementById('cEnd').value = now;
        document.getElementById('cRequireLogin').checked = false;
        document.getElementById('cIsAI').checked = false;
        psBlock.classList.remove('hidden');
        psInfo.classList.add('hidden');
        psSelect.innerHTML = '<option value="">-- Không chọn --</option>'
          + allPracticeSets.map(s => `<option value="${s.id}">${esc(s.name)} (${s.questionCount || 0} câu)</option>`).join('');
        psSelect.value = '';
      }
      document.getElementById('contestModal').classList.remove('hidden');
    }

    async function saveContest() {
      const id = document.getElementById('contestEditId').value;
      const body = {
        name: document.getElementById('cName').value.trim(),
        description: document.getElementById('cDesc').value.trim(),
        start_time: new Date(document.getElementById('cStart').value).toISOString(),
        end_time: new Date(document.getElementById('cEnd').value).toISOString(),
        require_login: document.getElementById('cRequireLogin').checked,
        is_ai_assessment: document.getElementById('cIsAI').checked,
        scoring_scale: collectContestScale()
      };
      if (!body.name || !document.getElementById('cStart').value) {
        showErr('contestModalError', 'Vui lòng điền đầy đủ thông tin bắt buộc'); return;
      }
      const res = await api(id ? `/contests/${id}` : '/contests', { method: id ? 'PUT' : 'POST', body });
      const data = await res.json();
      if (!res.ok) { showErr('contestModalError', data.error); return; }

      // Auto-assign questions from practice set (chỉ khi tạo mới)
      if (!id) {
        const psId = document.getElementById('cPracticeSet').value;
        if (psId) {
          const ps = allPracticeSets.find(s => s.id === psId);
          if (ps?.question_ids?.length) {
            const questions = ps.question_ids.map((qid, i) => ({
              questionId: qid,
              label: LABELS[i] || `Q${i + 1}`,
              order_num: i
            }));
            await api(`/contests/${data.id}/questions`, { method: 'POST', body: { questions } });
          }
        }
      }

      document.getElementById('contestModal').classList.add('hidden');
      loadAll();
    }

    function openAutoGenerateModal(type) {
      document.getElementById('autoGenType').value = type;
      document.getElementById('autoGenTitle').textContent = type === 'contest' ? 'Tạo kỳ thi tự động' : 'Tạo bộ ôn tập tự động';
      document.getElementById('autoGenNameLabel').textContent = type === 'contest' ? 'kỳ thi' : 'bộ ôn tập';
      document.getElementById('autoGenName').value = '';
      document.getElementById('autoGenCount').value = '10';
      document.getElementById('autoGenDiff').value = '';
      document.getElementById('autoGenError').classList.add('hidden');

      const timeArea = document.getElementById('autoGenTimeArea');
      if (type === 'contest') {
        timeArea.classList.remove('hidden');
        timeArea.classList.add('grid');
        const now = toLocal(new Date().toISOString());
        document.getElementById('autoGenStart').value = now;
        document.getElementById('autoGenEnd').value = now;
      } else {
        timeArea.classList.add('hidden');
        timeArea.classList.remove('grid');
      }

      document.getElementById('autoGenModal').classList.remove('hidden');
    }

    async function submitAutoGenerate() {
      const type = document.getElementById('autoGenType').value;
      const name = document.getElementById('autoGenName').value.trim();
      const count = parseInt(document.getElementById('autoGenCount').value);
      const diff = document.getElementById('autoGenDiff').value;

      if (!name) { showErr('autoGenError', 'Vui lòng nhập tên'); return; }
      if (isNaN(count) || count < 1) { showErr('autoGenError', 'Số lượng không hợp lệ'); return; }

      let body = { name, count, difficulty: diff ? parseInt(diff) : null };
      let url = '';

      if (type === 'contest') {
        const start = document.getElementById('autoGenStart').value;
        const end = document.getElementById('autoGenEnd').value;
        if (!start || !end) { showErr('autoGenError', 'Vui lòng nhập thời gian bắt đầu và kết thúc'); return; }
        body.start_time = new Date(start).toISOString();
        body.end_time = new Date(end).toISOString();
        url = '/contests/auto';
      } else {
        url = '/practice-sets/auto';
      }

      const btn = document.getElementById('btnAutoGenSubmit');
      const oldText = btn.textContent;
      btn.textContent = 'Đang xử lý...';
      btn.disabled = true;

      const res = await api(url, { method: 'POST', body });
      btn.textContent = oldText;
      btn.disabled = false;

      const data = await res.json();
      if (!res.ok) { showErr('autoGenError', data.error); return; }

      document.getElementById('autoGenModal').classList.add('hidden');
      loadAll();
      if (type === 'practice') loadPracticeSets();

      alert(`Tạo thành công ${data.auto_generated_count || count} câu hỏi!`);
    }

    let participantsContestId = '';

    async function openParticipantsModal(contestId, contestName) {
      participantsContestId = contestId;
      document.getElementById('participantsContestName').textContent = contestName;
      document.getElementById('participantsList').innerHTML = '<div class="text-center py-8 text-gray-400 text-sm">Đang tải…</div>';
      document.getElementById('participantsModal').classList.remove('hidden');
      await loadParticipants();
    }

    async function loadParticipants() {
      const res = await api(`/contests/${participantsContestId}/participants`);
      const list = document.getElementById('participantsList');
      if (!res.ok) { list.innerHTML = '<p class="text-red-500 text-sm text-center py-6">Không thể tải danh sách.</p>'; return; }
      const data = await res.json();
      if (!data.length) {
        list.innerHTML = '<p class="text-gray-400 text-sm text-center py-8">Chưa có thí sinh nào tham gia.</p>';
        return;
      }
      list.innerHTML = `
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
              <th class="text-left pb-2 pl-1">#</th>
              <th class="text-left pb-2">Biệt danh</th>
              <th class="text-left pb-2">Đơn vị</th>
              <th class="text-center pb-2">Bài nộp</th>
              <th class="text-center pb-2">Đúng</th>
              <th class="text-left pb-2">Tham gia</th>
              <th class="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            ${data.map((p, i) => `
            <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors" id="prow-${p.id}">
              <td class="py-2.5 pl-1 text-gray-400 text-xs">${i + 1}</td>
              <td class="py-2.5 font-semibold text-gray-800">${esc(p.nickname)}</td>
              <td class="py-2.5 text-gray-500 text-xs">${esc(p.organization || '—')}</td>
              <td class="py-2.5 text-center text-gray-600">${p.totalSubmissions}</td>
              <td class="py-2.5 text-center">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${p.correctSubmissions > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}">${p.correctSubmissions}</span>
              </td>
              <td class="py-2.5 text-gray-400 text-xs">${fmtDate(p.created_at)}</td>
              <td class="py-2.5 text-right">
                <button onclick="deleteParticipant('${p.id}','${esc(p.nickname)}')"
                  class="btn-sm btn-delete" style="padding:4px 10px;font-size:11px">Xoá</button>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
        <p class="text-xs text-gray-400 mt-3 text-right">${data.length} thí sinh</p>`;
    }

    async function deleteParticipant(participantId, nickname) {
      if (!confirm(`Xoá thí sinh "${nickname}"? Toàn bộ bài nộp của thí sinh này cũng sẽ bị xoá.`)) return;
      const btn = document.querySelector(`#prow-${participantId} button`);
      if (btn) { btn.disabled = true; btn.textContent = '…'; }
      const res = await api(`/contests/${participantsContestId}/participants/${participantId}`, { method: 'DELETE' });
      if (!res.ok) {
        const e = await res.json();
        alert('Xoá thất bại: ' + (e.error || res.status));
        if (btn) { btn.disabled = false; btn.textContent = 'Xoá'; }
        return;
      }
      document.getElementById(`prow-${participantId}`)?.remove();
      // Cập nhật số đếm phía dưới
      const countEl = document.querySelector('#participantsList p.text-xs');
      if (countEl) {
        const rows = document.querySelectorAll('#participantsList tbody tr').length;
        countEl.textContent = rows + ' thí sinh';
      }
    }

    async function deleteContest(id) {
      if (!confirm('Xoá kỳ thi? Tất cả bài nộp sẽ bị xoá!')) return;
      const res = await api(`/contests/${id}`, { method: 'DELETE' });
      if (!res.ok) { const e = await res.json(); alert('Xoá thất bại: ' + (e.error || res.status)); return; }
      loadAll();
    }

    async function publishContest(id, publish) {
      const action = publish ? 'publish' : 'unpublish';
      const label = publish ? 'Công khai kết quả?' : 'Đóng băng lại (ẩn kết quả freeze)?';
      if (!confirm(label)) return;
      const res = await api(`/contests/${id}/${action}`, { method: 'POST' });
      if (!res.ok) { alert('Thao tác thất bại'); return; }
      loadAll();
    }

    // ── Assign Questions ──────────────────────────
    async function openAssignModal(contestId, contestName) {
      assignContestId = contestId; assignSelected = [];
      document.getElementById('assignContestName').textContent = contestName;
      document.getElementById('assignSearch').value = '';
      document.getElementById('assignFromSetInfo').classList.add('hidden');
      // Populate practice set dropdown
      const setSelect = document.getElementById('assignFromSet');
      setSelect.innerHTML = '<option value="">-- Chọn bộ ôn tập --</option>'
        + allPracticeSets.map(s => `<option value="${s.id}">${esc(s.name)} (${s.questionCount || 0} câu)</option>`).join('');
      setSelect.value = '';
      document.getElementById('assignModal').classList.remove('hidden');
      const res = await api(`/contests/${contestId}/questions`);
      const current = await res.json();
      assignSelected = current.map(cq => ({ questionId: cq.question_id, label: cq.label, title: cq.question?.title || '' }));
      renderAssignLists();
    }

    function addFromPracticeSet() {
      const setId = document.getElementById('assignFromSet').value;
      const infoEl = document.getElementById('assignFromSetInfo');
      if (!setId) { infoEl.textContent = 'Vui lòng chọn một bộ ôn tập.'; infoEl.classList.remove('hidden'); return; }
      const ps = allPracticeSets.find(s => s.id === setId);
      if (!ps || !ps.question_ids?.length) { infoEl.textContent = 'Bộ ôn tập này chưa có câu hỏi.'; infoEl.classList.remove('hidden'); return; }
      const selIds = new Set(assignSelected.map(s => s.questionId));
      let added = 0;
      for (const qid of ps.question_ids) {
        if (selIds.has(qid)) continue;
        const q = allQuestions.find(x => x.id === qid);
        if (!q) continue;
        const label = LABELS[assignSelected.length] || `Q${assignSelected.length + 1}`;
        assignSelected.push({ questionId: qid, label, title: q.title });
        selIds.add(qid);
        added++;
      }
      const skipped = ps.question_ids.length - added;
      infoEl.textContent = added > 0
        ? `Đã thêm ${added} câu hỏi từ bộ "${ps.name}"${skipped > 0 ? ` (bỏ qua ${skipped} câu đã có)` : ''}.`
        : `Tất cả câu hỏi trong bộ này đã được thêm rồi.`;
      infoEl.classList.remove('hidden');
      renderAssignLists();
    }

    function filterAssignList() { renderAssignLists(); }

    function renderAssignLists() {
      const q = document.getElementById('assignSearch').value.toLowerCase();
      const selIds = new Set(assignSelected.map(s => s.questionId));
      const avail = allQuestions.filter(x => !selIds.has(x.id) && (!q || x.title.toLowerCase().includes(q) || (x.tags || []).join(' ').toLowerCase().includes(q)));

      document.getElementById('assignAvailable').innerHTML = avail.length
        ? avail.map(q => {
            const diff = q.difficulty || 0;
            const stars = diff > 0 ? [1,2,3,4,5].map(n => `<span style="color:${n<=diff?'#f59e0b':'#e2e8f0'};font-size:10px;line-height:1">★</span>`).join('') : '';
            return `
      <div class="assign-item" onclick="addToAssign('${q.id}','${esc(q.title)}')">
        ${IC.doc}
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-800 text-xs truncate">${esc(q.title)}</div>
          <div class="flex items-center gap-2 mt-0.5">
            ${stars ? `<span class="flex">${stars}</span>` : ''}
            ${q.tags?.length ? q.tags.slice(0, 2).map(t => `<span class="tag">${esc(t)}</span>`).join('') : ''}
          </div>
        </div>
        <span class="text-blue-400 text-xs flex-shrink-0">+ Thêm</span>
      </div>`;
          }).join('')
        : '<p class="text-xs text-gray-400 text-center py-6">Không có câu hỏi nào</p>';

      document.getElementById('assignCount').textContent = `(${assignSelected.length} câu)`;
      document.getElementById('assignSelected').innerHTML = assignSelected.length
        ? assignSelected.map((s, i) => {
            const qData = allQuestions.find(x => x.id === s.questionId);
            const diff = qData?.difficulty || 0;
            const stars = diff > 0 ? [1,2,3,4,5].map(n => `<span style="color:${n<=diff?'#f59e0b':'#e2e8f0'};font-size:10px;line-height:1">★</span>`).join('') : '';
            return `
      <div class="assign-selected">
        <span class="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">${esc(s.label)}</span>
        <div class="flex-1 min-w-0">
          <div class="text-xs text-gray-700 truncate">${esc(s.title)}</div>
          ${stars ? `<div class="flex mt-0.5">${stars}</div>` : ''}
        </div>
        <button onclick="removeFromAssign(${i})" class="text-red-400 hover:text-red-600 text-xs flex-shrink-0 px-1">✕</button>
      </div>`;
          }).join('')
        : '<p class="text-xs text-gray-400 text-center py-6">Chưa chọn câu hỏi nào</p>';
    }

    function addToAssign(questionId, title) {
      if (assignSelected.find(s => s.questionId === questionId)) return;
      const label = LABELS[assignSelected.length] || `Q${assignSelected.length + 1}`;
      assignSelected.push({ questionId, label, title });
      document.getElementById('assignSearch').value = '';
      renderAssignLists();
    }

    function removeFromAssign(idx) {
      assignSelected.splice(idx, 1);
      assignSelected = assignSelected.map((s, i) => ({ ...s, label: LABELS[i] || `Q${i + 1}` }));
      renderAssignLists();
    }

    async function saveAssignment() {
      const questions = assignSelected.map((s, i) => ({ questionId: s.questionId, label: s.label, order_num: i }));
      const res = await api(`/contests/${assignContestId}/questions`, { method: 'POST', body: { questions } });
      if (!res.ok) { const d = await res.json(); alert(d.error); return; }
      document.getElementById('assignModal').classList.add('hidden');
      alert(`Đã lưu ${questions.length} câu hỏi vào kỳ thi!`);
    }

    // ── TOPIC GROUPS ──
    async function loadTopicGroups() {
      const data = await api('/topic-groups');
      if (data) {
        topicGroups = data;
        renderTopicGroupSelects();
      }
    }

    function renderTopicGroupSelects() {
      // 1. Render Filter Select
      const filterSel = document.getElementById('qFilterTopic');
      if (filterSel) {
        filterSel.innerHTML = `<option value="">Tất cả chủ đề</option>` +
          topicGroups.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('');
        filterSel.value = currentTopicGroupFilter;
      }
      // 2. Render Checkboxes for Question Modal
      const tgList = document.getElementById('qTopicGroupList');
      if (tgList) {
        if (topicGroups.length === 0) {
          tgList.innerHTML = '<span class="text-xs text-gray-400 italic">Chưa có nhóm chủ đề nào</span>';
        } else {
          tgList.innerHTML = topicGroups.map(t => `
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" value="${t.id}" class="q-topic-checkbox w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300">
              <span class="text-sm text-gray-700">${esc(t.name)}</span>
            </label>
          `).join('');
        }
      }
    }

    function renderTopicGroups() {
      const list = document.getElementById('topicGroupList');
      if (!list) return;
      if (topicGroups.length === 0) {
        list.innerHTML = '<div class="col-span-full p-8 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">Chưa có nhóm chủ đề nào</div>';
        return;
      }
      list.innerHTML = topicGroups.map(t => `
        <div class="card p-4 hover:-translate-y-1 transition-transform">
          <h3 class="font-bold text-gray-800 text-lg mb-1">${esc(t.name)}</h3>
          <p class="text-sm text-gray-500 mb-4 h-10 line-clamp-2">${esc(t.description || 'Không có mô tả')}</p>
          <div class="flex gap-2 justify-end pt-3 border-t border-gray-100">
            <button onclick="editTopicGroup('${t.id}')" class="btn-sm btn-edit">Sửa</button>
            <button onclick="deleteTopicGroup('${t.id}')" class="btn-sm btn-delete">Xóa</button>
          </div>
        </div>
      `).join('');
    }

    let editingTopicGroupId = null;
    function openTopicGroupModal() {
      editingTopicGroupId = null;
      document.getElementById('topicGroupModalTitle').textContent = 'Thêm chủ đề';
      document.getElementById('tgName').value = '';
      document.getElementById('tgDescription').value = '';
      document.getElementById('tgModalError').classList.add('hidden');
      document.getElementById('topicGroupModal').classList.remove('hidden');
    }

    function editTopicGroup(id) {
      const t = topicGroups.find(x => x.id === id);
      if (!t) return;
      editingTopicGroupId = id;
      document.getElementById('topicGroupModalTitle').textContent = 'Sửa chủ đề';
      document.getElementById('tgName').value = t.name;
      document.getElementById('tgDescription').value = t.description || '';
      document.getElementById('tgModalError').classList.add('hidden');
      document.getElementById('topicGroupModal').classList.remove('hidden');
    }

    function closeTopicGroupModal() {
      document.getElementById('topicGroupModal').classList.add('hidden');
    }

    async function saveTopicGroup() {
      const name = document.getElementById('tgName').value.trim();
      const description = document.getElementById('tgDescription').value.trim();
      const errEl = document.getElementById('tgModalError');
      errEl.classList.add('hidden');

      if (!name) {
        errEl.textContent = 'Vui lòng nhập tên chủ đề';
        errEl.classList.remove('hidden');
        return;
      }

      const method = editingTopicGroupId ? 'PUT' : 'POST';
      const path = editingTopicGroupId ? `/topic-groups/${editingTopicGroupId}` : '/topic-groups';
      
      const res = await api(path, { method, body: { name, description } });
      if (res.error) {
        errEl.textContent = res.error;
        errEl.classList.remove('hidden');
      } else {
        closeTopicGroupModal();
        await loadTopicGroups();
        renderTopicGroups();
        filterQuestions();
      }
    }

    async function deleteTopicGroup(id) {
      if (!confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) return;
      const res = await api(`/topic-groups/${id}`, { method: 'DELETE' });
      if (res.error) {
        alert('Lỗi: ' + res.error);
      } else {
        await loadTopicGroups();
        renderTopicGroups();
        filterQuestions();
      }
    }

    // ── Questions ─────────────────────────────────
    function setQListLoading(on, msg = '') {
      let overlay = document.getElementById('qListOverlay');
      if (on) {
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'qListOverlay';
          overlay.style.cssText = 'position:absolute;inset:0;background:rgba(255,255,255,0.75);backdrop-filter:blur(2px);z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-radius:14px';
          overlay.innerHTML = `
            <div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#ef4444;border-radius:50%;animation:spin 0.7s linear infinite"></div>
            <p id="qListOverlayMsg" style="font-size:13px;font-weight:600;color:#374151"></p>`;
          const list = document.getElementById('questionList');
          list.style.position = 'relative';
          list.appendChild(overlay);
        }
        // Vô hiệu hoá toàn bộ nút trong bulk toolbar
        document.querySelectorAll('#bulkToolbar button, #bulkToolbar input').forEach(el => el.disabled = true);
      } else {
        if (overlay) overlay.remove();
        document.querySelectorAll('#bulkToolbar button, #bulkToolbar input').forEach(el => el.disabled = false);
      }
      if (msg) { const m = document.getElementById('qListOverlayMsg'); if (m) m.textContent = msg; }
    }

    function renderQuestions() {
      const total = filteredQuestions.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      const start = (currentPage - 1) * pageSize;
      const end = Math.min(start + pageSize, total);
      const list = filteredQuestions.slice(start, end);

      const el = document.getElementById('questionList');
      const countEl = document.getElementById('qCount');
      if (countEl) countEl.textContent = total + ' câu hỏi';

      if (!total) {
        el.innerHTML = `<div class="card p-10 text-center col-span-full animate-fade-up">
      ${IC.emptyBulb}
      <p class="text-gray-400 font-medium">Chưa có câu hỏi nào</p>
      <p class="text-gray-300 text-sm mt-1">Nhấn "Tạo câu hỏi mới" để bắt đầu</p>
    </div>`;
        renderPagination(0, 0, 0, 0);
        return;
      }

      el.innerHTML = list.map((q, i) => {
        const diff = q.difficulty || 0;
        const isBookmarked = !!q.is_bookmarked;
        const starsHtml = diff > 0
          ? `<div class="flex items-center gap-0.5 mt-1.5">${[1, 2, 3, 4, 5].map(n => `<span class="text-sm leading-none ${n <= diff ? 'text-amber-400' : 'text-gray-200'}">★</span>`).join('')}<span class="text-xs text-gray-400 ml-1">${DIFF_LABELS[diff]}</span></div>`
          : '';
        const createdAt = q.created_at ? fmtDate(q.created_at) : '';
        const updatedAt = q.updated_at && q.updated_at !== q.created_at ? fmtDate(q.updated_at) : '';
        const isSelected = selectedQIds.has(q.id);
        return `
    <div class="q-card animate-fade-up stagger-${Math.min(i + 1, 3)}${isBookmarked ? ' q-card-bookmarked' : ''}${isSelected ? ' ring-2 ring-red-400 bg-red-50/30' : ''}" id="qcard-${q.id}" style="position:relative">
      <input type="checkbox" class="q-select-check absolute top-2 right-2 w-4 h-4 rounded accent-red-600 cursor-pointer"
        ${isSelected ? 'checked' : ''} onchange="toggleQSelect('${q.id}', this.checked)" title="Chọn câu hỏi này">
      <div class="flex items-start gap-3 mb-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">${IC.bulb}</div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <h3 class="font-bold text-gray-900 text-sm leading-tight">${esc(q.title)}</h3>
            <span class="qtype-badge qtype-${q.question_type || 'single'}">${QTYPE_LABELS[q.question_type || 'single'] || 'Một đáp án'}</span>
            ${isBookmarked ? `<svg class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>` : ''}
          </div>
          ${q.tags?.length ? `<div class="flex flex-wrap gap-1 mt-1">${q.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
          ${q.topic_groups?.length ? `<div class="flex flex-wrap gap-1 mt-1">${q.topic_groups.map(tg => `<span class="tag bg-indigo-50 text-indigo-700 font-semibold">\uD83D\uDCC1 ${esc(tg.name)}</span>`).join('')}</div>` : ''}
          ${starsHtml}
        </div>
      </div>
      <p class="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">${esc(q.description)}</p>
      <div class="space-y-1 mb-3">
        ${renderQCardBody(q)}
      </div>
      <div class="pt-2 border-t border-gray-100">
        <div class="flex items-center gap-3 mb-2 text-xs text-gray-300">
          ${createdAt ? `<span class="flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Thêm: ${createdAt}</span>` : ''}
          ${updatedAt ? `<span class="flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Sửa: ${updatedAt}</span>` : ''}
        </div>
        <div class="flex gap-1.5 flex-wrap">
          <button onclick="copyQuestion('${q.id}')" class="btn-sm btn-copy" title="Sao chép thành câu hỏi mới"><svg class="w-3 h-3 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>Sao chép</button>
          <button onclick="toggleBookmark('${q.id}')" class="btn-sm ${isBookmarked ? 'btn-bookmark-on' : 'btn-bookmark-off'}" title="${isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu câu hỏi'}"><svg class="w-3 h-3 mr-1 inline" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>${isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}</button>
          <button onclick="viewQuestionDetail('${q.id}')" class="btn-sm btn-purple">Chi tiết</button>
          <button onclick="openQuestionModal('${q.id}')" class="btn-sm btn-edit">Sửa</button>
          <button onclick="deleteQuestion('${q.id}')" class="btn-sm btn-delete">Xoá</button>
        </div>
      </div>
    </div>`;
      }).join('');
      renderPagination(total, Math.max(1, Math.ceil(total / pageSize)), start + 1, end);
    }

    function renderPagination(total, totalPages, from, to) {
      const el = document.getElementById('qPagination');
      if (!el) return;
      if (total === 0) { el.innerHTML = ''; return; }

      const sizeOptions = [10, 15, 25, 50].map(n =>
        `<option value="${n}"${n === pageSize ? ' selected' : ''}>${n}</option>`
      ).join('');

      let pages = '';
      const delta = 2;
      let lo = Math.max(1, currentPage - delta);
      let hi = Math.min(totalPages, currentPage + delta);
      if (currentPage - delta < 1) hi = Math.min(totalPages, hi + (delta - currentPage + 1));
      if (currentPage + delta > totalPages) lo = Math.max(1, lo - (currentPage + delta - totalPages));
      lo = Math.max(1, lo); hi = Math.min(totalPages, hi);

      if (lo > 1) {
        pages += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
        if (lo > 2) pages += `<span class="text-gray-400 text-sm leading-none px-0.5">…</span>`;
      }
      for (let p = lo; p <= hi; p++) {
        pages += `<button class="page-btn${p === currentPage ? ' active' : ''}" onclick="goToPage(${p})">${p}</button>`;
      }
      if (hi < totalPages) {
        if (hi < totalPages - 1) pages += `<span class="text-gray-400 text-sm leading-none px-0.5">…</span>`;
        pages += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
      }

      el.innerHTML = `
    <div class="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
      <span>Hiển thị <strong class="text-gray-600">${from}–${to}</strong> trong <strong class="text-gray-600">${total}</strong> câu hỏi</span>
      <span class="hidden sm:inline">·</span>
      <label class="flex items-center gap-1.5">
        <span>Mỗi trang:</span>
        <select onchange="setPageSize(+this.value)"
          class="field" style="width:auto;padding:4px 10px;font-size:12px;border-radius:7px;height:28px">
          ${sizeOptions}
        </select>
      </label>
    </div>
    <div class="flex items-center gap-1">
      <button class="page-btn" onclick="goToPage(1)" ${currentPage <= 1 ? 'disabled' : ''} title="Trang đầu">«</button>
      <button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''} title="Trang trước">‹</button>
      ${pages}
      <button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''} title="Trang sau">›</button>
      <button class="page-btn" onclick="goToPage(${totalPages})" ${currentPage >= totalPages ? 'disabled' : ''} title="Trang cuối">»</button>
    </div>`;
    }

    function goToPage(n) {
      const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
      currentPage = Math.max(1, Math.min(n, totalPages));
      renderQuestions();
      document.getElementById('pane-questions').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function setPageSize(n) {
      pageSize = n;
      currentPage = 1;
      renderQuestions();
    }

    function filterQuestions() {
      currentTopicGroupFilter = document.getElementById('qFilterTopic')?.value || '';
      const q = document.getElementById('qSearch').value.toLowerCase();
      let list = allQuestions;
      if (q) list = list.filter(x => x.title.toLowerCase().includes(q) || x.description.toLowerCase().includes(q) || (x.tags || []).join(' ').toLowerCase().includes(q));
      if (filterBookmarked) list = list.filter(x => !!x.is_bookmarked);
      if (filterDifficulty) list = list.filter(x => (x.difficulty || 0) === filterDifficulty);
      if (currentTopicGroupFilter) list = list.filter(x => x.topic_groups?.some(tg => tg.id === currentTopicGroupFilter));

      // Sắp xếp
      const sort = document.getElementById('qSortBy')?.value || 'updated_desc';
      list = [...list].sort((a, b) => {
        if (sort === 'updated_desc') return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
        if (sort === 'updated_asc')  return new Date(a.updated_at || 0) - new Date(b.updated_at || 0);
        if (sort === 'created_desc') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sort === 'created_asc')  return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        if (sort === 'diff_asc')     return (a.difficulty || 0) - (b.difficulty || 0);
        if (sort === 'diff_desc')    return (b.difficulty || 0) - (a.difficulty || 0);
        if (sort === 'title_asc')    return a.title.localeCompare(b.title, 'vi');
        if (sort === 'title_desc')   return b.title.localeCompare(a.title, 'vi');
        return 0;
      });

      filteredQuestions = list;
      currentPage = 1;
      renderQuestions();
    }

    // ── Question type modal helpers ───────────────
    function setQType(type) {
      currentQType = type;
      ['single', 'multiple', 'matching', 'ordering'].forEach(t => {
        document.getElementById(`qtype-${t}`).classList.toggle('active', t === type);
        document.getElementById(`form-${t}`).classList.toggle('hidden', t !== type);
      });
    }

    function renderSingleChoices() {
      const list = document.getElementById('singleChoicesList');
      const area = document.getElementById('singleCorrectArea');
      if (!list || !area) return;
      list.innerHTML = singleChoices.map((ch, i) => {
        const lbl = String.fromCharCode(65 + i);
        const clr = CHOICE_COLORS[i % CHOICE_COLORS.length];
        return `<div class="choice-row">
      <span class="choice-badge" style="background:${clr}22;color:${clr}">${lbl}</span>
      <textarea class="field" rows="2" placeholder="Nội dung đáp án ${lbl}..."
        oninput="singleChoices[${i}]=this.value">${esc(ch)}</textarea>
      ${singleChoices.length > 2 ? `<button type="button" class="row-remove" onclick="removeSingleChoice(${i})">✕</button>` : ''}
    </div>`;
      }).join('');
      area.innerHTML = singleChoices.map((_, i) => {
        const lbl = String.fromCharCode(65 + i);
        const clr = CHOICE_COLORS[i % CHOICE_COLORS.length];
        return `<label style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:10px;border:2px solid ${singleCorrect === i ? clr : '#e2e8f0'};background:${singleCorrect === i ? clr + '18' : 'white'}">
      <input type="radio" name="correctAnswer" value="${i}" ${singleCorrect === i ? 'checked' : ''} onchange="singleCorrect=${i};renderSingleChoices()" style="accent-color:${clr}"/>
      <span style="font-weight:700;color:${clr}">${lbl}</span>
    </label>`;
      }).join('');
    }

    function addSingleChoice() {
      if (singleChoices.length >= 8) return;
      singleChoices.push(''); renderSingleChoices();
    }
    function removeSingleChoice(i) {
      if (singleChoices.length <= 2) return;
      singleChoices.splice(i, 1);
      if (singleCorrect >= singleChoices.length) singleCorrect = singleChoices.length - 1;
      renderSingleChoices();
    }

    function renderMultiChoices() {
      const list = document.getElementById('multiChoicesList');
      if (!list) return;
      list.innerHTML = multiChoices.map((ch, i) => {
        const lbl = String.fromCharCode(65 + i);
        const clr = CHOICE_COLORS[i % CHOICE_COLORS.length];
        const checked = multiCorrects.includes(i);
        return `<div class="choice-row" style="align-items:flex-start">
      <input type="checkbox" style="margin-top:10px;width:16px;height:16px;accent-color:${clr};flex-shrink:0"
        ${checked ? 'checked' : ''} onchange="toggleMultiCorrect(${i},this.checked)"/>
      <span class="choice-badge" style="background:${clr}22;color:${clr}">${lbl}</span>
      <textarea class="field" rows="2" placeholder="Nội dung đáp án ${lbl}..."
        oninput="multiChoices[${i}]=this.value">${esc(ch)}</textarea>
      ${multiChoices.length > 2 ? `<button type="button" class="row-remove" onclick="removeMultiChoice(${i})">✕</button>` : ''}
    </div>`;
      }).join('');
    }
    function toggleMultiCorrect(i, checked) {
      if (checked && !multiCorrects.includes(i)) multiCorrects.push(i);
      else multiCorrects = multiCorrects.filter(x => x !== i);
    }
    function addMultiChoice() {
      if (multiChoices.length >= 8) return;
      multiChoices.push(''); renderMultiChoices();
    }
    function removeMultiChoice(i) {
      if (multiChoices.length <= 2) return;
      multiChoices.splice(i, 1);
      multiCorrects = multiCorrects.filter(x => x !== i).map(x => x > i ? x - 1 : x);
      renderMultiChoices();
    }

    function renderMatchPairs() {
      const list = document.getElementById('matchPairsList');
      if (!list) return;
      list.innerHTML = matchPairs.map((p, i) => `
    <div class="grid grid-cols-2 gap-2 mb-2" style="align-items:flex-start">
      <div class="flex gap-1 items-start">
        <span class="choice-badge" style="background:#fff7ed;color:#c2410c;margin-top:7px">${i + 1}</span>
        <textarea class="field" rows="2" placeholder="Mục A${i + 1}..."
          oninput="matchPairs[${i}].l=this.value">${esc(p.l)}</textarea>
      </div>
      <div class="flex gap-1 items-start">
        <textarea class="field" rows="2" placeholder="Mục B${i + 1}..."
          oninput="matchPairs[${i}].r=this.value">${esc(p.r)}</textarea>
        ${matchPairs.length > 2 ? `<button type="button" class="row-remove" onclick="removeMatchPair(${i})">✕</button>` : ''}
      </div>
    </div>`).join('');
    }
    function addMatchPair() {
      matchPairs.push({ l: '', r: '' }); renderMatchPairs();
    }
    function removeMatchPair(i) {
      if (matchPairs.length <= 2) return;
      matchPairs.splice(i, 1); renderMatchPairs();
    }

    function renderOrderItems() {
      const list = document.getElementById('orderingList');
      if (!list) return;
      list.innerHTML = orderItems.map((it, i) => `
    <div class="choice-row">
      <span class="choice-badge bg-emerald-100 text-emerald-700" style="font-size:11px">${i + 1}</span>
      <textarea class="field" rows="2" placeholder="Mục thứ ${i + 1}..."
        oninput="orderItems[${i}]=this.value">${esc(it)}</textarea>
      ${orderItems.length > 2 ? `<button type="button" class="row-remove" onclick="removeOrderItem(${i})">✕</button>` : ''}
    </div>`).join('');
    }
    function addOrderItem() {
      orderItems.push(''); renderOrderItems();
    }
    function removeOrderItem(i) {
      if (orderItems.length <= 2) return;
      orderItems.splice(i, 1); renderOrderItems();
    }

    // Render question card body based on type
    function renderQCardBody(q) {
      const qType = q.question_type || 'single';
      if (qType === 'single') {
        return (q.choices || []).map((ch, ci) => `
      <div class="flex items-start gap-2 text-xs py-1 px-2 rounded-lg ${ci === q.correct_index ? 'bg-emerald-50 border border-emerald-100' : ''}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold ${ci === q.correct_index ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}">${String.fromCharCode(65 + ci)}</span>
        <span class="${ci === q.correct_index ? 'text-emerald-700 font-semibold' : 'text-gray-600'} flex-1">${esc(ch)}</span>
        ${ci === q.correct_index ? '<span class="text-emerald-500 font-bold">✓</span>' : ''}
      </div>`).join('');
      }
      if (qType === 'multiple') {
        const ca = Array.isArray(q.correct_answer) ? q.correct_answer : [];
        return (q.choices || []).map((ch, ci) => `
      <div class="flex items-start gap-2 text-xs py-1 px-2 rounded-lg ${ca.includes(ci) ? 'bg-purple-50 border border-purple-100' : ''}">
        <span class="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold ${ca.includes(ci) ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'}">${String.fromCharCode(65 + ci)}</span>
        <span class="${ca.includes(ci) ? 'text-purple-700 font-semibold' : 'text-gray-600'} flex-1">${esc(ch)}</span>
        ${ca.includes(ci) ? '<span class="text-purple-500 font-bold">✓</span>' : ''}
      </div>`).join('');
      }
      if (qType === 'matching') {
        const rights = Array.isArray(q.correct_answer) ? q.correct_answer : [];
        return `<div class="text-xs grid grid-cols-2 gap-x-3 gap-y-1">${(q.choices || []).map((ch, i) => `
        <div class="py-0.5 px-2 rounded bg-orange-50 text-orange-800 font-medium">${esc(ch)}</div>
        <div class="py-0.5 px-2 rounded bg-orange-50 text-orange-800">${esc(rights[i] || '—')}</div>`).join('')
          }</div>`;
      }
      if (qType === 'ordering') {
        return (q.choices || []).map((ch, i) => `
      <div class="flex items-center gap-2 text-xs py-0.5 px-2 rounded bg-emerald-50">
        <span class="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">${i + 1}</span>
        <span class="text-emerald-800">${esc(ch)}</span>
      </div>`).join('');
      }
      return '';
    }

    function openQuestionModal(id) {
      document.getElementById('questionEditId').value = id || '';
      document.getElementById('questionModalTitle').textContent = id ? 'Sửa câu hỏi' : 'Tạo câu hỏi mới';
      document.getElementById('questionModalError').classList.add('hidden');
      modalDifficulty = 0;

      if (id) {
        const q = allQuestions.find(x => x.id === id);
        document.getElementById('qTitle').value = q.title;
        document.getElementById('qDesc').value = q.description;
        document.getElementById('qExplanation').value = q.explanation || '';
        document.getElementById('qTags').value = (q.tags || []).join(', ');
        modalDifficulty = q.difficulty || 0;
        
        // Reset and check topic groups
        document.querySelectorAll('.q-topic-checkbox').forEach(cb => cb.checked = false);
        if (q.topic_groups && q.topic_groups.length > 0) {
          q.topic_groups.forEach(tg => {
            const cb = document.querySelector(`.q-topic-checkbox[value="${tg.id}"]`);
            if (cb) cb.checked = true;
          });
        }

        const qType = q.question_type || 'single';
        currentQType = qType;

        if (qType === 'single') {
          singleChoices = [...(q.choices || ['', '', '', ''])];
          singleCorrect = q.correct_index ?? -1;
        } else if (qType === 'multiple') {
          multiChoices = [...(q.choices || ['', '', '', ''])];
          multiCorrects = Array.isArray(q.correct_answer) ? [...q.correct_answer] : [];
        } else if (qType === 'matching') {
          const rights = Array.isArray(q.correct_answer) ? q.correct_answer : [];
          matchPairs = (q.choices || []).map((l, i) => ({ l, r: rights[i] || '' }));
          if (matchPairs.length < 2) matchPairs = [{ l: '', r: '' }, { l: '', r: '' }];
        } else if (qType === 'ordering') {
          orderItems = [...(q.choices || ['', '', ''])];
          if (orderItems.length < 2) orderItems = ['', '', ''];
        }
      } else {
        document.getElementById('qTitle').value = '';
        document.getElementById('qDesc').value = '';
        document.getElementById('qExplanation').value = '';
        document.getElementById('qTags').value = '';
        document.getElementById('qTopicGroup').value = '';
        currentQType = 'single';
        singleChoices = ['', '', '', ''];
        singleCorrect = -1;
        multiChoices = ['', '', '', ''];
        multiCorrects = [];
        matchPairs = [{ l: '', r: '' }, { l: '', r: '' }];
        orderItems = ['', '', ''];
      }

      setQType(currentQType);
      renderSingleChoices();
      renderMultiChoices();
      renderMatchPairs();
      renderOrderItems();
      updateModalDiffUI();
      document.getElementById('questionModal').classList.remove('hidden');
    }

    async function saveQuestion() {
      const id = document.getElementById('questionEditId').value;
      const title = document.getElementById('qTitle').value.trim();
      const desc = document.getElementById('qDesc').value.trim();
      if (!title || !desc) { showErr('questionModalError', 'Vui lòng điền tiêu đề và nội dung câu hỏi'); return; }

      let body = {
        title, description: desc,
        question_type: currentQType,
        explanation: document.getElementById('qExplanation').value.trim(),
        tags: document.getElementById('qTags').value.split(',').map(s => s.trim()).filter(Boolean),
        difficulty: modalDifficulty,
        topic_group_ids: Array.from(document.querySelectorAll('.q-topic-checkbox:checked')).map(cb => cb.value)
      };

      if (currentQType === 'single') {
        const choices = singleChoices.map(c => c.trim());
        if (choices.filter(Boolean).length < 2) { showErr('questionModalError', 'Cần ít nhất 2 đáp án'); return; }
        if (singleCorrect < 0) { showErr('questionModalError', 'Vui lòng chọn đáp án đúng'); return; }
        body.choices = choices;
        body.correct_index = singleCorrect;

      } else if (currentQType === 'multiple') {
        const choices = multiChoices.map(c => c.trim());
        if (choices.filter(Boolean).length < 2) { showErr('questionModalError', 'Cần ít nhất 2 đáp án'); return; }
        if (multiCorrects.length === 0) { showErr('questionModalError', 'Vui lòng chọn ít nhất một đáp án đúng'); return; }
        body.choices = choices;
        body.correct_answer = [...multiCorrects].sort((a, b) => a - b);

      } else if (currentQType === 'matching') {
        const pairs = matchPairs.filter(p => p.l.trim() && p.r.trim());
        if (pairs.length < 2) { showErr('questionModalError', 'Cần ít nhất 2 cặp nối'); return; }
        body.choices = pairs.map(p => p.l.trim());
        body.correct_answer = pairs.map(p => p.r.trim());

      } else if (currentQType === 'ordering') {
        const items = orderItems.map(s => s.trim()).filter(Boolean);
        if (items.length < 2) { showErr('questionModalError', 'Cần ít nhất 2 mục'); return; }
        body.choices = items;
      }

      const res = await api(id ? `/questions/${id}` : '/questions', { method: id ? 'PUT' : 'POST', body });
      const data = await res.json();
      if (!res.ok) { showErr('questionModalError', data.error); return; }
      document.getElementById('questionModal').classList.add('hidden');
      loadAll();
    }

    async function deleteQuestion(id) {
      if (isDeleting) return;
      if (!confirm('Xoá câu hỏi này?')) return;
      isDeleting = true;
      setQListLoading(true, 'Đang xoá câu hỏi…');
      const res = await api(`/questions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      isDeleting = false;
      setQListLoading(false);
      if (!res.ok) { alert(data.error); return; }
      loadAll();
    }

    // ── Question Detail ───────────────────────────
    function viewQuestionDetail(id) {
      const q = allQuestions.find(x => x.id === id);
      if (!q) return;
      const diff = q.difficulty || 0;
      const qType = q.question_type || 'single';

      document.getElementById('qdModalTitle').textContent = q.title;
      document.getElementById('qdModalTypeBadge').textContent = QTYPE_LABELS[qType] || 'Một đáp án';
      document.getElementById('qdModalDiffStars').innerHTML = diff > 0
        ? [1,2,3,4,5].map(n => `<span class="${n <= diff ? 'text-amber-400' : 'text-white/30'}">★</span>`).join('') + `<span class="text-white/70 text-xs ml-1">${DIFF_LABELS[diff]}</span>`
        : '';

      const tagsEl = document.getElementById('qdModalTags');
      tagsEl.innerHTML = (q.tags || []).map(t => `<span class="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">${esc(t)}</span>`).join('');

      const descBlock = document.getElementById('qdModalDescBlock');
      const descEl = document.getElementById('qdModalDesc');
      if (q.description?.trim()) {
        descEl.textContent = q.description;
        descBlock.classList.remove('hidden');
      } else {
        descBlock.classList.add('hidden');
      }

      document.getElementById('qdModalChoices').innerHTML = renderQDetailChoices(q);

      const expBlock = document.getElementById('qdModalExplanationBlock');
      const expEl = document.getElementById('qdModalExplanation');
      if (q.explanation?.trim()) {
        expEl.textContent = q.explanation;
        expBlock.classList.remove('hidden');
      } else {
        expBlock.classList.add('hidden');
      }

      document.getElementById('qdModalEditBtn').onclick = () => {
        document.getElementById('questionDetailModal').classList.add('hidden');
        openQuestionModal(id);
      };

      document.getElementById('questionDetailModal').classList.remove('hidden');
    }

    function renderQDetailChoices(q) {
      const qType = q.question_type || 'single';
      if (qType === 'single') {
        return (q.choices || []).map((ch, ci) => {
          const correct = ci === q.correct_index;
          return `<div class="flex items-start gap-2.5 text-sm py-2 px-3 rounded-xl ${correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-100'}">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold ${correct ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}">${String.fromCharCode(65+ci)}</span>
            <span class="flex-1 ${correct ? 'text-emerald-700 font-semibold' : 'text-gray-600'}">${esc(ch)}</span>
            ${correct ? '<span class="text-emerald-500 font-bold text-base">✓</span>' : ''}
          </div>`;
        }).join('');
      }
      if (qType === 'multiple') {
        const ca = Array.isArray(q.correct_answer) ? q.correct_answer : [];
        return (q.choices || []).map((ch, ci) => {
          const correct = ca.includes(ci);
          return `<div class="flex items-start gap-2.5 text-sm py-2 px-3 rounded-xl ${correct ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 border border-gray-100'}">
            <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 font-bold ${correct ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'}">${String.fromCharCode(65+ci)}</span>
            <span class="flex-1 ${correct ? 'text-purple-700 font-semibold' : 'text-gray-600'}">${esc(ch)}</span>
            ${correct ? '<span class="text-purple-500 font-bold text-base">✓</span>' : ''}
          </div>`;
        }).join('');
      }
      if (qType === 'matching') {
        const rights = Array.isArray(q.correct_answer) ? q.correct_answer : [];
        return `<div class="space-y-1.5">${(q.choices || []).map((ch, i) => `
          <div class="flex items-center gap-2 text-sm">
            <div class="flex-1 py-1.5 px-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 font-medium">${esc(ch)}</div>
            <svg class="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            <div class="flex-1 py-1.5 px-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700">${esc(rights[i] || '—')}</div>
          </div>`).join('')}</div>`;
      }
      if (qType === 'ordering') {
        return (q.choices || []).map((ch, i) => `
          <div class="flex items-center gap-2.5 text-sm py-2 px-3 rounded-xl bg-teal-50 border border-teal-200">
            <span class="w-6 h-6 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">${i+1}</span>
            <span class="text-teal-800">${esc(ch)}</span>
          </div>`).join('');
      }
      return '';
    }

    // ── Bulk Select ───────────────────────────────
    function toggleQSelect(id, checked) {
      if (checked) selectedQIds.add(id);
      else selectedQIds.delete(id);
      updateBulkToolbar();
      const card = document.getElementById('qcard-' + id);
      if (card) {
        card.classList.toggle('ring-2', checked);
        card.classList.toggle('ring-red-400', checked);
        card.classList.toggle('bg-red-50/30', checked);
      }
    }

    function updateBulkToolbar() {
      const count = selectedQIds.size;
      const toolbar = document.getElementById('bulkToolbar');
      toolbar.classList.toggle('hidden', count === 0);
      document.getElementById('bulkCountLabel').textContent = count + ' câu hỏi đã chọn';
      const allVisible = filteredQuestions.slice((currentPage-1)*pageSize, currentPage*pageSize);
      const allChecked = allVisible.length > 0 && allVisible.every(q => selectedQIds.has(q.id));
      const allCheckEl = document.getElementById('selectAllQCheck');
      if (allCheckEl) allCheckEl.checked = allChecked;
    }

    function selectAllQuestions(checked) {
      const visible = filteredQuestions.slice((currentPage-1)*pageSize, currentPage*pageSize);
      visible.forEach(q => {
        if (checked) selectedQIds.add(q.id);
        else selectedQIds.delete(q.id);
        const card = document.getElementById('qcard-' + q.id);
        if (card) {
          card.classList.toggle('ring-2', checked);
          card.classList.toggle('ring-red-400', checked);
          card.classList.toggle('bg-red-50/30', checked);
        }
      });
      document.querySelectorAll('.q-select-check').forEach(cb => { cb.checked = checked; });
      updateBulkToolbar();
    }

    function clearQSelection() {
      selectedQIds.clear();
      document.querySelectorAll('.q-select-check').forEach(cb => { cb.checked = false; });
      document.querySelectorAll('[id^="qcard-"]').forEach(card => {
        card.classList.remove('ring-2', 'ring-red-400', 'bg-red-50/30');
      });
      updateBulkToolbar();
    }

    async function bulkDeleteQuestions() {
      if (isDeleting) return;
      const ids = [...selectedQIds];
      if (!ids.length) return;
      if (!confirm(`Xoá ${ids.length} câu hỏi đã chọn? Hành động này không thể hoàn tác.`)) return;
      isDeleting = true;
      let failed = 0;
      for (let i = 0; i < ids.length; i++) {
        setQListLoading(true, `Đang xoá ${i + 1}/${ids.length} câu hỏi…`);
        const res = await api(`/questions/${ids[i]}`, { method: 'DELETE' });
        if (!res.ok) failed++;
      }
      isDeleting = false;
      setQListLoading(false);
      selectedQIds.clear();
      if (failed > 0) alert(`Xoá xong. ${failed} câu hỏi không thể xoá (có thể đang dùng trong kỳ thi).`);
      loadAll();
    }

    // ── Copy Question ─────────────────────────────
    async function copyQuestion(id) {
      if (!confirm('Sao chép câu hỏi này thành một câu hỏi mới?')) return;
      const q = allQuestions.find(x => x.id === id);
      if (!q) return;
      const body = {
        title: 'Bản sao - ' + q.title,
        description: q.description,
        choices: [...q.choices],
        question_type: q.question_type || 'single',
        correct_index: q.correct_index ?? null,
        correct_answer: q.correct_answer ? JSON.parse(JSON.stringify(q.correct_answer)) : null,
        explanation: q.explanation || '',
        tags: [...(q.tags || [])],
        difficulty: q.difficulty || 0
      };
      const res = await api('/questions', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      loadAll();
    }

    // ── Bookmark ──────────────────────────────────
    async function toggleBookmark(id) {
      const q = allQuestions.find(x => x.id === id);
      if (!q) return;
      const res = await api(`/questions/${id}/bookmark`, { method: 'PATCH', body: { is_bookmarked: !q.is_bookmarked } });
      if (!res.ok) { alert('Không thể cập nhật đánh dấu'); return; }
      const updated = await res.json();
      q.is_bookmarked = updated.is_bookmarked;
      filterQuestions();
    }

    function toggleBookmarkFilter() {
      filterBookmarked = !filterBookmarked;
      const btn = document.getElementById('btnFilterBookmark');
      btn.className = `btn-sm flex items-center gap-1.5 ${filterBookmarked ? 'btn-bookmark-on' : 'btn-bookmark-off'}`;
      btn.style.cssText = 'padding:7px 12px;font-size:12px';
      filterQuestions();
    }

    // ── Difficulty filter (search bar) ────────────
    function setDiffFilter(n) {
      filterDifficulty = (filterDifficulty === n && n !== 0) ? 0 : n;
      updateDiffFilterUI();
      filterQuestions();
    }

    function updateDiffFilterUI() {
      for (let i = 1; i <= 5; i++) {
        document.getElementById(`dfs${i}`).className = `star-btn ${i <= filterDifficulty ? 'star-filled' : 'star-empty'}`;
      }
      document.getElementById('dfsReset').classList.toggle('hidden', filterDifficulty === 0);
    }

    function hoverDiffFilter(n) {
      for (let i = 1; i <= 5; i++) {
        document.getElementById(`dfs${i}`).className = `star-btn ${i <= n ? 'star-filled' : 'star-empty'}`;
      }
    }

    function leaveDiffFilter() { updateDiffFilterUI(); }

    // ── Difficulty (question modal) ───────────────
    function setModalDiff(n) {
      modalDifficulty = (modalDifficulty === n) ? 0 : n;
      updateModalDiffUI();
    }

    function updateModalDiffUI() {
      for (let i = 1; i <= 5; i++) {
        document.getElementById(`ms${i}`).className = `star-btn ${i <= modalDifficulty ? 'star-filled' : 'star-empty'}`;
      }
      document.getElementById('msReset').classList.toggle('hidden', modalDifficulty === 0);
      document.getElementById('msLabel').textContent = modalDifficulty ? DIFF_LABELS[modalDifficulty] : '';
    }

    function hoverModalDiff(n) {
      for (let i = 1; i <= 5; i++) {
        document.getElementById(`ms${i}`).className = `star-btn ${i <= n ? 'star-filled' : 'star-empty'}`;
      }
    }

    function leaveModalDiff() { updateModalDiffUI(); }

    // ── Submissions ───────────────────────────────
    function populateSubFilter() {
      const sel = document.getElementById('subContestFilter');
      sel.innerHTML = '<option value="">Tất cả kỳ thi</option>' +
        allContests.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    }

    async function loadSubmissions() {
      const contestId = document.getElementById('subContestFilter').value;
      const res = await api(contestId ? `/submissions?contestId=${contestId}` : '/submissions');
      const subs = await res.json();
      const tbody = document.getElementById('submissionsTable');
      if (!subs.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-400 py-12 text-sm">Không có bài nộp nào</td></tr>'; return;
      }
      tbody.innerHTML = subs.map(s => `
    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td class="px-5 py-3 font-semibold text-gray-800">${esc(s.participant?.nickname || '?')}</td>
      <td class="px-5 py-3 text-gray-600 text-xs max-w-xs truncate">${esc(s.question?.title || '?')}</td>
      <td class="px-5 py-3 text-center">
        <span class="w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-bold text-xs inline-flex items-center justify-center">${CL[s.answer_index] ?? s.answer_index}</span>
      </td>
      <td class="px-5 py-3 text-center">
        <span class="${s.status === 'correct' ? 'correct-badge' : 'wrong-badge'}">${s.status === 'correct' ? '✓ Đúng' : '✗ Sai'}</span>
      </td>
      <td class="px-5 py-3 text-gray-400 text-xs">${new Date(s.submitted_at).toLocaleString('vi-VN')}</td>
    </tr>`).join('');
    }

    // ── Utils ─────────────────────────────────────
    function fmt(iso) { return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }); }
    function fmtDate(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    function fmtDateTime(iso) {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now - d;
      const diffMin = Math.floor(diffMs / 60000);
      const diffH = Math.floor(diffMs / 3600000);
      const diffD = Math.floor(diffMs / 86400000);
      if (diffMin < 1) return 'vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      if (diffH < 24) return `${diffH} giờ trước`;
      if (diffD < 7) return `${diffD} ngày trước`;
      return fmtDate(iso);
    }
    function toLocal(iso) { const d = new Date(iso), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; }
    function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function showErr(id, msg) { const el = document.getElementById(id); el.textContent = msg; el.classList.remove('hidden'); }

    // Auto login
    const saved = localStorage.getItem('adminPass');
    if (saved) { document.getElementById('adminPass').value = saved; adminLogin(); }
  