const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

const DEFAULT_SCALE = [
  { min: 0,  max: 39,  label: 'Cần cải thiện', color: '#ef4444' },
  { min: 40, max: 59,  label: 'Trung bình',    color: '#f59e0b' },
  { min: 60, max: 74,  label: 'Khá',           color: '#3b82f6' },
  { min: 75, max: 89,  label: 'Giỏi',          color: '#8b5cf6' },
  { min: 90, max: 100, label: 'Xuất sắc',      color: '#10b981' }
];

function getLevel(pct, scale) {
  const s = Array.isArray(scale) && scale.length ? scale : DEFAULT_SCALE;
  return s.find(r => pct >= r.min && pct <= r.max) || s[s.length - 1];
}

function grade(q, answerIndex, answer) {
  const t = q.question_type || 'single';
  if (t === 'single') return parseInt(answerIndex) === q.correct_index;
  if (t === 'multiple') {
    const ua = Array.isArray(answer) ? [...answer].map(Number).sort((a,b)=>a-b) : [];
    const ca = Array.isArray(q.correct_answer) ? [...q.correct_answer].map(Number).sort((a,b)=>a-b) : [];
    return JSON.stringify(ua) === JSON.stringify(ca);
  }
  if (t === 'matching') {
    const ua = Array.isArray(answer) ? answer : [];
    const ca = Array.isArray(q.correct_answer) ? q.correct_answer : [];
    return ua.length === ca.length && ua.every((v, i) => v === ca[i]);
  }
  if (t === 'ordering') {
    const ua = Array.isArray(answer) ? answer : [];
    const ca = Array.isArray(q.choices) ? q.choices : [];
    return ua.length === ca.length && ua.every((v, i) => v === ca[i]);
  }
  return false;
}

// GET /api/practice — list public sets
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('practice_sets')
    .select('id, name, description, question_ids, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(s => ({ ...s, questionCount: (s.question_ids || []).length })));
});

// GET /api/practice/:id — set info + questions (no correct answers)
router.get('/:id', async (req, res) => {
  const { data: ps, error } = await supabase
    .from('practice_sets')
    .select('id, name, description, scoring_scale, question_ids')
    .eq('id', req.params.id)
    .eq('is_public', true)
    .single();
  if (error || !ps) return res.status(404).json({ error: 'Không tìm thấy bộ ôn tập' });

  const ids = ps.question_ids || [];
  let questions = [];
  if (ids.length) {
    const { data: qs } = await supabase
      .from('questions')
      .select('id, title, description, choices, question_type, correct_answer')
      .in('id', ids);
    const qMap = {};
    (qs || []).forEach(q => { qMap[q.id] = q; });
    questions = ids.map(id => qMap[id]).filter(Boolean).map(q => {
      const out = {
        id: q.id, title: q.title, description: q.description,
        choices: q.choices, question_type: q.question_type || 'single'
      };
      if (out.question_type === 'matching' && Array.isArray(q.correct_answer)) {
        out.match_options = [...q.correct_answer].sort();
      }
      return out;
    });
  }

  res.json({ id: ps.id, name: ps.name, description: ps.description, scoring_scale: ps.scoring_scale, questions });
});

// POST /api/practice/:id/check — check one answer, return verdict + correct answer
router.post('/:id/check', async (req, res) => {
  const { questionId, answerIndex, answer } = req.body;

  const { data: ps } = await supabase
    .from('practice_sets')
    .select('question_ids')
    .eq('id', req.params.id)
    .eq('is_public', true)
    .single();
  if (!ps || !(ps.question_ids || []).includes(questionId)) {
    return res.status(404).json({ error: 'Not found' });
  }

  const { data: q } = await supabase
    .from('questions')
    .select('id, question_type, correct_index, correct_answer, choices, explanation')
    .eq('id', questionId)
    .single();
  if (!q) return res.status(404).json({ error: 'Câu hỏi không tồn tại' });

  const isCorrect = grade(q, answerIndex, answer);
  const qType = q.question_type || 'single';
  let correctAnswer = null;
  if (qType === 'single')    correctAnswer = q.correct_index;
  else if (qType === 'multiple') correctAnswer = q.correct_answer;
  else if (qType === 'matching') correctAnswer = q.correct_answer;
  else if (qType === 'ordering') correctAnswer = q.choices;

  res.json({ correct: isCorrect, explanation: q.explanation || '', correctAnswer, questionType: qType });
});

// POST /api/practice/:id/complete — save completed session
router.post('/:id/complete', async (req, res) => {
  const { userName, organization, score, total, answers } = req.body;
  if (!userName || score === undefined || !total) {
    return res.status(400).json({ error: 'Thiếu thông tin kết quả' });
  }

  const { data: ps } = await supabase
    .from('practice_sets')
    .select('scoring_scale')
    .eq('id', req.params.id)
    .single();

  const pct = Math.round((score / total) * 100);
  const level = getLevel(pct, ps?.scoring_scale);

  const { data, error } = await supabase
    .from('practice_results')
    .insert({
      practice_set_id: req.params.id,
      user_name: String(userName).trim(),
      organization: String(organization || '').trim(),
      score, total, pct,
      level_label: level.label,
      answers: answers || []
    })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ...data, level });
});

module.exports = router;
