const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Middleware xác thực Supabase Auth Token
async function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  next();
}

// Lấy thông tin profile
router.get('/profile', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message });
  }

  // Nếu chưa có profile (PGRST116 là Not Found), trả về null
  res.json(data || null);
});

// Cập nhật thông tin profile (Hoàn thiện hồ sơ sau khi login Google)
router.post('/profile', authMiddleware, async (req, res) => {
  const { displayName, organization } = req.body;
  if (!displayName) return res.status(400).json({ error: 'Display name is required' });

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: req.user.id,
      display_name: displayName,
      organization: organization || '',
      updated_at: new Date()
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Lấy điểm sát hạch AI từ bài thi gần nhất
router.get('/score', authMiddleware, async (req, res) => {
  // 1. Tìm participant mới nhất của user này trong các kỳ thi có is_ai_assessment = true
  const { data: participantData, error: pErr } = await supabase
    .from('participants')
    .select('id, contest_id, joined_at, contests!inner(is_ai_assessment)')
    .eq('user_id', req.user.id)
    .eq('contests.is_ai_assessment', true)
    .order('joined_at', { ascending: false })
    .limit(1);

  if (pErr) return res.status(500).json({ error: pErr.message });
  
  if (!participantData || participantData.length === 0) {
    // Chưa từng thi
    return res.json({ score: 0, recommendedTier: 'Free', hasExam: false });
  }

  const p = participantData[0];

  // 2. Lấy tổng số câu hỏi của kỳ thi đó
  const { count: totalQuestions, error: cqErr } = await supabase
    .from('contest_questions')
    .select('id', { count: 'exact', head: true })
    .eq('contest_id', p.contest_id);

  if (cqErr) return res.status(500).json({ error: cqErr.message });

  // 3. Lấy số lượng đáp án đúng (status = 'correct')
  const { count: correctAnswers, error: subErr } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('participant_id', p.id)
    .eq('status', 'correct');

  if (subErr) return res.status(500).json({ error: subErr.message });

  const total = totalQuestions || 1; // tránh chia 0
  const score = Math.round((correctAnswers / total) * 100);

  let recommendedTier = 'Free';
  if (score >= 80) recommendedTier = 'Max';
  else if (score >= 50) recommendedTier = 'Pro';

  res.json({ score, recommendedTier, hasExam: true });
});

// Gửi yêu cầu cấp phát tài khoản AI
router.post('/request', authMiddleware, async (req, res) => {
  const { score, recommendedTier } = req.body;

  // Kiểm tra xem đã có yêu cầu nào đang chờ duyệt chưa
  const { data: existing } = await supabase
    .from('ai_account_requests')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('status', 'pending')
    .single();
  
  if (existing) {
    return res.status(400).json({ error: 'Bạn đã có một yêu cầu đang chờ duyệt.' });
  }

  const { data, error } = await supabase
    .from('ai_account_requests')
    .insert({
      user_id: req.user.id,
      score,
      recommended_tier: recommendedTier,
      status: 'pending'
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Lấy danh sách yêu cầu của user hiện tại
router.get('/requests', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('ai_account_requests')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
