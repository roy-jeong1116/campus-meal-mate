-- ============================================
-- matchings 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS matchings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  restaurant_name VARCHAR(200) NOT NULL,
  food_category VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  max_participants INTEGER NOT NULL CHECK (max_participants >= 2 AND max_participants <= 8),
  current_participants INTEGER DEFAULT 1,
  description TEXT,
  preferred_gender TEXT[],
  preferred_student_ids TEXT[],
  preferred_majors TEXT[],
  preferred_interests TEXT[],
  preferred_foods TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- matchings 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_matchings_host ON matchings(host_id);
CREATE INDEX IF NOT EXISTS idx_matchings_restaurant ON matchings(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_matchings_date ON matchings(date);
CREATE INDEX IF NOT EXISTS idx_matchings_status ON matchings(status);
CREATE INDEX IF NOT EXISTS idx_matchings_created_at ON matchings(created_at DESC);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_matchings_updated_at
BEFORE UPDATE ON matchings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) 설정
-- ============================================
ALTER TABLE matchings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 매칭 목록을 볼 수 있음
CREATE POLICY "Anyone can view matchings"
ON matchings FOR SELECT
USING (true);

-- 로그인한 사용자는 매칭을 생성할 수 있음
CREATE POLICY "Authenticated users can create matchings"
ON matchings FOR INSERT
WITH CHECK (auth.uid() = host_id);

-- 호스트만 자신의 매칭을 수정할 수 있음
CREATE POLICY "Hosts can update own matchings"
ON matchings FOR UPDATE
USING (auth.uid() = host_id);

-- 호스트만 자신의 매칭을 삭제할 수 있음
CREATE POLICY "Hosts can delete own matchings"
ON matchings FOR DELETE
USING (auth.uid() = host_id);
