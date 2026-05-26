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
