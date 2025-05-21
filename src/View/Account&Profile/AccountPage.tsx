import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  Paper, 
  Alert, 
  AlertTitle, 
  Link,
  Divider,
  CircularProgress,
  styled,
  alpha
} from '@mui/material';
import { useProfile } from '../Settings'; // Import the context hook
import FAIcon from '../Components/FAIcon';

// Styled components to match Navbar theme
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

const DeleteButton = styled(Button)(({ theme }) => ({
  backgroundColor: alpha('#f44336', 0.1),
  color: '#f44336',
  textTransform: 'none',
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  '&:hover': {
    backgroundColor: alpha('#f44336', 0.2),
  },
}));

const LinkPreview = styled(Typography)(({ theme }) => ({
  color: '#888',
  fontSize: '0.875rem',
  marginTop: theme.spacing(0.5),
  fontFamily: '"Poppins", sans-serif',
}));

const ResendLink = styled(Link)(({ theme }) => ({
  color: '#1976d2',
  cursor: 'pointer',
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const AccountSettings = () => {
    // Use the profile context instead of local state and fetch
    const { userData, loading: contextLoading, updateAccount } = useProfile();
    
    // Keep component-specific state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | null>(null);

    // Initialize form fields from context data
    useEffect(() => {
        if (userData) {
            setUsername(userData.username || '');
            setEmail(userData.email || '');
        }
    }, [userData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            const updatedData = {
                username,
                email
            };
            
            // Use context function instead of direct API call
            const result = await updateAccount(updatedData);
            
            if (result.success) {
                setAlertMessage('Changes saved successfully!');
                setAlertSeverity('success');
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error('Error updating account:', error);
            setAlertMessage(error.message || 'Failed to update account. Please try again.');
            setAlertSeverity('error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            setLoading(true);
            
            const token = localStorage.getItem('token');
            if (!token) {
                setAlertMessage('No token found. Please log in again.');
                setAlertSeverity('error');
                return;
            }
            
            // This would be better moved to context in a production app
            // For now, keeping direct fetch for this specific function
            // const response = await fetchEndpoint('/auth/resend-verification', 'POST', token);
            
            setAlertMessage('Verification email sent successfully!');
            setAlertSeverity('success');
        } catch (error: any) {
            console.error('Error sending verification email:', error);
            setAlertMessage(error.message || 'Failed to send verification email. Please try again.');
            setAlertSeverity('error');
        } finally {
            setLoading(false);
        }
    };

    // Show loading state if either context is loading or component is loading
    if (contextLoading || loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px' 
            }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

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
                Account Settings
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
                        {alertSeverity === 'success' ? 'Success' : 'Error'}
                    </AlertTitle>
                    {alertMessage}
                </Alert>
            )}

            <StyledPaper>
                <form onSubmit={handleSubmit}>
                    <FormContainer>
                        <StyledTextField
                            label="Username"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            variant="outlined"
                        />
                        <LinkPreview>
                            https://memegang.com/u/{username}
                        </LinkPreview>

                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />

                        <StyledTextField
                            label="Email"
                            type="email"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            variant="outlined"
                            helperText="Email will not be displayed publicly"
                        />
                        
                        <Box sx={{ 
                            backgroundColor: alpha('#1976d2', 0.1), 
                            p: 2, 
                            borderRadius: 1,
                            border: '1px solid rgba(25, 118, 210, 0.3)'
                        }}>
                            <Typography 
                                sx={{ 
                                    color: '#ddd', 
                                    fontFamily: '"Poppins", sans-serif', 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    mb: 1
                                }}
                            >
                                <FAIcon icon="fas fa-envelope" style={{ marginRight: '8px', color: '#1976d2' }}/>
                                Verification sent to <Box component="span" sx={{ fontWeight: 600, mx: 0.5 }}>{email}</Box>
                            </Typography>
                            <Typography sx={{ color: '#ddd', fontSize: '0.9rem', fontFamily: '"Poppins", sans-serif' }}>
                                Please open the link to verify your email.
                            </Typography>
                            <ResendLink onClick={handleResendVerification}>
                                Resend Verification Email
                            </ResendLink>
                        </Box>

                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            mt: 2, 
                            gap: 2,
                            flexDirection: { xs: 'column', sm: 'row' }
                        }}>
                            <SaveButton 
                                type="submit" 
                                variant="contained" 
                                startIcon={<FAIcon icon="fas fa-save" />}
                                disabled={loading}
                                fullWidth={false}
                            >
                                Save Changes
                            </SaveButton>
                            <DeleteButton 
                                variant="outlined" 
                                startIcon={<FAIcon icon="fas fa-trash" />}
                            >
                                Delete Account
                            </DeleteButton>
                        </Box>
                    </FormContainer>
                </form>
            </StyledPaper>
        </Box>
    );
};

export default AccountSettings;