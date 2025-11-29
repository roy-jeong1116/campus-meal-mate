import { Calendar, Clock, Users, Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface MatchCardProps {
  id: string;
  restaurantName: string;
  foodCategory?: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  organizer: string;
  major: string;
  profileImageUrl?: string;
  description?: string;
  preferredGender?: string[];
  preferredStudentIds?: string[];
  preferredMajors?: string[];
  preferredInterests?: string[];
  purpose?: string[];
  atmosphere?: string[];
  matchScore?: number; // 적합도 (0-100)
  userGender?: string;
  userStudentId?: string;
  userMajor?: string;
  userInterests?: string[];
  onApply?: (matchingId: string) => void;
  onManage?: (matchingId: string) => void;
  applicationStatus?: 'pending' | 'approved' | 'rejected';
  isHost?: boolean;
  timeWarning?: string; // 시간 마감 임박 경고
  spotsWarning?: string; // 인원 마감 임박 경고
}

const MatchCard = ({
  id,
  restaurantName,
  foodCategory,
  date,
  time,
  participants,
  maxParticipants,
  organizer,
  major,
  profileImageUrl,
  description,
  preferredGender,
  preferredStudentIds,
  preferredMajors,
  preferredInterests,
  purpose,
  atmosphere,
  matchScore,
  userGender,
  userStudentId,
  userMajor,
  userInterests,
  onApply,
  onManage,
  applicationStatus,
  isHost,
  timeWarning,
  spotsWarning,
}: MatchCardProps) => {
  const navigate = useNavigate();
  const spotsLeft = maxParticipants - participants;

  // 일치하는 관심사 확인
  const matchingInterests = preferredInterests?.filter(interest =>
    userInterests?.includes(interest)
  ) || [];

  // 카테고리별로 선호 특성 그룹화
  const basicPreferences: string[] = []; // 성별, 학번, 전공
  const interestPreferences: string[] = []; // 관심사
  const purposeList: string[] = []; // 목적
  const atmosphereList: string[] = []; // 분위기

  preferredGender?.forEach((item) => {
    basicPreferences.push(item === userGender ? `✓ ${item}` : item);
  });

  preferredStudentIds?.forEach((item) => {
    basicPreferences.push(item === userStudentId ? `✓ ${item}` : item);
  });

  preferredMajors?.forEach((item) => {
    basicPreferences.push(item === userMajor ? `✓ ${item}` : item);
  });

  preferredInterests?.forEach((item) => {
    if (matchingInterests.includes(item)) {
      interestPreferences.push(`✓ ${item}`);
    } else {
      interestPreferences.push(item);
    }
  });

  purpose?.forEach((item) => {
    purposeList.push(item);
  });

  atmosphere?.forEach((item) => {
    atmosphereList.push(item);
  });

  return (
    <Card className={`border-2 transition-all duration-300 ${
      matchScore && matchScore >= 70
        ? 'border-orange-300 bg-orange-50/30 hover:shadow-xl hover:border-orange-400'
        : 'border-border hover:shadow-lg'
    }`}>
      <CardContent className="p-3">
        {/* 마감 임박 경고 뱃지 */}
        {(timeWarning || spotsWarning) && (
          <div className="flex gap-1.5 mb-2">
            {timeWarning && (
              <Badge className="bg-red-100 text-red-700 border border-red-300 font-bold text-xs">
                ⏰ {timeWarning}
              </Badge>
            )}
            {spotsWarning && (
              <Badge className="bg-orange-100 text-orange-700 border border-orange-300 font-bold text-xs">
                🔥 {spotsWarning}
              </Badge>
            )}
          </div>
        )}

        {/* 헤더: 식당명 + 인원 + 적합도 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <h3 className="font-bold text-base text-foreground">{restaurantName}</h3>
              {isHost && (
                <Badge className="bg-blue-100 text-blue-700 border border-blue-300">
                  내 매칭
                </Badge>
              )}
              {matchScore !== undefined && !isHost && (
                <Badge
                  className={`font-bold ${
                    matchScore >= 80
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : matchScore >= 60
                      ? 'bg-orange-200 text-orange-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {matchScore}% 적합
                </Badge>
              )}
            </div>
            {foodCategory && (
              <Badge variant="outline" className="text-xs">
                <Utensils className="h-3 w-3 mr-1" />
                {foodCategory}
              </Badge>
            )}
          </div>
          <Badge variant={spotsLeft > 0 ? "default" : "secondary"} className="shrink-0">
            <Users className="h-3 w-3 mr-1" />
            {participants}/{maxParticipants}
          </Badge>
        </div>

        {/* 날짜 & 시간 */}
        <div className="space-y-1 mb-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">{date}</span>
            <Clock className="h-3.5 w-3.5 text-muted-foreground ml-2 flex-shrink-0" />
            <span className="text-foreground">{time}</span>
          </div>

          {/* 선호 특성 - 카테고리별 */}
          {(basicPreferences.length > 0 || interestPreferences.length > 0 || purposeList.length > 0 || atmosphereList.length > 0) && (
            <div className="space-y-0.5">
              {/* 기본 조건 (성별, 학번, 전공) */}
              {basicPreferences.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-semibold">조건</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {basicPreferences.map((item, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${
                          item.startsWith('✓')
                            ? 'bg-orange-100 text-orange-700 font-semibold'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 관심사 */}
              {interestPreferences.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-semibold">관심</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {interestPreferences.map((item, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${
                          item.startsWith('✓')
                            ? 'bg-orange-100 text-orange-700 font-semibold'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 목적 */}
              {purposeList.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-semibold">목적</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {purposeList.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 분위기 */}
              {atmosphereList.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-semibold">분위기</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {atmosphereList.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 메모장 박스: 유저 정보 + 매칭 설명 */}
        <div className="mb-2 p-2.5 bg-amber-50/50 rounded border-l-4 border-amber-400/50 shadow-sm">
          {/* 유저 정보 */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="h-6 w-6 rounded-full bg-amber-200/70 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={organizer}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold text-amber-900">
                  {organizer[0]}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{organizer}</p>
              {major && <p className="text-[10px] text-muted-foreground truncate">{major}</p>}
            </div>
          </div>

          {/* 매칭 설명 */}
          {description && (
            <div className="pl-8">
              <p className="text-xs text-foreground/80 leading-snug italic">{description}</p>
            </div>
          )}
        </div>

        {/* 버튼 */}
        {onManage ? (
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => onManage(id)}
          >
            매칭 관리하기
          </Button>
        ) : isHost ? (
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => navigate(`/matching/${id}/manage`)}
          >
            매칭 관리하기
          </Button>
        ) : applicationStatus ? (
          <div className="w-full">
            <Badge
              className={`w-full justify-center py-2 text-sm ${
                applicationStatus === 'approved'
                  ? 'bg-green-600 hover:bg-green-600 text-white'
                  : applicationStatus === 'pending'
                  ? 'bg-orange-400 hover:bg-orange-400 text-white'
                  : 'bg-gray-400 hover:bg-gray-400 text-white'
              }`}
            >
              {applicationStatus === 'approved'
                ? '승인됨'
                : applicationStatus === 'pending'
                ? '대기중'
                : '거절됨'}
            </Badge>
          </div>
        ) : (
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={spotsLeft === 0}
            onClick={() => onApply?.(id)}
          >
            {spotsLeft > 0 ? "매칭 신청하기" : "마감되었습니다"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchCard;
