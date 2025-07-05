# Modern Sidebar Component

A modern, responsive sidebar component with dark/light theme support that automatically transforms into a bottom navigation on mobile devices. Perfect for use in Plasmic Studio with full prop support.

## Features

✅ **Responsive Design**: Automatically transforms from sidebar to bottom navigation on mobile  
✅ **Dark/Light Themes**: Built-in theme toggle with persistent storage  
✅ **Collapsible Sidebar**: Users can collapse/expand the sidebar  
✅ **User Profile Integration**: Shows authenticated user info from AuthContext  
✅ **Navigation Badges**: Support for notification badges on menu items  
✅ **Smooth Animations**: Beautiful transitions and hover effects  
✅ **Plasmic Compatible**: Full prop support for use in Plasmic Studio  
✅ **Accessibility**: ARIA labels and keyboard navigation support  

## Usage

### Basic Usage

```jsx
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Sidebar
      logo="My App"
      logoUrl="/logo.png"
      navigationItems={[
        { label: "Dashboard", icon: "🏠", href: "/dashboard", active: true },
        { label: "Analytics", icon: "📊", href: "/analytics" },
        { label: "Settings", icon: "⚙️", href: "/settings" }
      ]}
    />
  );
}
```

### With Custom Navigation Handler

```jsx
import { useRouter } from 'next/router';

function App() {
  const router = useRouter();
  
  const handleNavigation = (item) => {
    router.push(item.href);
  };

  return (
    <Sidebar
      logo="My App"
      navigationItems={navigationItems}
      onNavigate={handleNavigation}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `string` | `"Your App"` | App name/title displayed in header |
| `logoUrl` | `string` | `"/favicon.ico"` | URL for the logo image |
| `navigationItems` | `array` | `[...]` | Array of navigation items (see structure below) |
| `bottomItems` | `array` | `[...]` | Array of items for bottom section |
| `showThemeToggle` | `boolean` | `true` | Whether to show theme toggle button |
| `showUserProfile` | `boolean` | `true` | Whether to show user profile section |
| `onNavigate` | `function` | `null` | Custom navigation handler function |
| `className` | `string` | `""` | Additional CSS classes |
| `style` | `object` | `{}` | Inline styles |

### Navigation Item Structure

```javascript
{
  label: "Dashboard",        // Display text
  icon: "🏠",               // Icon (emoji or icon font)
  href: "/dashboard",       // Link URL
  active: true,             // Whether this item is active (optional)
  badge: "5"                // Notification badge text (optional)
}
```

## Navigation Item Examples

### Basic Items
```javascript
const basicNavItems = [
  { label: "Home", icon: "🏠", href: "/" },
  { label: "Profile", icon: "👤", href: "/profile" },
  { label: "Settings", icon: "⚙️", href: "/settings" }
];
```

### With Badges and Active States
```javascript
const advancedNavItems = [
  { label: "Dashboard", icon: "🏠", href: "/dashboard", active: true },
  { label: "Messages", icon: "💬", href: "/messages", badge: "3" },
  { label: "Notifications", icon: "🔔", href: "/notifications", badge: "12" }
];
```

### Admin Navigation
```javascript
const adminNavItems = [
  { label: "Dashboard", icon: "🏠", href: "/admin", active: true },
  { label: "Users", icon: "👥", href: "/admin/users" },
  { label: "Analytics", icon: "📊", href: "/admin/analytics" },
  { label: "Reports", icon: "📈", href: "/admin/reports" },
  { label: "Settings", icon: "⚙️", href: "/admin/settings" }
];
```

## Theme Support

The component supports both light and dark themes with automatic detection and manual toggle.

### Theme Variables

The component uses CSS custom properties for theming:

```css
/* Light Theme */
--sidebar-bg: #ffffff;
--sidebar-border: #e5e7eb;
--sidebar-text: #374151;
--sidebar-text-secondary: #6b7280;
--sidebar-hover: #f3f4f6;
--sidebar-active: #3b82f6;
--sidebar-active-bg: #eff6ff;

/* Dark Theme */
--sidebar-bg: #1f2937;
--sidebar-border: #374151;
--sidebar-text: #f9fafb;
--sidebar-text-secondary: #d1d5db;
--sidebar-hover: #374151;
--sidebar-active: #60a5fa;
--sidebar-active-bg: #1e40af;
```

### Force Theme

You can force a specific theme by wrapping the component:

```jsx
// Force dark theme
<div data-theme="dark">
  <Sidebar {...props} />
</div>

// Force light theme
<div data-theme="light">
  <Sidebar {...props} />
</div>
```

## Responsive Behavior

### Desktop (> 768px)
- Full sidebar with expand/collapse functionality
- Shows all labels and details
- Fixed position on the left side

### Tablet (768px - 1024px)  
- Collapsed sidebar by default
- Icons only, labels on hover
- Still positioned on the left

### Mobile (< 768px)
- Sidebar hidden completely
- Bottom navigation bar appears
- Shows first 4 navigation items
- Additional items in "More" menu

## Integration with AuthContext

The component automatically integrates with your existing `AuthContext`:

```jsx
// The component will automatically show user info if available
const { user, logout } = useAuth();

// User profile section shows:
// - User avatar (photo or initials)
// - Display name
// - Email
// - Logout button
```

## Plasmic Studio Integration

The component is fully registered for Plasmic Studio use:

1. **Import the registration**: Already done in `plasmic-init.js`
2. **Use in Plasmic**: The component appears as "Modern Sidebar" in the component library
3. **Configure props**: All props are available in the Plasmic editor
4. **Preset examples**: MinimalSidebar, DarkSidebar variants available

### Plasmic Props Configuration

In Plasmic Studio, you can:
- Set logo text and image URL
- Configure navigation items via the advanced object editor
- Toggle theme and profile visibility
- Set up custom navigation event handlers
- Apply additional styling

## Content Layout Considerations

When using the sidebar, adjust your main content area:

```css
/* For desktop with sidebar */
.main-content {
  margin-left: 280px; /* Sidebar width */
  transition: margin-left 0.3s ease;
}

/* For collapsed sidebar */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 72px; /* Collapsed width */
  }
}

/* For mobile with bottom nav */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding-bottom: 80px; /* Bottom nav height */
  }
}
```

## Customization

### Custom Icons

You can use various icon types:

```javascript
// Emojis (recommended for simplicity)
{ icon: "🏠" }

// Unicode symbols
{ icon: "⚙" }

// Icon fonts (if loaded in your app)
{ icon: "fas fa-home" }

// Custom components (advanced)
{ icon: <CustomIcon /> }
```

### Custom Styling

Add custom CSS classes or inline styles:

```jsx
<Sidebar
  className="my-custom-sidebar"
  style={{ zIndex: 9999 }}
  navigationItems={items}
/>
```

### Event Handling

Implement custom navigation logic:

```jsx
const handleNavigation = (item) => {
  // Custom logic before navigation
  console.log('Navigating to:', item.label);
  
  // Analytics tracking
  gtag('event', 'navigation', {
    page_title: item.label,
    page_location: item.href
  });
  
  // Actual navigation
  router.push(item.href);
};
```

## Browser Support

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## Accessibility

The component includes:
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- High contrast support
- Reduced motion respect

## Performance

- Lightweight CSS-in-JS with styled-jsx
- Minimal JavaScript bundle impact
- Efficient re-renders with React hooks
- Smooth 60fps animations

## Troubleshooting

### Sidebar not showing
- Check if the component is imported correctly
- Ensure AuthContext is provided if using user profile
- Verify theme variables are loaded

### Styling issues
- Check CSS custom properties are defined
- Ensure no conflicting CSS rules
- Verify responsive breakpoints

### Navigation not working
- Check `onNavigate` prop is set correctly
- Verify navigation items have proper `href` values
- Check for JavaScript errors in console

## Examples

Check out these example files:
- `SidebarDemo.js` - Full featured example
- `MinimalSidebar` - Simple configuration
- `DarkSidebar` - Dark theme example

---

Need help? Check the component source code in `components/Sidebar.js` or the demo implementations in `components/SidebarDemo.js`. 