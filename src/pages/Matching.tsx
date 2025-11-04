import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Matching = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeMatches, setActiveMatches] = useState<any[]>([]);
  const [myMatches, setMyMatches] = useState<any[]>([]);

  useEffect(() => {
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    const { data: activeMa } = await supabase
      .from("matches")
      .select(`
        *,
        restaurants (name),
        profiles (name, major, student_id)
      `)
      .eq("status", "active")
      .order("meet_date", { ascending: true });

    if (activeMa) {
      setActiveMatches(activeMa.map(m => ({
        id: m.id,
        restaurantName: m.restaurants?.name || "",
        date: new Date(m.meet_date).toLocaleDateString('ko-KR'),
        time: m.meet_time,
        participants: m.current_participants,
        maxParticipants: m.max_participants,
        organizer: m.profiles?.name || "",
        major: `${m.profiles?.major || ""} ${m.profiles?.student_id || ""}`,
      })));
    }

    if (user) {
      const { data: myMa } = await supabase
        .from("matches")
        .select(`
          *,
          restaurants (name),
          profiles (name, major, student_id)
        `)
        .eq("organizer_id", user.id)
        .order("meet_date", { ascending: true });

      if (myMa) {
        setMyMatches(myMa.map(m => ({
          id: m.id,
          restaurantName: m.restaurants?.name || "",
          date: new Date(m.meet_date).toLocaleDateString('ko-KR'),
          time: m.meet_time,
          participants: m.current_participants,
          maxParticipants: m.max_participants,
          organizer: m.profiles?.name || "",
          major: `${m.profiles?.major || ""} ${m.profiles?.student_id || ""}`,
        })));
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">식사 매칭</h1>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => navigate("/matching/create")}
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
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => navigate("/matching/create")}
                >
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
