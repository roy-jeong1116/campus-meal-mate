import { Star, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RestaurantCardProps {
  image: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  priceRange: string;
  availableMatches: number;
}

const RestaurantCard = ({
  image,
  name,
  category,
  rating,
  distance,
  priceRange,
  availableMatches,
}: RestaurantCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {availableMatches > 0 && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-md">
            <Users className="h-3 w-3 mr-1" />
            {availableMatches}명 매칭 가능
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg text-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground">{category}</p>
          </div>
          <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded-lg">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-semibold text-accent-foreground">{rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{distance}</span>
          </div>
          <span>•</span>
          <span>{priceRange}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
