import React, { useState, useMemo, useCallback, useEffect } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Toolbar } from 'primereact/toolbar';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

import "primereact/resources/themes/lara-light-cyan/theme.css";
import { 
  RefreshCw,
  X,
  Calendar as CalendarIcon
} from "lucide-react";

const PrimeDataTable = ({
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
  
  // Table configuration - All features are now toggleable
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
  enableFilterMenu = true,
  enableFilterMatchModes = true,
  enableFilterClear = true,
  enableFilterApply = true,
  enableFilterFooter = true,
  enableGridLines = true,
  enableStripedRows = true,
  enableHoverEffect = true,
  enableResizableColumns = false,
  enableReorderableColumns = false,
  enableVirtualScrolling = false,
  enableLazyLoading = false,
  enableRowGrouping = false,
  enableRowExpansion = false,
  enableFrozenColumns = false,
  enableFrozenRows = false,
  
  // Pagination
  pageSize = 10,
  currentPage = 1,
  pageSizeOptions = [5, 10, 25, 50, 100],
  
  // Styling
  className = "",
  style = {},
  tableHeight = "600px",
  theme = "default", // default, dark, minimal
  tableSize = "normal", // small, normal, large
  tableStyle = "default", // default, compact, comfortable
  
  // Cell styling props
  cellWidth = "auto", // auto, fixed, or specific value like "150px"
  cellHeight = "auto", // auto, fixed, or specific value like "50px"
  cellMinWidth = "auto", // auto or specific value like "100px"
  cellMinHeight = "auto", // auto or specific value like "40px"
  cellMaxWidth = "none", // none or specific value like "300px"
  cellMaxHeight = "none", // none or specific value like "100px"
  
  // Default styling props
  defaultHeaderStyle = {}, // Default header styling for auto-generated columns
  defaultBodyStyle = {}, // Default body styling for auto-generated columns
  
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
  enableRowActions = false,
  
  // Advanced filter options
  filterDisplay = "menu", // menu, row
  globalFilterFields = [],
  showFilterMatchModes = true,
  
  // Custom templates
  customTemplates = {},
  customFormatters = {},
  
  // Column grouping props
  enableColumnGrouping = false,
  headerColumnGroup = null,
  footerColumnGroup = null,
  columnGroups = [],
  groupConfig = {
    enableHeaderGroups: true,
    enableFooterGroups: true,
    groupStyle: {},
    headerGroupStyle: {},
    footerGroupStyle: {}
  },
  
  // Footer totals props
  enableFooterTotals = false,
  footerTotalsConfig = {
    showTotals: true,
    showAverages: false,
    showCounts: true,
    numberFormat: 'en-US',
    currency: 'USD',
    precision: 2
  }
}) => {
  // Local state
  const [selectedRows, setSelectedRows] = useState([]);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState("");
  const [imageModalAlt, setImageModalAlt] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  // GraphQL data state
  const [graphqlData, setGraphqlData] = useState([]);
  const [graphqlLoading, setGraphqlLoading] = useState(false);
  const [graphqlError, setGraphqlError] = useState(null);

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
        } else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
          type = 'datetime';
        } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          type = 'date';
        } else if (typeof value === 'string' && value.includes('@')) {
          type = 'email';
        }
        
        // Default header and body styles based on data type
        const columnHeaderStyle = {
          fontWeight: '600',
          fontSize: '13px',
          textAlign: 'center',
          padding: '12px 8px',
          borderBottom: '2px solid #e5e7eb',
          whiteSpace: 'nowrap',
          lineHeight: '1.4',
          width: cellWidth,
          minWidth: cellMinWidth,
          maxWidth: cellMaxWidth,
          height: cellHeight,
          minHeight: cellMinHeight,
          maxHeight: cellMaxHeight,
          ...defaultHeaderStyle
        };
        
        const columnBodyStyle = {
          textAlign: type === 'number' ? 'right' : type === 'boolean' ? 'center' : 'left',
          padding: '8px',
          fontSize: '13px',
          width: cellWidth,
          minWidth: cellMinWidth,
          maxWidth: cellMaxWidth,
          height: cellHeight,
          minHeight: cellMinHeight,
          maxHeight: cellMaxHeight,
          ...defaultBodyStyle
        };
        
        return {
          key,
          title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          sortable: true,
          filterable: true,
          type,
          headerStyle: columnHeaderStyle,
          style: columnBodyStyle
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
  }, [columns, tableData, hiddenColumns, columnOrder, fields, cellWidth, cellMinWidth, cellMaxWidth, cellHeight, cellMinHeight, cellMaxHeight, defaultHeaderStyle, defaultBodyStyle]);

  // Initialize filters based on columns
  useEffect(() => {
    const initialFilters = {
      global: { value: globalFilterValue, matchMode: FilterMatchMode.CONTAINS }
    };
    
    defaultColumns.forEach(col => {
      if (col.filterable && enableColumnFilter) {
        // Use advanced filter structure for all columns to match official PrimeReact design
        initialFilters[col.key] = { 
          operator: FilterOperator.AND, 
          constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] 
        };
      }
    });
    setFilters(initialFilters);
  }, [defaultColumns, enableColumnFilter, globalFilterValue]);

  // Debug customFormatters
  useEffect(() => {
    if (Object.keys(customFormatters).length > 0) {
      debugCustomFormatters();
    }
  }, [customFormatters]);

  // Enhanced event handlers
  const handleSort = useCallback((event) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder);
    
    if (onSortChange) {
      onSortChange(event.sortField, event.sortOrder === 1 ? 'asc' : 'desc');
    }
  }, [onSortChange]);

  const handleFilter = useCallback((event) => {
    setFilters(event.filters);
    
    if (onFilterChange) {
      onFilterChange(event.filters);
    }
  }, [onFilterChange]);

  const handleSearch = useCallback((value) => {
    setGlobalFilterValue(value);
    
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch]);

  const handleBulkAction = useCallback((action) => {
    if (onBulkAction) {
      onBulkAction(action, selectedRows);
    }
  }, [onBulkAction, selectedRows]);

  const clearAllFilters = useCallback(() => {
    setGlobalFilterValue("");
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    setSortField(null);
    setSortOrder(1);
  }, []);

  const handleRowSelect = useCallback((event) => {
    setSelectedRows(event.value);
    
    if (onRowSelect) {
      onRowSelect(event.value);
    }
  }, [onRowSelect]);

  const handleExport = useCallback(() => {
    if (!enableExport) return;
    
    const csvContent = [
      defaultColumns.map(col => col.title).join(','),
      ...tableData.map(row => 
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
      onExport(tableData);
    }
  }, [enableExport, tableData, defaultColumns, onExport]);

  const handleRefresh = useCallback(async () => {
    if (!enableRefresh) return;
    
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [enableRefresh, onRefresh]);

  const handlePageChange = useCallback((event) => {
    setLocalCurrentPage(event.page + 1);
    setLocalPageSize(event.rows);
    
    if (onPageChange) {
      onPageChange(event.page + 1);
    }
  }, [onPageChange]);

  // Custom cell renderers
  const imageBodyTemplate = (rowData, column) => {
    const value = rowData[column.key];
    if (!value) return '-';
    
    const isPopup = popupImageFields && Array.isArray(popupImageFields) && popupImageFields.includes(column.key);
    
    return (
      <img
        src={value}
        alt={column.key}
        style={{ 
          maxWidth: 64, 
          maxHeight: 64, 
          cursor: isPopup ? 'pointer' : 'default', 
          border: '1px solid #e5e7eb', 
          borderRadius: 4 
        }}
        onClick={isPopup ? () => { 
          setImageModalSrc(value); 
          setImageModalAlt(column.key); 
          setShowImageModal(true); 
        } : undefined}
      />
    );
  };

  // Debug function to check if customFormatters are working
  const debugCustomFormatters = () => {
    console.log('Original Custom Formatters:', customFormatters);
    console.log('Parsed Custom Formatters:', parsedCustomFormatters);
    console.log('Custom Formatters Keys:', Object.keys(customFormatters));
  };

  // Parse customFormatters from strings to functions
  const parseCustomFormatters = useCallback(() => {
    const parsedFormatters = {};
    
    // Safety check - ensure customFormatters is an object
    if (!customFormatters || typeof customFormatters !== 'object') {
      return parsedFormatters;
    }
    
    Object.keys(customFormatters).forEach(key => {
      const formatter = customFormatters[key];
      
      if (typeof formatter === 'function') {
        // Already a function, use as is
        parsedFormatters[key] = formatter;
      } else if (typeof formatter === 'string') {
        // String function, try to parse it
        try {
          // Handle different function formats
          let functionBody, paramNames;
          
          if (formatter.includes('function(')) {
            // Standard function format: function(value, rowData) { return ... }
            functionBody = formatter.replace(/^function\s*\([^)]*\)\s*\{/, '').replace(/\}$/, '');
            const params = formatter.match(/function\s*\(([^)]*)\)/);
            paramNames = params ? params[1].split(',').map(p => p.trim()) : ['value', 'rowData'];
          } else if (formatter.includes('=>')) {
            // Arrow function format: (value, rowData) => ...
            const arrowMatch = formatter.match(/\(([^)]*)\)\s*=>\s*(.+)/);
            if (arrowMatch) {
              paramNames = arrowMatch[1].split(',').map(p => p.trim());
              functionBody = `return ${arrowMatch[2]}`;
            } else {
              // Simple arrow function: value => ...
              paramNames = ['value'];
              functionBody = `return ${formatter.replace(/^[^=]*=>\s*/, '')}`;
            }
          } else {
            // Simple expression, treat as value => expression
            paramNames = ['value'];
            functionBody = `return ${formatter}`;
          }
          
          // Create the function
          const func = new Function(...paramNames, functionBody);
          parsedFormatters[key] = func;
        } catch (error) {
          console.warn(`Failed to parse customFormatter for ${key}:`, error);
          // Fallback to simple string return
          parsedFormatters[key] = (value) => String(value || '');
        }
      } else {
        // Fallback for other types
        parsedFormatters[key] = (value) => String(value || '');
      }
    });
    
    return parsedFormatters;
  }, [customFormatters]);

  const parsedCustomFormatters = parseCustomFormatters();

  const dateBodyTemplate = (rowData, column) => {
    const value = rowData[column.key];
    if (!value) return '-';
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    } else if (column.type === 'datetime') {
      return new Date(value).toLocaleString();
    }
    return value;
  };

  const numberBodyTemplate = (rowData, column) => {
    const value = rowData[column.key];
    if (value === null || value === undefined) return '-';
    return Number(value).toLocaleString();
  };

  const booleanBodyTemplate = (rowData, column) => {
    const value = rowData[column.key];
    return (
      <i className={classNames('pi', { 
        'text-green-500 pi-check-circle': value, 
        'text-red-500 pi-times-circle': !value 
      })}></i>
    );
  };

  const actionsBodyTemplate = (rowData) => {
    return (
      <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
        {rowActions.map((action, actionIndex) => (
          <Button
            key={actionIndex}
            icon={action.icon}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(rowData);
            }}
            tooltip={action.title}
            tooltipOptions={{ position: 'top' }}
            className="p-button-text p-button-sm"
            style={{ color: action.color || "#6b7280" }}
          />
        ))}
      </div>
    );
  };

  // Advanced filter components


  // Filter templates - Using native PrimeReact design
  const filterClearTemplate = (options) => {
    if (!enableFilterClear) return null;
    return (
      <Button
        type="button"
        icon="pi pi-times"
        onClick={options.filterClearCallback}
        className="p-button-text p-button-sm"
        tooltip="Clear filter"
        tooltipOptions={{ position: 'top' }}
      />
    );
  };

  const filterApplyTemplate = (options) => {
    if (!enableFilterApply) return null;
    return (
      <Button
        type="button"
        icon="pi pi-check"
        onClick={options.filterApplyCallback}
        className="p-button-text p-button-sm"
        tooltip="Apply filter"
        tooltipOptions={{ position: 'top' }}
      />
    );
  };

  const filterFooterTemplate = (column) => {
    if (!enableFilterFooter) return null;
    return (
      <div className="p-column-filter-footer">
        Filter by {column.title}
      </div>
    );
  };

  // Calculate footer totals for numeric columns
  const calculateFooterTotals = useMemo(() => {
    if (!enableFooterTotals || !tableData.length) return {};
    
    const totals = {};
    const averages = {};
    const counts = {};
    
    defaultColumns.forEach(column => {
      if (column.type === 'number') {
        const values = tableData
          .map(row => {
            const value = row[column.key];
            return typeof value === 'number' ? value : 0;
          })
          .filter(val => val !== null && val !== undefined);
        
        if (values.length > 0) {
          if (footerTotalsConfig.showTotals) {
            totals[column.key] = values.reduce((sum, val) => sum + val, 0);
          }
          
          if (footerTotalsConfig.showAverages) {
            averages[column.key] = values.reduce((sum, val) => sum + val, 0) / values.length;
          }
          
          if (footerTotalsConfig.showCounts) {
            counts[column.key] = values.length;
          }
        }
      }
    });
    
    return { totals, averages, counts };
  }, [tableData, defaultColumns, enableFooterTotals, footerTotalsConfig]);

  // Footer template for column totals
  const footerTemplate = (column) => {
    if (!enableFooterTotals || column.type !== 'number') return null;
    
    const { totals, averages, counts } = calculateFooterTotals;
    const total = totals[column.key];
    const average = averages[column.key];
    const count = counts[column.key];
    
    if (total === undefined && average === undefined && count === undefined) return null;
    
    const formatNumber = (value) => {
      if (typeof value !== 'number') return '';
      
      // Check if it's currency
      if (column.isCurrency || column.key.toLowerCase().includes('price') || column.key.toLowerCase().includes('cost') || column.key.toLowerCase().includes('amount')) {
        return new Intl.NumberFormat(footerTotalsConfig.numberFormat, {
          style: 'currency',
          currency: footerTotalsConfig.currency,
          minimumFractionDigits: footerTotalsConfig.precision,
          maximumFractionDigits: footerTotalsConfig.precision
        }).format(value);
      }
      
      // Regular number formatting
      return new Intl.NumberFormat(footerTotalsConfig.numberFormat, {
        minimumFractionDigits: footerTotalsConfig.precision,
        maximumFractionDigits: footerTotalsConfig.precision
      }).format(value);
    };
    
    return (
      <div style={{
        padding: '8px',
        textAlign: 'right',
        fontWeight: '600',
        fontSize: '13px',
        backgroundColor: '#f8fafc',
        borderTop: '2px solid #e5e7eb',
        color: '#374151'
      }}>
        {footerTotalsConfig.showTotals && total !== undefined && (
          <div>Total: {formatNumber(total)}</div>
        )}
        {footerTotalsConfig.showAverages && average !== undefined && (
          <div>Avg: {formatNumber(average)}</div>
        )}
        {footerTotalsConfig.showCounts && count !== undefined && (
          <div>Count: {count}</div>
        )}
      </div>
    );
  };

  // Toolbar components
  const leftToolbarTemplate = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
      {enableSearch && enableGlobalFilter && (
        <IconField iconPosition="left" style={{ width: "180px" }}>
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder="Keyword Search"
            value={globalFilterValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: "auto" }}
          />
        </IconField>
      )}

      {globalFilterValue && (
        <Button
          icon="pi pi-filter-slash"
          label="Clear"
          onClick={clearAllFilters}
          className="p-button-outlined p-button-danger p-button-sm"
        />
      )}
    </div>
  );

  const rightToolbarTemplate = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {selectedRows.length > 0 && enableBulkActions && bulkActions.length > 0 && (
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ fontSize: "14px", color: "#6b7280", padding: "8px 12px" }}>
            {selectedRows.length} selected
          </span>
          {bulkActions.map((action, index) => (
            <Button
              key={index}
              label={action.title}
              onClick={() => handleBulkAction(action)}
              className="p-button-sm"
              style={{ backgroundColor: action.color || "#3b82f6" }}
            />
          ))}
        </div>
      )}

      {enableColumnManagement && (
        <Button
          icon="pi pi-columns"
          label="Columns"
          onClick={() => setShowColumnManager(!showColumnManager)}
          className="p-button-outlined p-button-sm"
        />
      )}

      {enableExport && (
        <Button
          icon="pi pi-download"
          label="Export"
          onClick={handleExport}
          className="p-button-outlined p-button-sm"
        />
      )}

      {enableRefresh && (
        <Button
          icon="pi pi-refresh"
          label="Refresh"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-button-outlined p-button-sm"
          loading={isRefreshing}
        />
      )}
    </div>
  );

  // Get table size class
  const getTableSizeClass = () => {
    switch (tableSize) {
      case 'small': return 'p-datatable-sm';
      case 'large': return 'p-datatable-lg';
      default: return '';
    }
  };

  // Get table style class
  const getTableStyleClass = () => {
    switch (tableStyle) {
      case 'compact': return 'p-datatable-compact';
      case 'comfortable': return 'p-datatable-comfortable';
      default: return '';
    }
  };

  // Theme system implementation
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          container: {
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151'
          },
          header: {
            backgroundColor: '#111827',
            color: '#f9fafb',
            borderBottom: '1px solid #374151'
          },
          toolbar: {
            backgroundColor: '#111827',
            borderBottom: '1px solid #374151'
          },
          table: {
            backgroundColor: '#1f2937',
            color: '#f9fafb'
          },
          row: {
            backgroundColor: '#1f2937',
            borderBottom: '1px solid #374151'
          },
          rowHover: {
            backgroundColor: '#374151'
          },
          rowStriped: {
            backgroundColor: '#374151'
          },

          button: {
            backgroundColor: '#374151',
            color: '#f9fafb',
            border: '1px solid #4b5563'
          },
          buttonHover: {
            backgroundColor: '#4b5563'
          }
        };
      
      case 'minimal':
        return {
          container: {
            backgroundColor: '#ffffff',
            color: '#111827',
            border: '1px solid #f3f4f6'
          },
          header: {
            backgroundColor: '#ffffff',
            color: '#111827',
            borderBottom: '1px solid #f3f4f6'
          },
          toolbar: {
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f3f4f6'
          },
          table: {
            backgroundColor: '#ffffff',
            color: '#111827'
          },
          row: {
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f3f4f6'
          },
          rowHover: {
            backgroundColor: '#f9fafb'
          },
          rowStriped: {
            backgroundColor: '#f9fafb'
          },

          button: {
            backgroundColor: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb'
          },
          buttonHover: {
            backgroundColor: '#f9fafb'
          }
        };
      
      default: // default theme
        return {
          container: {
            backgroundColor: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb'
          },
          header: {
            backgroundColor: '#f8fafc',
            color: '#374151',
            borderBottom: '1px solid #e5e7eb'
          },
          toolbar: {
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          },
          table: {
            backgroundColor: '#ffffff',
            color: '#111827'
          },
          row: {
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #f3f4f6'
          },
          rowHover: {
            backgroundColor: '#f8fafc'
          },
          rowStriped: {
            backgroundColor: '#f9fafb'
          },

          button: {
            backgroundColor: '#ffffff',
            color: '#111827',
            border: '1px solid #d1d5db'
          },
          buttonHover: {
            backgroundColor: '#f9fafb'
          }
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Generate column groups from configuration
  const generateColumnGroups = useCallback(() => {
    if (!enableColumnGrouping || !columnGroups.length) {
      return null;
    }

    return (
      <ColumnGroup>
        {columnGroups.map((group, groupIndex) => (
          <Row key={groupIndex}>
            {group.columns.map((col, colIndex) => (
              <Column
                key={colIndex}
                header={col.header}
                field={col.field}
                sortable={col.sortable}
                colSpan={col.colSpan}
                rowSpan={col.rowSpan}
                style={col.style || groupConfig.groupStyle}
                headerStyle={col.headerStyle || groupConfig.headerGroupStyle}
                footerStyle={col.footerStyle || groupConfig.footerGroupStyle}
                footer={col.footer}
                body={col.body}
                bodyTemplate={col.bodyTemplate}
              />
            ))}
          </Row>
        ))}
      </ColumnGroup>
    );
  }, [enableColumnGrouping, columnGroups, groupConfig]);

  // Generate footer groups from configuration
  const generateFooterGroups = useCallback(() => {
    if (!enableColumnGrouping || !groupConfig.enableFooterGroups) {
      return null;
    }

    // If custom footer group is provided, use it
    if (footerColumnGroup) {
      return footerColumnGroup;
    }

    // Generate footer from column groups if available
    if (columnGroups.length) {
      return (
        <ColumnGroup>
          {columnGroups.map((group, groupIndex) => (
            <Row key={groupIndex}>
              {group.columns.map((col, colIndex) => (
                <Column
                  key={colIndex}
                  footer={col.footer}
                  colSpan={col.colSpan}
                  rowSpan={col.rowSpan}
                  style={col.style || groupConfig.groupStyle}
                  footerStyle={col.footerStyle || groupConfig.footerGroupStyle}
                />
              ))}
            </Row>
          ))}
        </ColumnGroup>
      );
    }

    return null;
    }, [enableColumnGrouping, footerColumnGroup, columnGroups, groupConfig]);

  // Helper function to create column groups easily
  const createColumnGroup = useCallback((groups) => {
    return (
      <ColumnGroup>
        {groups.map((group, groupIndex) => (
          <Row key={groupIndex}>
            {group.columns.map((col, colIndex) => (
              <Column
                key={colIndex}
                header={col.header}
                field={col.field}
                sortable={col.sortable}
                colSpan={col.colSpan}
                rowSpan={col.rowSpan}
                style={col.style}
                headerStyle={col.headerStyle}
                footerStyle={col.footerStyle}
                footer={col.footer}
                body={col.body}
                bodyTemplate={col.bodyTemplate}
              />
            ))}
          </Row>
        ))}
      </ColumnGroup>
    );
  }, []);
  
  // Loading and error states
  if (isLoading) {
    return (
      <div className={className} style={style}>
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
      <div className={className} style={style}>
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
    <div className={className} style={{
      ...themeStyles.container,
      ...style
    }}>
      {/* Debug Info - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          padding: '8px', 
          margin: '8px', 
          backgroundColor: '#f3f4f6', 
          border: '1px solid #d1d5db', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Debug Info:</strong><br/>
          <strong>Data:</strong> {data.length} rows<br/>
          <strong>Columns:</strong> {columns.length} custom, {defaultColumns.length} total<br/>
          <strong>Custom Formatters:</strong> {Object.keys(customFormatters).length}<br/>
          <strong>Custom Templates:</strong> {Object.keys(customTemplates).length}<br/>
          <strong>Custom Filters:</strong> {Object.keys(customFilters).length}<br/>
          <strong>Row Actions:</strong> {rowActions.length}<br/>
          <strong>Bulk Actions:</strong> {bulkActions.length}<br/>
          <strong>Column Groups:</strong> {columnGroups.length}<br/>
          <strong>Features:</strong> Search:{enableSearch ? '✓' : '✗'} | Filter:{enableColumnFilter ? '✓' : '✗'} | Sort:{enableSorting ? '✓' : '✗'} | Pagination:{enablePagination ? '✓' : '✗'}<br/>
          <strong>Column Grouping:</strong> {enableColumnGrouping ? '✓' : '✗'}<br/>
          <strong>Theme:</strong> {theme} | Size: {tableSize} | Style: {tableStyle}<br/>
          <strong>Theme Colors:</strong> BG: {themeStyles.container.backgroundColor} | Text: {themeStyles.container.color}
        </div>
      )}
      
      {/* Theme CSS Variables */}
      <style jsx>{`
        .p-datatable .p-datatable-thead > tr > th {
          background-color: var(--header-bg) !important;
          color: var(--header-color) !important;
          border-bottom: var(--header-border) !important;
        }
        
        .p-datatable .p-datatable-tbody > tr > td {
          background-color: var(--row-bg) !important;
          border-bottom: var(--header-border) !important;
        }
        
        .p-datatable .p-datatable-tbody > tr:hover > td {
          background-color: var(--row-hover-bg) !important;
        }
        
        .p-datatable .p-datatable-tbody > tr:nth-child(even) > td {
          background-color: var(--row-striped-bg) !important;
        }
        
        .p-datatable .p-column-filter {
          background-color: var(--filter-bg) !important;
          border: var(--filter-border) !important;
        }
        
        .p-datatable .p-column-filter:focus {
          border-color: #3b82f6 !important;
        }
        
        .p-datatable .p-button {
          background-color: var(--filter-bg) !important;
          border: var(--filter-border) !important;
          color: var(--header-color) !important;
        }
        
        .p-datatable .p-button:hover {
          background-color: var(--row-hover-bg) !important;
        }
      `}</style>
      
      {/* Toolbar */}
      <Toolbar
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
        style={{
          padding: "20px 24px",
          ...themeStyles.toolbar
        }}
      />

      {/* DataTable */}
      <DataTable
        value={tableData}
        loading={isLoading}
        filters={filters}
        filterDisplay={filterDisplay}
        globalFilterFields={globalFilterFields.length > 0 ? globalFilterFields : defaultColumns.map(col => col.key)}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onFilter={handleFilter}
        onRowClick={onRowClick ? (e) => onRowClick(e.data, e.index) : undefined}
        selection={enableRowSelection ? selectedRows : null}
        onSelectionChange={enableRowSelection ? handleRowSelect : undefined}
        dataKey="id"
        paginator={enablePagination}
        rows={localPageSize}
        rowsPerPageOptions={pageSizeOptions}
        onPage={handlePageChange}
        first={(localCurrentPage - 1) * localPageSize}
        totalRecords={tableData.length}
        showGridlines={enableGridLines}
        stripedRows={enableStripedRows}
        size={tableSize}
        className={`${getTableSizeClass()} ${getTableStyleClass()}`}
        style={{
          height: tableHeight,
          ...themeStyles.table,
          '--header-bg': themeStyles.header.backgroundColor,
          '--header-color': themeStyles.header.color,
          '--header-border': themeStyles.header.borderBottom,
          '--row-bg': themeStyles.row.backgroundColor,
          '--row-hover-bg': themeStyles.rowHover.backgroundColor,
          '--row-striped-bg': themeStyles.rowStriped.backgroundColor
        }}
        emptyMessage="No data found. Try adjusting your filters."
        resizableColumns={enableResizableColumns}
        reorderableColumns={enableReorderableColumns}
        virtualScrollerOptions={enableVirtualScrolling ? { itemSize: 46 } : undefined}
        lazy={enableLazyLoading}
        rowGroupMode={enableRowGrouping ? 'subheader' : undefined}
        expandableRowGroups={enableRowGrouping}
        rowExpansionTemplate={enableRowExpansion ? (data) => <div>Expanded content for {data.name}</div> : undefined}
        frozenColumns={enableFrozenColumns ? 1 : undefined}
        frozenRows={enableFrozenRows ? 1 : undefined}
        showFilterMatchModes={showFilterMatchModes}
        headerColumnGroup={enableColumnGrouping ? (headerColumnGroup || generateColumnGroups()) : undefined}
        footerColumnGroup={enableColumnGrouping ? (footerColumnGroup || generateFooterGroups()) : undefined}
      >
        {enableRowSelection && (
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '50px' }}
            frozen={enableFrozenColumns}
          />
        )}

        {defaultColumns.map(column => {
          const isImageField = imageFields && Array.isArray(imageFields) && imageFields.includes(column.key);
          
          return (
            <Column
              key={column.key}
              field={column.key}
              header={column.title}
              sortable={column.sortable && enableSorting}
              filter={column.filterable && enableColumnFilter}
              filterPlaceholder={`Filter ${column.title}...`}
              filterClear={enableFilterClear ? filterClearTemplate : undefined}
              filterApply={enableFilterApply ? filterApplyTemplate : undefined}
              filterFooter={enableFilterFooter ? () => filterFooterTemplate(column) : undefined}
              footer={enableFooterTotals ? () => footerTemplate(column) : undefined}
              showFilterMatchModes={enableFilterMatchModes}
              headerStyle={{
                ...themeStyles.header,
                ...column.headerStyle
              }}
              bodyStyle={{
                ...themeStyles.row,
                ...column.style
              }}
              body={isImageField ? (rowData) => imageBodyTemplate(rowData, column) :
                    column.type === 'date' || column.type === 'datetime' ? (rowData) => dateBodyTemplate(rowData, column) :
                    column.type === 'number' ? (rowData) => numberBodyTemplate(rowData, column) :
                    column.type === 'boolean' ? (rowData) => booleanBodyTemplate(rowData, column) :
                    parsedCustomFormatters[column.key] ? (rowData) => parsedCustomFormatters[column.key](rowData[column.key], rowData) :
                    customTemplates[column.key] ? (rowData) => customTemplates[column.key](rowData, column) :
                    column.render ? (rowData) => column.render(rowData[column.key], rowData) : undefined}
              style={column.style}
              frozen={enableFrozenColumns && column.key === defaultColumns[0]?.key}
            />
          );
        })}

        {enableRowActions && rowActions.length > 0 && (
          <Column
            body={actionsBodyTemplate}
            header="Actions"
            style={{ width: '100px', textAlign: 'center' }}
            frozen={enableFrozenColumns ? "right" : undefined}
          />
        )}
      </DataTable>

      {/* Image Modal */}
      <Dialog
        visible={showImageModal}
        onHide={() => setShowImageModal(false)}
        header={imageModalAlt}
        style={{ width: '80vw', maxWidth: '800px' }}
        modal
        className="p-fluid"
      >
        <img
          src={imageModalSrc}
          alt={imageModalAlt}
          style={{ 
            width: '80%', 
            height: 'auto', 
            borderRadius: 8, 
            border: '1px solid #e5e7eb' 
          }}
        />
      </Dialog>

      {/* Column Manager Dialog */}
      <Dialog
        visible={showColumnManager}
        onHide={() => setShowColumnManager(false)}
        header="Manage Columns"
        style={{ width: '250px' }}
        modal
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {defaultColumns.map(column => (
            <div key={column.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Checkbox
                checked={!hiddenColumns.includes(column.key)}
                onChange={(e) => {
                  if (e.checked) {
                    setHiddenColumns(prev => prev.filter(col => col !== column.key));
                  } else {
                    setHiddenColumns(prev => [...prev, column.key]);
                  }
                }}
              />
              <span>{column.title}</span>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
};

export default PrimeDataTable; 