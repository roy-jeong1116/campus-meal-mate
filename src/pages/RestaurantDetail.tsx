import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Phone, Clock, Eye, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import { supabase, Restaurant, formatOpeningHours, getPriceRangeText, OpeningHours } from '@/lib/supabase';
import { toast } from 'sonner';

// 영업 상태를 판단하는 헬퍼 함수
const getOperatingStatus = (openingHours?: OpeningHours): { isOpen: boolean; message: string } => {
  if (!openingHours) {
    return { isOpen: false, message: '영업 정보 없음' };
  }

  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()] as keyof OpeningHours;
  const currentTime = now.getHours() * 60 + now.getMinutes(); // 분 단위로 변환

  const todayHours = openingHours[currentDay];

  if (!todayHours || ('closed' in todayHours && todayHours.closed)) {
    // 오늘 휴무인 경우, 다음 영업일 찾기
    for (let i = 1; i < 7; i++) {
      const nextDayIndex = (now.getDay() + i) % 7;
      const nextDay = days[nextDayIndex] as keyof OpeningHours;
      const nextDayHours = openingHours[nextDay];

      if (nextDayHours && !('closed' in nextDayHours)) {
        const dayNames: Record<string, string> = {
          monday: '월', tuesday: '화', wednesday: '수', thursday: '목',
          friday: '금', saturday: '토', sunday: '일',
        };
        return { isOpen: false, message: `휴무 (${dayNames[nextDay]}요일 ${nextDayHours.open} 오픈)` };
      }
    }
    return { isOpen: false, message: '휴무' };
  }

  // 오늘 영업 중인 경우
  const [openHour, openMin] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  if (currentTime >= openTime && currentTime < closeTime) {
    return { isOpen: true, message: `영업 중 (${todayHours.close}까지)` };
  } else if (currentTime < openTime) {
    return { isOpen: false, message: `${todayHours.open}에 오픈` };
  } else {
    // 영업 종료 후, 내일 또는 다음 영업일 확인
    for (let i = 1; i < 7; i++) {
      const nextDayIndex = (now.getDay() + i) % 7;
      const nextDay = days[nextDayIndex] as keyof OpeningHours;
      const nextDayHours = openingHours[nextDay];

      if (nextDayHours && !('closed' in nextDayHours)) {
        const dayNames: Record<string, string> = {
          monday: '월', tuesday: '화', wednesday: '수', thursday: '목',
          friday: '금', saturday: '토', sunday: '일',
        };
        if (i === 1) {
          return { isOpen: false, message: `영업 종료 (내일 ${nextDayHours.open} 오픈)` };
        }
        return { isOpen: false, message: `영업 종료 (${dayNames[nextDay]}요일 ${nextDayHours.open} 오픈)` };
      }
    }
    return { isOpen: false, message: '영업 종료' };
  }
};

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setRestaurant(data);
      } catch (err) {
        console.error('식당 정보 로딩 에러:', err);
        toast.error('식당 정보를 불러오지 못했습니다');
        navigate('/restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Image */}
      <div className="relative">
        {/* 상단 이미지 */}
        <div className="relative h-64 overflow-hidden bg-gray-100">
          {restaurant.image_urls && restaurant.image_urls.length > 0 ? (
            <img
              src={restaurant.image_urls[0]}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-50">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* 뒤로가기 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/restaurants')}
          className="absolute top-4 left-4 text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* 식당 이름 및 기본 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-lg mx-auto">
            <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">{restaurant.name}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-white/90 text-gray-800 hover:bg-white">
                {restaurant.category}
              </Badge>
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              {restaurant.average_rating && (
                <span className="text-sm font-semibold text-white">
                  {restaurant.average_rating.toFixed(1)}
                </span>
              )}
              {restaurant.review_count && restaurant.review_count > 0 && (
                <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-gray-700" />
                  <span className="text-sm font-semibold text-gray-800">
                    {restaurant.review_count}
                  </span>
                </div>
              )}
              {(() => {
                const status = getOperatingStatus(restaurant.opening_hours);
                return (
                  <Badge className={`${status.isOpen ? 'bg-green-500/90' : 'bg-gray-500/90'} text-white hover:${status.isOpen ? 'bg-green-500' : 'bg-gray-500'}`}>
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {status.message}
                  </Badge>
                );
              })()}
              {restaurant.phone_number && (
                <Badge className="bg-blue-500/90 text-white hover:bg-blue-500">
                  <Phone className="h-3.5 w-3.5 mr-1" />
                  {restaurant.phone_number}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="max-w-lg mx-auto px-6 py-6 space-y-4">
        {/* 기본 정보 카드 */}
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            {restaurant.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">주소</p>
                  <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                </div>
              </div>
            )}

            {restaurant.phone_number && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">전화번호</p>
                  <a
                    href={`tel:${restaurant.phone_number}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {restaurant.phone_number}
                  </a>
                </div>
              </div>
            )}

            {restaurant.opening_hours && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">영업 시간</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {formatOpeningHours(restaurant.opening_hours)}
                  </p>
                </div>
              </div>
            )}

            {restaurant.price_range && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5 flex-shrink-0">💰</span>
                <div>
                  <p className="font-semibold text-foreground">가격대</p>
                  <p className="text-sm text-muted-foreground">
                    {getPriceRangeText(restaurant.price_range)}
                  </p>
                </div>
              </div>
            )}

            {/* 통계 정보 */}
            {(restaurant.view_count || restaurant.review_count) && (
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                {restaurant.view_count && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">조회 {restaurant.view_count.toLocaleString()}</span>
                  </div>
                )}
                {restaurant.review_count && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">리뷰 {restaurant.review_count}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 소개글 */}
        {restaurant.description && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">소개</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {restaurant.description}
              </p>
            </CardContent>
          </Card>
        )}


        {/* 매칭 만들기 버튼 */}
        <Button
          className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          onClick={() => navigate('/matching/create', { state: { selectedRestaurant: restaurant } })}
        >
          이 식당에서 매칭 만들기
        </Button>
      </div>

      <Navigation />
    </div>
  );
};

export default RestaurantDetail;
