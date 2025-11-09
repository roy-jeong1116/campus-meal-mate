import { Link, useLocation } from "react-router-dom";
import { Home, Search, Calendar, User, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('로그아웃되었습니다.', {
        description: '다음에 또 만나요!',
        duration: 2000,
      });
    } catch (error) {
      console.error('로그아웃 실패:', error);
      toast.error('로그아웃 실패', {
        description: '다시 시도해주세요.',
        duration: 3000,
      });
    }
  };

  const navItems = [
    { icon: Home, label: "홈", path: "/" },
    { icon: Search, label: "맛집", path: "/restaurants" },
    { icon: Calendar, label: "매칭", path: "/matching" },
    { icon: User, label: "프로필", path: "/profile" },
  ];

  return (
    <>
      {/* 상단 네비게이션 (로그인/로그아웃) */}
      <nav className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-primary">
            🍽️ 캠퍼스 밀메이트
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.name}님
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  로그인
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 하단 네비게이션 (메인 메뉴) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-6 w-6", isActive && "scale-110")} />
                  <span className="text-xs font-medium">{label}</span>
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
