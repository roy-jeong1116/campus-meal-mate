import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qagvdbezugotepoiflvw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZ3ZkYmV6dWdvdGVwb2lmbHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNjg1NjMsImV4cCI6MjA3Nzk0NDU2M30.e8kNxM5uA1UK3jn_SoBORpXpQPyjKJbqv6J1y6mouUc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의
export interface User {
  id: string;
  email: string;
  name: string;
  student_id?: string;
  major?: string;
  gender?: string;
  phone_number?: string;
  profile_image_url?: string;
  interests?: string[];
  preferred_foods?: string[];
  average_rating?: number;
  rating_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OpeningHours {
  mon?: { open: string; close: string } | { closed: true };
  tue?: { open: string; close: string } | { closed: true };
  wed?: { open: string; close: string } | { closed: true };
  thu?: { open: string; close: string } | { closed: true };
  fri?: { open: string; close: string } | { closed: true };
  sat?: { open: string; close: string } | { closed: true };
  sun?: { open: string; close: string } | { closed: true };
}

export interface Restaurant {
  id: string; // UUID
  name: string;
  category: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  price_range?: number; // 1: 저렴, 2: 보통, 3: 비쌈
  phone_number?: string;
  opening_hours?: OpeningHours;
  description?: string;
  image_urls?: string[];
  average_rating?: number;
  review_count?: number;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
}

// 가격대를 문자열로 변환하는 헬퍼 함수
export const getPriceRangeText = (priceRange?: number): string => {
  if (!priceRange) return '';
  const ranges: Record<number, string> = {
    1: '5,000원 ~ 10,000원',
    2: '10,000원 ~ 20,000원',
    3: '20,000원 이상',
  };
  return ranges[priceRange] || '';
};

// 영업시간을 읽기 쉬운 문자열로 변환하는 헬퍼 함수
export const formatOpeningHours = (openingHours?: OpeningHours): string => {
  if (!openingHours) return '';

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayNames: Record<string, string> = {
    mon: '월',
    tue: '화',
    wed: '수',
    thu: '목',
    fri: '금',
    sat: '토',
    sun: '일',
  };

  const lines: string[] = [];
  days.forEach(day => {
    const hours = openingHours[day as keyof OpeningHours];
    if (hours) {
      if ('closed' in hours) {
        lines.push(`${dayNames[day]}: 휴무`);
      } else {
        lines.push(`${dayNames[day]}: ${hours.open} - ${hours.close}`);
      }
    }
  });

  return lines.join('\n');
};
