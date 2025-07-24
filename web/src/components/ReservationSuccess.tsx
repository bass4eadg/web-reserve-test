import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  School,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import type { Reservation } from '../types/reservation';

interface ReservationSuccessProps {
  reservation: Reservation;
  onNewReservation: () => void;
  onViewReservations: () => void;
}

export const ReservationSuccess: React.FC<ReservationSuccessProps> = ({
  reservation,
  onNewReservation,
  onViewReservations,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [imageError, setImageError] = useState(false);
  
  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
      <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
      {/* 画像エリア */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        {/* Girl.jpg画像を表示 */}
        {!imageError ? (
          <Box
            component="img"
            src="/Girl.jpg"
            alt="予約完了"
            onError={(e) => {
              console.error('画像の読み込みに失敗しました:', e);
              setImageError(true);
            }}
            onLoad={() => {
              console.log('画像の読み込みが成功しました');
            }}
            sx={{
              maxWidth: { xs: '200px', sm: '300px' },
              height: 'auto',
              borderRadius: 2,
              boxShadow: 2,
              objectFit: 'cover'
            }}
          />
        ) : (
          <Box
            sx={{
              maxWidth: { xs: '200px', sm: '300px' },
              height: { xs: '160px', sm: '240px' },
              backgroundColor: 'success.50',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed',
              borderColor: 'success.main'
            }}
          >
            <Typography variant="body2" color="success.main">
              画像読み込み中...
            </Typography>
          </Box>
        )}



        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          予約完了しました。確認メールをお送りいたします。
        </Typography> 
      </Box>

      {/* 予約詳細 */}
      <Stack spacing={{ xs: 2, sm: 3 }}>
        <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="success.main">
              予約詳細
            </Typography>
            <Stack spacing={1}>
              <InfoRow
                icon={<CalendarToday />}
                label="予約日"
                value={dayjs(reservation.date).format('YYYY年M月D日（ddd）')}
              />
              <InfoRow
                icon={<AccessTime />}
                label="利用時間"
                value={`${reservation.timeSlot.startTime} - ${reservation.timeSlot.endTime}`}
              />
              <InfoRow
                icon={<Person />}
                label="氏名"
                value={reservation.customer.name}
              />
              <InfoRow
                icon={<School />}
                label="学籍番号"
                value={reservation.customer.studentId}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* 次のアクション */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: { xs: 2, sm: 3 },
          mt: { xs: 3, sm: 4 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button
            variant="outlined"
            onClick={onViewReservations}
            size="large"
            fullWidth={isMobile}
          >
            予約一覧を見る
          </Button>
          <Button
            variant="contained"
            onClick={onNewReservation}
            size="large"
            sx={{ px: { xs: 2, sm: 4 } }}
            fullWidth={isMobile}
          >
            新しい予約をする
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};
