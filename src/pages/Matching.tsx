import { useState, useEffect } from "react";
import { Plus, Loader2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  created_at?: string;
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

interface MatchingApplication {
  id: string;
  matching_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  matching: Matching;
}

interface ActivityItem {
  id: string;
  type: 'created' | 'applied';
  matching: Matching;
  timestamp: string;
  applicationStatus?: 'pending' | 'approved' | 'rejected';
  pendingCount?: number;
  isClosed?: boolean;
}

const Matching = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matchings, setMatchings] = useState<Matching[]>([]);
  const [appliedMatchings, setAppliedMatchings] = useState<MatchingApplication[]>([]);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});
  const [unreadMatchingIds, setUnreadMatchingIds] = useState<Set<string>>(new Set());
  const [hasAnyUnread, setHasAnyUnread] = useState(false);
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
    if (user) {
      fetchAppliedMatchings();
      fetchPendingCounts();
      fetchUnreadNotifications();
    }
  }, [user]);

  // 페이지가 다시 보일 때마다 데이터 새로고침
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMatchings();
        if (user) {
          fetchAppliedMatchings();
          fetchPendingCounts();
          fetchUnreadNotifications();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);
  const fetchUnreadNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('link_url')
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (data) {
      setHasAnyUnread(data.length > 0);
      
      const ids = new Set<string>();
      data.forEach(notification => {
        // link_url 예시: "/matching/uuid-1234/manage" 또는 "/matching/uuid-1234/detail"
        if (notification.link_url) {
          // URL에서 매칭 ID 추출 (단순 파싱)
          const parts = notification.link_url.split('/');
          const matchingIdIndex = parts.indexOf('matching') + 1;
          if (matchingIdIndex > 0 && parts[matchingIdIndex]) {
            ids.add(parts[matchingIdIndex]);
          }
        }
      });
      setUnreadMatchingIds(ids);
    }
  };

  const handleCardClick = async (matchingId: string, type: 'created' | 'applied') => {
    if (user) {
      // 1. 해당 매칭과 관련된 내 알림을 모두 읽음 처리
      // link_url에 matchingId가 포함된 알림들을 찾아서 업데이트
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .ilike('link_url', `%${matchingId}%`); // 해당 ID가 포함된 링크의 알림 읽음 처리
      
      // 상태 업데이트 (UI에서 빨간 점 즉시 제거)
      setUnreadMatchingIds(prev => {
        const next = new Set(prev);
        next.delete(matchingId);
        return next;
      });
    }
    if (type === 'created') {
      navigate(`/matching/${matchingId}/manage`);
    } else {
      navigate(`/matching/${matchingId}/detail`); // detail 페이지가 없다면 manage로, 혹은 상황에 맞게
    }
  };

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

  const fetchAppliedMatchings = async () => {
    if (!user) return;

    try {
      // 내가 신청한 매칭 목록 조회 (매칭 정보 + 호스트 정보 포함)
      const { data, error } = await supabase
        .from('matching_applications')
        .select(`
          id,
          matching_id,
          status,
          created_at,
          matching:matching_id (
            id,
            host_id,
            restaurant_name,
            food_category,
            date,
            time,
            current_participants,
            max_participants,
            status,
            description,
            preferred_gender,
            preferred_student_ids,
            preferred_majors,
            preferred_interests,
            purpose,
            atmosphere,
            host:host_id (
              name,
              student_id,
              major,
              profile_image_url
            )
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAppliedMatchings(data || []);
    } catch (err: any) {
      console.error('신청 내역 로딩 에러:', err);
      toast.error('신청 내역을 불러오지 못했습니다');
    }
  };

  const fetchPendingCounts = async () => {
    if (!user) return;

    try {
      // 내가 만든 매칭들의 대기 중인 신청 개수 조회
      const { data: myMatchingIds } = await supabase
        .from('matchings')
        .select('id')
        .eq('host_id', user.id);

      if (!myMatchingIds || myMatchingIds.length === 0) return;

      const matchingIds = myMatchingIds.map(m => m.id);

      // 각 매칭별 pending 상태 신청 개수 조회
      const { data, error } = await supabase
        .from('matching_applications')
        .select('matching_id')
        .in('matching_id', matchingIds)
        .eq('status', 'pending');

      if (error) throw error;

      // 매칭 ID별 개수 카운트
      const counts: Record<string, number> = {};
      data?.forEach(app => {
        counts[app.matching_id] = (counts[app.matching_id] || 0) + 1;
      });

      setPendingCounts(counts);
    } catch (err: any) {
      console.error('대기 신청 개수 조회 에러:', err);
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
      const targetMatch = matchings.find(m => m.id === matchingId);
      
      // 호스트 정보가 있고, 본인이 본인 글에 신청한 게 아니라면 알림 발송
      if (targetMatch && targetMatch.host_id && targetMatch.host_id !== user.id) {
        await supabase.from('notifications').insert({
          user_id: targetMatch.host_id, // 받는 사람: 호스트
          type: 'APPLY',
          title: '밥약 신청이 도착했습니다! 🍚',
          content: `${user.name || '알 수 없는 사용자'}님이 '${targetMatch.restaurant_name}' 파티에 신청했습니다.`,
          link_url: `/matching/${matchingId}/manage`, // 클릭 시 관리 페이지로 이동
          is_read: false
        });
      }

      toast.success('매칭 신청이 완료되었습니다!', {
        description: '호스트의 승인을 기다려주세요.',
        duration: 3000,
      });

      // 매칭 목록 및 신청 내역 새로고침
      fetchMatchings();
      fetchAppliedMatchings();
      fetchPendingCounts();
    } catch (err: any) {
      console.error('매칭 신청 에러:', err);
      toast.error('매칭 신청 실패', {
        description: err.message || '다시 시도해주세요.',
        duration: 4000,
      });
    }
  };

  const handleManageMatching = (matchingId: string) => {
    navigate(`/matching/${matchingId}/manage`);
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

  // 상대적 시간 표시 함수
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    return formatDate(timestamp);
  };

  // 매칭 마감 여부 체크 함수
  const isMatchingClosed = (matching: Matching): boolean => {
    // 1. 인원이 꽉 찬 경우
    if (matching.current_participants >= matching.max_participants) {
      return true;
    }

    // 2. 식사 시간 1시간 전이 지난 경우
    const now = new Date();
    const mealDateTime = new Date(`${matching.date}T${matching.time}`);
    const oneHourBeforeMeal = new Date(mealDateTime.getTime() - 60 * 60 * 1000);

    if (now >= oneHourBeforeMeal) {
      return true;
    }

    return false;
  };

  // 마감 임박 정보 계산 함수
  const getClosingSoonInfo = (matching: Matching): { timeWarning?: string; spotsWarning?: string } => {
    const now = new Date();
    const mealDateTime = new Date(`${matching.date}T${matching.time}`);
    const twoHoursBeforeMeal = new Date(mealDateTime.getTime() - 2 * 60 * 60 * 1000);
    const diffMs = mealDateTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const result: { timeWarning?: string; spotsWarning?: string } = {};

    // 시간 마감 임박 (2시간 이내)
    if (now >= twoHoursBeforeMeal && diffMs > 0) {
      if (diffHours > 0) {
        result.timeWarning = `${diffHours}시간 ${diffMinutes}분 후 마감`;
      } else if (diffMinutes > 0) {
        result.timeWarning = `${diffMinutes}분 후 마감`;
      }
    }

    // 인원 마감 임박 (1-2자리 남음)
    const spotsLeft = matching.max_participants - matching.current_participants;
    if (spotsLeft === 1) {
      result.spotsWarning = '1자리 남음';
    } else if (spotsLeft === 2) {
      result.spotsWarning = '2자리 남음';
    }

    return result;
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

  // 모집 중인 매칭 (마감되지 않은 매칭만) - 적합도 순으로 정렬
  const activeMatches = matchings
    .filter(m => !isMatchingClosed(m)) // 마감된 매칭 제외
    .map(m => {
      const closingInfo = getClosingSoonInfo(m);
      return {
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
        isHost: m.host_id === user?.id, // 본인이 만든 매칭인지 확인
        timeWarning: closingInfo.timeWarning,
        spotsWarning: closingInfo.spotsWarning,
      };
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)); // 적합도 높은 순으로 정렬

  // 통합 활동 목록 (내가 만든 매칭 + 신청한 매칭)
  const activityItems: ActivityItem[] = [];

  // 내가 만든 매칭을 활동 목록에 추가
  matchings
    .filter(m => m.host_id === user?.id)
    .forEach(m => {
      activityItems.push({
        id: m.id,
        type: 'created',
        matching: m,
        timestamp: m.created_at || new Date().toISOString(),
        pendingCount: pendingCounts[m.id] || 0,
        isClosed: isMatchingClosed(m),
      });
    });

  // 신청한 매칭을 활동 목록에 추가
  appliedMatchings
    .filter(app => app.matching)
    .forEach(app => {
      activityItems.push({
        id: app.id,
        type: 'applied',
        matching: app.matching,
        timestamp: app.created_at,
        applicationStatus: app.status,
        isClosed: isMatchingClosed(app.matching),
      });
    });

  // 시간순으로 정렬 (최신이 먼저)
  const sortedActivities = activityItems.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

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
              <div className="flex items-center gap-2">
                {/* 빨간 점이 있을 때만 보이는 '모두 읽음' 버튼 */}
                {hasAnyUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 h-8 px-2 text-xs"
                    onClick={async () => {
                      // DB에서 읽음 처리
                      await supabase
                        .from('notifications')
                        .update({ is_read: true })
                        .eq('user_id', user?.id)
                        .eq('is_read', false);
                      
                      // 화면 갱신 (빨간점 즉시 제거)
                      setUnreadMatchingIds(new Set());
                      setHasAnyUnread(false); // [추가] 버튼도 즉시 사라지게 함
                      toast.success("알림을 모두 지웠습니다");
                    }}
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    모두 읽음
                  </Button>
                )}

                <Button
                  size="lg"
                  className="bg-white hover:bg-white/90 text-[#FF6B35] shadow-md font-semibold"
                  onClick={handleCreateMatching}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  매칭 만들기
                </Button>
              </div>
              
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
                      description: '내 활동을 보려면 로그인해주세요.',
                      duration: 3000,
                    });
                    // 로그인 후 매칭 페이지로 돌아오도록 경로 전달
                    navigate('/login', { state: { from: '/matching' }, replace: true });
                  }
                }}
              >
                내 활동 ({sortedActivities.length})
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

              <TabsContent value="my" className="mt-0">
                {sortedActivities.length > 0 ? (
                  <div className="divide-y divide-border">
                    {sortedActivities.map((activity) => {
                      // [변경 1] 이 매칭에 안 읽은 알림이 있는지 확인
                      const hasNotification = unreadMatchingIds.has(activity.matching.id);

                      return (
                        <div
                          key={activity.id}
                          className={`py-4 px-2 hover:bg-accent/50 cursor-pointer transition-colors relative ${
                            activity.isClosed ? 'opacity-60' : ''
                          }`}
                          // [변경 2] 클릭 시 'handleCardClick' 실행 (알림 읽음 처리 + 페이지 이동)
                          onClick={() => handleCardClick(activity.matching.id, activity.type)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-semibold truncate ${
                                  activity.isClosed ? 'text-muted-foreground' : 'text-foreground'
                                }`}>
                                  {activity.matching.restaurant_name}
                                </h3>
                                
                                {/* [변경 3] 알림이 있으면 식당 이름 옆에 빨간 점 표시 */}
                                {hasNotification && (
                                  <span className="h-2 w-2 rounded-full bg-red-500 shrink-0 animate-pulse" />
                                )}

                                <span className="text-sm text-muted-foreground shrink-0">
                                  {formatDate(activity.matching.date)} {formatTime(activity.matching.time)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs flex-wrap">
                                {activity.isClosed && (
                                  <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                                    마감됨
                                  </Badge>
                                )}
                                {activity.type === 'created' ? (
                                  <>
                                    {!activity.isClosed && activity.pendingCount && activity.pendingCount > 0 ? (
                                      <Badge className="bg-orange-500 hover:bg-orange-500 text-white">
                                        신청 {activity.pendingCount}건
                                      </Badge>
                                    ) : !activity.isClosed ? (
                                      <Badge variant="secondary">대기 중</Badge>
                                    ) : null}
                                    <span className="text-muted-foreground">내가 만든 매칭</span>
                                  </>
                                ) : (
                                  <>
                                    {!activity.isClosed && (
                                      <Badge
                                        className={
                                          activity.applicationStatus === 'approved'
                                            ? 'bg-green-600 hover:bg-green-600 text-white'
                                            : activity.applicationStatus === 'pending'
                                            ? 'bg-orange-400 hover:bg-orange-400 text-white'
                                            : 'bg-gray-400 hover:bg-gray-400 text-white'
                                        }
                                      >
                                        {activity.applicationStatus === 'approved'
                                          ? '승인됨'
                                          : activity.applicationStatus === 'pending'
                                          ? '대기중'
                                          : '거절됨'}
                                      </Badge>
                                    )}
                                    <span className="text-muted-foreground">신청한 매칭</span>
                                  </>
                                )}
                                <span className="text-muted-foreground">·</span>
                                <span className="text-muted-foreground">
                                  {getRelativeTime(activity.timestamp)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-2 shrink-0">
                              <svg
                                className="h-5 w-5 text-muted-foreground"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      아직 활동 내역이 없습니다
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
