import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Settings from './View/Settings';
import Login from './View/Login';
import Register from './View/Register';
import SearchForm from './View/SearchForm';
import ViewComments from './View/Comments/ViewComments';

function App() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <div className="App">
            <button onClick={() => navigate('/settings')}>Settings</button>
            <button onClick={() => navigate('/login')}>Login</button>
<<<<<<< HEAD
=======
            <button onClick={() => navigate('/register')}>Register</button>
            <button onClick={() => navigate('/comments')}>View Comments</button>

>>>>>>> 596818f9673390bb8e659a5cff746e52e34e5edf
            <form onSubmit={handleSearchSubmit} style={{ display: 'inline' }}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            <Routes>
                <Route path="/settings" element={<Settings />} />
                <Route path="/login" element={<Login />} />
                <Route path="/search" element={<SearchForm />} />
                <Route path="/comments/:commentsId" element={<ViewComments />} />
            </Routes>
        </div>
    );
}

export default App;