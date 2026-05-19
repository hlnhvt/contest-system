const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('contests')
    .select('id, name, description, start_time, end_time, require_login')
    .eq('is_public', true)
    .order('start_time', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

// Bảng xếp hạng ACM-ICPC với hỗ trợ đóng băng
router.get('/:id/scoreboard', async (req, res) => {
  const contestId = req.params.id;
  const viewerId = req.query.viewerId;

  const { data: contest } = await supabase
    .from('contests')
    .select('start_time, end_time')
    .eq('id', contestId)
    .single();
  if (!contest) return res.status(404).json({ error: 'Not found' });

  // is_published requires migration: ALTER TABLE contests ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
  const { data: pubRow } = await supabase.from('contests').select('is_published').eq('id', contestId).single();
  const isPublished = pubRow?.is_published ?? false;

  // Tính thời điểm đóng băng = 4/5 thời gian thi
  const startMs = new Date(contest.start_time).getTime();
  const endMs   = new Date(contest.end_time).getTime();
  const freezeMs = startMs + Math.floor((endMs - startMs) * 4 / 5);
  const freezeTime = new Date(freezeMs);
  const now = new Date();
  const contestRunning = now >= new Date(contest.start_time) && now <= new Date(contest.end_time);
  // Freeze active = đang trong 1/5 cuối hoặc đã kết thúc nhưng chưa published
  const freezeActive = !isPublished && now >= freezeTime;

  const { data: contestQuestions } = await supabase
    .from('contest_questions')
    .select('label, order_num, question_id, question:questions(id, title)')
    .eq('contest_id', contestId)
    .order('order_num');

  const { data: participants } = await supabase
    .from('participants')
    .select('id, nickname, organization')
    .eq('contest_id', contestId);

  const { data: submissions } = await supabase
    .from('submissions')
    .select('participant_id, question_id, status, submitted_at')
    .eq('contest_id', contestId)
    .order('submitted_at', { ascending: true });

  const startTime = new Date(contest.start_time);
  const questions = (contestQuestions || []).map(cq => ({
    id: cq.question_id,
    label: cq.label,
    title: cq.question?.title || ''
  }));

  // Build stats per participant per question
  const statsMap = {};
  for (const p of (participants || [])) {
    statsMap[p.id] = { nickname: p.nickname, organization: p.organization || '', questions: {} };
  }

  for (const sub of (submissions || [])) {
    const ps = statsMap[sub.participant_id];
    if (!ps) continue;
    const qid = sub.question_id;
    const subTime = new Date(sub.submitted_at);
    const isFreezeSub = subTime >= freezeTime;

    if (!ps.questions[qid]) {
      ps.questions[qid] = { 
        solved: false, wrongBefore: 0, solveTime: null, pending: 0,
        actualSolved: false, actualWrong: 0, actualSolveTime: null 
      };
    }
    const q = ps.questions[qid];

    // Luôn tính kết quả thực tế
    if (!q.actualSolved) {
      if (sub.status === 'correct') {
        q.actualSolved = true;
        q.actualSolveTime = Math.floor((subTime - startTime) / 60000);
      } else {
        q.actualWrong++;
      }
    }

    if (isFreezeSub && freezeActive) {
      // Bài nộp trong freeze period: chỉ đếm pending, không ảnh hưởng ranking đóng băng
      if (!q.solved) q.pending++;
    } else {
      // Bình thường (trước freeze hoặc đã published)
      if (!q.solved) {
        if (sub.status === 'correct') {
          q.solved = true;
          q.solveTime = Math.floor((subTime - startTime) / 60000);
        } else {
          q.wrongBefore++;
        }
      }
    }
  }

  // Build rows
  const rows = Object.entries(statsMap).map(([pid, data]) => {
    let totalSolved = 0, totalPenalty = 0;
    const questionResults = {};

    for (const q of questions) {
      const qs = data.questions[q.id];
      if (!qs) { questionResults[q.label] = null; continue; }

      // Tổng số bài và thời gian luôn tính theo kết quả ĐÓNG BĂNG để giữ nguyên thứ hạng
      if (qs.solved) {
        totalSolved++;
        const penalty = qs.solveTime + qs.wrongBefore * 20;
        totalPenalty += penalty;
      }

      const isViewer = pid === viewerId;

      if (isViewer && freezeActive) {
        // Trả về kết quả thật cho chính người dùng đang xem
        if (qs.actualSolved) {
          questionResults[q.label] = {
            solved: true,
            attempts: qs.actualWrong + 1,
            time: qs.actualSolveTime,
            pending: 0
          };
        } else if (qs.actualWrong > 0) {
          questionResults[q.label] = {
            solved: false,
            attempts: qs.actualWrong,
            pending: 0
          };
        } else {
          questionResults[q.label] = null;
        }
      } else {
        // Trả về kết quả đóng băng cho những người khác
        if (qs.solved) {
          questionResults[q.label] = {
            solved: true,
            attempts: qs.wrongBefore + 1,
            time: qs.solveTime,
            pending: qs.pending || 0
          };
        } else if (qs.wrongBefore > 0 || qs.pending > 0) {
          questionResults[q.label] = {
            solved: false,
            attempts: qs.wrongBefore,
            pending: qs.pending || 0
          };
        } else {
          questionResults[q.label] = null;
        }
      }
    }

    return { participantId: pid, nickname: data.nickname, organization: data.organization, totalSolved, totalPenalty, questions: questionResults };
  });

  rows.sort((a, b) => {
    if (b.totalSolved !== a.totalSolved) return b.totalSolved - a.totalSolved;
    return a.totalPenalty - b.totalPenalty;
  });

  res.json({
    questions,
    rows,
    freeze: {
      active: freezeActive,
      isPublished,
      freezeStart: freezeTime.toISOString()
    }
  });
});

router.get('/:id/evaluation', async (req, res) => {
  const contestId = req.params.id;
  const participantId = req.query.participantId;
  
  if (!participantId) return res.status(400).json({ error: 'Thiếu participantId' });

  const { data: contest } = await supabase.from('contests').select('scoring_scale').eq('id', contestId).single();
  if (!contest) return res.status(404).json({ error: 'Không tìm thấy kỳ thi' });

  const { count: totalQuestions } = await supabase.from('contest_questions')
    .select('id', { count: 'exact', head: true })
    .eq('contest_id', contestId);

  const { count: score } = await supabase.from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('contest_id', contestId)
    .eq('participant_id', participantId)
    .eq('status', 'correct');

  const t = totalQuestions || 0;
  const s = score || 0;
  const pct = t > 0 ? Math.round((s / t) * 100) : 0;
  
  const DEFAULT_SCALE = [
    { min: 0,  max: 39,  label: 'Cần cải thiện', color: '#ef4444' },
    { min: 40, max: 59,  label: 'Trung bình',    color: '#f59e0b' },
    { min: 60, max: 74,  label: 'Khá',           color: '#3b82f6' },
    { min: 75, max: 89,  label: 'Giỏi',          color: '#8b5cf6' },
    { min: 90, max: 100, label: 'Xuất sắc',      color: '#10b981' }
  ];
  
  const scale = Array.isArray(contest.scoring_scale) && contest.scoring_scale.length ? contest.scoring_scale : DEFAULT_SCALE;
  const level = scale.find(r => pct >= r.min && pct <= r.max) || scale[scale.length - 1];

  res.json({ score: s, total: t, pct, level });
});

module.exports = router;
