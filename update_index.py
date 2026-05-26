import os

path = r'd:\Seminar-BA\contest-system\public\admin\index.html'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add Sidebar item
sidebar_search = '''<button class="nav-item" id="nav-practice" onclick="showTab('practice')">
            <span class="icon"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg></span> Bộ ôn tập
          </button>'''
sidebar_replace = sidebar_search + '''
          <button class="nav-item" id="nav-topicgroups" onclick="showTab('topicgroups')">
            <span class="icon"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg></span> Nhóm chủ đề
          </button>'''
html = html.replace(sidebar_search, sidebar_replace)

# 2. Add pane-topicgroups
pane_search = '''<!-- CONTESTS TAB -->'''
pane_replace = '''<!-- TOPIC GROUPS TAB -->
        <div id="pane-topicgroups" class="hidden">
          <div class="flex items-center justify-between mb-6 animate-fade-up">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Nhóm chủ đề</h2>
              <p class="text-gray-400 text-sm mt-0.5">Quản lý phân loại chủ đề (BA, Dev, PM, SA...)</p>
            </div>
            <button onclick="openTopicGroupModal()" class="btn-success flex items-center gap-2">
              <span>+</span> Thêm chủ đề mới
            </button>
          </div>
          <div id="topicGroupList" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"></div>
        </div>

        ''' + pane_search
html = html.replace(pane_search, pane_replace)

# 3. Add Modal for Topic Group
modal_search = '''<!-- Create/Edit Question Modal -->'''
modal_replace = '''<!-- Create/Edit Topic Group Modal -->
  <div id="topicGroupModal" class="modal-overlay hidden">
    <div class="modal-box max-w-md p-6">
      <div class="flex items-center justify-between mb-5">
        <h3 id="topicGroupModalTitle" class="text-lg font-bold text-gray-900">Thêm chủ đề</h3>
        <button onclick="closeTopicGroupModal()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="space-y-4">
        <div>
          <label class="lbl">Tên chủ đề *</label>
          <input id="tgName" type="text" class="field" placeholder="VD: BA, Dev, PM, SA" />
        </div>
        <div>
          <label class="lbl">Mô tả (không bắt buộc)</label>
          <input id="tgDescription" type="text" class="field" placeholder="Mô tả ngắn gọn" />
        </div>
        <p id="tgModalError" class="text-red-500 text-sm font-medium hidden"></p>
        <div class="flex justify-end gap-3 mt-6">
          <button onclick="closeTopicGroupModal()" class="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Hủy</button>
          <button onclick="saveTopicGroup()" class="btn-primary">Lưu lại</button>
        </div>
      </div>
    </div>
  </div>

  ''' + modal_search
html = html.replace(modal_search, modal_replace)

# 4. Modify Question filter
qfilter_search = '''<button id="btnFilterBookmark"'''
qfilter_replace = '''<select id="qFilterTopic" class="field" onchange="filterQuestions()" style="border-radius:12px;padding:7px 12px;font-size:12px;width:150px;min-width:auto">
              <option value="">Tất cả chủ đề</option>
            </select>
            ''' + qfilter_search
html = html.replace(qfilter_search, qfilter_replace)

# 5. Modify Question Modal
qmodal_search = '''<div class="mb-4">
          <label class="lbl">Tag (cách nhau dấu phẩy)</label>'''
qmodal_replace = '''<div class="mb-4">
          <label class="lbl">Nhóm chủ đề</label>
          <select id="qTopicGroup" class="field"><option value="">-- Không có --</option></select>
        </div>
        ''' + qmodal_search
html = html.replace(qmodal_search, qmodal_replace)

# 6. JS State
jsstate_search = '''let contests = [];'''
jsstate_replace = '''let topicGroups = [];\nlet currentTopicGroupFilter = '';\n''' + jsstate_search
html = html.replace(jsstate_search, jsstate_replace)

# 7. JS App Init
jsinit_search = '''await loadQuestions();'''
jsinit_replace = '''await loadTopicGroups();\n      ''' + jsinit_search
html = html.replace(jsinit_search, jsinit_replace)

# 8. JS Tabs
jstab_search = '''const tabs = ['contests', 'questions', 'submissions', 'practice', 'airequests'];'''
jstab_replace = '''const tabs = ['contests', 'questions', 'submissions', 'practice', 'airequests', 'topicgroups'];'''
html = html.replace(jstab_search, jstab_replace)

jsshowtab_search = '''} else if (tab === 'airequests') {
        loadAiRequests();
      }'''
jsshowtab_replace = jsshowtab_search + ''' else if (tab === 'topicgroups') {
        renderTopicGroups();
      }'''
html = html.replace(jsshowtab_search, jsshowtab_replace)

# 9. JS Logic topic groups
jslogic_search = '''// ── QUESTIONS ──────────────────────────────────────────────'''
jslogic_replace = '''// ── TOPIC GROUPS ─────────────────────────────────────────
    async function loadTopicGroups() {
      const data = await api('/topic-groups');
      if (data) {
        topicGroups = data;
        renderTopicGroupSelects();
      }
    }

    function renderTopicGroupSelects() {
      const selects = [document.getElementById('qTopicGroup'), document.getElementById('qFilterTopic')];
      selects.forEach(sel => {
        if (!sel) return;
        const isFilter = sel.id === 'qFilterTopic';
        sel.innerHTML = `<option value="">${isFilter ? 'Tất cả chủ đề' : '-- Không có --'}</option>` +
          topicGroups.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');
      });
      if (document.getElementById('qFilterTopic')) {
        document.getElementById('qFilterTopic').value = currentTopicGroupFilter;
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
          <h3 class="font-bold text-gray-800 text-lg mb-1">${escapeHtml(t.name)}</h3>
          <p class="text-sm text-gray-500 mb-4 h-10 line-clamp-2">${escapeHtml(t.description || 'Không có mô tả')}</p>
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
        if (currentTab === 'topicgroups') renderTopicGroups();
        renderQuestions();
      }
    }

    async function deleteTopicGroup(id) {
      if (!confirm('Bạn có chắc chắn muốn xóa chủ đề này?')) return;
      const res = await api(`/topic-groups/${id}`, { method: 'DELETE' });
      if (res.error) {
        alert('Lỗi: ' + res.error);
      } else {
        await loadTopicGroups();
        if (currentTab === 'topicgroups') renderTopicGroups();
      }
    }

    ''' + jslogic_search
html = html.replace(jslogic_search, jslogic_replace)

# 10. Update Question logic
# payload update
payload_search = '''difficulty: Number(document.getElementById('qDifficulty').value) || 0'''
payload_replace = payload_search + ''',
        topic_group_id: document.getElementById('qTopicGroup').value || null'''
html = html.replace(payload_search, payload_replace)

# editQuestion update
edit_search = '''document.getElementById('qDifficulty').value = String(q.difficulty || 0);'''
edit_replace = edit_search + '''\n      document.getElementById('qTopicGroup').value = q.topic_group ? q.topic_group.id : '';'''
html = html.replace(edit_search, edit_replace)

# filter logic
filter_search = '''function filterQuestions() {
      const q = document.getElementById('qSearch').value.toLowerCase().trim();'''
filter_replace = '''function filterQuestions() {
      const q = document.getElementById('qSearch').value.toLowerCase().trim();
      currentTopicGroupFilter = document.getElementById('qFilterTopic').value;'''
html = html.replace(filter_search, filter_replace)

filter_condition_search = '''if (filterBookmarkOnly && !x.is_bookmarked) return false;'''
filter_condition_replace = filter_condition_search + '''\n        if (currentTopicGroupFilter && (!x.topic_group || x.topic_group.id !== currentTopicGroupFilter)) return false;'''
html = html.replace(filter_condition_search, filter_condition_replace)

# render tag
tag_search = '''const diffText = diffColors[q.difficulty] || diffColors[0];'''
tag_replace = tag_search + '''
        const topicTag = q.topic_group ? `<span class="tag bg-indigo-50 text-indigo-700 font-semibold">\uD83D\uDCC1 ${escapeHtml(q.topic_group.name)}</span>` : '';'''
html = html.replace(tag_search, tag_replace)

tag_insert_search = '''<span class="tag ${diffText.split('|')[1]}">${diffText.split('|')[0]}</span>'''
tag_insert_replace = tag_insert_search + '''\n            ${topicTag}'''
html = html.replace(tag_insert_search, tag_insert_replace)

# 11. Import xlsx logic
import_search = '''difficulty: Number(row.difficulty) || 0'''
import_replace = import_search + ''',\n                topic_group_name: String(row['Question Group Title'] || row['Topic Group'] || row['Nhóm chủ đề'] || '').trim()'''
html = html.replace(import_search, import_replace)

import_preview_search = '''data.forEach((q, i) => {'''
import_preview_replace = import_preview_search + '''
        const topicGroupText = q.topic_group_name ? ` - Chủ đề: <b>${escapeHtml(q.topic_group_name)}</b>` : '';'''
html = html.replace(import_preview_search, import_preview_replace)

import_html_search = '''<div class="col-span-2 text-gray-800 font-medium truncate">${escapeHtml(q.title)}</div>'''
import_html_replace = '''<div class="col-span-2 text-gray-800 font-medium truncate">${escapeHtml(q.title)}${topicGroupText}</div>'''
html = html.replace(import_html_search, import_html_replace)

# 12. Also when import is successful, we should reload topic groups
import_success_search = '''if (res.imported) {'''
import_success_replace = '''if (res.imported) {
          loadTopicGroups();'''
html = html.replace(import_success_search, import_success_replace)


with open(path, 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html successfully")
