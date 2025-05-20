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
import { useAuth } from '../contexts/AuthContext';

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

const ResetPasswordModal: React.FC = () => {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('error');
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const { isResetPasswordModalOpen, closeResetPasswordModal, switchToLogin, switchToForgotPassword } = useModal();
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setAlertMessage("Passwords don't match");
      setAlertSeverity('error');
      return;
    }
    
    setLoading(true);
    setAlertMessage(null);
    
    try {
      // Call the backend API to reset the password
      const response = await fetchEndpoint('/auth/reset-password', 'POST', null, { 
        email,
        resetCode,
        newPassword: password 
      });
      
      setAlertSeverity('success');
      setAlertMessage('Your password has been reset successfully!');
      setResetSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setAlertSeverity('error');
      if (error instanceof Error) {
        setAlertMessage(error.message || 'Failed to reset password');
      } else {
        setAlertMessage('Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeResetPasswordModal();
    // Reset form state
    setEmail('');
    setResetCode('');
    setPassword('');
    setConfirmPassword('');
    setResetSuccess(false);
    setAlertMessage(null);
  };

  const handleLoginClick = () => {
    handleClose();
    switchToLogin();
  };

  return (
    <Dialog 
      open={isResetPasswordModalOpen} 
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
        
        {!resetSuccess ? (
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
            
            <StyledTextField
              label="Reset Code"
              variant="outlined"
              fullWidth
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FAIcon icon="fas fa-key" style={{ color: '#888' }} />
                  </InputAdornment>
                ),
              }}
              helperText="Enter the code from your email"
            />
            
            <StyledTextField
              label="New Password"
              variant="outlined"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FAIcon icon="fas fa-lock" style={{ color: '#888' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#aaa' }}
                    >
                      <FAIcon icon={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <StyledTextField
              label="Confirm New Password"
              variant="outlined"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FAIcon icon="fas fa-lock" style={{ color: '#888' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <ActionButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={loading ? undefined : <FAIcon icon="fas fa-key" />}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Resetting Password...
                </Box>
              ) : (
                'Reset Password'
              )}
            </ActionButton>
          </form>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
              <FAIcon icon="fas fa-check-circle" style={{ fontSize: '3rem', color: '#4caf50' }} />
            </Box>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                color: '#ddd',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Your password has been reset successfully. You can now log in with your new password.
            </Typography>
            
            <ActionButton
              fullWidth
              variant="contained"
              onClick={handleLoginClick}
              startIcon={<FAIcon icon="fas fa-sign-in-alt" />}
            >
              Go to Login
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
            Didn't receive a code?{' '}
            <Link 
              component="button"
              type="button"
              onClick={switchToForgotPassword}
              sx={{ 
                color: '#1976d2',
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Request again
            </Link>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal;