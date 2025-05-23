import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../utils/api';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {};
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    profilePicture: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { fullName, dateOfBirth, gender, profilePicture } = formData;

  // If there's no user in the state, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/users/profile/${user.uid}/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, profilePicture: data.profilePicture }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.message || 'Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Basic validation
    if (!fullName || !dateOfBirth || !gender) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Send profile data to the API
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          uid: user.uid,
          fullName,
          dateOfBirth,
          gender,
          profilePicture
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // Redirect to home page
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error updating profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Complete Your Profile</h1>
      <p className="auth-subtitle">Please provide some additional information to complete your registration.</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            className="form-control"
            id="fullName"
            name="fullName"
            value={fullName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            type="date"
            className="form-control"
            id="dateOfBirth"
            name="dateOfBirth"
            value={dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            className="form-control"
            id="gender"
            name="gender"
            value={gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="profilePicture">Profile Picture</label>
          <input
            type="file"
            className="form-control-file"
            id="profilePicture"
            name="profilePicture"
            onChange={handleFileChange}
            accept="image/*"
          />
          <small className="form-text text-muted">Optional: Upload a profile picture</small>
        </div>
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup; 