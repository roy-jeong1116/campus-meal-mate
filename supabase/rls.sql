-- ============================================
-- 기존 RLS 정책 모두 제거 (깔끔하게 시작)
-- ============================================

-- users 테이블
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can sign up" ON users;
DROP POLICY IF EXISTS "Users can delete own account" ON users;

-- restaurants 테이블
DROP POLICY IF EXISTS "Anyone can view restaurants" ON restaurants;
DROP POLICY IF EXISTS "Authenticated users can insert restaurants" ON restaurants;

-- restaurant_reviews 테이블
DROP POLICY IF EXISTS "Anyone can view reviews" ON restaurant_reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON restaurant_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON restaurant_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON restaurant_reviews;

-- matching_requests 테이블
DROP POLICY IF EXISTS "Anyone can view matching requests" ON matching_requests;
DROP POLICY IF EXISTS "Authenticated users can create matching" ON matching_requests;
DROP POLICY IF EXISTS "Users can update own matching" ON matching_requests;
DROP POLICY IF EXISTS "Users can delete own matching" ON matching_requests;

-- matching_participants 테이블
DROP POLICY IF EXISTS "Anyone can view participants" ON matching_participants;
DROP POLICY IF EXISTS "Authenticated users can join matching" ON matching_participants;
DROP POLICY IF EXISTS "Users can update own participation" ON matching_participants;

-- favorites 테이블
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
DROP POLICY IF EXISTS "Users can remove favorites" ON favorites;

-- notifications 테이블
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- ============================================
-- 1. users 테이블 RLS 정책
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 회원가입: 누구나 가능
CREATE POLICY "users_insert_policy"
ON users FOR INSERT
WITH CHECK (true);

-- 조회: 모든 프로필 조회 가능
CREATE POLICY "users_select_policy"
ON users FOR SELECT
USING (true);

-- 수정: 본인 정보만 수정 가능
CREATE POLICY "users_update_policy"
ON users FOR UPDATE
USING (id = current_setting('app.user_id', true)::uuid)
WITH CHECK (id = current_setting('app.user_id', true)::uuid);

-- 삭제: 본인 계정만 삭제 가능
CREATE POLICY "users_delete_policy"
ON users FOR DELETE
USING (id = current_setting('app.user_id', true)::uuid);

-- ============================================
-- 2. restaurants 테이블 RLS 정책
-- ============================================
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- 조회: 누구나 맛집 조회 가능
CREATE POLICY "restaurants_select_policy"
ON restaurants FOR SELECT
USING (true);

-- 등록: 누구나 맛집 등록 가능 (개발 단계, 나중에 관리자만으로 변경 가능)
CREATE POLICY "restaurants_insert_policy"
ON restaurants FOR INSERT
WITH CHECK (true);

-- 수정: 누구나 수정 가능 (개발 단계, 나중에 관리자만으로 변경)
CREATE POLICY "restaurants_update_policy"
ON restaurants FOR UPDATE
USING (true);

-- 삭제: 누구나 삭제 가능 (개발 단계, 나중에 관리자만으로 변경)
CREATE POLICY "restaurants_delete_policy"
ON restaurants FOR DELETE
USING (true);

-- ============================================
-- 3. restaurant_reviews 테이블 RLS 정책
-- ============================================
ALTER TABLE restaurant_reviews ENABLE ROW LEVEL SECURITY;

-- 조회: 모든 리뷰 조회 가능
CREATE POLICY "reviews_select_policy"
ON restaurant_reviews FOR SELECT
USING (true);

-- 작성: 누구나 리뷰 작성 가능
CREATE POLICY "reviews_insert_policy"
ON restaurant_reviews FOR INSERT
WITH CHECK (true);

-- 수정: 본인 리뷰만 수정 가능
CREATE POLICY "reviews_update_policy"
ON restaurant_reviews FOR UPDATE
USING (user_id = current_setting('app.user_id', true)::uuid);

-- 삭제: 본인 리뷰만 삭제 가능
CREATE POLICY "reviews_delete_policy"
ON restaurant_reviews FOR DELETE
USING (user_id = current_setting('app.user_id', true)::uuid);

-- ============================================
-- 4. matching_requests 테이블 RLS 정책
-- ============================================
ALTER TABLE matching_requests ENABLE ROW LEVEL SECURITY;

-- 조회: 모든 매칭 요청 조회 가능
CREATE POLICY "matching_select_policy"
ON matching_requests FOR SELECT
USING (true);

-- 생성: 누구나 매칭 요청 생성 가능
CREATE POLICY "matching_insert_policy"
ON matching_requests FOR INSERT
WITH CHECK (true);

-- 수정: 본인이 만든 매칭만 수정 가능
CREATE POLICY "matching_update_policy"
ON matching_requests FOR UPDATE
USING (requester_id = current_setting('app.user_id', true)::uuid);

-- 삭제: 본인이 만든 매칭만 삭제 가능
CREATE POLICY "matching_delete_policy"
ON matching_requests FOR DELETE
USING (requester_id = current_setting('app.user_id', true)::uuid);

-- ============================================
-- 5. matching_participants 테이블 RLS 정책
-- ============================================
ALTER TABLE matching_participants ENABLE ROW LEVEL SECURITY;

-- 조회: 모든 참가자 조회 가능
CREATE POLICY "participants_select_policy"
ON matching_participants FOR SELECT
USING (true);

-- 참가: 누구나 매칭 참가 신청 가능
CREATE POLICY "participants_insert_policy"
ON matching_participants FOR INSERT
WITH CHECK (true);

-- 수정: 본인 참가 정보만 수정 가능
CREATE POLICY "participants_update_policy"
ON matching_participants FOR UPDATE
USING (user_id = current_setting('app.user_id', true)::uuid);

-- 삭제(탈퇴): 본인 참가만 삭제 가능
CREATE POLICY "participants_delete_policy"
ON matching_participants FOR DELETE
USING (user_id = current_setting('app.user_id', true)::uuid);

-- ============================================
-- 6. meal_schedules 테이블 RLS 정책
-- ============================================
ALTER TABLE meal_schedules ENABLE ROW LEVEL SECURITY;

-- 조회: 모든 일정 조회 가능
CREATE POLICY "schedules_select_policy"
ON meal_schedules FOR SELECT
USING (true);

-- 생성/수정/삭제: 누구나 가능 (개발 단계)
CREATE POLICY "schedules_insert_policy"
ON meal_schedules FOR INSERT
WITH CHECK (true);

CREATE POLICY "schedules_update_policy"
ON meal_schedules FOR UPDATE
USING (true);

CREATE POLICY "schedules_delete_policy"
ON meal_schedules FOR DELETE
USING (true);

-- ============================================
-- 7. user_ratings 테이블 RLS 정책
-- ============================================
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- 조회: 모든 평가 조회 가능
CREATE POLICY "ratings_select_policy"
ON user_ratings FOR SELECT
USING (true);

-- 평가: 누구나 평가 가능
CREATE POLICY "ratings_insert_policy"
ON user_ratings FOR INSERT
WITH CHECK (true);

-- 수정: 본인이 작성한 평가만 수정 가능
CREATE POLICY "ratings_update_policy"
ON user_ratings FOR UPDATE
USING (rater_id = current_setting('app.user_id', true)::uuid);

-- 삭제: 본인이 작성한 평가만 삭제 가능
CREATE POLICY "ratings_delete_policy"
ON user_ratings FOR DELETE
USING (rater_id = current_setting('app.user_id', true)::uuid);

-- ============================================
-- 8. notifications 테이블 RLS 정책
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 조회: 본인 알림만 조회 가능
CREATE POLICY "notifications_select_policy"
ON notifications FOR SELECT
USING (user_id = current_setting('app.user_id', true)::uuid);

-- 생성: 시스템이 알림 생성 (누구나 가능)
CREATE POLICY "notifications_insert_policy"
ON notifications FOR INSERT
WITH CHECK (true);

-- 수정: 본인 알림만 수정 가능 (읽음 처리 등)
CREATE POLICY "notifications_update_policy"
ON notifications FOR UPDATE
USING (user_id = current_setting('app.user_id', true)::uuid);

-- 삭제: 본인 알림만 삭제 가능
CREATE POLICY "notifications_delete_policy"
ON notifications FOR DELETE
USING (user_id = current_setting('app.user_id', true)::uuid);

-- ============================================
-- 9. favorites 테이블 RLS 정책
-- ============================================
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 조회: 본인 즐겨찾기만 조회 가능
CREATE POLICY "favorites_select_policy"
ON favorites FOR SELECT
USING (user_id = current_setting('app.user_id', true)::uuid);

-- 추가: 본인만 즐겨찾기 추가 가능
CREATE POLICY "favorites_insert_policy"
ON favorites FOR INSERT
WITH CHECK (user_id = current_setting('app.user_id', true)::uuid);

-- 삭제: 본인 즐겨찾기만 삭제 가능
CREATE POLICY "favorites_delete_policy"
ON favorites FOR DELETE
USING (user_id = current_setting('app.user_id', true)::uuid);

-- ============================================
-- 10. block_list 테이블 RLS 정책
-- ============================================
ALTER TABLE block_list ENABLE ROW LEVEL SECURITY;

-- 조회: 본인 차단 목록만 조회 가능
CREATE POLICY "block_select_policy"
ON block_list FOR SELECT
USING (blocker_id = current_setting('app.user_id', true)::uuid);

-- 추가: 본인만 차단 추가 가능
CREATE POLICY "block_insert_policy"
ON block_list FOR INSERT
WITH CHECK (blocker_id = current_setting('app.user_id', true)::uuid);

-- 삭제: 본인 차단 목록만 삭제 가능
CREATE POLICY "block_delete_policy"
ON block_list FOR DELETE
USING (blocker_id = current_setting('app.user_id', true)::uuid);