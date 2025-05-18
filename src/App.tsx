import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Settings from './View/Settings';
import Login from './View/Login';
import Register from './View/Register';
import SearchForm from './View/SearchForm';
import ViewComments from './View/Comments/ViewComments';
import Home from './View/Home'; // Import Home component

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
                    <Route path="/" element={<Home />} /> {/* Add a Home route */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/search" element={<SearchForm onSubmit={handleSearchSubmit} />} />
                    <Route path="/comments/:id/replies" element={<ViewComments />} />
                    {/* <Route path="/post/:id/comments" element={<ViewComments />} /> */}
                    {/* Add other routes here */}
                </Routes>
            </div>
        </div>
    );
}

function App() {
    // Wrap everything in Router
    return (
        <Router>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline /> {/* This helps reset browser defaults */}
                <AppContent />
            </ThemeProvider>
        </Router>
    );
}

export default App;