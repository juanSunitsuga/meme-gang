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
  Link,
  CircularProgress,
  styled,
  alpha
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { fetchEndpoint } from '../FetchEndpoint';
import FAIcon from '../../components/FAIcon';
import { useAuth } from '../../contexts/AuthContext';

// Styled components to match the design system
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

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get the login function from context
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlertMessage(null);
    
    try {
      // Your existing API call logic to log in
      const response = await fetchEndpoint('/auth/login', 'POST', null, { 
        email, 
        password 
      });
      
      // When login is successful:
      if (response && response.token) {
        // Use the login function from context instead of directly setting localStorage
        login(response.token);
        
        // Navigate to dashboard or home
        navigate('/');
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
              component={RouterLink} 
              to="/forgot-password" 
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
                component={RouterLink} 
                to="/register" 
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
      </StyledPaper>
    </Box>
  );
};

export default Login;