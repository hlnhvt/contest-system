const fs = require('fs');
let html = fs.readFileSync('public/contest.html', 'utf8');

// 1. Modal HTML
const editModalHtml = `
<!-- Modal Edit Participant -->
<div id="editParticipantModal" class="modal-overlay hidden" style="z-index: 100;" onclick="if(event.target===this) this.classList.add('hidden')">
  <div class="modal-box modal-enter max-w-sm p-6 relative">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-900">Sửa thông tin</h3>
      <button onclick="document.getElementById('editParticipantModal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div id="editParticipantError" class="hidden mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100"></div>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Biệt danh <span class="text-red-500">*</span></label>
        <input type="text" id="editNickname" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm" placeholder="Nhập biệt danh của bạn">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phòng ban / Đơn vị</label>
        <input type="text" id="editOrganization" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm" placeholder="Ví dụ: Lớp 10A1, FPT Software...">
      </div>
    </div>
    <div class="mt-6 flex justify-end gap-3">
      <button onclick="document.getElementById('editParticipantModal').classList.add('hidden')" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Hủy</button>
      <button id="btnSaveParticipant" onclick="saveParticipantInfo()" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">Lưu thay đổi</button>
    </div>
  </div>
</div>
`;

if (!html.includes('id="editParticipantModal"')) {
  html = html.replace('<div id="mcqModal"', editModalHtml + '\n<div id="mcqModal"');
}

// 2. JS logic
const editJs = `
async function openEditParticipantModal() {
  document.getElementById('editParticipantError').classList.add('hidden');
  document.getElementById('editNickname').value = localStorage.getItem('nickname') || '';
  document.getElementById('editOrganization').value = localStorage.getItem('organization') || '';
  document.getElementById('editParticipantModal').classList.remove('hidden');
}

async function saveParticipantInfo() {
  const nicknameInput = document.getElementById('editNickname').value.trim();
  const organizationInput = document.getElementById('editOrganization').value.trim();
  if (!nicknameInput) {
    const err = document.getElementById('editParticipantError');
    err.textContent = 'Biệt danh không được để trống';
    err.classList.remove('hidden');
    return;
  }
  
  const btn = document.getElementById('btnSaveParticipant');
  btn.disabled = true;
  btn.textContent = 'Đang lưu...';

  try {
    const res = await fetch(\`/api/contests/\${CONTEST_ID}/participants/\${myParticipantId}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
      body: JSON.stringify({ nickname: nicknameInput, organization: organizationInput })
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Cập nhật thất bại');
    }

    localStorage.setItem('nickname', nicknameInput);
    localStorage.setItem('organization', organizationInput);
    
    // Refresh page to apply changes
    location.reload();
  } catch (error) {
    const err = document.getElementById('editParticipantError');
    err.textContent = error.message;
    err.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Lưu thay đổi';
  }
}
`;

if (!html.includes('function openEditParticipantModal')) {
  html = html.replace('async function init() {', editJs + '\nasync function init() {');
}

// 3. Update UI rendering to allow re-render nickname after contestData is fetched
// We must find where nicknameDisplay is set.
const renderUserLogic = `
  function renderUserDisplay() {
    if (!nickname) return;
    const canEdit = contestData && (new Date() < new Date(contestData.start_time));
    const editBtnHtml = canEdit ? \`<button onclick="openEditParticipantModal()" class="ml-2 text-gray-400 hover:text-blue-500 transition-colors" title="Sửa thông tin"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button>\` : '';
    
    const displayHtml = \`<div class="flex items-center"><svg class="w-4 h-4 text-blue-300 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg><span>\${esc(nickname)}</span>\${myOrganization ? \`<span class="text-gray-400 ml-1">(\${esc(myOrganization)})</span>\` : ''}\${editBtnHtml}</div>\`;
    
    document.getElementById('nicknameDisplay').innerHTML = displayHtml;
  }
`;

if (!html.includes('function renderUserDisplay')) {
  html = html.replace('async function init() {', renderUserLogic + '\nasync function init() {');
  // replace the old setting in init
  html = html.replace(
    /if \(nickname\) \{\s*document\.getElementById\('nicknameDisplay'\)\.innerHTML =[^;]+;\s*document\.getElementById\('headerUserDisplay'\)\.innerHTML =[^;]+;\s*\}/g,
    'if (nickname) {\n      renderUserDisplay();\n      document.getElementById(\'headerUserDisplay\').innerHTML = `<div class="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10"><div class="w-6 h-6 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center font-bold text-xs">${esc(nickname[0].toUpperCase())}</div><div class="leading-tight"><div>${esc(nickname)}</div>${myOrganization ? \`<div style="font-size:10px;opacity:0.7">${esc(myOrganization)}</div>\` : \'\'}</div></div>`;\n    }'
  );
  // Add renderUserDisplay after contestData is assigned
  html = html.replace(
    'contestData = await contestRes.json();',
    'contestData = await contestRes.json();\n    if (nickname) renderUserDisplay();'
  );
}

// 4. Auto reload polling
const autoReloadHtml = `
    setInterval(async () => {
      try {
        const checkRes = await fetch(\`/api/contests/\${CONTEST_ID}\`);
        if (checkRes.ok) {
          const freshData = await checkRes.json();
          if (contestData && (freshData.start_time !== contestData.start_time || freshData.end_time !== contestData.end_time)) {
            console.log("Contest time updated, reloading...");
            location.reload();
          }
        }
      } catch (e) {}
    }, 5000);
`;

if (!html.includes('freshData.start_time !== contestData.start_time')) {
  html = html.replace('document.getElementById(\'contestNameDisplay\').textContent = contestData.name;', 
    'document.getElementById(\'contestNameDisplay\').textContent = contestData.name;\n' + autoReloadHtml);
}

fs.writeFileSync('public/contest.html', html);
