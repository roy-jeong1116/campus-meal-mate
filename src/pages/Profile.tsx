import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    const { data: foods } = await supabase
      .from("food_preferences")
      .select("food_category")
      .eq("user_id", user.id);
    
    if (foods) {
      setFoodPreferences(foods.map(f => f.food_category));
    }

    const { data: interestsData } = await supabase
      .from("interests")
      .select("interest")
      .eq("user_id", user.id);
    
    if (interestsData) {
      setInterests(interestsData.map(i => i.interest));
    }
  };

  if (!profile) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">로딩 중...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary pt-12 pb-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">{profile.name[0]}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{profile.name}</h1>
          <p className="text-white/90">{profile.major} {profile.student_id}</p>
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
                  <span className="text-2xl font-bold text-foreground">{profile.rating?.toFixed(1) || "0.0"}</span>
                </div>
                <p className="text-xs text-muted-foreground">평점</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground mb-1">{profile.match_count || 0}</p>
                <p className="text-xs text-muted-foreground">매칭 횟수</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{profile.total_ratings || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">받은 평가</p>
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
                {foodPreferences.length > 0 ? (
                  foodPreferences.map((food) => (
                    <Badge key={food} variant="secondary">{food}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">선호 음식을 추가해보세요</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">관심사</h3>
              <div className="flex gap-2 flex-wrap">
                {interests.length > 0 ? (
                  interests.map((interest) => (
                    <Badge key={interest} variant="secondary">{interest}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">관심사를 추가해보세요</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">자기소개</h3>
              <p className="text-sm text-foreground">
                {profile.bio || "자기소개를 작성해보세요"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Button 
          variant="outline" 
          className="w-full mb-6 border-border"
          onClick={() => navigate("/profile/edit")}
        >
          프로필 수정
        </Button>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;
