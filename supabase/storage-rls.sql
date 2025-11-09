-- ============================================
-- Storage RLS 정책 수정
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;

-- 1. 모든 사용자가 프로필 이미지를 볼 수 있도록 설정
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- 2. 인증된 사용자만 업로드 가능 (회원가입 중에도 가능하도록)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

-- 3. 인증되지 않은 사용자도 임시로 업로드 가능 (회원가입용)
CREATE POLICY "Anyone can upload for registration"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'profiles');

-- 4. 사용자는 자신의 이미지만 업데이트 가능
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 5. 사용자는 자신의 이미지만 삭제 가능
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);