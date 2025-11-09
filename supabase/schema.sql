-- ============================================
-- 1. users 테이블 (회원 정보)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  student_id VARCHAR(20),
  major VARCHAR(100),
  gender VARCHAR(10),
  phone_number VARCHAR(20),
  profile_image_url TEXT,
  interests TEXT[],
  preferred_foods TEXT[],
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- users 테이블 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);

-- ============================================
-- 2. restaurants 테이블 (맛집 정보)
-- ============================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  address TEXT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  price_range INTEGER CHECK (price_range BETWEEN 1 AND 4),
  phone_number VARCHAR(20),
  opening_hours JSONB,
  description TEXT,
  image_urls TEXT[],
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- restaurants 테이블 인덱스
CREATE INDEX idx_restaurants_category ON restaurants(category);
CREATE INDEX idx_restaurants_price_range ON restaurants(price_range);
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX idx_restaurants_rating ON restaurants(average_rating DESC);

-- ============================================
-- 3. restaurant_reviews 테이블 (맛집 리뷰)
-- ============================================
CREATE TABLE restaurant_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  image_urls TEXT[],
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- restaurant_reviews 테이블 인덱스
CREATE INDEX idx_reviews_restaurant ON restaurant_reviews(restaurant_id);
CREATE INDEX idx_reviews_user ON restaurant_reviews(user_id);
CREATE INDEX idx_reviews_created_at ON restaurant_reviews(created_at DESC);

-- ============================================
-- 4. matching_requests 테이블 (매칭 요청)
-- ============================================
CREATE TABLE matching_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL,
  meal_time TIME NOT NULL,
  max_participants INTEGER NOT NULL CHECK (max_participants >= 2),
  current_participants INTEGER DEFAULT 1,
  gender_preference VARCHAR(20) DEFAULT '무관' CHECK (gender_preference IN ('무관', '동성만', '이성만')),
  age_preference VARCHAR(50),
  status VARCHAR(20) DEFAULT '모집중' CHECK (status IN ('모집중', '마감', '취소', '완료')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- matching_requests 테이블 인덱스
CREATE INDEX idx_matching_status ON matching_requests(status);
CREATE INDEX idx_matching_date ON matching_requests(meal_date);
CREATE INDEX idx_matching_requester ON matching_requests(requester_id);
CREATE INDEX idx_matching_restaurant ON matching_requests(restaurant_id);

-- ============================================
-- 5. matching_participants 테이블 (매칭 참가자)
-- ============================================
CREATE TABLE matching_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matching_request_id UUID NOT NULL REFERENCES matching_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT '신청' CHECK (status IN ('신청', '수락', '거절', '탈퇴')),
  message TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(matching_request_id, user_id)
);

-- matching_participants 테이블 인덱스
CREATE INDEX idx_participants_matching ON matching_participants(matching_request_id);
CREATE INDEX idx_participants_user ON matching_participants(user_id);
CREATE INDEX idx_participants_status ON matching_participants(status);

-- ============================================
-- 6. meal_schedules 테이블 (식사 일정)
-- ============================================
CREATE TABLE meal_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matching_request_id UUID NOT NULL REFERENCES matching_requests(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT '예정' CHECK (status IN ('예정', '완료', '취소', '노쇼')),
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- meal_schedules 테이블 인덱스
CREATE INDEX idx_schedules_matching ON meal_schedules(matching_request_id);
CREATE INDEX idx_schedules_date ON meal_schedules(scheduled_date);
CREATE INDEX idx_schedules_status ON meal_schedules(status);

-- ============================================
-- 7. user_ratings 테이블 (유저 평가)
-- ============================================
CREATE TABLE user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_schedule_id UUID NOT NULL REFERENCES meal_schedules(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  punctuality BOOLEAN DEFAULT TRUE,
  friendliness BOOLEAN DEFAULT TRUE,
  communication BOOLEAN DEFAULT TRUE,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meal_schedule_id, rater_id, rated_user_id)
);

-- user_ratings 테이블 인덱스
CREATE INDEX idx_ratings_rater ON user_ratings(rater_id);
CREATE INDEX idx_ratings_rated_user ON user_ratings(rated_user_id);
CREATE INDEX idx_ratings_schedule ON user_ratings(meal_schedule_id);

-- ============================================
-- 8. notifications 테이블 (알림)
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  link_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- notifications 테이블 인덱스
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- 9. favorites 테이블 (즐겨찾기)
-- ============================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- favorites 테이블 인덱스
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_restaurant ON favorites(restaurant_id);

-- ============================================
-- 10. block_list 테이블 (차단 목록)
-- ============================================
CREATE TABLE block_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- block_list 테이블 인덱스
CREATE INDEX idx_block_blocker ON block_list(blocker_id);
CREATE INDEX idx_block_blocked ON block_list(blocked_id);

-- ============================================
-- 트리거 함수: updated_at 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- users 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- restaurants 테이블에 트리거 적용
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- restaurant_reviews 테이블에 트리거 적용
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON restaurant_reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- matching_requests 테이블에 트리거 적용
CREATE TRIGGER update_matching_updated_at BEFORE UPDATE ON matching_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- matching_participants 테이블에 트리거 적용
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON matching_participants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- meal_schedules 테이블에 트리거 적용
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON meal_schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 트리거 함수: 맛집 평균 평점 자동 계산
-- ============================================
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE restaurants
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM restaurant_reviews
            WHERE restaurant_id = NEW.restaurant_id AND is_deleted = FALSE
        ),
        review_count = (
            SELECT COUNT(*)
            FROM restaurant_reviews
            WHERE restaurant_id = NEW.restaurant_id AND is_deleted = FALSE
        )
    WHERE id = NEW.restaurant_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_restaurant_rating
AFTER INSERT OR UPDATE ON restaurant_reviews
FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

-- ============================================
-- 트리거 함수: 유저 평균 평점 자동 계산
-- ============================================
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM user_ratings
            WHERE rated_user_id = NEW.rated_user_id
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM user_ratings
            WHERE rated_user_id = NEW.rated_user_id
        )
    WHERE id = NEW.rated_user_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_user_rating
AFTER INSERT OR UPDATE ON user_ratings
FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- ============================================
-- 트리거 함수: 매칭 참가자 수 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE matching_requests
    SET current_participants = (
        SELECT COUNT(*)
        FROM matching_participants
        WHERE matching_request_id = NEW.matching_request_id 
        AND status = '수락'
    ) + 1  -- 요청자 포함
    WHERE id = NEW.matching_request_id;
    
    -- 인원이 다 차면 상태를 '마감'으로 변경
    UPDATE matching_requests
    SET status = '마감'
    WHERE id = NEW.matching_request_id 
    AND current_participants >= max_participants
    AND status = '모집중';
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_participant_count
AFTER INSERT OR UPDATE ON matching_participants
FOR EACH ROW EXECUTE FUNCTION update_participant_count();

-- ============================================
-- Row Level Security (RLS) 설정
-- ============================================

-- users 테이블 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
ON users FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- notifications 테이블 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);