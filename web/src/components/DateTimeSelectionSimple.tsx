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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { TimeSlot } from '../types/reservation';
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

  const timeOptions = generateTimeOptions();

  const handleDateChange = (newValue: Dayjs | null) => {
    setSelectedDate(newValue);
    setStartTime('');
    setEndTime('');
  };

  const handleStartTimeChange = (event: SelectChangeEvent) => {
    const newStartTime = event.target.value;
    setStartTime(newStartTime);
    
    // 終了時間をクリア（開始時間より後でないといけない）
    const startIndex = timeOptions.indexOf(newStartTime);
    const endIndex = timeOptions.indexOf(endTime);
    if (endIndex <= startIndex) {
      setEndTime('');
    }
  };

  const handleEndTimeChange = (event: SelectChangeEvent) => {
    setEndTime(event.target.value);
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

  const isNextDisabled = !selectedDate || !startTime || !endTime;

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        防音室予約 - 日時選択
      </Typography>

      <Stack spacing={3}>
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

        {selectedDate && startTime && endTime && (
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              選択内容: {selectedDate.format('YYYY年MM月DD日')} {startTime} - {endTime}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          disabled={isNextDisabled}
          fullWidth
        >
          次へ
        </Button>
      </Stack>
    </Paper>
  );
};
