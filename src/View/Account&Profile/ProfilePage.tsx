import React, { useState, useEffect } from 'react';
import '../style/Profile.css';
import { fetchEndpoint } from '../FetchEndpoint';
import { Alert, AlertTitle } from '@mui/material';
import { c } from 'vite/dist/node/moduleRunnerTransport.d-CXw_Ws6P';

const ProfileSettings = () => {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setAlertMessage('You are not logged in. Please log in.');
                    setAlertSeverity('error');
                    return;
                }

                const response = await fetchEndpoint('/profile/me', 'GET', token);

                // Use the response directly
                setName(response.name || '');
                setBio(response.bio || '');

                let avatarUrl = response.profilePicture || null;
                if (avatarUrl && avatarUrl.includes('/uploads/')) {
                    const urlParts = avatarUrl.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    avatarUrl = `./uploads/avatars/${filename}`;
                }
                setAvatarUrl(avatarUrl);
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setAlertMessage('Failed to fetch profile data. Please try again later.');
                setAlertSeverity('error');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatar(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!avatar) {
            setAlertMessage('Please select a file to upload.');
            setAlertSeverity('error');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setAlertMessage('You are not logged in. Please log in again.');
                setAlertSeverity('error');
                return;
            }

            const formData = new FormData();
            formData.append('profilePicture', avatar);

            const response = await fetchEndpoint('/uploads/avatar', 'POST', token, formData);

            setAlertMessage('Profile picture uploaded successfully!');
            setAlertSeverity('success');

            // Update avatar URL with the response
            if (response.profilePicture) {
                setAvatarUrl(response.profilePicture);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            setAlertMessage(error.message || 'An error occurred while uploading the profile picture.');
            setAlertSeverity('error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setAlertMessage('You are not logged in. Please log in again.');
                setAlertSeverity('error');
                return;
            }

            const response = await fetchEndpoint('/profile/edit-profile', 'PUT', token, { name, bio });

            if (!response.ok) {
                const errorData = await response.json().catch(() => {
                    throw new Error('Unexpected response format');
                });
                setAlertMessage(`Failed to update profile: ${errorData.message}`);
                setAlertSeverity('error');
                return;
            }

            const data = await response.json();
            setAlertMessage('Profile updated successfully!');
            setAlertSeverity('success');
        } catch (error) {
            console.error('Error updating profile:', error);
            setAlertMessage('An error occurred while updating the profile. Please try again later.');
            setAlertSeverity('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="profile-edit-container max-w-3xl mx-auto p-6">
            <h2>Profile</h2>
            {alertMessage && alertSeverity && (
                <Alert severity={alertSeverity} sx={{ mb: 2 }}>
                    <AlertTitle>{alertSeverity === 'success' ? 'Success' : 'Error'}</AlertTitle>
                    {alertMessage}
                </Alert>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Avatar</label>
                    <div className="avatar-section">
                        {avatar ? (
                            <img src={URL.createObjectURL(avatar)} alt="Avatar" className="avatar-preview" />
                        ) : avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="avatar-preview"
                            />
                        ) : (
                            <img src="src\View\Account&Profile\default-avatar.jpg" alt="Default Avatar" className="avatar-preview" />
                        )}
                        <input type="file" onChange={handleAvatarChange} />
                        <button
                            type="button"
                            className="upload-button"
                            onClick={handleUpload}
                            disabled={loading}
                        >
                            {loading ? 'Uploading...' : 'Upload Picture'}
                        </button>
                    </div>
                    <small>JPG, GIF or PNG, Max size: 10MB</small>
                </div>

                <div className="form-group">
                    <label>Display name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <small>This is the name that will be visible on your profile</small>
                </div>

                <div className="form-group">
                    <label>About</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={8}
                        placeholder="Tell us about yourself"
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="save-button" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </main>
    );
};

export default ProfileSettings;