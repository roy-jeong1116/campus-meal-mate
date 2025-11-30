import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import RestaurantCard from "@/components/RestaurantCard";
import { supabase, Restaurant } from "@/lib/supabase";
import { toast } from "sonner";

const Restaurants = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Supabase에서 식당 데이터 가져오기
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('name');

        if (error) throw error;
        setRestaurants(data || []);
      } catch (err) {
        console.error('식당 데이터 로딩 에러:', err);
        toast.error('식당 목록을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // 검색 필터링
  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return restaurants;

    const query = searchQuery.toLowerCase();
    return restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.category.toLowerCase().includes(query) ||
      (restaurant.address && restaurant.address.toLowerCase().includes(query)) ||
      (restaurant.description && restaurant.description.toLowerCase().includes(query))
    );
  }, [searchQuery, restaurants]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-[#FF6B35] to-[#FF8A65] shadow-lg">
        <div className="max-w-lg mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold mb-4 text-white">학교 근처 맛집</h1>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="맛집 이름이나 음식 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white border-white/20 focus-visible:ring-white/50"
              />
            </div>
            <Button
              size="icon"
              className="h-12 w-12 shrink-0 bg-white hover:bg-white/90 text-[#FF6B35]"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-lg mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            총 {filteredRestaurants.length}개의 맛집
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-2">
              {searchQuery ? '검색 결과가 없습니다' : '등록된 식당이 없습니다'}
            </p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                다른 검색어로 시도해보세요
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                imageUrl={restaurant.image_urls?.[0]}
                name={restaurant.name}
                category={restaurant.category}
                address={restaurant.address}
                phoneNumber={restaurant.phone_number}
              />
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Restaurants;
