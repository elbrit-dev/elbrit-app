# LinkComponent

A flexible link component that wraps Next.js `Link` with support for children content through a slot pattern.

## Features

- **Slot Pattern**: Accepts any content as children through the slot interface
- **Automatic Link Detection**: Automatically detects internal vs external links
- **Next.js Integration**: Uses Next.js `Link` for internal navigation
- **External Link Support**: Handles external links with proper security attributes
- **Flexible Styling**: Supports className, style, and other props
- **Event Handling**: Supports onClick and other event handlers

## Usage

### Basic Usage

```jsx
import LinkComponent from './components/LinkComponent';

// Simple text link
<LinkComponent href="/about">
  About Us
</LinkComponent>
```

### With Icons and Complex Content

```jsx
<LinkComponent href="/dashboard" className="dashboard-link">
  <span style={{ marginRight: '8px' }}>📊</span>
  Dashboard
</LinkComponent>
```

### External Links

```jsx
<LinkComponent 
  href="https://example.com" 
  target="_blank"
  className="external-link"
>
  Visit External Site
</LinkComponent>
```

### With Custom Styling

```jsx
<LinkComponent 
  href="/contact" 
  className="styled-link"
  style={{
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px'
  }}
>
  Contact Us
</LinkComponent>
```

### With Click Handler

```jsx
<LinkComponent 
  href="/api/test" 
  onClick={(e) => {
    e.preventDefault();
    // Custom logic here
    console.log('Link clicked!');
  }}
>
  Click Me
</LinkComponent>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | string | required | The URL to navigate to |
| `children` | ReactNode | required | Content to display (slot) |
| `className` | string | '' | CSS class name |
| `target` | string | '_self' | Link target attribute |
| `rel` | string | '' | Link rel attribute (auto-set for external links) |
| `onClick` | function | undefined | Click event handler |
| `...props` | any | - | Additional props passed to underlying link |

## Internal vs External Links

The component automatically detects link type:

- **Internal Links**: Use Next.js `Link` component for optimal performance
- **External Links**: Use regular `<a>` tag with security attributes

## Security

For external links with `target="_blank"`, the component automatically adds `rel="noopener noreferrer"` for security.

## Example

See `LinkComponentExample.js` for complete usage examples. 