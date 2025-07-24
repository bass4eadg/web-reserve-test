export interface Customer {
  id?: string;
  name: string;
  studentId: string; // 学籍番号
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Reservation {
  id?: string;
  customer: Customer;
  date: Date;
  timeSlot: TimeSlot;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}
