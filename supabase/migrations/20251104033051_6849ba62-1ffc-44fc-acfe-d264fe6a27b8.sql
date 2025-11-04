-- 프로필 테이블 생성
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  major TEXT,
  student_id TEXT,
  gender TEXT,
  bio TEXT,
  avatar_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_ratings INTEGER DEFAULT 0,
  match_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "프로필은 모두가 볼 수 있음"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "사용자는 자신의 프로필만 수정 가능"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필만 삽입 가능"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 관심사 테이블
CREATE TABLE public.interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "관심사는 모두가 볼 수 있음"
  ON public.interests FOR SELECT
  USING (true);

CREATE POLICY "사용자는 자신의 관심사만 관리 가능"
  ON public.interests FOR ALL
  USING (auth.uid() = user_id);

-- 선호 음식 테이블
CREATE TABLE public.food_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  food_category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.food_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "선호 음식은 모두가 볼 수 있음"
  ON public.food_preferences FOR SELECT
  USING (true);

CREATE POLICY "사용자는 자신의 선호 음식만 관리 가능"
  ON public.food_preferences FOR ALL
  USING (auth.uid() = user_id);

-- 맛집 테이블
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  distance TEXT,
  price_range TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "맛집은 모두가 볼 수 있음"
  ON public.restaurants FOR SELECT
  USING (true);

-- 리뷰 테이블
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "리뷰는 모두가 볼 수 있음"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "사용자는 자신의 리뷰만 작성/수정/삭제 가능"
  ON public.reviews FOR ALL
  USING (auth.uid() = user_id);

-- 매칭 테이블
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meet_date DATE NOT NULL,
  meet_time TIME NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 4,
  current_participants INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "매칭은 모두가 볼 수 있음"
  ON public.matches FOR SELECT
  USING (true);

CREATE POLICY "사용자는 자신이 만든 매칭만 수정/삭제 가능"
  ON public.matches FOR UPDATE
  USING (auth.uid() = organizer_id);

CREATE POLICY "사용자는 자신이 만든 매칭만 삭제 가능"
  ON public.matches FOR DELETE
  USING (auth.uid() = organizer_id);

CREATE POLICY "로그인한 사용자는 매칭 생성 가능"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

-- 매칭 참가자 테이블
CREATE TABLE public.match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(match_id, user_id)
);

ALTER TABLE public.match_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "매칭 참가자는 모두가 볼 수 있음"
  ON public.match_participants FOR SELECT
  USING (true);

CREATE POLICY "사용자는 자신의 참가 신청만 관리 가능"
  ON public.match_participants FOR ALL
  USING (auth.uid() = user_id);

-- 사용자 평가 테이블
CREATE TABLE public.user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  is_punctual BOOLEAN,
  is_friendly BOOLEAN,
  is_respectful BOOLEAN,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(match_id, rater_id, rated_user_id)
);

ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "사용자 평가는 익명으로 처리"
  ON public.user_ratings FOR SELECT
  USING (auth.uid() = rated_user_id);

CREATE POLICY "사용자는 매칭 참가자만 평가 가능"
  ON public.user_ratings FOR INSERT
  WITH CHECK (auth.uid() = rater_id);

-- 리뷰 평균 업데이트 함수
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.restaurants
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE restaurant_id = NEW.restaurant_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE restaurant_id = NEW.restaurant_id)
  WHERE id = NEW.restaurant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurant_rating_trigger
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();

-- 사용자 평점 업데이트 함수
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.user_ratings WHERE rated_user_id = NEW.rated_user_id),
    total_ratings = (SELECT COUNT(*) FROM public.user_ratings WHERE rated_user_id = NEW.rated_user_id)
  WHERE id = NEW.rated_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_rating_trigger
AFTER INSERT OR UPDATE ON public.user_ratings
FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- 매칭 참가자 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_match_participants_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.matches
  SET 
    current_participants = (SELECT COUNT(*) FROM public.match_participants WHERE match_id = NEW.match_id AND status = 'accepted') + 1,
    status = CASE 
      WHEN (SELECT COUNT(*) FROM public.match_participants WHERE match_id = NEW.match_id AND status = 'accepted') + 1 >= max_participants THEN 'full'
      ELSE 'active'
    END
  WHERE id = NEW.match_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_match_participants_trigger
AFTER INSERT OR UPDATE ON public.match_participants
FOR EACH ROW EXECUTE FUNCTION update_match_participants_count();

-- 샘플 데이터 삽입
INSERT INTO public.restaurants (name, category, description, address, distance, price_range, image_url, rating, total_reviews) VALUES
('매운 떡볶이 김밥', '분식', '학생들에게 인기 많은 분식집', '학교 정문 앞', '학교 정문 50m', '5,000원 ~ 8,000원', '/placeholder.svg', 4.8, 24),
('건강한 비빔밥', '한식', '신선한 재료로 만드는 비빔밥 전문점', '학교 후문', '학교 후문 100m', '8,000원 ~ 12,000원', '/placeholder.svg', 4.9, 31),
('라면 하우스', '일식', '다양한 라면 메뉴를 제공하는 일식당', '학교 정문', '학교 정문 200m', '6,000원 ~ 10,000원', '/placeholder.svg', 4.7, 18),
('치킨 앤 베어', '치킨', '바삭한 치킨과 맥주를 즐길 수 있는 곳', '학교 정문', '학교 정문 150m', '15,000원 ~ 20,000원', '/placeholder.svg', 4.6, 42);