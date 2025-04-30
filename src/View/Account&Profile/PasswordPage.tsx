import React, { useState } from 'react';
import '../style/Profile.css'; // Reuse the existing CSS

const PasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveChanges = () => {
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match!');
      return;
    }

    // Handle password update logic here
    console.log('Password changed!');
  };

  return (
    <div className="profile-edit-container">
      <h2>Password</h2>

      {/* Old Password */}
      <div className="form-group">
        <label htmlFor="old-password">Old password</label>
        <input
          type="password"
          id="old-password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="input-field"
        />
      </div>

      {/* New Password */}
      <div className="form-group">
        <label htmlFor="new-password">New password</label>
        <input
          type="password"
          id="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Confirm New Password */}
      <div className="form-group">
        <label htmlFor="confirm-password">Re-type new password</label>
        <input
          type="password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Save Changes Button */}
      <div className="form-actions">
        <button
          onClick={handleSaveChanges}
          className="save-button"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default PasswordPage;