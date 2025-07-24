import { createClient } from '@supabase/supabase-js';

// Supabaseプロジェクトの設定
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase環境変数が設定されていません。サンプルデータを使用します。');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// データベース型定義
export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          opening_hours: {
            start: string;
            end: string;
          };
          max_capacity: number;
          time_slot_duration: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          opening_hours: {
            start: string;
            end: string;
          };
          max_capacity: number;
          time_slot_duration: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          opening_hours?: {
            start: string;
            end: string;
          };
          max_capacity?: number;
          time_slot_duration?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          student_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          student_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          student_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string;
          reservation_date: string;
          start_time: string;
          end_time: string;
          number_of_people: number;
          special_requests: string | null;
          status: 'pending' | 'confirmed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id: string;
          reservation_date: string;
          start_time: string;
          end_time: string;
          number_of_people: number;
          special_requests?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          customer_id?: string;
          reservation_date?: string;
          start_time?: string;
          end_time?: string;
          number_of_people?: number;
          special_requests?: string | null;
          status?: 'pending' | 'confirmed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
