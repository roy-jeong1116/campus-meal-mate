-- users 테이블의 필수 필드를 NOT NULL로 변경

-- 1. student_id를 NOT NULL로 변경
ALTER TABLE users
ALTER COLUMN student_id SET NOT NULL;

-- 2. major를 NOT NULL로 변경
ALTER TABLE users
ALTER COLUMN major SET NOT NULL;

-- 3. gender를 NOT NULL로 변경
ALTER TABLE users
ALTER COLUMN gender SET NOT NULL;

-- 4. phone_number를 NOT NULL로 변경
ALTER TABLE users
ALTER COLUMN phone_number SET NOT NULL;

-- 5. interests 배열이 최소 1개 이상인지 체크하는 제약조건 추가
ALTER TABLE users
ADD CONSTRAINT check_interests_not_empty
CHECK (array_length(interests, 1) >= 1);

-- 6. preferred_foods 배열이 최소 1개 이상인지 체크하는 제약조건 추가
ALTER TABLE users
ADD CONSTRAINT check_preferred_foods_not_empty
CHECK (array_length(preferred_foods, 1) >= 1);
