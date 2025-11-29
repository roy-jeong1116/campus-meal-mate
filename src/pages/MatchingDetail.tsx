import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { ArrowLeft, Loader2, Calendar, Clock, Users, User } from 'lucide-react';
import { toast } from 'sonner';

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
    id: string;
    name: string;
    student_id?: string;
    major?: string;
    profile_image_url?: string;
  };
}

interface MyApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Participant {
  id: string;
  name: string;
  student_id?: string;
  major?: string;
  profile_image_url?: string;
  interests?: string[];
}

const MatchingDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState<Matching | null>(null);
  const [myApplication, setMyApplication] = useState<MyApplication | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      navigate('/login', { replace: true });
      return;
    }

    fetchMatchingDetail();
  }, [id, user]);

  const fetchMatchingDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // 매칭 정보 조회
      const { data: matchingData, error: matchingError } = await supabase
        .from('matchings')
        .select(`
          *,
          host:host_id (
            id,
            name,
            student_id,
            major,
            profile_image_url
          )
        `)
        .eq('id', id)
        .single();

      if (matchingError) throw matchingError;

      if (!matchingData) {
        toast.error('매칭을 찾을 수 없습니다');
        navigate('/matching');
        return;
      }

      setMatching(matchingData);

      // 내 신청 정보 조회
      const { data: applicationData } = await supabase
        .from('matching_applications')
        .select('id, status, created_at')
        .eq('matching_id', id)
        .eq('applicant_id', user?.id)
        .single();

      setMyApplication(applicationData);

      // 승인된 참가자 목록 조회 (승인된 경우에만)
      if (applicationData?.status === 'approved') {
        const { data: participantsData } = await supabase
          .from('matching_applications')
          .select(`
            applicant:applicant_id (
              id,
              name,
              student_id,
              major,
              profile_image_url,
              interests
            )
          `)
          .eq('matching_id', id)
          .eq('status', 'approved')
          .neq('applicant_id', user?.id); // 나를 제외한 참가자들

        if (participantsData) {
          setParticipants(participantsData.map(p => p.applicant).filter(Boolean));
        }
      }
    } catch (err: any) {
      console.error('매칭 상세 조회 에러:', err);
      toast.error('매칭 정보를 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!myApplication) return;

    try {
      const { error } = await supabase
        .from('matching_applications')
        .delete()
        .eq('id', myApplication.id);

      if (error) throw error;

      toast.success('신청이 취소되었습니다');
      navigate('/matching');
    } catch (err: any) {
      console.error('신청 취소 에러:', err);
      toast.error('신청 취소에 실패했습니다', {
        description: err.message || '다시 시도해주세요.',
      });
    }
  };

  const handleCancelMatching = async () => {
    if (!myApplication || !matching) return;

    try {
      // 신청 삭제
      const { error: deleteError } = await supabase
        .from('matching_applications')
        .delete()
        .eq('id', myApplication.id);

      if (deleteError) throw deleteError;

      // current_participants 감소
      const { error: updateError } = await supabase
        .from('matchings')
        .update({
          current_participants: Math.max(0, matching.current_participants - 1)
        })
        .eq('id', matching.id);

      if (updateError) throw updateError;

      toast.success('매칭이 취소되었습니다');
      navigate('/matching');
    } catch (err: any) {
      console.error('매칭 취소 에러:', err);
      toast.error('매칭 취소에 실패했습니다', {
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-[#FF6B35] to-[#FF8A65] shadow-lg">
        <div className="max-w-lg mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white">매칭 상세</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-4">
        {/* 내 신청 상태 */}
        {myApplication && (
          <Card className={`border-2 ${
            myApplication.status === 'approved'
              ? 'border-green-200 bg-green-50/30'
              : myApplication.status === 'pending'
              ? 'border-orange-200 bg-orange-50/30'
              : 'border-gray-200 bg-gray-50/30'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    myApplication.status === 'approved'
                      ? 'bg-green-600 hover:bg-green-600 text-white'
                      : myApplication.status === 'pending'
                      ? 'bg-orange-400 hover:bg-orange-400 text-white'
                      : 'bg-gray-400 hover:bg-gray-400 text-white'
                  }
                >
                  {myApplication.status === 'approved'
                    ? '승인됨'
                    : myApplication.status === 'pending'
                    ? '승인 대기중'
                    : '거절됨'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {myApplication.status === 'approved'
                    ? '매칭이 확정되었습니다'
                    : myApplication.status === 'pending'
                    ? '호스트의 승인을 기다리고 있습니다'
                    : '신청이 거절되었습니다'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 매칭 정보 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{matching.restaurant_name}</CardTitle>
                {matching.food_category && (
                  <Badge variant="outline" className="mt-2">
                    {matching.food_category}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(matching.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(matching.time)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  현재 {matching.current_participants}/{matching.max_participants}명
                </span>
              </div>
            </div>

            {matching.description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {matching.description}
                </p>
              </div>
            )}

            {/* 선호 조건 */}
            {(matching.preferred_gender?.length ||
              matching.preferred_student_ids?.length ||
              matching.preferred_majors?.length ||
              matching.preferred_interests?.length) && (
              <div className="pt-2 border-t space-y-2">
                <h3 className="text-sm font-semibold">선호 조건</h3>
                <div className="flex flex-wrap gap-1">
                  {matching.preferred_gender?.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {matching.preferred_student_ids?.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {matching.preferred_majors?.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {matching.preferred_interests?.map((item) => (
                    <Badge key={item} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 목적 & 분위기 */}
            {(matching.purpose?.length || matching.atmosphere?.length) && (
              <div className="pt-2 border-t space-y-2">
                {matching.purpose && matching.purpose.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">목적</h3>
                    <div className="flex flex-wrap gap-1">
                      {matching.purpose.map((item) => (
                        <Badge key={item} className="text-xs bg-blue-100 text-blue-700">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {matching.atmosphere && matching.atmosphere.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">분위기</h3>
                    <div className="flex flex-wrap gap-1">
                      {matching.atmosphere.map((item) => (
                        <Badge key={item} className="text-xs bg-purple-100 text-purple-700">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 호스트 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">호스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {matching.host?.profile_image_url ? (
                  <img
                    src={matching.host.profile_image_url}
                    alt={matching.host.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{matching.host?.name}</h3>
                {(matching.host?.major || matching.host?.student_id) && (
                  <p className="text-sm text-muted-foreground">
                    {matching.host.major} {matching.host.student_id}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 참가자 목록 (승인된 경우에만) */}
        {myApplication?.status === 'approved' && participants.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">함께하는 참가자</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {participant.profile_image_url ? (
                        <img
                          src={participant.profile_image_url}
                          alt={participant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{participant.name}</h3>
                      {(participant.major || participant.student_id) && (
                        <p className="text-xs text-muted-foreground">
                          {participant.major} {participant.student_id}
                        </p>
                      )}
                      {participant.interests && participant.interests.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-1">
                          {participant.interests.slice(0, 3).map((interest) => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {participant.interests.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{participant.interests.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 취소 버튼 영역 */}
        {myApplication && (myApplication.status === 'pending' || myApplication.status === 'approved') && (
          <div className="pt-4">
            {myApplication.status === 'pending' ? (
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleCancelApplication}
              >
                신청 취소하기
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    매칭 취소하기
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>매칭을 취소하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      승인된 매칭을 취소하면 다시 참여할 수 없을 수 있습니다.
                      정말 취소하시겠습니까?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>돌아가기</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelMatching}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      취소하기
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingDetail;
