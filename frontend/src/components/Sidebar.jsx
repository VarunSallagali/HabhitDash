import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ user, onLogout }) {
  const nav = useNavigate();
  const [activeMenu, setActiveMenu] = React.useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'habits', label: 'Habits', icon: '✅' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🎯</span>
          <span className="logo-text">HabitDash</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name || 'User'}</div>
          <div className="user-role">Habit Tracker</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeMenu === item.id ? 'nav-item-active' : ''}`}
            onClick={() => setActiveMenu(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </button>
        <button className="nav-item">
          <span className="nav-icon">❓</span>
          <span className="nav-label">Help</span>
        </button>
        <button className="nav-item nav-item-danger" onClick={onLogout}>
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Log Out</span>
        </button>
      </div>
    </aside>
  );
}

