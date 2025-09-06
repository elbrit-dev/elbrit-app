# How to Use Loading Skeleton in Plasmic Studio

This guide shows you how to use the `PlasmicSkeleton` component in Plasmic Studio to show loading states while your data is being fetched.

## Overview

The `PlasmicSkeleton` component is already registered in your Plasmic project and provides multiple patterns for different UI elements. You can use it to show loading states until your data is ready.

## Step-by-Step Usage

### 1. Add the Skeleton Component

1. In Plasmic Studio, search for "PlasmicSkeleton" in the component panel
2. Drag it onto your canvas where you want the loading state to appear
3. Position it exactly where your actual content will be

### 2. Configure the Skeleton Pattern

Choose the appropriate pattern that matches your content:

- **`default`**: Basic skeleton lines
- **`text`**: Multi-line text skeleton
- **`card`**: Card layout with avatar and content
- **`avatar`**: Circular skeleton for profile pictures
- **`table`**: Table layout with rows and columns
- **`list`**: List items with avatars and text

### 3. Set Up Conditional Rendering

The key to making the skeleton work is conditional rendering based on your data loading state. Here's how:

#### Option A: Using the showWhen Prop (Recommended)

1. Select your skeleton component
2. In the property panel, find the **"Show When"** prop
3. Set it to your loading condition (e.g., `loading === true`)
4. Add your actual content component as a sibling
5. Set the content component's condition to show when data is loaded

#### Option B: Using Plasmic's Conditional Rendering

1. Select your skeleton component
2. In the property panel, find "Conditional Rendering"
3. Set the condition to check if your data is loading
4. Add your actual content component as a sibling
5. Set the content component's condition to show when data is loaded

#### Option C: Using Data Context

If you're using GraphQL or data queries:

1. Create a data query in Plasmic Studio
2. Use the query's loading state to control skeleton visibility
3. Set up conditional rendering based on the query state

### 4. Example Setup

Here's a practical example for a data table:

```
┌─────────────────────────────────────┐
│  Container (with conditional logic) │
├─────────────────────────────────────┤
│  IF loading = true:                 │
│    ┌─────────────────────────────┐   │
│    │  PlasmicSkeleton            │   │
│    │  pattern: "table"           │   │
│    │  tableRows: 5               │   │
│    │  tableColumns: 4            │   │
│    └─────────────────────────────┘   │
│  ELSE:                              │
│    ┌─────────────────────────────┐   │
│    │  Your Data Table Component  │   │
│    │  (PrimeDataTable, etc.)     │   │
│    └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Advanced Configuration

### Customizing Skeleton Appearance

You can customize the skeleton to match your design:

- **Colors**: Set `baseColor` and `highlightColor` to match your theme
- **Animation**: Adjust `duration` and `enableAnimation`
- **Size**: Configure `width`, `height`, and other dimension props
- **Pattern-specific**: Use props like `textLines`, `tableRows`, `tableColumns`

### Data Loading States

The skeleton should show during these states:

1. **Initial Load**: When the page first loads
2. **Data Fetching**: When making API calls or GraphQL queries
3. **Authentication**: When checking user permissions
4. **Re-fetching**: When refreshing data

### Integration with Your Components

If you have custom components that load data, you can:

1. **Pass loading state as props** to your components
2. **Use React state** to track loading status
3. **Integrate with data hooks** like `useTableData`
4. **Use GraphQL loading states** from Plasmic's data queries

## Common Patterns

### 1. Table Loading
```jsx
// In your component
{loading ? (
  <PlasmicSkeleton 
    pattern="table" 
    tableRows={5} 
    tableColumns={4}
    height="2rem"
  />
) : (
  <PrimeDataTable data={data} columns={columns} />
)}
```

### 2. Card Loading
```jsx
{loading ? (
  <PlasmicSkeleton 
    pattern="card" 
    cardHeight="200px"
    avatarSize="60px"
  />
) : (
  <YourCardComponent data={data} />
)}
```

### 3. List Loading
```jsx
{loading ? (
  <PlasmicSkeleton 
    pattern="list" 
    listItems={4}
    avatarSize="40px"
  />
) : (
  <YourListComponent items={items} />
)}
```

## Best Practices

1. **Match Content Structure**: Choose skeleton patterns that closely match your actual content layout
2. **Consistent Sizing**: Ensure skeleton dimensions match your content dimensions
3. **Appropriate Duration**: Use reasonable animation durations (1-2 seconds)
4. **Color Harmony**: Choose colors that complement your design system
5. **Performance**: Use conditional rendering to show skeletons only when loading

## Troubleshooting

### Skeleton Not Showing
- Check if the loading condition is properly set
- Verify the skeleton component is not hidden by CSS
- Ensure the conditional rendering logic is correct

### Skeleton Not Matching Content
- Adjust the pattern type to better match your content
- Customize dimensions and styling props
- Consider using multiple skeleton components for complex layouts

### Animation Issues
- Ensure `enableAnimation` is set to `true`
- Check if `duration` is a positive number
- Verify CSS animations are not disabled

## Example Implementation

Here's a complete example of how to set up a loading skeleton for a data table in Plasmic Studio:

1. **Add a Container** to hold your conditional content
2. **Add PlasmicSkeleton** with `pattern="table"`
3. **Add your data table component** (PrimeDataTable, etc.)
4. **Set up conditional rendering**:
   - Skeleton shows when `loading === true`
   - Table shows when `loading === false`
5. **Connect to your data source** (GraphQL query, API, etc.)
6. **Configure the loading state** to update when data is fetched

This approach ensures a smooth user experience with proper loading states that match your content structure.
