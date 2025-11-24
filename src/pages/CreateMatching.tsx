import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Restaurant, OpeningHours } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Loader2, Store, Tag, Utensils, Star, Calendar, Clock, Users, Heart, MessageSquare, X, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

// 영업 상태를 판단하는 헬퍼 함수
const getOperatingStatus = (openingHours?: OpeningHours): { isOpen: boolean; message: string } => {
  if (!openingHours) {
    return { isOpen: false, message: '영업 정보 없음' };
  }

  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()] as keyof OpeningHours;
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const todayHours = openingHours[currentDay];

  if (!todayHours || ('closed' in todayHours && todayHours.closed)) {
    return { isOpen: false, message: '휴무' };
  }

  const [openHour, openMin] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  if (currentTime >= openTime && currentTime < closeTime) {
    return { isOpen: true, message: '영업 중' };
  } else if (currentTime < openTime) {
    return { isOpen: false, message: `${todayHours.open} 오픈` };
  } else {
    return { isOpen: false, message: '영업 종료' };
  }
};

const CreateMatching = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('로그인이 필요합니다', {
        description: '매칭을 만들려면 로그인해주세요.',
        duration: 3000,
      });
      // 로그인 후 다시 매칭 만들기 페이지로 돌아오도록 경로 전달
      navigate('/login', { state: { from: '/matching/create' } });
    }
  }, [user, authLoading, navigate]);

  // 상세 페이지에서 전달된 식당 정보 확인
  useEffect(() => {
    const stateRestaurant = (location.state as any)?.selectedRestaurant;
    if (stateRestaurant && !selectedRestaurant) {
      setSelectedRestaurant(stateRestaurant);
      setFormData(prev => ({
        ...prev,
        restaurant_id: stateRestaurant.id,
        restaurant_name: stateRestaurant.name,
        food_category: stateRestaurant.category,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const [formData, setFormData] = useState({
    restaurant_id: null as string | null,
    restaurant_name: '',
    food_category: '',
    date: '',
    time: '',
    max_participants: 4,
    description: '',
    preferred_gender: [] as string[],
    preferred_student_ids: [] as string[],
    preferred_majors: [] as string[],
    preferred_interests: [] as string[],
    preferred_foods: [] as string[],
  });

  // Load restaurants from Supabase
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
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
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Handle clicks outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const genderOptions = ['남성', '여성', '기타'];
  const studentIdOptions = ['25학번', '24학번', '23학번', '22학번', '21학번', '20학번', '19학번', '18학번', '17학번', '16학번', '15학번 이전'];
  const majorOptions = ['인문대학', '자연과학대학', '법과대학', '사회과학대학', '경제통상대학', '경영대학', '공과대학', 'IT대학', '융합특성화자유전공학부', '베어드교양대학'];
  const interestOptions = ['운동', '게임', '영화', '음악', '독서', '여행', '요리', '사진'];
  const foodOptions = ['한식', '중식', '일식', '양식', '분식', '치킨', '피자', '카페'];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof typeof formData, item: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(item)) {
      handleChange(field, currentArray.filter(i => i !== item));
    } else {
      handleChange(field, [...currentArray, item]);
    }
  };

  // 검색어에 따라 식당 필터링
  const filteredRestaurants = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.category.toLowerCase().includes(query) ||
      (restaurant.address && restaurant.address.toLowerCase().includes(query)) ||
      (restaurant.description && restaurant.description.toLowerCase().includes(query))
    );
  }, [searchQuery, restaurants]);

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    handleChange('restaurant_id', restaurant.id);
    handleChange('restaurant_name', restaurant.name);
    handleChange('food_category', restaurant.category);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 방어적 체크 (페이지 진입 시 이미 체크했지만 한 번 더 확인)
    if (!user) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
      return;
    }

    // 필수 필드 검증
    if (!formData.restaurant_id || !formData.date || !formData.time) {
      toast.error('필수 정보를 모두 입력해주세요', {
        description: '식당, 날짜, 시간은 필수입니다.',
      });
      return;
    }

    setLoading(true);

    try {
      // matchings 테이블에 데이터 삽입
      const { error } = await supabase
        .from('matchings')
        .insert({
          host_id: user.id,
          restaurant_id: formData.restaurant_id,
          restaurant_name: formData.restaurant_name,
          food_category: formData.food_category,
          date: formData.date,
          time: formData.time,
          max_participants: formData.max_participants,
          current_participants: 1,
          description: formData.description || null,
          preferred_gender: formData.preferred_gender.length > 0 ? formData.preferred_gender : null,
          preferred_student_ids: formData.preferred_student_ids.length > 0 ? formData.preferred_student_ids : null,
          preferred_majors: formData.preferred_majors.length > 0 ? formData.preferred_majors : null,
          preferred_interests: formData.preferred_interests.length > 0 ? formData.preferred_interests : null,
          preferred_foods: formData.preferred_foods.length > 0 ? formData.preferred_foods : null,
          status: 'active',
        });

      if (error) throw error;

      toast.success('매칭이 등록되었습니다!', {
        description: '다른 사용자들이 신청할 수 있습니다.',
        duration: 2000,
      });

      navigate('/matching');
    } catch (err: any) {
      console.error('매칭 등록 에러:', err);
      toast.error('매칭 등록 실패', {
        description: err.message || '다시 시도해주세요.',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  // 로그인하지 않은 경우 (리다이렉트 전)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-[#FF6B35] to-[#FF8A65] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/matching')}
              className="absolute left-0 text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">매칭 만들기</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 식당 정보 */}
          <Card className="border-2 border-orange-100 shadow-md bg-gradient-to-br from-white to-orange-50/20">
            <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-red-50/50">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col justify-center min-h-[2.5rem]">
                  <span className="text-lg font-bold leading-tight text-gray-800">식당 정보</span>
                  <span className="text-xs text-muted-foreground font-normal leading-tight mt-0.5">식당명, 음식 카테고리, 주 메뉴로 검색할 수 있습니다</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {!selectedRestaurant && (
                <div className="space-y-2 relative" ref={searchContainerRef}>
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <Store className="w-4 h-4 text-orange-600" />
                    식당 검색 *
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <Store className="w-4 h-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="식당명, 카테고리, 메뉴로 검색..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowResults(true);
                      }}
                      onFocus={() => setShowResults(true)}
                      disabled={loadingRestaurants}
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-400 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 transition-all duration-200 text-sm placeholder:text-gray-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setShowResults(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <span className="text-lg">×</span>
                      </button>
                    )}
                  </div>

                {/* 검색 결과 리스트 */}
                {showResults && searchQuery && filteredRestaurants.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl max-h-[420px] overflow-auto border-2 border-orange-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 space-y-1.5">
                      {filteredRestaurants.map((restaurant, index) => (
                        <div
                          key={restaurant.id}
                          onClick={() => handleSelectRestaurant(restaurant)}
                          className="group relative px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 border-2 border-transparent hover:border-orange-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          {/* 좌측 강조선 */}
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-orange-400 to-orange-500 rounded-r-full transition-all duration-200 group-hover:h-3/4 shadow-md" />

                          <div className="flex items-center gap-2">
                            {/* 아이콘 */}
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-orange-400 group-hover:to-orange-500 transition-all duration-200 shadow-sm group-hover:shadow-md">
                              <Store className="w-4 h-4 text-orange-600 group-hover:text-white group-hover:scale-110 transition-all duration-200" />
                            </div>

                            {/* 정보 */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 truncate">
                                  {restaurant.name}
                                </h4>
                                {restaurant.average_rating && (
                                  <div className="flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-700">
                                      {restaurant.average_rating.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-0.5">
                                {/* 첫 번째 줄: 카테고리, 위치 */}
                                <div className="flex items-center gap-1 flex-wrap">
                                  {/* 카테고리 */}
                                  <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 transition-all duration-200">
                                    <span className="text-[10px] font-medium">
                                      {restaurant.category}
                                    </span>
                                  </div>

                                  {/* 주소 */}
                                  {restaurant.address && (
                                    <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 transition-all duration-200">
                                      <MapPin className="w-2.5 h-2.5" />
                                      <span className="text-[10px] font-medium">
                                        {restaurant.address}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* 두 번째 줄: 전화번호, 운영 상태 */}
                                <div className="flex items-center gap-1 flex-wrap">
                                  {/* 전화번호 */}
                                  {restaurant.phone_number && (
                                    <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 transition-all duration-200">
                                      <Phone className="w-2.5 h-2.5" />
                                      <span className="text-[10px] font-medium">
                                        {restaurant.phone_number}
                                      </span>
                                    </div>
                                  )}

                                  {/* 운영 상태 */}
                                  {(() => {
                                    const status = getOperatingStatus(restaurant.opening_hours);
                                    return (
                                      <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${status.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} transition-all duration-200`}>
                                        <Clock className="w-2.5 h-2.5" />
                                        <span className="text-[10px] font-medium">
                                          {status.message}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>

                            {/* 우측 화살표 */}
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1">
                              <ArrowLeft className="w-4 h-4 text-orange-600 rotate-180" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 검색 결과 없음 */}
                {showResults && searchQuery && filteredRestaurants.length === 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-6 text-center animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center shadow-md">
                        <Store className="w-7 h-7 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-1">검색 결과가 없습니다</p>
                        <p className="text-xs font-medium text-gray-600">다른 검색어로 시도해보세요</p>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              )}

              {selectedRestaurant && (
                <div className="relative rounded-lg bg-white border-2 border-orange-200 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* X 버튼 - 우측 상단 */}
                  <button
                    onClick={() => {
                      setSelectedRestaurant(null);
                      handleChange('restaurant_id', null);
                      handleChange('restaurant_name', '');
                      handleChange('food_category', '');
                    }}
                    className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                    title="선택 취소"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="p-2 relative">
                    <div className="flex items-center gap-2">
                      {/* 좌측 강조선 */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-gradient-to-b from-orange-400 to-orange-500 rounded-r-full shadow-md" />

                      {/* 아이콘 */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm ml-2">
                        <Store className="w-4 h-4 text-white" />
                      </div>

                      {/* 정보 */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-orange-600 truncate">
                            {selectedRestaurant.name}
                          </h4>
                          {selectedRestaurant.average_rating && (
                            <div className="flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span className="text-[10px] font-bold text-amber-700">
                                {selectedRestaurant.average_rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          {/* 첫 번째 줄: 카테고리, 위치 */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {/* 카테고리 */}
                            <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 transition-all duration-200">
                              <span className="text-[10px] font-medium">
                                {selectedRestaurant.category}
                              </span>
                            </div>

                            {/* 주소 */}
                            {selectedRestaurant.address && (
                              <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 transition-all duration-200">
                                <MapPin className="w-2.5 h-2.5" />
                                <span className="text-[10px] font-medium">
                                  {selectedRestaurant.address}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* 두 번째 줄: 전화번호, 운영 상태 */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {/* 전화번호 */}
                            {selectedRestaurant.phone_number && (
                              <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 transition-all duration-200">
                                <Phone className="w-2.5 h-2.5" />
                                <span className="text-[10px] font-medium">
                                  {selectedRestaurant.phone_number}
                                </span>
                              </div>
                            )}

                            {/* 운영 상태 */}
                            {(() => {
                              const status = getOperatingStatus(selectedRestaurant.opening_hours);
                              return (
                                <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${status.isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} transition-all duration-200`}>
                                  <Clock className="w-2.5 h-2.5" />
                                  <span className="text-[10px] font-medium">
                                    {status.message}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 일정 */}
          <Card className="border-2 border-gray-200 shadow-md bg-gradient-to-br from-white to-blue-50/20">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50/50">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">식사 일정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1.5 text-base font-semibold text-gray-700">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    날짜 *
                  </Label>
                  <div className="relative">
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="border-2 border-gray-200 focus:border-blue-500 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 py-2 pr-9 text-sm transition-all duration-200 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                    />
                    <Calendar className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-1.5 text-base font-semibold text-gray-700">
                    <Clock className="w-4 h-4 text-blue-500" />
                    시간 *
                  </Label>
                  <div className="relative">
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                      required
                      className="border-2 border-gray-200 focus:border-blue-500 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 py-2 pr-9 text-sm transition-all duration-200 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                    />
                    <Clock className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants" className="flex items-center gap-1.5 text-base font-semibold text-gray-700">
                  <Users className="w-4 h-4 text-blue-500" />
                  모집 인원 *
                </Label>
                <Select
                  value={formData.max_participants.toString()}
                  onValueChange={(value) => handleChange('max_participants', parseInt(value))}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 data-[state=open]:border-blue-500 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 py-2 text-sm transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()} className="py-2 text-xs">
                        {num}명
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 희망 특성 */}
          <Card className="border-2 border-gray-200 shadow-md bg-gradient-to-br from-white to-pink-50/20">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50/50">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col justify-center min-h-[2.5rem]">
                  <span className="text-lg font-bold leading-tight">매칭 상대 희망 특성</span>
                  <span className="text-xs text-muted-foreground font-normal leading-tight mt-0.5">원하는 상대의 특성을 선택하세요 (무관하면 선택 안 해도 됩니다)</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-1.5 text-gray-700">
                  <span className="text-pink-500">👤</span> 성별
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {genderOptions.map((gender) => (
                    <Badge
                      key={gender}
                      className={`cursor-pointer transition-all duration-200 px-2 py-1 text-xs font-semibold justify-center ${
                        formData.preferred_gender.includes(gender)
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border border-pink-500 shadow-sm hover:shadow-md hover:scale-105'
                          : 'bg-white text-gray-700 border border-pink-200 hover:border-pink-400 hover:bg-pink-50 hover:scale-105'
                      }`}
                      onClick={() => toggleArrayItem('preferred_gender', gender)}
                    >
                      {gender}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-1.5 text-gray-700">
                  <span className="text-rose-500">🎓</span> 학번
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {studentIdOptions.map((id) => (
                    <Badge
                      key={id}
                      className={`cursor-pointer transition-all duration-200 px-2 py-1 text-xs font-semibold justify-center ${
                        formData.preferred_student_ids.includes(id)
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border border-rose-500 shadow-sm hover:shadow-md hover:scale-105'
                          : 'bg-white text-gray-700 border border-rose-200 hover:border-rose-400 hover:bg-rose-50 hover:scale-105'
                      }`}
                      onClick={() => toggleArrayItem('preferred_student_ids', id)}
                    >
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-1.5 text-gray-700">
                  <span className="text-pink-600">🏫</span> 소속 대학
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {majorOptions.map((major) => (
                    <Badge
                      key={major}
                      className={`cursor-pointer transition-all duration-200 px-2 py-1 text-xs font-semibold justify-center ${
                        formData.preferred_majors.includes(major)
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border border-pink-600 shadow-sm hover:shadow-md hover:scale-105'
                          : 'bg-white text-gray-700 border border-pink-200 hover:border-pink-400 hover:bg-pink-50 hover:scale-105'
                      }`}
                      onClick={() => toggleArrayItem('preferred_majors', major)}
                    >
                      {major}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-1.5 text-gray-700">
                  <span className="text-fuchsia-500">⭐</span> 관심사
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {interestOptions.map((interest) => (
                    <Badge
                      key={interest}
                      className={`cursor-pointer transition-all duration-200 px-2 py-1 text-xs font-semibold justify-center ${
                        formData.preferred_interests.includes(interest)
                          ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border border-fuchsia-500 shadow-sm hover:shadow-md hover:scale-105'
                          : 'bg-white text-gray-700 border border-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-50 hover:scale-105'
                      }`}
                      onClick={() => toggleArrayItem('preferred_interests', interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-1.5 text-gray-700">
                  <span className="text-rose-600">🍽️</span> 선호 음식
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {foodOptions.map((food) => (
                    <Badge
                      key={food}
                      className={`cursor-pointer transition-all duration-200 px-2 py-1 text-xs font-semibold justify-center ${
                        formData.preferred_foods.includes(food)
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border border-rose-600 shadow-sm hover:shadow-md hover:scale-105'
                          : 'bg-white text-gray-700 border border-rose-200 hover:border-rose-400 hover:bg-rose-50 hover:scale-105'
                      }`}
                      onClick={() => toggleArrayItem('preferred_foods', food)}
                    >
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 매칭 설명 */}
          <Card className="border-2 border-gray-200 shadow-md bg-gradient-to-br from-white to-green-50/20">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50/50">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col justify-center min-h-[2.5rem]">
                  <span className="text-lg font-bold leading-tight">매칭 설명</span>
                  <span className="text-xs text-muted-foreground font-normal leading-tight mt-0.5">매칭에 대한 추가 정보를 입력하세요 (선택 사항)</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                placeholder="예: 편하게 식사하실 분 환영합니다!"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={5}
                className="resize-none border-2 border-gray-200 focus:border-green-500 outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 text-base transition-all duration-200"
              />
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/matching')}
              className="flex-1"
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  등록 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  매칭 등록
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <Navigation />
    </div>
  );
};

export default CreateMatching;
