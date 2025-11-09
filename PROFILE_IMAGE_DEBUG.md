# 프로필 이미지 업로드 디버깅 가이드

## 🐛 문제 해결 완료

### ✅ 수정 사항
1. **AuthContext.tsx**: `signUp` 함수에 `profile_image_url` 추가
2. **콘솔 로그 추가**: 데이터 흐름 추적 가능

---

## 🧪 테스트 방법

### 1. 브라우저 개발자 도구 열기
- Chrome/Edge: `F12` 또는 `Cmd+Option+I` (Mac)
- **Console 탭** 선택

### 2. 회원가입 테스트
1. `/register` 페이지로 이동
2. **Step 1**: 필수 정보 입력 (이메일, 이름, 비밀번호)
3. **Step 2**: 프로필 사진 업로드
   - "프로필 사진 선택" 버튼 클릭
   - 이미지 파일 선택
   - ✅ "이미지 업로드 완료!" 토스트 확인
4. 회원가입 완료 버튼 클릭

### 3. 콘솔에서 확인할 내용

```
=== Register 페이지: 회원가입 시도 ===
formData: { 
  email: "...", 
  name: "...", 
  profile_image_url: "https://qagvdbezugotepoiflvw.supabase.co/storage/v1/object/public/profiles/..." // ← 이 값이 있어야 함!
}

=== 회원가입 시작 ===
전달받은 userData: { 
  profile_image_url: "https://..." // ← 여기도 있어야 함!
}

Auth 사용자 생성 완료: abc-123-def...

DB에 저장할 데이터: {
  id: "...",
  email: "...",
  name: "...",
  profile_image_url: "https://..." // ← 여기도 확인!
}

프로필 저장 완료
=== 회원가입 완료 ===
```

### 4. 프로필 페이지 확인
- `/profile` 페이지로 자동 이동
- 프로필 사진이 표시되는지 확인

---

## ❗ 만약 프로필 사진이 안 보인다면

### A. 콘솔에서 체크할 것
1. `profile_image_url` 값이 `null` 또는 빈 문자열인가?
   - → 이미지 업로드 실패
   - → Storage RLS 정책 확인 필요

2. `profile_image_url`에 URL이 있는데 이미지가 안 보이는가?
   - → 브라우저 개발자 도구 → Network 탭
   - → 이미지 URL 요청 실패 확인 (403, 404 등)
   - → Storage 버킷이 public인지 확인

### B. Supabase 대시보드 확인
1. **Table Editor** → `users` 테이블
2. 방금 가입한 사용자 행 찾기
3. `profile_image_url` 컬럼 값 확인
   - 값이 있다 → 프론트엔드 문제
   - 값이 없다 → 백엔드/RLS 문제

4. **Storage** → `profiles` 버킷
5. 업로드된 이미지 파일 확인
   - 파일이 있다 → URL 생성 문제
   - 파일이 없다 → 업로드 실패

### C. Storage RLS 정책 확인
```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM storage.objects WHERE bucket_id = 'profiles';
```

파일이 보이지 않으면 `storage-rls.sql` 다시 실행

---

## 🎯 정상 작동 시 기대 결과

1. ✅ 회원가입 시 프로필 사진 업로드
2. ✅ Supabase Storage에 파일 저장
3. ✅ `users` 테이블에 `profile_image_url` 저장
4. ✅ 프로필 페이지에서 이미지 표시
5. ✅ 프로필 수정 페이지에서 기존 이미지 표시

---

## 📞 여전히 안 되면

콘솔 로그 전체 복사해서 공유해주세요:
- Register 페이지 로그
- AuthContext 로그
- 네트워크 에러 (있다면)
