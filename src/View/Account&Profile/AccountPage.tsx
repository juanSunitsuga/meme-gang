import React, { useState } from 'react';
import '../style/Profile.css';

const AccountSettings = () => {
    const [username, setUsername] = useState('temp');
    const [email, setEmail] = useState('temp@example.com');
    const [followThread, setFollowThread] = useState('On');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ username, email, followThread });
        alert('Changes saved successfully!');
    };

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
                <div className="form-group">
                    <label htmlFor="follow-thread">Follow thread on reply</label>
                    <select
                        id="follow-thread"
                        value={followThread}
                        onChange={(e) => setFollowThread(e.target.value)}
                    >
                        <option value="On">On</option>
                        <option value="Off">Off</option>
                    </select>
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