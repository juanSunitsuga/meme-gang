import React, { useState, useEffect } from 'react';
import '../style/Profile.css';

const AccountSettings = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [followThread, setFollowThread] = useState('On');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found. Redirecting to login.');
                    return;
                }

                const response = await fetch('http://localhost:3000/profile/me', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.error('Failed to fetch user data');
                    return;
                }

                const data = await response.json();
                console.log('Fetched user data:', data);

                // Update state with fetched user data
                setUsername(data.username);
                setEmail(data.email);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ username, email, followThread });
        alert('Changes saved successfully!');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-edit-container max-w-3xl mx-auto p-6">
            <h2>Account</h2>
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