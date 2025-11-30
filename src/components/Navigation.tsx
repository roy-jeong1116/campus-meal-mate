import { Link, useLocation } from "react-router-dom";
import { Home, Search, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext"; // AuthContext 경로 확인 필요
import { supabase } from "@/lib/supabase"; // supabase 경로 확인 필요

const Navigation = () => {
  const location = useLocation();


  const { user } = useAuth(); // 로그인 유저 정보 가져오기
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkUnreadNotifications = async () => {
      // 읽지 않은(is_read = false) 알림이 하나라도 있는지 확인
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true }) // 데이터는 안 가져오고 개수만 셈
        .eq('user_id', user.id)
        .eq('is_read', false);

      setHasUnread(count !== null && count > 0);
    };

    checkUnreadNotifications();
    
    // (선택사항) 실시간으로 알림 오면 빨간점 바로 띄우기
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => { setHasUnread(true); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

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
                  <div className="relative">
                    <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                    
                    {/* 라벨이 '매칭'이고, 안 읽은 알림(hasUnread)이 true일 때만 빨간 점 표시 */}
                    {label === "매칭" && hasUnread && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
                    )}
                  </div>
                  
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
