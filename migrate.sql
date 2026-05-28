-- Chạy đoạn mã này trong cửa sổ SQL Editor của Supabase

-- 1. Tạo bảng liên kết
CREATE TABLE IF NOT EXISTS question_topic_groups (
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  topic_group_id UUID REFERENCES topic_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, topic_group_id)
);

-- 2. Bật RLS và cấp quyền cho bảng liên kết
ALTER TABLE question_topic_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_qtg" ON question_topic_groups FOR SELECT USING (true);
CREATE POLICY "public_insert_qtg" ON question_topic_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_qtg" ON question_topic_groups FOR UPDATE USING (true);
CREATE POLICY "public_delete_qtg" ON question_topic_groups FOR DELETE USING (true);

-- 3. Di chuyển dữ liệu cũ sang bảng mới
INSERT INTO question_topic_groups (question_id, topic_group_id)
SELECT id, topic_group_id FROM questions WHERE topic_group_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. Xóa cột cũ
ALTER TABLE questions DROP COLUMN IF EXISTS topic_group_id;

-- 5. Anti-cheat & IP Blocker migrations
ALTER TABLE participants ADD COLUMN IF NOT EXISTS violations INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  nickname TEXT NOT NULL,
  organization TEXT DEFAULT '',
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, ip_address)
);

ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_blocked_ips" ON blocked_ips;
CREATE POLICY "public_read_blocked_ips" ON blocked_ips FOR SELECT USING (true);
