import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  Paper, 
  Alert, 
  AlertTitle, 
  CircularProgress,
  styled,
  alpha,
  Avatar,
  IconButton,
  Divider
} from '@mui/material';
import { fetchEndpoint } from '../FetchEndpoint';
import FAIcon from '../../components/FAIcon';

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
    '& input, & textarea': {
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

const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: alpha('#1976d2', 0.1),
  color: '#1976d2',
  textTransform: 'none',
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 600,
  padding: theme.spacing(1, 2),
  marginLeft: theme.spacing(2),
  '&:hover': {
    backgroundColor: alpha('#1976d2', 0.2),
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const AvatarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  marginRight: theme.spacing(3),
  border: '3px solid rgba(255,255,255,0.2)',
}));

const HelperText = styled(Typography)(({ theme }) => ({
  color: '#888',
  fontSize: '0.75rem',
  marginTop: theme.spacing(0.5),
  fontFamily: '"Poppins", sans-serif',
}));

const ProfileSettings = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAlertMessage('You are not logged in. Please log in.');
          setAlertSeverity('error');
          setLoading(false);
          return;
        }

        const response = await fetchEndpoint('/profile/me', 'GET', token);

        // Use the response directly
        setName(response.name || '');
        setBio(response.bio || '');

        if (response.profilePicture) {
          setAvatarUrl(response.profilePicture);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setAlertMessage('Failed to fetch profile data. Please try again later.');
        setAlertSeverity('error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!avatar) {
      setAlertMessage('Please select a file to upload.');
      setAlertSeverity('error');
      return;
    }

    try {
      setUploadLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setAlertMessage('You are not logged in. Please log in again.');
        setAlertSeverity('error');
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('profilePicture', avatar);
      
      console.log('Uploading file:', avatar.name, 'size:', avatar.size, 'type:', avatar.type);
      
      const response = await fetchEndpoint('/uploads/avatar', 'POST', token, formData);
      console.log('Upload response:', response);

      setAlertMessage('Profile picture uploaded successfully!');
      setAlertSeverity('success');

      setAvatar(null);
      
      if (response && response.profilePicture) {
        setAvatarUrl(response.profilePicture);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setAlertMessage(error.message || 'An error occurred while uploading the profile picture.');
      setAlertSeverity('error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaveLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setAlertMessage('You are not logged in. Please log in again.');
        setAlertSeverity('error');
        return;
      }

      const response = await fetchEndpoint('/profile/edit-profile', 'PUT', token, { name, bio });

      setAlertMessage('Profile updated successfully!');
      setAlertSeverity('success');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setAlertMessage(error.message || 'An error occurred while updating the profile.');
      setAlertSeverity('error');
    } finally {
      setSaveLoading(false);
    }
  };

  const getAvatarUrl = (avatarPath: string) => {
    // If it's already a full URL, return it
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    // Extract just the filename if it's a path
    const filename = avatarPath.includes('/')
      ? avatarPath.split('/').pop()
      : avatarPath;
      
    // If we don't have a filename, return undefined
    if (!filename) return undefined;
    
    // Construct the correct URL to match our image controller routes
    return `/uploads/avatars/${filename}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
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
        Profile Settings
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
          onClose={() => setAlertMessage(null)}
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
            <Box>
              <Typography 
                variant="subtitle1" 
                component="h3"
                sx={{ 
                  mb: 1, 
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  color: '#fff'
                }}
              >
                Profile Picture
              </Typography>
              
              <AvatarContainer>
                <StyledAvatar 
                  src={avatar 
                    ? URL.createObjectURL(avatar) 
                    : avatarUrl 
                      ? getAvatarUrl(avatarUrl)
                      : undefined
                  }
                  alt={name || "Profile"} 
                  onClick={handleAvatarClick}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                >
                  {!avatar && !avatarUrl && (name ? name[0].toUpperCase() : <FAIcon icon="fas fa-user" />)}
                </StyledAvatar>
                
                <Box>
                  <HiddenInput
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                  />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={handleAvatarClick}
                      startIcon={<FAIcon icon="fas fa-camera" />}
                      sx={{
                        color: '#aaa',
                        borderColor: 'rgba(255,255,255,0.23)',
                        textTransform: 'none',
                        fontFamily: '"Poppins", sans-serif',
                        '&:hover': {
                          borderColor: 'rgba(255,255,255,0.5)',
                          backgroundColor: 'rgba(255,255,255,0.05)'
                        }
                      }}
                    >
                      Change Photo
                    </Button>
                    
                    {avatar && (
                      <UploadButton
                        variant="outlined"
                        onClick={handleUpload}
                        disabled={uploadLoading}
                        startIcon={uploadLoading ? 
                          <CircularProgress size={16} color="inherit" /> : 
                          <FAIcon icon="fas fa-cloud-arrow-up" />
                        }
                      >
                        {uploadLoading ? 'Uploading...' : 'Upload'}
                      </UploadButton>
                    )}
                  </Box>
                  
                  <HelperText>
                    JPG, GIF or PNG, Max size: 10MB
                  </HelperText>
                </Box>
              </AvatarContainer>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            <Box>
              <StyledTextField
                label="Display Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                helperText="This is the name that will be visible on your profile"
              />
            </Box>

            <Box>
              <StyledTextField
                label="About"
                fullWidth
                multiline
                rows={6}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                variant="outlined"
                placeholder="Tell us about yourself"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
              <SaveButton 
                type="submit" 
                variant="contained" 
                startIcon={saveLoading ? undefined : <FAIcon icon="fas fa-save" />}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Saving...
                  </Box>
                ) : (
                  'Save Changes'
                )}
              </SaveButton>
            </Box>
          </FormContainer>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default ProfileSettings;