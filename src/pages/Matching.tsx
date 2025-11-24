import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Matching = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateMatching = () => {
    if (!user) {
      toast.error('로그인이 필요합니다', {
        description: '매칭을 만들려면 로그인해주세요.',
        duration: 3000,
      });
      // 로그인 후 매칭 만들기 페이지로 돌아오도록 경로 전달
      navigate('/login', { state: { from: '/matching/create' } });
      return;
    }
    navigate('/matching/create');
  };

  const handleApplyMatching = () => {
    if (!user) {
      toast.error('로그인이 필요합니다', {
        description: '매칭 신청을 하려면 로그인해주세요.',
        duration: 3000,
      });
      // 로그인 후 매칭 페이지로 돌아오도록 경로 전달
      navigate('/login', { state: { from: '/matching' } });
      return;
    }
    // TODO: 매칭 신청 로직 구현
    toast.success('매칭 신청이 완료되었습니다!');
  };

  const activeMatches = [
    {
      id: 1,
      restaurantName: "매운 떡볶이 김밥",
      date: "2025년 1월 15일",
      time: "12:00 PM",
      participants: 2,
      maxParticipants: 4,
      organizer: "김민수",
      major: "컴퓨터공학과 21학번",
    },
    {
      id: 2,
      restaurantName: "건강한 비빔밥",
      date: "2025년 1월 16일",
      time: "1:00 PM",
      participants: 3,
      maxParticipants: 4,
      organizer: "이지은",
      major: "경영학과 20학번",
    },
    {
      id: 3,
      restaurantName: "라면 하우스",
      date: "2025년 1월 15일",
      time: "6:30 PM",
      participants: 1,
      maxParticipants: 3,
      organizer: "박서준",
      major: "디자인학과 22학번",
    },
  ];

  const myMatches = [
    {
      id: 4,
      restaurantName: "치킨 앤 베어",
      date: "2025년 1월 14일",
      time: "7:00 PM",
      participants: 4,
      maxParticipants: 4,
      organizer: "정수아",
      major: "영문학과 19학번",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Tabs defaultValue="active" className="w-full">
        {/* Fixed Header with Title, Button, and Tabs */}
        <div className="sticky top-0 z-40 bg-background shadow-sm">
          <div className="max-w-lg mx-auto px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">식사 매칭</h1>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                onClick={handleCreateMatching}
              >
                <Plus className="h-5 w-5 mr-2" />
                매칭 만들기
              </Button>
            </div>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                모집 중 ({activeMatches.length})
              </TabsTrigger>
              <TabsTrigger
                value="my"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    toast.error('로그인이 필요합니다', {
                      description: '내 매칭을 보려면 로그인해주세요.',
                      duration: 3000,
                    });
                    // 로그인 후 매칭 페이지로 돌아오도록 경로 전달
                    navigate('/login', { state: { from: '/matching' } });
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
          <TabsContent value="active" className="space-y-4 mt-0">
            {activeMatches.map((match) => (
              <MatchCard key={match.id} {...match} onApply={handleApplyMatching} />
            ))}
          </TabsContent>

          <TabsContent value="my" className="space-y-4 mt-0">
            {myMatches.map((match) => (
              <MatchCard key={match.id} {...match} onApply={handleApplyMatching} />
            ))}
            {myMatches.length === 0 && (
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
        </div>
      </Tabs>

      <Navigation />
    </div>
  );
};

export default Matching;
