const supabase = require('./supabase');

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // If behind a proxy (like Vercel, Cloudflare, Nginx), get the first IP in the chain
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress;
}

async function isIPBlocked(ip, contestId) {
  if (!contestId) return false;
  
  // Query Supabase blocked_ips table
  const { data, error } = await supabase
    .from('blocked_ips')
    .select('id')
    .eq('contest_id', contestId)
    .eq('ip_address', ip)
    .maybeSingle();
    
  if (error) {
    console.error("Error querying blocked_ips:", error.message);
    return false;
  }
  
  return !!data;
}

async function ipBlockMiddleware(req, res, next) {
  const ip = getClientIP(req);
  let contestId = req.params.contestId || req.params.id || req.body.contestId || req.query.contestId;

  // If contestId is not found, attempt to fetch it from the participant token in the headers
  if (!contestId && req.headers.authorization) {
    const token = req.headers.authorization.replace('Bearer ', '');
    const { data: p } = await supabase
      .from('participants')
      .select('contest_id')
      .eq('token', token)
      .maybeSingle();
      
    if (p) contestId = p.contest_id;
  }

  if (contestId) {
    const blocked = await isIPBlocked(ip, contestId);
    if (blocked) {
      // Kiểm tra xem kỳ thi đã kết thúc chưa. Nếu kết thúc rồi thì cho phép truy cập để xem lại scoreboard
      const { data: contest } = await supabase
        .from('contests')
        .select('end_time')
        .eq('id', contestId)
        .maybeSingle();

      if (contest && new Date() > new Date(contest.end_time)) {
        return next();
      }

      return res.status(403).json({ 
        error: 'ip_blocked', 
        message: 'Địa chỉ IP của bạn đã bị khóa do vi phạm quy chế thi (chuyển tab quá số lần quy định)!' 
      });
    }
  }
  
  next();
}

module.exports = { getClientIP, isIPBlocked, ipBlockMiddleware };
