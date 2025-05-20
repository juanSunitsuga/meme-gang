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
  CircularProgress,
  styled,
  Link
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { fetchEndpoint } from '../FetchEndpoint';
import FAIcon from '../../components/FAIcon';

// Styled components to match the Login styling
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

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('error');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlertMessage(null);
    
    try {
      // Call the backend API to send a password reset email
      const response = await fetchEndpoint('/auth/forgot-password', 'POST', null, { email });
      
      // If successful, show success message
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
              onClick={() => navigate('/reset-password')}
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
              component={RouterLink} 
              to="/login" 
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
      </StyledPaper>
    </Box>
  );
};

export default ForgotPassword;