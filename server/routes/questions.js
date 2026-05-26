const express = require('express');
const supabase = require('../supabase');
const { getContestQuestions, setContestQuestions } = require('../cache');
const router = express.Router();

// Lấy câu hỏi của một contest (KHÔNG trả về correct_index / correct_answer)
router.get('/contest/:contestId', async (req, res) => {
  const { contestId } = req.params;

  const cached = getContestQuestions(contestId);
  if (cached) return res.json(cached);

  const { data, error } = await supabase
    .from('contest_questions')
    .select('label, order_num, question:questions(id, title, description, choices, question_type, correct_answer, topic_group:topic_groups(id, name))')
    .eq('contest_id', contestId)
    .order('order_num');

  if (error) return res.status(500).json({ error: error.message });

  const questions = (data || []).map(cq => {
    const q = cq.question;
    const qType = q.question_type || 'single';
    const out = {
      label:      cq.label,
      order_num:  cq.order_num,
      id:         q.id,
      title:      q.title,
      description:q.description,
      choices:    q.choices,
      question_type: qType,
      topic_group: q.topic_group || null
    };
    // Matching: expose shuffled right-side options without the correct pairing
    if (qType === 'matching' && Array.isArray(q.correct_answer)) {
      out.match_options = [...q.correct_answer].sort();
    }
    return out;
  });

  setContestQuestions(contestId, questions);
  res.json(questions);
});

// Lấy một câu hỏi (KHÔNG trả về correct_index / correct_answer)
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('questions')
    .select('id, title, description, choices, question_type, correct_answer, topic_group:topic_groups(id, name)')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Not found' });

  const qType = data.question_type || 'single';
  const out = {
    id:          data.id,
    title:       data.title,
    description: data.description,
    choices:     data.choices,
    question_type: qType,
    topic_group: data.topic_group || null
  };
  if (qType === 'matching' && Array.isArray(data.correct_answer)) {
    out.match_options = [...data.correct_answer].sort();
  }
  res.json(out);
});

module.exports = router;
