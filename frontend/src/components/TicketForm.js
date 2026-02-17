import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../services/api';

const TicketForm = ({ onCreateTicket, onTicketCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
  });

  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [classificationTimer, setClassificationTimer] = useState(null);

  useEffect(() => {
    return () => {
      if (classificationTimer) {
        clearTimeout(classificationTimer);
      }
    };
  }, [classificationTimer]);

  const classifyDescription = async (description) => {
    if (!description || description.trim().length < 20) return;

    setIsClassifying(true);
    setError(null);

    try {
      const result = await ticketAPI.classifyTicket(description);
      setFormData((prev) => ({
        ...prev,
        category: result.suggested_category || 'general',
        priority: result.suggested_priority || 'medium',
      }));
    } catch (err) {
      // Classification is best-effort only.
    } finally {
      setIsClassifying(false);
    }
  };

  const handleDescriptionChange = (e) => {
    const description = e.target.value;
    setFormData((prev) => ({ ...prev, description }));

    if (classificationTimer) {
      clearTimeout(classificationTimer);
    }

    if (description.trim().length >= 20) {
      const timer = setTimeout(() => {
        classifyDescription(description);
      }, 1000);
      setClassificationTimer(timer);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      if (formData.title.length > 200) {
        throw new Error('Title cannot exceed 200 characters');
      }

      const createFn = onCreateTicket || ticketAPI.createTicket;
      const newTicket = await createFn(formData);

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium',
      });

      if (onTicketCreated) {
        onTicketCreated(newTicket);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message;
      setError(detail || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card form-card">
      <h2 className="card-title">Create New Ticket</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Ticket created successfully.</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief summary of your issue"
            maxLength="200"
            required
          />
          <small className="hint">{formData.title.length}/200 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Describe your issue in detail"
            required
          />
          {isClassifying && (
            <div className="classifying-indicator">
              <span className="classifying-spinner"></span>
              AI is analyzing your description
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="general">General</option>
            </select>
            <small className="hint">AI-suggested, editable</small>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <small className="hint">AI-suggested, editable</small>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
};

export default TicketForm;
