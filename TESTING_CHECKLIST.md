# 🧪 프로필 이미지 테스트 체크리스트

## 📋 사전 준비

### 1. Supabase 설정 확인

#### Storage 버킷 생성
Supabase Dashboard → SQL Editor에서 실행:
```sql
-- supabase/create-storage-bucket.sql 파일 내용 실행
```

#### Storage RLS 정책 설정
```sql
-- supabase/storage-rls.sql 파일 내용 실행
```

#### 테이블 RLS 정책 확인
```sql
-- supabase/fix-rls.sql 파일이 실행되었는지 확인
-- auth.uid() 사용하고 있는지 확인
```

### 2. 환경 변수 확인
`.env` 파일에 다음 값들이 올바르게 설정되어 있는지 확인:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🧪 테스트 시나리오

### 테스트 1: Storage 버킷 확인
1. Supabase Dashboard 접속
2. **Storage** 메뉴 클릭
3. `profiles` 버킷이 존재하는지 확인
4. 버킷 설정에서 **Public** 체크박스가 활성화되어 있는지 확인

**✅ 성공 기준**: `profiles` 버킷이 public으로 설정됨

---

### 테스트 2: 회원가입 (프로필 이미지 없이)
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 열기
3. `/register` 페이지 접속
4. Step 1: 필수 정보 입력
   - 이메일: `test1@test.com`
   - 이름: `테스트유저1`
   - 비밀번호: `test123456`
5. **다음** 버튼 클릭
6. Step 2: **프로필 사진 업로드 없이** 회원가입 버튼 클릭

**콘솔 로그 확인**:
```
=== Register 페이지: 회원가입 시도 ===
formData: { ..., profile_image_url: "" }
=== 회원가입 시작 ===
DB에 저장할 데이터: { ..., profile_image_url: null }
프로필 저장 완료
=== 회원가입 완료 ===
```

**✅ 성공 기준**: 
- 토스트 알림: "회원가입 완료!"
- 홈 페이지로 리다이렉트
- 콘솔 에러 없음

---

### 테스트 3: 회원가입 (프로필 이미지 포함)
1. 새 브라우저 시크릿 모드 열기
2. 개발자 도구 열기 (F12)
3. `/register` 페이지 접속
4. Step 1: 필수 정보 입력
   - 이메일: `test2@test.com`
   - 이름: `테스트유저2`
   - 비밀번호: `test123456`
5. **다음** 버튼 클릭
6. Step 2: 프로필 사진 업로드
   - **프로필 사진 선택** 버튼 클릭
   - 5MB 이하의 이미지 선택
   - 미리보기 확인
7. (선택) 관심사, 선호음식 선택
8. **회원가입** 버튼 클릭

**콘솔 로그 확인**:
```
이미지 업로드 완료!
=== Register 페이지: 회원가입 시도 ===
formData: { ..., profile_image_url: "https://...supabase.co/storage/v1/object/public/profiles/..." }
프로필 이미지 URL: https://...
=== 회원가입 시작 ===
전달받은 userData: { ..., profile_image_url: "https://..." }
DB에 저장할 데이터: { ..., profile_image_url: "https://..." }
프로필 저장 완료
=== 회원가입 완료 ===
```

**✅ 성공 기준**: 
- 이미지 업로드 후 미리보기 표시됨
- 토스트 알림: "이미지 업로드 완료!" → "회원가입 완료!"
- 홈 페이지로 리다이렉트
- `profile_image_url`에 URL이 포함됨

---

### 테스트 4: 프로필 페이지에서 이미지 확인
1. 테스트 3에서 생성한 계정으로 로그인 상태 유지
2. `/profile` 페이지 접속
3. 개발자 도구 **Network** 탭 확인

**콘솔 로그 확인**:
```
Profile page mounted, current user: { ..., profile_image_url: "https://..." }
Refreshing user data on mount...
Refreshing user profile...
User profile refreshed: { ..., profile_image_url: "https://..." }
```

**Network 탭 확인**:
- 이미지 URL로 GET 요청이 가는지 확인
- 응답 상태 코드가 **200 OK**인지 확인

**✅ 성공 기준**: 
- 프로필 사진이 화면에 표시됨
- 이미지가 깨지지 않음
- 네트워크 요청이 성공 (200)

---

### 테스트 5: Supabase 데이터베이스 확인
1. Supabase Dashboard 접속
2. **Table Editor** → **users** 테이블 클릭
3. `test2@test.com` 사용자 행 찾기
4. `profile_image_url` 컬럼 값 확인

**✅ 성공 기준**: 
- `profile_image_url` 컬럼에 URL이 저장되어 있음
- URL 형식: `https://[project-ref].supabase.co/storage/v1/object/public/profiles/profile-images/temp-[timestamp].jpg`

---

### 테스트 6: Storage에 파일 존재 확인
1. Supabase Dashboard → **Storage** → **profiles** 버킷
2. `profile-images/` 폴더 열기
3. 업로드한 이미지 파일 확인

**✅ 성공 기준**: 
- `temp-[timestamp].jpg` 형식의 파일이 존재함
- 파일을 클릭하면 이미지가 표시됨

---

### 테스트 7: 프로필 수정
1. 로그인 상태에서 `/profile` 페이지 접속
2. **프로필 수정** 버튼 클릭
3. 프로필 사진 변경
   - 새로운 이미지 선택
   - 미리보기 확인
4. **저장** 버튼 클릭

**콘솔 로그 확인**:
```
Profile updated successfully
Navigating to profile page...
Refreshing user profile...
User profile refreshed: { ..., profile_image_url: "https://[new-url]" }
```

**✅ 성공 기준**: 
- 토스트 알림: "이미지 업로드 완료!" → "프로필 수정 완료!"
- 프로필 페이지로 리다이렉트
- 새로운 이미지가 표시됨

---

## 🐛 문제 해결

### 문제 1: "Storage 버킷이 생성되지 않았습니다" 에러
**원인**: `profiles` 버킷이 없음

**해결**:
```sql
-- Supabase SQL Editor에서 실행
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;
```

---

### 문제 2: 이미지 업로드는 되는데 조회 안됨 (403 에러)
**원인**: Storage RLS 정책 문제

**해결**:
1. Supabase Dashboard → **Storage** → **profiles** → **Policies**
2. 다음 정책이 있는지 확인:
   - "Anyone can view profile images" (SELECT)
   - "Authenticated users can upload profile images" (INSERT)
   - "Anon users can upload profile images" (INSERT)

없다면 `supabase/storage-rls.sql` 실행

---

### 문제 3: 데이터베이스에 URL이 저장 안됨
**원인**: `profile_image_url` 필드가 전달되지 않음

**확인**:
1. 콘솔에서 `formData` 확인
2. `userData` 확인
3. `insertData` 확인

**해결**: 이미 코드에 구현되어 있으므로 브라우저 새로고침 후 재시도

---

### 문제 4: 프로필 페이지에 이미지가 표시 안됨
**원인**: 
- 이미지 URL이 잘못됨
- 캐시 문제
- RLS 정책 문제

**확인**:
1. Network 탭에서 응답 코드 확인
   - **200**: 정상 (이미지 렌더링 문제)
   - **403**: RLS 정책 문제
   - **404**: 파일이 존재하지 않음
2. URL을 새 탭에서 직접 열어보기

**해결**:
- 403: Storage RLS 정책 재설정
- 404: Storage에 파일이 실제로 업로드되었는지 확인
- 200: 브라우저 캐시 삭제 후 재시도

---

## 📊 최종 체크리스트

- [ ] Storage 버킷 `profiles` 생성됨
- [ ] Storage 버킷이 public으로 설정됨
- [ ] Storage RLS 정책 설정됨 (anon 업로드 포함)
- [ ] 회원가입 시 프로필 사진 업로드 성공
- [ ] 데이터베이스에 `profile_image_url` 저장됨
- [ ] Storage에 이미지 파일 업로드됨
- [ ] 프로필 페이지에서 이미지 표시됨
- [ ] 프로필 수정으로 이미지 변경 가능
- [ ] 콘솔 에러 없음
- [ ] 네트워크 에러 없음 (403, 404 등)

---

## 🎯 다음 단계

모든 테스트가 통과되면:
1. 콘솔 로그 제거 (프로덕션 환경)
2. 에러 처리 강화
3. 이미지 최적화 (리사이징, 압축)
4. 프로필 사진 삭제 기능 추가
5. 기본 아바타 이미지 개선
