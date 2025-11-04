export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      food_preferences: {
        Row: {
          created_at: string | null
          food_category: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          food_category: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          food_category?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          created_at: string | null
          id: string
          interest: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interest?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_participants: {
        Row: {
          id: string
          joined_at: string | null
          match_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          match_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          match_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          current_participants: number
          description: string | null
          id: string
          max_participants: number
          meet_date: string
          meet_time: string
          organizer_id: string
          restaurant_id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_participants?: number
          description?: string | null
          id?: string
          max_participants?: number
          meet_date: string
          meet_time: string
          organizer_id: string
          restaurant_id: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_participants?: number
          description?: string | null
          id?: string
          max_participants?: number
          meet_date?: string
          meet_time?: string
          organizer_id?: string
          restaurant_id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          gender: string | null
          id: string
          major: string | null
          match_count: number | null
          name: string
          rating: number | null
          student_id: string | null
          total_ratings: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          gender?: string | null
          id: string
          major?: string | null
          match_count?: number | null
          name: string
          rating?: number | null
          student_id?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          gender?: string | null
          id?: string
          major?: string | null
          match_count?: number | null
          name?: string
          rating?: number | null
          student_id?: string | null
          total_ratings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string
          category: string
          created_at: string | null
          description: string | null
          distance: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          price_range: string | null
          rating: number | null
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          address: string
          category: string
          created_at?: string | null
          description?: string | null
          distance?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          price_range?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          category?: string
          created_at?: string | null
          description?: string | null
          distance?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          price_range?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          restaurant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          restaurant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          restaurant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_friendly: boolean | null
          is_punctual: boolean | null
          is_respectful: boolean | null
          match_id: string
          rated_user_id: string
          rater_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_friendly?: boolean | null
          is_punctual?: boolean | null
          is_respectful?: boolean | null
          match_id: string
          rated_user_id: string
          rater_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_friendly?: boolean | null
          is_punctual?: boolean | null
          is_respectful?: boolean | null
          match_id?: string
          rated_user_id?: string
          rater_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_rated_user_id_fkey"
            columns: ["rated_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
