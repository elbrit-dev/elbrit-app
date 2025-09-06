# PlasmicSkeleton Component

A flexible and customizable skeleton loading component for Plasmic Studio, built on top of `react-loading-skeleton`.

## Features

- 🎨 **Multiple Patterns**: Pre-built patterns for common UI elements (text, cards, avatars, tables, lists)
- 🎯 **Plasmic Integration**: Fully integrated with Plasmic Studio for easy configuration
- 🎨 **Customizable Styling**: Full control over colors, animations, and dimensions
- ⚡ **Performance Optimized**: Lightweight and efficient rendering
- 🔧 **Flexible API**: Extensive props for fine-tuning appearance and behavior

## Installation

The component is already installed and registered in your Plasmic project. It uses the `react-loading-skeleton` package which has been added to your dependencies.

## Usage in Plasmic Studio

1. **Add the Component**: Search for "Loading Skeleton" in the Plasmic Studio component panel
2. **Choose a Pattern**: Select from predefined patterns (default, text, card, avatar, table, list)
3. **Customize Properties**: Use the property panel to adjust colors, dimensions, and animation settings
4. **Configure Layout**: Set up responsive behavior and positioning

## Available Patterns

### Default Pattern
Basic skeleton with customizable count, width, and height.

### Text Pattern
Multi-line text skeleton with configurable line count.

### Card Pattern
Complete card layout with avatar, title, and content areas.

### Avatar Pattern
Circular skeleton for profile pictures and avatars.

### Table Pattern
Table layout with configurable rows and columns.

### List Pattern
List items with avatars and text content.

## Props Reference

### Basic Props
- `count` (number): Number of skeleton lines to render
- `width` (string): Width of the skeleton (CSS value)
- `height` (string): Height of each skeleton line (CSS value)
- `circle` (boolean): Make the skeleton circular
- `borderRadius` (string): Border radius (CSS value)

### Animation Props
- `duration` (number): Animation duration in seconds
- `direction` (choice): Animation direction (ltr/rtl)
- `enableAnimation` (boolean): Enable/disable animation

### Theme Props
- `baseColor` (string): Background color of the skeleton
- `highlightColor` (string): Highlight color in animation
- `customHighlightBackground` (string): Custom gradient background

### Layout Props
- `inline` (boolean): Render inline (no line breaks)
- `className` (string): Additional CSS classes
- `containerClassName` (string): Container CSS classes
- `containerTestId` (string): Test ID for container

### Pattern-Specific Props
- `textLines` (number): Lines for text pattern
- `avatarSize` (string): Size for avatar elements
- `tableRows` (number): Rows for table pattern
- `tableColumns` (number): Columns for table pattern
- `listItems` (number): Items for list pattern

## Examples

### Basic Usage
```jsx
<PlasmicSkeleton count={3} height="1.5rem" />
```

### Card Pattern
```jsx
<PlasmicSkeleton pattern="card" />
```

### Custom Colors
```jsx
<PlasmicSkeleton 
  pattern="text" 
  baseColor="#ff6b6b" 
  highlightColor="#ff8e8e"
  duration={2}
/>
```

### Conditional Rendering
```jsx
{loading ? (
  <PlasmicSkeleton pattern="text" textLines={4} />
) : (
  <div>Your content here</div>
)}
```

## Best Practices

1. **Match Content Structure**: Use patterns that closely match your actual content layout
2. **Consistent Sizing**: Ensure skeleton dimensions match your content dimensions
3. **Appropriate Duration**: Use reasonable animation durations (1-2 seconds)
4. **Color Harmony**: Choose colors that complement your design system
5. **Performance**: Use conditional rendering to show skeletons only when loading

## Integration with Data Tables

The skeleton component works seamlessly with the existing data table components:

```jsx
// In your data table component
{loading ? (
  <PlasmicSkeleton pattern="table" tableRows={5} tableColumns={4} />
) : (
  <PrimeDataTable data={data} columns={columns} />
)}
```

## Testing

Visit `/test-skeleton` to see all patterns and configurations in action.

## Troubleshooting

### Skeleton Not Appearing
- Check if `react-loading-skeleton` CSS is imported
- Verify the component is properly registered in `plasmic-init.js`

### Animation Issues
- Ensure `enableAnimation` is set to `true`
- Check if `duration` is a positive number

### Styling Problems
- Verify CSS values are properly formatted (e.g., "1rem", "100%")
- Check for conflicting CSS classes

## Advanced Usage

### Custom Wrapper
```jsx
const CustomWrapper = ({ children }) => (
  <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
    {children}
  </div>
);

<PlasmicSkeleton wrapper={CustomWrapper} count={3} />
```

### Custom Highlight Background
```jsx
<PlasmicSkeleton 
  customHighlightBackground="linear-gradient(90deg, #ff6b6b 40%, #4ecdc4 50%, #45b7d1 60%)"
  count={2}
/>
```

## Browser Support

The component supports all modern browsers and uses CSS animations for smooth performance.

## Dependencies

- `react-loading-skeleton`: ^3.5.0
- `react`: ^18.0.0
- `@plasmicapp/loader-nextjs`: Latest

## License

This component is part of your Plasmic project and follows the same license terms.
