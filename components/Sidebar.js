import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from './AuthContext';

// SVG Icon Component
const Icon = ({ name, size = 20, className = "" }) => {
  const icons = {
    home: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    ),
    'chart-bar': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
      </svg>
    ),
    folder: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.016 3.016 0 0 0 17.09 7c-.23 0-.45.03-.66.08L17 8l-5 0c-.8 0-1.5-.7-1.5-1.5S11.2 5 12 5s1.5.7 1.5 1.5H15c0-1.93-1.57-3.5-3.5-3.5S8 4.57 8 6.5 9.57 10 11.5 10H12l.57 1.08c-.21-.05-.43-.08-.66-.08-.85 0-1.61.4-2.09 1.02L7.5 20H10v-6h4v6h2zM12.5 11.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S11 13.83 11 13s.67-1.5 1.5-1.5z"/>
      </svg>
    ),
    cog: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
      </svg>
    ),
    'question-circle': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
      </svg>
    ),
    chat: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    ),
    chevron: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
      </svg>
    ),
    moon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.75 4.09L15.22 6.03L16.13 9.09L13.5 7.28L10.87 9.09L11.78 6.03L9.25 4.09L12.44 4L13.5 1L14.56 4L17.75 4.09ZM21.25 11L19.61 12.25L20.2 14.23L18.5 13.06L16.8 14.23L17.39 12.25L15.75 11L17.81 10.95L18.5 9L19.19 10.95L21.25 11ZM18.97 15.95C19.8 15.87 20.69 17.05 20.16 17.8C19.84 18.25 19.5 18.67 19.08 19.07C15.17 23 8.84 23 4.94 19.07C1.03 15.17 1.03 8.83 4.94 4.93C5.34 4.53 5.76 4.17 6.21 3.85C6.96 3.32 8.14 4.21 8.06 5.04C7.79 7.9 8.75 10.87 10.95 13.06C13.14 15.26 16.1 16.22 18.97 15.95Z"/>
      </svg>
    ),
    sun: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 9c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3m0-2c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
      </svg>
    ),
    logout: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
      </svg>
    ),
    menu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
      </svg>
    )
  };

  return icons[name] || <span className={className}>{name}</span>;
};

const Sidebar = ({
  // Plasmic-compatible props
  logo = "Your App",
  logoUrl = "/favicon.ico",
  navigationItems = [
    { label: "Dashboard", icon: "home", href: "/dashboard", active: true },
    { label: "Analytics", icon: "chart-bar", href: "/analytics" },
    { label: "Projects", icon: "folder", href: "/projects" },
    { label: "Team", icon: "users", href: "/team" },
    { label: "Settings", icon: "cog", href: "/settings" },
  ],
  bottomItems = [
    { label: "Help", icon: "question-circle", href: "/help" },
    { label: "Support", icon: "chat", href: "/support" },
  ],
  showThemeToggle = true,
  showUserProfile = true,
  onNavigate = null,
  className = "",
  style = {}
}) => {
  const [theme, setTheme] = useState('light');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check for saved theme preference or default to 'light'
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleNavigation = (item) => {
    if (onNavigate) {
      onNavigate(item);
    } else if (typeof window !== 'undefined') {
      window.location.href = item.href;
    }
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`} style={style} data-theme={theme}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <Image src={logoUrl} alt="Logo" className="logo-icon" width={32} height={32} />
            {!isCollapsed && <span className="logo-text">{logo}</span>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon name="chevron" size={16} className={`chevron ${isCollapsed ? 'rotated' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navigationItems.map((item, index) => (
              <li key={index} className={`nav-item ${item.active ? 'active' : ''}`}>
                <button
                  className="nav-link"
                  onClick={() => handleNavigation(item)}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon name={item.icon} size={20} className="nav-icon" />
                  {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  {item.badge && !isCollapsed && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          {/* Bottom Navigation Items */}
          {bottomItems.length > 0 && (
            <ul className="nav-list">
              {bottomItems.map((item, index) => (
                <li key={index} className="nav-item">
                  <button
                    className="nav-link"
                    onClick={() => handleNavigation(item)}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon name={item.icon} size={20} className="nav-icon" />
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Theme Toggle */}
          {showThemeToggle && (
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={20} className="theme-icon" />
              {!isCollapsed && (
                <span className="theme-label">
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              )}
            </button>
          )}

          {/* User Profile */}
          {showUserProfile && user && (
            <div className="user-profile">
              <div className="user-info">
                <div className="user-avatar">
                  {user.photoURL ? (
                    <Image src={user.photoURL} alt="User" width={32} height={32} />
                  ) : (
                    <span>{user.displayName?.[0] || user.email?.[0] || <Icon name="users" size={16} />}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="user-details">
                    <span className="user-name">{user.displayName || 'User'}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <Icon name="logout" size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="bottom-nav" data-theme={theme}>
        {navigationItems.slice(0, 4).map((item, index) => (
          <button
            key={index}
            className={`bottom-nav-item ${item.active ? 'active' : ''}`}
            onClick={() => handleNavigation(item)}
          >
            <Icon name={item.icon} size={20} className="bottom-nav-icon" />
            <span className="bottom-nav-label">{item.label}</span>
            {item.badge && <span className="bottom-nav-badge">{item.badge}</span>}
          </button>
        ))}
        
        {/* More menu for additional items */}
        {navigationItems.length > 4 && (
          <div className="bottom-nav-more">
            <button className="bottom-nav-item">
              <Icon name="menu" size={20} className="bottom-nav-icon" />
              <span className="bottom-nav-label">More</span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        /* CSS Variables for ELBBRIT Theme - Mild & Visually Appealing */
        :global([data-theme="light"]) {
          --sidebar-bg: #fdfdfd;
          --sidebar-header-bg: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          --sidebar-border: #e2e8f0;
          --sidebar-text: #374151;
          --sidebar-text-secondary: #6b7280;
          --sidebar-hover: #f8fafc;
          --sidebar-active: #ef4444;
          --sidebar-active-bg: linear-gradient(135deg, #fef7f7 0%, #fef2f2 100%);
          --sidebar-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.06);
          --sidebar-accent: #ef4444;
          --sidebar-accent-secondary: #3b82f6;
          --sidebar-logo-text: #ffffff;
          --sidebar-border-radius: 12px;
          --sidebar-item-radius: 8px;
        }

        :global([data-theme="dark"]) {
          --sidebar-bg: #1a202c;
          --sidebar-header-bg: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
          --sidebar-border: #2d3748;
          --sidebar-text: #e2e8f0;
          --sidebar-text-secondary: #a0aec0;
          --sidebar-hover: #2d3748;
          --sidebar-active: #f56565;
          --sidebar-active-bg: linear-gradient(135deg, #322c2c 0%, #3a2a2a 100%);
          --sidebar-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.25), 0 2px 8px -2px rgba(0, 0, 0, 0.15);
          --sidebar-accent: #f56565;
          --sidebar-accent-secondary: #63b3ed;
          --sidebar-logo-text: #ffffff;
          --sidebar-border-radius: 12px;
          --sidebar-item-radius: 8px;
        }

        /* Desktop Sidebar Styles */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 280px;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--sidebar-border);
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          box-shadow: var(--sidebar-shadow);
          border-radius: 0 var(--sidebar-border-radius) var(--sidebar-border-radius) 0;
          margin: 0.5rem 0 0.5rem 0.5rem;
          height: calc(100vh - 1rem);
          backdrop-filter: blur(20px);
        }

        .sidebar.collapsed {
          width: 72px;
        }

        .sidebar-header {
          padding: 1.5rem 1rem;
          background: var(--sidebar-header-bg);
          border-bottom: 1px solid var(--sidebar-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 80px;
          border-radius: var(--sidebar-border-radius) var(--sidebar-border-radius) 0 0;
          position: relative;
          overflow: hidden;
        }

        .sidebar-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          pointer-events: none;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--sidebar-logo-text);
          white-space: nowrap;
          transition: opacity 0.2s ease;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          letter-spacing: -0.025em;
          position: relative;
          z-index: 1;
        }

        .collapse-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--sidebar-logo-text);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 1;
        }

        .collapse-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .chevron {
          font-size: 1.25rem;
          transition: transform 0.3s ease;
          transform: rotate(180deg);
        }

        .chevron.rotated {
          transform: rotate(0deg);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          overflow-y: auto;
        }

        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-item {
          margin: 0 0.75rem 0.25rem;
        }

        .nav-link {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: none;
          border: none;
          border-radius: var(--sidebar-item-radius);
          color: var(--sidebar-text-secondary);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          position: relative;
          overflow: hidden;
          font-weight: 500;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: transparent;
          border-radius: var(--sidebar-item-radius);
          transition: all 0.3s ease;
          z-index: -1;
        }

        .nav-link:hover {
          background: var(--sidebar-hover);
          color: var(--sidebar-text);
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .nav-link:hover::before {
          background: linear-gradient(135deg, var(--sidebar-hover) 0%, rgba(239, 68, 68, 0.03) 100%);
        }

        .nav-item.active .nav-link {
          background: var(--sidebar-active-bg);
          color: var(--sidebar-active);
          font-weight: 600;
          transform: translateX(6px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
        }

        .nav-item.active .nav-link::before {
          background: var(--sidebar-active-bg);
        }

        .nav-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
          width: 24px;
          text-align: center;
        }

        .nav-label {
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          flex: 1;
        }

        .nav-badge {
          background: linear-gradient(135deg, var(--sidebar-accent) 0%, #dc2626 100%);
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 16px;
          min-width: 20px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }

        .sidebar-bottom {
          padding: 1rem 0;
          border-top: 1px solid var(--sidebar-border);
        }

        .theme-toggle {
          width: calc(100% - 1.5rem);
          margin: 0 0.75rem 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: linear-gradient(135deg, var(--sidebar-accent-secondary) 0%, var(--sidebar-accent) 100%);
          border: none;
          border-radius: var(--sidebar-item-radius);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          position: relative;
          overflow: hidden;
        }

        .theme-toggle::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          transition: all 0.3s ease;
        }

        .theme-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(239, 68, 68, 0.2);
        }

        .theme-toggle:hover::before {
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%);
        }

        .theme-icon {
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
        }

        .theme-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          margin: 0.5rem 0.75rem 0;
          border-radius: var(--sidebar-item-radius);
          background: linear-gradient(135deg, var(--sidebar-hover) 0%, rgba(239, 68, 68, 0.03) 100%);
          border: 1px solid var(--sidebar-border);
          transition: all 0.3s ease;
        }

        .user-profile:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          overflow: hidden;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--sidebar-accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--sidebar-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--sidebar-text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          background: none;
          border: none;
          color: var(--sidebar-text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .logout-btn:hover {
          background: var(--sidebar-bg);
          color: var(--sidebar-text);
        }

        /* Mobile Bottom Navigation */
        .bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--sidebar-bg);
          border-top: 1px solid var(--sidebar-border);
          padding: 0.75rem 1rem;
          z-index: 1000;
          box-shadow: 0 -10px 25px -5px rgba(0, 0, 0, 0.1), 0 -8px 10px -6px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(20px);
          border-radius: var(--sidebar-border-radius) var(--sidebar-border-radius) 0 0;
          margin: 0 0.5rem 0.5rem 0.5rem;
          width: calc(100% - 1rem);
        }

        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          background: none;
          border: none;
          border-radius: 8px;
          color: var(--sidebar-text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .bottom-nav-item:hover,
        .bottom-nav-item.active {
          color: var(--sidebar-active);
          background: var(--sidebar-active-bg);
        }

        .bottom-nav-icon {
          font-size: 1.25rem;
        }

        .bottom-nav-label {
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .bottom-nav-badge {
          position: absolute;
          top: 0.25rem;
          right: 25%;
          background: linear-gradient(135deg, var(--sidebar-accent) 0%, #dc2626 100%);
          color: white;
          font-size: 0.625rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 10px;
          min-width: 16px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.15);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }

          .bottom-nav {
            display: flex;
            align-items: center;
            justify-content: space-around;
          }
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: 72px;
          }
          
          .sidebar .logo-text,
          .sidebar .nav-label,
          .sidebar .theme-label,
          .sidebar .user-details {
            display: none;
          }
        }

        /* Smooth transitions for better UX */
        * {
          transition: color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
        }

        /* Additional visual improvements */
        .sidebar-nav {
          padding-top: 1.5rem;
        }

        .nav-item {
          margin: 0 0.75rem 0.375rem;
        }

        /* Hide scrollbar but keep functionality */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: var(--sidebar-border);
          border-radius: 2px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: var(--sidebar-text-secondary);
        }
      `}</style>
    </>
  );
};

export default Sidebar; 