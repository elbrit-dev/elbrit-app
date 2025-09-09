# AdvancedSkeleton Component

A sophisticated skeleton loader component with force rendering capabilities, multiple templates, animations, and advanced customization options. Perfect for creating realistic loading states anywhere in your application.

## Features

### 🎯 Core Features
- **Smart Loading State**: Automatically shows/hides based on loading prop
- **Force Rendering**: Show skeleton even when not loading (great for demos/testing)
- **Multiple Templates**: Pre-built templates for common UI patterns
- **Custom Animations**: Wave, pulse, shimmer, or no animation
- **Flexible Sizing**: Predefined sizes or completely custom dimensions

### ⚡ Advanced Features
- **Randomized Dimensions**: More realistic skeleton with varying widths
- **Fade Transitions**: Smooth fade-in when content loads
- **Performance Throttling**: Throttle updates for better performance
- **Event Callbacks**: React to loading state changes
- **Template System**: Text, card, list, and avatar templates

### 🎨 Customization
- **Shape Options**: Rectangle, circle, or square
- **Color Theming**: Custom background and highlight colors
- **Animation Speed**: Slow, normal, or fast animations
- **Border Radius**: Custom corner rounding
- **Spacing Control**: Adjust spacing between multiple lines

## Usage in Code

### Basic Usage
```jsx
import AdvancedSkeleton from '../components/AdvancedSkeleton';

// Simple skeleton
<AdvancedSkeleton loading={isLoading}>
  <p>Your content here</p>
</AdvancedSkeleton>

// Multiple lines
<AdvancedSkeleton loading={isLoading} lines={3}>
  <div>
    <h3>Title</h3>
    <p>Paragraph 1</p>
    <p>Paragraph 2</p>
  </div>
</AdvancedSkeleton>
```

### Force Rendering (Demo Mode)
```jsx
// Show skeleton for 5 seconds regardless of loading state
<AdvancedSkeleton 
  loading={false}
  forceRender={true}
  forceRenderDuration={5000}
  autoStopForceRender={true}
>
  <p>This content is hidden by force rendering</p>
</AdvancedSkeleton>

// Infinite force rendering (until manually stopped)
<AdvancedSkeleton 
  forceRender={true}
  forceRenderDuration={0}
>
  <p>Content</p>
</AdvancedSkeleton>
```

### Templates
```jsx
// Avatar template
<AdvancedSkeleton loading={isLoading} template="avatar">
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <img src="/avatar.jpg" alt="User" style={{ borderRadius: '50%' }} />
    <div>
      <h4>John Doe</h4>
      <p>Software Developer</p>
    </div>
  </div>
</AdvancedSkeleton>

// Card template
<AdvancedSkeleton loading={isLoading} template="card">
  <div>
    <img src="/product.jpg" alt="Product" />
    <h3>Product Name</h3>
    <p>Product description</p>
  </div>
</AdvancedSkeleton>

// List template
<AdvancedSkeleton loading={isLoading} template="list" lines={3}>
  <div>
    {items.map(item => (
      <div key={item.id}>
        <img src={item.avatar} />
        <div>
          <h4>{item.name}</h4>
          <p>{item.description}</p>
        </div>
      </div>
    ))}
  </div>
</AdvancedSkeleton>
```

### Custom Styling
```jsx
// Custom colors and animations
<AdvancedSkeleton 
  loading={isLoading}
  backgroundColor="#e3f2fd"
  highlightColor="#bbdefb"
  animation="pulse"
  animationSpeed="fast"
  borderRadius="12px"
>
  <p>Custom styled content</p>
</AdvancedSkeleton>

// Circle skeleton for avatars
<AdvancedSkeleton 
  loading={isLoading}
  shape="circle"
  width="60px"
  height="60px"
>
  <img src="/avatar.jpg" style={{ borderRadius: '50%' }} />
</AdvancedSkeleton>
```

### Advanced Features
```jsx
// Randomized dimensions for realistic look
<AdvancedSkeleton 
  loading={isLoading}
  randomize={true}
  forceRenderInterval={1000}
  lines={3}
  template="text"
>
  <div>
    <h3>Dynamic Title</h3>
    <p>Some content here</p>
    <p>More content</p>
  </div>
</AdvancedSkeleton>

// With event callbacks
<AdvancedSkeleton 
  loading={isLoading}
  onLoadingComplete={() => console.log('Content loaded!')}
  onForceRenderStart={() => console.log('Demo started')}
  onForceRenderStop={() => console.log('Demo stopped')}
  fadeIn={true}
>
  <p>Content with callbacks</p>
</AdvancedSkeleton>
```

## Props Reference

### Core Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | boolean | true | Whether to show skeleton or content |
| `children` | ReactNode | null | Content to show when not loading |

### Force Rendering Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `forceRender` | boolean | false | Force skeleton to render even when not loading |
| `forceRenderInterval` | number | 1000 | Interval for force render updates (ms) |
| `forceRenderDuration` | number | 5000 | Duration for force rendering (0 = infinite) |
| `autoStopForceRender` | boolean | true | Auto stop force rendering after duration |

### Appearance Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `shape` | "rectangle" \| "circle" \| "square" | "rectangle" | Skeleton shape |
| `size` | "small" \| "normal" \| "large" \| "custom" | "normal" | Predefined size |
| `width` | string | null | Custom width (e.g., '200px', '100%') |
| `height` | string | null | Custom height (e.g., '30px', '2rem') |
| `borderRadius` | string | "4px" | Border radius (ignored for circles) |

### Animation Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animation` | "wave" \| "pulse" \| "shimmer" \| "none" | "wave" | Animation type |
| `animationSpeed` | "slow" \| "normal" \| "fast" | "normal" | Animation speed |

### Layout Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lines` | number | 1 | Number of skeleton lines |
| `spacing` | string | "0.5rem" | Spacing between lines |
| `template` | "text" \| "card" \| "list" \| "avatar" \| null | null | Predefined template |

### Styling Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | string | "#f0f0f0" | Skeleton background color |
| `highlightColor` | string | "#e0e0e0" | Animation highlight color |
| `className` | string | "" | Additional CSS classes |
| `style` | object | {} | Inline styles |

### Advanced Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `responsive` | boolean | false | Auto-detect dimensions from content |
| `fadeIn` | boolean | true | Fade in content when loading completes |
| `randomize` | boolean | false | Randomize dimensions for realistic look |
| `throttleUpdates` | boolean | false | Throttle updates for performance |
| `updateInterval` | number | 100 | Update interval when throttling (ms) |

### Event Props
| Prop | Type | Description |
|------|------|-------------|
| `onForceRenderStart` | function | Called when force rendering starts |
| `onForceRenderStop` | function | Called when force rendering stops |
| `onLoadingComplete` | function | Called when loading changes from true to false |

## Templates

### Text Template
Perfect for text content with multiple lines:
```jsx
<AdvancedSkeleton template="text" lines={3} />
```

### Card Template
Great for product cards or content cards:
```jsx
<AdvancedSkeleton template="card" />
```
Creates: Image placeholder + title + subtitle + description lines

### List Template
Ideal for lists with avatars:
```jsx
<AdvancedSkeleton template="list" lines={3} />
```
Creates: Multiple rows with circle + text lines

### Avatar Template
Perfect for user profiles:
```jsx
<AdvancedSkeleton template="avatar" />
```
Creates: Circle avatar + name + subtitle

## Common Use Cases

### Loading States
```jsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().then(() => setLoading(false));
}, []);

return (
  <AdvancedSkeleton loading={loading} template="card">
    <ProductCard data={data} />
  </AdvancedSkeleton>
);
```

### Demo/Storybook
```jsx
// Show skeleton for 10 seconds for demo purposes
<AdvancedSkeleton 
  forceRender={true}
  forceRenderDuration={10000}
  template="list"
  lines={5}
>
  <UserList users={users} />
</AdvancedSkeleton>
```

### Grid Layouts
```jsx
{products.map(product => (
  <AdvancedSkeleton key={product.id} loading={!product.loaded} template="card">
    <ProductCard product={product} />
  </AdvancedSkeleton>
))}
```

## Usage in Plasmic Studio

This component is registered in Plasmic as "Advanced Skeleton". All props are exposed in the Plasmic interface, including:
- Visual configuration (shape, size, colors)
- Template selection
- Force rendering controls
- Animation settings
- Event handlers

## Demo

Visit `/skeleton-demo` to see all features and templates in action, including:
- Interactive loading controls
- All template examples
- Animation comparisons
- Real-world use cases
- Force rendering demos
