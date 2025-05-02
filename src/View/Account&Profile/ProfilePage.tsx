import React, { useState, useEffect } from 'react';
import '../style/Profile.css';

const ProfileSettings = () => {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('You are not logged in. Please log in.');
                    return;
                }

                const response = await fetch('http://localhost:3000/profile/me', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        // Handle session expiration
                        alert('Session expired. Please log in again.');
                        localStorage.removeItem('token'); // Clear the token
                        window.location.href = '/login'; // Redirect to login page
                    } else {
                        alert('Failed to fetch profile data.');
                    }
                    return;
                }

                const data = await response.json();
                setName(data.name || '');
                setBio(data.bio || '');
            } catch (error) {
                alert('An error occurred while fetching profile data. Please try again later.');
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

    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not logged in. Please log in again.');
                return;
            }

            const response = await fetch('http://localhost:3000/profile/upload-profile-picture', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to upload profile picture: ${errorData.message}`);
                return;
            }

            const data = await response.json();
            alert('Profile picture uploaded successfully!');
            console.log('Uploaded profile picture:', data.profilePicture);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('An error occurred while uploading the profile picture.');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You are not logged in. Please log in again.');
                return;
            }
    
            const response = await fetch('http://localhost:3000/profile/edit-profile', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, bio }),
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => {
                    throw new Error('Unexpected response format');
                });
                alert(`Failed to update profile: ${errorData.message}`);
                return;
            }
    
            const data = await response.json();
            alert('Profile updated successfully!');
            console.log('Updated profile:', data);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating the profile. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="profile-edit-container max-w-3xl mx-auto p-6">
            <h2>Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Avatar</label>
                    <div className="avatar-section">
                        {avatar ? (
                            <img src={URL.createObjectURL(avatar)} alt="Avatar" className="avatar-preview" />
                        ) : (
                            <img src="../../uploads/default-avatar.jpg" alt="Default Avatar" className="avatar-preview" />
                        )}
                        <input type="file" onChange={handleAvatarChange} />
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