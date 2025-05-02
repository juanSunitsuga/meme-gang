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
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Session checker
    useEffect(() => {
        const checkSession = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const response = await fetch('http://localhost:3000/auth/session', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    alert('Session invalid or expired');
                    localStorage.removeItem('token'); // Clear invalid token
                    navigate('/login');
                }
            } catch (error) {
                navigate('/login');
            }
        };

        checkSession();
    }, [navigate]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not logged in. Please log in.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/profile/me', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        alert('You are not logged in. Please log in again.');
                    } else {
                        alert('Failed to fetch data. Please try again later.');
                    }
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                setUserData(data);
            } catch (error) {
                alert('Failed to fetch data. Please check your connection.');
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

    if (!userData) {
        return <div>No user data available.</div>;
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
                {/* Add more user details as needed */}
                {renderContent()}
            </main>
        </div>
    );
};

export default Settings;
