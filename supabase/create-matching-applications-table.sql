-- matching_applications 테이블 생성
-- 매칭 신청 및 승인/거절을 관리하는 테이블

CREATE TABLE IF NOT EXISTS matching_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matching_id UUID NOT NULL REFERENCES matchings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT, -- 신청 메시지 (선택)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 같은 사람이 같은 매칭에 중복 신청 불가
  UNIQUE(matching_id, applicant_id)
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX idx_matching_applications_matching_id ON matching_applications(matching_id);
CREATE INDEX idx_matching_applications_applicant_id ON matching_applications(applicant_id);
CREATE INDEX idx_matching_applications_status ON matching_applications(status);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_matching_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_matching_applications_updated_at
  BEFORE UPDATE ON matching_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_matching_applications_updated_at();

-- RLS (Row Level Security) 활성화
ALTER TABLE matching_applications ENABLE ROW LEVEL SECURITY;

-- RLS 정책 1: 신청자는 자신의 신청을 볼 수 있음
CREATE POLICY "Users can view their own applications"
  ON matching_applications
  FOR SELECT
  USING (auth.uid() = applicant_id);

-- RLS 정책 2: 매칭 호스트는 자신의 매칭에 대한 모든 신청을 볼 수 있음
CREATE POLICY "Hosts can view applications for their matchings"
  ON matching_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matchings
      WHERE matchings.id = matching_applications.matching_id
      AND matchings.host_id = auth.uid()
    )
  );

-- RLS 정책 3: 로그인한 사용자는 신청을 생성할 수 있음
CREATE POLICY "Authenticated users can create applications"
  ON matching_applications
  FOR INSERT
  WITH CHECK (
    auth.uid() = applicant_id
    AND auth.uid() IS NOT NULL
  );

-- RLS 정책 4: 매칭 호스트만 신청 상태를 업데이트할 수 있음 (승인/거절)
CREATE POLICY "Hosts can update application status"
  ON matching_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM matchings
      WHERE matchings.id = matching_applications.matching_id
      AND matchings.host_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matchings
      WHERE matchings.id = matching_applications.matching_id
      AND matchings.host_id = auth.uid()
    )
  );

-- RLS 정책 5: 신청자는 pending 상태인 자신의 신청을 삭제할 수 있음 (신청 취소)
CREATE POLICY "Applicants can delete their pending applications"
  ON matching_applications
  FOR DELETE
  USING (
    auth.uid() = applicant_id
    AND status = 'pending'
  );

-- 코멘트 추가
COMMENT ON TABLE matching_applications IS '매칭 신청 정보를 저장하는 테이블';
COMMENT ON COLUMN matching_applications.status IS '신청 상태: pending(대기), approved(승인), rejected(거절)';
COMMENT ON COLUMN matching_applications.message IS '신청자가 작성한 메시지';
