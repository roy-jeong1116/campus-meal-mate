import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MatchCardProps {
  restaurantName: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  organizer: string;
  major: string;
}

const MatchCard = ({
  restaurantName,
  date,
  time,
  participants,
  maxParticipants,
  organizer,
  major,
}: MatchCardProps) => {
  const spotsLeft = maxParticipants - participants;

  return (
    <Card className="border-border hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-foreground mb-2">{restaurantName}</h3>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{time}</span>
            </div>
          </div>
          <Badge variant={spotsLeft > 0 ? "default" : "secondary"} className="shrink-0">
            <Users className="h-3 w-3 mr-1" />
            {participants}/{maxParticipants}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-accent-foreground">
              {organizer[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{organizer}</p>
            <p className="text-xs text-muted-foreground">{major}</p>
          </div>
        </div>

        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={spotsLeft === 0}
        >
          {spotsLeft > 0 ? "매칭 신청하기" : "마감되었습니다"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
