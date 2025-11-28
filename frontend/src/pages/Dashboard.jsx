import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import Sidebar from '../components/Sidebar.jsx';
import HabitCard from '../components/HabitCard.jsx';
import HabitModal from '../components/HabitModal.jsx';
import StatsCard from '../components/StatsCard.jsx';
import { LineChart, DoughnutChart, BarChart } from '../components/AnalyticsChart.jsx';

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    fetchHabits();
    fetchCompletions();
  }, []);

  async function fetchHabits() {
    const r = await api('/habits');
    if (Array.isArray(r)) {
      setHabits(r);
    }
    if (r.error === 'Invalid token' || r.error === 'No token') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      nav('/login');
    }
  }

  async function fetchCompletions() {
    // For now, we'll calculate stats from habits
    // Later we can add a dedicated completions endpoint
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/login');
  }

  function openCreateModal() {
    setEditingHabit(null);
    setShowModal(true);
  }

  function openEditModal(habit) {
    setEditingHabit(habit);
    setShowModal(true);
  }

  // Calculate stats
  const totalHabits = habits.length;
  const completedToday = habits.filter(h => {
    // This would check actual completions - simplified for now
    return false;
  }).length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const streakData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Completions',
        data: [3, 5, 4, 6, 5, 7, 6], // Demo data
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const completionData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completionRate, 100 - completionRate],
        backgroundColor: ['#22c55e', '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  const habitFrequencyData = {
    labels: habits.map(h => h.title || 'Habit').slice(0, 6),
    datasets: [
      {
        label: 'Completions',
        data: habits.slice(0, 6).map(() => Math.floor(Math.random() * 10) + 1), // Demo
        backgroundColor: '#6366f1',
      },
    ],
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="dashboard-container">
      <Sidebar user={user} onLogout={logout} />

      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search habits..." className="search-input" />
          </div>
          <div className="top-bar-actions">
            <button className="icon-btn">🔔</button>
            <button className="icon-btn">💬</button>
            <div className="user-avatar-small">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">{formattedDate}</p>
            </div>
            <button className="btn-primary" onClick={openCreateModal}>
              + New Habit
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <StatsCard
              label="Total Habits"
              value={totalHabits}
              sub="Active routines"
              icon="✅"
            />
            <StatsCard
              label="Completion Rate"
              value={`${completionRate}%`}
              sub="This week"
              trend={{ type: 'up', icon: '↑', text: '+5.2% from last week' }}
              icon="📊"
            />
            <StatsCard
              label="Current Streak"
              value="7"
              sub="Days in a row"
              trend={{ type: 'up', icon: '🔥', text: 'Keep it up!' }}
              icon="🔥"
            />
            <StatsCard
              label="This Month"
              value="24"
              sub="Habits completed"
              icon="📅"
            />
          </div>

          {/* Main Grid */}
          <div className="dashboard-grid">
            {/* Left Column - Habits List */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Your Habits</h2>
                <button className="text-btn" onClick={openCreateModal}>+ Add</button>
              </div>
              <div className="habits-list">
                {habits.length === 0 ? (
                  <div className="empty-state-card">
                    <p>No habits yet</p>
                    <button className="btn-primary" onClick={openCreateModal}>
                      Create Your First Habit
                    </button>
                  </div>
                ) : (
                  habits.map((habit) => (
                    <div key={habit.id} className="habit-item">
                      <div className="habit-item-content">
                        <div
                          className="habit-color-dot"
                          style={{ backgroundColor: habit.color || '#6366f1' }}
                        />
                        <div className="habit-item-info">
                          <h3>{habit.title}</h3>
                          {habit.description && <p>{habit.description}</p>}
                        </div>
                      </div>
                      <div className="habit-item-actions">
                        <HabitCard habit={habit} onRefresh={fetchHabits} />
                        <button
                          className="icon-btn-small"
                          onClick={() => openEditModal(habit)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-btn-small"
                          onClick={async () => {
                            if (confirm('Delete this habit?')) {
                              await api(`/habits/${habit.id}`, { method: 'DELETE' });
                              fetchHabits();
                            }
                          }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Middle Column - Charts */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Weekly Progress</h2>
                <span className="pill">Last 7 days</span>
              </div>
              <div className="chart-container">
                <LineChart data={streakData} />
              </div>
            </div>

            {/* Right Column - Analytics */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Completion Rate</h2>
              </div>
              <div className="chart-container-small">
                <DoughnutChart data={completionData} />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="dashboard-card dashboard-card-wide">
              <div className="card-header">
                <h2>Habit Performance</h2>
                <span className="pill">This month</span>
              </div>
              <div className="chart-container">
                <BarChart data={habitFrequencyData} />
              </div>
            </div>

            {/* Calendar Card */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2>Calendar</h2>
                <div className="calendar-toggle">
                  <button className="pill pill-active">Monthly</button>
                  <button className="pill">Daily</button>
                </div>
              </div>
              <div className="calendar-mini">
                <div className="calendar-weekdays">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
                <div className="calendar-days-mini">
                  {Array.from({ length: 31 }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === today.getDate();
                    return (
                      <button
                        key={day}
                        className={`calendar-day-mini ${isToday ? 'today' : ''}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Habit Modal */}
      <HabitModal
        habit={editingHabit}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingHabit(null);
        }}
        onSuccess={fetchHabits}
      />
    </div>
  );
}
