import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Card,
  CardContent,
  CircularProgress,
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

interface ReservationConfirmationProps {
  reservation: Reservation;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
}

export const ReservationConfirmation: React.FC<ReservationConfirmationProps> = ({
  reservation,
  onConfirm,
  onBack,
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
      <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
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
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
      >
        予約内容の確認
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: '0.875rem', sm: '0.875rem' }
        }}
      >
        以下の内容で予約を確定してもよろしいですか？
      </Typography>

      <Stack spacing={{ xs: 2, sm: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
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
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              お客様情報
            </Typography>
            <Stack spacing={1}>
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

        <Divider />

        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            bgcolor: 'primary.50',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'primary.200',
          }}
        >
          <Typography 
            variant="body2" 
            color="primary.dark"
            sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
          >
            <strong>注意事項：</strong>
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 1,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              lineHeight: { xs: 1.4, sm: 1.5 }
            }}
          >
            • 予約時間に15分以上遅れる場合は、お電話にてご連絡ください
            <br />
            • キャンセルは前日までにお願いいたします
            <br />
            • 予約確定後、確認メールをお送りします
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: { xs: 3, sm: 4 },
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Button
            variant="outlined"
            onClick={onBack}
            size="large"
            disabled={loading}
            fullWidth={isMobile}
          >
            戻る
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            size="large"
            sx={{ px: { xs: 2, sm: 4 } }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
            fullWidth={isMobile}
          >
            {loading ? '予約中...' : '予約を確定する'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};
