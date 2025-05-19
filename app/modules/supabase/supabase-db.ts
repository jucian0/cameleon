export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blocked_profiles: {
        Row: {
          blocked_profile_id: string
          created_at: string | null
          id: number
          profile_id: string
        }
        Insert: {
          blocked_profile_id: string
          created_at?: string | null
          id?: number
          profile_id: string
        }
        Update: {
          blocked_profile_id?: string
          created_at?: string | null
          id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_profiles_blocked_profile_id_fkey"
            columns: ["blocked_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar: {
        Row: {
          created_at: string
          end_time: string
          guest_id: number | null
          host_id: number | null
          id: number
          room_id: number | null
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          guest_id?: number | null
          host_id?: number | null
          id?: number
          room_id?: number | null
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          guest_id?: number | null
          host_id?: number | null
          id?: number
          room_id?: number | null
          start_time?: string
        }
        Relationships: []
      }
      calls: {
        Row: {
          callee: string | null
          caller: string | null
          created_at: string
          id: number
        }
        Insert: {
          callee?: string | null
          caller?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          callee?: string | null
          caller?: string | null
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "calls_callee_fkey"
            columns: ["callee"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_caller_fkey"
            columns: ["caller"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          acronym: string
          name: string
        }
        Insert: {
          acronym: string
          name: string
        }
        Update: {
          acronym?: string
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          blocks: string[] | null
          email: string | null
          favorites: string[] | null
          id: string
          languages: string[] | null
          location: string | null
          name: string | null
          profession: string | null
          status: string | null
          topics: string[] | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          blocks?: string[] | null
          email?: string | null
          favorites?: string[] | null
          id: string
          languages?: string[] | null
          location?: string | null
          name?: string | null
          profession?: string | null
          status?: string | null
          topics?: string[] | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          blocks?: string[] | null
          email?: string | null
          favorites?: string[] | null
          id?: string
          languages?: string[] | null
          location?: string | null
          name?: string | null
          profession?: string | null
          status?: string | null
          topics?: string[] | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never
