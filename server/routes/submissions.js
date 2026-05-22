const express = require('express');
const supabase = require('../supabase');
const { getToken, setToken } = require('../cache');
const router = express.Router();

// Rate limit: mỗi participant chỉ nộp 1 lần / 2 giây cho cùng một câu hỏi
const submitCooldown = new Map();
const COOLDOWN_MS = 2000;

function checkRateLimit(participantId, questionId) {
  const key = `${participantId}:${questionId}`;
  const last = submitCooldown.get(key) || 0;
  const now = Date.now();
  if (now - last < COOLDOWN_MS) return false;
  submitCooldown.set(key, now);
  return true;
}

// Dọn Map định kỳ để tránh memory leak (giữ tối đa 5 phút)
setInterval(() => {
  const cutoff = Date.now() - 300_000;
  for (const [key, ts] of submitCooldown) {
    if (ts < cutoff) submitCooldown.delete(key);
  }
}, 60_000);

async function getParticipant(token) {
  if (!token) return null;
  const cached = getToken(token);
  if (cached) return cached;

  const { data } = await supabase
    .from('participants')
    .select('*')
    .eq('token', token)
    .single();
  if (data) setToken(token, data);
  return data;
}

// Nộp đáp án
router.post('/', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const participant = await getParticipant(token);
  if (!participant) return res.status(401).json({ error: 'Chưa tham gia kỳ thi' });

  const { questionId, answerIndex, answer } = req.body;
  if (questionId === undefined) {
    return res.status(400).json({ error: 'questionId bắt buộc' });
  }

  if (!checkRateLimit(participant.id, questionId)) {
    return res.status(429).json({ error: 'Bạn nộp quá nhanh, vui lòng chờ vài giây rồi thử lại.' });
  }

  const [cqResult, contestResult, existingResult] = await Promise.all([
    supabase
      .from('contest_questions')
      .select('contest_id, question:questions(correct_index, correct_answer, question_type, choices)')
      .eq('contest_id', participant.contest_id)
      .eq('question_id', questionId)
      .single(),
    supabase
      .from('contests')
      .select('start_time, end_time')
      .eq('id', participant.contest_id)
      .single(),
    supabase
      .from('submissions')
      .select('id')
      .eq('participant_id', participant.id)
      .eq('question_id', questionId)
      .eq('status', 'correct')
      .single()
  ]);

  const cq      = cqResult.data;
  const contest = contestResult.data;
  const existing = existingResult.data;

  if (!cq) return res.status(404).json({ error: 'Câu hỏi không tồn tại trong kỳ thi này' });
  if (!contest) return res.status(404).json({ error: 'Kỳ thi không tồn tại' });

  const now = new Date();
  if (now < new Date(contest.start_time)) return res.status(400).json({ error: 'Kỳ thi chưa bắt đầu' });
  if (now > new Date(contest.end_time))   return res.status(400).json({ error: 'Kỳ thi đã kết thúc' });

  if (existing) return res.status(400).json({ error: 'Bạn đã trả lời đúng câu hỏi này rồi', alreadySolved: true });

  const { question_type, correct_index, correct_answer, choices } = cq.question;
  const qType = question_type || 'single';
  let isCorrect = false;

  if (qType === 'single') {
    isCorrect = parseInt(answerIndex) === correct_index;
  } else if (qType === 'multiple') {
    const ua = Array.isArray(answer) ? [...answer].map(Number).sort((a, b) => a - b) : [];
    const ca = Array.isArray(correct_answer) ? [...correct_answer].map(Number).sort((a, b) => a - b) : [];
    isCorrect = JSON.stringify(ua) === JSON.stringify(ca);
  } else if (qType === 'matching') {
    // answer = ["right text for left[0]", "right text for left[1]", ...]
    // correct_answer = ["correct right for left[0]", ...]
    const ua = Array.isArray(answer) ? answer : [];
    const ca = Array.isArray(correct_answer) ? correct_answer : [];
    isCorrect = ua.length === ca.length && ua.every((v, i) => v === ca[i]);
  } else if (qType === 'ordering') {
    // answer = ["item text in user's order"], correct = choices (in correct order)
    const ua = Array.isArray(answer) ? answer : [];
    const ca = Array.isArray(choices) ? choices : [];
    isCorrect = ua.length === ca.length && ua.every((v, i) => v === ca[i]);
  }

  const { error } = await supabase.from('submissions').insert({
    contest_id:     participant.contest_id,
    question_id:    questionId,
    participant_id: participant.id,
    answer_index:   qType === 'single' ? (answerIndex !== undefined ? parseInt(answerIndex) : null) : null,
    answer:         qType !== 'single' ? (answer || null) : null,
    status:         isCorrect ? 'correct' : 'wrong'
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: isCorrect ? 'correct' : 'wrong' });
});

// Lịch sử nộp bài của tôi cho một câu hỏi
router.get('/question/:questionId', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const participant = await getParticipant(token);
  if (!participant) return res.status(401).json({ error: 'Chưa xác thực' });

  const { data } = await supabase
    .from('submissions')
    .select('id, answer_index, answer, status, submitted_at')
    .eq('participant_id', participant.id)
    .eq('question_id', req.params.questionId)
    .order('submitted_at', { ascending: false });

  res.json(data || []);
});

// Tất cả bài nộp của tôi trong contest
router.get('/my', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const participant = await getParticipant(token);
  if (!participant) return res.status(401).json({ error: 'Chưa xác thực' });

  const { data } = await supabase
    .from('submissions')
    .select('id, question_id, answer_index, answer, status, submitted_at')
    .eq('participant_id', participant.id)
    .eq('contest_id', participant.contest_id)
    .order('submitted_at', { ascending: false });

  res.json(data || []);
});

module.exports = router;
