import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  alpha,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material';

import FAIcon from './FAIcon';

const LogoTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  cursor: 'pointer',
  marginRight: theme.spacing(2),
  fontSize: '1.3rem',
  fontFamily: '"Poppins", sans-serif', // Add specific font styling
}));

// Add font styling to your buttons
const NavButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  color: 'white',
  textTransform: 'none',
  fontFamily: '"Poppins", sans-serif', // Add specific font styling
  fontWeight: 500, // Medium weight
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  },
}));

const SignUpButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  backgroundColor: '#1976d2',
  color: 'white',
  textTransform: 'none',
  fontFamily: '"Poppins", sans-serif', // Add specific font styling
  fontWeight: 600, // Semi-bold
  '&:hover': {
    backgroundColor: '#1565c0',
  },
}));

// Style the input text
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  height: '100%',
  fontFamily: '"Poppins", sans-serif', // Add specific font styling
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    borderRadius: 20,
    fontSize: '0.9rem',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

// Add this IconWrapper for Font Awesome icons
const IconWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  color: '#aaa'
});

// Define the Search styled component
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Add styled AppBar
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1a1a1a', // Changed back to dark color
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  color: 'white',
}));

const MuiNavbar: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Use auth context instead of local state
  const { isAuthenticated, logout } = useAuth();

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleLogout = () => {
    // Use the logout function from context
    logout();
    
    // Close any open menus
    handleMenuClose();
    
    // Redirect to login page
    navigate('/login');
    
    console.log('User logged out successfully');
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Your search submit logic here
    console.log('Search:', searchQuery);
  };

  const menuId = 'primary-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 3,
        sx: { backgroundColor: '#222', color: 'white' }
      }}
      // Add these props to prevent the layout shift
      disableScrollLock={true}
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'none' }
        }
      }}
    >
      <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
        <ListItemIcon>
          <IconWrapper>
            <FAIcon icon="fas fa-gear" />
          </IconWrapper>
        </ListItemIcon>
        <Typography>Settings</Typography>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <IconWrapper>
            <FAIcon icon="fas fa-sign-out-alt" />
          </IconWrapper>
        </ListItemIcon>
        <Typography>Logout</Typography>
      </MenuItem>
    </Menu>
  );

  const drawer = (
    <Box sx={{ width: 250, backgroundColor: '#222', height: '100%', color: 'white' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          MEME GANG
        </Typography>
      </Box>
      <Divider sx={{ backgroundColor: '#444' }} />
      <Box sx={{ p: 2 }}>
        <Search sx={{ width: '100%', maxWidth: '400px' }}>
          <SearchIconWrapper>
            <FAIcon icon="fas fa-search" />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            inputProps={{ 'aria-label': 'search' }}
            fullWidth
          />
        </Search>
      </Box>
      <Divider sx={{ backgroundColor: '#444' }} />
      <List>
        <ListItem button component={RouterLink} to="/trending" onClick={() => setDrawerOpen(false)}>
          <ListItemIcon sx={{ color: '#aaa' }}>
            <FAIcon icon="fas fa-fire-flame-curved" />
          </ListItemIcon>
          <ListItemText primary="Trending" />
        </ListItem>
        <ListItem button component={RouterLink} to="/fresh" onClick={() => setDrawerOpen(false)}>
          <ListItemIcon sx={{ color: '#aaa' }}>
            <FAIcon icon="fas fa-clock" />
          </ListItemIcon>
          <ListItemText primary="Fresh" />
        </ListItem>
        <ListItem button component={RouterLink} to="/top" onClick={() => setDrawerOpen(false)}>
          <ListItemIcon sx={{ color: '#aaa' }}>
            <FAIcon icon="fas fa-chart-line" />
          </ListItemIcon>
          <ListItemText primary="Top" />
        </ListItem>
      </List>
      <Divider sx={{ backgroundColor: '#444' }} />
      <Box sx={{ p: 2 }}>
        {isAuthenticated ? (
          <>
            <Button 
              fullWidth 
              variant="contained" 
              sx={{ mb: 1 }}
              onClick={() => { navigate('/create-post'); setDrawerOpen(false); }}
              startIcon={<FAIcon icon="fas fa-plus" />}

            >
              Post
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 1 }}
              onClick={() => { navigate('/settings'); setDrawerOpen(false); }}
              startIcon={<FAIcon icon="fas fa-gear" />}
            >
              Settings
            </Button>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={handleLogout}
              color="error"
              startIcon={<FAIcon icon="fas fa-sign-out-alt" />}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 1 }}
              onClick={() => { navigate('/login'); setDrawerOpen(false); }}
              color="primary"
              startIcon={<FAIcon icon="fas fa-sign-in-alt" />}
            >
              Log In
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => { navigate('/register'); setDrawerOpen(false); }}
            >
              Sign Up
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <StyledAppBar position="sticky"> {/* Changed to fixed position */}
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <FAIcon icon="fas fa-bars" />
            </IconButton>
          )}
          
          <LogoTypography variant="h6" onClick={() => navigate('/')}>
            MEME GANG
          </LogoTypography>
          
          {!isMobile && (
            <>
              <NavButton 
                component={RouterLink} 
                to="/trending"
                startIcon={<FAIcon icon="fas fa-fire-flame-curved" />}
              >
                Trending
              </NavButton>
              <NavButton 
                component={RouterLink} 
                to="/fresh"
                startIcon={<FAIcon icon="fas fa-clock" />}
              >
                Fresh
              </NavButton>
              <NavButton 
                component={RouterLink} 
                to="/top"
                startIcon={<FAIcon icon="fas fa-chart-line" />}
              >
                Top
              </NavButton>
            </>
          )}

          {!isMobile && (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <form onSubmit={handleSearchSubmit} style={{ width: '100%', maxWidth: '400px' }}>
                  <Search>
                    <SearchIconWrapper>
                      <FAIcon icon="fas fa-search" />
                    </SearchIconWrapper>
                    <StyledInputBase
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      inputProps={{ 'aria-label': 'search' }}
                    />
                  </Search>
                </form>
              </Box>
            </>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          {!isMobile && (
            <>
              {isAuthenticated ? ( // Changed from isLoggedIn to isAuthenticated
                <>
                  <NavButton
                    startIcon={<FAIcon icon="fas fa-plus" />}
                    onClick={() => { navigate('/create-post'); }}
                  >
                    Post
                  </NavButton>
                  <IconButton
                    edge="end"
                    aria-label="account"
                    aria-controls={menuId}
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    <FAIcon icon="fas fa-user-circle" />
                  </IconButton>
                </>
              ) : (
                <>
                  <NavButton
                    startIcon={<FAIcon icon="fas fa-sign-in-alt" />}
                    onClick={() => navigate('/login')}
                  >
                    Log In
                  </NavButton>
                  <SignUpButton
                    variant="contained"
                    onClick={() => navigate('/register')}
                  >
                    Sign Up
                  </SignUpButton>
                </>
              )}
            </>
          )}
        </Toolbar>
      </StyledAppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
      
      {renderMenu}
    </>
  );
};

export default MuiNavbar;