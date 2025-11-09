-- ============================================
-- Supabase Auth 사용을 위한 RLS 정책 수정
-- ============================================

-- 1. users 테이블 정책 수정
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- 수정: 본인 정보만 수정 가능 (auth.uid() 사용)
CREATE POLICY "users_update_policy"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 삭제: 본인 계정만 삭제 가능
CREATE POLICY "users_delete_policy"
ON users FOR DELETE
USING (auth.uid() = id);

-- ============================================
-- 2. restaurant_reviews 테이블 정책 수정
-- ============================================
DROP POLICY IF EXISTS "reviews_update_policy" ON restaurant_reviews;
DROP POLICY IF EXISTS "reviews_delete_policy" ON restaurant_reviews;

CREATE POLICY "reviews_update_policy"
ON restaurant_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete_policy"
ON restaurant_reviews FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 3. matching_requests 테이블 정책 수정
-- ============================================
DROP POLICY IF EXISTS "matching_update_policy" ON matching_requests;
DROP POLICY IF EXISTS "matching_delete_policy" ON matching_requests;

CREATE POLICY "matching_update_policy"
ON matching_requests FOR UPDATE
USING (auth.uid() = requester_id);

CREATE POLICY "matching_delete_policy"
ON matching_requests FOR DELETE
USING (auth.uid() = requester_id);

-- ============================================
-- 4. matching_participants 테이블 정책 수정
-- ============================================
DROP POLICY IF EXISTS "participants_update_policy" ON matching_participants;
DROP POLICY IF EXISTS "participants_delete_policy" ON matching_participants;

CREATE POLICY "participants_update_policy"
ON matching_participants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "participants_delete_policy"
ON matching_participants FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 5. user_ratings 테이블 정책 수정
-- ============================================
DROP POLICY IF EXISTS "ratings_update_policy" ON user_ratings;
DROP POLICY IF EXISTS "ratings_delete_policy" ON user_ratings;

CREATE POLICY "ratings_update_policy"
ON user_ratings FOR UPDATE
USING (auth.uid() = rater_id);

CREATE POLICY "ratings_delete_policy"
ON user_ratings FOR DELETE
USING (auth.uid() = rater_id);

-- ============================================
-- 6. notifications 테이블 정책 수정
-- ============================================
DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_policy" ON notifications;

CREATE POLICY "notifications_select_policy"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_policy"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_policy"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 7. favorites 테이블 정책 수정
-- ============================================
DROP POLICY IF EXISTS "favorites_select_policy" ON favorites;
DROP POLICY IF EXISTS "favorites_insert_policy" ON favorites;
DROP POLICY IF EXISTS "favorites_delete_policy" ON favorites;

CREATE POLICY "favorites_select_policy"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_policy"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_policy"
ON favorites FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 8. block_list 테이블 정책 수정
-- ============================================
DROP POLICY IF EXISTS "block_select_policy" ON block_list;
DROP POLICY IF EXISTS "block_insert_policy" ON block_list;
DROP POLICY IF EXISTS "block_delete_policy" ON block_list;

CREATE POLICY "block_select_policy"
ON block_list FOR SELECT
USING (auth.uid() = blocker_id);

CREATE POLICY "block_insert_policy"
ON block_list FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "block_delete_policy"
ON block_list FOR DELETE
USING (auth.uid() = blocker_id);
