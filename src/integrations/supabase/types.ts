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
      fotofacil_banners: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fotofacil_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fotofacil_coupons: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_cents: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_cents?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_cents?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      fotofacil_customers: {
        Row: {
          cpf_hash: string
          created_at: string | null
          email: string
          id: string
          name: string
        }
        Insert: {
          cpf_hash: string
          created_at?: string | null
          email: string
          id?: string
          name: string
        }
        Update: {
          cpf_hash?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      fotofacil_events: {
        Row: {
          category_id: string | null
          cover_url: string | null
          created_at: string | null
          currency: string
          default_price_cents: number
          description: string | null
          event_date: string | null
          id: string
          is_active: boolean | null
          location: string | null
          slug: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string | null
          currency?: string
          default_price_cents?: number
          description?: string | null
          event_date?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string | null
          currency?: string
          default_price_cents?: number
          description?: string | null
          event_date?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fotofacil_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "fotofacil_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      fotofacil_order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          photo_id: string | null
          price_cents_snapshot: number | null
          title_snapshot: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          photo_id?: string | null
          price_cents_snapshot?: number | null
          title_snapshot?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          photo_id?: string | null
          price_cents_snapshot?: number | null
          title_snapshot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fotofacil_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "fotofacil_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotofacil_order_items_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "fotofacil_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      fotofacil_orders: {
        Row: {
          coupon_id: string | null
          created_at: string | null
          currency: string
          customer_id: string | null
          delivered_at: string | null
          delivery_expires_at: string | null
          delivery_token: string | null
          discount_cents: number | null
          id: string
          mercadopago_order_id: string | null
          mercadopago_payment_id: string | null
          original_total_cents: number | null
          pix_copia_cola: string | null
          qr_code: string | null
          qr_code_base64: string | null
          status: string
          total_cents: number
          updated_at: string | null
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string | null
          currency?: string
          customer_id?: string | null
          delivered_at?: string | null
          delivery_expires_at?: string | null
          delivery_token?: string | null
          discount_cents?: number | null
          id?: string
          mercadopago_order_id?: string | null
          mercadopago_payment_id?: string | null
          original_total_cents?: number | null
          pix_copia_cola?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          total_cents: number
          updated_at?: string | null
        }
        Update: {
          coupon_id?: string | null
          created_at?: string | null
          currency?: string
          customer_id?: string | null
          delivered_at?: string | null
          delivery_expires_at?: string | null
          delivery_token?: string | null
          discount_cents?: number | null
          id?: string
          mercadopago_order_id?: string | null
          mercadopago_payment_id?: string | null
          original_total_cents?: number | null
          pix_copia_cola?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          total_cents?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fotofacil_orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "fotofacil_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fotofacil_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "fotofacil_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      fotofacil_photos: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          event_id: string | null
          height: number | null
          id: string
          is_active: boolean | null
          price_cents: number | null
          size_bytes: number | null
          thumb_url: string | null
          title: string | null
          updated_at: string | null
          url: string
          width: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          price_cents?: number | null
          size_bytes?: number | null
          thumb_url?: string | null
          title?: string | null
          updated_at?: string | null
          url: string
          width?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          price_cents?: number | null
          size_bytes?: number | null
          thumb_url?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fotofacil_photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "fotofacil_events"
            referencedColumns: ["id"]
          },
        ]
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
          slide_duration: number | null
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
          slide_duration?: number | null
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
          slide_duration?: number | null
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
          created_at: string
          id: string
          new_data: Json | null
          portfolio_item_id: string | null
          previous_data: Json | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          portfolio_item_id?: string | null
          previous_data?: Json | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          portfolio_item_id?: string | null
          previous_data?: Json | null
        }
        Relationships: [
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
          other_works_featured: boolean
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
          other_works_featured?: boolean
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
          other_works_featured?: boolean
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
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          last_login_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          last_login_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          last_login_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          display_order: number
          features: string[]
          icon: string
          id: string
          is_active: boolean
          is_highlighted: boolean
          price: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number
          features?: string[]
          icon?: string
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          price: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          features?: string[]
          icon?: string
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          price?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
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
          show_on_homepage: boolean | null
          status: string | null
          submitted_by: string | null
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
          show_on_homepage?: boolean | null
          status?: string | null
          submitted_by?: string | null
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
          show_on_homepage?: boolean | null
          status?: string | null
          submitted_by?: string | null
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_users_list: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          last_login_at: string
          user_type: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_session: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "collaborator"
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
    Enums: {
      app_role: ["admin", "collaborator"],
    },
  },
} as const
