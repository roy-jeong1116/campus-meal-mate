import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import RestaurantCard from "@/components/RestaurantCard";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Restaurants = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [restaurants, setRestaurants] = useState<any[]>([]);

  useEffect(() => {
    loadRestaurants();
  }, [searchQuery, categoryFilter, priceFilter]);

  const loadRestaurants = async () => {
    let query = supabase
      .from("restaurants")
      .select(`
        *,
        matches (count)
      `)
      .order("rating", { ascending: false });

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
    }

    if (categoryFilter) {
      query = query.eq("category", categoryFilter);
    }

    const { data } = await query;

    if (data) {
      setRestaurants(data.map(r => ({
        ...r,
        availableMatches: r.matches?.[0]?.count || 0
      })));
    }
  };

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
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-12 w-12 shrink-0 border-border"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>필터</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label>카테고리</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="전체" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">전체</SelectItem>
                        <SelectItem value="한식">한식</SelectItem>
                        <SelectItem value="일식">일식</SelectItem>
                        <SelectItem value="중식">중식</SelectItem>
                        <SelectItem value="양식">양식</SelectItem>
                        <SelectItem value="분식">분식</SelectItem>
                        <SelectItem value="치킨">치킨</SelectItem>
                        <SelectItem value="카페">카페</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setCategoryFilter("");
                      setPriceFilter("");
                    }}
                  >
                    필터 초기화
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
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
