import React, { useState, useEffect } from 'react';
import '../style/Profile.css';

const ProfileSettings = () => {
    const [displayName, setDisplayName] = useState('');
    const [about, setAbout] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('You are not logged in. Please log in again.');
                    return;
                }

                const response = await fetch('http://localhost:3000/auth/profile', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    alert('Failed to fetch profile data.');
                    return;
                }

                const data = await response.json();
                setDisplayName(data.displayName || '');
                setAbout(data.about || '');
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false); // Ensure loading is set to false
            }
        };

        fetchProfileData();
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatar(e.target.files[0]);
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

            const formData = new FormData();
            formData.append('displayName', displayName);
            formData.append('about', about);
            if (avatar) {
                formData.append('avatar', avatar);
            }

            const response = await fetch('http://localhost:3000/auth/profile', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to update profile: ${errorData.message}`);
                return;
            }

            alert('Profile updated successfully!');
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
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <small>This is the name that will be visible on your profile</small>
                </div>

                <div className="form-group">
                    <label>About</label>
                    <textarea
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
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