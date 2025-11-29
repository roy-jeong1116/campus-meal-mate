-- 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Applicants can delete their pending applications" ON matching_applications;

-- 새로운 RLS 정책: 신청자는 자신의 신청을 삭제할 수 있음 (pending 및 approved 모두)
CREATE POLICY "Applicants can delete their own applications"
  ON matching_applications
  FOR DELETE
  USING (
    auth.uid() = applicant_id
  );

-- 설명: pending 상태 제한을 제거하여 approved 상태의 매칭도 취소할 수 있도록 허용
COMMENT ON POLICY "Applicants can delete their own applications" ON matching_applications
  IS '신청자는 자신의 신청을 삭제할 수 있음 (상태 무관)';
