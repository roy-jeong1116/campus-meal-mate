-- Supabase Storage 버킷 생성 및 정책 설정
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 모든 사용자가 프로필 이미지를 볼 수 있도록 설정
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- 3. 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
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
