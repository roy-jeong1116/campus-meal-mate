-- Storage RLS 정책 설정
-- 회원가입 시 anon 사용자도 프로필 이미지를 업로드할 수 있도록 설정

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Anon users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;

-- 1. 모든 사용자가 프로필 이미지를 볼 수 있도록 설정
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- 2. 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profiles');

-- 3. 회원가입 중인 anon 사용자도 업로드 가능
CREATE POLICY "Anon users can upload profile images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'profiles');

-- 4. 사용자는 자신의 이미지만 업데이트 가능
CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profiles');

-- 5. 사용자는 자신의 이미지만 삭제 가능
CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profiles');
