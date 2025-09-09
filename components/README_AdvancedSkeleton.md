# AdvancedSkeleton Component

A sophisticated skeleton loader component with force rendering capabilities, multiple templates, animations, and advanced customization options. Perfect for creating realistic loading states anywhere in your application.

## Key Features

### 🚀 **Force Rendering**
- **Demo Mode**: Force skeleton to render even when not loading
- **Configurable Duration**: Set how long force rendering lasts
- **Update Intervals**: Control how often the skeleton updates
- **Event Callbacks**: Get notified when force rendering starts/stops

### 🎨 **Multiple Templates**
- **Text**: Multi-line text skeleton
- **Card**: Complete card layout with header, title, and content
- **List**: User list with avatars and text
- **Avatar**: Profile layout with avatar and details
- **Custom**: Build your own layout

### ✨ **Advanced Animations**
- **Wave**: Smooth wave animation (default)
- **Pulse**: Breathing pulse effect
- **Shimmer**: Shimmering highlight
- **None**: Static skeleton
- **Speed Control**: Slow, normal, or fast animations

### 🎯 **Smart Features**
- **Responsive**: Auto-detect content dimensions
- **Randomization**: Randomize widths for realistic look
- **Fade Transitions**: Smooth content appearance
- **Performance**: Throttled updates for large lists

## Usage Examples

### Basic Usage
```jsx
import AdvancedSkeleton from '../components/AdvancedSkeleton';

// Simple loading state
<AdvancedSkeleton loading={isLoading}>
  <div>Your content here</div>
</AdvancedSkeleton>
```

### Force Rendering (Demo Mode)
```jsx
// Perfect for testing and demos
<AdvancedSkeleton 
  loading={false}
  forceRender={true}
  forceRenderDuration={5000}
  forceRenderInterval={800}
  randomize={true}
>
  <div>Content that will be hidden</div>
</AdvancedSkeleton>
```

### Template Usage
```jsx
// Card template
<AdvancedSkeleton loading={loading} template="card">
  <ProductCard />
</AdvancedSkeleton>

// List template
<AdvancedSkeleton loading={loading} template="list" lines={5}>
  <UserList />
</AdvancedSkeleton>

// Avatar template
<AdvancedSkeleton loading={loading} template="avatar">
  <UserProfile />
</AdvancedSkeleton>
```

### Custom Styling
```jsx
<AdvancedSkeleton 
  loading={loading}
  backgroundColor="#e3f2fd"
  highlightColor="#bbdefb"
  borderRadius="12px"
  animation="pulse"
  animationSpeed="fast"
>
  <YourContent />
</AdvancedSkeleton>
```

### Multi-line Text
```jsx
<AdvancedSkeleton 
  loading={loading}
  lines={4}
  randomize={true}
  spacing="0.75rem"
>
  <Article />
</AdvancedSkeleton>
```

## Props Reference

### Core Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | boolean | `true` | Whether to show skeleton or content |
| `children` | ReactNode | `null` | Content to show when not loading |

### Force Rendering Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `forceRender` | boolean | `false` | Force skeleton to render (demo mode) |
| `forceRenderInterval` | number | `1000` | Update interval in milliseconds |
| `forceRenderDuration` | number | `5000` | Duration for force rendering (0 = infinite) |
| `autoStopForceRender` | boolean | `true` | Auto-stop after duration |

### Appearance Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `shape` | string | `'rectangle'` | Shape: rectangle, circle, square |
| `size` | string | `'normal'` | Size: small, normal, large, custom |
| `width` | string | `null` | Custom width (e.g., '200px', '100%') |
| `height` | string | `null` | Custom height (e.g., '30px', '2rem') |
| `borderRadius` | string | `'4px'` | Border radius |

### Animation Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animation` | string | `'wave'` | Animation: wave, pulse, shimmer, none |
| `animationSpeed` | string | `'normal'` | Speed: slow, normal, fast |

### Layout Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `lines` | number | `1` | Number of skeleton lines |
| `spacing` | string | `'0.5rem'` | Spacing between lines |
| `template` | string | `null` | Template: text, card, list, avatar |

### Styling Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | string | `'#f0f0f0'` | Skeleton background color |
| `highlightColor` | string | `'#e0e0e0'` | Animation highlight color |
| `className` | string | `''` | Additional CSS classes |
| `style` | object | `{}` | Inline styles |

### Advanced Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `responsive` | boolean | `false` | Auto-detect content dimensions |
| `fadeIn` | boolean | `true` | Fade in content when loading completes |
| `randomize` | boolean | `false` | Randomize dimensions for realism |
| `throttleUpdates` | boolean | `false` | Throttle updates for performance |
| `updateInterval` | number | `100` | Update interval when throttling |

### Event Handlers
| Prop | Type | Description |
|------|------|-------------|
| `onForceRenderStart` | function | Called when force rendering starts |
| `onForceRenderStop` | function | Called when force rendering stops |
| `onLoadingComplete` | function | Called when loading completes |

## Templates

### Text Template
Perfect for articles, descriptions, or any text content:
```jsx
<AdvancedSkeleton template="text" lines={3} randomize={true} />
```

### Card Template
Ideal for product cards, blog posts, or content cards:
```jsx
<AdvancedSkeleton template="card" />
```

### List Template
Great for user lists, comment sections, or any list layout:
```jsx
<AdvancedSkeleton template="list" lines={5} />
```

### Avatar Template
Perfect for user profiles or contact cards:
```jsx
<AdvancedSkeleton template="avatar" />
```

## Common Use Cases

### Loading States
```jsx
// API data loading
<AdvancedSkeleton loading={!data} template="card">
  <ProductCard data={data} />
</AdvancedSkeleton>

// User profile loading
<AdvancedSkeleton loading={!user} template="avatar">
  <UserProfile user={user} />
</AdvancedSkeleton>
```

### Component Development
```jsx
// Test how components look while loading
<AdvancedSkeleton 
  forceRender={true} 
  template="list" 
  lines={3}
  randomize={true}
>
  <UserList users={users} />
</AdvancedSkeleton>
```

### Performance Optimization
```jsx
// For large lists
<AdvancedSkeleton 
  loading={loading}
  throttleUpdates={true}
  updateInterval={200}
  template="list"
  lines={10}
>
  <LargeDataList />
</AdvancedSkeleton>
```

## Usage in Plasmic Studio

This component is registered in Plasmic as "Advanced Skeleton" with all props exposed in the UI. You can:

1. **Drag and drop** the component from the component library
2. **Configure all properties** through the Plasmic interface
3. **Add content** using the children slot
4. **Test force rendering** directly in Plasmic Studio

## Demo

Visit `/advanced-skeleton-demo` to see all features and configurations in action, including:
- Force rendering demonstrations
- All template variations
- Animation comparisons
- Real-world usage examples
- Interactive controls

## Performance Tips

1. **Use templates** for consistent layouts
2. **Enable throttling** for large lists
3. **Set appropriate durations** for force rendering
4. **Use randomization sparingly** for better performance
5. **Disable animations** if needed for very large datasets
