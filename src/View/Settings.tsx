import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  List,
  ListItem,
  ListItemText,
  Typography,
  Alert,
  AlertTitle,
  CircularProgress,
  styled
} from '@mui/material';
import AccountPage from './Account&Profile/AccountPage';
import PasswordPage from './Account&Profile/PasswordPage';
import ProfilePage from './Account&Profile/ProfilePage';
import { fetchEndpoint } from './FetchEndpoint';

// Styled components
const SettingsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#181818',
  color: 'white',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
}));

const Sidebar = styled(Paper)(({ theme }) => ({
  width: 250,
  backgroundColor: '#1f1f1f',
  padding: theme.spacing(4, 2),
  boxShadow: 'none',
  borderRight: '1px solid rgba(255, 255, 255, 0.05)',
}));

const StyledList = styled(List)(({ theme }) => ({
  padding: 0,
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  cursor: 'pointer',
  fontWeight: 'bold',
  color: '#ccc',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: '#333',
    color: 'white',
  },
  '&.Mui-selected': {
    backgroundColor: '#333',
    color: 'white',
  },
}));

const SettingsContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(6),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  height: '100vh',
  width: '100%',
  backgroundColor: '#181818',
}));

// Form styling components (to be used in child components)
const FormGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
}));

const InputField = styled('input')(({ theme }) => ({
  width: '100%',
  backgroundColor: '#2b2b2b',
  border: '1px solid #444',
  color: 'white',
  padding: '0.75rem',
  borderRadius: '4px',
  fontSize: '1rem',
  marginBottom: '1rem',
  '&:focus': {
    outline: 'none',
    borderColor: '#0079d3',
  },
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
}));

const TextareaField = styled('textarea')(({ theme }) => ({
  backgroundColor: '#2b2b2b',
  border: '1px solid #444',
  color: 'white',
  padding: '0.75rem',
  borderRadius: '4px',
  fontSize: '1rem',
  resize: 'none',
  minHeight: '200px',
  marginBottom: '0.5rem',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  '&:focus': {
    outline: 'none',
    borderColor: '#0079d3',
  },
}));

const SaveButton = styled('button')(({ theme }) => ({
  backgroundColor: '#0079d3',
  color: 'white',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1rem',
  '&:hover': {
    backgroundColor: '#0056a3',
  },
}));

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Session checker
  useEffect(() => {
    const checkSession = async () => {
      console.log('checkSession function called');
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? `${token.substring(0, 10)}...` : 'No token found');
        
        if (!token) {
          setErrorMessage('You are not logged in. Redirecting to login...');
          navigate('/login');
          return;
        }

        const response = await fetchEndpoint('/auth/session', 'GET', token);
        console.log('Session check response:', response);

      } catch (error: any) {
        setErrorMessage('Session invalid or expired. Redirecting to login...');
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/login');
      } finally {
        console.log('checkSession function completed');
      }
    };

    checkSession();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('You are not logged in. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetchEndpoint('/profile/me', 'GET', token);
        
        // Use the response directly
        setUserData(response);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setErrorMessage('Failed to fetch data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`?tab=${tab}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Account':
        return <AccountPage />;
      case 'Password':
        return <PasswordPage />;
      case 'Profile':
      default:
        return <ProfilePage />;
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress color="primary" size={50} sx={{ color: '#0079d3', mb: 2 }} />
        <Typography variant="body1" color="white" fontFamily='"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'>
          Loading your settings...
        </Typography>
      </LoadingContainer>
    );
  }

  if (errorMessage) {
    return (
      <Box sx={{ p: 3, bgcolor: '#181818', minHeight: '100vh' }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            color: '#f44336',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>Error</AlertTitle>
          {errorMessage}
        </Alert>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box sx={{ p: 3, bgcolor: '#181818', minHeight: '100vh' }}>
        <Alert 
          severity="info" 
          sx={{ 
            mb: 2,
            backgroundColor: 'rgba(2, 136, 209, 0.1)',
            color: '#29b6f6',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          }}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>Info</AlertTitle>
          No user data available.
        </Alert>
      </Box>
    );
  }

  return (
    <SettingsContainer>
      <Sidebar elevation={0}>
        <Box sx={{ mb: 4, pl: 2 }}>
          <Typography 
            variant="h6" 
            fontWeight="bold"
            fontFamily='"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
          >
            Settings
          </Typography>
        </Box>
        <StyledList>
          {['Profile', 'Account', 'Password'].map((item) => (
            <StyledListItem
              key={item}
              selected={activeTab === item}
              onClick={() => handleTabChange(item)}
            >
              <ListItemText 
                primary={item} 
                primaryTypographyProps={{ 
                  fontWeight: 'bold',
                  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                }} 
              />
            </StyledListItem>
          ))}
        </StyledList>
      </Sidebar>
      <SettingsContent>
        {renderContent()}
      </SettingsContent>
    </SettingsContainer>
  );
};

// Export the styled components for use in child components
export { FormGroup, InputField, TextareaField, SaveButton };
export default Settings;
