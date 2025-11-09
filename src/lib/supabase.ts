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
