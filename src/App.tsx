import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Settings from './View/Settings';
import Login from './View/Login';
import Register from './View/Register';
import SearchForm from './View/SearchForm';
import ViewComments from './View/Comments/ViewComments';
import Home from './View/Home'; // Import Home component
import './.css';

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
                    <Route path="/comments/:id" element={<ViewComments />} />
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
            <AppContent />
        </Router>
    );
}

export default App;