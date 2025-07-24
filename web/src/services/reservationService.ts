import { supabase } from '../lib/supabase';
import type { Reservation, TimeSlot } from '../types/reservation';
import dayjs from 'dayjs';

export class SupabaseReservationService {
  private defaultStoreId = '00000000-0000-0000-0000-000000000001';

  // 時間重複チェック機能
  async checkTimeSlotAvailability(date: Date, startTime: string, endTime: string): Promise<{
    available: boolean;
    conflictingReservations?: Array<{
      id: string;
      customerName: string;
      startTime: string;
      endTime: string;
    }>;
  }> {
    try {
      const targetDate = dayjs(date).format('YYYY-MM-DD');
      
      // 指定された日時と重複する予約を検索
      const { data: conflictingReservations, error } = await supabase
        .from('reservations')
        .select(`
          id,
          start_time,
          end_time,
          customers!inner (
            name
          )
        `)
        .eq('reservation_date', targetDate)
        .neq('status', 'cancelled') // キャンセル済みは除外
        .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`); // 時間重複の条件

      if (error) {
        console.error('重複チェックエラー:', error);
        return { available: false };
      }

      if (!conflictingReservations || conflictingReservations.length === 0) {
        return { available: true };
      }

      // 重複する予約の詳細を返す
      const conflicts = conflictingReservations.map((res) => ({
        id: res.id,
        customerName: (res.customers as unknown as { name: string })?.name || '不明',
        startTime: res.start_time,
        endTime: res.end_time,
      }));

      return {
        available: false,
        conflictingReservations: conflicts,
      };
    } catch (error) {
      console.error('重複チェック処理エラー:', error);
      return { available: false };
    }
  }

  // 簡単な予約作成（重複チェック付き）
  async createReservation(reservation: Reservation): Promise<{
    success: boolean;
    message?: string;
    conflictingReservations?: Array<{
      id: string;
      customerName: string;
      startTime: string;
      endTime: string;
    }>;
  }> {
    try {
      // まず時間重複をチェック
      const availabilityCheck = await this.checkTimeSlotAvailability(
        reservation.date,
        reservation.timeSlot.startTime,
        reservation.timeSlot.endTime
      );

      if (!availabilityCheck.available) {
        return {
          success: false,
          message: '選択された時間帯は既に予約されています。別の時間をお選びください。',
          conflictingReservations: availabilityCheck.conflictingReservations,
        };
      }

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
        return {
          success: false,
          message: '顧客情報の登録に失敗しました。もう一度お試しください。',
        };
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
        return {
          success: false,
          message: '予約の登録に失敗しました。もう一度お試しください。',
        };
      }

      return {
        success: true,
        message: '予約が正常に完了しました。',
      };
    } catch (error) {
      console.error('予約処理エラー:', error);
      return {
        success: false,
        message: '予約処理中にエラーが発生しました。もう一度お試しください。',
      };
    }
  }

  // 簡単な時間スロット生成
  async getAvailableTimeSlots(date: Date): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    const targetDate = dayjs(date).format('YYYY-MM-DD');
    
    // 9:00-21:00、30分刻み（対象日: ${targetDate}）
    console.debug(`時間スロット生成中: ${targetDate}`);
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
