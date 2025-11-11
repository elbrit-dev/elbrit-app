// Example usage of MaterialDataTable component
import React, { useState } from 'react';
import MaterialDataTable from './MaterialDataTable';

// Example 1: Simple table with auto-generated columns
export const SimpleExample = () => {
  const data = [
    { id: 1, name: 'John Doe', age: 30, city: 'New York', salary: 75000 },
    { id: 2, name: 'Jane Smith', age: 25, city: 'London', salary: 65000 },
    { id: 3, name: 'Bob Johnson', age: 35, city: 'Paris', salary: 85000 },
    { id: 4, name: 'Alice Brown', age: 28, city: 'Tokyo', salary: 70000 },
    { id: 5, name: 'Charlie Wilson', age: 32, city: 'Sydney', salary: 80000 },
  ];

  return (
    <MaterialDataTable
      data={data}
      title="Employee Directory"
      pagination
      showFilters
      dense={false}
    />
  );
};

// Example 2: Table with custom columns and formatting
export const CustomColumnsExample = () => {
  const data = [
    { id: 1, product: 'Laptop', price: 999.99, stock: 5, category: 'Electronics' },
    { id: 2, product: 'Mouse', price: 29.99, stock: 150, category: 'Electronics' },
    { id: 3, product: 'Desk', price: 299.99, stock: 12, category: 'Furniture' },
    { id: 4, product: 'Chair', price: 199.99, stock: 8, category: 'Furniture' },
    { id: 5, product: 'Monitor', price: 349.99, stock: 25, category: 'Electronics' },
  ];

  const columns = [
    {
      key: 'product',
      title: 'Product Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      align: 'right',
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      key: 'stock',
      title: 'In Stock',
      sortable: true,
      align: 'right',
      render: (value) => {
        const color = value < 10 ? 'red' : value < 50 ? 'orange' : 'green';
        return <span style={{ color, fontWeight: 600 }}>{value}</span>;
      },
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      filterable: true,
    },
  ];

  return (
    <MaterialDataTable
      data={data}
      columns={columns}
      title="Product Inventory"
      pagination
      showFilters
      exportFilename="products.csv"
    />
  );
};

// Example 3: Table with nested data (expandable rows)
export const ExpandableExample = () => {
  const data = [
    {
      id: 1,
      customer: 'Acme Corp',
      email: 'contact@acme.com',
      totalOrders: 3,
      totalValue: 5000,
      orders: [
        { orderId: 'ORD-001', date: '2025-01-01', amount: 2000, status: 'Delivered' },
        { orderId: 'ORD-002', date: '2025-01-15', amount: 1500, status: 'Processing' },
        { orderId: 'ORD-003', date: '2025-02-01', amount: 1500, status: 'Pending' },
      ]
    },
    {
      id: 2,
      customer: 'Tech Solutions Inc',
      email: 'info@techsolutions.com',
      totalOrders: 2,
      totalValue: 8000,
      orders: [
        { orderId: 'ORD-004', date: '2025-01-20', amount: 3000, status: 'Delivered' },
        { orderId: 'ORD-005', date: '2025-02-10', amount: 5000, status: 'Delivered' },
      ]
    },
    {
      id: 3,
      customer: 'Global Enterprises',
      email: 'sales@globalent.com',
      totalOrders: 1,
      totalValue: 12000,
      orders: [
        { orderId: 'ORD-006', date: '2025-02-15', amount: 12000, status: 'Processing' },
      ]
    },
  ];

  const columns = [
    {
      key: 'customer',
      title: 'Customer Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      filterable: true,
    },
    {
      key: 'totalOrders',
      title: 'Orders',
      sortable: true,
      align: 'right',
    },
    {
      key: 'totalValue',
      title: 'Total Value',
      sortable: true,
      align: 'right',
      render: (value) => `$${value.toLocaleString()}`,
    },
  ];

  return (
    <MaterialDataTable
      data={data}
      columns={columns}
      expandable
      nestedKey="orders"
      title="Customer Orders"
      pagination
      showFilters
      onRowClick={(row) => console.log('Clicked customer:', row)}
    />
  );
};

// Example 4: Table with row selection
export const SelectableExample = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  const data = [
    { id: 1, name: 'Task 1', priority: 'High', status: 'In Progress', assignee: 'John' },
    { id: 2, name: 'Task 2', priority: 'Medium', status: 'Pending', assignee: 'Jane' },
    { id: 3, name: 'Task 3', priority: 'Low', status: 'Completed', assignee: 'Bob' },
    { id: 4, name: 'Task 4', priority: 'High', status: 'In Progress', assignee: 'Alice' },
    { id: 5, name: 'Task 5', priority: 'Medium', status: 'Pending', assignee: 'Charlie' },
  ];

  const columns = [
    {
      key: 'name',
      title: 'Task Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'priority',
      title: 'Priority',
      sortable: true,
      filterable: true,
      render: (value) => {
        const colors = { High: 'red', Medium: 'orange', Low: 'green' };
        return (
          <span style={{ 
            color: colors[value], 
            fontWeight: 600,
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            backgroundColor: `${colors[value]}22`
          }}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
    },
    {
      key: 'assignee',
      title: 'Assigned To',
      sortable: true,
      filterable: true,
    },
  ];

  return (
    <div>
      <MaterialDataTable
        data={data}
        columns={columns}
        selectable
        onSelectionChange={setSelectedRows}
        title={`Tasks (${selectedRows.length} selected)`}
        pagination
        showFilters
      />
      
      {selectedRows.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '0.5rem' }}>
          <h3>Selected Tasks:</h3>
          <ul>
            {selectedRows.map((row) => (
              <li key={row.id}>{row.name} - {row.status}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Example 5: Dense table for compact display
export const DenseExample = () => {
  const data = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    code: `ITEM-${String(i + 1).padStart(3, '0')}`,
    description: `Item description ${i + 1}`,
    quantity: Math.floor(Math.random() * 100) + 1,
    unit: ['pcs', 'kg', 'liters', 'boxes'][Math.floor(Math.random() * 4)],
  }));

  return (
    <MaterialDataTable
      data={data}
      title="Inventory Items (Dense)"
      pagination
      showFilters
      dense
      rowsPerPage={25}
      rowsPerPageOptions={[10, 25, 50, 100]}
    />
  );
};

// Example 6: Large dataset with custom page sizes
export const LargeDatasetExample = () => {
  const data = Array.from({ length: 500 }, (_, i) => ({
    id: i + 1,
    reference: `REF-${String(i + 1).padStart(4, '0')}`,
    date: new Date(2025, 0, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    amount: Math.floor(Math.random() * 10000) + 100,
    customer: ['Customer A', 'Customer B', 'Customer C', 'Customer D'][Math.floor(Math.random() * 4)],
    status: ['Active', 'Pending', 'Completed', 'Cancelled'][Math.floor(Math.random() * 4)],
  }));

  return (
    <MaterialDataTable
      data={data}
      title="Transactions"
      pagination
      showFilters
      rowsPerPage={50}
      rowsPerPageOptions={[25, 50, 100, 200]}
    />
  );
};

// Example 7: Table with custom styling
export const CustomStyledExample = () => {
  const data = [
    { id: 1, brand: 'Apple', model: 'iPhone 15', price: 999, rating: 4.8 },
    { id: 2, brand: 'Samsung', model: 'Galaxy S24', price: 899, rating: 4.7 },
    { id: 3, brand: 'Google', model: 'Pixel 8', price: 699, rating: 4.6 },
    { id: 4, brand: 'OnePlus', model: '12 Pro', price: 799, rating: 4.5 },
  ];

  return (
    <MaterialDataTable
      data={data}
      title="📱 Smartphones"
      pagination={false}
      showFilters
      className="custom-phone-table"
      style={{ 
        maxWidth: '60rem', 
        margin: '2rem auto',
        boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
      }}
    />
  );
};

// Complete demo page showing all examples
export const AllExamples = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '100rem', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '3rem' }}>MaterialDataTable Examples</h1>
      
      <section style={{ marginBottom: '4rem' }}>
        <h2>1. Simple Table</h2>
        <SimpleExample />
      </section>
      
      <section style={{ marginBottom: '4rem' }}>
        <h2>2. Custom Columns with Formatting</h2>
        <CustomColumnsExample />
      </section>
      
      <section style={{ marginBottom: '4rem' }}>
        <h2>3. Expandable Rows (Nested Data)</h2>
        <ExpandableExample />
      </section>
      
      <section style={{ marginBottom: '4rem' }}>
        <h2>4. Row Selection</h2>
        <SelectableExample />
      </section>
      
      <section style={{ marginBottom: '4rem' }}>
        <h2>5. Dense Table</h2>
        <DenseExample />
      </section>
      
      <section style={{ marginBottom: '4rem' }}>
        <h2>6. Large Dataset</h2>
        <LargeDatasetExample />
      </section>
      
      <section style={{ marginBottom: '4rem' }}>
        <h2>7. Custom Styled Table</h2>
        <CustomStyledExample />
      </section>
    </div>
  );
};

export default AllExamples;

