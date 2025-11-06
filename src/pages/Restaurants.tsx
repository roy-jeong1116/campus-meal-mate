import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import RestaurantCard from "@/components/RestaurantCard";
import food1 from "@/assets/food-1.jpg";
import food2 from "@/assets/food-2.jpg";
import food3 from "@/assets/food-3.jpg";

const Restaurants = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const restaurants = [
    {
      id: 1,
      image: food1,
      name: "매운 떡볶이 김밥",
      category: "분식",
      rating: 4.8,
      distance: "학교 정문 50m",
      priceRange: "5,000원 ~ 8,000원",
      availableMatches: 3,
    },
    {
      id: 2,
      image: food2,
      name: "건강한 비빔밥",
      category: "한식",
      rating: 4.9,
      distance: "학교 후문 100m",
      priceRange: "8,000원 ~ 12,000원",
      availableMatches: 5,
    },
    {
      id: 3,
      image: food3,
      name: "라면 하우스",
      category: "일식",
      rating: 4.7,
      distance: "학교 정문 200m",
      priceRange: "6,000원 ~ 10,000원",
      availableMatches: 2,
    },
    {
      id: 4,
      image: food1,
      name: "치킨 앤 베어",
      category: "치킨",
      rating: 4.6,
      distance: "학교 정문 150m",
      priceRange: "15,000원 ~ 20,000원",
      availableMatches: 4,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold mb-4 text-foreground">학교 근처 맛집</h1>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="맛집 이름이나 음식 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-border"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              className="h-12 w-12 shrink-0 border-border"
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
            총 {restaurants.length}개의 맛집
          </p>
        </div>
        
        <div className="grid gap-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} {...restaurant} />
          ))}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Restaurants;
