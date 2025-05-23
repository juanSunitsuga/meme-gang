import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './View/Components/Navbar';
import Settings from './View/Settings';
import SearchForm from './View/SearchForm';
import Home from './View/Home';
import { AuthProvider } from './View/contexts/AuthContext';
import { ModalProvider } from './View/contexts/ModalContext';
import LoginModal from './View/Auth/LoginModal';
import RegisterModal from './View/Auth/RegisterModal';
import ForgotPasswordModal from './View/Auth/ForgotPasswordModal';
import ResetPasswordModal from './View/Auth/ResetPasswordModal';
import CreatePostModal from './View/CreatePostModal';
import PostDetailPage from './View/PostDetailPage';
// import Comment from './View/Comments/CommentList';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#121212',
            paper: '#1a1a1a',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    margin: 0,
                    padding: 0,
                    backgroundColor: '#121212',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                },
                html: {
                    margin: 0,
                    padding: 0,
                    boxSizing: 'border-box',
                }
            },
        },
    },
});

const theme = createTheme({
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h6: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 500,
        }
    },
});

function AppContent() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <div className="App">
            <Navbar />
            <div className="content-container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/search" element={<SearchForm onSubmit={handleSearchSubmit} />} />
                    <Route path="/post/:postId" element={<PostDetailPage />} />
                    {/* <Route path="/post/:id" element={<Comment />} /> */}
                    {/* Add other routes here */}
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <ModalProvider>
                <Router>
                    <ThemeProvider theme={darkTheme}>
                        <CssBaseline />
                        <AppContent />
                        
                        {/* Add all modals so they're available throughout the app */}
                        <LoginModal />
                        <RegisterModal />
                        <ForgotPasswordModal />
                        <ResetPasswordModal />
                        <CreatePostModal />
                    </ThemeProvider>
                </Router>
            </ModalProvider>
        </AuthProvider>
    );
}

export default App;