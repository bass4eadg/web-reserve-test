import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { reservationService } from '../services/reservationService';
import type { Reservation } from '../types/reservation';
import dayjs from 'dayjs';

export const ReservationList: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError('');
      // 今のところ、すべての予約を取得（実際には日付フィルタなどを追加予定）
      const data = await reservationService.getAllReservations?.() || [];
      setReservations(data);
    } catch (err) {
      console.error('予約一覧取得エラー:', err);
      setError('予約一覧の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '確定';
      case 'pending':
        return '保留中';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          防音室予約一覧
        </Typography>
        <Button variant="outlined" onClick={fetchReservations}>
          更新
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {reservations.length === 0 ? (
        <Alert severity="info">
          現在、予約はありません。
        </Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>予約日</TableCell>
                <TableCell>時間</TableCell>
                <TableCell>氏名</TableCell>
                <TableCell>学籍番号</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>予約日時</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    {dayjs(reservation.date).format('YYYY/MM/DD (ddd)')}
                  </TableCell>
                  <TableCell>
                    {reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}
                  </TableCell>
                  <TableCell>{reservation.customer.name}</TableCell>
                  <TableCell>{reservation.customer.studentId}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(reservation.status)}
                      color={getStatusColor(reservation.status) as 'success' | 'warning' | 'error' | 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {dayjs(reservation.createdAt).format('MM/DD HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
