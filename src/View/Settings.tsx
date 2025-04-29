import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountPage from './Account&Profile/AccountPage';
import PasswordPage from './Account&Profile/PasswordPage';
import ProfilePage from './Account&Profile/ProfilePage';
import './style/Profile.css';

const Settings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Profile');

    // Session checker
    useEffect(() => {
        const checkSession = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found. Redirecting to login.');
                    navigate('/login');
                    return;
                }
                console.log('Token being sent:', token);

                const response = await fetch('http://localhost:3000/auth/session', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.error('Session invalid or expired');
                    localStorage.removeItem('token'); // Clear invalid token
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error checking session:', error);
                navigate('/login');
            }
        };

        checkSession();
    }, [navigate]);

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

    return (
        <div className="settings-container">
            <aside className="sidebar">
                <nav>
                    <ul>
                        {['Profile', 'Account', 'Password'].map((item) => (
                            <li
                                key={item}
                                className={activeTab === item ? 'active' : ''}
                                onClick={() => handleTabChange(item)}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="settings-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default Settings;
