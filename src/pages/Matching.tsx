import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Matching = () => {
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
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">식사 매칭</h1>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-5 w-5 mr-1" />
              매칭 만들기
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 py-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active">
              모집 중 ({activeMatches.length})
            </TabsTrigger>
            <TabsTrigger value="my">
              내 매칭 ({myMatches.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {activeMatches.map((match) => (
              <MatchCard key={match.id} {...match} />
            ))}
          </TabsContent>
          
          <TabsContent value="my" className="space-y-4">
            {myMatches.map((match) => (
              <MatchCard key={match.id} {...match} />
            ))}
            {myMatches.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  아직 참여한 매칭이 없습니다
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-5 w-5 mr-1" />
                  첫 매칭 만들기
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Navigation />
    </div>
  );
};

export default Matching;
