import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  Paper, 
  Alert, 
  AlertTitle,
  InputAdornment,
  IconButton,
  CircularProgress,
  styled,
  Link
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { fetchEndpoint } from '../FetchEndpoint';
import FAIcon from '../../components/FAIcon';

// Styled components (same as ForgotPassword)
const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#1a1a1a',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1),
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  width: '100%',
  maxWidth: '400px',
}));

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

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('error');
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  
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

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#121212',
        padding: 2
      }}
    >
      <StyledPaper>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            textAlign: 'center', 
            mb: 3,
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
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
              onClick={() => navigate('/login')}
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
              component={RouterLink} 
              to="/forgot-password" 
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
      </StyledPaper>
    </Box>
  );
};

export default ResetPassword;