const express = require('express');
const supabase = require('../supabase');
const { getContestQuestions, setContestQuestions } = require('../cache');
const { ipBlockMiddleware } = require('../ipBlocker');
const router = express.Router();

async function requireParticipantToken(req, res, next) {
  // Check if contest has ended to allow public viewing
  let contestId = req.params.contestId;
  if (!contestId && req.params.id) {
    const { data: cq } = await supabase
      .from('contest_questions')
      .select('contest_id')
      .eq('question_id', req.params.id)
      .limit(1)
      .maybeSingle();
    if (cq) contestId = cq.contest_id;
  }

  if (contestId) {
    const { data: contest } = await supabase
      .from('contests')
      .select('end_time')
      .eq('id', contestId)
      .single();
    if (contest && new Date() > new Date(contest.end_time)) {
      return next(); // Bypass if contest has ended
    }
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(403).json({ error: 'unauthorized', message: 'Chỉ thí sinh tham gia kỳ thi mới được xem câu hỏi!' });
  }

  const { data: participant } = await supabase
    .from('participants')
    .select('id, contest_id')
    .eq('token', token)
    .maybeSingle();

  if (!participant) {
    return res.status(403).json({ error: 'unauthorized', message: 'Chỉ thí sinh tham gia kỳ thi mới được xem câu hỏi!' });
  }
  
  next();
}

// Lấy câu hỏi của một contest (KHÔNG trả về correct_index / correct_answer / explanation trừ khi đã kết thúc)
router.get('/contest/:contestId', ipBlockMiddleware, requireParticipantToken, async (req, res) => {
  const { contestId } = req.params;

  const { data: contest } = await supabase
    .from('contests')
    .select('end_time')
    .eq('id', contestId)
    .single();
  const hasEnded = contest && new Date() > new Date(contest.end_time);

  const cached = getContestQuestions(contestId);
  if (cached && !hasEnded) return res.json(cached);

  const { data, error } = await supabase
    .from('contest_questions')
    .select('label, order_num, question:questions(id, title, description, choices, question_type, correct_index, correct_answer, explanation, topic_group:topic_groups(id, name))')
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

    if (hasEnded) {
      out.correct_index = q.correct_index;
      out.correct_answer = q.correct_answer;
      out.explanation = q.explanation || '';
    }

    // Matching: expose shuffled right-side options without the correct pairing
    if (qType === 'matching' && Array.isArray(q.correct_answer)) {
      out.match_options = [...q.correct_answer].sort();
    }
    return out;
  });

  if (!hasEnded) {
    setContestQuestions(contestId, questions);
  }
  res.json(questions);
});

// Lấy một câu hỏi (KHÔNG trả về correct_index / correct_answer trừ khi đã kết thúc)
router.get('/:id', requireParticipantToken, async (req, res) => {
  const { data: cq } = await supabase
    .from('contest_questions')
    .select('contest_id')
    .eq('question_id', req.params.id)
    .limit(1)
    .maybeSingle();

  let hasEnded = false;
  if (cq) {
    const { data: contest } = await supabase
      .from('contests')
      .select('end_time')
      .eq('id', cq.contest_id)
      .single();
    hasEnded = contest && new Date() > new Date(contest.end_time);
  }

  const { data, error } = await supabase
    .from('questions')
    .select('id, title, description, choices, question_type, correct_index, correct_answer, explanation, topic_group:topic_groups(id, name)')
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

  if (hasEnded) {
    out.correct_index = data.correct_index;
    out.correct_answer = data.correct_answer;
    out.explanation = data.explanation || '';
  }

  if (qType === 'matching' && Array.isArray(data.correct_answer)) {
    out.match_options = [...data.correct_answer].sort();
  }
  res.json(out);
});

module.exports = router;
