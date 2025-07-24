import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { TimeSlot } from '../types/reservation';
import { reservationService } from '../services/reservationService';
import dayjs, { Dayjs } from 'dayjs';

interface DateTimeSelectionProps {
  onDateTimeSelect: (date: Date, timeSlot: TimeSlot) => void;
}

// 防音室の利用可能時間（9:00-21:00）
const generateTimeOptions = (): string[] => {
  const times: string[] = [];
  for (let hour = 9; hour <= 21; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 21) {
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return times;
};

export const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ 
  onDateTimeSelect 
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityWarning, setAvailabilityWarning] = useState<string>('');

  const timeOptions = generateTimeOptions();

  const handleDateChange = (newValue: Dayjs | null) => {
    setSelectedDate(newValue);
    setStartTime('');
    setEndTime('');
    setAvailabilityWarning('');
  };

  const handleStartTimeChange = async (event: SelectChangeEvent) => {
    const newStartTime = event.target.value;
    setStartTime(newStartTime);
    setAvailabilityWarning('');
    
    // 終了時間をクリア（開始時間より後でないといけない）
    const startIndex = timeOptions.indexOf(newStartTime);
    const endIndex = timeOptions.indexOf(endTime);
    if (endIndex <= startIndex) {
      setEndTime('');
    } else if (selectedDate && endTime) {
      // 既存の終了時間がある場合は重複チェック
      setCheckingAvailability(true);
      try {
        const result = await reservationService.checkTimeSlotAvailability(
          selectedDate.toDate(),
          newStartTime,
          endTime
        );

        if (!result.available && result.conflictingReservations) {
          const conflictDetails = result.conflictingReservations
            .map(conflict => `${conflict.startTime}-${conflict.endTime} (${conflict.customerName}様)`)
            .join(', ');
          
          setAvailabilityWarning(
            `⚠️ この時間帯は既に予約されています: ${conflictDetails}\n別の時間をお選びください。`
          );
        }
      } catch (error) {
        console.error('重複チェックエラー:', error);
      } finally {
        setCheckingAvailability(false);
      }
    }
  };

  const handleEndTimeChange = async (event: SelectChangeEvent) => {
    const newEndTime = event.target.value;
    setEndTime(newEndTime);
    setAvailabilityWarning('');

    // 日付、開始時間、終了時間が全て選択されている場合は重複チェック
    if (selectedDate && startTime && newEndTime) {
      setCheckingAvailability(true);
      try {
        const result = await reservationService.checkTimeSlotAvailability(
          selectedDate.toDate(),
          startTime,
          newEndTime
        );

        if (!result.available && result.conflictingReservations) {
          const conflictDetails = result.conflictingReservations
            .map(conflict => `${conflict.startTime}-${conflict.endTime} (${conflict.customerName}様)`)
            .join(', ');
          
          setAvailabilityWarning(
            `⚠️ この時間帯は既に予約されています: ${conflictDetails}\n別の時間をお選びください。`
          );
        }
      } catch (error) {
        console.error('重複チェックエラー:', error);
      } finally {
        setCheckingAvailability(false);
      }
    }
  };

  const handleNext = () => {
    if (selectedDate && startTime && endTime) {
      const timeSlot: TimeSlot = {
        startTime,
        endTime,
        available: true,
      };
      onDateTimeSelect(selectedDate.toDate(), timeSlot);
    }
  };

  const getValidEndTimes = (): string[] => {
    if (!startTime) return [];
    const startIndex = timeOptions.indexOf(startTime);
    return timeOptions.slice(startIndex + 1); // 開始時間より後の時間のみ
  };

  const isNextDisabled = !selectedDate || !startTime || !endTime || !!availabilityWarning || checkingAvailability;

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
      >
        防音室予約 - 日時選択
      </Typography>

      <Stack spacing={{ xs: 2, sm: 3 }}>
        <FormControl fullWidth>
          <DatePicker
            label="予約日"
            value={selectedDate}
            onChange={handleDateChange}
            minDate={dayjs()}
            maxDate={dayjs().add(30, 'day')}
            slotProps={{
              textField: {
                required: true,
                helperText: '本日から30日後まで選択可能です'
              }
            }}
          />
        </FormControl>

        <FormControl fullWidth disabled={!selectedDate}>
          <InputLabel id="start-time-label">開始時間</InputLabel>
          <Select
            labelId="start-time-label"
            id="start-time-select"
            value={startTime}
            label="開始時間"
            onChange={handleStartTimeChange}
          >
            {timeOptions.slice(0, -1).map((time) => (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={!startTime}>
          <InputLabel id="end-time-label">終了時間</InputLabel>
          <Select
            labelId="end-time-label"
            id="end-time-select"
            value={endTime}
            label="終了時間"
            onChange={handleEndTimeChange}
          >
            {getValidEndTimes().map((time) => (
              <MenuItem key={time} value={time}>
                {time}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedDate && startTime && endTime && !availabilityWarning && (
          <Box sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            bgcolor: 'grey.50', 
            borderRadius: 1 
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '0.875rem' } }}
            >
              選択内容: {selectedDate.format('YYYY年MM月DD日')} {startTime} - {endTime}
            </Typography>
          </Box>
        )}

        {availabilityWarning && (
          <Alert 
            severity="warning" 
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '0.875rem' },
              whiteSpace: 'pre-line' // 改行を表示
            }}
          >
            {availabilityWarning}
          </Alert>
        )}

        {checkingAvailability && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              時間帯の確認中...
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          disabled={isNextDisabled}
          fullWidth
          sx={{ 
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: '1rem', sm: '1.125rem' }
          }}
        >
          次へ
        </Button>
      </Stack>
    </Paper>
  );
};
