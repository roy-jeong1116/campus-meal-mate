import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Save, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    student_id: '',
    major: '',
    gender: '',
    phone_number: '',
    profile_image_url: '',
    interests: [] as string[],
    preferred_foods: [] as string[],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    
    if (user) {
      setFormData({
        name: user.name || '',
        student_id: user.student_id || '',
        major: user.major || '',
        gender: user.gender || '',
        phone_number: user.phone_number || '',
        profile_image_url: user.profile_image_url || '',
        interests: user.interests || [],
        preferred_foods: user.preferred_foods || [],
      });
      setPreviewImage(user.profile_image_url || null);
    }
  }, [user, authLoading, navigate]);

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기가 너무 큽니다', {
        description: '5MB 이하의 이미지를 선택해주세요.',
        duration: 3000,
      });
      return;
    }

    // 파일 타입 체크
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
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        if (uploadError.message.includes('not found')) {
          throw new Error('Storage 버킷이 생성되지 않았습니다. 관리자에게 문의하세요.');
        }
        throw uploadError;
      }

      // Public URL 가져오기
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);

    try {
      console.log('Updating user profile with:', {
        phone_number: formData.phone_number,
        profile_image_url: formData.profile_image_url,
        interests: formData.interests,
        preferred_foods: formData.preferred_foods,
      });

      const { error } = await supabase
        .from('users')
        .update({
          phone_number: formData.phone_number,
          profile_image_url: formData.profile_image_url,
          interests: formData.interests,
          preferred_foods: formData.preferred_foods,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Profile updated successfully');

      toast.success('프로필 수정 완료!', {
        description: '프로필이 성공적으로 업데이트되었습니다.',
        duration: 2000,
      });

      // 약간의 지연 후 사용자 정보 새로고침 및 페이지 이동
      setTimeout(async () => {
        await refreshUser();
        navigate('/profile');
      }, 500);
    } catch (err: any) {
      toast.error('프로필 수정 실패', {
        description: err.message || '다시 시도해주세요.',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const interestOptions = ['운동', '게임', '영화', '음악', '독서', '여행', '요리', '사진'];
  const foodOptions = ['한식', '중식', '일식', '양식', '분식', '치킨', '피자', '카페'];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">프로필 수정</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 프로필 사진 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>프로필 사진</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                  {previewImage ? (
                    <img src={previewImage} alt="프로필" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                {previewImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    {uploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        사진 선택
                      </>
                    )}
                  </div>
                </Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                JPG, PNG, GIF (최대 5MB)
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">이름은 변경할 수 없습니다.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student_id">입학년도</Label>
                  <Select
                    value={formData.student_id}
                    disabled
                  >
                    <SelectTrigger className="bg-muted cursor-not-allowed">
                      <SelectValue placeholder="학번 선택" />
                    </SelectTrigger>
                  </Select>
                  <p className="text-xs text-muted-foreground">입학년도는 변경할 수 없습니다.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="major">소속 대학</Label>
                  <Select
                    value={formData.major}
                    disabled
                  >
                    <SelectTrigger className="bg-muted cursor-not-allowed">
                      <SelectValue placeholder="대학을 선택하세요" />
                    </SelectTrigger>
                  </Select>
                  <p className="text-xs text-muted-foreground">소속 대학은 변경할 수 없습니다.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">성별</Label>
                  <Select
                    value={formData.gender}
                    disabled
                  >
                    <SelectTrigger className="bg-muted cursor-not-allowed">
                      <SelectValue placeholder="선택하세요" />
                    </SelectTrigger>
                  </Select>
                  <p className="text-xs text-muted-foreground">성별은 변경할 수 없습니다.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">전화번호</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="010-1234-5678"
                    value={formData.phone_number}
                    onChange={(e) => handleChange('phone_number', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>관심사 & 선호</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>관심사</Label>
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
              </div>

              <div className="space-y-2">
                <Label>선호 음식</Label>
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
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex-1"
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <Navigation />
    </div>
  );
};

export default EditProfile;
