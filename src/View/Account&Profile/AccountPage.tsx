import React, { useState, useEffect } from 'react';
import '../style/Profile.css';
import { fetchEndpoint } from '../FetchEndpoint';
import { Alert, AlertTitle } from '@mui/material';

const AccountSettings = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [followThread, setFollowThread] = useState('On');
    const [loading, setLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setAlertMessage('No token found. Redirecting to login.');
                    setAlertSeverity('error');
                    window.location.href = '/login';
                    return;
                }

                const response = await fetchEndpoint('/profile/me', 'GET', token);
                const data = await response.json();

                // Update state with fetched user data
                setUsername(data.username);
                setEmail(data.email);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setAlertMessage('An error occurred while fetching user data.');
                setAlertSeverity('error');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAlertMessage('Changes saved successfully!');
        setAlertSeverity('success');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-edit-container max-w-3xl mx-auto p-6">
            <h2>Account</h2>

            {/* Alert Section */}
            {alertMessage && alertSeverity && (
                <Alert severity={alertSeverity} sx={{ mb: 2 }}>
                    <AlertTitle>{alertSeverity === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    {alertMessage}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <p className="link-preview">https://memegang.com/u/{username}</p>
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <small>Email will not be displayed publicly</small>
                    <p className="verification-text">
                        Verification sent to <strong>{email}</strong>, please open the link to verify your email. <br />
                        <span className="resend-link">Resend Verification Email</span>
                    </p>
                </div>
                <div className="form-actions">
                    <button type="submit" className="save-button">Save Changes</button>
                    <button type="button" className="delete-button">Delete account</button>
                </div>
            </form>
        </div>
    );
};

export default AccountSettings;