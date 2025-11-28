import React, { useState } from 'react';
import { api } from '../lib/api.js';

export default function HabitCard({ habit, onRefresh }) {
  const [loading, setLoading] = useState(false);

  async function mark() {
    setLoading(true);
    try {
      await api(`/habits/${habit.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      onRefresh();
    } catch (err) {
      console.error('Error marking habit:', err);
      alert('Failed to mark habit as complete');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={mark}
      className="btn-secondary"
      disabled={loading}
      style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
    >
      {loading ? '...' : '✓ Done'}
    </button>
  );
}


