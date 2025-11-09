import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      console.log('=== 회원가입 시작 ===');
      console.log('전달받은 userData:', userData);
      
      // Supabase Auth에 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('회원가입에 실패했습니다.');

      console.log('Auth 사용자 생성 완료:', authData.user.id);

      // users 테이블에 추가 정보 저장
      const insertData = {
        id: authData.user.id,
        email: authData.user.email!,
        password_hash: '', // Supabase Auth가 관리하므로 빈 값
        name: userData.name || '',
        student_id: userData.student_id,
        major: userData.major,
        gender: userData.gender,
        phone_number: userData.phone_number,
        profile_image_url: userData.profile_image_url || null,
        interests: userData.interests || [],
        preferred_foods: userData.preferred_foods || [],
      };

      console.log('DB에 저장할 데이터:', insertData);

      const { error: profileError } = await supabase.from('users').insert(insertData);

      if (profileError) {
        console.error('프로필 저장 에러:', profileError);
        throw profileError;
      }

      console.log('프로필 저장 완료');

      // 프로필 정보 가져오기
      await fetchUserProfile(authData.user.id);
      console.log('=== 회원가입 완료 ===');
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || '로그아웃 중 오류가 발생했습니다.');
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      console.log('Refreshing user profile...');
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        console.log('User profile refreshed:', data);
        setUser(data);
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
