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

const RegisterButton = styled(Button)(({ theme }) => ({
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

const RegisterModal: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'info' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { isRegisterModalOpen, closeRegisterModal, switchToLogin } = useModal();
  
  // Validation states
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  
  const validateForm = () => {
    let isValid = true;
    
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      isValid = false;
    } else {
      setUsernameError(null);
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError(null);
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError(null);
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError(null);
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setAlertMessage(null);
      
      const response = await fetchEndpoint('/auth/register', 'POST', null, { 
        username, 
        email, 
        password 
      });
      
      // If we get here, the request was successful
      setAlertMessage('Registration successful! You can now log in.');
      setAlertSeverity('success');
      
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        closeRegisterModal();
        switchToLogin();
      }, 1000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message) {
        setAlertMessage(`Registration failed: ${error.message}`);
      } else {
        setAlertMessage('Registration failed. Please try again later.');
      }
      setAlertSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAlertMessage(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    closeRegisterModal();
  };

  return (
    <Dialog 
      open={isRegisterModalOpen} 
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
          Create Account
        </Typography>
        
        {alertMessage && alertSeverity && (
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
        
        <form onSubmit={handleSubmit}>
          <StyledTextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!usernameError}
            helperText={usernameError}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FAIcon icon="fas fa-user" style={{ color: '#888' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <StyledTextField
            label="Email"
            variant="outlined"
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
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
            error={!!passwordError}
            helperText={passwordError}
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
            label="Confirm Password"
            variant="outlined"
            fullWidth
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    sx={{ color: '#aaa' }}
                  >
                    <FAIcon icon={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Box sx={{ mt: 1, mb: 3 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#aaa',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              By registering, you agree to our Terms of Service and Privacy Policy.
            </Typography>
          </Box>
          
          <RegisterButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            startIcon={loading ? undefined : <FAIcon icon="fas fa-user-plus" />}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Creating Account...
              </Box>
            ) : (
              'Register'
            )}
          </RegisterButton>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#aaa',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Already have an account?{' '}
              <Link 
                component="button"
                type="button"
                onClick={switchToLogin}
                sx={{ 
                  color: '#1976d2',
                  fontWeight: 500,
                }}
              >
                Log in
              </Link>
            </Typography>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;