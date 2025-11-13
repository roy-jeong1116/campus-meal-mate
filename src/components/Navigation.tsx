import { Link, useLocation } from "react-router-dom";
import { Home, Search, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "홈", path: "/" },
    { icon: Search, label: "맛집", path: "/restaurants" },
    { icon: Calendar, label: "매칭", path: "/matching" },
    { icon: User, label: "프로필", path: "/profile" },
  ];

  return (
    <>
      {/* 하단 네비게이션 (메인 메뉴) - 모바일 앱 스타일 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg z-50 border-t border-border/50 safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 min-w-[64px] h-12 rounded-2xl transition-all duration-200",
                    isActive
                      ? "text-primary scale-105"
                      : "text-muted-foreground hover:text-foreground active:scale-95"
                  )}
                >
                  <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                  <span className={cn(
                    "text-[10px] font-medium transition-all",
                    isActive && "font-semibold"
                  )}>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
