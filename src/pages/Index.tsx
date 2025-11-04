import { Button } from "@/components/ui/button";
import { ArrowRight, Users, UtensilsCrossed, Star, LogIn, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-dining.jpg";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">밥친구</h1>
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              로그아웃
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-foreground"
            >
              <LogIn className="h-4 w-4 mr-2" />
              로그인
            </Button>
          )}
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
            함께 먹으면
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              더 맛있어요
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 drop-shadow-md">
            학교 근처 맛집과 식사 메이트를 동시에 찾아보세요
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/restaurants">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6"
              >
                맛집 둘러보기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/matching">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white hover:bg-white/90 text-foreground shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6"
              >
                매칭 시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            왜 밥메이트인가요?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300">
              <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
                <UtensilsCrossed className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">맛집 탐색</h3>
              <p className="text-muted-foreground leading-relaxed">
                학교 근처 검증된 맛집을 한눈에 찾아보고, 실시간 리뷰와 평점을 확인하세요.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300">
              <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">식사 매칭</h3>
              <p className="text-muted-foreground leading-relaxed">
                같은 학교 학생들과 매칭되어 함께 식사하며 새로운 인연을 만들어보세요.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300">
              <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-foreground">신뢰 평가</h3>
              <p className="text-muted-foreground leading-relaxed">
                식사 후 간단한 평가로 더 나은 매칭 경험을 만들어갑니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl mb-8 text-white/90">
            혼자 먹는 밥이 아닌, 함께하는 식사의 즐거움을 느껴보세요
          </p>
          <Link to="/matching">
            <Button 
              size="lg" 
              className="bg-white hover:bg-white/90 text-primary shadow-xl hover:shadow-2xl transition-all text-lg px-10 py-6"
            >
              첫 매칭 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Navigation />
    </div>
  );
};

export default Index;
