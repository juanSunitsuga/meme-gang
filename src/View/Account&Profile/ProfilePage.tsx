import React, { useState } from 'react';
import '../style/Profile.css';

const ProfileSettings = () => {
    const [displayName, setDisplayName] = useState('temp');
    const [about, setAbout] = useState('My Funny Collection');
    const [avatar, setAvatar] = useState<File | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatar(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert('Profile updated successfully!');
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
                            <img src="https://via.placeholder.com/80" alt="Default Avatar" className="avatar-preview" />
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
                    <button type="submit" className="save-button">Save Changes</button>
                </div>
            </form>
        </main>
    );
};

export default ProfileSettings;