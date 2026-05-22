const express = require('express');
const supabase = require('../supabase');
const { invalidateContestQuestions } = require('../cache');
const router = express.Router();

function adminAuth(req, res, next) {
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Sai mật khẩu admin' });
  }
  next();
}
router.use(adminAuth);

router.get('/verify', (req, res) => res.json({ ok: true }));

// ── Contests ──────────────────────────────────────────────
router.get('/contests', async (req, res) => {
  const { data, error } = await supabase.from('contests').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/contests', async (req, res) => {
  const { name, description, start_time, end_time, is_public, require_login, is_ai_assessment, scoring_scale } = req.body;
  const { data, error } = await supabase.from('contests')
    .insert({ 
      name, description, start_time, end_time, 
      is_public: is_public ?? true,
      require_login: require_login ?? false,
      is_ai_assessment: is_ai_assessment ?? false,
      scoring_scale: scoring_scale || null
    })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/contests/:id', async (req, res) => {
  const { name, description, start_time, end_time, is_public, require_login, is_ai_assessment, scoring_scale } = req.body;
  const { data, error } = await supabase.from('contests')
    .update({ 
      name, description, start_time, end_time, is_public,
      require_login: require_login ?? false,
      is_ai_assessment: is_ai_assessment ?? false,
      scoring_scale: scoring_scale || null
    })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/contests/auto', async (req, res) => {
  const { name, description, start_time, end_time, is_public, require_login, is_ai_assessment, scoring_scale, count, difficulty } = req.body;
  
  if (!count || count < 1) return res.status(400).json({ error: 'Số lượng câu hỏi không hợp lệ' });

  let query = supabase.from('questions').select('id');
  if (difficulty !== undefined && difficulty !== null && difficulty !== '') {
    query = query.eq('difficulty', difficulty);
  }
  const { data: qData, error: qError } = await query;
  if (qError) return res.status(500).json({ error: qError.message });
  
  if (!qData || qData.length < count) {
    return res.status(400).json({ error: `Ngân hàng chỉ có ${qData?.length || 0} câu hỏi phù hợp, không đủ ${count} câu.` });
  }

  // Shuffle and pick
  const shuffled = qData.sort(() => 0.5 - Math.random());
  const selectedIds = shuffled.slice(0, count).map(q => q.id);

  // Create contest
  const { data: contestData, error: contestError } = await supabase.from('contests')
    .insert({ 
      name, description, start_time, end_time, 
      is_public: is_public ?? true,
      require_login: require_login ?? false,
      is_ai_assessment: is_ai_assessment ?? false,
      scoring_scale: scoring_scale || null
    })
    .select().single();
  if (contestError) return res.status(500).json({ error: contestError.message });

  // Create contest_questions
  const rows = selectedIds.map((id, index) => ({
    contest_id: contestData.id,
    question_id: id,
    label: `Q${index + 1}`,
    order_num: index
  }));
  const { error: cqError } = await supabase.from('contest_questions').insert(rows);
  if (cqError) return res.status(500).json({ error: cqError.message });

  res.json({ ...contestData, auto_generated_count: count });
});

router.delete('/contests/:id', async (req, res) => {
  const id = req.params.id;
  // submissions không có ON DELETE CASCADE nên phải xóa thủ công trước
  const { error: subErr } = await supabase.from('submissions').delete().eq('contest_id', id);
  if (subErr) return res.status(500).json({ error: subErr.message });
  const { error } = await supabase.from('contests').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Công bố kết quả (bỏ đóng băng)
router.post('/contests/:id/publish', async (req, res) => {
  const { data, error } = await supabase
    .from('contests')
    .update({ is_published: true })
    .eq('id', req.params.id)
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Thu hồi công bố (đóng băng lại)
router.post('/contests/:id/unpublish', async (req, res) => {
  const { data, error } = await supabase
    .from('contests')
    .update({ is_published: false })
    .eq('id', req.params.id)
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── Contest Questions (gán câu hỏi vào contest) ───────────
router.get('/contests/:contestId/questions', async (req, res) => {
  const { data, error } = await supabase
    .from('contest_questions')
    .select('id, label, order_num, question_id, question:questions(id, title, description, choices, correct_index, tags)')
    .eq('contest_id', req.params.contestId)
    .order('order_num');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// Lưu danh sách câu hỏi cho contest (replace all)
router.post('/contests/:contestId/questions', async (req, res) => {
  const { questions } = req.body; // [{ questionId, label, order_num }]
  const contestId = req.params.contestId;

  await supabase.from('contest_questions').delete().eq('contest_id', contestId);

  if (questions && questions.length > 0) {
    const rows = questions.map((q, i) => ({
      contest_id: contestId,
      question_id: q.questionId,
      label: q.label,
      order_num: q.order_num ?? i
    }));
    const { error } = await supabase.from('contest_questions').insert(rows);
    if (error) return res.status(500).json({ error: error.message });
  }
  invalidateContestQuestions(contestId);
  res.json({ ok: true });
});

// ── Question Bank ─────────────────────────────────────────
router.get('/questions', async (req, res) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/questions', async (req, res) => {
  const { title, description, choices, correct_index, correct_answer, question_type, explanation, tags, difficulty } = req.body;
  if (!title || !description || !choices || choices.length < 2) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }
  const qType = question_type || 'single';
  if (qType === 'single' && correct_index === undefined) {
    return res.status(400).json({ error: 'Thiếu đáp án đúng' });
  }
  const { data, error } = await supabase.from('questions')
    .insert({
      title, description, choices,
      question_type: qType,
      correct_index: qType === 'single' ? correct_index : null,
      correct_answer: qType !== 'single' ? (correct_answer ?? null) : null,
      explanation: explanation || '',
      tags: tags || [],
      difficulty: difficulty || 0,
      is_bookmarked: false
    })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/questions/:id', async (req, res) => {
  const { title, description, choices, correct_index, correct_answer, question_type, explanation, tags, difficulty } = req.body;
  const qType = question_type || 'single';
  const { data, error } = await supabase.from('questions')
    .update({
      title, description, choices,
      question_type: qType,
      correct_index: qType === 'single' ? correct_index : null,
      correct_answer: qType !== 'single' ? (correct_answer ?? null) : null,
      explanation, tags,
      difficulty: difficulty ?? 0
    })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.patch('/questions/:id/bookmark', async (req, res) => {
  const { is_bookmarked } = req.body;
  const { data, error } = await supabase.from('questions')
    .update({ is_bookmarked: !!is_bookmarked })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/questions/:id', async (req, res) => {
  // Kiểm tra xem câu hỏi có đang được dùng không
  const { count } = await supabase.from('contest_questions')
    .select('id', { count: 'exact', head: true })
    .eq('question_id', req.params.id);
  if (count > 0) {
    return res.status(400).json({ error: 'Câu hỏi đang được dùng trong kỳ thi, không thể xoá' });
  }
  const { error } = await supabase.from('questions').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Bulk Import Questions ────────────────────────────────
router.post('/questions/import', async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Dữ liệu import không hợp lệ' });
  }

  const rows = [];
  const errors = [];

  questions.forEach((q, idx) => {
    const qType = q.question_type || 'single';
    if (!q.title || !q.description || !Array.isArray(q.choices) || q.choices.length < 2) {
      errors.push(`Câu ${idx + 1}: Thiếu tiêu đề, nội dung hoặc ít nhất 2 đáp án`);
      return;
    }
    if (qType === 'single' && (q.correct_index === undefined || q.correct_index === null || q.correct_index === '')) {
      errors.push(`Câu ${idx + 1}: Loại "single" cần có correct_index`);
      return;
    }
    rows.push({
      title: String(q.title).trim(),
      description: String(q.description).trim(),
      choices: q.choices.map(c => String(c).trim()),
      question_type: qType,
      correct_index: qType === 'single' ? Number(q.correct_index) : null,
      correct_answer: qType !== 'single' ? (q.correct_answer || null) : null,
      explanation: q.explanation || '',
      tags: Array.isArray(q.tags) ? q.tags : (q.tags ? String(q.tags).split(',').map(t => t.trim()).filter(Boolean) : []),
      difficulty: Math.min(5, Math.max(0, Number(q.difficulty) || 0)),
      is_bookmarked: false
    });
  });

  if (rows.length === 0) {
    return res.status(400).json({ error: 'Không có câu hỏi hợp lệ nào để import', errors });
  }

  const { data, error } = await supabase.from('questions').insert(rows).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ imported: data.length, errors });
});

// ── Practice Sets ─────────────────────────────────────────
router.get('/practice-sets', async (req, res) => {
  const { data, error } = await supabase
    .from('practice_sets')
    .select('id, name, description, question_ids, scoring_scale, is_public, created_at')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(s => ({ ...s, questionCount: (s.question_ids || []).length })));
});

router.post('/practice-sets', async (req, res) => {
  const { name, description, question_ids, scoring_scale, is_public } = req.body;
  if (!name) return res.status(400).json({ error: 'Tên bộ ôn tập không được để trống' });
  const { data, error } = await supabase.from('practice_sets')
    .insert({ name, description: description || '', question_ids: question_ids || [], scoring_scale: scoring_scale || null, is_public: is_public ?? true })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/practice-sets/auto', async (req, res) => {
  const { name, description, scoring_scale, is_public, count, difficulty } = req.body;
  
  if (!name) return res.status(400).json({ error: 'Tên bộ ôn tập không được để trống' });
  if (!count || count < 1) return res.status(400).json({ error: 'Số lượng câu hỏi không hợp lệ' });

  let query = supabase.from('questions').select('id');
  if (difficulty !== undefined && difficulty !== null && difficulty !== '') {
    query = query.eq('difficulty', difficulty);
  }
  const { data: qData, error: qError } = await query;
  if (qError) return res.status(500).json({ error: qError.message });
  
  if (!qData || qData.length < count) {
    return res.status(400).json({ error: `Ngân hàng chỉ có ${qData?.length || 0} câu hỏi phù hợp, không đủ ${count} câu.` });
  }

  // Shuffle and pick
  const shuffled = qData.sort(() => 0.5 - Math.random());
  const selectedIds = shuffled.slice(0, count).map(q => q.id);

  const { data, error } = await supabase.from('practice_sets')
    .insert({ 
      name, 
      description: description || '', 
      question_ids: selectedIds, 
      scoring_scale: scoring_scale || null, 
      is_public: is_public ?? true 
    })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/practice-sets/:id', async (req, res) => {
  const { name, description, question_ids, scoring_scale, is_public } = req.body;
  const { data, error } = await supabase.from('practice_sets')
    .update({ name, description, question_ids, scoring_scale: scoring_scale || null, is_public })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/practice-sets/:id', async (req, res) => {
  const { error } = await supabase.from('practice_sets').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

router.get('/practice-sets/:id/results', async (req, res) => {
  const { data, error } = await supabase
    .from('practice_results')
    .select('*')
    .eq('practice_set_id', req.params.id)
    .order('completed_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// ── Submissions ───────────────────────────────────────────
router.get('/submissions', async (req, res) => {
  const { contestId } = req.query;
  let query = supabase
    .from('submissions')
    .select('*, participant:participants(nickname), question:questions(title)')
    .order('submitted_at', { ascending: false })
    .limit(300);
  if (contestId) query = query.eq('contest_id', contestId);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── AI Account Requests ────────────────────────────────────
router.get('/ai-requests', async (req, res) => {
  const { data, error } = await supabase
    .from('ai_account_requests')
    .select('*, profiles(display_name, organization)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/ai-requests/:id', async (req, res) => {
  const { status, allocated_tier } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  }

  const updateData = { status, updated_at: new Date() };
  if (allocated_tier) updateData.allocated_tier = allocated_tier;

  const { data, error } = await supabase
    .from('ai_account_requests')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
