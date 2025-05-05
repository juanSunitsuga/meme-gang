import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountPage from './Account&Profile/AccountPage';
import PasswordPage from './Account&Profile/PasswordPage';
import ProfilePage from './Account&Profile/ProfilePage';
import './style/Profile.css';
import { fetchEndpoint } from './FetchEndpoint';
import { Alert, AlertTitle } from '@mui/material';

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
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setErrorMessage('You are not logged in. Redirecting to login...');
                    navigate('/login');
                    return;
                }

                const response = await fetchEndpoint('/auth/session', 'GET', token);

            } catch (error: any) {
                console.error('Session check error:', error);
                setErrorMessage('Session invalid or expired. Redirecting to login...');
                localStorage.removeItem('token'); // Clear invalid token
                navigate('/login');
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
        return <div>Loading...</div>;
    }

    if (errorMessage) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                <AlertTitle>Error</AlertTitle>
                {errorMessage}
            </Alert>
        );
    }

    if (!userData) {
        return (
            <Alert severity="info" sx={{ mb: 2 }}>
                <AlertTitle>Info</AlertTitle>
                No user data available.
            </Alert>
        );
    }

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
