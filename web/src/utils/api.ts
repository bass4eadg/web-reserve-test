import type { Customer, Reservation, TimeSlot } from '../types/reservation';

// API関連の型定義
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

export interface CreateReservationRequest {
  customer: Customer;
  date: string;
  timeSlotId: string;
  numberOfPeople: number;
  specialRequests?: string;
}

export interface TimeSlotQuery {
  date: string;
  storeId?: string;
}

// APIクライアント
export class ReservationApi {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  async createReservation(request: CreateReservationRequest): Promise<ApiResponse<Reservation>> {
    try {
      const response = await fetch(`${this.baseUrl}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {
        data: {} as Reservation,
        error: 'ネットワークエラーが発生しました',
        success: false,
      };
    }
  }

  async getTimeSlots(query: TimeSlotQuery): Promise<ApiResponse<TimeSlot[]>> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
      const response = await fetch(`${this.baseUrl}/time-slots?${searchParams}`);
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {
        data: [],
        error: 'ネットワークエラーが発生しました',
        success: false,
      };
    }
  }

  async getReservation(id: string): Promise<ApiResponse<Reservation>> {
    try {
      const response = await fetch(`${this.baseUrl}/reservations/${id}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return {
        data: {} as Reservation,
        error: 'ネットワークエラーが発生しました',
        success: false,
      };
    }
  }
}

export const reservationApi = new ReservationApi();
