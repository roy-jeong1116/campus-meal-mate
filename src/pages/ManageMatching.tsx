import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MatchCard from '@/components/MatchCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Check, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getInterestIcon } from '@/lib/icons';

interface Matching {
  id: string;
  restaurant_name: string;
  food_category?: string;
  date: string;
  time: string;
  current_participants: number;
  max_participants: number;
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

interface Application {
  id: string;
  status: string;
  created_at: string;
  applicant: {
    id: string;
    name: string;
    student_id?: string;
    major?: string;
    gender?: string;
    profile_image_url?: string;
    interests?: string[];
    preferred_foods?: string[];
    average_rating?: number;
  };
}

const ManageMatching = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState<Matching | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      navigate('/login', { replace: true });
      return;
    }

    fetchMatchingData();
  }, [id, user]);

  const fetchMatchingData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // 매칭 정보 조회 (호스트 정보 포함)
      const { data: matchingData, error: matchingError } = await supabase
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
        .eq('id', id)
        .eq('host_id', user?.id) // 본인의 매칭만 조회
        .single();

      if (matchingError) throw matchingError;

      if (!matchingData) {
        toast.error('매칭을 찾을 수 없습니다');
        navigate('/matching');
        return;
      }

      setMatching(matchingData);

      // 신청자 목록 조회 (users 정보 포함)
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('matching_applications')
        .select(`
          id,
          status,
          created_at,
          applicant:applicant_id (
            id,
            name,
            student_id,
            major,
            gender,
            profile_image_url,
            interests,
            preferred_foods,
            average_rating
          )
        `)
        .eq('matching_id', id)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      setApplications(applicationsData || []);
    } catch (err: any) {
      console.error('매칭 데이터 로딩 에러:', err);
      toast.error('매칭 정보를 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      // 신청 승인
      const { error: updateError } = await supabase
        .from('matching_applications')
        .update({ status: 'approved' })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // current_participants 증가
      const { error: matchingError } = await supabase
        .from('matchings')
        .update({
          current_participants: (matching?.current_participants || 0) + 1
        })
        .eq('id', id);

      if (matchingError) throw matchingError;

      toast.success('신청을 승인했습니다!');
      fetchMatchingData(); // 데이터 새로고침
    } catch (err: any) {
      console.error('승인 에러:', err);
      toast.error('승인에 실패했습니다', {
        description: err.message || '다시 시도해주세요.',
      });
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('matching_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success('신청을 거절했습니다');
      fetchMatchingData(); // 데이터 새로고침
    } catch (err: any) {
      console.error('거절 에러:', err);
      toast.error('거절에 실패했습니다', {
        description: err.message || '다시 시도해주세요.',
      });
    }
  };

  const handleDeleteMatching = async () => {
    try {
      const { error } = await supabase
        .from('matchings')
        .delete()
        .eq('id', id)
        .eq('host_id', user?.id); // 본인의 매칭만 삭제 가능

      if (error) throw error;

      toast.success('매칭이 삭제되었습니다');
      navigate('/matching', { replace: true });
    } catch (err: any) {
      console.error('매칭 삭제 에러:', err);
      toast.error('매칭 삭제에 실패했습니다', {
        description: err.message || '다시 시도해주세요.',
      });
    }
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 시간 포맷
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!matching) {
    return null;
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const approvedApplications = applications.filter(app => app.status === 'approved');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-[#FF6B35] to-[#FF8A65] shadow-lg">
        <div className="max-w-lg mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white">매칭 관리</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6">
        {/* 매칭 정보 카드 */}
        <div className="mb-6">
          <MatchCard
            id={matching.id}
            restaurantName={matching.restaurant_name}
            foodCategory={matching.food_category}
            date={formatDate(matching.date)}
            time={formatTime(matching.time)}
            participants={matching.current_participants}
            maxParticipants={matching.max_participants}
            organizer={matching.host?.name || user?.name || '알 수 없음'}
            major={matching.host?.major && matching.host?.student_id
              ? `${matching.host.major} ${matching.host.student_id}`
              : matching.host?.major || matching.host?.student_id || ''}
            profileImageUrl={matching.host?.profile_image_url}
            description={matching.description}
            preferredGender={matching.preferred_gender || []}
            preferredStudentIds={matching.preferred_student_ids || []}
            preferredMajors={matching.preferred_majors || []}
            preferredInterests={matching.preferred_interests || []}
            purpose={matching.purpose || []}
            atmosphere={matching.atmosphere || []}
            userGender={user?.gender}
            userStudentId={user?.student_id}
            userMajor={user?.major}
            userInterests={user?.interests || []}
            isHost={true}
          />

          {/* 매칭 삭제 버튼 */}
          <div className="mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  매칭 삭제하기
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>매칭을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다. 매칭과 관련된 모든 신청 정보가 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteMatching}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* 대기 중인 신청 */}
        {pendingApplications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">대기 중인 신청 ({pendingApplications.length})</h2>
            <div className="space-y-3">
              {pendingApplications.map((app) => (
                <Card key={app.id} className="border-2 border-orange-200">
                  <CardContent className="p-4">
                    <div
                      className="flex items-start gap-3 mb-3 cursor-pointer hover:bg-accent/50 -m-2 p-2 rounded transition-colors"
                      onClick={() => navigate(`/profile/${app.applicant.id}`)}
                    >
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {app.applicant.profile_image_url ? (
                          <img
                            src={app.applicant.profile_image_url}
                            alt={app.applicant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold">
                            {app.applicant.name[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{app.applicant.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {app.applicant.major} {app.applicant.student_id}
                        </p>
                        {app.applicant.interests && app.applicant.interests.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {app.applicant.interests.slice(0, 3).map((interest) => (
                              <Badge key={interest} variant="outline" className="text-xs">
                                <span className="mr-1">{getInterestIcon(interest)}</span>
                                {interest}
                              </Badge>
                            ))}
                            {app.applicant.interests.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{app.applicant.interests.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(app.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={matching.current_participants >= matching.max_participants}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        onClick={() => handleReject(app.id)}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        거절
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 승인된 신청 */}
        {approvedApplications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">승인된 신청 ({approvedApplications.length})</h2>
            <div className="space-y-3">
              {approvedApplications.map((app) => (
                <Card key={app.id} className="border-2 border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div
                      className="flex items-start gap-3 cursor-pointer hover:bg-green-100/50 -m-2 p-2 rounded transition-colors"
                      onClick={() => navigate(`/profile/${app.applicant.id}`)}
                    >
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {app.applicant.profile_image_url ? (
                          <img
                            src={app.applicant.profile_image_url}
                            alt={app.applicant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold">
                            {app.applicant.name[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{app.applicant.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {app.applicant.major} {app.applicant.student_id}
                        </p>
                        <Badge className="mt-2 bg-green-600">승인됨</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 거절된 신청 */}
        {rejectedApplications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-muted-foreground">거절된 신청 ({rejectedApplications.length})</h2>
            <div className="space-y-3">
              {rejectedApplications.map((app) => (
                <Card key={app.id} className="border-2 border-gray-200 bg-gray-50/50">
                  <CardContent className="p-4">
                    <div
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-100/50 -m-2 p-2 rounded transition-colors"
                      onClick={() => navigate(`/profile/${app.applicant.id}`)}
                    >
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {app.applicant.profile_image_url ? (
                          <img
                            src={app.applicant.profile_image_url}
                            alt={app.applicant.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold">
                            {app.applicant.name[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-muted-foreground">{app.applicant.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {app.applicant.major} {app.applicant.student_id}
                        </p>
                        <Badge className="mt-2 bg-gray-400">거절됨</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 신청이 없을 때 */}
        {applications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">아직 신청자가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMatching;
