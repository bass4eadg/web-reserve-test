import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Stepper, Step, StepLabel, Box, Alert, Button, useMediaQuery } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimeSelection } from './components/DateTimeSelection';
import { CustomerForm } from './components/CustomerForm';
import { ReservationConfirmation } from './components/ReservationConfirmation';
import { ReservationSuccess } from './components/ReservationSuccess';
import { ReservationList } from './components/ReservationList';
import { reservationService } from './services/reservationService';
import type { Reservation, Customer, TimeSlot } from './types/reservation';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

dayjs.locale('ja');

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h3: {
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
        lineHeight: 1.2,
      },
    },
    h5: {
      '@media (max-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    h6: {
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingLeft: '8px',
            paddingRight: '8px',
            maxWidth: '100%',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            fontSize: '0.875rem',
            padding: '8px 16px',
            minHeight: '44px',
          },
        },
        sizeLarge: {
          '@media (max-width:600px)': {
            fontSize: '1rem',
            padding: '12px 20px',
            minHeight: '48px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            '& .MuiInputLabel-root': {
              fontSize: '0.875rem',
            },
            '& .MuiInputBase-input': {
              fontSize: '1rem',
              padding: '12px 14px',
            },
            '& .MuiFormHelperText-root': {
              fontSize: '0.75rem',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            borderRadius: '8px',
            margin: '0 4px',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            width: '100%',
          },
        },
      },
    },
  },
});

const steps = ['日時選択', '顧客情報入力', '予約確認'];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [reservation, setReservation] = useState<Partial<Reservation>>({});
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleDateTimeSelect = (date: Date, timeSlot: TimeSlot) => {
    setReservation({
      ...reservation,
      date,
      timeSlot,
    });
    handleNext();
  };

  const handleCustomerFormSubmit = (customer: Customer) => {
    setReservation({
      ...reservation,
      customer,
      status: 'pending',
      createdAt: new Date(),
    });
    handleNext();
  };

  const handleConfirmReservation = async () => {
    if (!reservation.customer || !reservation.date || !reservation.timeSlot) {
      setError('予約情報が不完全です。');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullReservation: Reservation = {
        customer: reservation.customer,
        date: reservation.date,
        timeSlot: reservation.timeSlot,
        status: 'pending',
        createdAt: new Date(),
      };

      const result = await reservationService.createReservation(fullReservation);
      
      if (result.success) {
        // 予約成功時に完了画面を表示
        setCompletedReservation(fullReservation);
        setActiveStep(3); // 新しいステップ番号
      } else {
        if (result.conflictingReservations && result.conflictingReservations.length > 0) {
          // 重複する予約がある場合の詳細メッセージ
          const conflictDetails = result.conflictingReservations
            .map(conflict => `• ${conflict.startTime}-${conflict.endTime} (${conflict.customerName}様)`)
            .join('\n');
          
          setError(
            `${result.message}\n\n既存の予約:\n${conflictDetails}\n\n別の時間帯をお選びください。`
          );
        } else {
          setError(result.message || '予約の保存に失敗しました。もう一度お試しください。');
        }
      }
    } catch (err) {
      console.error('予約エラー:', err);
      setError('予約中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleNewReservation = () => {
    // リセットして最初から開始
    setReservation({});
    setCompletedReservation(null);
    setActiveStep(0);
    setError('');
  };

  const handleViewReservations = () => {
    // 管理画面に切り替え
    setIsAdminMode(true);
    setCompletedReservation(null);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <DateTimeSelection
            onDateTimeSelect={handleDateTimeSelect}
          />
        );
      case 1:
        return (
          <CustomerForm
            onSubmit={handleCustomerFormSubmit}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <ReservationConfirmation
            reservation={reservation as Reservation}
            onConfirm={handleConfirmReservation}
            onBack={handleBack}
            loading={loading}
          />
        );
      case 3:
        return completedReservation ? (
          <ReservationSuccess
            reservation={completedReservation}
            onNewReservation={handleNewReservation}
            onViewReservations={handleViewReservations}
          />
        ) : null;
      default:
        return 'Unknown step';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
        <Container 
          maxWidth="sm" 
          sx={{ 
            py: { xs: 1, sm: 4 }, 
            px: { xs: 1, sm: 3 },
            minHeight: '100vh',
            width: '100%',
            maxWidth: { xs: '100vw', sm: '600px' }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: { xs: 1, sm: 2 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
            width: '100%'
          }}>
            <Typography 
              variant="h3"
              component="h1" 
              gutterBottom
              sx={{ 
                textAlign: { xs: 'center', sm: 'left' },
                fontSize: { xs: '1.5rem', sm: '2.5rem' },
                mb: { xs: 0.5, sm: 2 },
                width: { xs: '100%', sm: 'auto' },
                lineHeight: { xs: 1.2, sm: 1.167 }
              }}
            >
              {isAdminMode ? '防音室予約管理' : '防音室予約システム'}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setIsAdminMode(!isAdminMode)}
              size="small"
              sx={{ 
                minWidth: 'fit-content',
                alignSelf: { xs: 'center', sm: 'flex-start' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 }
              }}
            >
              {isAdminMode ? '予約画面' : '管理画面'}
            </Button>
          </Box>

          {!isAdminMode ? (
            <>
              <Typography 
                variant="h6" 
                component="p" 
                gutterBottom 
                align="center" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1.25rem' },
                  mb: { xs: 1, sm: 2 },
                  px: { xs: 1, sm: 0 }
                }}
              >
                ベーシスト優遇
              </Typography>
              
              <Box sx={{ 
                mt: { xs: 1, sm: 4 }, 
                mb: { xs: 2, sm: 4 },
                px: { xs: 0, sm: 0 },
                display: activeStep === 3 ? 'none' : 'block' // 予約完了画面ではステッパーを非表示
              }}>
                <Stepper 
                  activeStep={activeStep}
                  orientation={isMobile ? 'vertical' : 'horizontal'}
                  sx={{ 
                    '& .MuiStepLabel-label': { 
                      fontSize: { xs: '0.75rem', sm: '1rem' } 
                    },
                    '& .MuiStepConnector-line': {
                      minHeight: { xs: '16px', sm: 'auto' }
                    },
                    '& .MuiStep-root': {
                      paddingLeft: { xs: 0, sm: 'inherit' },
                      paddingRight: { xs: 0, sm: 'inherit' }
                    }
                  }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2, mx: { xs: 0, sm: 0 } }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ 
                mt: { xs: 2, sm: 4 },
                width: '100%',
                overflow: 'hidden'
              }}>
                {getStepContent(activeStep)}
              </Box>
            </>
          ) : (
            <Box sx={{ 
              mt: { xs: 2, sm: 4 },
              width: '100%',
              overflow: 'hidden'
            }}>
              <ReservationList />
            </Box>
          )}
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
