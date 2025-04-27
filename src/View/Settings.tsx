import React, { useState } from 'react';
import AccountPage from './Account&Profile/AccountPage';
import PasswordPage from './Account&Profile/PasswordPage';
import ProfilePage from './Account&Profile/ProfilePage';
import './style/Profile.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('Profile');

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

    return (
        <div className="settings-container">
            <aside className="sidebar">
                <nav>
                    <ul>
                        {['Profile', 'Account', 'Password'].map((item) => (
                            <li
                                key={item}
                                className={activeTab === item ? 'active' : ''}
                                onClick={() => setActiveTab(item)}
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
