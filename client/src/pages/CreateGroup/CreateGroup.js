import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../utils/api';
import api from '../../utils/api';
import './CreateGroup.css';

const CreateGroup = () => {
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    tags: []
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [userId, setUserId] = useState('');

  // Check if user is authenticated and get user ID
  useEffect(() => {
    console.log('CreateGroup useEffect running');
    const token = authService.getToken();
    console.log('Token exists:', !!token);
    console.log('Token value:', token);
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const { user_id } = JSON.parse(jsonPayload);
      setUserId(user_id);
    } catch (err) {
      console.error("Failed to parse token:", err);
      setError("Session expired. Please login again.");
      authService.logout();
      navigate('/login');
    }
  }, [navigate]);

  const availableTags = [
    'Sports', 'Music', 'Art', 'Technology', 'Food', 'Travel',
    'Gaming', 'Movies', 'Books', 'Fitness', 'Business', 'Education'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'name') {
      setNameError('');
    }
  };

  const handleTagClick = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!formData.name.trim()) {
      setNameError('Group name is required');
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      setNameError('Group name must be at least 3 characters long');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const token = authService.getToken();
      
      if (!token) {
        console.log('No token found during submission');
        throw new Error('Authentication required');
      }

      const requestData = {
        ...formData,
        tags: selectedTags,
        adminId: userId,
        members: [userId] 
      };

      const response = await api.post('/api/groups', requestData);

      navigate('/profile', { state: { activeTab: 'groups' } });
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      if (err.response?.status === 401) {
        console.log('Unauthorized response, logging out user');
        authService.logout();
        navigate('/login');
        return;
      }

      if (err.message === 'Authentication required') {
        console.log('Authentication required, redirecting to login');
        navigate('/login');
        return;
      }

      setError(err.response?.data?.message || err.message || 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-container">
      <div className="create-group-header">
        <h1>Create New Group</h1>
        <button className="btn-back" onClick={() => {
          console.log('Back button clicked');
          navigate('/profile', { state: { activeTab: 'groups' } });
        }}>
          &larr; Back to Profile
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="create-group-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Group Name <span className="required">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-control ${nameError ? 'error' : ''}`}
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter group name"
          />
          {nameError && <div className="field-error">{nameError}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your group"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div className="tags-container">
            {availableTags.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag-button ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && <span className="tag-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="toggle-label">
            <div className="switch-container">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="switch-input"
              />
              <span className="switch-slider"></span>
            </div>
            <span className="toggle-text">Public Group</span>
          </label>
          <small className="form-text">
            Public groups can be found by anyone, while private groups are invite-only.
          </small>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating Group...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup; 