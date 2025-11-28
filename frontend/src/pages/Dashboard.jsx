import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { api } from '../lib/api.js';
import Sidebar from '../components/Sidebar.jsx';
import HabitCard from '../components/HabitCard.jsx';
import HabitModal from '../components/HabitModal.jsx';
import StatsCard from '../components/StatsCard.jsx';
import { LineChart, DoughnutChart, BarChart } from '../components/AnalyticsChart.jsx';

const defaultAnalytics = {
  totalHabits: 0,
  streak: 0,
  completionRate: 0,
  completionsThisMonth: 0,
  last7Series: [],
  topHabits: [],
};

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState(defaultAnalytics);
  const [timeline, setTimeline] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [theme, setTheme] = useState('light');
  const nav = useNavigate();

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      await Promise.all([fetchHabits(), fetchAnalytics(), fetchTimeline(), fetchProfile()]);
    } catch (e) {
      console.error('Initialization error:', e);
    }
  }

  function applyTheme(nextTheme) {
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('habitdash-theme', nextTheme);
  }

  async function fetchProfile() {
    const r = await api('/user/me');
    if (!r || r.error) return;
    setUser(r);
    const preferredTheme = r.theme_preference || localStorage.getItem('habitdash-theme') || 'light';
    setTheme(preferredTheme);
    applyTheme(preferredTheme);
    localStorage.setItem('user', JSON.stringify(r));
  }

  async function fetchHabits() {
    const r = await api('/habits');
    if (Array.isArray(r)) {
      setHabits(r);
    } else if (r.error === 'Invalid token' || r.error === 'No token') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      nav('/login');
    }
  }

  async function fetchAnalytics() {
    const data = await api('/habits/analytics/overview');
    if (!data.error) {
      setAnalytics({ ...defaultAnalytics, ...data });
    }
  }

  async function fetchTimeline() {
    const data = await api('/habits/analytics/timeline');
    if (Array.isArray(data)) {
      setTimeline(data);
    }
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

  async function handleDelete(habitId) {
    if (!confirm('Delete this habit?')) return;
    await api(`/habits/${habitId}`, { method: 'DELETE' });
    fetchHabits();
    fetchAnalytics();
  }

  async function handleThemeToggle() {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    applyTheme(nextTheme);
    await api('/user/me', {
      method: 'PUT',
      body: JSON.stringify({ theme_preference: nextTheme }),
    });
  }

  async function onDragEnd(result) {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    const reordered = Array.from(habits);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setHabits(reordered);
    await api('/habits/reorder', {
      method: 'POST',
      body: JSON.stringify({ order: reordered.map((h) => h.id) }),
    });
  }

  const lineData = useMemo(() => {
    const labels = analytics.last7Series.map((item) =>
      new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
    );
    const dataPoints = analytics.last7Series.map((item) => item.count);
    return {
      labels,
      datasets: [
        {
          label: 'Completions',
          data: dataPoints,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }, [analytics.last7Series]);

  const donutData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [analytics.completionRate, Math.max(0, 100 - analytics.completionRate)],
        backgroundColor: ['#22c55e', '#e2e8f0'],
        borderWidth: 0,
      },
    ],
  };

  const habitPerformanceData = {
    labels: analytics.topHabits.map((h) => h.title),
    datasets: [
      {
        label: 'Completions',
        data: analytics.topHabits.map((h) => h.count),
        backgroundColor: analytics.topHabits.map((h) => h.color || '#6366f1'),
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
        <header className="top-bar">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search habits..." className="search-input" />
          </div>
          <div className="top-bar-actions">
            <button className="icon-btn" onClick={handleThemeToggle}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="icon-btn">🔔</button>
            <div className="user-avatar-small">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

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

          <div className="stats-grid">
            <StatsCard
              label="Total Habits"
              value={analytics.totalHabits}
              sub="Active routines"
              icon="✅"
            />
            <StatsCard
              label="Completion Rate"
              value={`${analytics.completionRate || 0}%`}
              sub="This month"
              trend={{
                type: 'up',
                icon: '↑',
                text: `${analytics.completionsThisMonth} completions`,
              }}
              icon="📊"
            />
            <StatsCard
              label="Current Streak"
              value={analytics.streak}
              sub="Days in a row"
              trend={{ type: 'up', icon: '🔥', text: 'Keep it up!' }}
              icon="🔥"
            />
            <StatsCard
              label="Top Habit"
              value={analytics.topHabits[0]?.title || '—'}
              sub={`${analytics.topHabits[0]?.count || 0} completions`}
              icon="🏆"
            />
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card habits-card">
              <div className="card-header">
                <h2>Your Habits</h2>
                <button className="text-btn" onClick={openCreateModal}>
                  + Add
                </button>
              </div>

              {habits.length === 0 ? (
                <div className="empty-state-card">
                  <p>No habits yet</p>
                  <button className="btn-primary" onClick={openCreateModal}>
                    Create Your First Habit
                  </button>
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="habits">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {habits.map((habit, index) => (
                          <Draggable key={habit.id} draggableId={habit.id} index={index}>
                            {(dragProvided) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className="habit-item"
                              >
                                <div className="habit-item-content">
                                  <div
                                    className="habit-color-dot"
                                    style={{ backgroundColor: habit.color || '#6366f1' }}
                                  />
                                  <div className="habit-item-info">
                                    <h3>{habit.title}</h3>
                                    {habit.description && <p>{habit.description}</p>}
                                    <div className="habit-meta">
                                      {habit.schedule_days?.length > 0 && (
                                        <span>
                                          {habit.schedule_days.map((d) => d.toUpperCase()).join(', ')}
                                        </span>
                                      )}
                                      {habit.reminder_time && (
                                        <span>Reminder: {habit.reminder_time}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="habit-item-actions">
                                  <HabitCard habit={habit} onRefresh={() => { fetchHabits(); fetchAnalytics(); fetchTimeline(); }} />
                                  <button
                                    className="icon-btn-small"
                                    onClick={() => openEditModal(habit)}
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="icon-btn-small"
                                    onClick={() => handleDelete(habit.id)}
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h2>Weekly Progress</h2>
                <span className="pill">Last 7 days</span>
              </div>
              <div className="chart-container">
                <LineChart data={lineData} />
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h2>Completion Rate</h2>
              </div>
              <div className="chart-container-small">
                <DoughnutChart data={donutData} />
              </div>
            </div>

            <div className="dashboard-card dashboard-card-wide">
              <div className="card-header">
                <h2>Top Habits</h2>
                <span className="pill">Most consistent</span>
              </div>
              <div className="chart-container">
                <BarChart data={habitPerformanceData} />
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <h2>Activity Timeline</h2>
              </div>
              <div className="timeline-list">
                {timeline.length === 0 ? (
                  <p className="text-muted">No recent activity yet.</p>
                ) : (
                  timeline.map((event) => (
                    <div key={event.id} className="timeline-item">
                      <div
                        className="timeline-dot"
                        style={{ backgroundColor: event.color || '#6366f1' }}
                      />
                      <div>
                        <p className="timeline-title">{event.habitTitle}</p>
                        <p className="timeline-sub">
                          Completed on{' '}
                          {new Date(event.completed_on).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

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

      <HabitModal
        habit={editingHabit}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingHabit(null);
        }}
        onSuccess={() => {
          fetchHabits();
          fetchAnalytics();
        }}
      />
    </div>
  );
}
