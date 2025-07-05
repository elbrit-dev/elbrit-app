import React from 'react';
import Sidebar from './Sidebar';

const SidebarDemo = () => {
  // Example navigation items with different types
  const exampleNavItems = [
    { 
      label: "Dashboard", 
      icon: "home", 
      href: "/dashboard", 
      active: true 
    },
    { 
      label: "Analytics", 
      icon: "chart-bar", 
      href: "/analytics", 
      badge: "3" 
    },
    { 
      label: "Projects", 
      icon: "folder", 
      href: "/projects" 
    },
    { 
      label: "Team", 
      icon: "users", 
      href: "/team", 
      badge: "12" 
    },
    { 
      label: "Messages", 
      icon: "chat", 
      href: "/messages", 
      badge: "5" 
    },
    { 
      label: "Calendar", 
      icon: "cog", 
      href: "/calendar" 
    },
    { 
      label: "Settings", 
      icon: "cog", 
      href: "/settings" 
    }
  ];

  const exampleBottomItems = [
    { 
      label: "Help Center", 
      icon: "question-circle", 
      href: "/help" 
    },
    { 
      label: "Support", 
      icon: "chat", 
      href: "/support" 
    },
    { 
      label: "Feedback", 
      icon: "chat", 
      href: "/feedback" 
    }
  ];

  // Example navigation handler
  const handleNavigation = (item) => {
    console.log('Navigating to:', item);
    // You can implement your custom navigation logic here
    // For example, using Next.js router:
    // router.push(item.href);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Example 1: Full-featured Sidebar */}
      <Sidebar
        logo="My App"
        logoUrl="/favicon.ico"
        navigationItems={exampleNavItems}
        bottomItems={exampleBottomItems}
        showThemeToggle={true}
        showUserProfile={true}
        onNavigate={handleNavigation}
      />

      {/* Main Content Area */}
      <div style={{ 
        marginLeft: '280px', 
        padding: '2rem',
        transition: 'margin-left 0.3s ease',
        '@media (max-width: 768px)': {
          marginLeft: 0,
          paddingBottom: '80px' // Space for bottom nav
        }
      }}>
        <h1>Sidebar Demo</h1>
        <p>This is an example of how the Sidebar component works.</p>
        
        <div style={{ 
          background: 'var(--sidebar-hover, #f3f4f6)', 
          padding: '1rem', 
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          <h3>Features:</h3>
          <ul>
            <li>✅ Dark/Light theme toggle</li>
            <li>✅ Responsive design (sidebar → bottom nav on mobile)</li>
            <li>✅ Collapsible sidebar</li>
            <li>✅ User profile integration</li>
            <li>✅ Navigation badges</li>
            <li>✅ Smooth animations</li>
            <li>✅ Plasmic-compatible props</li>
          </ul>
        </div>

        <div style={{ 
          background: 'var(--sidebar-active-bg, #eff6ff)', 
          padding: '1rem', 
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          <h3>Plasmic Props:</h3>
          <ul>
            <li><strong>logo:</strong> App name/title</li>
            <li><strong>logoUrl:</strong> Logo image URL</li>
            <li><strong>navigationItems:</strong> Array of nav items</li>
            <li><strong>bottomItems:</strong> Array of bottom nav items</li>
            <li><strong>showThemeToggle:</strong> Boolean to show/hide theme toggle</li>
            <li><strong>showUserProfile:</strong> Boolean to show/hide user profile</li>
            <li><strong>onNavigate:</strong> Custom navigation handler function</li>
            <li><strong>className:</strong> Additional CSS classes</li>
            <li><strong>style:</strong> Inline styles</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="marginLeft"] {
            margin-left: 0 !important;
            padding-bottom: 80px !important;
          }
        }

        @media (max-width: 1024px) {
          div[style*="marginLeft"] {
            margin-left: 72px !important;
          }
        }
      `}</style>
    </div>
  );
};

// Alternative minimal example for Plasmic
export const MinimalSidebar = () => (
  <Sidebar
    logo="Simple App"
    navigationItems={[
      { label: "Home", icon: "home", href: "/", active: true },
      { label: "Profile", icon: "users", href: "/profile" },
      { label: "Settings", icon: "cog", href: "/settings" }
    ]}
    showThemeToggle={true}
    showUserProfile={false}
  />
);

// Alternative dark theme example
export const DarkSidebar = () => (
  <div data-theme="dark">
    <Sidebar
      logo="Dark App"
      navigationItems={[
        { label: "Dashboard", icon: "home", href: "/dashboard", active: true },
        { label: "Analytics", icon: "chart-bar", href: "/analytics" },
        { label: "Reports", icon: "chart-bar", href: "/reports" }
      ]}
      showThemeToggle={true}
      showUserProfile={true}
    />
  </div>
);

export default SidebarDemo; 