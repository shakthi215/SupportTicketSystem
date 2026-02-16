import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TicketForm = ({ onTicketCreated, apiBaseUrl }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: ''
  });
  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suggestedValues, setSuggestedValues] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-classify when description changes (with debounce)
  useEffect(() => {
    if (formData.description.length > 20) {
      const timer = setTimeout(() => {
        classifyDescription();
      }, 1000); // Wait 1 second after user stops typing

      return () => clearTimeout(timer);
    }
  }, [formData.description]);

  const classifyDescription = async () => {
    setClassifying(true);
    setSuggestedValues(null);

    try {
      const response = await axios.post(`${apiBaseUrl}/tickets/classify/`, {
        description: formData.description
      });

      setSuggestedValues({
        category: response.data.suggested_category,
        priority: response.data.suggested_priority
      });

      // Auto-fill if user hasn't selected values yet
      if (!formData.category) {
        setFormData(prev => ({
          ...prev,
          category: response.data.suggested_category
        }));
      }
      if (!formData.priority) {
        setFormData(prev => ({
          ...prev,
          priority: response.data.suggested_priority
        }));
      }
    } catch (error) {
      console.error('Classification error:', error);
      // Fail silently - user can still select manually
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (formData.title.length > 200) {
      setError('Title must not exceed 200 characters');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.priority) {
      setError('Please select a priority');
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`${apiBaseUrl}/tickets/`, formData);
      setSuccess('Ticket created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: ''
      });
      setSuggestedValues(null);

      // Notify parent
      if (onTicketCreated) {
        onTicketCreated();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to create ticket. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ticket-form">
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief summary of your issue"
            maxLength={200}
            required
          />
          <small>{formData.title.length}/200 characters</small>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Provide detailed information about your issue..."
            rows={5}
            required
          />
          {classifying && (
            <small className="classifying">
              🤖 AI is analyzing your description...
            </small>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Category *
              {suggestedValues && (
                <span className="suggestion">
                  {' '}(AI suggested: {suggestedValues.category})
                </span>
              )}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select category...</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Priority *
              {suggestedValues && (
                <span className="suggestion">
                  {' '}(AI suggested: {suggestedValues.priority})
                </span>
              )}
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
            >
              <option value="">Select priority...</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={submitting || classifying}>
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
