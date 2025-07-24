import { supabase } from '../lib/supabase';
import type { Reservation, TimeSlot } from '../types/reservation';
import dayjs from 'dayjs';

export class SupabaseReservationService {
  private defaultStoreId = '00000000-0000-0000-0000-000000000001';

  // 簡単な予約作成（エラー処理簡略化）
  async createReservation(reservation: Reservation): Promise<boolean> {
    try {
      // まず顧客を作成
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: reservation.customer.name,
          student_id: reservation.customer.studentId,
        })
        .select()
        .single();

      if (customerError || !customer) {
        console.error('顧客作成エラー:', customerError);
        return false;
      }

      // 予約を作成
      const { error: reservationError } = await supabase
        .from('reservations')
        .insert({
          store_id: this.defaultStoreId,
          customer_id: customer.id,
          reservation_date: dayjs(reservation.date).format('YYYY-MM-DD'),
          start_time: reservation.timeSlot.startTime,
          end_time: reservation.timeSlot.endTime,
          status: 'pending',
        });

      if (reservationError) {
        console.error('予約作成エラー:', reservationError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('予約処理エラー:', error);
      return false;
    }
  }

  // 簡単な時間スロット生成
  async getAvailableTimeSlots(_date: Date): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    
    // 9:00-21:00、30分刻み（簡略化のため日付チェックなし）
    for (let hour = 9; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : 30;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        slots.push({
          startTime,
          endTime,
          available: true, // 簡略化：全て利用可能
        });
      }
    }
    
    return slots;
  }

  // 簡単な予約一覧取得
  async getAllReservations(): Promise<Reservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          customers (*)
        `)
        .order('reservation_date', { ascending: false });

      if (error || !data) {
        console.error('予約一覧取得エラー:', error);
        return [];
      }

      return data.map((res: {
        id: string;
        reservation_date: string;
        start_time: string;
        end_time: string;
        status: string;
        created_at: string;
        customers: {
          id: string;
          name: string;
          student_id: string;
        } | null;
      }) => ({
        id: res.id,
        customer: {
          id: res.customers?.id,
          name: res.customers?.name || '',
          studentId: res.customers?.student_id || '',
        },
        date: new Date(res.reservation_date),
        timeSlot: {
          startTime: res.start_time,
          endTime: res.end_time,
          available: true,
        },
        status: res.status as 'pending' | 'confirmed' | 'cancelled',
        createdAt: new Date(res.created_at),
      }));
    } catch (error) {
      console.error('予約一覧取得エラー:', error);
      return [];
    }
  }
}

export const reservationService = new SupabaseReservationService();
