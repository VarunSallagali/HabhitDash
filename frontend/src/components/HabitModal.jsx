import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';

const dayOptions = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

export default function HabitModal({ habit, isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [color, setColor] = useState('#6366f1');
  const [scheduleDays, setScheduleDays] = useState([]);
  const [reminderTime, setReminderTime] = useState('');
  const [loading, setLoading] = useState(false);

  const colors = [
    { name: 'Blue', value: '#6366f1' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Teal', value: '#14b8a6' },
  ];

  useEffect(() => {
    if (habit) {
      setTitle(habit.title || '');
      setDescription(habit.description || '');
      setFrequency(habit.frequency || 'daily');
      setColor(habit.color || '#6366f1');
      setScheduleDays(habit.schedule_days || []);
      setReminderTime(habit.reminder_time || '');
    } else {
      setTitle('');
      setDescription('');
      setFrequency('daily');
      setColor('#6366f1');
      setScheduleDays([]);
      setReminderTime('');
    }
  }, [habit, isOpen]);

  function toggleDay(day) {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a habit title');
      return;
    }

    const payload = {
      title,
      description,
      frequency,
      color,
      schedule_days: scheduleDays,
      reminder_time: reminderTime,
    };

    setLoading(true);
    try {
      if (habit) {
        await api(`/habits/${habit.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/habits', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving habit:', err);
      alert('Failed to save habit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{habit ? 'Edit Habit' : 'Create New Habit'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Habit Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Exercise"
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              className="input"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="input"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

  { /* Schedule days */ }
          <div className="form-group">
            <label>Preferred Days</label>
            <div className="day-picker">
              {dayOptions.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  className={`day-chip ${
                    scheduleDays.includes(day.value) ? 'day-chip-active' : ''
                  }`}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Reminder Time</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="input"
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`color-option ${
                    color === c.value ? 'color-option-active' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColor(c.value)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : habit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

