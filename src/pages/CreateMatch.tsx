import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Users, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Restaurant {
  id: string;
  name: string;
}

const CreateMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurant_id: "",
    title: "",
    description: "",
    meet_date: "",
    meet_time: "",
    max_participants: "4",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadRestaurants();
  }, [user]);

  const loadRestaurants = async () => {
    const { data } = await supabase
      .from("restaurants")
      .select("id, name")
      .order("name");
    
    if (data) {
      setRestaurants(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const { error } = await supabase.from("matches").insert({
      ...formData,
      organizer_id: user.id,
      max_participants: parseInt(formData.max_participants),
    });

    if (error) {
      toast({
        title: "매칭 생성 실패",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "매칭이 생성되었습니다",
      });
      navigate("/matching");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/matching")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">매칭 만들기</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              새로운 식사 매칭
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="restaurant">맛집 선택</Label>
                <Select
                  value={formData.restaurant_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, restaurant_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="맛집을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="예: 점심 같이 드실 분!"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명 (선택)</Label>
                <Textarea
                  id="description"
                  placeholder="매칭에 대한 설명을 입력하세요..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meet_date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    날짜
                  </Label>
                  <Input
                    id="meet_date"
                    type="date"
                    value={formData.meet_date}
                    onChange={(e) =>
                      setFormData({ ...formData, meet_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meet_time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    시간
                  </Label>
                  <Input
                    id="meet_time"
                    type="time"
                    value={formData.meet_time}
                    onChange={(e) =>
                      setFormData({ ...formData, meet_time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  최대 인원
                </Label>
                <Select
                  value={formData.max_participants}
                  onValueChange={(value) =>
                    setFormData({ ...formData, max_participants: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}명
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "생성 중..." : "매칭 만들기"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateMatch;
