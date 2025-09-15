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
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          last_login_at: string | null
          password_hash: string
          updated_at: string | null
          user_type: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          last_login_at?: string | null
          password_hash: string
          updated_at?: string | null
          user_type?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          last_login_at?: string | null
          password_hash?: string
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_backgrounds: {
        Row: {
          created_at: string
          display_order: number
          file_url: string
          id: string
          is_active: boolean
          name: string
          opacity: number
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          file_url: string
          id?: string
          is_active?: boolean
          name: string
          opacity?: number
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          file_url?: string
          id?: string
          is_active?: boolean
          name?: string
          opacity?: number
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_backgrounds: {
        Row: {
          created_at: string
          display_order: number
          file_url: string
          id: string
          is_active: boolean
          name: string
          opacity: number | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          file_url: string
          id?: string
          is_active?: boolean
          name: string
          opacity?: number | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          file_url?: string
          id?: string
          is_active?: boolean
          name?: string
          opacity?: number | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_categories: {
        Row: {
          created_at: string
          custom_type: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_type?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_type?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_edit_history: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          portfolio_item_id: string | null
          previous_data: Json | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          portfolio_item_id?: string | null
          previous_data?: Json | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          portfolio_item_id?: string | null
          previous_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_edit_history_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_edit_history_portfolio_item_id_fkey"
            columns: ["portfolio_item_id"]
            isOneToOne: false
            referencedRelation: "portfolio_items"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          category: string | null
          created_at: string | null
          date_taken: string | null
          description: string | null
          dimensions: Json | null
          display_order: number | null
          file_size: number | null
          file_url: string
          homepage_featured: boolean
          id: string
          is_featured: boolean | null
          item_status: string | null
          location: string | null
          media_type: string
          publish_status: string
          subcategory: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date_taken?: string | null
          description?: string | null
          dimensions?: Json | null
          display_order?: number | null
          file_size?: number | null
          file_url: string
          homepage_featured?: boolean
          id?: string
          is_featured?: boolean | null
          item_status?: string | null
          location?: string | null
          media_type: string
          publish_status?: string
          subcategory?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date_taken?: string | null
          description?: string | null
          dimensions?: Json | null
          display_order?: number | null
          file_size?: number | null
          file_url?: string
          homepage_featured?: boolean
          id?: string
          is_featured?: boolean | null
          item_status?: string | null
          location?: string | null
          media_type?: string
          publish_status?: string
          subcategory?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_portfolio_items_subcategory"
            columns: ["subcategory"]
            isOneToOne: false
            referencedRelation: "portfolio_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_subcategories: {
        Row: {
          category_id: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "portfolio_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonial_backgrounds: {
        Row: {
          created_at: string
          display_order: number
          file_url: string
          id: string
          is_active: boolean
          name: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          file_url: string
          id?: string
          is_active?: boolean
          name: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          file_url?: string
          id?: string
          is_active?: boolean
          name?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          background_image: string | null
          background_opacity: number
          created_at: string
          display_order: number
          event: string
          id: string
          image: string | null
          is_active: boolean
          name: string
          rating: number
          text: string
          updated_at: string
        }
        Insert: {
          background_image?: string | null
          background_opacity?: number
          created_at?: string
          display_order?: number
          event: string
          id?: string
          image?: string | null
          is_active?: boolean
          name: string
          rating?: number
          text: string
          updated_at?: string
        }
        Update: {
          background_image?: string | null
          background_opacity?: number
          created_at?: string
          display_order?: number
          event?: string
          id?: string
          image?: string | null
          is_active?: boolean
          name?: string
          rating?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_session: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
