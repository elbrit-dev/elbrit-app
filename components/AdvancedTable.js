import React, { useState, useMemo, useCallback, useEffect } from "react";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  RefreshCw,
  Check,
  X,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckSquare,
  Square,
  Calendar,
  Hash,
  Type,
  RotateCcw,
  Columns,
  SortAsc,
  SortDesc
} from "lucide-react";

const AdvancedTable = ({
  // Data props
  data = [],
  columns = [],
  loading = false,
  error = null,
  fields = [], // <-- Add fields prop
  imageFields = [], // <-- new prop
  popupImageFields = [], // <-- new prop
  
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
  
  // Action buttons
  rowActions = [],
  bulkActions = [],
  enableRowActions = false
}) => {
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [searchFields, setSearchFields] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [columnFilters, setColumnFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalSrc, setQrModalSrc] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState("");
  const [imageModalAlt, setImageModalAlt] = useState("");

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
              role: "Admin", 
              status: "Active",
              createdAt: "2024-01-15",
              lastLogin: "2024-01-20T10:30:00Z",
              salary: 75000,
              department: "Engineering"
            },
            { 
              id: 2, 
              name: "Jane Smith", 
              email: "jane@example.com", 
              role: "User", 
              status: "Active",
              createdAt: "2024-01-10",
              lastLogin: "2024-01-19T14:15:00Z",
              salary: 65000,
              department: "Marketing"
            },
            { 
              id: 3, 
              name: "Bob Johnson", 
              email: "bob@example.com", 
              role: "User", 
              status: "Inactive",
              createdAt: "2023-12-20",
              lastLogin: "2024-01-05T09:45:00Z",
              salary: 55000,
              department: "Sales"
            },
            { 
              id: 4, 
              name: "Alice Brown", 
              email: "alice@example.com", 
              role: "Manager", 
              status: "Active",
              createdAt: "2023-11-30",
              lastLogin: "2024-01-20T16:20:00Z",
              salary: 85000,
              department: "Engineering"
            },
            { 
              id: 5, 
              name: "Charlie Wilson", 
              email: "charlie@example.com", 
              role: "User", 
              status: "Pending",
              createdAt: "2024-01-18",
              lastLogin: null,
              salary: 60000,
              department: "Support"
            }
          ];
          setGraphqlData(mockData);
          if (onGraphqlData) {
            onGraphqlData(mockData);
          }
        } catch (err) {
          setGraphqlError(err.message);
        } finally {
          setGraphqlLoading(false);
        }
      }, 1500);
    }
  }, [graphqlQuery, graphqlVariables, onGraphqlData]);

  // Use GraphQL data if available, otherwise use provided data
  const tableData = graphqlQuery ? graphqlData : data;
  const isLoading = graphqlQuery ? graphqlLoading : loading;
  const tableError = graphqlQuery ? graphqlError : error;

  // Enhanced column generation with data type detection
  const defaultColumns = useMemo(() => {
    let cols = [];
    if (columns.length > 0) {
      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => columns.find(col => col.key === key)).filter(Boolean)
        : columns;
      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    } else if (tableData.length > 0) {
      const sampleRow = tableData[0];
      const autoColumns = Object.keys(sampleRow).map(key => {
        const value = sampleRow[key];
        let type = 'text';
        if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (value && (value.includes('T') && value.includes('Z'))) {
          type = 'datetime';
        } else if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          type = 'date';
        } else if (value && value.includes('@')) {
          type = 'email';
        }
        return {
          key,
          title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          sortable: true,
          filterable: true,
          type,
          width: type === 'email' ? '200px' : type === 'date' ? '120px' : 'auto'
        };
      });
      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => autoColumns.find(col => col.key === key)).filter(Boolean)
        : autoColumns;
      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    }
    // Filter by fields prop if provided
    if (fields && Array.isArray(fields) && fields.length > 0) {
      cols = cols.filter(col => fields.includes(col.key));
    }
    return cols;
  }, [columns, tableData, hiddenColumns, columnOrder, fields]);

  // Enhanced filtering with different filter types
  const filteredData = useMemo(() => {
    let filtered = [...tableData];

    // Global search with advanced options
    if (searchTerm && enableSearch) {
      if (advancedSearch && Object.keys(searchFields).length > 0) {
        // Advanced search by specific fields
        filtered = filtered.filter(row =>
          Object.entries(searchFields).every(([field, term]) => {
            if (!term) return true;
            const value = String(row[field] || '').toLowerCase();
            return value.includes(term.toLowerCase());
          })
        );
      } else {
        // Global search across all fields
        filtered = filtered.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
    }

    // Enhanced column filters with different types
    if (enableColumnFilter) {
      Object.entries(columnFilters).forEach(([column, filterConfig]) => {
        if (filterConfig && filterConfig.value) {
          const columnDef = defaultColumns.find(col => col.key === column);
          const filterType = filterConfig.type || columnDef?.type || 'text';
          
          filtered = filtered.filter(row => {
            const cellValue = row[column];
            
            switch (filterType) {
              case 'number':
                const numValue = Number(cellValue);
                const filterNum = Number(filterConfig.value);
                switch (filterConfig.operator || 'equals') {
                  case 'greater': return numValue > filterNum;
                  case 'less': return numValue < filterNum;
                  case 'equals': return numValue === filterNum;
                  case 'between': 
                    return numValue >= Number(filterConfig.min || 0) && 
                           numValue <= Number(filterConfig.max || Infinity);
                  default: return String(cellValue).includes(String(filterConfig.value));
                }
              
              case 'date':
              case 'datetime':
                const dateValue = new Date(cellValue);
                const filterDate = new Date(filterConfig.value);
                switch (filterConfig.operator || 'equals') {
                  case 'after': return dateValue > filterDate;
                  case 'before': return dateValue < filterDate;
                  case 'equals': return dateValue.toDateString() === filterDate.toDateString();
                  default: return String(cellValue).includes(String(filterConfig.value));
                }
              
              case 'select':
                return filterConfig.value === 'all' || cellValue === filterConfig.value;
              
              case 'boolean':
                return String(cellValue) === String(filterConfig.value);
              
              default:
                return String(cellValue).toLowerCase().includes(
                  String(filterConfig.value).toLowerCase()
                );
            }
          });
        }
      });
    }

    return filtered;
  }, [tableData, searchTerm, columnFilters, searchFields, advancedSearch, enableSearch, enableColumnFilter, defaultColumns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !enableSorting) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle different data types
      const columnType = defaultColumns.find(col => col.key === sortConfig.key)?.type || 'text';
      
      let comparison = 0;
      
      switch (columnType) {
        case 'number':
          comparison = Number(aValue) - Number(bValue);
          break;
        case 'date':
        case 'datetime':
          comparison = new Date(aValue) - new Date(bValue);
          break;
        default:
          comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortConfig, enableSorting, defaultColumns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;
    
    const start = (localCurrentPage - 1) * localPageSize;
    const end = start + localPageSize;
    return sortedData.slice(start, end);
  }, [sortedData, localCurrentPage, localPageSize, enablePagination]);

  // Enhanced event handlers
  const handleSort = useCallback((columnKey) => {
    if (!enableSorting) return;
    
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === "asc" ? "desc" : "asc"
    }));
    
    if (onSortChange) {
      onSortChange(columnKey, sortConfig.direction);
    }
  }, [enableSorting, onSortChange, sortConfig.direction]);

  const handleAdvancedFilter = useCallback((column, filterConfig) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: filterConfig
    }));
    
    if (onFilterChange) {
      onFilterChange(column, filterConfig);
    }
  }, [onFilterChange]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch]);

  const handleAdvancedSearch = useCallback((field, value) => {
    setSearchFields(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleBulkAction = useCallback((action) => {
    if (onBulkAction) {
      onBulkAction(action, selectedRows);
    }
  }, [onBulkAction, selectedRows]);

  const clearAllFilters = useCallback(() => {
    setColumnFilters({});
    setSearchTerm("");
    setSearchFields({});
    setSortConfig({ key: null, direction: "asc" });
  }, []);

  const handleRowSelect = useCallback((rowId, checked) => {
    if (!enableRowSelection) return;
    
    setSelectedRows(prev => 
      checked 
        ? [...prev, rowId]
        : prev.filter(id => id !== rowId)
    );
    
    if (onRowSelect) {
      onRowSelect(rowId, checked);
    }
  }, [enableRowSelection, onRowSelect]);

  const handleSelectAll = useCallback((checked) => {
    if (!enableRowSelection) return;
    
    const newSelected = checked ? paginatedData.map(row => row.id) : [];
    setSelectedRows(newSelected);
    
    if (onRowSelect) {
      onRowSelect(newSelected, checked);
    }
  }, [enableRowSelection, paginatedData, onRowSelect]);

  const handleExport = useCallback(() => {
    if (!enableExport) return;
    
    const csvContent = [
      defaultColumns.map(col => col.title).join(','),
      ...sortedData.map(row => 
        defaultColumns.map(col => `"${row[col.key] || ''}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-data.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    if (onExport) {
      onExport(sortedData);
    }
  }, [enableExport, sortedData, defaultColumns, onExport]);

  const handleRefresh = useCallback(async () => {
    if (!enableRefresh) return;
    
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      // Re-trigger GraphQL query if applicable
      if (graphqlQuery) {
        // Trigger refetch
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [enableRefresh, onRefresh, graphqlQuery]);

  const handlePageChange = useCallback((newPage) => {
    setLocalCurrentPage(newPage);
    if (onPageChange) {
      onPageChange(newPage);
    }
  }, [onPageChange]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / localPageSize);
  const startRow = (localCurrentPage - 1) * localPageSize + 1;
  const endRow = Math.min(localCurrentPage * localPageSize, sortedData.length);

  // Enhanced filter component
  const FilterInput = ({ column }) => {
    const filterConfig = columnFilters[column.key] || {};
    
    switch (column.type) {
      case 'number':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select
              value={filterConfig.operator || 'equals'}
              onChange={(e) => handleAdvancedFilter(column.key, {
                ...filterConfig,
                operator: e.target.value
              })}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="equals">Equals</option>
              <option value="greater">Greater than</option>
              <option value="less">Less than</option>
              <option value="between">Between</option>
            </select>
            
            {filterConfig.operator === 'between' ? (
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filterConfig.min || ''}
                  onChange={(e) => handleAdvancedFilter(column.key, {
                    ...filterConfig,
                    min: e.target.value
                  })}
                  style={{
                    width: '70px',
                    padding: '4px 6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filterConfig.max || ''}
                  onChange={(e) => handleAdvancedFilter(column.key, {
                    ...filterConfig,
                    max: e.target.value
                  })}
                  style={{
                    width: '70px',
                    padding: '4px 6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
              </div>
            ) : (
              <input
                type="number"
                placeholder={`Filter ${column.title}...`}
                value={filterConfig.value || ''}
                onChange={(e) => handleAdvancedFilter(column.key, {
                  ...filterConfig,
                  value: e.target.value
                })}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            )}
          </div>
        );
      
      case 'date':
      case 'datetime':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select
              value={filterConfig.operator || 'equals'}
              onChange={(e) => handleAdvancedFilter(column.key, {
                ...filterConfig,
                operator: e.target.value
              })}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="equals">On date</option>
              <option value="after">After date</option>
              <option value="before">Before date</option>
            </select>
            
            <input
              type="date"
              value={filterConfig.value || ''}
              onChange={(e) => handleAdvancedFilter(column.key, {
                ...filterConfig,
                value: e.target.value
              })}
              style={{
                padding: '4px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
          </div>
        );
      
      case 'select':
        const uniqueValues = [...new Set(tableData.map(row => row[column.key]))];
        return (
          <select
            value={filterConfig.value || 'all'}
            onChange={(e) => handleAdvancedFilter(column.key, {
              type: 'select',
              value: e.target.value
            })}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value="all">All</option>
            {uniqueValues.map(value => (
              <option key={value} value={value}>{String(value)}</option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            placeholder={`Filter ${column.title}...`}
            value={filterConfig.value || ''}
            onChange={(e) => handleAdvancedFilter(column.key, {
              type: 'text',
              value: e.target.value
            })}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          />
        );
    }
  };

  // Theme styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          background: '#1f2937',
          border: '#374151',
          text: '#f9fafb',
          headerBg: '#111827'
        };
      case 'minimal':
        return {
          background: '#ffffff',
          border: '#f3f4f6',
          text: '#111827',
          headerBg: '#ffffff'
        };
      default:
        return {
          background: '#ffffff',
          border: '#e5e7eb',
          text: '#111827',
          headerBg: '#f9fafb'
        };
    }
  };

  const themeStyles = getThemeStyles();

  const containerStyle = {
    width: "100%",
    backgroundColor: themeStyles.background,
    borderRadius: "12px",
    border: `1px solid ${themeStyles.border}`,
    boxShadow: theme === 'minimal' ? 'none' : "0 1px 3px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    color: themeStyles.text,
    ...style
  };

  if (isLoading) {
    return (
      <div className={className} style={containerStyle}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "64px",
          color: "#6b7280"
        }}>
          <RefreshCw size={24} className="animate-spin" style={{ marginRight: "12px" }} />
          Loading data...
        </div>
      </div>
    );
  }

  if (tableError) {
    return (
      <div className={className} style={containerStyle}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "64px",
          color: "#dc2626"
        }}>
          <X size={24} style={{ marginRight: "12px" }} />
          Error: {tableError}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle}>
      {/* Enhanced Toolbar */}
      <div style={{ 
        padding: "16px 24px", 
        borderBottom: `1px solid ${themeStyles.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        backgroundColor: themeStyles.headerBg
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {enableSearch && (
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ 
                  position: "absolute", 
                  left: "12px", 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  color: "#6b7280"
                }} />
                <input
                  type="text"
                  placeholder={advancedSearch ? "Advanced search active..." : "Search..."}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={advancedSearch}
                  style={{
                    paddingLeft: "40px",
                    paddingRight: "12px",
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    width: "250px",
                    backgroundColor: advancedSearch ? "#f9fafb" : "#fff"
                  }}
                />
              </div>
              
              <button
                onClick={() => setAdvancedSearch(!advancedSearch)}
                style={{
                  padding: "8px",
                  backgroundColor: advancedSearch ? "#3b82f6" : "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: advancedSearch ? "#fff" : "#374151"
                }}
                title="Advanced Search"
              >
                <Settings size={16} />
              </button>
            </div>
          )}
          
          {enableColumnFilter && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: showFilters ? "#f3f4f6" : "#fff",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              <Filter size={16} />
              Filters {Object.keys(columnFilters).length > 0 && `(${Object.keys(columnFilters).length})`}
            </button>
          )}

          {(Object.keys(columnFilters).length > 0 || searchTerm) && (
            <button
              onClick={clearAllFilters}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                color: "#ef4444"
              }}
            >
              <RotateCcw size={16} />
              Clear All
            </button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {selectedRows.length > 0 && enableBulkActions && bulkActions.length > 0 && (
            <div style={{ display: "flex", gap: "4px" }}>
              <span style={{ fontSize: "14px", color: "#6b7280", padding: "8px 12px" }}>
                {selectedRows.length} selected
              </span>
              {bulkActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleBulkAction(action)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: action.color || "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  {action.title}
                </button>
              ))}
            </div>
          )}

          {enableColumnManagement && (
            <button
              onClick={() => setShowColumnManager(!showColumnManager)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              <Columns size={16} />
              Columns
            </button>
          )}
          
          {enableRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: isRefreshing ? "not-allowed" : "pointer",
                opacity: isRefreshing ? 0.6 : 1
              }}
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          )}
          
          {enableExport && (
            <button
              onClick={handleExport}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              <Download size={16} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Advanced Search Fields */}
      {advancedSearch && enableSearch && (
        <div style={{ 
          padding: "16px 24px", 
          backgroundColor: "#f8fafc",
          borderBottom: `1px solid ${themeStyles.border}`
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "12px" 
          }}>
            {defaultColumns.map(column => (
              <div key={column.key}>
                <label style={{ 
                  display: "block", 
                  fontSize: "12px", 
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "4px"
                }}>
                  Search {column.title}
                </label>
                <input
                  type="text"
                  placeholder={`Search in ${column.title}...`}
                  value={searchFields[column.key] || ""}
                  onChange={(e) => handleAdvancedSearch(column.key, e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "13px"
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Column Filters */}
      {showFilters && enableColumnFilter && (
        <div style={{ 
          padding: "16px 24px", 
          backgroundColor: "#f9fafb",
          borderBottom: `1px solid ${themeStyles.border}`
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "16px" 
          }}>
            {defaultColumns.filter(col => col.filterable).map(column => (
              <div key={column.key}>
                <label style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px", 
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  {column.type === 'number' && <Hash size={14} />}
                  {column.type === 'date' && <Calendar size={14} />}
                  {column.type === 'text' && <Type size={14} />}
                  {column.title}
                </label>
                <FilterInput column={column} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ 
        overflowX: "auto", 
        maxHeight: tableHeight, 
        width: "100%" 
      }}>
        <table style={{ 
          width: "100%", 
          minWidth: Math.max(600, defaultColumns.length * 120), 
          borderCollapse: "collapse",
          fontSize: "14px"
        }}>
          <thead style={{ 
            backgroundColor: themeStyles.headerBg,
            position: "sticky",
            top: 0,
            zIndex: 10
          }}>
            <tr>
              {enableRowSelection && (
                <th style={{ 
                  padding: "12px 16px", 
                  textAlign: "left",
                  borderBottom: `1px solid ${themeStyles.border}`,
                  width: "50px"
                }}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                </th>
              )}
              
              {defaultColumns.map(column => (
                <th 
                  key={column.key}
                  style={{ 
                    padding: "12px 16px", 
                    textAlign: "left",
                    borderBottom: `1px solid ${themeStyles.border}`,
                    fontWeight: "600",
                    color: themeStyles.text,
                    cursor: column.sortable && enableSorting ? "pointer" : "default",
                    userSelect: "none",
                    width: column.width || "auto",
                    position: "relative"
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>{column.title}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      {column.sortable && enableSorting && (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <SortAsc 
                            size={12} 
                            style={{ 
                              opacity: sortConfig.key === column.key && sortConfig.direction === "asc" ? 1 : 0.3 
                            }} 
                          />
                          <SortDesc 
                            size={12} 
                            style={{ 
                              opacity: sortConfig.key === column.key && sortConfig.direction === "desc" ? 1 : 0.3,
                              marginTop: "-2px"
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </th>
              ))}
              
              {enableRowActions && rowActions.length > 0 && (
                <th style={{ 
                  padding: "12px 16px", 
                  textAlign: "center",
                  borderBottom: `1px solid ${themeStyles.border}`,
                  fontWeight: "600",
                  color: themeStyles.text,
                  width: "100px"
                }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={defaultColumns.length + (enableRowSelection ? 1 : 0) + (enableRowActions ? 1 : 0)}
                  style={{ 
                    padding: "48px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontStyle: "italic"
                  }}
                >
                  No data found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr 
                  key={row.id || index}
                  onClick={() => onRowClick && onRowClick(row, index)}
                  style={{ 
                    cursor: onRowClick ? "pointer" : "default",
                    backgroundColor: selectedRows.includes(row.id) 
                      ? "#f3f4f6" 
                      : index % 2 === 0 ? themeStyles.background : "#f9fafb",
                    transition: "background-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (onRowClick) {
                      e.target.parentElement.style.backgroundColor = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick && !selectedRows.includes(row.id)) {
                      e.target.parentElement.style.backgroundColor = 
                        index % 2 === 0 ? themeStyles.background : "#f9fafb";
                    }
                  }}
                >
                  {enableRowSelection && (
                    <td style={{ 
                      padding: "12px 16px",
                      borderBottom: `1px solid ${themeStyles.border}`
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                  )}
                  
                  {defaultColumns.map(column => {
                    const value = row[column.key];
                    let displayValue = value;

                    // Render as image if column is in imageFields and value is present
                    if (imageFields && Array.isArray(imageFields) && imageFields.includes(column.key) && value) {
                      const isPopup = popupImageFields && Array.isArray(popupImageFields) && popupImageFields.includes(column.key);
                      return (
                        <td key={column.key} style={{ padding: "12px 16px", borderBottom: `1px solid ${themeStyles.border}`, color: themeStyles.text }}>
                          <img
                            src={value}
                            alt={column.key}
                            style={{ maxWidth: 64, maxHeight: 64, cursor: isPopup ? 'pointer' : 'default', border: '1px solid #e5e7eb', borderRadius: 4 }}
                            onClick={isPopup ? () => { setImageModalSrc(value); setImageModalAlt(column.key); setShowImageModal(true); } : undefined}
                          />
                        </td>
                      );
                    }

                    // Format based on column type
                    if (column.type === 'date' && value) {
                      displayValue = new Date(value).toLocaleDateString();
                    } else if (column.type === 'datetime' && value) {
                      displayValue = new Date(value).toLocaleString();
                    } else if (column.type === 'number' && value !== null && value !== undefined) {
                      displayValue = Number(value).toLocaleString();
                    } else if (value === null || value === undefined) {
                      displayValue = '-';
                    }
                    
                    return (
                      <td 
                        key={column.key}
                        style={{ 
                          padding: "12px 16px",
                          borderBottom: `1px solid ${themeStyles.border}`,
                          color: themeStyles.text
                        }}
                      >
                        {column.render 
                          ? column.render(value, row)
                          : String(displayValue)
                        }
                      </td>
                    );
                  })}
                  
                  {enableRowActions && rowActions.length > 0 && (
                    <td style={{ 
                      padding: "12px 16px",
                      borderBottom: `1px solid ${themeStyles.border}`,
                      textAlign: "center"
                    }}>
                      <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                        {rowActions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            title={action.title}
                            style={{
                              padding: "4px",
                              backgroundColor: "transparent",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              color: action.color || "#6b7280"
                            }}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      {enablePagination && (
        <div style={{ 
          padding: "16px 24px",
          borderTop: `1px solid ${themeStyles.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          width: "100%",
          background: themeStyles.headerBg,
          position: "relative",
          minHeight: "48px", // improved height
          fontSize: "16px"   // improved font size
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              Showing {startRow} to {endRow} of {sortedData.length} results
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>Show:</span>
              <select
                value={localPageSize}
                onChange={(e) => {
                  setLocalPageSize(Number(e.target.value));
                  setLocalCurrentPage(1);
                }}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>per page</span>
            </div>
          </div>
          
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => handlePageChange(1)}
                disabled={localCurrentPage === 1}
                style={{
                  padding: "8px 16px",
                  backgroundColor: localCurrentPage === 1 ? "#f9fafb" : "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: localCurrentPage === 1 ? "not-allowed" : "pointer",
                  color: localCurrentPage === 1 ? "#9ca3af" : "#374151"
                }}
              >
                <ChevronLeft size={16} />
                <ChevronLeft size={16} style={{ marginLeft: "-8px" }} />
              </button>
              
              <button
                onClick={() => handlePageChange(localCurrentPage - 1)}
                disabled={localCurrentPage === 1}
                style={{
                  padding: "8px 16px",
                  backgroundColor: localCurrentPage === 1 ? "#f9fafb" : "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: localCurrentPage === 1 ? "not-allowed" : "pointer",
                  color: localCurrentPage === 1 ? "#9ca3af" : "#374151"
                }}
              >
                <ChevronLeft size={16} />
              </button>
              
              <div style={{ display: "flex", gap: "4px" }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (localCurrentPage <= 3) {
                    pageNum = i + 1;
                  } else if (localCurrentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = localCurrentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        padding: "6px 10px",
                        backgroundColor: localCurrentPage === pageNum ? "#3b82f6" : "#fff",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        cursor: "pointer",
                        color: localCurrentPage === pageNum ? "#fff" : "#374151",
                        fontWeight: localCurrentPage === pageNum ? "600" : "400"
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(localCurrentPage + 1)}
                disabled={localCurrentPage === totalPages}
                style={{
                  padding: "8px 16px",
                  backgroundColor: localCurrentPage === totalPages ? "#f9fafb" : "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: localCurrentPage === totalPages ? "not-allowed" : "pointer",
                  color: localCurrentPage === totalPages ? "#9ca3af" : "#374151"
                }}
              >
                <ChevronRight size={16} />
              </button>
              
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={localCurrentPage === totalPages}
                style={{
                  padding: "8px 16px",
                  backgroundColor: localCurrentPage === totalPages ? "#f9fafb" : "#fff",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: localCurrentPage === totalPages ? "not-allowed" : "pointer",
                  color: localCurrentPage === totalPages ? "#9ca3af" : "#374151"
                }}
              >
                <ChevronRight size={16} />
                <ChevronRight size={16} style={{ marginLeft: "-8px" }} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* QR Modal Popup */}
      {showQrModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 12,
              boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrModal(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'transparent',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#888'
              }}
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={qrModalSrc}
              alt="QR Large"
              style={{ maxWidth: '60vw', maxHeight: '60vh', borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
          </div>
        </div>
      )}

      {/* Image Modal Popup */}
      {showImageModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            style={{
              background: '#fff',
              padding: 24,
              borderRadius: 12,
              boxShadow: '0 4px 32px rgba(0,0,0,0.2)',
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowImageModal(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'transparent',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#888'
              }}
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={imageModalSrc}
              alt={imageModalAlt}
              style={{ maxWidth: '60vw', maxHeight: '60vh', borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTable; 