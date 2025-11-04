import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, DollarSign, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Restaurant {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  distance: string;
  price_range: string;
  image_url: string;
  rating: number;
  total_reviews: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    name: string;
  };
}

interface Match {
  id: string;
  title: string;
  meet_date: string;
  meet_time: string;
  current_participants: number;
  max_participants: number;
  status: string;
  profiles: {
    name: string;
    major: string;
    student_id: string;
  };
}

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRestaurantData();
  }, [id]);

  const loadRestaurantData = async () => {
    if (!id) return;

    const { data: restaurantData } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single();

    if (restaurantData) {
      setRestaurant(restaurantData);
    }

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select(`
        *,
        profiles (name)
      `)
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false });

    if (reviewsData) {
      setReviews(reviewsData as Review[]);
    }

    const { data: matchesData } = await supabase
      .from("matches")
      .select(`
        *,
        profiles (name, major, student_id)
      `)
      .eq("restaurant_id", id)
      .eq("status", "active")
      .order("meet_date", { ascending: true });

    if (matchesData) {
      setMatches(matchesData as Match[]);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "리뷰를 작성하려면 로그인해주세요.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      restaurant_id: id,
      user_id: user.id,
      rating,
      comment,
    });

    if (error) {
      toast({
        title: "리뷰 작성 실패",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "리뷰가 등록되었습니다",
      });
      setComment("");
      loadRestaurantData();
    }
    setLoading(false);
  };

  if (!restaurant) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">로딩 중...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative h-64">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-card/80 hover:bg-card"
          onClick={() => navigate("/restaurants")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-6">
        <Card className="border-border mb-6">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="font-semibold text-foreground">{restaurant.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({restaurant.total_reviews})</span>
              </div>
              <span className="text-sm text-muted-foreground">{restaurant.category}</span>
            </div>
            <p className="text-foreground mb-4">{restaurant.description}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{restaurant.price_range}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="reviews">리뷰</TabsTrigger>
            <TabsTrigger value="matches">매칭</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-4">
            {user && (
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">리뷰 작성</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        별점
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= rating
                                  ? "fill-primary text-primary"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        리뷰 내용
                      </label>
                      <Textarea
                        placeholder="이 맛집에 대한 의견을 남겨주세요..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-24"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={loading}
                    >
                      리뷰 등록
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {reviews.map((review) => (
              <Card key={review.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{review.profiles.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium text-foreground">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-2">{review.comment}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}

            {reviews.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                아직 리뷰가 없습니다. 첫 리뷰를 남겨보세요!
              </p>
            )}
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            {matches.map((match) => (
              <Card key={match.id} className="border-border">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">{match.title}</h3>
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {match.meet_date} {match.meet_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {match.current_participants}/{match.max_participants}명
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    주최자: {match.profiles.name} ({match.profiles.major} {match.profiles.student_id})
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => navigate(`/matching`)}
                  >
                    매칭 보기
                  </Button>
                </CardContent>
              </Card>
            ))}

            {matches.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                진행 중인 매칭이 없습니다.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantDetail;
