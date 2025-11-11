# Custom DataTable Integration Guide

Quick guide to integrate the custom data tables into your existing Next.js/Plasmic application.

## 🎯 Quick Setup

### Step 1: Import the Component

```jsx
import CustomDataTable from '@/components/CustomDataTable';
// or
import CompactDataTable from '@/components/CompactDataTable';
```

### Step 2: Prepare Your Data

```jsx
// Example: Transform your existing data
const data = $queries.salesData.data?.response?.data || [];

// Ensure data has the right structure
const tableData = data.map(item => ({
  id: item.id,
  salesTeam: item.sales_team,
  brand: item.brand_name,
  target: item.target_amount,
  // Add nested items if available
  items: item.invoices || []
}));
```

### Step 3: Define Columns

```jsx
const columns = [
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
    formatter: (value) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(value);
    }
  }
];
```

### Step 4: Render the Table

```jsx
<CustomDataTable
  data={tableData}
  columns={columns}
  rowKey="id"
  nestedKey="items"
  enableExpansion={true}
  enableSearch={true}
  enableExport={true}
  enableFilters={true}
  enableSorting={true}
/>
```

---

## 🔄 Migrating from PrimeDataTable

### Before (PrimeDataTable)

```jsx
<PrimeDataTable
  data={$queries.salesData.data}
  enableColumnFilter={true}
  enableSorting={true}
  enablePagination={true}
  columns={[
    { key: 'salesTeam', title: 'Sales Team' },
    { key: 'target', title: 'Target' }
  ]}
/>
```

### After (CustomDataTable)

```jsx
<CustomDataTable
  data={$queries.salesData.data}
  enableFilters={true}
  enableSorting={true}
  columns={[
    { key: 'salesTeam', title: 'Sales Team' },
    { 
      key: 'target', 
      title: 'Target',
      formatter: (val) => val.toLocaleString()
    }
  ]}
/>
```

---

## 📊 Real-World Examples

### Example 1: Sales Team Performance (From Your Image)

```jsx
import React from 'react';
import CustomDataTable from '@/components/CustomDataTable';

const SalesPerformancePage = () => {
  // Your sales data
  const salesData = [
    {
      id: 1,
      salesTeam: 'Elbit Rajasthan',
      brand: 'PREGABRIT',
      target: 2100000,
      jan: 2100000,
      feb: 2100000,
      mar: 2100000,
      apr: 2100000,
      may: 2100000,
      jun: 2100000,
      jul: 2100000,
      aug: 2100000,
      sep: 2100000,
      oct: 2100000,
      // Nested invoice details
      items: [
        {
          id: 'inv-1',
          invoiceNo: 'INV-001',
          customer: 'ABC Hospital',
          amount: 500000,
          date: '2024-01-15',
          status: 'Paid'
        },
        {
          id: 'inv-2',
          invoiceNo: 'INV-002',
          customer: 'XYZ Clinic',
          amount: 600000,
          date: '2024-01-20',
          status: 'Pending'
        }
      ]
    },
    // ... more teams
  ];

  const columns = [
    {
      key: 'salesTeam',
      title: 'Sales Team',
      sortable: true,
      filterable: true,
      align: 'left'
    },
    {
      key: 'brand',
      title: 'Brand',
      sortable: true,
      filterable: true,
      align: 'left'
    },
    {
      key: 'target',
      title: 'Target',
      sortable: true,
      align: 'right',
      formatter: (value) => `₹${value.toLocaleString()}`
    },
    ...['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct'].map(month => ({
      key: month,
      title: month.charAt(0).toUpperCase() + month.slice(1),
      sortable: true,
      align: 'right',
      formatter: (value) => value.toLocaleString()
    }))
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        Sales Team Performance
      </h1>
      
      <CustomDataTable
        data={salesData}
        columns={columns}
        rowKey="id"
        nestedKey="items"
        enableExpansion={true}
        enableSearch={true}
        enableExport={true}
        enableFilters={true}
        enableSorting={true}
        tableHeight="70vh"
      />
    </div>
  );
};

export default SalesPerformancePage;
```

### Example 2: Invoice/Voucher Table (From Your Image)

```jsx
import React from 'react';
import CustomDataTable from '@/components/CustomDataTable';

const InvoiceTable = () => {
  const invoices = [
    {
      id: 1,
      voucherType: 'Payment',
      voucher: 'CN-MW25-001',
      postingDate: '11-10-2024',
      customer: 'Nataraj Agency',
      customerNo: '12345',
      customerGroup: 'CFA Chennai',
      territory: 'HQ - Vellore',
      taxCategory: 'GST'
    },
    // ... more invoices
  ];

  const columns = [
    {
      key: 'voucherType',
      title: 'Voucher Type',
      sortable: true,
      filterable: true
    },
    {
      key: 'voucher',
      title: 'Voucher',
      sortable: true,
      filterable: true
    },
    {
      key: 'postingDate',
      title: 'Posting Date',
      sortable: true,
      filterable: true
    },
    {
      key: 'customer',
      title: 'Customer',
      sortable: true,
      filterable: true
    },
    {
      key: 'customerNo',
      title: 'Customer No',
      sortable: true,
      filterable: true
    },
    {
      key: 'customerGroup',
      title: 'Customer Group',
      sortable: true,
      filterable: true
    },
    {
      key: 'territory',
      title: 'Territory',
      sortable: true,
      filterable: true
    },
    {
      key: 'taxCategory',
      title: 'Tax Category',
      sortable: true,
      filterable: true
    }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <CustomDataTable
        data={invoices}
        columns={columns}
        enableExpansion={false}
        enableSearch={true}
        enableExport={true}
        enableFilters={true}
        enableSorting={true}
      />
    </div>
  );
};

export default InvoiceTable;
```

---

## 🎨 Styling Integration

### Match Your App's Theme

```jsx
<CustomDataTable
  data={data}
  columns={columns}
  customStyles={{
    toolbar: {
      backgroundColor: '#your-brand-color',
      borderColor: '#your-border-color'
    },
    th: {
      backgroundColor: '#your-header-bg',
      color: '#your-header-text'
    }
  }}
/>
```

### Use with Tailwind CSS

```jsx
<div className="container mx-auto p-8">
  <CustomDataTable
    data={data}
    columns={columns}
    customStyles={{
      container: {
        maxWidth: '100%'
      }
    }}
  />
</div>
```

---

## 🔗 Plasmic Integration

### Register as Plasmic Component

```jsx
// plasmic-init.js or components/plasmic.js
import { registerComponent } from '@plasmicapp/host';
import CustomDataTable from './components/CustomDataTable';

registerComponent(CustomDataTable, {
  name: 'CustomDataTable',
  props: {
    data: {
      type: 'object',
      defaultValue: []
    },
    columns: {
      type: 'object',
      defaultValue: []
    },
    enableExpansion: {
      type: 'boolean',
      defaultValue: true
    },
    enableSearch: {
      type: 'boolean',
      defaultValue: true
    },
    enableFilters: {
      type: 'boolean',
      defaultValue: true
    },
    enableSorting: {
      type: 'boolean',
      defaultValue: true
    },
    enableExport: {
      type: 'boolean',
      defaultValue: true
    }
  }
});
```

### Use in Plasmic Studio

1. Add `CustomDataTable` component from component panel
2. Connect to your data query: `$queries.yourQuery.data`
3. Define columns in the props panel
4. Enable/disable features as needed

---

## 🚀 Performance Optimization

### For Large Datasets (1000+ rows)

```jsx
import { useMemo } from 'react';

const MyTable = () => {
  // Memoize data transformation
  const tableData = useMemo(() => {
    return rawData.map(item => ({
      id: item.id,
      // ... transform data
    }));
  }, [rawData]);

  // Memoize columns
  const columns = useMemo(() => [
    { key: 'name', title: 'Name' },
    // ... define columns
  ], []);

  return (
    <CustomDataTable
      data={tableData}
      columns={columns}
    />
  );
};
```

### Enable Pagination (Coming Soon)

For now, you can paginate data before passing to table:

```jsx
const [page, setPage] = useState(1);
const pageSize = 50;

const paginatedData = useMemo(() => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
}, [data, page, pageSize]);

<CustomDataTable data={paginatedData} columns={columns} />
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Data Not Showing

**Problem**: Table shows "No data found"

**Solution**: 
```jsx
// Check data structure
console.log('Data:', data);

// Ensure data is array
const safeData = Array.isArray(data) ? data : [];

<CustomDataTable data={safeData} columns={columns} />
```

### Issue 2: Columns Not Matching

**Problem**: Columns show wrong data

**Solution**:
```jsx
// Ensure column keys match data field names exactly
const columns = [
  { key: 'salesTeam', title: 'Sales Team' } // Must match data.salesTeam
];
```

### Issue 3: Nested Rows Not Expanding

**Problem**: Click does nothing

**Solution**:
```jsx
// Verify nestedKey matches your data structure
const data = [
  {
    id: 1,
    name: 'John',
    items: [...] // Must match nestedKey prop
  }
];

<CustomDataTable
  data={data}
  nestedKey="items"  // Must match field name
/>
```

### Issue 4: Formatting Not Applied

**Problem**: Numbers show without formatting

**Solution**:
```jsx
// Use formatter function
{
  key: 'amount',
  title: 'Amount',
  formatter: (value) => {
    // Ensure value is number
    const num = Number(value) || 0;
    return num.toLocaleString();
  }
}
```

---

## 📦 Bundle Size

| Component | Minified | Gzipped |
|-----------|----------|---------|
| CustomDataTable | ~15KB | ~5KB |
| CompactDataTable | ~8KB | ~3KB |

**Note**: No external dependencies required (except React)!

---

## ✅ Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Safari 14+
- Chrome Mobile 90+

**Note**: Uses modern CSS (sticky, flexbox, grid) - no IE11 support

---

## 🎓 Next Steps

1. ✅ Copy components to your project
2. ✅ Try the basic example
3. ✅ Customize columns for your data
4. ✅ Add custom formatters
5. ✅ Style to match your brand
6. ✅ Register in Plasmic (optional)
7. ✅ Deploy and test

---

## 💡 Tips & Best Practices

### 1. Keep Column Keys Simple
```jsx
// ❌ Bad
{ key: 'user.profile.name', title: 'Name' }

// ✅ Good - flatten data first
const flatData = data.map(item => ({
  userName: item.user?.profile?.name
}));
{ key: 'userName', title: 'Name' }
```

### 2. Use Memoization for Expensive Formatters
```jsx
const formatCurrency = useMemo(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });
}, []);

{
  key: 'amount',
  formatter: (value) => formatCurrency.format(value)
}
```

### 3. Provide Default Values
```jsx
const tableData = data || [];
const tableColumns = columns || [];

<CustomDataTable
  data={tableData}
  columns={tableColumns}
/>
```

### 4. Handle Loading States
```jsx
{isLoading ? (
  <div>Loading...</div>
) : (
  <CustomDataTable data={data} columns={columns} />
)}
```

---

## 🆘 Need Help?

1. Check the [README](./CUSTOM_DATATABLE_README.md)
2. Review [examples](./CustomDataTableExample.js)
3. Try the [compact version](./CompactDataTable.js)
4. Review your browser console for errors

---

**Happy Coding! 🎉**

