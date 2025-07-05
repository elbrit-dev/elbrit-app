# QueryDataTable Component

A powerful, feature-rich data table component designed for use in Plasmic Studio that can display query data with advanced features like sorting, pagination, search, and row selection.

## Features

- **Data Display**: Display any array of objects in a clean, responsive table format
- **Sorting**: Click column headers to sort data (ascending/descending)
- **Search/Filter**: Built-in search functionality across all columns
- **Pagination**: Automatic pagination with customizable items per page
- **Row Selection**: Optional checkbox-based row selection with select all functionality
- **Customizable Columns**: Define custom column renderers, styling, and behavior
- **Loading States**: Built-in loading, error, and empty state handling
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatic dark mode detection and styling
- **GraphQL Integration**: Seamless integration with GraphQL queries via PlasmicGraphQLHelper

## Usage in Plasmic Studio

### Basic Usage

1. **Add the component**: In Plasmic Studio, search for "Query Data Table" and add it to your page
2. **Configure data**: Set the `data` prop to your data array or connect it to a GraphQL query
3. **Define columns**: Configure the `columns` prop with your column definitions
4. **Customize appearance**: Adjust styling props like `striped`, `hoverable`, `bordered`, etc.

### With GraphQL Data

1. **Use GraphQLQuery component**: Wrap your QueryDataTable with the GraphQLQuery component
2. **Set dataPath**: Use the `dataPath` prop to extract the correct data from the GraphQL response
3. **Configure columns**: Define columns that match your GraphQL data structure

### Example Setup

```jsx
// In Plasmic Studio, you would configure this through the UI:

// GraphQLQuery component props:
query: "query GetUsers { users { items { id name email status } } }"
endpoint: "/api/graphql"

// QueryDataTable component props:
dataPath: "users.items"
columns: [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "status", label: "Status", sortable: true }
]
showSearch: true
showPagination: true
itemsPerPage: 10
striped: true
hoverable: true
```

## Props Reference

### Data Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | object | `[]` | The data to display in the table |
| `dataPath` | string | `""` | JSON path to extract data from response (e.g., "users.items") |

### Table Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | object | `[]` | Array of column definitions |
| `itemsPerPage` | number | `10` | Number of items to show per page |
| `showPagination` | boolean | `true` | Whether to show pagination controls |
| `showSearch` | boolean | `true` | Whether to show search bar |
| `showSorting` | boolean | `true` | Whether to show sorting indicators |

### Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | `""` | Additional CSS classes for the table container |
| `tableClassName` | string | `""` | Additional CSS classes for the table element |
| `headerClassName` | string | `""` | Additional CSS classes for the table header |
| `rowClassName` | string | `""` | Additional CSS classes for table rows |
| `cellClassName` | string | `""` | Additional CSS classes for table cells |

### State Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | boolean | `false` | Whether the table is in loading state |
| `error` | string | `null` | Error message to display |

### Event Handlers

| Prop | Type | Description |
|------|------|-------------|
| `onRowClick` | eventHandler | Called when a row is clicked |
| `onSort` | eventHandler | Called when sorting changes |
| `onSearch` | eventHandler | Called when search term changes |
| `onSelectionChange` | eventHandler | Called when row selection changes |

### Feature Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sortable` | boolean | `true` | Whether the table supports sorting |
| `searchable` | boolean | `true` | Whether the table supports searching |
| `selectable` | boolean | `false` | Whether the table supports row selection |
| `striped` | boolean | `true` | Whether to show striped rows |
| `hoverable` | boolean | `true` | Whether rows should be hoverable |
| `bordered` | boolean | `false` | Whether to show table borders |
| `compact` | boolean | `false` | Whether to use compact styling |
| `responsive` | boolean | `true` | Whether the table should be responsive |
| `scrollable` | boolean | `false` | Whether the table should be scrollable |

## Column Configuration

Each column in the `columns` array can have the following properties:

```javascript
{
  key: "fieldName",           // Required: The data field to display
  label: "Display Name",      // Optional: Column header text (defaults to key)
  sortable: true,             // Optional: Whether column is sortable (default: true)
  render: (value, item, index) => ReactNode,  // Optional: Custom render function
  className: "custom-class",  // Optional: Additional CSS classes
  headerStyle: {},            // Optional: Inline styles for header cell
  cellStyle: {}               // Optional: Inline styles for data cells
}
```

### Column Render Examples

```javascript
// Simple text with formatting
{
  key: "id",
  label: "ID",
  render: (value) => <span style={{ fontWeight: 'bold' }}>#{value}</span>
}

// Complex cell with multiple elements
{
  key: "name",
  label: "Name",
  render: (value, item) => (
    <div>
      <div style={{ fontWeight: '500' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.role}</div>
    </div>
  )
}

// Status badge
{
  key: "status",
  label: "Status",
  render: (value) => (
    <span style={{
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      backgroundColor: value === 'active' ? '#dcfce7' : '#fef2f2',
      color: value === 'active' ? '#166534' : '#dc2626'
    }}>
      {value}
    </span>
  )
}

// Date formatting
{
  key: "createdAt",
  label: "Created",
  render: (value) => new Date(value).toLocaleDateString()
}
```

## Demo Components

The package includes several demo components to help you get started:

### SimpleDataTableDemo
A basic table with sample data, search, and pagination.

### GraphQLDataTableDemo
A table connected to GraphQL with row selection and borders.

### CompactDataTableDemo
A compact table without search or pagination for dense data display.

## Integration with GraphQL

### Using with PlasmicGraphQLHelper

```jsx
<PlasmicGraphQLHelper
  query="query GetUsers { users { items { id name email } } }"
  endpoint="/api/graphql"
>
  {({ data, loading, error }) => (
    <QueryDataTable
      data={data}
      dataPath="users.items"
      columns={[
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" }
      ]}
      loading={loading}
      error={error}
    />
  )}
</PlasmicGraphQLHelper>
```

### Data Path Examples

- `"users"` - Direct array
- `"users.items"` - Nested array
- `"data.users"` - GraphQL response structure
- `"result.data.users"` - Deep nested structure

## Event Handling

### Row Click
```javascript
onRowClick: (item) => {
  console.log('Clicked row:', item);
  // Navigate to detail page, open modal, etc.
}
```

### Sorting
```javascript
onSort: (sortConfig) => {
  console.log('Sort changed:', sortConfig);
  // { key: "name", direction: "asc" }
  // Trigger new GraphQL query with sort parameters
}
```

### Search
```javascript
onSearch: (searchTerm) => {
  console.log('Search term:', searchTerm);
  // Trigger new GraphQL query with search parameters
}
```

### Selection
```javascript
onSelectionChange: (selectedRows) => {
  console.log('Selected rows:', selectedRows);
  // Enable/disable bulk actions, update UI, etc.
}
```

## Styling

The component uses CSS modules for styling and includes:

- **Responsive design** that works on all screen sizes
- **Dark mode support** with automatic detection
- **Hover effects** and visual feedback
- **Loading animations** and state indicators
- **Accessible design** with proper ARIA attributes

### Custom Styling

You can customize the appearance using:

1. **CSS Classes**: Add custom classes via `className` props
2. **Inline Styles**: Use `style` props for quick adjustments
3. **CSS Modules**: Override styles by importing the CSS module

## Best Practices

1. **Performance**: For large datasets, consider server-side pagination and sorting
2. **Accessibility**: Always provide meaningful column labels and row identifiers
3. **Mobile**: Test on mobile devices and adjust column configurations accordingly
4. **Data Validation**: Ensure your data structure matches your column definitions
5. **Error Handling**: Provide meaningful error messages and fallback content

## Troubleshooting

### Common Issues

1. **Data not displaying**: Check the `dataPath` prop matches your data structure
2. **Columns not showing**: Ensure column `key` values match your data fields
3. **Sorting not working**: Verify `sortable` is true for the column
4. **Search not working**: Check that `searchable` is true and data is searchable
5. **Styling issues**: Verify CSS modules are properly imported

### Debug Tips

- Use browser console to check data structure
- Verify GraphQL query returns expected data format
- Test with sample data first before connecting to live API
- Check network tab for GraphQL request/response issues

## Examples

See the demo components in your Plasmic Studio for working examples:

- `SimpleDataTableDemo` - Basic usage with sample data
- `GraphQLDataTableDemo` - GraphQL integration example
- `CompactDataTableDemo` - Compact styling example

## Support

For issues or questions:
1. Check the demo components for working examples
2. Verify your data structure matches column definitions
3. Test with sample data before connecting to live APIs
4. Review the props reference for configuration options 