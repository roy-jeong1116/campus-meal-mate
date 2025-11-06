import { Star, MapPin, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary pt-12 pb-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">김</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">김민수</h1>
          <p className="text-white/90">컴퓨터공학과 21학번</p>
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
                  <span className="text-2xl font-bold text-foreground">4.8</span>
                </div>
                <p className="text-xs text-muted-foreground">평점</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground mb-1">12</p>
                <p className="text-xs text-muted-foreground">매칭 횟수</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">3</span>
                </div>
                <p className="text-xs text-muted-foreground">뱃지</p>
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
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">선호 음식</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">한식</Badge>
                <Badge variant="secondary">일식</Badge>
                <Badge variant="secondary">분식</Badge>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">관심사</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">프로그래밍</Badge>
                <Badge variant="secondary">독서</Badge>
                <Badge variant="secondary">운동</Badge>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">자기소개</h3>
              <p className="text-sm text-foreground">
                안녕하세요! 같이 맛있는 음식 먹으면서 즐겁게 대화 나누고 싶습니다.
                다양한 분야에 관심이 많아요 😊
              </p>
            </div>
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

        <Button 
          variant="outline" 
          className="w-full mb-6 border-border"
        >
          프로필 수정
        </Button>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;
