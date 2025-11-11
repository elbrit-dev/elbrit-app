# MaterialDataTable with Sales Team Data

## 🎯 Your Data Structure

```javascript
[
  {
    SalesTeam: "Elbrit Coimbatore",
    Target: 0,
    GrossSales: 840517.74,
    NetSales: 836417.54,
    CreditNotes: 4100.2,
    SalesReturn: -4100.2,
    IncentiveValue: 836417.54,
    HQs: [                           // ← Nested array
      {
        HQ: "HQ-Coimbatore",
        HQType: "HQ",
        GrossSales: 216859.02,
        NetSales: 216859.02,
        TotalCustomers: 7
      },
      {
        HQ: "HQ-Erode",
        HQType: "HQ",
        GrossSales: 468383.30,
        TotalCustomers: 7
      }
    ]
  },
  {
    SalesTeam: "CND Coimbatore",
    // ... more data with HQs array
  }
]
```

## 📊 What Will Happen

### 1. **Main Table Display**

The MaterialDataTable will show:

```
┌────────────────────────────────────────────────────────────────────┐
│ [Search...]                    [⊕] [⊖] [📥] [Clear Filters]       │
├────────────────────────────────────────────────────────────────────┤
│ ▼ │ Sales Team         │ Target  │ Gross Sales │ Net Sales   │...│
├───┼────────────────────┼─────────┼─────────────┼─────────────┼───┤
│   │ [Filter...]        │[Filter] │ [Filter]    │ [Filter]    │   │
├───┼────────────────────┼─────────┼─────────────┼─────────────┼───┤
│ ▶ │ Elbrit Coimbatore  │    0.00 │  $840,517.74│ $836,417.54 │...│
│ ▶ │ CND Coimbatore     │    0.00 │  $762,754.14│ $751,832.64 │...│
│ ▶ │ Aura & Proxima +   │    0.00 │  $524,123.45│ $521,456.78 │...│
└───┴────────────────────┴─────────┴─────────────┴─────────────┴───┘
```

### 2. **Expanded Row (Nested HQs)**

When you click the expand arrow (▶):

```
┌────────────────────────────────────────────────────────────────────┐
│ ▼ │ Elbrit Coimbatore  │    0.00 │  $840,517.74│ $836,417.54 │...│
│   └─────────────────────────────────────────────────────────────┐  │
│     │ Details (3 HQs)                                           │  │
│     ├──────────────────┬──────────┬─────────────┬───────────────┤  │
│     │ HQ               │ HQ Type  │ Gross Sales │ Total Customers│  │
│     ├──────────────────┼──────────┼─────────────┼───────────────┤  │
│     │ HQ-Coimbatore    │ HQ       │ $216,859.02 │ 7             │  │
│     │ HQ-Erode         │ HQ       │ $468,383.30 │ 7             │  │
│     │ HQ-Salem         │ HQ       │ $155,275.42 │ 5             │  │
│     └──────────────────┴──────────┴─────────────┴───────────────┘  │
│ ▶ │ CND Coimbatore     │    0.00 │  $762,754.14│ $751,832.64 │...│
└───┴────────────────────┴─────────┴─────────────┴─────────────┴───┘
```

## ✅ Features That Will Work

### 1. **Automatic Column Detection**
- Detects all top-level fields: SalesTeam, Target, GrossSales, etc.
- Formats numbers with proper alignment
- Auto-detects currency values

### 2. **Nested Data Handling**
- Automatically detects `HQs` array
- Creates expandable rows
- Shows nested table when expanded
- Each HQ row shows all its properties

### 3. **Filtering**
- Filter by Sales Team name
- Filter by numeric values (Target, GrossSales, etc.)
- Filters work on both main and nested data

### 4. **Sorting**
- Sort by any column (Sales Team, GrossSales, NetSales, etc.)
- Click column header to toggle ascending/descending
- Numeric sorting works correctly

### 5. **Search**
- Global search across all visible columns
- Finds matches in Sales Team names
- Finds matches in numeric values

### 6. **Export**
- Exports main table data to CSV
- Includes all visible columns
- Formatted numbers

## 💻 Quick Usage

### Option 1: Auto Columns (Simplest)
```jsx
<MaterialDataTable
  data={yourSalesData}
  expandable
  nestedKey="HQs"
  title="Sales Team Performance"
  showFilters
  pagination
/>
```

### Option 2: Custom Columns (More Control)
```jsx
const columns = [
  { key: 'SalesTeam', title: 'Sales Team', sortable: true, filterable: true },
  { 
    key: 'GrossSales', 
    title: 'Gross Sales', 
    sortable: true,
    align: 'right',
    render: (value) => `$${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2 
    })}`
  },
  { 
    key: 'NetSales', 
    title: 'Net Sales', 
    sortable: true,
    align: 'right',
    render: (value) => `$${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2 
    })}`
  },
  { 
    key: 'SalesReturn', 
    title: 'Sales Return', 
    sortable: true,
    align: 'right',
    render: (value) => (
      <span style={{ color: value < 0 ? 'red' : 'inherit' }}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </span>
    )
  },
  { 
    key: 'IncentiveValue', 
    title: 'Incentive Value', 
    sortable: true,
    align: 'right',
    render: (value) => (
      <span style={{ fontWeight: 700, color: '#2e7d32' }}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </span>
    )
  },
];

<MaterialDataTable
  data={yourSalesData}
  columns={columns}
  expandable
  nestedKey="HQs"
  title="Sales Team Performance"
  showFilters
  pagination
/>
```

### Option 3: With Row Selection
```jsx
const [selected, setSelected] = useState([]);

<MaterialDataTable
  data={yourSalesData}
  expandable
  nestedKey="HQs"
  selectable
  onSelectionChange={setSelected}
  title={`Sales Teams (${selected.length} selected)`}
  showFilters
  pagination
/>

{selected.length > 0 && (
  <div>
    Total Selected Gross Sales: $
    {selected.reduce((sum, team) => sum + team.GrossSales, 0).toLocaleString()}
  </div>
)}
```

## 🎨 Visual Features

### Currency Formatting
```
GrossSales: 840517.74  →  $840,517.74
NetSales: 836417.54    →  $836,417.54
```

### Negative Values (Red Color)
```
SalesReturn: -4100.2   →  -$4,100.20  (in red)
```

### Number Alignment
```
Sales Team              │ Gross Sales     (All numbers right-aligned)
─────────────────────   │  ──────────
Elbrit Coimbatore       │  $840,517.74
CND Coimbatore          │  $762,754.14
Aura & Proxima +        │  $524,123.45
```

### Filter Row
```
┌──────────────┬──────────┬──────────┐
│ Sales Team ▲ │ Target ▲ │  Sales ▲ │  ← Sortable headers
├──────────────┼──────────┼──────────┤
│ [Filter...] │[Filter..] │[Filter..]│  ← Filter inputs
├──────────────┼──────────┼──────────┤
│ Elbrit...    │    0.00  │ $840...  │
└──────────────┴──────────┴──────────┘
```

## 📱 Responsive Behavior

### Desktop (Full View)
- All columns visible
- Comfortable spacing (1rem padding)
- Easy to read (0.875rem font)

### Tablet
- Horizontal scroll for many columns
- Optimized spacing (0.75rem padding)
- Clear text (0.8125rem font)

### Mobile
- Compact view (0.5rem padding)
- Horizontal scroll
- Fixed first column
- Smaller text (0.75rem font)

## 🔧 Customization Options

### Hide Specific Columns
```jsx
const columns = [
  { key: 'SalesTeam', title: 'Sales Team' },
  { key: 'GrossSales', title: 'Gross Sales' },
  { key: 'NetSales', title: 'Net Sales' },
  // Exclude: ExpiryReturn, Breakage, Claim (by not including them)
];
```

### Custom Column Order
```jsx
const columns = [
  { key: 'SalesTeam', title: 'Team' },          // First
  { key: 'IncentiveValue', title: 'Incentive' }, // Second
  { key: 'NetSales', title: 'Net Sales' },       // Third
  // ... custom order
];
```

### Conditional Formatting
```jsx
{
  key: 'NetSales',
  title: 'Net Sales',
  render: (value, row) => {
    const isHigh = value > 800000;
    return (
      <span style={{ 
        fontWeight: isHigh ? 700 : 400,
        color: isHigh ? '#2e7d32' : 'inherit',
        backgroundColor: isHigh ? '#e8f5e9' : 'transparent',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem'
      }}>
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </span>
    );
  }
}
```

## ⚡ Performance

With your data (22 sales teams):
- ✅ **Instant rendering** - No lag
- ✅ **Smooth expand/collapse** - No delay
- ✅ **Fast filtering** - Real-time results
- ✅ **Quick sorting** - Immediate updates
- ✅ **Efficient pagination** - Only renders visible rows

Even with 100+ teams:
- Still smooth and responsive
- Pagination keeps it fast
- Virtual scrolling for 1000+ rows

## 🎯 Best Practices

1. **Use Custom Columns** for better formatting:
   ```jsx
   // ✅ Good
   { key: 'GrossSales', render: (v) => formatCurrency(v) }
   
   // ❌ Less ideal
   { key: 'GrossSales' } // Auto-formatted but less control
   ```

2. **Set Proper Data Key** for unique identification:
   ```jsx
   <MaterialDataTable
     data={data}
     dataKey="SalesTeam"  // Use SalesTeam as unique identifier
     // or add an id field
   />
   ```

3. **Enable Features Selectively**:
   ```jsx
   <MaterialDataTable
     showFilters={true}      // ✅ Enable if needed
     pagination={true}       // ✅ For large datasets
     selectable={false}      // ❌ Disable if not needed
     exportFilename="sales.csv"
   />
   ```

## 🚀 Ready to Use!

See complete examples in:
- `components/MaterialDataTable.salesExample.js`
- Use in Plasmic: Look for "Material-UI Data Table"
- Drag, drop, bind your sales data!

Your nested HQs data will automatically expand/collapse beautifully! 🎉

