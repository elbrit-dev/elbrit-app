import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Chip } from 'primereact/chip';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Menu } from 'primereact/menu';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  MoreVertical,
  Settings,
  Columns,
  SortAsc,
  SortDesc,
  Calendar as CalendarIcon,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Heart,
  Share2,
  Bookmark,
  Copy,
  ExternalLink
} from 'lucide-react';

const PrimeReactAdvancedTable = ({
  // Data props
  data = [],
  columns = [],
  loading = false,
  error = null,
  fields = [],
  imageFields = [],
  popupImageFields = [],
  
  // GraphQL props
  graphqlQuery = null,
  graphqlVariables = {},
  onGraphqlData,
  refetchInterval = 0,
  
  // Table configuration
  enableSearch = true,
  enableColumnFilter = true,
  enableSorting = true,
  enablePagination = true,
  enableRowSelection = false,
  enableExport = true,
  enableRefresh = false,
  enableColumnManagement = true,
  enableBulkActions = false,
  enableGlobalFilter = true,
  enableRowActions = false,
  
  // Pagination
  pageSize = 10,
  currentPage = 1,
  pageSizeOptions = [5, 10, 25, 50, 100],
  
  // Styling
  className = "",
  style = {},
  tableHeight = "600px",
  theme = "default", // default, dark, minimal
  
  // Event handlers
  onRowClick,
  onRowSelect,
  onExport,
  onRefresh,
  onPageChange,
  onFilterChange,
  onSortChange,
  onSearch,
  onBulkAction,
  onAdd,
  onEdit,
  onDelete,
  onView,
  
  // Action buttons
  rowActions = [],
  bulkActions = [],
  
  // Custom props
  title = "Advanced Data Table",
  showTitle = true,
  showToolbar = true,
  showStatusBar = true,
  showRowCount = true,
  showSelectedCount = true,
  showExportOptions = true,
  showColumnToggle = true,
  showGlobalFilter = true,
  showColumnFilters = true,
  showBulkActions = true,
  showRowActions = true,
  
  // Export options
  exportFormats = ['csv', 'excel', 'pdf'],
  exportFileName = 'table-data',
  
  // Filter options
  globalFilterPlaceholder = "Search all data...",
  filterPlaceholder = "Filter...",
  
  // Custom renderers
  customRenderers = {},
  
  // Status options
  statusOptions = [
    { label: 'Active', value: 'active', severity: 'success' },
    { label: 'Inactive', value: 'inactive', severity: 'danger' },
    { label: 'Pending', value: 'pending', severity: 'warning' },
    { label: 'Draft', value: 'draft', severity: 'info' }
  ],
  
  // Role options
  roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'User', value: 'user' },
    { label: 'Guest', value: 'guest' }
  ]
}) => {
  // Local state
  const [filters, setFilters] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(pageSize);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState('');
  const [imageModalAlt, setImageModalAlt] = useState('');
  const [toast, setToast] = useState(null);
  const [overlayPanel, setOverlayPanel] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);

  // GraphQL data simulation
  const [graphqlData, setGraphqlData] = useState([]);
  const [graphqlLoading, setGraphqlLoading] = useState(false);
  const [graphqlError, setGraphqlError] = useState(null);

  // Enhanced mock GraphQL data
  useEffect(() => {
    if (graphqlQuery) {
      setGraphqlLoading(true);
      setTimeout(() => {
        try {
          const mockData = [
            { 
              id: 1, 
              name: "John Doe", 
              email: "john@example.com", 
              phone: "+1-555-0123",
              role: "admin", 
              status: "active",
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
              phone: "+1-555-0124",
              role: "manager", 
              status: "active",
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
              phone: "+1-555-0125",
              role: "user", 
              status: "inactive",
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
              phone: "+1-555-0126",
              role: "manager", 
              status: "active",
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
              phone: "+1-555-0127",
              role: "user", 
              status: "pending",
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
          setGraphqlData(mockData);
          if (onGraphqlData) {
            // Use setTimeout to prevent infinite loop
            setTimeout(() => {
              onGraphqlData(mockData);
            }, 0);
          }
        } catch (err) {
          setGraphqlError(err.message);
        } finally {
          setGraphqlLoading(false);
        }
      }, 1500);
    }
  }, [graphqlQuery, graphqlVariables]);

  // Use GraphQL data if available, otherwise use provided data
  const tableData = graphqlQuery ? graphqlData : data;
  const isLoading = graphqlQuery ? graphqlLoading : loading;
  const tableError = graphqlQuery ? graphqlError : error;

  // Initialize filters
  useEffect(() => {
    const initialFilters = {};
    if (columns.length > 0) {
      columns.forEach(column => {
        if (column.filterable !== false) {
          switch (column.type) {
            case 'text':
            case 'email':
              initialFilters[column.field] = { value: null, matchMode: FilterMatchMode.CONTAINS };
              break;
            case 'number':
              initialFilters[column.field] = { value: null, matchMode: FilterMatchMode.EQUALS };
              break;
            case 'date':
            case 'datetime':
              initialFilters[column.field] = { value: null, matchMode: FilterMatchMode.DATE_IS };
              break;
            case 'select':
              initialFilters[column.field] = { value: null, matchMode: FilterMatchMode.EQUALS };
              break;
            case 'multiselect':
              initialFilters[column.field] = { value: null, matchMode: FilterMatchMode.IN };
              break;
            default:
              initialFilters[column.field] = { value: null, matchMode: FilterMatchMode.CONTAINS };
          }
        }
      });
    }
    setFilters(initialFilters);
  }, [columns]);

  // Initialize visible columns
  useEffect(() => {
    if (columns.length > 0) {
      setVisibleColumns(columns.map(col => col.field));
    }
  }, [columns]);

  // Enhanced column generation with data type detection
  const defaultColumns = useMemo(() => {
    if (columns.length > 0) {
      return columns.filter(col => visibleColumns.includes(col.field));
    }
    
    if (tableData.length > 0) {
      const sampleRow = tableData[0];
      return Object.keys(sampleRow).map(key => {
        const value = sampleRow[key];
        let type = 'text';
        let filterMatchMode = FilterMatchMode.CONTAINS;
        
        if (typeof value === 'number') {
          type = 'number';
          filterMatchMode = FilterMatchMode.EQUALS;
        } else if (typeof value === 'boolean') {
          type = 'boolean';
          filterMatchMode = FilterMatchMode.EQUALS;
        } else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
          type = 'datetime';
          filterMatchMode = FilterMatchMode.DATE_IS;
        } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          type = 'date';
          filterMatchMode = FilterMatchMode.DATE_IS;
        } else if (typeof value === 'string' && value.includes('@')) {
          type = 'email';
          filterMatchMode = FilterMatchMode.CONTAINS;
        } else if (Array.isArray(value)) {
          type = 'array';
          filterMatchMode = FilterMatchMode.IN;
        }
        
        return {
          field: key,
          header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          sortable: true,
          filterable: true,
          type,
          filterMatchMode,
          width: type === 'email' ? '200px' : type === 'date' ? '120px' : 'auto',
          style: { minWidth: '120px' }
        };
      });
    }
    
    return [];
  }, [columns, visibleColumns, tableData.length]);

  // Filter by fields prop if provided
  const filteredColumns = useMemo(() => {
    if (fields && Array.isArray(fields) && fields.length > 0) {
      return defaultColumns.filter(col => fields.includes(col.field));
    }
    return defaultColumns;
  }, [defaultColumns, fields?.length]);

  // Event handlers
  const handleGlobalFilterChange = useCallback((e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch]);

  const handleRowSelect = useCallback((event) => {
    setSelectedRows(event.value);
    if (onRowSelect) {
      onRowSelect(event.value);
    }
  }, [onRowSelect]);

  const handlePageChange = useCallback((event) => {
    setFirst(event.first);
    setRows(event.rows);
    if (onPageChange) {
      onPageChange(Math.floor(event.first / event.rows) + 1);
    }
  }, [onPageChange]);

  const handleSort = useCallback((event) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
    if (onSortChange) {
      onSortChange(event.sortField, event.sortOrder);
    }
  }, [onSortChange]);

  const handleFilter = useCallback((event) => {
    setFilters(event.filters);
    if (onFilterChange) {
      onFilterChange(event.filters);
    }
  }, [onFilterChange]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const handleExport = useCallback((format) => {
    if (onExport) {
      onExport(tableData, format);
    } else {
      // Default export functionality
      const csvContent = [
        filteredColumns.map(col => col.header).join(','),
        ...tableData.map(row => 
          filteredColumns.map(col => `"${row[col.field] || ''}"`).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportFileName}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [onExport, tableData, filteredColumns, exportFileName]);

  const handleBulkAction = useCallback((action) => {
    if (onBulkAction) {
      onBulkAction(action, selectedRows);
    }
  }, [onBulkAction, selectedRows]);

  const handleRowAction = useCallback((action, row) => {
    switch (action.type) {
      case 'view':
        if (onView) onView(row);
        break;
      case 'edit':
        if (onEdit) onEdit(row);
        break;
      case 'delete':
        confirmDialog({
          message: `Are you sure you want to delete ${row.name || 'this item'}?`,
          header: 'Delete Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            if (onDelete) onDelete(row);
            setToast({ severity: 'success', summary: 'Success', detail: 'Item deleted successfully', life: 3000 });
          }
        });
        break;
      default:
        if (action.onClick) action.onClick(row);
    }
  }, [onView, onEdit, onDelete]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setGlobalFilterValue('');
  }, []);

  // Custom renderers
  const renderImage = useCallback((value, row) => {
    if (!value) return '-';
    
    const isPopup = popupImageFields && popupImageFields.includes(row.field);
    
    return (
      <img
        src={value}
        alt="Avatar"
        style={{ 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          cursor: isPopup ? 'pointer' : 'default',
          objectFit: 'cover'
        }}
        onClick={isPopup ? () => {
          setImageModalSrc(value);
          setImageModalAlt('Image');
          setShowImageModal(true);
        } : undefined}
      />
    );
  }, [popupImageFields]);

  const renderStatus = useCallback((value) => {
    const status = statusOptions.find(option => option.value === value);
    if (!status) return value;
    
    return (
      <Tag 
        value={status.label} 
        severity={status.severity}
        style={{ textTransform: 'capitalize' }}
      />
    );
  }, [statusOptions]);

  const renderRole = useCallback((value) => {
    const role = roleOptions.find(option => option.value === value);
    if (!role) return value;
    
    return (
      <Chip 
        label={role.label} 
        className="text-sm"
        style={{ textTransform: 'capitalize' }}
      />
    );
  }, [roleOptions]);

  const renderSkills = useCallback((value) => {
    if (!Array.isArray(value)) return value;
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {value.map((skill, index) => (
          <Tag key={index} value={skill} severity="info" style={{ fontSize: '0.75rem' }} />
        ))}
      </div>
    );
  }, []);

  const renderTags = useCallback((value) => {
    if (!Array.isArray(value)) return value;
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {value.map((tag, index) => (
          <Badge key={index} value={tag} severity="secondary" style={{ fontSize: '0.75rem' }} />
        ))}
      </div>
    );
  }, []);

  const renderRating = useCallback((value) => {
    if (!value) return '-';
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
        <span>{value}</span>
      </div>
    );
  }, []);

  const renderFavorite = useCallback((value) => {
    return (
      <Heart 
        size={16} 
        style={{ 
          color: value ? '#ef4444' : '#9ca3af',
          fill: value ? '#ef4444' : 'none',
          cursor: 'pointer'
        }} 
      />
    );
  }, []);

  const renderActions = useCallback((row) => {
    const menuItems = rowActions.map(action => ({
      label: action.title,
      icon: action.icon,
      command: () => handleRowAction(action, row)
    }));

    return (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        {rowActions.slice(0, 2).map((action, index) => (
          <Button
            key={index}
            icon={action.icon}
            size="small"
            severity={action.severity || 'secondary'}
            text
            onClick={(e) => {
              e.stopPropagation();
              handleRowAction(action, row);
            }}
            tooltip={action.title}
            tooltipOptions={{ position: 'top' }}
          />
        ))}
        
        {rowActions.length > 2 && (
          <Button
            icon={<MoreVertical size={16} />}
            size="small"
            text
            onClick={(e) => {
              e.stopPropagation();
              actionMenu.toggle(e);
            }}
            tooltip="More actions"
            tooltipOptions={{ position: 'top' }}
          />
        )}
      </div>
    );
  }, [rowActions, handleRowAction, actionMenu]);

  // Toolbar templates
  const leftToolbarTemplate = useCallback(() => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onAdd && (
          <Button
            label="Add New"
            icon={<Plus size={16} />}
            severity="success"
            onClick={onAdd}
          />
        )}
        
        {selectedRows.length > 0 && showBulkActions && bulkActions.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', padding: '8px 12px' }}>
              {selectedRows.length} selected
            </span>
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                label={action.title}
                icon={action.icon}
                severity={action.severity || 'secondary'}
                size="small"
                onClick={() => handleBulkAction(action)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }, [onAdd, selectedRows, showBulkActions, bulkActions, handleBulkAction]);

  const rightToolbarTemplate = useCallback(() => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {showColumnToggle && (
          <Button
            icon={<Columns size={16} />}
            severity="secondary"
            text
            onClick={() => setShowColumnManager(!showColumnManager)}
            tooltip="Column Management"
            tooltipOptions={{ position: 'bottom' }}
          />
        )}
        
        {showExportOptions && (
          <Dropdown
            value={null}
            options={exportFormats.map(format => ({ label: format.toUpperCase(), value: format }))}
            placeholder="Export"
            onChange={(e) => handleExport(e.value)}
            itemTemplate={(option) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={16} />
                {option.label}
              </div>
            )}
            style={{ minWidth: '120px' }}
          />
        )}
        
        {enableRefresh && (
          <Button
            icon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
            severity="secondary"
            text
            onClick={handleRefresh}
            disabled={isRefreshing}
            tooltip="Refresh"
            tooltipOptions={{ position: 'bottom' }}
          />
        )}
      </div>
    );
  }, [showColumnToggle, showColumnManager, showExportOptions, exportFormats, handleExport, enableRefresh, isRefreshing, handleRefresh]);

  // Filter templates
  const getFilterTemplate = useCallback((column) => {
    switch (column.type) {
      case 'number':
        return (
          <InputText
            placeholder={`Filter ${column.header}...`}
            onFilter={(e) => column.filterApplyCallback(e.target.value)}
            style={{ width: '100%' }}
          />
        );
      
      case 'date':
      case 'datetime':
        return (
          <Calendar
            placeholder={`Filter ${column.header}...`}
            onFilter={(e) => column.filterApplyCallback(e.value)}
            showTime={column.type === 'datetime'}
            dateFormat={column.type === 'datetime' ? 'dd/mm/yy' : 'dd/mm/yy'}
            style={{ width: '100%' }}
          />
        );
      
      case 'select':
        const options = column.options || [];
        return (
          <Dropdown
            placeholder={`Filter ${column.header}...`}
            options={options}
            onFilter={(e) => column.filterApplyCallback(e.value)}
            style={{ width: '100%' }}
          />
        );
      
      case 'multiselect':
        const multiOptions = column.options || [];
        return (
          <MultiSelect
            placeholder={`Filter ${column.header}...`}
            options={multiOptions}
            onFilter={(e) => column.filterApplyCallback(e.value)}
            style={{ width: '100%' }}
          />
        );
      
      default:
        return (
          <InputText
            placeholder={`Filter ${column.header}...`}
            onFilter={(e) => column.filterApplyCallback(e.target.value)}
            style={{ width: '100%' }}
          />
        );
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={className} style={{ ...style, padding: '64px', textAlign: 'center' }}>
        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading data...</p>
      </div>
    );
  }

  // Error state
  if (tableError) {
    return (
      <div className={className} style={style}>
        <Message 
          severity="error" 
          text={`Error: ${tableError}`}
          style={{ margin: '16px' }}
        />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <Toast ref={setToast} />
      <ConfirmDialog />
      
      {/* Title */}
      {showTitle && (
        <div style={{ 
          padding: '20px 24px 0', 
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }}>
            {title}
          </h2>
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && (
        <Toolbar
          left={leftToolbarTemplate}
          right={rightToolbarTemplate}
          style={{ 
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}
        />
      )}

      {/* Global Filter */}
      {showGlobalFilter && enableGlobalFilter && (
        <div style={{ 
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={18} style={{ color: '#6b7280' }} />
            <InputText
              value={globalFilterValue}
              onChange={handleGlobalFilterChange}
              placeholder={globalFilterPlaceholder}
              style={{ width: '300px' }}
            />
            {globalFilterValue && (
              <Button
                icon={<XCircle size={16} />}
                severity="secondary"
                text
                onClick={() => setGlobalFilterValue('')}
                tooltip="Clear search"
              />
            )}
          </div>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        value={tableData}
        paginator={enablePagination}
        rows={rows}
        first={first}
        onPage={handlePageChange}
        totalRecords={tableData.length}
        lazy={false}
        dataKey="id"
        filters={filters}
        filterDisplay={showColumnFilters ? "row" : "menu"}
        globalFilter={globalFilterValue}
        globalFilterFields={filteredColumns.map(col => col.field)}
        sortMode="single"
        removableSort={false}
        onSort={handleSort}
        onFilter={handleFilter}
        selection={enableRowSelection ? selectedRows : null}
        onSelectionChange={handleRowSelect}
        onRowClick={onRowClick ? (e) => onRowClick(e.data, e.index) : undefined}
        loading={isLoading}
        emptyMessage="No data found."
        showGridlines
        stripedRows
        size="small"
        style={{ 
          minHeight: tableHeight,
          fontSize: '14px'
        }}
        className="p-datatable-sm"
      >
        {enableRowSelection && (
          <Column 
            selectionMode="multiple" 
            headerStyle={{ width: '3rem' }}
            frozen
          />
        )}

        {filteredColumns.map((column) => {
          let bodyTemplate = null;
          
          // Custom renderer based on field type
          if (column.field === 'avatar' || (imageFields && imageFields.includes(column.field))) {
            bodyTemplate = renderImage;
          } else if (column.field === 'status') {
            bodyTemplate = renderStatus;
          } else if (column.field === 'role') {
            bodyTemplate = renderRole;
          } else if (column.field === 'skills') {
            bodyTemplate = renderSkills;
          } else if (column.field === 'tags') {
            bodyTemplate = renderTags;
          } else if (column.field === 'rating') {
            bodyTemplate = renderRating;
          } else if (column.field === 'isFavorite') {
            bodyTemplate = renderFavorite;
          } else if (customRenderers[column.field]) {
            bodyTemplate = customRenderers[column.field];
          }

          return (
            <Column
              key={column.field}
              field={column.field}
              header={column.header}
              sortable={column.sortable !== false}
              filter={column.filterable !== false}
              filterPlaceholder={filterPlaceholder}
              filterMatchMode={column.filterMatchMode || FilterMatchMode.CONTAINS}
              filterElement={getFilterTemplate(column)}
              body={bodyTemplate}
              style={column.style}
              headerStyle={{ 
                backgroundColor: '#f9fafb',
                fontWeight: '600',
                color: '#374151'
              }}
              bodyStyle={{ 
                padding: '12px 16px',
                borderBottom: '1px solid #e5e7eb'
              }}
            />
          );
        })}

        {showRowActions && rowActions.length > 0 && (
          <Column
            body={renderActions}
            header="Actions"
            headerStyle={{ 
              width: '120px',
              backgroundColor: '#f9fafb',
              fontWeight: '600',
              color: '#374151',
              textAlign: 'center'
            }}
            bodyStyle={{ 
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb',
              textAlign: 'center'
            }}
            frozen="right"
          />
        )}
      </DataTable>

      {/* Status Bar */}
      {showStatusBar && (
        <div style={{ 
          padding: '12px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            {showRowCount && (
              <span>Total: {tableData.length} records</span>
            )}
            {showSelectedCount && selectedRows.length > 0 && (
              <span>Selected: {selectedRows.length} records</span>
            )}
          </div>
          
          {enablePagination && (
            <span>
              Showing {first + 1} to {Math.min(first + rows, tableData.length)} of {tableData.length} entries
            </span>
          )}
        </div>
      )}

      {/* Column Manager Dialog */}
      <Dialog
        visible={showColumnManager}
        onHide={() => setShowColumnManager(false)}
        header="Column Management"
        style={{ width: '400px' }}
        modal
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {defaultColumns.map((column) => (
            <div key={column.field} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={visibleColumns.includes(column.field)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setVisibleColumns(prev => [...prev, column.field]);
                  } else {
                    setVisibleColumns(prev => prev.filter(col => col !== column.field));
                  }
                }}
              />
              <span>{column.header}</span>
            </div>
          ))}
        </div>
      </Dialog>

      {/* Image Modal */}
      <Dialog
        visible={showImageModal}
        onHide={() => setShowImageModal(false)}
        header="Image Preview"
        style={{ width: '80vw', maxWidth: '600px' }}
        modal
      >
        <img
          src={imageModalSrc}
          alt={imageModalAlt}
          style={{ 
            width: '100%', 
            height: 'auto',
            borderRadius: '8px'
          }}
        />
      </Dialog>

      {/* Action Menu */}
      <Menu
        ref={setActionMenu}
        popup
        model={rowActions.slice(2).map(action => ({
          label: action.title,
          icon: action.icon,
          command: () => handleRowAction(action, selectedRows[0])
        }))}
      />
    </div>
  );
};

export default PrimeReactAdvancedTable; 