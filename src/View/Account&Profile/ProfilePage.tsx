import React, { useState } from 'react';
import '../style/Profile.css';

const ProfileSettings = () => {
    const [displayName, setDisplayName] = useState('temp');
    const [status, setStatus] = useState('None');
    const [gender, setGender] = useState('');
    const [birthday, setBirthday] = useState({ year: '', month: '', day: '' });
    const [hometown, setHometown] = useState('Indonesia');
    const [about, setAbout] = useState('My Funny Collection');
    const [avatar, setAvatar] = useState<File | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatar(e.target.files[0]);
        }
    };

    const handleBirthdayChange = (field: 'year' | 'month' | 'day', value: string) => {
        setBirthday(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log({ displayName, status, gender, birthday, hometown, about, avatar });
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
                    <label>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="None">None</option>
                        <option value="Single">Single</option>
                        <option value="Taken">Taken</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Birthday</label>
                    <div className="birthday-inputs">
                        <input
                            type="text"
                            placeholder="YYYY"
                            value={birthday.year}
                            onChange={(e) => handleBirthdayChange('year', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="MM"
                            value={birthday.month}
                            onChange={(e) => handleBirthdayChange('month', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="DD"
                            value={birthday.day}
                            onChange={(e) => handleBirthdayChange('day', e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Hometown</label>
                    <input
                        type="text"
                        value={hometown}
                        onChange={(e) => setHometown(e.target.value)}
                    />
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