import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ChevronRight, ChevronLeft, Camera, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1); // 1: 필수 정보, 2: 선택 정보, 3: 완료
  const [formData, setFormData] = useState({
    // 필수 정보
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    // 선택 정보
    student_id: '',
    major: '',
    gender: '',
    phone_number: '',
    profile_image_url: '',
    interests: [] as string[],
    preferred_foods: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      // 필수 정보 유효성 검사
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
        toast.error('모든 필수 항목을 입력해주세요.', {
          description: '이메일, 이름, 비밀번호는 필수 입력 항목입니다.',
          duration: 3000,
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('비밀번호가 일치하지 않습니다.', {
          description: '비밀번호를 다시 확인해주세요.',
          duration: 3000,
        });
        return;
      }

      if (formData.password.length < 6) {
        toast.error('비밀번호는 최소 6자 이상이어야 합니다.', {
          description: '더 긴 비밀번호를 입력해주세요.',
          duration: 3000,
        });
        return;
      }

      toast.success('필수 정보 입력 완료!', {
        description: '추가 정보를 입력하거나 바로 가입할 수 있습니다.',
        duration: 2000,
      });
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Step 2 필수 정보 유효성 검사
    if (!formData.student_id) {
      toast.error('입학년도를 선택해주세요.', {
        description: '입학년도는 필수 입력 항목입니다.',
        duration: 3000,
      });
      return;
    }

    if (!formData.major) {
      toast.error('소속 대학을 선택해주세요.', {
        description: '소속 대학은 필수 입력 항목입니다.',
        duration: 3000,
      });
      return;
    }

    if (!formData.gender) {
      toast.error('성별을 선택해주세요.', {
        description: '성별은 필수 입력 항목입니다.',
        duration: 3000,
      });
      return;
    }

    if (!formData.phone_number) {
      toast.error('전화번호를 입력해주세요.', {
        description: '전화번호는 필수 입력 항목입니다.',
        duration: 3000,
      });
      return;
    }

    // 관심사 최소 1개 검증
    if (formData.interests.length === 0) {
      toast.error('관심사를 최소 1개 이상 선택해주세요.', {
        description: '매칭을 위해 관심사를 선택해주세요.',
        duration: 3000,
      });
      return;
    }

    // 선호 음식 최소 1개 검증
    if (formData.preferred_foods.length === 0) {
      toast.error('선호 음식을 최소 1개 이상 선택해주세요.', {
        description: '매칭을 위해 선호 음식을 선택해주세요.',
        duration: 3000,
      });
      return;
    }

    console.log('=== Register 페이지: 회원가입 시도 ===');
    console.log('formData:', formData);

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      console.log('signUp에 전달할 userData:', userData);
      console.log('프로필 이미지 URL:', userData.profile_image_url);

      await signUp(formData.email, formData.password, userData);

      toast.success('회원가입 완료!', {
        description: '환영합니다! 캠퍼스 밀메이트를 시작하세요.',
        duration: 2000,
      });
      navigate('/');
    } catch (err: any) {
      console.error('Register 페이지 에러:', err);
      toast.error('회원가입 실패', {
        description: err.message || '다시 시도해주세요.',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (field: 'interests' | 'preferred_foods', item: string) => {
    const currentArray = formData[field];
    if (currentArray.includes(item)) {
      handleChange(field, currentArray.filter(i => i !== item));
    } else {
      handleChange(field, [...currentArray, item]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기가 너무 큽니다', {
        description: '5MB 이하의 이미지를 선택해주세요.',
        duration: 3000,
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다', {
        description: 'JPG, PNG, GIF 등의 이미지 파일을 선택해주세요.',
        duration: 3000,
      });
      return;
    }

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `temp-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        if (uploadError.message.includes('not found')) {
          throw new Error('Storage 버킷이 생성되지 않았습니다. 프로필 사진은 나중에 추가할 수 있습니다.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setPreviewImage(publicUrl);
      handleChange('profile_image_url', publicUrl);

      toast.success('이미지 업로드 완료!', {
        description: '프로필 사진이 업로드되었습니다.',
        duration: 2000,
      });
    } catch (err: any) {
      console.error('이미지 업로드 에러:', err);
      toast.error('이미지 업로드 실패', {
        description: err.message || '다시 시도해주세요.',
        duration: 4000,
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    handleChange('profile_image_url', '');
  };

  const interestOptions = [
    '헬스/운동', '러닝', '축구/농구', '등산', '요가/필라테스',
    '영화/드라마', '음악/공연', '전시/미술관', '사진/영상',
    '독서', '외국어', '코딩/개발',
    '게임', '요리/베이킹', '카페투어', '여행', '쇼핑', '패션/뷰티'
  ];
  const foodOptions = ['한식', '중식', '일식', '양식', '분식', '치킨', '피자', '카페'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
            <div className="flex gap-2">
              <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
            </div>
          </div>
          <CardDescription>
            {step === 1 ? '필수 정보를 입력해주세요' : '추가 정보를 입력해주세요'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Step 1: 필수 정보 */}
            {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
              <div className="space-y-2">
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@university.ac.kr"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="최소 6자 이상"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                />
              </div>
            </div>
          )}

            {/* Step 2: 선택 정보 */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                {/* 프로필 사진 */}
                <div className="flex flex-col items-center space-y-4 pb-4 border-b">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                      {previewImage ? (
                        <img src={previewImage} alt="프로필" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    {previewImage && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="profile-image-register" className="cursor-pointer">
                      <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                        {uploadingImage ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            업로드 중...
                          </>
                        ) : (
                          <>
                            <Camera className="mr-2 h-3 w-3" />
                            프로필 사진 선택
                          </>
                        )}
                      </div>
                    </Label>
                    <Input
                      id="profile-image-register"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student_id">입학년도 *</Label>
                    <Select
                      value={formData.student_id}
                      onValueChange={(value) => handleChange('student_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="학번 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25학번">25학번</SelectItem>
                        <SelectItem value="24학번">24학번</SelectItem>
                        <SelectItem value="23학번">23학번</SelectItem>
                        <SelectItem value="22학번">22학번</SelectItem>
                        <SelectItem value="21학번">21학번</SelectItem>
                        <SelectItem value="20학번">20학번</SelectItem>
                        <SelectItem value="19학번">19학번</SelectItem>
                        <SelectItem value="18학번">18학번</SelectItem>
                        <SelectItem value="17학번 이전">17학번 이전</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="major">소속 대학 *</Label>
                    <Select
                      value={formData.major}
                      onValueChange={(value) => handleChange('major', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="대학을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="인문대학">인문대학</SelectItem>
                        <SelectItem value="자연과학대학">자연과학대학</SelectItem>
                        <SelectItem value="법과대학">법과대학</SelectItem>
                        <SelectItem value="사회과학대학">사회과학대학</SelectItem>
                        <SelectItem value="경제통상대학">경제통상대학</SelectItem>
                        <SelectItem value="경영대학">경영대학</SelectItem>
                        <SelectItem value="공과대학">공과대학</SelectItem>
                        <SelectItem value="IT대학">IT대학</SelectItem>
                        <SelectItem value="융합특성화자유전공학부">융합특성화자유전공학부</SelectItem>
                        <SelectItem value="베어드교양대학">베어드교양대학</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">성별 *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="남성">남성</SelectItem>
                        <SelectItem value="여성">여성</SelectItem>
                        <SelectItem value="기타">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">전화번호 *</Label>
                    <Input
                      id="phone_number"
                      type="tel"
                      placeholder="010-1234-5678"
                      value={formData.phone_number}
                      onChange={(e) => handleChange('phone_number', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    관심사 *
                    <span className="text-xs text-muted-foreground ml-2">(최소 1개 선택)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => (
                      <Badge
                        key={interest}
                        variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => toggleArrayItem('interests', interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  {formData.interests.length > 0 && (
                    <p className="text-xs text-green-600">✓ {formData.interests.length}개 선택됨</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    선호 음식 *
                    <span className="text-xs text-muted-foreground ml-2">(최소 1개 선택)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {foodOptions.map((food) => (
                      <Badge
                        key={food}
                        variant={formData.preferred_foods.includes(food) ? 'default' : 'outline'}
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => toggleArrayItem('preferred_foods', food)}
                      >
                        {food}
                      </Badge>
                    ))}
                  </div>
                  {formData.preferred_foods.length > 0 && (
                    <p className="text-xs text-green-600">✓ {formData.preferred_foods.length}개 선택됨</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="flex gap-2 w-full">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="flex-1"
                  disabled={loading}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  이전
                </Button>
              )}
              
              {step === 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1"
                >
                  다음
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      가입 중...
                    </>
                  ) : (
                    '회원가입 완료'
                  )}
                </Button>
              )}
            </div>

            <div className="text-sm text-center text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-orange-600 hover:underline font-semibold">
                로그인
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
