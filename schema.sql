-- ============================================================
-- ACM-ICPC MCQ Contest System - Schema v2
-- Chạy toàn bộ file này trong Supabase SQL Editor
-- ============================================================

-- Drop old tables if migrating from v1
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS sample_cases CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS contest_questions CASCADE;
DROP TABLE IF EXISTS questions CASCADE;

-- Contests
CREATE TABLE IF NOT EXISTS contests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT FALSE,
  require_login BOOLEAN DEFAULT FALSE,
  is_ai_assessment BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants
CREATE TABLE IF NOT EXISTS participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nickname TEXT NOT NULL,
  organization TEXT DEFAULT '',
  token TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, nickname)
);

-- Question bank (độc lập với contest)
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  choices JSONB NOT NULL,
  question_type TEXT DEFAULT 'single',      -- single | multiple | matching | ordering
  correct_index INTEGER,                    -- dùng cho loại 'single'
  correct_answer JSONB DEFAULT NULL,        -- dùng cho multiple/matching/ordering
  explanation TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  difficulty INTEGER DEFAULT 0 CHECK (difficulty >= 0 AND difficulty <= 5),
  is_bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration (chạy trong Supabase SQL Editor nếu bảng đã tồn tại):
-- ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty INTEGER DEFAULT 0 CHECK (difficulty >= 0 AND difficulty <= 5);
-- ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_bookmarked BOOLEAN DEFAULT FALSE;
-- Migration v3 - new question types:
-- ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_correct_index_check;
-- ALTER TABLE questions ALTER COLUMN correct_index DROP NOT NULL;
-- ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'single';
-- ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answer JSONB DEFAULT NULL;
-- ALTER TABLE submissions ALTER COLUMN answer_index DROP NOT NULL;
-- ALTER TABLE submissions ADD COLUMN IF NOT EXISTS answer JSONB DEFAULT NULL;
-- Migration v4 - organization field:
-- ALTER TABLE participants ADD COLUMN IF NOT EXISTS organization TEXT DEFAULT '';

-- Liên kết câu hỏi vào contest (với label A, B, C...)
CREATE TABLE contest_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  label TEXT NOT NULL,
  order_num INTEGER DEFAULT 0,
  UNIQUE(contest_id, label),
  UNIQUE(contest_id, question_id)
);

-- Submissions (chấm tức thì)
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_id UUID NOT NULL REFERENCES contests(id),
  question_id UUID NOT NULL REFERENCES questions(id),
  participant_id UUID NOT NULL REFERENCES participants(id),
  answer_index INTEGER,          -- dùng cho loại 'single'
  answer JSONB DEFAULT NULL,     -- dùng cho multiple/matching/ordering
  status TEXT NOT NULL CHECK (status IN ('correct', 'wrong')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice sets (bộ ôn tập)
CREATE TABLE IF NOT EXISTS practice_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  question_ids JSONB NOT NULL DEFAULT '[]',
  scoring_scale JSONB DEFAULT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Practice results (kết quả ôn tập)
CREATE TABLE IF NOT EXISTS practice_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_set_id UUID NOT NULL REFERENCES practice_sets(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  organization TEXT DEFAULT '',
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  pct INTEGER NOT NULL,
  level_label TEXT DEFAULT '',
  answers JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration (chạy nếu bảng đã tồn tại):
-- CREATE TABLE IF NOT EXISTS practice_sets (...);
-- CREATE TABLE IF NOT EXISTS practice_results (...);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_contests"        ON contests;
DROP POLICY IF EXISTS "public_read_participants"    ON participants;
DROP POLICY IF EXISTS "public_read_contest_questions" ON contest_questions;
DROP POLICY IF EXISTS "public_read_submissions"     ON submissions;
DROP POLICY IF EXISTS "public_read_questions"       ON questions;

CREATE POLICY "public_read_contests"          ON contests          FOR SELECT USING (true);
CREATE POLICY "public_read_participants"      ON participants      FOR SELECT USING (true);
CREATE POLICY "public_read_contest_questions" ON contest_questions FOR SELECT USING (true);
CREATE POLICY "public_read_submissions"       ON submissions       FOR SELECT USING (true);
CREATE POLICY "public_read_questions"         ON questions         FOR SELECT USING (true);

ALTER TABLE practice_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_practice_sets"    ON practice_sets;
DROP POLICY IF EXISTS "public_read_practice_results" ON practice_results;

CREATE POLICY "public_read_practice_sets"    ON practice_sets    FOR SELECT USING (true);
CREATE POLICY "public_read_practice_results" ON practice_results FOR SELECT USING (true);

-- ============================================================
-- Realtime (dùng DO block để bỏ qua lỗi nếu đã tồn tại)
-- ============================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE participants;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- Module Phân loại & Cấp phát tài khoản AI (AI Allocation)
-- ============================================================

-- Bảng hồ sơ người dùng (liên kết với auth.users của Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng yêu cầu cấp phát tài khoản AI
CREATE TABLE IF NOT EXISTS ai_account_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  recommended_tier TEXT NOT NULL CHECK (recommended_tier IN ('Free', 'Pro', 'Max')),
  allocated_tier TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS cho AI Allocation
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_account_requests ENABLE ROW LEVEL SECURITY;

-- Public đọc profiles (hoặc chỉ những ai đăng nhập)
DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT USING (true);

-- Cho phép user tự update profile của mình
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
CREATE POLICY "users_insert_own_profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Yêu cầu cấp phát
DROP POLICY IF EXISTS "users_read_own_requests" ON ai_account_requests;
CREATE POLICY "users_read_own_requests" ON ai_account_requests FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "users_insert_own_requests" ON ai_account_requests;
CREATE POLICY "users_insert_own_requests" ON ai_account_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_update_requests" ON ai_account_requests;
CREATE POLICY "admin_update_requests" ON ai_account_requests FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Migration commands (Run in Supabase SQL Editor if tables already exist)
-- ALTER TABLE contests ADD COLUMN IF NOT EXISTS require_login BOOLEAN DEFAULT FALSE;
-- ALTER TABLE contests ADD COLUMN IF NOT EXISTS is_ai_assessment BOOLEAN DEFAULT FALSE;
-- ALTER TABLE participants ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
