import React, { useState } from 'react';
import '../style/Profile.css'; // Reuse the existing CSS

const PasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveChanges = async () => {
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not logged in. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:3000/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to change password: ${errorData.message}`);
        return;
      }

      alert('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred while changing the password. Please try again later.');
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default PasswordPage;