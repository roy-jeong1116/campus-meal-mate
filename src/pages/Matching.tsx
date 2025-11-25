import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Matching {
  id: string;
  host_id: string;
  restaurant_name: string;
  food_category: string;
  date: string;
  time: string;
  current_participants: number;
  max_participants: number;
  status: string;
  description?: string;
  preferred_gender?: string[];
  preferred_student_ids?: string[];
  preferred_majors?: string[];
  preferred_interests?: string[];
  purpose?: string[];
  atmosphere?: string[];
  host?: {
    name: string;
    student_id?: string;
    major?: string;
    profile_image_url?: string;
  };
}

const Matching = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matchings, setMatchings] = useState<Matching[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCreateMatching = () => {
    if (!user) {
      toast.error('로그인이 필요합니다', {
        description: '매칭을 만들려면 로그인해주세요.',
        duration: 3000,
      });
      // 로그인 후 매칭 만들기 페이지로 돌아오도록 경로 전달
      navigate('/login', { state: { from: '/matching/create' }, replace: true });
      return;
    }
    navigate('/matching/create');
  };

  // 매칭 데이터 로드
  useEffect(() => {
    fetchMatchings();
  }, []);

  const fetchMatchings = async () => {
    try {
      setLoading(true);

      // matchings 테이블과 users 테이블을 조인해서 호스트 정보까지 가져오기
      const { data, error } = await supabase
        .from('matchings')
        .select(`
          *,
          host:host_id (
            name,
            student_id,
            major,
            profile_image_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMatchings(data || []);
    } catch (err: any) {
      console.error('매칭 데이터 로딩 에러:', err);
      toast.error('매칭 목록을 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyMatching = async (matchingId: string) => {
    if (!user) {
      toast.error('로그인이 필요합니다', {
        description: '매칭 신청을 하려면 로그인해주세요.',
        duration: 3000,
      });
      // 로그인 후 매칭 페이지로 돌아오도록 경로 전달
      navigate('/login', { state: { from: '/matching' }, replace: true });
      return;
    }

    try {
      // 매칭 신청 생성
      const { error } = await supabase
        .from('matching_applications')
        .insert({
          matching_id: matchingId,
          applicant_id: user.id,
          status: 'pending',
          message: null, // 나중에 메시지 입력 기능 추가 가능
        });

      if (error) {
        // 중복 신청 체크
        if (error.code === '23505') {
          toast.error('이미 신청한 매칭입니다', {
            description: '중복 신청은 불가능합니다.',
            duration: 3000,
          });
          return;
        }
        throw error;
      }

      toast.success('매칭 신청이 완료되었습니다!', {
        description: '호스트의 승인을 기다려주세요.',
        duration: 3000,
      });

      // 매칭 목록 새로고침
      fetchMatchings();
    } catch (err: any) {
      console.error('매칭 신청 에러:', err);
      toast.error('매칭 신청 실패', {
        description: err.message || '다시 시도해주세요.',
        duration: 4000,
      });
    }
  };

  // 날짜 포맷 변환 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  // 시간 포맷 변환 함수
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // 적합도 계산 함수
  const calculateMatchScore = (matching: Matching): number => {
    if (!user) return 0;

    let score = 0;
    let totalWeight = 0;

    // 성별 (25%)
    if (matching.preferred_gender && matching.preferred_gender.length > 0) {
      totalWeight += 25;
      if (user.gender && matching.preferred_gender.includes(user.gender)) {
        score += 25;
      }
    }

    // 학번 (25%)
    if (matching.preferred_student_ids && matching.preferred_student_ids.length > 0) {
      totalWeight += 25;
      if (user.student_id && matching.preferred_student_ids.includes(user.student_id)) {
        score += 25;
      }
    }

    // 전공 (25%)
    if (matching.preferred_majors && matching.preferred_majors.length > 0) {
      totalWeight += 25;
      if (user.major && matching.preferred_majors.includes(user.major)) {
        score += 25;
      }
    }

    // 관심사 (25%)
    if (matching.preferred_interests && matching.preferred_interests.length > 0) {
      totalWeight += 25;
      if (user.interests && user.interests.length > 0) {
        const matchingInterests = matching.preferred_interests.filter(interest =>
          user.interests?.includes(interest)
        );
        score += (matchingInterests.length / matching.preferred_interests.length) * 25;
      }
    }

    // 희망 특성이 없으면 100% 적합
    if (totalWeight === 0) return 100;

    // 가중치에 따라 점수 조정
    return Math.round((score / totalWeight) * 100);
  };

  // 모집 중인 매칭 (모든 매칭) - 적합도 순으로 정렬
  const activeMatches = matchings
    .map(m => ({
      id: m.id,
      restaurantName: m.restaurant_name,
      foodCategory: m.food_category,
      date: formatDate(m.date),
      time: formatTime(m.time),
      participants: m.current_participants,
      maxParticipants: m.max_participants,
      organizer: m.host?.name || '알 수 없음',
      major: m.host?.major && m.host?.student_id
        ? `${m.host.major} ${m.host.student_id}`
        : m.host?.major || m.host?.student_id || '',
      profileImageUrl: m.host?.profile_image_url,
      description: m.description,
      preferredGender: m.preferred_gender || [],
      preferredStudentIds: m.preferred_student_ids || [],
      preferredMajors: m.preferred_majors || [],
      preferredInterests: m.preferred_interests || [],
      purpose: m.purpose || [],
      atmosphere: m.atmosphere || [],
      matchScore: calculateMatchScore(m),
      userGender: user?.gender,
      userStudentId: user?.student_id,
      userMajor: user?.major,
      userInterests: user?.interests || [],
    }))
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)); // 적합도 높은 순으로 정렬

  // 내 매칭
  const myMatches = user
    ? matchings
        .filter(m => m.host_id === user.id)
        .map(m => ({
          id: m.id,
          restaurantName: m.restaurant_name,
          foodCategory: m.food_category,
          date: formatDate(m.date),
          time: formatTime(m.time),
          participants: m.current_participants,
          maxParticipants: m.max_participants,
          organizer: m.host?.name || '알 수 없음',
          major: m.host?.major && m.host?.student_id
            ? `${m.host.major} ${m.host.student_id}`
            : m.host?.major || m.host?.student_id || '',
          profileImageUrl: m.host?.profile_image_url,
          description: m.description,
          preferredGender: m.preferred_gender || [],
          preferredStudentIds: m.preferred_student_ids || [],
          preferredMajors: m.preferred_majors || [],
          preferredInterests: m.preferred_interests || [],
          purpose: m.purpose || [],
          atmosphere: m.atmosphere || [],
          matchScore: undefined, // 내 매칭은 적합도 표시 안 함
          userGender: user?.gender,
          userStudentId: user?.student_id,
          userMajor: user?.major,
          userInterests: user?.interests || [],
        }))
    : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Tabs defaultValue="active" className="w-full">
        {/* Fixed Header with Title, Button, and Tabs */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-[#FF6B35] to-[#FF8A65] shadow-lg">
          <div className="max-w-lg mx-auto px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">식사 매칭</h1>
              <Button
                size="lg"
                className="bg-white hover:bg-white/90 text-[#FF6B35] shadow-md font-semibold"
                onClick={handleCreateMatching}
              >
                <Plus className="h-5 w-5 mr-2" />
                매칭 만들기
              </Button>
            </div>
            <TabsList className="grid w-full grid-cols-2 bg-white/20 border-0">
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-white data-[state=active]:text-[#FF6B35] text-white font-semibold"
              >
                모집 중 ({activeMatches.length})
              </TabsTrigger>
              <TabsTrigger
                value="my"
                className="data-[state=active]:bg-white data-[state=active]:text-[#FF6B35] text-white font-semibold"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    toast.error('로그인이 필요합니다', {
                      description: '내 매칭을 보려면 로그인해주세요.',
                      duration: 3000,
                    });
                    // 로그인 후 매칭 페이지로 돌아오도록 경로 전달
                    navigate('/login', { state: { from: '/matching' }, replace: true });
                  }
                }}
              >
                내 매칭 ({myMatches.length})
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="max-w-lg mx-auto px-6 pt-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="active" className="space-y-4 mt-0">
                {activeMatches.length > 0 ? (
                  activeMatches.map((match) => (
                    <MatchCard key={match.id} {...match} onApply={handleApplyMatching} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      모집 중인 매칭이 없습니다
                    </p>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handleCreateMatching}
                    >
                      <Plus className="h-5 w-5 mr-1" />
                      첫 매칭 만들기
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="my" className="space-y-4 mt-0">
                {myMatches.length > 0 ? (
                  myMatches.map((match) => (
                    <MatchCard key={match.id} {...match} onApply={handleApplyMatching} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      아직 참여한 매칭이 없습니다
                    </p>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handleCreateMatching}
                    >
                      <Plus className="h-5 w-5 mr-1" />
                      첫 매칭 만들기
                    </Button>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      <Navigation />
    </div>
  );
};

export default Matching;
