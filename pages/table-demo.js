import React, { useState, useCallback } from 'react';
import AdvancedTable from '../components/AdvancedTable';
import PrimeReactAdvancedTable from '../components/PrimeReactAdvancedTable';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw,
  Plus,
  Star,
  Heart,
  Share2,
  Bookmark,
  Copy,
  ExternalLink
} from 'lucide-react';

const TableDemo = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [customTableData, setCustomTableData] = useState([]);
  const [primeTableData, setPrimeTableData] = useState([]);

  // Sample data for both tables
  const sampleData = [
    { 
      id: 1, 
      name: "John Doe", 
      email: "john@example.com", 
      role: "Admin", 
      status: "Active",
      department: "Engineering",
      salary: 75000,
      location: "New York",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      createdAt: "2024-01-15",
      lastLogin: "2024-01-20T10:30:00Z",
      rating: 4.5,
      projects: 12,
      skills: ["React", "Node.js", "TypeScript"],
      tags: ["Senior", "Full-stack"],
      isFavorite: true
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      email: "jane@example.com", 
      role: "Manager", 
      status: "Active",
      department: "Marketing",
      salary: 65000,
      location: "San Francisco",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      createdAt: "2024-01-10",
      lastLogin: "2024-01-19T14:15:00Z",
      rating: 4.8,
      projects: 8,
      skills: ["Marketing", "Analytics", "SEO"],
      tags: ["Manager", "Creative"],
      isFavorite: false
    },
    { 
      id: 3, 
      name: "Bob Johnson", 
      email: "bob@example.com", 
      role: "User", 
      status: "Inactive",
      department: "Sales",
      salary: 55000,
      location: "Chicago",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      createdAt: "2023-12-20",
      lastLogin: "2024-01-05T09:45:00Z",
      rating: 3.9,
      projects: 15,
      skills: ["Sales", "CRM", "Negotiation"],
      tags: ["Sales", "Experienced"],
      isFavorite: true
    },
    { 
      id: 4, 
      name: "Alice Brown", 
      email: "alice@example.com", 
      role: "Manager", 
      status: "Active",
      department: "Engineering",
      salary: 85000,
      location: "Seattle",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      createdAt: "2023-11-30",
      lastLogin: "2024-01-20T16:20:00Z",
      rating: 4.7,
      projects: 20,
      skills: ["Python", "Machine Learning", "Data Science"],
      tags: ["Lead", "Expert"],
      isFavorite: true
    },
    { 
      id: 5, 
      name: "Charlie Wilson", 
      email: "charlie@example.com", 
      role: "User", 
      status: "Pending",
      department: "Support",
      salary: 60000,
      location: "Austin",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      createdAt: "2024-01-18",
      lastLogin: null,
      rating: 4.2,
      projects: 6,
      skills: ["Customer Support", "Technical Writing"],
      tags: ["Junior", "Support"],
      isFavorite: false
    }
  ];

  // Load sample data
  React.useEffect(() => {
    setCustomTableData(sampleData);
    setPrimeTableData(sampleData);
  }, []);

  // Event handlers
  const handleRowClick = useCallback((row, index) => {
    console.log('Row clicked:', row, index);
  }, []);

  const handleExport = useCallback((data, format) => {
    console.log('Exporting data:', data, format);
  }, []);

  const handleRefresh = useCallback(async () => {
    console.log('Refreshing data...');
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
  }, []);

  const handleAdd = useCallback(() => {
    console.log('Adding new item...');
  }, []);

  const handleEdit = useCallback((row) => {
    console.log('Editing row:', row);
  }, []);

  const handleDelete = useCallback((row) => {
    console.log('Deleting row:', row);
  }, []);

  const handleView = useCallback((row) => {
    console.log('Viewing row:', row);
  }, []);

  const handleBulkAction = useCallback((action, selectedRows) => {
    console.log('Bulk action:', action, selectedRows);
  }, []);

  // Row actions for both tables
  const rowActions = [
    {
      title: 'View',
      icon: <Eye size={16} />,
      onClick: handleView,
      type: 'view'
    },
    {
      title: 'Edit',
      icon: <Edit size={16} />,
      onClick: handleEdit,
      type: 'edit'
    },
    {
      title: 'Delete',
      icon: <Trash2 size={16} />,
      onClick: handleDelete,
      type: 'delete',
      severity: 'danger'
    },
    {
      title: 'Share',
      icon: <Share2 size={16} />,
      onClick: (row) => console.log('Sharing:', row)
    },
    {
      title: 'Bookmark',
      icon: <Bookmark size={16} />,
      onClick: (row) => console.log('Bookmarking:', row)
    },
    {
      title: 'Copy',
      icon: <Copy size={16} />,
      onClick: (row) => console.log('Copying:', row)
    }
  ];

  // Bulk actions
  const bulkActions = [
    {
      title: 'Delete Selected',
      icon: <Trash2 size={16} />,
      onClick: () => console.log('Bulk delete'),
      severity: 'danger'
    },
    {
      title: 'Export Selected',
      icon: <Download size={16} />,
      onClick: () => console.log('Bulk export')
    }
  ];

  // Custom columns for PrimeReact table
  const primeColumns = [
    {
      field: 'avatar',
      header: 'Avatar',
      type: 'image',
      style: { width: '80px' }
    },
    {
      field: 'name',
      header: 'Name',
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      field: 'email',
      header: 'Email',
      type: 'email',
      sortable: true,
      filterable: true
    },
    {
      field: 'role',
      header: 'Role',
      type: 'select',
      sortable: true,
      filterable: true,
      options: [
        { label: 'Admin', value: 'Admin' },
        { label: 'Manager', value: 'Manager' },
        { label: 'User', value: 'User' }
      ]
    },
    {
      field: 'status',
      header: 'Status',
      type: 'select',
      sortable: true,
      filterable: true,
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Pending', value: 'Pending' }
      ]
    },
    {
      field: 'department',
      header: 'Department',
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      field: 'salary',
      header: 'Salary',
      type: 'number',
      sortable: true,
      filterable: true
    },
    {
      field: 'location',
      header: 'Location',
      type: 'text',
      sortable: true,
      filterable: true
    },
    {
      field: 'rating',
      header: 'Rating',
      type: 'number',
      sortable: true,
      filterable: true
    },
    {
      field: 'projects',
      header: 'Projects',
      type: 'number',
      sortable: true,
      filterable: true
    },
    {
      field: 'skills',
      header: 'Skills',
      type: 'array',
      sortable: false,
      filterable: false
    },
    {
      field: 'tags',
      header: 'Tags',
      type: 'array',
      sortable: false,
      filterable: false
    },
    {
      field: 'isFavorite',
      header: 'Favorite',
      type: 'boolean',
      sortable: true,
      filterable: true
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          Advanced Table Components Demo
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
          Compare our custom AdvancedTable with PrimeReact's DataTable implementation
        </p>
      </div>

      <TabView 
        activeIndex={activeTab} 
        onTabChange={(e) => setActiveTab(e.index)}
        style={{ marginBottom: '24px' }}
      >
        <TabPanel header="Custom AdvancedTable">
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                Custom AdvancedTable Component
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Our custom-built table component with advanced features
              </p>
            </div>
            
            <AdvancedTable
              data={customTableData}
              loading={false}
              enableSearch={true}
              enableColumnFilter={true}
              enableSorting={true}
              enablePagination={true}
              enableRowSelection={true}
              enableExport={true}
              enableRefresh={true}
              enableRowActions={true}
              pageSize={10}
              tableHeight="500px"
              onRowClick={handleRowClick}
              onExport={handleExport}
              onRefresh={handleRefresh}
              rowActions={rowActions}
              bulkActions={bulkActions}
              imageFields={['avatar']}
              popupImageFields={['avatar']}
              theme="default"
            />
          </Card>
        </TabPanel>

        <TabPanel header="PrimeReact DataTable">
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                PrimeReact AdvancedTable Component
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Advanced table built with PrimeReact DataTable library
              </p>
            </div>
            
            <PrimeReactAdvancedTable
              data={primeTableData}
              columns={primeColumns}
              loading={false}
              enableSearch={true}
              enableColumnFilter={true}
              enableSorting={true}
              enablePagination={true}
              enableRowSelection={true}
              enableExport={true}
              enableRefresh={true}
              enableRowActions={true}
              enableGlobalFilter={true}
              showColumnFilters={true}
              showToolbar={true}
              showStatusBar={true}
              showTitle={false}
              pageSize={10}
              tableHeight="500px"
              title="PrimeReact Advanced Table"
              onRowClick={handleRowClick}
              onExport={handleExport}
              onRefresh={handleRefresh}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onBulkAction={handleBulkAction}
              rowActions={rowActions}
              bulkActions={bulkActions}
              imageFields={['avatar']}
              popupImageFields={['avatar']}
              exportFormats={['csv', 'excel', 'pdf']}
              exportFileName="prime-react-table-data"
              globalFilterPlaceholder="Search all data..."
              filterPlaceholder="Filter..."
            />
          </Card>
        </TabPanel>

        <TabPanel header="Comparison">
          <Card>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                Feature Comparison
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Compare the features and capabilities of both table components
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
                  Feature
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Search & Filtering</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Sorting</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Pagination</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Row Selection</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Export</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Row Actions</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Bulk Actions</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Column Management</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Image Support</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Themes</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Loading States</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Error Handling</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Responsive Design</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Accessibility</span>
                  <span style={{ fontSize: '14px', color: '#374151' }}>Bundle Size</span>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
                  Custom Table
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Advanced</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Multi-column</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Configurable</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Checkbox</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ CSV</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Custom</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Multiple</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Show/Hide</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Popup Modal</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ 3 Themes</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Custom</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Toast</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Mobile</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ ARIA</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>Small</span>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
                  PrimeReact Table
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Built-in</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Advanced</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Lazy</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Multiple</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Multiple</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Menu</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Custom</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Dialog</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Modal</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Multiple</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Built-in</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Toast</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ Built-in</span>
                  <span style={{ fontSize: '14px', color: '#059669' }}>✅ WCAG</span>
                  <span style={{ fontSize: '14px', color: '#dc2626' }}>Larger</span>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                Summary
              </h4>
              <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                <strong>Custom Table:</strong> Lightweight, highly customizable, perfect for specific requirements. 
                <br />
                <strong>PrimeReact Table:</strong> Feature-rich, production-ready, extensive component library with built-in accessibility and theming.
              </p>
            </div>
          </Card>
        </TabPanel>
      </TabView>
    </div>
  );
};

export default TableDemo; 