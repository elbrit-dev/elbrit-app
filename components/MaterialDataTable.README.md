# MaterialDataTable Component

A fully customizable Material-UI data table component with advanced features including expand/collapse rows, in-row filters, sorting, search, export, and responsive design using rem/em units.

## ✨ Features

- 🔍 **Global Search** - Search across all columns
- 🎯 **In-Row Filters** - Dedicated filter row for each column
- 📊 **Column Sorting** - Click headers to sort data
- 📂 **Row Expansion** - Expand rows to view nested data
- ✅ **Row Selection** - Select rows with checkboxes
- 📤 **CSV Export** - Export filtered data to CSV
- 📄 **Pagination** - Configurable pagination controls
- 📱 **Responsive Design** - Uses rem/em units for all sizing
- 🎨 **Material Design** - Beautiful Material-UI components
- 🔧 **Auto-detect Columns** - Automatically generates columns from data
- 🔗 **Nested Data Support** - Handles nested arrays and objects
- 🎭 **Plasmic Integration** - Ready to use in Plasmic Studio

## 📦 Installation

The component requires Material-UI dependencies:

```bash
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```

These are already added to `package.json`.

## 🚀 Usage

### Basic Usage

```jsx
import MaterialDataTable from './components/MaterialDataTable';

const data = [
  { id: 1, name: 'John Doe', age: 30, city: 'New York' },
  { id: 2, name: 'Jane Smith', age: 25, city: 'London' },
  { id: 3, name: 'Bob Johnson', age: 35, city: 'Paris' },
];

function MyComponent() {
  return (
    <MaterialDataTable
      data={data}
      title="Users"
      pagination
      showFilters
    />
  );
}
```

### With Custom Columns

```jsx
const columns = [
  { 
    key: 'name', 
    title: 'Full Name', 
    sortable: true, 
    filterable: true 
  },
  { 
    key: 'age', 
    title: 'Age', 
    sortable: true, 
    align: 'right',
    render: (value) => `${value} years`
  },
  { 
    key: 'city', 
    title: 'City', 
    sortable: true, 
    filterable: true 
  },
];

<MaterialDataTable
  data={data}
  columns={columns}
  title="Users"
/>
```

### With Nested Data (Expandable Rows)

```jsx
const dataWithNested = [
  {
    id: 1,
    customer: 'Acme Corp',
    total: 5000,
    invoices: [
      { invoiceId: 'INV-001', amount: 2000, date: '2025-01-01' },
      { invoiceId: 'INV-002', amount: 3000, date: '2025-01-15' },
    ]
  },
  {
    id: 2,
    customer: 'Tech Solutions',
    total: 8000,
    invoices: [
      { invoiceId: 'INV-003', amount: 8000, date: '2025-02-01' },
    ]
  },
];

<MaterialDataTable
  data={dataWithNested}
  expandable
  nestedKey="invoices"
  title="Customers"
/>
```

### With Row Selection

```jsx
<MaterialDataTable
  data={data}
  selectable
  onSelectionChange={(selectedRows) => {
    console.log('Selected:', selectedRows);
  }}
  title="Select Users"
/>
```

### In Plasmic Studio

1. After running `npm install`, the component will be available in Plasmic Studio
2. Look for "Material-UI Data Table" in the component library
3. Drag it onto your canvas
4. Configure props in the right panel:
   - **data**: Bind to your data source
   - **expandable**: Toggle for nested data
   - **showFilters**: Show/hide filter row
   - **pagination**: Enable pagination
   - **title**: Set table title

## 🎛️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array | `[]` | Array of data objects to display |
| `columns` | Array | `[]` | Column definitions (auto-generated if empty) |
| `expandable` | Boolean | `false` | Enable row expansion for nested data |
| `nestedKey` | String | `null` | Key name for nested data (auto-detected) |
| `showFilters` | Boolean | `true` | Show filter row below headers |
| `pagination` | Boolean | `true` | Enable pagination controls |
| `rowsPerPage` | Number | `10` | Initial rows per page |
| `rowsPerPageOptions` | Array | `[5,10,25,50,100]` | Pagination options |
| `dataKey` | String | `'id'` | Unique row identifier key |
| `title` | String | `''` | Table title in toolbar |
| `dense` | Boolean | `false` | Use dense table padding |
| `exportFilename` | String | `'data.csv'` | CSV export filename |
| `selectable` | Boolean | `false` | Enable row selection |
| `onRowClick` | Function | `undefined` | Callback when row is clicked |
| `onSelectionChange` | Function | `undefined` | Callback when selection changes |
| `className` | String | `''` | Custom CSS class |
| `style` | Object | `{}` | Inline styles |

## 📋 Column Definition

Each column object can have:

```javascript
{
  key: 'fieldName',           // Required: field key in data
  title: 'Display Name',      // Column header text
  sortable: true,             // Enable sorting (default: true)
  filterable: true,           // Enable filtering (default: true)
  align: 'left',              // Text alignment: 'left' | 'center' | 'right'
  render: (value, row) => {   // Custom render function
    return <CustomComponent value={value} />;
  }
}
```

## 🎨 Styling

The component uses rem/em units for responsive sizing:

- **Headers**: 0.875rem (14px base)
- **Body text**: 0.875rem (14px base)
- **Padding**: 1rem, 0.75rem, 0.5rem
- **Border radius**: 0.5rem, 0.375rem
- **Icon sizes**: Relative to font size

### Custom Styling

```jsx
<MaterialDataTable
  data={data}
  className="my-custom-table"
  style={{ maxWidth: '90rem' }}
/>
```

### Theme Customization

The component automatically adapts to Material-UI theme (light/dark mode).

## 📱 Responsive Design

The table is fully responsive:

- **Desktop**: Full table with all features
- **Tablet**: Optimized spacing
- **Mobile**: Horizontal scroll with fixed columns

All sizing uses rem/em units for accessibility and scaling.

## 🔄 Data Handling

### Nested Data

The component automatically detects nested data using common keys:
- `items`
- `invoices`
- `orders`
- `products`
- `children`
- `subItems`
- `nestedData`
- `details`

Or specify manually with `nestedKey` prop.

### Auto-Generated Columns

If `columns` prop is empty, columns are auto-generated from data:
- Excludes nested arrays
- Converts camelCase to Title Case
- Sets appropriate alignment for numbers

### Data Types

Supported data types:
- **String**: Left-aligned text
- **Number**: Right-aligned, monospace font
- **Boolean**: Rendered as "true"/"false"
- **Array**: Shows count (e.g., "3 items")
- **Object**: Shows preview or "[object]"

## 🎯 Advanced Features

### Expand/Collapse All

```jsx
// Toolbar includes expand/collapse all buttons
<MaterialDataTable
  data={dataWithNested}
  expandable
  nestedKey="invoices"
/>
```

### Clear Filters

```jsx
// Automatic "Clear All Filters" button appears when filters are active
<MaterialDataTable
  data={data}
  showFilters
/>
```

### Export to CSV

```jsx
// Export button in toolbar
<MaterialDataTable
  data={data}
  exportFilename="my-export.csv"
/>
```

## 🔧 Comparison with PrimeDataTable

| Feature | MaterialDataTable | PrimeDataTable |
|---------|------------------|----------------|
| **Design System** | Material-UI | PrimeReact |
| **Expand/Collapse** | ✅ | ✅ |
| **In-Row Filters** | ✅ | ✅ |
| **Sorting** | ✅ | ✅ |
| **Export** | CSV only | CSV, Excel, PDF |
| **Pivot Tables** | ❌ | ✅ |
| **Cell Editing** | ❌ | ✅ |
| **Column Grouping** | ❌ | ✅ |
| **Responsive Units** | rem/em | px |
| **File Size** | Smaller | Larger |
| **Complexity** | Simple | Advanced |

## 🐛 Known Limitations

1. No inline cell editing (use PrimeDataTable for this)
2. No pivot table functionality
3. No column grouping
4. Export limited to CSV format
5. No virtual scrolling for very large datasets

## 📝 Examples

### Example 1: Simple Product List

```jsx
const products = [
  { id: 1, name: 'Laptop', price: 999, stock: 5 },
  { id: 2, name: 'Mouse', price: 29, stock: 150 },
  { id: 3, name: 'Keyboard', price: 79, stock: 45 },
];

<MaterialDataTable
  data={products}
  title="Products"
  dense
  rowsPerPage={5}
/>
```

### Example 2: Customer Orders with Nested Data

```jsx
const customers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    orders: [
      { orderId: 'ORD-001', total: 150, status: 'Delivered' },
      { orderId: 'ORD-002', total: 200, status: 'Pending' },
    ]
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    orders: [
      { orderId: 'ORD-003', total: 350, status: 'Processing' },
    ]
  },
];

const columns = [
  { key: 'name', title: 'Customer Name' },
  { key: 'email', title: 'Email Address' },
];

<MaterialDataTable
  data={customers}
  columns={columns}
  expandable
  nestedKey="orders"
  title="Customer Orders"
  onRowClick={(row) => console.log('Clicked:', row)}
/>
```

### Example 3: With Row Selection

```jsx
const [selected, setSelected] = useState([]);

<MaterialDataTable
  data={products}
  selectable
  onSelectionChange={setSelected}
  title={`Products (${selected.length} selected)`}
/>
```

## 🤝 Contributing

To extend this component:

1. Edit `components/MaterialDataTable.js`
2. Add new props to the component
3. Update Plasmic registration in `plasmic-init.js`
4. Update this README

## 📄 License

Part of the firebaseauth project.

## 🆘 Support

For issues or questions:
1. Check PrimeDataTable for similar features
2. Review Material-UI documentation
3. Contact the development team

