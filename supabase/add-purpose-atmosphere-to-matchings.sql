-- matchings 테이블에 purpose(매칭 목적)와 atmosphere(선호 분위기) 컬럼 추가
-- preferred_foods 컬럼은 제거 (더 이상 사용하지 않음)

-- 1. purpose 컬럼 추가 (매칭 목적)
ALTER TABLE matchings
ADD COLUMN purpose TEXT[];

-- 2. atmosphere 컬럼 추가 (선호 분위기)
ALTER TABLE matchings
ADD COLUMN atmosphere TEXT[];

-- 3. preferred_foods 컬럼 제거
ALTER TABLE matchings
DROP COLUMN preferred_foods;

-- 4. 코멘트 추가
COMMENT ON COLUMN matchings.purpose IS '매칭 목적: 친목/밥친구 찾기, 스터디/공부, 프로젝트/팀플, 동아리 모임, 선후배 만남, 진로/고민 상담, 운동 메이트, 취미 공유, 자유';
COMMENT ON COLUMN matchings.atmosphere IS '선호 분위기: 조용한, 활발한, 편안한, 자유로운';
