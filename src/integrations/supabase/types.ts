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
      activity_logs: {
        Row: {
          action_type: string
          booking_id: string | null
          created_at: string
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          staff_id: string | null
        }
        Insert: {
          action_type: string
          booking_id?: string | null
          created_at?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          staff_id?: string | null
        }
        Update: {
          action_type?: string
          booking_id?: string | null
          created_at?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          id: string
          user_id: string | null
          name: string
          specialization: string
          working_days: string[]
          start_time: string
          end_time: string
          break_start: string | null
          break_end: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          specialization: string
          working_days?: string[]
          start_time?: string
          end_time?: string
          break_start?: string | null
          break_end?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          specialization?: string
          working_days?: string[]
          start_time?: string
          end_time?: string
          break_start?: string | null
          break_end?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clinic_settings: {
        Row: {
          id: string
          name: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          value: Json
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      doctor_services: {
        Row: {
          id: string
          doctor_id: string
          service_id: string
          created_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          service_id: string
          created_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          service_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_services_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["id"]
          }
        ]
      }
      clinic_services: {
        Row: {
          id: string
          service_name: string
          description: string | null
          duration_minutes: number
          buffer_minutes: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          service_name: string
          description?: string | null
          duration_minutes?: number
          buffer_minutes?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          service_name?: string
          description?: string | null
          duration_minutes?: number
          buffer_minutes?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          booking_id: string
          patient_name: string
          patient_email: string | null
          patient_phone: string
          service_id: string
          doctor_id: string
          appointment_date: string
          appointment_start: string
          appointment_end: string
          status: string
          additional_notes: string | null
          is_emergency: boolean
          reminder_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id?: string
          patient_name: string
          patient_email?: string | null
          patient_phone: string
          service_id: string
          doctor_id: string
          appointment_date: string
          appointment_start: string
          appointment_end: string
          status?: string
          additional_notes?: string | null
          is_emergency?: boolean
          reminder_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          patient_name?: string
          patient_email?: string | null
          patient_phone?: string
          service_id?: string
          doctor_id?: string
          appointment_date?: string
          appointment_start?: string
          appointment_end?: string
          status?: string
          additional_notes?: string | null
          is_emergency?: boolean
          reminder_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["id"]
          }
        ]
      }
      appointment_locks: {
        Row: {
          id: string
          doctor_id: string
          appointment_date: string
          start_time: string
          end_time: string
          locked_until: string
          session_id: string
          created_at: string
        }
        Insert: {
          id?: string
          doctor_id: string
          appointment_date: string
          start_time: string
          end_time: string
          locked_until: string
          session_id: string
          created_at?: string
        }
        Update: {
          id?: string
          doctor_id?: string
          appointment_date?: string
          start_time?: string
          end_time?: string
          locked_until?: string
          session_id?: string
          created_at?: string
        }
        Relationships: []
      }
      waitlists: {
        Row: {
          id: string
          patient_name: string
          patient_email: string | null
          patient_phone: string
          service_id: string
          preferred_date: string
          doctor_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_name: string
          patient_email?: string | null
          patient_phone: string
          service_id: string
          preferred_date: string
          doctor_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_name?: string
          patient_email?: string | null
          patient_phone?: string
          service_id?: string
          preferred_date?: string
          doctor_id?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          additional_notes: string | null
          appointment_date: string
          appointment_time: string
          booking_id: string
          created_at: string
          doctor_preference: string | null
          id: string
          patient_email: string
          patient_name: string
          patient_phone: string
          service_type: string
          status: string
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          appointment_date: string
          appointment_time: string
          booking_id: string
          created_at?: string
          doctor_preference?: string | null
          id?: string
          patient_email: string
          patient_name: string
          patient_phone: string
          service_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          appointment_date?: string
          appointment_time?: string
          booking_id?: string
          created_at?: string
          doctor_preference?: string | null
          id?: string
          patient_email?: string
          patient_name?: string
          patient_phone?: string
          service_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          id: string
          last_visit_date: string | null
          medical_notes: string | null
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          id?: string
          last_visit_date?: string | null
          medical_notes?: string | null
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          id?: string
          last_visit_date?: string | null
          medical_notes?: string | null
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
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
      visit_history: {
        Row: {
          booking_id: string | null
          created_at: string
          doctor_name: string | null
          id: string
          notes: string | null
          patient_id: string
          service_provided: string
          visit_date: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          doctor_name?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          service_provided: string
          visit_date: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          doctor_name?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          service_provided?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_booking_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "receptionist" | "doctor"
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
      app_role: ["admin", "receptionist", "doctor"],
    },
  },
} as const
