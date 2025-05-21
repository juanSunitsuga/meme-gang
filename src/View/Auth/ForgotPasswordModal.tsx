import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  AlertTitle,
  styled,
  Link
} from '@mui/material';
import { fetchEndpoint } from '../FetchEndpoint';
import FAIcon from '../Components/FAIcon';
import { useModal } from '../contexts/ModalContext';

// Styled components to match the Login styling
const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
    '& input': {
      color: 'white',
      fontFamily: '"Poppins", sans-serif',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#aaa',
    fontFamily: '"Poppins", sans-serif',
    '&.Mui-focused': {
      color: '#1976d2',
    },
  },
  '& .MuiFormHelperText-root': {
    color: '#888',
    fontFamily: '"Poppins", sans-serif',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1976d2',
  color: 'white',
  textTransform: 'none',
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 600,
  padding: theme.spacing(1.2, 0),
  fontSize: '1rem',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
}));

const ForgotPasswordModal: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('error');
  const [submitted, setSubmitted] = useState(false);
  
  const { isForgotPasswordModalOpen, closeForgotPasswordModal, switchToLogin, switchToResetPassword } = useModal();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlertMessage(null);
    
    try {
      const response = await fetchEndpoint('/auth/forgot-password', 'POST', null, { email });
      
      setAlertSeverity('success');
      setAlertMessage('Password reset instructions have been sent to your email.');
      setSubmitted(true);
    } catch (error) {
      console.error('Password reset request error:', error);
      setAlertSeverity('error');
      if (error instanceof Error) {
        setAlertMessage(error.message || 'An error occurred while sending the reset link');
      } else {
        setAlertMessage('An error occurred while sending the reset link');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeForgotPasswordModal();
    setEmail('');
    setSubmitted(false);
    setAlertMessage(null);
  };

  return (
    <Dialog 
      open={isForgotPasswordModalOpen} 
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      disableScrollLock={true}
      PaperProps={{
        sx: {
          backgroundColor: '#121212',
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }
        }
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <IconButton onClick={handleClose} sx={{ color: '#aaa' }}>
            <FAIcon icon="fas fa-times" />
          </IconButton>
        </Box>
        
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            textAlign: 'center', 
            mb: 3,
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            color: 'white'
          }}
        >
          Reset Password
        </Typography>
        
        {alertMessage && (
          <Alert 
            severity={alertSeverity}
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                fontFamily: '"Poppins", sans-serif',
              }
            }}
          >
            <AlertTitle sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
              {alertSeverity === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            {alertMessage}
          </Alert>
        )}
        
        {!submitted ? (
          <>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                color: '#ddd',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <StyledTextField
                label="Email"
                variant="outlined"
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FAIcon icon="fas fa-envelope" style={{ color: '#888' }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <ActionButton
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                startIcon={loading ? undefined : <FAIcon icon="fas fa-paper-plane" />}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Sending...
                  </Box>
                ) : (
                  'Send Reset Link'
                )}
              </ActionButton>
            </form>
          </>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <FAIcon icon="fas fa-envelope-open-text" style={{ fontSize: '3rem', color: '#1976d2' }} />
            </Box>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                color: '#ddd',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Please check your email inbox and follow the instructions to reset your password.
            </Typography>
            
            <ActionButton
              fullWidth
              variant="contained"
              onClick={switchToResetPassword}
              startIcon={<FAIcon icon="fas fa-key" />}
            >
              Enter Reset Code
            </ActionButton>
          </Box>
        )}
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#aaa',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Remember your password?{' '}
            <Link 
              component="button"
              type="button"
              onClick={switchToLogin}
              sx={{ 
                color: '#1976d2',
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Log in
            </Link>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordModal;