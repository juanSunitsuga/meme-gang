import React, { useEffect, useState, createContext, useContext } from 'react';
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

// Create Profile Context
interface ProfileContextType {
  userData: any;
  loading: boolean;
  updateProfile: (data: any) => Promise<any>;
  updateAccount: (data: any) => Promise<any>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<any>;
  uploadAvatar: (formData: FormData) => Promise<any>;
  deleteAvatar: () => Promise<any>;
  errorMessage: string | null;
}

export const ProfileContext = createContext<ProfileContextType | null>(null);

// Hook for child components to consume the context
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

// Styled components
const SettingsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#181818',
  color: 'white',
  fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  overflow: 'hidden', // Prevent scrolling at container level
}));

const Sidebar = styled(Paper)(({ theme }) => ({
  width: 250,
  backgroundColor: '#1f1f1f',
  padding: theme.spacing(4, 2),
  boxShadow: 'none',
  borderRight: '1px solid rgba(255, 255, 255, 0.05)',
  height: '100vh', // Fixed height
  position: 'sticky',
  top: 0,
  overflowY: 'auto', // Allow scrolling if sidebar content is too tall
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
  overflowY: 'auto', // Enable vertical scrolling
  height: '100vh', // Set a fixed height
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#1a1a1a',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#444',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
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

      } catch (error: any) {
        setErrorMessage('Session invalid or expired. Redirecting to login...');
        localStorage.removeItem('token');
        navigate('/');
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

  // Functions to be shared via context
  const updateProfile = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You are not logged in');
      
      const response = await fetchEndpoint('/profile/edit-profile', 'PUT', token, data);
      
      setUserData(prev => ({ ...prev, ...data }));
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { success: false, message: error.message || 'Error updating profile' };
    }
  };

  const updateAccount = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You are not logged in');
      
      const response = await fetchEndpoint('/profile/edit-account', 'PUT', token, data);
      
      setUserData(prev => ({ ...prev, ...data }));
      
      return { success: true, message: 'Account updated successfully' };
    } catch (error: any) {
      console.error('Error updating account:', error);
      return { success: false, message: error.message || 'Error updating account' };
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You are not logged in');
      
      const response = await fetchEndpoint('/profile/change-password', 'POST', token, { 
        oldPassword, newPassword 
      });
      
      return { success: true, message: 'Password changed successfully' };
    } catch (error: any) {
      console.error('Error changing password:', error);
      return { success: false, message: error.message || 'Error changing password' };
    }
  };

  const uploadAvatar = async (formData: FormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You are not logged in');
      
      const response = await fetchEndpoint('/uploads/avatar', 'POST', token, formData);
      
      if (response && response.profilePicture) {
        setUserData(prev => ({ ...prev, profilePicture: response.profilePicture }));
      }
      
      return { 
        success: true, 
        message: 'Profile picture uploaded successfully',
        profilePicture: response.profilePicture
      };
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      return { success: false, message: error.message || 'Error uploading avatar' };
    }
  };

  const deleteAvatar = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You are not logged in');
      
      const response = await fetchEndpoint('/uploads/delete-avatar', 'DELETE', token);
      
      setUserData(prev => ({ ...prev, profilePicture: undefined }));
      
      return { success: true, message: 'Profile picture deleted successfully' };
    } catch (error: any) {
      console.error('Error deleting avatar:', error);
      return { success: false, message: error.message || 'Error deleting avatar' };
    }
  };

  const renderContent = () => {
    return (
      <ProfileContext.Provider value={{
        userData,
        loading,
        updateProfile,
        updateAccount,
        changePassword,
        uploadAvatar,
        deleteAvatar,
        errorMessage
      }}>
        {activeTab === 'Account' ? (
          <AccountPage />
        ) : activeTab === 'Password' ? (
          <PasswordPage />
        ) : (
          <ProfilePage />
        )}
      </ProfileContext.Provider>
    );
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
              sx={{
                backgroundColor: activeTab === item ? '#333' : 'transparent',
                color: activeTab === item ? 'white' : '#ccc',
              }}
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

export { FormGroup, InputField, TextareaField, SaveButton };
export default Settings;
