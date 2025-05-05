import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    setMobileMenuOpen(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <img src="/meme-gang-logo.png" alt="Meme Gang" />
          <span>MEME GANG</span>
        </div>
        
        {/* Mobile menu toggle */}
        <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </div>
        
        {/* Main navigation links */}
        <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/trending" className="nav-link">
            <i className="fas fa-fire"></i>
            <span>Trending</span>
          </Link>
          <Link to="/fresh" className="nav-link">
            <i className="fas fa-clock"></i>
            <span>Fresh</span>
          </Link>
          <Link to="/top" className="nav-link">
            <i className="fas fa-chart-line"></i>
            <span>Top</span>
          </Link>
        </div>
        
        {/* Search form */}
        <div className={`navbar-search ${mobileMenuOpen ? 'active' : ''}`}>
          <form onSubmit={handleSearchSubmit}>
            <div className="search-container">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
        
        {/* User actions */}
        <div className={`navbar-user ${mobileMenuOpen ? 'active' : ''}`}>
          {isLoggedIn ? (
            <>
              <button className="navbar-button" onClick={() => navigate('/create-post')}>
                <i className="fas fa-plus"></i>
                <span>Post</span>
              </button>
              <div className="user-dropdown">
                <button className="user-avatar">
                  <i className="fas fa-user-circle"></i>
                </button>
                <div className="dropdown-content">
                  <Link to="/profile">Profile</Link>
                  <Link to="/settings">Settings</Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button className="navbar-button" onClick={() => navigate('/login')}>
                <i className="fas fa-sign-in-alt"></i>
                <span>Log In</span>
              </button>
              <button className="navbar-button signup-button" onClick={() => navigate('/register')}>
                <span>Sign Up</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;