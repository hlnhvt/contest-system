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
  const durationMinutes = Math.max(1, Math.floor((endMs - startMs) / 60000));
  const penaltyUnit = Math.max(1, Math.round(durationMinutes / 15));
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

  let submissions = [];
  let from = 0;
  const limit = 1000;
  let hasMore = true;
  while (hasMore) {
    const { data: chunk, error } = await supabase
      .from('submissions')
      .select('participant_id, question_id, status, submitted_at')
      .eq('contest_id', contestId)
      .order('submitted_at', { ascending: true })
      .range(from, from + limit - 1);
    
    if (error) return res.status(500).json({ error: error.message });
    
    if (chunk && chunk.length > 0) {
      submissions.push(...chunk);
      from += chunk.length;
      if (chunk.length < limit) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

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
        const penalty = qs.solveTime + qs.wrongBefore * penaltyUnit;
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
    penaltyUnit,
    durationMinutes,
    freeze: {
      active: freezeActive,
      isPublished,
      freezeStart: freezeTime.toISOString()
    }
  });
});

router.get('/:id/participants', async (req, res) => {
  const { data, error } = await supabase
    .from('participants')
    .select('id, nickname, organization, joined_at')
    .eq('contest_id', req.params.id)
    .order('joined_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.get('/:id/evaluation', async (req, res) => {
  const contestId = req.params.id;
  const participantId = req.query.participantId;
  if (!participantId) return res.status(400).json({ error: 'Thiếu participantId' });

  const { data: contest } = await supabase.from('contests').select('scoring_scale').eq('id', contestId).single();
  if (!contest) return res.status(404).json({ error: 'Không tìm thấy kỳ thi' });

  // Fetch questions with difficulty via join
  const { data: cqs } = await supabase
    .from('contest_questions')
    .select('question_id, questions(id, title, difficulty, question_type)')
    .eq('contest_id', contestId);

  // Fetch all submissions of this participant for this contest
  const { data: subs } = await supabase
    .from('submissions')
    .select('question_id, status')
    .eq('contest_id', contestId)
    .eq('participant_id', participantId);

  const questions = (cqs || []).map(cq => ({
    id: cq.question_id,
    title: cq.questions?.title || '',
    difficulty: cq.questions?.difficulty ?? 0,
    type: cq.questions?.question_type || 'single',
  }));

  const solvedSet    = new Set((subs || []).filter(s => s.status === 'correct').map(s => s.question_id));
  const attemptedSet = new Set((subs || []).map(s => s.question_id));

  const total = questions.length;
  const score = questions.filter(q => solvedSet.has(q.id)).length;
  const pct   = total > 0 ? Math.round((score / total) * 100) : 0;

  // Weighted score: câu khó hơn có trọng số cao hơn (weight = difficulty + 1, range 1–6)
  let wTotal = 0, wScore = 0;
  for (const q of questions) {
    const w = (q.difficulty || 0) + 1;
    wTotal += w;
    if (solvedSet.has(q.id)) wScore += w;
  }
  const wPct = wTotal > 0 ? Math.round((wScore / wTotal) * 100) : 0;

  // Breakdown theo nhóm độ khó
  const groups = [
    { key: 'easy',   label: 'Dễ',         color: '#16a34a', range: [0, 1] },
    { key: 'medium', label: 'Trung bình',  color: '#d97706', range: [2, 3] },
    { key: 'hard',   label: 'Khó',        color: '#dc2626', range: [4, 5] },
  ];
  const breakdown = groups.map(g => {
    const qs     = questions.filter(q => q.difficulty >= g.range[0] && q.difficulty <= g.range[1]);
    const solved = qs.filter(q => solvedSet.has(q.id)).length;
    return { ...g, total: qs.length, solved };
  }).filter(g => g.total > 0);

  // Xếp loại dựa trên điểm có trọng số
  const DEFAULT_SCALE = [
    { min: 0,  max: 39,  label: 'Cần cải thiện', color: '#ef4444' },
    { min: 40, max: 59,  label: 'Trung bình',    color: '#f59e0b' },
    { min: 60, max: 74,  label: 'Khá',           color: '#3b82f6' },
    { min: 75, max: 89,  label: 'Giỏi',          color: '#8b5cf6' },
    { min: 90, max: 100, label: 'Xuất sắc',      color: '#10b981' },
  ];
  const scale = Array.isArray(contest.scoring_scale) && contest.scoring_scale.length
    ? contest.scoring_scale : DEFAULT_SCALE;
  const level = scale.find(r => wPct >= (r.min_pct ?? r.min) && wPct <= (r.max_pct ?? r.max))
    || scale[scale.length - 1];

  // Tạo đoạn văn đánh giá
  const notAttempted = questions.filter(q => !attemptedSet.has(q.id)).length;
  const easy   = breakdown.find(g => g.key === 'easy');
  const medium = breakdown.find(g => g.key === 'medium');
  const hard   = breakdown.find(g => g.key === 'hard');

  // Dòng tổng hợp
  const summaryLine = `Bạn đã giải đúng <strong>${score}/${total}</strong> câu (${pct}%). Với trọng số theo độ khó, điểm năng lực đạt <strong>${wPct}%</strong> — xếp loại <strong style="color:${level.color}">${level.label}</strong>.`;

  // Nhận xét định tính
  let qualLine = '';
  if (wPct >= 90) {
    qualLine = 'Kết quả xuất sắc! Bạn thể hiện sự nắm vững kiến thức toàn diện, kể cả các câu hỏi có độ khó cao.';
  } else if (wPct >= 75) {
    qualLine = 'Kết quả tốt. Bạn xử lý vững phần lớn nội dung; có thể ôn thêm các câu hỏi khó để nâng tầm năng lực.';
  } else if (wPct >= 60) {
    qualLine = 'Kết quả khá. Nền tảng kiến thức tương đối vững, nhưng cần đầu tư thêm cho phần nâng cao.';
  } else if (wPct >= 40) {
    qualLine = 'Kết quả trung bình. Bạn nắm được kiến thức cơ bản nhưng cần cải thiện độ chính xác ở mức độ khó hơn.';
  } else {
    qualLine = 'Kết quả cần cải thiện. Hãy ôn lại kiến thức nền tảng, sau đó tăng dần lên các bài khó hơn.';
  }

  // Phân tích theo độ khó
  const bParts = breakdown.map(g => `<strong>${g.label}</strong>: ${g.solved}/${g.total}`).join(' &nbsp;·&nbsp; ');

  // Các ghi chú bổ sung (bullet points)
  const notes = [];
  if (easy && easy.solved < easy.total) {
    notes.push(`Còn <strong>${easy.total - easy.solved}</strong> câu dễ chưa giải đúng — đây là phần cần ưu tiên ôn luyện trước.`);
  }
  if (hard && hard.solved > 0) {
    notes.push(`Giải được <strong>${hard.solved}/${hard.total}</strong> câu khó — cho thấy tư duy phân tích tốt.`);
  } else if (hard && hard.total > 0) {
    notes.push(`Các câu khó (<strong>${hard.total}</strong> câu) chưa được giải đúng — đây là mảng cần phát triển tiếp.`);
  }
  if (notAttempted > 0) {
    notes.push(`Có <strong>${notAttempted}</strong> câu chưa được thử — lần sau hãy cố gắng trả lời tất cả để không bỏ lỡ điểm.`);
  }

  const notesHtml = notes.length
    ? `<ul class="mt-3 space-y-1.5">${notes.map(n => `<li class="flex items-start gap-2"><span class="leading-5">${n}</span></li>`).join('')}</ul>`
    : '';

  const evalText = `<p>${summaryLine} ${qualLine}</p>${bParts ? `<p class="mt-2 text-xs text-gray-500">Phân tích theo độ khó — ${bParts}.</p>` : ''}${notesHtml}`;

  res.json({ score, total, pct, wPct, level, breakdown, evalText });
});

// Cập nhật thông tin thí sinh (chỉ cho phép khi chưa bắt đầu thi)
router.put('/:id/participants/:participantId', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Chưa xác thực' });

  // Kiểm tra participant từ token
  const { data: participant } = await supabase
    .from('participants')
    .select('*')
    .eq('token', token)
    .single();

  if (!participant || participant.id !== req.params.participantId || participant.contest_id !== req.params.id) {
    return res.status(403).json({ error: 'Không có quyền cập nhật' });
  }

  // Kiểm tra thời gian cuộc thi
  const { data: contest } = await supabase.from('contests').select('start_time').eq('id', participant.contest_id).single();
  if (!contest) return res.status(404).json({ error: 'Không tìm thấy cuộc thi' });
  
  if (new Date() >= new Date(contest.start_time)) {
    return res.status(400).json({ error: 'Cuộc thi đã bắt đầu, không thể đổi thông tin.' });
  }

  const { nickname, organization } = req.body;
  if (!nickname || nickname.trim() === '') {
    return res.status(400).json({ error: 'Biệt danh không được để trống' });
  }

  const { error } = await supabase
    .from('participants')
    .update({ nickname: nickname.trim(), organization: organization ? organization.trim() : '' })
    .eq('id', participant.id);

  if (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Biệt danh này đã được sử dụng trong cuộc thi.' });
    return res.status(500).json({ error: error.message });
  }

  res.json({ ok: true });
});

module.exports = router;
