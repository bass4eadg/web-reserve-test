import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { Customer } from '../types/reservation';

interface CustomerFormProps {
  onSubmit: (customer: Customer) => void;
  onBack: () => void;
}

interface FormData {
  name: string;
  studentId: string;
}

const schema = yup.object({
  name: yup.string().required('お名前は必須です'),
  studentId: yup.string().required('学籍番号は必須です'),
});

export const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      studentId: '',
    },
  });

  const onFormSubmit = (data: FormData) => {
    const customer: Customer = {
      name: data.name,
      studentId: data.studentId,
    };
    onSubmit(customer);
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
      >
        学生情報入力
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
        <Stack spacing={{ xs: 2, sm: 3 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="氏名"
                fullWidth
                variant="outlined"
                required
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          <Controller
            name="studentId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="学籍番号"
                fullWidth
                variant="outlined"
                required
                placeholder="例: 1J21000XX"
                error={!!errors.studentId}
                helperText={errors.studentId?.message}
              />
            )}
          />

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="space-between"
            sx={{ mt: { xs: 2, sm: 3 } }}
          >
            <Button 
              variant="outlined" 
              onClick={onBack} 
              size="large"
              fullWidth={isMobile}
              sx={{ order: { xs: 2, sm: 1 } }}
            >
              戻る
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth={isMobile}
              sx={{ 
                minWidth: { xs: 'auto', sm: 120 },
                order: { xs: 1, sm: 2 }
              }}
            >
              次へ
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};
