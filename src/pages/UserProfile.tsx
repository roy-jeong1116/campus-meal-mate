import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Award, Users, ChefHat, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getFoodIcon, getInterestIcon } from '@/lib/icons';

interface User {
  id: string;
  name: string;
  email: string;
  student_id?: string;
  major?: string;
  gender?: string;
  profile_image_url?: string;
  interests?: string[];
  preferred_foods?: string[];
  average_rating?: number;
  rating_count?: number;
}

interface RecentMatching {
  id: string;
  restaurant_name: string;
  date: string;
  time: string;
  type: 'joined' | 'created';
}

const UserProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [joinedCount, setJoinedCount] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);
  const [recentMatchings, setRecentMatchings] = useState<RecentMatching[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      toast.error('로그인이 필요합니다');
      navigate('/login', { replace: true });
      return;
    }

    // 자신의 프로필을 보려고 하면 일반 프로필 페이지로 리다이렉트
    if (userId === currentUser.id) {
      navigate('/profile', { replace: true });
      return;
    }

    fetchUserProfile();
  }, [userId, currentUser]);

  const fetchUserProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('사용자를 찾을 수 없습니다');
        navigate(-1);
        return;
      }

      setUser(data);
      // 사용자 정보를 가져온 후 통계 조회
      fetchStats(data.id);
    } catch (err: any) {
      console.error('프로필 조회 에러:', err);
      toast.error('프로필 정보를 불러오지 못했습니다');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (targetUserId: string) => {
    try {
      setStatsLoading(true);

      // 참여한 매칭 수 (승인된 신청)
      const { count: approvedCount } = await supabase
        .from('matching_applications')
        .select('*', { count: 'exact', head: true })
        .eq('applicant_id', targetUserId)
        .eq('status', 'approved');

      setJoinedCount(approvedCount || 0);

      // 만든 매칭 수
      const { count: hostCount } = await supabase
        .from('matchings')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', targetUserId);

      setCreatedCount(hostCount || 0);

      // 최근 활동 (참여한 매칭 + 만든 매칭)
      const { data: joinedMatchings } = await supabase
        .from('matching_applications')
        .select(`
          matching:matching_id (
            id,
            restaurant_name,
            date,
            time
          )
        `)
        .eq('applicant_id', targetUserId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: createdMatchings } = await supabase
        .from('matchings')
        .select('id, restaurant_name, date, time')
        .eq('host_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(3);

      const recentJoined: RecentMatching[] = (joinedMatchings || [])
        .filter(item => item.matching)
        .map(item => ({
          id: item.matching.id,
          restaurant_name: item.matching.restaurant_name,
          date: item.matching.date,
          time: item.matching.time,
          type: 'joined' as const
        }));

      const recentCreated: RecentMatching[] = (createdMatchings || [])
        .map(item => ({
          id: item.id,
          restaurant_name: item.restaurant_name,
          date: item.date,
          time: item.time,
          type: 'created' as const
        }));

      // 두 배열 합치고 날짜순 정렬
      const combined = [...recentJoined, ...recentCreated]
        .sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time}`);
          const dateB = new Date(`${b.date} ${b.time}`);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 3);

      setRecentMatchings(combined);
    } catch (err) {
      console.error('통계 조회 에러:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary pt-12 pb-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <div className="h-24 w-24 mx-auto mb-4 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-background">
            {user.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-primary">
                {user.name.charAt(0)}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{user.name}</h1>
          <p className="text-white/90">
            {user.major ? `${user.major} ` : ''}
            {user.student_id || ''}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-12">
        {/* Stats Card */}
        <Card className="mb-6 border-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">
                    {statsLoading ? '-' : joinedCount}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">참여 매칭</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">
                    {statsLoading ? '-' : createdCount}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">만든 매칭</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">
                    {user.interests?.length || 0}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">관심사</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Card */}
        <Card className="mb-6 border-border">
          <CardHeader>
            <CardTitle className="text-foreground">프로필 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.preferred_foods && user.preferred_foods.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">선호 음식</h3>
                <div className="flex gap-2 flex-wrap">
                  {user.preferred_foods.map((food) => (
                    <Badge key={food} variant="outline">
                      <span className="mr-1">{getFoodIcon(food)}</span>
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {user.interests && user.interests.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">관심사</h3>
                <div className="flex gap-2 flex-wrap">
                  {user.interests.map((interest) => (
                    <Badge key={interest} variant="outline">
                      <span className="mr-1">{getInterestIcon(interest)}</span>
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {(!user.preferred_foods || user.preferred_foods.length === 0) &&
             (!user.interests || user.interests.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                등록된 프로필 정보가 없습니다
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        {!statsLoading && recentMatchings.length > 0 && (
          <Card className="mb-6 border-border">
            <CardHeader>
              <CardTitle className="text-foreground">최근 활동</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentMatchings.map((matching, index) => {
                const date = new Date(matching.date);
                const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                const [hours, minutes] = matching.time.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                const formattedTime = `${displayHour}:${minutes} ${ampm}`;

                return (
                  <div
                    key={matching.id}
                    className={`flex items-start gap-3 ${
                      index < recentMatchings.length - 1 ? 'pb-3 border-b border-border' : ''
                    }`}
                  >
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{matching.restaurant_name}</p>
                      <p className="text-xs text-muted-foreground">{formattedDate} {formattedTime}</p>
                    </div>
                    <Badge variant={matching.type === 'created' ? 'default' : 'secondary'} className="text-xs">
                      {matching.type === 'created' ? '주최' : '참여'}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
