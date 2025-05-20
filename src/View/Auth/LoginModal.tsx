import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  Dialog,
  DialogContent,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
  Alert,
  AlertTitle,
  styled
} from '@mui/material';
import { fetchEndpoint } from '../FetchEndpoint';
import FAIcon from '../Components/FAIcon';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

// Reuse same styled components
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

const LoginButton = styled(Button)(({ theme }) => ({
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

const LoginModal: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  
  const { login } = useAuth();
  const { isLoginModalOpen, closeLoginModal, switchToRegister, openForgotPasswordModal } = useModal();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlertMessage(null);
    
    try {
      const response = await fetchEndpoint('/auth/login', 'POST', null, { 
        email, 
        password 
      });
      
      if (response && response.token) {
        login(response.token);
        closeLoginModal();
        setEmail('');
        setPassword('');
      } else {
        throw new Error(response?.message || 'Invalid login credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        setAlertMessage(error.message || 'An error occurred during login');
      } else {
        setAlertMessage('An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAlertMessage(null);
    setEmail('');
    setPassword('');
    closeLoginModal();
  };

  return (
    <Dialog 
      open={isLoginModalOpen} 
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      disableScrollLock={true}
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
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
          Login
        </Typography>
        
        {alertMessage && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                fontFamily: '"Poppins", sans-serif',
              }
            }}
          >
            <AlertTitle sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
              Error
            </AlertTitle>
            {alertMessage}
          </Alert>
        )}
        
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
            label="Password"
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
          
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Link 
              component="button"
              type="button"
              onClick={() => {
                closeLoginModal();
                openForgotPasswordModal();
              }}
              sx={{ 
                color: '#1976d2',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.875rem',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Forgot password?
            </Link>
          </Box>
          
          <LoginButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            startIcon={loading ? undefined : <FAIcon icon="fas fa-sign-in-alt" />}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Logging in...
              </Box>
            ) : (
              'Log in'
            )}
          </LoginButton>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#aaa',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Don't have an account?{' '}
              <Link 
                component="button"
                type="button"
                onClick={switchToRegister}
                sx={{ 
                  color: '#1976d2',
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Register
              </Link>
            </Typography>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;