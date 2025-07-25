import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
import { ContextMenu } from 'primereact/contextmenu';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';

import {
  RefreshCw,
  X,
  Calendar as CalendarIcon
} from "lucide-react";

// Helper to get unique values for a column
const getUniqueValues = (data, key) => {
  return [...new Set(data
    .filter(row => row && typeof row === 'object') // Filter out null/undefined rows
    .map(row => row[key])
    .filter(val => val !== null && val !== undefined))];
};

/**
 * PrimeDataTable Component with Configurable Column Filters
 *
 * Filter Configuration Props:
 * - dropdownFilterColumns: Array of column keys that should use dropdown filters
 *   Example: ["salesteam", "status", "category"]
 *
 * - datePickerFilterColumns: Array of column keys that should use date picker filters
 *   Example: ["createdDate", "updatedDate", "dueDate"]
 *
 * - numberFilterColumns: Array of column keys that should use number filters
 *   Example: ["amount", "quantity", "price"]
 *
 * - textFilterColumns: Array of column keys that should use text filters
 *   Example: ["name", "description", "notes"]
 *
 * - booleanFilterColumns: Array of column keys that should use boolean filters
 *   Example: ["isActive", "isCompleted", "isPublished"]
 *
 * - customFilterOptions: Object with column keys as keys and array of options as values
 *   Example: {
 *     "salesteam": [
 *       { label: "All", value: null },
 *       { label: "Team A", value: "team_a" },
 *       { label: "Team B", value: "team_b" }
 *     ]
 *   }
 *
 * Usage Example:
 * <PrimeDataTable
 *   data={salesData}
 *   dropdownFilterColumns={["salesteam", "status"]}
 *   datePickerFilterColumns={["createdDate"]}
 *   numberFilterColumns={["amount"]}
 *   customFilterOptions={{
 *     "salesteam": [
 *       { label: "All Teams", value: null },
 *       { label: "Sales Team A", value: "team_a" },
 *       { label: "Sales Team B", value: "team_b" }
 *     ]
 *   }}
 * />
 */

const PrimeDataTable = ({
  // Data props
  data = [],
  columns = [],
  loading = false,
  error = null,
  fields = [],
  imageFields = [],
  popupImageFields = [],
  currencyColumns = [], // Array of column keys that should be formatted as currency in footer totals
  
  // Filter configuration props
  dropdownFilterColumns = [], // Array of column keys that should use dropdown filters
  datePickerFilterColumns = [], // Array of column keys that should use date picker filters
  numberFilterColumns = [], // Array of column keys that should use number filters
  textFilterColumns = [], // Array of column keys that should use text filters
  booleanFilterColumns = [], // Array of column keys that should use boolean filters
  customFilterOptions = {}, // Object with column keys as keys and array of options as values
  
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


  tableSize = "normal", // small, normal, large

  

  
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
  filterDelay = 300,
  globalFilterPlaceholder = "Search...",
  filterLocale = "en",
  
  // Inline editing
  enableInlineEditing = false,
  editingRows = null,
  onRowEditSave = null,
  onRowEditCancel = null,
  onRowEditInit = null,
  onEditingRowsChange = null,
  
  // Context menu
  enableContextMenu = false,
  contextMenu = null,
  contextMenuSelection = null,
  onContextMenuSelectionChange = null,
  onContextMenu = null,
  
  // Advanced pagination
  showFirstLastIcon = true,
  showPageLinks = true,
  showCurrentPageReport = true,
  currentPageReportTemplate = "Showing {first} to {last} of {totalRecords} entries",
  
  // Advanced export
  exportFilename = "data",
  exportFileType = "csv", // csv, excel, pdf
  enableExcelExport = false,
  enablePdfExport = false,
  
  // Advanced selection
  selectionMode = "multiple", // single, multiple, checkbox
  metaKeySelection = true,
  selectOnEdit = false,
  
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
  
  // Inline editing state
  const [localEditingRows, setLocalEditingRows] = useState(editingRows || {});
  
  // Context menu state
  const [localContextMenuSelection, setLocalContextMenuSelection] = useState(contextMenuSelection || null);
  const contextMenuRef = useRef(null);

  // GraphQL data state
  const [graphqlData, setGraphqlData] = useState([]);
  const [graphqlLoading, setGraphqlLoading] = useState(false);
  const [graphqlError, setGraphqlError] = useState(null);

  // Use GraphQL data if available, otherwise use provided data
  const tableData = graphqlQuery ? graphqlData : data;
  const isLoading = graphqlQuery ? graphqlLoading : loading;
  const tableError = graphqlQuery ? graphqlError : error;

  // Function to generate the correct filter UI for a column based on its type and data
  const getColumnFilterElement = useCallback((column, filterValue, filterCallback) => {
    const columnKey = column.key;
    
    // Check if column is explicitly configured for specific filter types
    if (dropdownFilterColumns.includes(columnKey)) {
      // Use custom options if provided, otherwise get unique values
      const options = customFilterOptions[columnKey] || [
        { label: 'All', value: null },
        ...getUniqueValues(tableData, columnKey).map(val => ({ label: String(val), value: val }))
      ];
      
      return (
        <Dropdown
          value={filterValue}
          options={options}
          onChange={(e) => filterCallback(e.value)}
          placeholder="Select..."
          className="p-column-filter"
          showClear
        />
      );
    }
    
    if (datePickerFilterColumns.includes(columnKey)) {
      return (
        <InputText
          type="date"
          value={filterValue || ''}
          onChange={(e) => filterCallback(e.target.value || null)}
          placeholder={`Filter ${column.title}...`}
          className="p-column-filter"
        />
      );
    }
    
    if (numberFilterColumns.includes(columnKey)) {
      return (
        <InputText
          type="number"
          value={filterValue || ''}
          onChange={(e) => filterCallback(e.target.value || null)}
          placeholder={`Filter ${column.title}...`}
          className="p-column-filter"
        />
      );
    }
    
    if (booleanFilterColumns.includes(columnKey)) {
      const booleanOptions = [
        { label: 'All', value: null },
        { label: 'True', value: true },
        { label: 'False', value: false }
      ];
      return (
        <Dropdown
          value={filterValue}
          options={booleanOptions}
          onChange={(e) => filterCallback(e.value)}
          placeholder="Select..."
          className="p-column-filter"
          showClear
        />
      );
    }
    
    if (textFilterColumns.includes(columnKey)) {
      return (
        <InputText
          value={filterValue || ''}
          onChange={(e) => filterCallback(e.target.value || null)}
          placeholder={`Filter ${column.title}...`}
          className="p-column-filter"
        />
      );
    }

    // Auto-detection logic (fallback when no explicit configuration)
    const uniqueValues = getUniqueValues(tableData, columnKey);
    const isCategorical = (
      (uniqueValues.length > 0 && uniqueValues.length <= 30) ||
      column.type === 'dropdown' ||
      column.type === 'select' ||
      column.type === 'categorical' ||
      column.isCategorical
    );

    // For categorical columns, use dropdown
    if (isCategorical) {
      const options = [
        { label: 'All', value: null },
        ...uniqueValues.map(val => ({ label: String(val), value: val }))
      ];
      
      return (
        <Dropdown
          value={filterValue}
          options={options}
          onChange={(e) => filterCallback(e.value)}
          placeholder="Select..."
          className="p-column-filter"
          showClear
        />
      );
    }

    // For different data types, return appropriate filter UI
    switch (column.type) {
      case 'number':
        return (
          <InputText
            type="number"
            value={filterValue || ''}
            onChange={(e) => filterCallback(e.target.value || null)}
            placeholder={`Filter ${column.title}...`}
            className="p-column-filter"
          />
        );
        
      case 'boolean':
        const booleanOptions = [
          { label: 'All', value: null },
          { label: 'True', value: true },
          { label: 'False', value: false }
        ];
        return (
          <Dropdown
            value={filterValue}
            options={booleanOptions}
            onChange={(e) => filterCallback(e.value)}
            placeholder="Select..."
            className="p-column-filter"
            showClear
          />
        );
        
      case 'date':
      case 'datetime':
        return (
          <InputText
            type="date"
            value={filterValue || ''}
            onChange={(e) => filterCallback(e.target.value || null)}
            placeholder={`Filter ${column.title}...`}
            className="p-column-filter"
          />
        );
        
      default:
        // For text and other types, use regular text input
        return (
          <InputText
            value={filterValue || ''}
            onChange={(e) => filterCallback(e.target.value || null)}
            placeholder={`Filter ${column.title}...`}
            className="p-column-filter"
          />
        );
    }
  }, [tableData, dropdownFilterColumns, datePickerFilterColumns, numberFilterColumns, textFilterColumns, booleanFilterColumns, customFilterOptions]);

  // Enhanced column generation with data type detection
  const defaultColumns = useMemo(() => {
    let cols = [];

    if (columns.length > 0) {
      // ✅ Normalize keys from field/header if missing
      const normalizedColumns = columns.map(col => {
        const key = col.key || col.field || col.header || col.name;
        return {
          key,
          title: col.title || col.header || key,
          sortable: col.sortable !== false,
          filterable: col.filterable !== false,
          type: col.type || 'text',
          ...col,
          key // override or re-add key to make sure it's set
        };
      });

      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => normalizedColumns.find(col => col.key === key)).filter(Boolean)
        : normalizedColumns;

      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    } else if (tableData.length > 0) {
      const sampleRow = tableData[0];
      const autoColumns = Object.keys(sampleRow).map(key => {
        const value = sampleRow[key];
        let type = 'text';
        if (typeof value === 'number') type = 'number';
        else if (typeof value === 'boolean') type = 'boolean';
        else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) type = 'date';
        else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) type = 'datetime';

        return {
          key,
          title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          sortable: true,
          filterable: true,
          type
        };
      });

      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => autoColumns.find(col => col.key === key)).filter(Boolean)
        : autoColumns;

      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    }

    if (fields && Array.isArray(fields) && fields.length > 0) {
      cols = cols.filter(col => fields.includes(col.key));
    }

    return cols;
  }, [columns, tableData, hiddenColumns, columnOrder, fields]);


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
    
    // Update filters with the new global filter value
    let _filters = { ...filters };
    if (!_filters['global']) {
      _filters['global'] = { value: null, matchMode: FilterMatchMode.CONTAINS };
    }
    _filters['global'].value = value;
    setFilters(_filters);
    
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch, filters]);

  const handleBulkAction = useCallback((action) => {
    if (onBulkAction) {
      onBulkAction(action, selectedRows);
    }
  }, [onBulkAction, selectedRows]);

  const clearAllFilters = useCallback(() => {
    setGlobalFilterValue("");
    const clearedFilters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
    setFilters(clearedFilters);
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
    
    if (onExport) {
      onExport(tableData);
    } else {
      // Enhanced export with multiple formats
      switch (exportFileType) {
        case 'excel':
          if (enableExcelExport) {
            // Excel export using jspdf-autotable
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
            a.download = `${exportFilename}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
          }
          break;
        case 'pdf':
          if (enablePdfExport) {
            // PDF export using jspdf-autotable
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
            a.download = `${exportFilename}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          }
          break;
        default:
          // Default CSV export
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
          a.download = `${exportFilename}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          break;
      }
    }
  }, [enableExport, tableData, onExport, exportFileType, enableExcelExport, enablePdfExport, exportFilename, defaultColumns]);

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

  // Inline editing handlers
  const handleRowEditSave = useCallback((event) => {
    if (onRowEditSave) {
      onRowEditSave(event);
    }
  }, [onRowEditSave]);

  const handleRowEditCancel = useCallback((event) => {
    if (onRowEditCancel) {
      onRowEditCancel(event);
    }
  }, [onRowEditCancel]);

  const handleRowEditInit = useCallback((event) => {
    if (onRowEditInit) {
      onRowEditInit(event);
    }
  }, [onRowEditInit]);

  const handleEditingRowsChange = useCallback((event) => {
    setLocalEditingRows(event.value);
    if (onEditingRowsChange) {
      onEditingRowsChange(event);
    }
  }, [onEditingRowsChange]);

  // Context menu handlers
  const handleContextMenuSelectionChange = useCallback((event) => {
    setLocalContextMenuSelection(event.value);
    if (onContextMenuSelectionChange) {
      onContextMenuSelectionChange(event);
    }
  }, [onContextMenuSelectionChange]);

  const handleContextMenu = useCallback((event) => {
    if (onContextMenu) {
      onContextMenu(event);
    }
  }, [onContextMenu]);

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

        onClick={isPopup ? () => { 
          setImageModalSrc(value); 
          setImageModalAlt(column.key); 
          setShowImageModal(true); 
        } : undefined}
      />
    );
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

  // Debug function to check if customFormatters are working
  const debugCustomFormatters = () => {
    console.log('Original Custom Formatters:', customFormatters);
    console.log('Parsed Custom Formatters:', parsedCustomFormatters);
    console.log('Custom Formatters Keys:', Object.keys(customFormatters));
  };

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
      <div>
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

  // State to store filtered data for footer totals
  const [filteredDataForTotals, setFilteredDataForTotals] = useState(() =>
    tableData.filter(row => row && typeof row === 'object')
  );

  // Helper function to match filter values
  const matchFilterValue = useCallback((cellValue, filterValue, matchMode) => {
    // Handle null/undefined values
    if (cellValue === null || cellValue === undefined) {
      return filterValue === null || filterValue === undefined || filterValue === '';
    }
    
    // Handle exact matches for non-string types
    if (typeof cellValue === 'number' || typeof cellValue === 'boolean') {
      switch (matchMode) {
        case FilterMatchMode.EQUALS:
          return cellValue === filterValue;
        case FilterMatchMode.NOT_EQUALS:
          return cellValue !== filterValue;
        case FilterMatchMode.LESS_THAN:
          return cellValue < filterValue;
        case FilterMatchMode.LESS_THAN_OR_EQUAL_TO:
          return cellValue <= filterValue;
        case FilterMatchMode.GREATER_THAN:
          return cellValue > filterValue;
        case FilterMatchMode.GREATER_THAN_OR_EQUAL_TO:
          return cellValue >= filterValue;
        default:
          return cellValue === filterValue;
      }
    }
    
    // Handle string comparisons
    const cellStr = String(cellValue).toLowerCase();
    const filterStr = String(filterValue).toLowerCase();
    
    switch (matchMode) {
      case FilterMatchMode.STARTS_WITH:
        return cellStr.startsWith(filterStr);
      case FilterMatchMode.ENDS_WITH:
        return cellStr.endsWith(filterStr);
      case FilterMatchMode.EQUALS:
        return cellStr === filterStr;
      case FilterMatchMode.NOT_EQUALS:
        return cellStr !== filterStr;
      case FilterMatchMode.CONTAINS:
      default:
        return cellStr.includes(filterStr);
    }
  }, []);

  // Apply filters to data manually when PrimeReact doesn't provide filtered data
  const applyFiltersToData = useCallback((data, filters) => {
    if (!filters || Object.keys(filters).length === 0) return data;
    
    return data.filter(row => {
      // Ensure row is not null or undefined
      if (!row || typeof row !== 'object') return false;
      // Check global filter
      if (filters.global && filters.global.value) {
        const globalValue = String(filters.global.value).toLowerCase();
        const globalMatch = defaultColumns.some(col => {
          const cellValue = String(row[col.key] || '').toLowerCase();
          return cellValue.includes(globalValue);
        });
        if (!globalMatch) return false;
      }
      
      // Check column filters
      for (const [columnKey, filterConfig] of Object.entries(filters)) {
        if (columnKey === 'global') continue;
        
        const cellValue = row[columnKey];
        
        // Handle advanced filter structure
        if (filterConfig.operator && filterConfig.constraints) {
          const constraintResults = filterConfig.constraints.map(constraint => {
            if (!constraint.value && constraint.value !== 0 && constraint.value !== false) return true;
            
            const constraintValue = constraint.value;
            const matchMode = constraint.matchMode || FilterMatchMode.CONTAINS;
            
            return matchFilterValue(cellValue, constraintValue, matchMode);
          });
          
          const result = filterConfig.operator === FilterOperator.AND
            ? constraintResults.every(Boolean)
            : constraintResults.some(Boolean);
            
          if (!result) return false;
        } else {
          // Handle simple filter structure
          if (filterConfig.value !== null && filterConfig.value !== undefined && filterConfig.value !== '') {
            const matchMode = filterConfig.matchMode || FilterMatchMode.CONTAINS;
            if (!matchFilterValue(cellValue, filterConfig.value, matchMode)) {
              return false;
            }
          }
        }
      }
      
      return true;
    });
  }, [defaultColumns, matchFilterValue]);

  // Update filtered data when filters or tableData change
  useEffect(() => {
    // Apply current filters to get filtered data for totals
    const filteredData = applyFiltersToData(tableData, filters);
    // Ensure filtered data contains only valid objects
    const validFilteredData = filteredData.filter(row => row && typeof row === 'object');
    setFilteredDataForTotals(validFilteredData);
  }, [tableData, filters, applyFiltersToData]);

  // Calculate footer totals for numeric columns based on filtered data
  const calculateFooterTotals = useMemo(() => {
    if (!enableFooterTotals || !filteredDataForTotals.length) {
      return { totals: {}, averages: {}, counts: {} };
    }

    const totals = {};
    const averages = {};
    const counts = {};

    defaultColumns.forEach(column => {
      if (column.type === 'number') {
        const values = filteredDataForTotals
          .filter(row => row && typeof row === 'object' && column.key in row)
          .map(row => {
            const value = row?.[column.key];
            return typeof value === 'number' && !isNaN(value) ? value : null;
          })
          .filter(val => val !== null);

        if (values.length > 0) {
          const total = values.reduce((sum, val) => sum + val, 0);
          if (footerTotalsConfig.showTotals) {
            totals[column.key] = total;
          }

          if (footerTotalsConfig.showAverages) {
            averages[column.key] = total / values.length;
          }

          if (footerTotalsConfig.showCounts) {
            counts[column.key] = values.length;
          }
        }
      }
    });

    return { totals, averages, counts };
  }, [filteredDataForTotals, defaultColumns, enableFooterTotals, footerTotalsConfig]);



  // Generate filter options for categorical columns
  const generateFilterOptions = useCallback((column) => {
    if (!column.filterable || !enableColumnFilter) return undefined;
    
    const columnKey = column.key;
    
    // Check if custom filter options are provided for this column
    if (customFilterOptions[columnKey]) {
      return customFilterOptions[columnKey];
    }
    
    // If column has predefined options, use them
    if (column.filterOptions) return column.filterOptions;
    
    // Check if column is explicitly configured as dropdown
    if (dropdownFilterColumns.includes(columnKey)) {
      const uniqueValues = [...new Set(tableData.map(row => row[columnKey]).filter(val => val !== null && val !== undefined))];
      return uniqueValues.map(value => ({
        label: String(value),
        value: value
      }));
    }
    
    // For categorical columns, generate options from unique values
    if (column.isCategorical || column.type === 'select' || column.type === 'dropdown' || column.type === 'categorical') {
      const uniqueValues = [...new Set(tableData.map(row => row[columnKey]).filter(val => val !== null && val !== undefined))];
      return uniqueValues.map(value => ({
        label: String(value),
        value: value
      }));
    }
    
    // Auto-detect categorical columns based on data analysis
    const uniqueValues = [...new Set(tableData.map(row => row[columnKey]).filter(val => val !== null && val !== undefined))];
    
    // If column has limited unique values (categorical data)
    if (uniqueValues.length > 0 && uniqueValues.length <= 30) {
      return uniqueValues.map(value => ({
        label: String(value),
        value: value
      }));
    }
    
    // If column has many unique values but they're all strings (not numbers), it might still be categorical
    if (uniqueValues.length > 30 && uniqueValues.length <= 50) {
      const allStrings = uniqueValues.every(val => typeof val === 'string' && !isNaN(val) === false);
      if (allStrings) {
        return uniqueValues.map(value => ({
          label: String(value),
          value: value
        }));
      }
    }
    
    return undefined;
  }, [tableData, enableColumnFilter, customFilterOptions, dropdownFilterColumns]);

  // Footer template for column totals
  const footerTemplate = (column) => {
    if (!enableFooterTotals || column.type !== 'number') return null;
    
    const { totals, averages, counts } = calculateFooterTotals;
    const total = totals[column.key];
    const average = averages[column.key];
    const count = counts[column.key];
    
    if (total === undefined && average === undefined && count === undefined) return null;
    
    const formatNumber = (value, column) => {
      if (typeof value !== 'number') return '';

      if (currencyColumns.includes(column.key)) {
        return new Intl.NumberFormat(footerTotalsConfig.numberFormat, {
          style: 'currency',
          currency: footerTotalsConfig.currency,
          minimumFractionDigits: footerTotalsConfig.precision,
          maximumFractionDigits: footerTotalsConfig.precision
        }).format(value);
      }

      return new Intl.NumberFormat(footerTotalsConfig.numberFormat, {
        minimumFractionDigits: footerTotalsConfig.precision,
        maximumFractionDigits: footerTotalsConfig.precision
      }).format(value);
    };

    
    return (
      <div>
        {footerTotalsConfig.showTotals && total !== undefined && (
          <div>Total: {formatNumber(total, column)}</div> // ✅ pass column
        )}
        {footerTotalsConfig.showAverages && average !== undefined && (
          <div>Avg: {formatNumber(average, column)}</div> // ✅ pass column
        )}
        {footerTotalsConfig.showCounts && count !== undefined && (
          <div>Count: {count}</div>
        )}
      </div>
    );
  };

  // Toolbar components
  const leftToolbarTemplate = () => (
    <div>
      {enableSearch && enableGlobalFilter && (
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder={globalFilterPlaceholder}
            value={globalFilterValue}
            onChange={(e) => handleSearch(e.target.value)}
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
    <div>
      {selectedRows.length > 0 && enableBulkActions && bulkActions.length > 0 && (
        <div>
          <span>
            {selectedRows.length} selected
          </span>
          {bulkActions.map((action, index) => (
            <Button
              key={index}
              label={action.title}
              onClick={() => handleBulkAction(action)}
              className="p-button-sm"
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
        <div>
          <RefreshCw size={24} className="animate-spin" />
          Loading data...
        </div>
      </div>
    );
  }

  if (tableError) {
    return (
      <div className={className} style={style}>
        <div>
          <X size={24} />
          Error: {tableError}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {/* Debug Info - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div>
          <strong>Debug Info:</strong><br/>
          <strong>Data:</strong> {data.length} rows<br/>
          <strong>Columns:</strong> {columns.length} custom, {defaultColumns.length} total<br/>
          <strong>Custom Formatters:</strong> {Object.keys(customFormatters).length}<br/>
          <strong>Custom Templates:</strong> {Object.keys(customTemplates).length}<br/>

          <strong>Row Actions:</strong> {rowActions.length}<br/>
          <strong>Bulk Actions:</strong> {bulkActions.length}<br/>
          <strong>Column Groups:</strong> {columnGroups.length}<br/>
          <strong>Features:</strong> Search:{enableSearch ? '✓' : '✗'} | Filter:{enableColumnFilter ? '✓' : '✗'} | Sort:{enableSorting ? '✓' : '✗'} | Pagination:{enablePagination ? '✓' : '✗'}<br/>
          <strong>Column Grouping:</strong> {enableColumnGrouping ? '✓' : '✗'}<br/>
          <strong>Size:</strong> {tableSize}<br/>
          <strong>Theme:</strong> Native PrimeReact
        </div>
      )}
      

      
      {/* Toolbar */}
      <Toolbar
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
        className="mb-4"
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
        onFilter={(e) => {
          // Update filters first
          handleFilter(e);
          
          // Update filtered data for totals calculation
          if (enableFooterTotals) {
            // Get the filtered data from PrimeReact event
            let filteredRows = tableData;
            
            // Try to get filtered data from various event properties
            if (e.filteredValue && Array.isArray(e.filteredValue)) {
              filteredRows = e.filteredValue;
            } else if (e.value && Array.isArray(e.value)) {
              filteredRows = e.value;
            } else if (e.data && Array.isArray(e.data)) {
              filteredRows = e.data;
            } else {
              // Apply filters manually using the updated filters
              filteredRows = applyFiltersToData(tableData, e.filters);
            }
            
            // Ensure filtered rows are valid objects
            const validFilteredRows = filteredRows.filter(row => row && typeof row === 'object');
            setFilteredDataForTotals(validFilteredRows);
          }
        }}
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
        
        // Enhanced pagination
        showFirstLastIcon={showFirstLastIcon}
        showPageLinks={showPageLinks}
        showCurrentPageReport={showCurrentPageReport}
        currentPageReportTemplate={currentPageReportTemplate}
        
        // Enhanced filtering
        filterDelay={filterDelay}
        globalFilterPlaceholder={globalFilterPlaceholder}
        filterLocale={filterLocale}
        
        // Inline editing
        editingRows={enableInlineEditing ? localEditingRows : undefined}
        onRowEditSave={enableInlineEditing ? handleRowEditSave : undefined}
        onRowEditCancel={enableInlineEditing ? handleRowEditCancel : undefined}
        onRowEditInit={enableInlineEditing ? handleRowEditInit : undefined}
        onEditingRowsChange={enableInlineEditing ? handleEditingRowsChange : undefined}
        

        contextMenu={enableContextMenu ? contextMenu : undefined}
        contextMenuSelection={enableContextMenu ? localContextMenuSelection : undefined}
        onContextMenuSelectionChange={enableContextMenu ? handleContextMenuSelectionChange : undefined}
        onContextMenu={enableContextMenu ? handleContextMenu : undefined}
        
        // Advanced selection
        selectionMode={enableRowSelection ? selectionMode : undefined}
        metaKeySelection={enableRowSelection ? metaKeySelection : undefined}
        selectOnEdit={enableRowSelection ? selectOnEdit : undefined}

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

            frozen={enableFrozenColumns}
          />
        )}

        {defaultColumns.map(column => {
          const isImageField = imageFields && Array.isArray(imageFields) && imageFields.includes(column.key);
          const columnKey = column.key;
          
          // Enhanced categorical detection including explicit configuration
          const uniqueValues = getUniqueValues(tableData, columnKey);
          const isCategorical = (
            dropdownFilterColumns.includes(columnKey) ||
            (uniqueValues.length > 0 && uniqueValues.length <= 30) ||
            column.type === 'dropdown' ||
            column.type === 'select' ||
            column.isCategorical
          );
          return (
            <Column
              key={column.key}
              field={column.key}
              header={column.title}
              sortable={column.sortable && enableSorting}
              filter={column.filterable && enableColumnFilter}
              filterElement={(options) => getColumnFilterElement(
                column,
                options.value,
                options.filterCallback
              )}
              filterPlaceholder={`Filter ${column.title}...`}
              filterClear={enableFilterClear ? filterClearTemplate : undefined}
              filterApply={enableFilterApply ? filterApplyTemplate : undefined}
              filterFooter={enableFilterFooter ? () => filterFooterTemplate(column) : undefined}
              footer={enableFooterTotals ? () => footerTemplate(column) : undefined}
              showFilterMatchModes={enableFilterMatchModes}
              filterMatchMode={isCategorical ? FilterMatchMode.EQUALS : (column.filterMatchMode || FilterMatchMode.CONTAINS)}
              filterMaxLength={column.filterMaxLength}
              filterMinLength={column.filterMinLength}
              filterOptions={generateFilterOptions(column)}
              filterOptionLabel={column.filterOptionLabel || 'label'}
              filterOptionValue={column.filterOptionValue || 'value'}
              filterShowClear={enableFilterClear}
              filterShowApply={enableFilterApply}
              filterShowMenu={enableFilterMenu}
              filterShowMatchModes={enableFilterMatchModes}

              body={isImageField ? (rowData) => imageBodyTemplate(rowData, column) :
                    column.type === 'date' || column.type === 'datetime' ? (rowData) => dateBodyTemplate(rowData, column) :
                    column.type === 'number' ? (rowData) => numberBodyTemplate(rowData, column) :
                    column.type === 'boolean' ? (rowData) => booleanBodyTemplate(rowData, column) :
                    parsedCustomFormatters[column.key] ? (rowData) => parsedCustomFormatters[column.key](rowData[column.key], rowData) :
                    customTemplates[column.key] ? (rowData) => customTemplates[column.key](rowData, column) :
                    column.render ? (rowData) => column.render(rowData[column.key], rowData) : undefined}

              frozen={enableFrozenColumns && column.key === defaultColumns[0]?.key}
            />
          );
        })}

        {enableRowActions && rowActions.length > 0 && (
          <Column
            body={actionsBodyTemplate}
            header="Actions"

            frozen={enableFrozenColumns ? "right" : undefined}
          />
        )}
      </DataTable>

      {/* Image Modal */}
      <Dialog
        visible={showImageModal}
        onHide={() => setShowImageModal(false)}
        header={imageModalAlt}

        modal
        className="p-fluid"
      >
        <img
          src={imageModalSrc}
          alt={imageModalAlt}

        />
      </Dialog>

      {/* Column Manager Dialog */}
      <Dialog
        visible={showColumnManager}
        onHide={() => setShowColumnManager(false)}
        header="Manage Columns"

        modal
      >
        <div>
          {defaultColumns.map(column => (
            <div key={column.key}>
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

      {/* Context Menu */}
      {enableContextMenu && contextMenu && (
        <ContextMenu
          model={contextMenu}
          ref={contextMenuRef}
        />
      )}
    </div>
  );
};

export default PrimeDataTable; 