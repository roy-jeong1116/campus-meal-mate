-- matchings 테이블의 host_id 외래키를 public.users로 변경

-- 1. 기존 외래키 제약조건 삭제
ALTER TABLE matchings
DROP CONSTRAINT IF EXISTS matchings_host_id_fkey;

-- 2. 새로운 외래키 제약조건 추가 (public.users 참조)
ALTER TABLE matchings
ADD CONSTRAINT matchings_host_id_fkey
FOREIGN KEY (host_id)
REFERENCES users(id)
ON DELETE CASCADE;
