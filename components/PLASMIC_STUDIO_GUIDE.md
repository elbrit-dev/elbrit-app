# Using Custom Data Tables in Plasmic Studio

## 🎨 Available Components

After registering the components, you'll see **two new components** in your Plasmic Studio component panel:

1. **Custom Data Table** - Full-featured responsive table
2. **Compact Data Table** - Lightweight minimal table

---

## 🚀 Quick Start in Plasmic Studio

### Step 1: Add Component to Canvas

1. Open your Plasmic Studio
2. Navigate to the **Components** panel (left sidebar)
3. Search for "**Custom Data Table**" or "**Compact Data Table**"
4. Drag and drop it onto your canvas

### Step 2: Connect Your Data

In the **Props Panel** (right sidebar):

#### Connect to a Query:
```javascript
// In the 'data' prop field:
$queries.yourQueryName.data

// Or if your data is nested:
$queries.salesData.data.response.data

// Or from page data:
$ctx.data.tableData
```

#### Define Columns:
```javascript
// In the 'columns' prop field (click "< >" for JavaScript mode):
[
  { 
    key: 'salesTeam', 
    title: 'Sales Team',
    sortable: true,
    filterable: true 
  },
  { 
    key: 'brand', 
    title: 'Brand',
    sortable: true,
    filterable: true 
  },
  { 
    key: 'target', 
    title: 'Target',
    align: 'right',
    formatter: (value) => `$${value.toLocaleString()}`
  },
  { 
    key: 'jan', 
    title: 'January',
    align: 'right',
    formatter: (value) => value.toLocaleString()
  }
]
```

### Step 3: Configure Features

Toggle these props in Plasmic Studio:
- ✅ **enableExpansion** - Show/hide row expansion
- ✅ **enableSearch** - Show/hide global search
- ✅ **enableFilters** - Show/hide column filters
- ✅ **enableSorting** - Enable/disable sorting
- ✅ **enableExport** - Show/hide export button

---

## 📊 Real-World Examples for Plasmic Studio

### Example 1: Sales Performance Table

**Data Query:**
```javascript
// Create a query named "salesData" in Plasmic:
$queries.salesData.data
```

**Columns Configuration:**
```javascript
[
  { key: 'salesTeam', title: 'Sales Team', sortable: true, filterable: true },
  { key: 'brand', title: 'Brand', sortable: true, filterable: true },
  { 
    key: 'target', 
    title: 'Target', 
    align: 'right',
    formatter: (value) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value)
  },
  { key: 'jan', title: 'Jan', align: 'right', formatter: (v) => v.toLocaleString() },
  { key: 'feb', title: 'Feb', align: 'right', formatter: (v) => v.toLocaleString() },
  { key: 'mar', title: 'Mar', align: 'right', formatter: (v) => v.toLocaleString() },
  { key: 'apr', title: 'Apr', align: 'right', formatter: (v) => v.toLocaleString() },
  { key: 'may', title: 'May', align: 'right', formatter: (v) => v.toLocaleString() }
]
```

**Props:**
- `data`: `$queries.salesData.data`
- `rowKey`: `"id"`
- `nestedKey`: `"items"` (for invoices)
- `enableExpansion`: `true`
- `enableSearch`: `true`
- `enableFilters`: `true`
- `enableSorting`: `true`
- `enableExport`: `true`
- `tableHeight`: `"70vh"`

### Example 2: Invoice/Voucher Table (No Expansion)

**Columns Configuration:**
```javascript
[
  { key: 'voucherType', title: 'Voucher Type', sortable: true, filterable: true },
  { key: 'voucher', title: 'Voucher', sortable: true, filterable: true },
  { key: 'postingDate', title: 'Posting Date', sortable: true, filterable: true },
  { key: 'customer', title: 'Customer', sortable: true, filterable: true },
  { key: 'customerNo', title: 'Customer No', sortable: true, filterable: true },
  { key: 'customerGroup', title: 'Customer Group', sortable: true, filterable: true },
  { key: 'territory', title: 'Territory', sortable: true, filterable: true },
  { key: 'taxCategory', title: 'Tax Category', sortable: true, filterable: true }
]
```

**Props:**
- `data`: `$queries.invoices.data`
- `rowKey`: `"id"`
- `enableExpansion`: `false` (no nested data)
- `enableSearch`: `true`
- `enableFilters`: `true`
- `enableSorting`: `true`
- `enableExport`: `true`

### Example 3: Custom Formatters with Status Badges

**Columns with Custom Renderers:**
```javascript
[
  { 
    key: 'name', 
    title: 'Name',
    sortable: true,
    filterable: true 
  },
  { 
    key: 'amount', 
    title: 'Amount',
    align: 'right',
    formatter: (value) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
  },
  { 
    key: 'status', 
    title: 'Status',
    render: (value, row) => {
      const colors = {
        active: '#22c55e',
        pending: '#f59e0b',
        inactive: '#ef4444'
      };
      return (
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          backgroundColor: colors[value] + '20',
          color: colors[value],
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          {value.toUpperCase()}
        </span>
      );
    }
  },
  { 
    key: 'progress', 
    title: 'Progress',
    render: (value) => (
      <div style={{ 
        width: '100%', 
        height: '0.5rem', 
        backgroundColor: '#e5e7eb',
        borderRadius: '9999px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          backgroundColor: '#3b82f6',
          transition: 'width 0.3s ease'
        }} />
      </div>
    )
  }
]
```

---

## 🎨 Styling in Plasmic Studio

### Method 1: Using customStyles Prop

In the `customStyles` prop (JavaScript mode):

```javascript
{
  container: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  toolbar: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe'
  },
  table: {
    fontSize: '1rem'
  },
  th: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontWeight: '700'
  },
  tr: {
    transition: 'all 0.3s ease'
  },
  td: {
    padding: '1rem'
  }
}
```

### Method 2: Using className Prop

1. Add a custom CSS class in Plasmic's **Custom CSS** panel:
```css
.my-custom-table {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.my-custom-table table {
  font-family: 'Inter', sans-serif;
}
```

2. Set the `className` prop to `"my-custom-table"`

### Method 3: Adjust Table Height

- `tableHeight`: `"70vh"` - 70% of viewport height
- `tableHeight`: `"600px"` - Fixed 600 pixels
- `tableHeight`: `"100%"` - Full container height

---

## 🔧 Advanced Features

### Row Click Handler

Create an interaction in Plasmic:

1. Select your CustomDataTable component
2. In Props panel, find `onRowClick`
3. Click "+" to add interaction
4. Choose action:
   - **Navigate to page**: Go to detail page
   - **Run code**: Custom JavaScript
   - **Update variable**: Store selected row

Example code interaction:
```javascript
// In onRowClick handler:
console.log('Row clicked:', $event.row);
// Navigate to detail page
$ctx.router.push(`/details/${$event.row.id}`);
```

### Custom Export Handler

In `onExport` prop:
```javascript
// Custom export logic
const data = $event.data;
console.log('Exporting:', data);

// Convert to JSON
const json = JSON.stringify(data, null, 2);
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'export.json';
link.click();
```

### Dynamic Column Configuration

Use JavaScript expressions in Plasmic:

```javascript
// Generate columns dynamically from data
$queries.salesData.data && $queries.salesData.data.length > 0
  ? Object.keys($queries.salesData.data[0])
      .filter(key => !key.startsWith('_'))
      .map(key => ({
        key: key,
        title: key.charAt(0).toUpperCase() + key.slice(1),
        sortable: true,
        filterable: true
      }))
  : []
```

---

## 📱 Mobile Responsive Behavior

The tables automatically adjust for different screen sizes:

### Desktop (> 768px)
- Full toolbar with all labels
- All features visible
- Standard padding: `1rem`

### Tablet (768px - 480px)
- Wrapped toolbar
- All features maintained
- Padding: `0.75rem`

### Mobile (< 480px)
- Vertical toolbar layout
- Icon-only buttons (labels hidden)
- Padding: `0.5rem`
- Horizontal scroll enabled
- Font size: `0.6875rem`

**No configuration needed** - it's automatic!

---

## 🐛 Troubleshooting in Plasmic Studio

### Issue: "No data found"

**Solution:**
1. Check your data query is successful
2. Verify data path: `$queries.yourQuery.data`
3. Ensure data is an array, not an object
4. Use browser console to inspect: `console.log($queries.yourQuery)`

### Issue: Columns not showing

**Solution:**
1. Ensure `columns` prop is in JavaScript mode (click "< >")
2. Verify column `key` matches your data field names exactly
3. Check for typos in field names
4. Use browser console: `console.log(Object.keys($queries.yourQuery.data[0]))`

### Issue: Nested rows not expanding

**Solution:**
1. Check `enableExpansion` is `true`
2. Verify `nestedKey` matches your data structure
3. Ensure nested data exists: `console.log($queries.yourQuery.data[0].items)`
4. Default `nestedKey` is `"items"` - change if your field is different

### Issue: Formatters not working

**Solution:**
1. Ensure you're using JavaScript mode for columns
2. Check formatter syntax:
   ```javascript
   formatter: (value) => value.toLocaleString()
   ```
3. Test in browser console first
4. For complex formatting, use `render` instead of `formatter`

---

## 💡 Pro Tips for Plasmic Studio

### 1. **Reusable Column Configurations**

Create a **Global Context** in Plasmic with your column definitions:

```javascript
// In GlobalContext:
{
  salesColumns: [
    { key: 'salesTeam', title: 'Sales Team', sortable: true },
    { key: 'brand', title: 'Brand', sortable: true },
    // ... more columns
  ]
}

// Then in your CustomDataTable:
columns: $ctx.globalData.salesColumns
```

### 2. **Conditional Formatting**

Use conditional logic in formatters:

```javascript
{
  key: 'amount',
  title: 'Amount',
  formatter: (value) => {
    const color = value > 1000000 ? '#22c55e' : '#6b7280';
    return `<span style="color: ${color}">$${value.toLocaleString()}</span>`;
  }
}
```

### 3. **Loading States**

Wrap your table in a conditional:

```javascript
// In Plasmic:
{$queries.salesData.isLoading ? (
  <div>Loading...</div>
) : (
  <CustomDataTable data={$queries.salesData.data} ... />
)}
```

### 4. **Empty States**

Show custom message when no data:

```javascript
{$queries.salesData.data && $queries.salesData.data.length > 0 ? (
  <CustomDataTable data={$queries.salesData.data} ... />
) : (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    No data available
  </div>
)}
```

---

## 📚 Complete Component API

### CustomDataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array | `[]` | Table data array |
| `columns` | Array | `[]` | Column definitions |
| `rowKey` | String | `"id"` | Unique row identifier |
| `nestedKey` | String | `"items"` | Nested data key |
| `enableExpansion` | Boolean | `true` | Enable row expansion |
| `enableSearch` | Boolean | `true` | Enable global search |
| `enableExport` | Boolean | `true` | Enable export button |
| `enableFilters` | Boolean | `true` | Enable column filters |
| `enableSorting` | Boolean | `true` | Enable sorting |
| `tableHeight` | String | `"70vh"` | Max table height |
| `customStyles` | Object | `{}` | Style overrides |
| `className` | String | `""` | CSS classes |
| `onRowClick` | Function | - | Row click handler |
| `onExport` | Function | - | Custom export handler |

### CompactDataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | Array | `[]` | Table data array |
| `columns` | Array | `[]` | Column definitions |
| `expandKey` | String | `"items"` | Nested data key |
| `onExport` | Function | - | Custom export handler |
| `className` | String | `""` | CSS classes |

---

## 🎓 Learning Path

1. ✅ Start with basic table (just data + columns)
2. ✅ Add column formatters for currency/numbers
3. ✅ Enable filters and sorting
4. ✅ Add nested data with expansion
5. ✅ Customize styling
6. ✅ Add row click interactions
7. ✅ Implement custom export

---

## 🆘 Getting Help

- Check browser console for errors
- Verify data structure with `console.log($queries.yourQuery.data)`
- Review the [Full Documentation](./CUSTOM_DATATABLE_README.md)
- Check [Integration Guide](./INTEGRATION_GUIDE.md)
- Try the [Example Component](./CustomDataTableExample.js)

---

**Happy Building in Plasmic Studio! 🎨**

