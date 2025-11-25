import { Star, Calendar, Award, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('로그아웃되었습니다.', {
        description: '다음에 또 만나요!',
        duration: 2000,
      });
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      toast.error('로그아웃 실패', {
        description: '다시 시도해주세요.',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // 페이지 마운트 시 사용자 정보 새로고침
  useEffect(() => {
    console.log('Profile page mounted, current user:', user);
    if (user) {
      console.log('Refreshing user data on mount...');
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 한 번만 실행

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary pt-12 pb-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-background">
            {user.profile_image_url ? (
              <img 
                src={user.profile_image_url} 
                alt={user.name} 
                className="w-full h-full object-cover"
                key={user.profile_image_url} // 이미지 캐시 방지
              />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {user.name.charAt(0)}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{user.name}</h1>
          <p className="text-white/90">
            {user.major ? `${user.major} ` : ''}
            {user.student_id || ''}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-12">
        {/* Stats Card */}
        <Card className="mb-6 border-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="text-2xl font-bold text-foreground">
                    {user.average_rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">평점</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {user.rating_count || 0}
                </p>
                <p className="text-xs text-muted-foreground">평가 수</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">
                    {user.interests?.length || 0}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">관심사</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Card */}
        <Card className="mb-6 border-border">
          <CardHeader>
            <CardTitle className="text-foreground">프로필 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.preferred_foods && user.preferred_foods.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">선호 음식</h3>
                <div className="flex gap-2 flex-wrap">
                  {user.preferred_foods.map((food) => (
                    <Badge key={food} variant="secondary">{food}</Badge>
                  ))}
                </div>
              </div>
            )}
            {user.interests && user.interests.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">관심사</h3>
                <div className="flex gap-2 flex-wrap">
                  {user.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}
            {(!user.preferred_foods || user.preferred_foods.length === 0) && 
             (!user.interests || user.interests.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                프로필 정보를 추가해보세요!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="mb-6 border-border">
          <CardHeader>
            <CardTitle className="text-foreground">최근 활동</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">치킨 앤 베어</p>
                <p className="text-xs text-muted-foreground">2025년 1월 10일</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium text-foreground">5.0</span>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">건강한 비빔밥</p>
                <p className="text-xs text-muted-foreground">2025년 1월 8일</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium text-foreground">4.8</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">라면 하우스</p>
                <p className="text-xs text-muted-foreground">2025년 1월 5일</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium text-foreground">4.5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Link to="/profile/edit">
          <Button
            variant="outline"
            className="w-full mb-3 border-border"
          >
            프로필 수정
          </Button>
        </Link>

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full mb-6 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </Button>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;
