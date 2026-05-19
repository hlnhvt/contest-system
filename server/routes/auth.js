const express = require('express');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../supabase');
const { getToken, setToken } = require('../cache');
const router = express.Router();

// Join a contest with nickname or Google Auth
router.post('/join', async (req, res) => {
  const { contestId, nickname, organization } = req.body;
  const tokenHeader = req.headers.authorization?.replace('Bearer ', '');
  
  let nick = nickname ? nickname.trim() : '';
  let org = organization ? organization.trim() : '';
  let userId = null;

  if (tokenHeader) {
    const { data: { user }, error: ue } = await supabase.auth.getUser(tokenHeader);
    if (!ue && user) {
      userId = user.id;
      // Fetch profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) {
        nick = profile.display_name || user.user_metadata?.full_name || 'Người dùng AI';
        org = profile.organization || '';
      }
    }
  }

  if (!contestId || (!nick || nick.length < 2)) {
    return res.status(400).json({ error: 'Contest ID and nickname (min 2 chars) are required' });
  }

  // Check contest exists and is running
  const { data: contest, error: ce } = await supabase
    .from('contests')
    .select('*')
    .eq('id', contestId)
    .single();

  if (ce || !contest) return res.status(404).json({ error: 'Contest not found' });

  const now = new Date();
  const end = new Date(contest.end_time);
  if (now > end) return res.status(400).json({ error: 'Contest has ended' });

  // Upsert participant (allow rejoining with same nickname)
  const token = uuidv4();

  const { data: existing } = await supabase
    .from('participants')
    .select('*')
    .eq('contest_id', contestId)
    .eq('nickname', nick)
    .single();

  if (existing) {
    // Cập nhật lại user_id nếu trước đó chưa có nhưng giờ đã đăng nhập
    if (userId && !existing.user_id) {
      await supabase.from('participants').update({ user_id: userId }).eq('id', existing.id);
    }
    setToken(existing.token, existing);
    return res.json({ token: existing.token, participantId: existing.id, nickname: existing.nickname, organization: existing.organization || '' });
  }

  const { data: participant, error } = await supabase
    .from('participants')
    .insert({ contest_id: contestId, nickname: nick, organization: org, token, user_id: userId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Nickname already taken in this contest' });
    return res.status(500).json({ error: error.message });
  }

  setToken(participant.token, participant);
  res.json({ token: participant.token, participantId: participant.id, nickname: participant.nickname, organization: participant.organization || '' });
});

// Verify token and get participant info
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  // /me cần thông tin contest đầy đủ nên luôn query DB (chỉ gọi 1 lần khi load trang)
  const { data, error } = await supabase
    .from('participants')
    .select('*, contest:contests(*)')
    .eq('token', token)
    .single();

  if (error || !data) return res.status(401).json({ error: 'Invalid token' });
  // Cập nhật cache với thông tin mới nhất
  setToken(token, data);
  res.json(data);
});

module.exports = router;
