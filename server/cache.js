// In-memory cache — dùng chung cho toàn bộ server
// Không cần Redis cho single-process Node.js

const TOKEN_TTL        = 30 * 60 * 1000; // 30 phút
const CONTEST_Q_TTL    =  60 * 1000;     // 60 giây (để admin có thể cập nhật câu hỏi)

const tokenStore    = new Map(); // token  → { data, expiresAt }
const contestQStore = new Map(); // contestId → { data, expiresAt }

// ── Token cache ───────────────────────────────────────────────

function getToken(token) {
  const entry = tokenStore.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { tokenStore.delete(token); return null; }
  return entry.data;
}

function setToken(token, participantData) {
  tokenStore.set(token, { data: participantData, expiresAt: Date.now() + TOKEN_TTL });
}

function deleteToken(token) {
  tokenStore.delete(token);
}

// ── Contest questions cache ───────────────────────────────────

function getContestQuestions(contestId) {
  const entry = contestQStore.get(contestId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { contestQStore.delete(contestId); return null; }
  return entry.data;
}

function setContestQuestions(contestId, data) {
  contestQStore.set(contestId, { data, expiresAt: Date.now() + CONTEST_Q_TTL });
}

function invalidateContestQuestions(contestId) {
  if (contestId) contestQStore.delete(contestId);
  else contestQStore.clear();
}

// ── Dọn dẹp entries hết hạn mỗi 10 phút để tránh memory leak ─

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of tokenStore)    { if (now > v.expiresAt) tokenStore.delete(k); }
  for (const [k, v] of contestQStore) { if (now > v.expiresAt) contestQStore.delete(k); }
}, 10 * 60 * 1000);

module.exports = { getToken, setToken, deleteToken, getContestQuestions, setContestQuestions, invalidateContestQuestions };
