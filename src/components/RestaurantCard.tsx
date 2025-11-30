import { MapPin, Users, ChevronRight, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface RestaurantCardProps {
  id: string;
  imageUrl?: string;
  name: string;
  category: string;
  address?: string;
  phoneNumber?: string;
  availableMatches?: number;
}

const RestaurantCard = ({
  id,
  imageUrl,
  name,
  category,
  address,
  phoneNumber,
  availableMatches,
}: RestaurantCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/restaurants/${id}`);
  };

  return (
    <Card
      className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-200 cursor-pointer bg-gradient-to-br from-white to-orange-50/30"
      onClick={handleClick}
    >
      {/* 이미지 영역 */}
      <div className="relative h-52 overflow-hidden">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-red-50">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🍽️</span>
          </div>
        )}

        {/* 매칭 가능 배지 */}
        {availableMatches && availableMatches > 0 && (
          <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg border-0 px-3 py-1.5 animate-in fade-in slide-in-from-top-2">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            <span className="font-semibold">{availableMatches}명 매칭 가능</span>
          </Badge>
        )}

        {/* 카테고리 배지 */}
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-white/95 backdrop-blur-sm text-orange-700 hover:bg-white border-0 shadow-lg px-3 py-1.5 font-semibold">
            {category}
          </Badge>
        </div>
      </div>

      {/* 정보 영역 */}
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-gray-800 mb-1.5 group-hover:text-orange-600 transition-colors duration-200 line-clamp-1">
              {name}
            </h3>
          </div>

          {/* 화살표 아이콘 */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 group-hover:bg-orange-500 flex items-center justify-center transition-all duration-300 ml-3">
            <ChevronRight className="h-5 w-5 text-orange-600 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </div>

        {/* 하단 정보 */}
        {(address || phoneNumber) && (
          <div className="flex items-center gap-3 pt-3 border-t border-orange-100">
            {address && (
              <div className="flex items-center gap-1.5 text-gray-600 flex-1 min-w-0">
                <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{address}</span>
              </div>
            )}
            {address && phoneNumber && (
              <div className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
            )}
            {phoneNumber && (
              <div className="flex items-center gap-1.5 text-gray-600 flex-shrink-0">
                <Phone className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">{phoneNumber}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
