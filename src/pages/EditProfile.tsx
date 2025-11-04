import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    major: "",
    student_id: "",
    gender: "",
    bio: "",
  });
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newFood, setNewFood] = useState("");
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setFormData({
        name: profile.name || "",
        major: profile.major || "",
        student_id: profile.student_id || "",
        gender: profile.gender || "",
        bio: profile.bio || "",
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update(formData)
      .eq("id", user.id);

    if (error) {
      toast({
        title: "프로필 수정 실패",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "프로필이 수정되었습니다",
      });
      navigate("/profile");
    }
    setLoading(false);
  };

  const addFood = async () => {
    if (!user || !newFood.trim()) return;
    
    await supabase.from("food_preferences").insert({
      user_id: user.id,
      food_category: newFood.trim(),
    });
    
    setFoodPreferences([...foodPreferences, newFood.trim()]);
    setNewFood("");
  };

  const removeFood = async (food: string) => {
    if (!user) return;
    
    await supabase
      .from("food_preferences")
      .delete()
      .eq("user_id", user.id)
      .eq("food_category", food);
    
    setFoodPreferences(foodPreferences.filter(f => f !== food));
  };

  const addInterest = async () => {
    if (!user || !newInterest.trim()) return;
    
    await supabase.from("interests").insert({
      user_id: user.id,
      interest: newInterest.trim(),
    });
    
    setInterests([...interests, newInterest.trim()]);
    setNewInterest("");
  };

  const removeInterest = async (interest: string) => {
    if (!user) return;
    
    await supabase
      .from("interests")
      .delete()
      .eq("user_id", user.id)
      .eq("interest", interest);
    
    setInterests(interests.filter(i => i !== interest));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">프로필 수정</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6">
        <Card className="border-border mb-6">
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">전공</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_id">학번</Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  onChange={(e) =>
                    setFormData({ ...formData, student_id: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">성별</Label>
                <Input
                  id="gender"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">자기소개</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="min-h-24"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "저장 중..." : "저장"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border mb-6">
          <CardHeader>
            <CardTitle>선호 음식</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {foodPreferences.map((food) => (
                <Badge
                  key={food}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeFood(food)}
                >
                  {food} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="음식 카테고리 입력"
                value={newFood}
                onChange={(e) => setNewFood(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFood())}
              />
              <Button type="button" onClick={addFood}>추가</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>관심사</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeInterest(interest)}
                >
                  {interest} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="관심사 입력"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
              />
              <Button type="button" onClick={addInterest}>추가</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
