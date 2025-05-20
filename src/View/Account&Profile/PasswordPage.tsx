import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  Paper, 
  Alert, 
  AlertTitle,
  CircularProgress,
  InputAdornment,
  IconButton,
  styled,
  alpha
} from '@mui/material';
import { fetchEndpoint } from '../FetchEndpoint';
import FAIcon from '../Components/FAIcon';

// Styled components to match Navbar and Account page theme
const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#1a1a1a',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(1),
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  marginBottom: theme.spacing(3),
}));

const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
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

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1976d2',
  color: 'white',
  textTransform: 'none',
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  '&:hover': {
    backgroundColor: '#1565c0',
  },
}));

const PasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'warning' | null>(null);
  
  // Password validation
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return null;
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    const error = validatePassword(newPass);
    setPasswordError(error);
  };

  const handleSaveChanges = async () => {
    // Clear previous alerts
    setAlertMessage(null);
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setAlertMessage('New password and confirmation do not match');
      setAlertSeverity('error');
      return;
    }
    
    if (passwordError) {
      setAlertMessage(passwordError);
      setAlertSeverity('error');
      return;
    }
    
    if (!oldPassword || !newPassword) {
      setAlertMessage('Please fill in all fields');
      setAlertSeverity('warning');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAlertMessage('You are not logged in. Please log in again.');
        setAlertSeverity('error');
        return;
      }

      const response = await fetchEndpoint('/profile/change-password', 'POST', token, { oldPassword, newPassword });
      
      setAlertMessage('Password changed successfully!');
      setAlertSeverity('success');
      
      // Clear form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      setAlertMessage(error.message || 'An error occurred while changing the password');
      setAlertSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', py: 4, px: 2 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 3, 
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 600 
        }}
      >
        Password Settings
      </Typography>

      {/* Alert Section */}
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
            {alertSeverity === 'success' ? 'Success' : 
             alertSeverity === 'warning' ? 'Warning' : 'Error'}
          </AlertTitle>
          {alertMessage}
        </Alert>
      )}

      <StyledPaper>
        <FormContainer>
          {/* Old Password */}
          <StyledTextField
            label="Current Password"
            type={showOldPassword ? 'text' : 'password'}
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    edge="end"
                    sx={{ color: '#aaa' }}
                  >
                    <FAIcon icon={showOldPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* New Password */}
          <StyledTextField
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            fullWidth
            value={newPassword}
            onChange={handleNewPasswordChange}
            variant="outlined"
            error={!!passwordError}
            helperText={passwordError || "Must be at least 8 characters"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                    sx={{ color: '#aaa' }}
                  >
                    <FAIcon icon={showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Confirm New Password */}
          <StyledTextField
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            error={confirmPassword.length > 0 && newPassword !== confirmPassword}
            helperText={confirmPassword.length > 0 && newPassword !== confirmPassword ? 
              "Passwords don't match" : ""}
            InputProps={{
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

          {/* Password Security Tips */}
          <Box 
            sx={{ 
              backgroundColor: alpha('#1976d2', 0.1), 
              p: 2, 
              borderRadius: 1,
              border: '1px solid rgba(25, 118, 210, 0.3)'
            }}
          >
            <Typography 
              sx={{ 
                color: '#ddd', 
                fontFamily: '"Poppins", sans-serif', 
                display: 'flex', 
                alignItems: 'center',
                mb: 1
              }}
            >
              <FAIcon icon="fas fa-shield-alt" style={{ marginRight: '8px', color: '#1976d2' }}/>
              <Box component="span" sx={{ fontWeight: 600 }}>Password Tips</Box>
            </Typography>
            <Typography sx={{ color: '#ddd', fontSize: '0.9rem', fontFamily: '"Poppins", sans-serif', mb: 0.5 }}>
              • Use at least 8 characters
            </Typography>
            <Typography sx={{ color: '#ddd', fontSize: '0.9rem', fontFamily: '"Poppins", sans-serif', mb: 0.5 }}>
              • Include uppercase and lowercase letters
            </Typography>
            <Typography sx={{ color: '#ddd', fontSize: '0.9rem', fontFamily: '"Poppins", sans-serif' }}>
              • Add numbers and special characters for better security
            </Typography>
          </Box>

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
            <SaveButton 
              onClick={handleSaveChanges}
              variant="contained" 
              startIcon={loading ? undefined : <FAIcon icon="fas fa-key" />}
              disabled={loading}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Updating...
                </Box>
              ) : (
                'Update Password'
              )}
            </SaveButton>
          </Box>
        </FormContainer>
      </StyledPaper>
    </Box>
  );
};

export default PasswordPage;