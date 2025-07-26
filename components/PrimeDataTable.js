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
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import Image from 'next/image';


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

// Pivot Table Helper Functions
const parsePivotFieldName = (fieldName, config) => {
  if (config.parseFieldName && typeof config.parseFieldName === 'function') {
    return config.parseFieldName(fieldName);
  }
  
  // Default parsing logic for fields like "2025-04-01__serviceAmount"
  if (fieldName.includes(config.fieldSeparator)) {
    const parts = fieldName.split(config.fieldSeparator);
    return {
      prefix: parts[0], // e.g., "2025-04-01"
      suffix: parts.slice(1).join(config.fieldSeparator), // e.g., "serviceAmount"
      isDateField: config.dateFieldPattern.test(parts[0]),
      originalField: fieldName
    };
  }
  
  return {
    prefix: null,
    suffix: fieldName,
    isDateField: false,
    originalField: fieldName
  };
};

// Group data by specified fields
const groupDataBy = (data, groupFields) => {
  const groups = {};
  
  data.forEach(row => {
    if (!row || typeof row !== 'object') return;
    
    // Create a key based on the grouping fields
    const key = groupFields.map(field => row[field] || '').join('|');
    
    if (!groups[key]) {
      groups[key] = {
        key,
        groupValues: {},
        rows: []
      };
      
      // Store the group values for easy access
      groupFields.forEach(field => {
        groups[key].groupValues[field] = row[field];
      });
    }
    
    groups[key].rows.push(row);
  });
  
  return Object.values(groups);
};

  // Transform data into pivot structure
const transformToPivotData = (data, config) => {
  if (!config.enabled || !data.length) {
    return { pivotData: data, pivotColumns: [] };
  }
  
  const { rows, columns, values, filters } = config;
  
  // Step 1: Apply pivot filters if any
  let filteredData = data;
  if (filters && filters.length > 0) {
    // For now, we'll handle filters through the existing filter system
    // Could be enhanced to have specific pivot filter logic
  }
  
  // Step 2: If no pivot configuration, return original data
  if (rows.length === 0 && columns.length === 0 && values.length === 0) {
    return { pivotData: filteredData, pivotColumns: [] };
  }
  
  // Step 3: Group data by row fields
  const rowGroups = rows.length > 0 ? groupDataBy(filteredData, rows) : [{ key: 'all', groupValues: {}, rows: filteredData }];
  
  // Step 4: Get unique column values
  let columnValues = [];
  if (columns.length > 0) {
    columns.forEach(colField => {
      const uniqueVals = getUniqueValues(filteredData, colField);
      columnValues = [...columnValues, ...uniqueVals];
    });
    columnValues = [...new Set(columnValues)];
    
    if (config.sortColumns) {
      columnValues.sort((a, b) => {
        if (config.sortDirection === 'desc') {
          return String(b).localeCompare(String(a));
        }
        return String(a).localeCompare(String(b));
      });
    }
  }
  
  // Step 5: Create pivot structure
  const pivotData = [];
  
  rowGroups.forEach(rowGroup => {
    const pivotRow = { ...rowGroup.groupValues };
    
    // Add row totals
    if (config.showRowTotals && values.length > 0) {
      values.forEach(valueConfig => {
        const fieldName = valueConfig.field;
        const aggregation = valueConfig.aggregation || 'sum';
        const aggregateFunc = config.aggregationFunctions[aggregation];
        
        if (aggregateFunc) {
          const allValues = rowGroup.rows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
          pivotRow[`${fieldName}_total`] = aggregateFunc(allValues);
        }
      });
    }
    
    // Add column-specific values
    if (columns.length > 0 && columnValues.length > 0) {
      columnValues.forEach(colValue => {
        // Filter rows for this specific column value
        const colRows = rowGroup.rows.filter(row => {
          return columns.some(colField => row[colField] === colValue);
        });
        
        // Calculate aggregated values for each value field
        values.forEach(valueConfig => {
          const fieldName = valueConfig.field;
          const aggregation = valueConfig.aggregation || 'sum';
          const aggregateFunc = config.aggregationFunctions[aggregation];
          
          if (aggregateFunc) {
            const colValues = colRows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
            const columnKey = `${colValue}_${fieldName}`;
            pivotRow[columnKey] = colValues.length > 0 ? aggregateFunc(colValues) : 0;
          }
        });
      });
    } else {
      // No column grouping, just calculate values
      values.forEach(valueConfig => {
        const fieldName = valueConfig.field;
        const aggregation = valueConfig.aggregation || 'sum';
        const aggregateFunc = config.aggregationFunctions[aggregation];
        
        if (aggregateFunc) {
          const allValues = rowGroup.rows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
          pivotRow[fieldName] = aggregateFunc(allValues);
        }
      });
    }
    
    pivotData.push(pivotRow);
  });
  
  // Step 6: Add grand totals row if needed
  if (config.showGrandTotals && pivotData.length > 0) {
    const grandTotalRow = { isGrandTotal: true };
    
    // Set row field values to "Grand Total"
    rows.forEach(rowField => {
      grandTotalRow[rowField] = 'Grand Total';
    });
    
    // Calculate grand totals for each value
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      const aggregateFunc = config.aggregationFunctions[aggregation];
      
      if (aggregateFunc) {
        const allValues = filteredData.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
        
        if (config.showRowTotals) {
          grandTotalRow[`${fieldName}_total`] = aggregateFunc(allValues);
        }
        
        if (columns.length > 0) {
          columnValues.forEach(colValue => {
            const colRows = filteredData.filter(row => {
              return columns.some(colField => row[colField] === colValue);
            });
            const colValues = colRows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined);
            const columnKey = `${colValue}_${fieldName}`;
            grandTotalRow[columnKey] = colValues.length > 0 ? aggregateFunc(colValues) : 0;
        });
      } else {
          grandTotalRow[fieldName] = aggregateFunc(allValues);
        }
      }
    });
    
    pivotData.push(grandTotalRow);
  }
  
  // Step 7: Generate pivot columns
  const pivotColumns = generatePivotColumns(config, columnValues);
  
  return { pivotData, pivotColumns, columnValues };
};

// Generate columns for pivot table
const generatePivotColumns = (config, columnValues) => {
  const { rows, columns, values } = config;
  const pivotColumns = [];
  
  // Add row grouping columns
  rows.forEach(rowField => {
    pivotColumns.push({
      key: rowField,
      title: rowField.charAt(0).toUpperCase() + rowField.slice(1).replace(/([A-Z])/g, ' $1'),
      sortable: true,
      filterable: true,
      type: 'text',
      isPivotRow: true
          });
        });
  
  // Add value columns (when no column grouping)
  if (columns.length === 0) {
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      
      pivotColumns.push({
        key: fieldName,
        title: `${fieldName} (${aggregation})`,
        sortable: true,
        filterable: true,
        type: 'number',
        isPivotValue: true
      });
    });
  } else {
    // Add column-grouped value columns
    columnValues.forEach(colValue => {
      values.forEach(valueConfig => {
        const fieldName = valueConfig.field;
        const aggregation = valueConfig.aggregation || 'sum';
        const columnKey = `${colValue}_${fieldName}`;
        
        pivotColumns.push({
          key: columnKey,
          title: `${colValue} - ${fieldName} (${aggregation})`,
          sortable: true,
          filterable: true,
          type: 'number',
          isPivotValue: true,
          pivotColumn: colValue,
          pivotField: fieldName
        });
      });
    });
  }
  
  // Add row total columns
  if (config.showRowTotals && values.length > 0) {
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      
      pivotColumns.push({
        key: `${fieldName}_total`,
        title: `${fieldName} Total`,
        sortable: true,
        filterable: true,
        type: 'number',
        isPivotTotal: true
      });
    });
  }
  
  return pivotColumns;
};

/**
 * PrimeDataTable Component with Configurable Column Filters and Pivot Table Support
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
 * Pivot Table Configuration:
 * - enablePivotTable: Boolean to enable pivot table functionality
 * - pivotConfig: Object with pivot configuration
 *   Example: {
 *     enabled: true,
 *     rows: ["drName", "salesTeam"], // Row grouping fields
 *     columns: ["date"], // Column grouping fields  
 *     values: [
 *       { field: "serviceAmount", aggregation: "sum" },
 *       { field: "supportValue", aggregation: "sum" }
 *     ],
 *     showGrandTotals: true,
 *     showRowTotals: true
 *   }
 *
 * Usage Examples:
 * 
 * Basic Table:
 * <PrimeDataTable
 *   data={salesData}
 *   dropdownFilterColumns={["salesteam", "status"]}
 *   datePickerFilterColumns={["createdDate"]}
 *   numberFilterColumns={["amount"]}
 * />
 *
 * Pivot Table:
 * <PrimeDataTable
 *   data={salesData}
 *   enablePivotTable={true}
 *   pivotConfig={{
 *     enabled: true,
 *     rows: ["drName", "salesTeam"],
 *     columns: ["date"],
 *     values: [
 *       { field: "serviceAmount", aggregation: "sum" },
 *       { field: "supportValue", aggregation: "average" }
 *     ],
 *     showGrandTotals: true,
 *     showRowTotals: true,
 *     fieldSeparator: "__", // For parsing "2025-04-01__serviceAmount" style fields
 *     numberFormat: "en-US",
 *     currency: "USD"
 *   }}
 *   currencyColumns={["serviceAmount", "supportValue"]}
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
  forceFilterDisplayWithGrouping = false, // Force specific filterDisplay mode even with grouping
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
  enableAutoColumnGrouping = false, // New: Auto-detect column groups from data
  headerColumnGroup = null,
  footerColumnGroup = null,
  columnGroups = [],
  groupConfig = {
    enableHeaderGroups: true,
    enableFooterGroups: true,
    groupStyle: {},
    headerGroupStyle: {},
    footerGroupStyle: {},
    groupingPatterns: [], // Custom patterns for grouping
    ungroupedColumns: [], // Columns that should not be grouped
    totalColumns: [], // Columns that represent totals
    groupSeparator: '__', // Default separator for detecting groups
    customGroupMappings: {} // Custom word to group name mappings e.g., { "inventory": "Inventory", "warehouse": "Warehouse" }
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
  },
  
  // Pivot Table Props - Excel-like pivot functionality  
  enablePivotTable = false,
  
  // Individual pivot props for Plasmic interface
  pivotRows = [],
  pivotColumns = [],
  pivotValues = [],
  pivotFilters = [],
  pivotShowGrandTotals = true,
  pivotShowRowTotals = true,
  pivotShowColumnTotals = true,
  pivotShowSubTotals = true,
  pivotNumberFormat = "en-US",
  pivotCurrency = "USD",
  pivotPrecision = 2,
  pivotFieldSeparator = "__",
  pivotSortRows = true,
  pivotSortColumns = true,
  pivotSortDirection = "asc",
  pivotAggregationFunctions = {},
  
  // Combined pivot config object (alternative to individual props)
  pivotConfig = {
    enabled: false,
    rows: [], // Array of field names to use as row grouping (like Excel's "Rows" area)
    columns: [], // Array of field names to use as column headers (like Excel's "Columns" area)  
    values: [], // Array of objects with field name and aggregation function (like Excel's "Values" area)
    filters: [], // Array of field names to use as pivot filters (like Excel's "Filters" area)
    
    // Aggregation functions
    aggregationFunctions: {
      sum: (values) => values.reduce((a, b) => (a || 0) + (b || 0), 0),
      count: (values) => values.filter(v => v !== null && v !== undefined).length,
      average: (values) => {
        const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
        return validValues.length > 0 ? validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
      },
      min: (values) => {
        const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
        return validValues.length > 0 ? Math.min(...validValues) : 0;
      },
      max: (values) => {
        const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
        return validValues.length > 0 ? Math.max(...validValues) : 0;
      },
      first: (values) => values.find(v => v !== null && v !== undefined) || '',
      last: (values) => {
        const validValues = values.filter(v => v !== null && v !== undefined);
        return validValues.length > 0 ? validValues[validValues.length - 1] : '';
      }
    },
    
    // Display options
    showGrandTotals: true,
    showSubTotals: true,
    showRowTotals: true,
    showColumnTotals: true,
    
    // Formatting options
    numberFormat: 'en-US',
    currency: 'USD',
    precision: 2,
    
    // Data parsing options for complex field names like "2025-04-01__serviceAmount"
    fieldSeparator: '__', // Separator used in field names to split date/category and metric
    dateFieldPattern: /^\d{4}-\d{2}-\d{2}$/, // Pattern to identify date fields
    
    // Custom field parsing functions
    parseFieldName: null, // Custom function to parse complex field names
    formatFieldName: null, // Custom function to format field names for display
    
    // Grouping options
    sortRows: true,
    sortColumns: true,
    sortDirection: 'asc' // 'asc' or 'desc'
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

  // Pivot table state
  const [pivotDataCache, setPivotDataCache] = useState(null);
  const [pivotColumnsCache, setPivotColumnsCache] = useState([]);

  // Merge individual pivot props with pivotConfig object
  // Individual props take priority (for Plasmic usage), fallback to pivotConfig
  const mergedPivotConfig = useMemo(() => {
    const hasIndividualProps = pivotRows.length > 0 || pivotColumns.length > 0 || pivotValues.length > 0;
    
    if (hasIndividualProps) {
      // Use individual props (Plasmic interface)
      return {
        enabled: enablePivotTable,
        rows: pivotRows,
        columns: pivotColumns,
        values: pivotValues,
        filters: pivotFilters,
        showGrandTotals: pivotShowGrandTotals,
        showRowTotals: pivotShowRowTotals,
        showColumnTotals: pivotShowColumnTotals,
        showSubTotals: pivotShowSubTotals,
        numberFormat: pivotNumberFormat,
        currency: pivotCurrency,
        precision: pivotPrecision,
        fieldSeparator: pivotFieldSeparator,
        sortRows: pivotSortRows,
        sortColumns: pivotSortColumns,
        sortDirection: pivotSortDirection,
        aggregationFunctions: {
          ...pivotConfig.aggregationFunctions,
          ...pivotAggregationFunctions
        }
      };
    }
    
    // Use pivotConfig object (direct usage)
    return {
      ...pivotConfig,
      enabled: enablePivotTable && pivotConfig.enabled
    };
  }, [
    enablePivotTable, pivotRows, pivotColumns, pivotValues, pivotFilters,
    pivotShowGrandTotals, pivotShowRowTotals, pivotShowColumnTotals, pivotShowSubTotals,
    pivotNumberFormat, pivotCurrency, pivotPrecision, pivotFieldSeparator,
    pivotSortRows, pivotSortColumns, pivotSortDirection, pivotAggregationFunctions,
    pivotConfig
  ]);

  const [isPivotEnabled, setIsPivotEnabled] = useState(enablePivotTable && mergedPivotConfig.enabled);

  // Use GraphQL data if available, otherwise use provided data
  const tableData = graphqlQuery ? graphqlData : data;
  const isLoading = graphqlQuery ? graphqlLoading : loading;
  const tableError = graphqlQuery ? graphqlError : error;

    // Pivot data transformation
  const pivotTransformation = useMemo(() => {
    if (!isPivotEnabled || !mergedPivotConfig.enabled) {
      return { 
        pivotData: tableData, 
        pivotColumns: [], 
        columnValues: [], 
        isPivot: false 
      };
    }

    try {
      const result = transformToPivotData(tableData, mergedPivotConfig);
      return {
        ...result,
        isPivot: true
      };
    } catch (error) {
      console.error('Error transforming data to pivot:', error);
      return { 
        pivotData: tableData, 
        pivotColumns: [], 
        columnValues: [], 
        isPivot: false 
      };
    }
  }, [tableData, isPivotEnabled, mergedPivotConfig]);

  // Final data source - either original data or pivot data
  const finalTableData = pivotTransformation.isPivot ? pivotTransformation.pivotData : tableData;
  const hasPivotData = pivotTransformation.isPivot && pivotTransformation.pivotData.length > 0;

  const getColumnType = useCallback((column) => {
    const key = column.key;

    if (dropdownFilterColumns?.includes(key)) return 'dropdown';
    if (numberFilterColumns?.includes(key)) return 'number';
    if (datePickerFilterColumns?.includes(key)) return 'date';
    if (booleanFilterColumns?.includes(key)) return 'boolean';
    if (textFilterColumns?.includes(key)) return 'text';

    return column.type || 'text'; // fallback
  }, [dropdownFilterColumns, numberFilterColumns, datePickerFilterColumns, booleanFilterColumns, textFilterColumns]);

  // Function to generate the correct filter UI for a column based on its type and data
  const getColumnFilterElement = useCallback((column, filterValue, filterCallback) => {
    const columnType = getColumnType(column);
    const columnKey = column.key;

    switch (columnType) {
      case 'dropdown':
      case 'select':
      case 'categorical': {
        const uniqueValues = getUniqueValues(tableData, columnKey);
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

      case 'date':
      case 'datetime':
        return (
          <Calendar
            value={filterValue || null}
            onChange={(e) => filterCallback(e.value)}
            placeholder="Select date range"
            className="p-column-filter"
            dateFormat="yy-mm-dd"
            selectionMode="range"
            showIcon
          />
        );

      case 'number':
        return (
          <InputNumber
            value={filterValue || null}
            onValueChange={(e) => filterCallback(e.value)}
            placeholder={`Enter ${column.title}`}
            className="p-column-filter"
            inputStyle={{ width: '100%' }}
          />
        );

      case 'boolean':
        return (
          <Dropdown
            value={filterValue}
            options={[
              { label: 'All', value: null },
              { label: 'True', value: true },
              { label: 'False', value: false }
            ]}
            onChange={(e) => filterCallback(e.value)}
            placeholder="Select..."
            className="p-column-filter"
            showClear
          />
        );

      default:
        return (
          <InputText
            value={filterValue || ''}
            onChange={(e) => filterCallback(e.target.value || null)}
            placeholder={`Filter ${column.title}...`}
            className="p-column-filter"
          />
        );
    }
  }, [tableData, getColumnType]);





  // Enhanced column generation with data type detection
  const defaultColumns = useMemo(() => {
    let cols = [];

    // Use pivot columns if pivot is enabled and available
    if (pivotTransformation.isPivot && pivotTransformation.pivotColumns.length > 0) {
      cols = pivotTransformation.pivotColumns.map(col => ({
        ...col,
        sortable: col.sortable !== false,
        filterable: col.filterable !== false,
        type: col.type || 'text'
      }));
    } else if (columns.length > 0) {
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
    } else if (finalTableData.length > 0) {
      const sampleRow = finalTableData[0];
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
  }, [columns, finalTableData, hiddenColumns, columnOrder, fields, pivotTransformation.isPivot, pivotTransformation.pivotColumns]);

  // Auto-detect column grouping patterns
  const autoDetectedColumnGroups = useMemo(() => {
    if (!enableAutoColumnGrouping || !tableData.length) {
      return { groups: [], ungroupedColumns: defaultColumns };
    }

    const { groupSeparator, ungroupedColumns, totalColumns, groupingPatterns, customGroupMappings } = groupConfig;
    const groups = [];
    const processedColumns = new Set();
    const remainingColumns = [];

    // Step 1: Handle explicitly ungrouped columns
    const explicitlyUngroupedColumns = defaultColumns.filter(col => 
      ungroupedColumns.includes(col.key)
    );
    explicitlyUngroupedColumns.forEach(col => processedColumns.add(col.key));

    // Step 2: Detect groups by separator pattern (e.g., "2025-04-01__serviceAmount")
    const separatorGroups = {};
    defaultColumns.forEach(col => {
      if (processedColumns.has(col.key)) return;
      
      if (col.key.includes(groupSeparator)) {
        const parts = col.key.split(groupSeparator);
        if (parts.length >= 2) {
          const prefix = parts[0]; // e.g., "2025-04-01"
          const suffix = parts.slice(1).join(groupSeparator); // e.g., "serviceAmount"
          
          // Extract group name from suffix (e.g., "service" from "serviceAmount")
          let groupName = suffix;
          const suffixLower = suffix.toLowerCase();
          
          // Step 1: Check custom group mappings first
          let customMatch = false;
          if (customGroupMappings && Object.keys(customGroupMappings).length > 0) {
            for (const [keyword, groupNameMapping] of Object.entries(customGroupMappings)) {
              if (suffixLower.includes(keyword.toLowerCase())) {
                groupName = groupNameMapping;
                customMatch = true;
                break;
              }
            }
          }
          
          // Step 2: If no custom match, try built-in business terms
          if (!customMatch) {
            if (suffixLower.includes('service')) {
              groupName = 'Service';
            } else if (suffixLower.includes('support')) {
              groupName = 'Support';
            } else if (suffixLower.includes('sales')) {
              groupName = 'Sales';
            } else if (suffixLower.includes('marketing')) {
              groupName = 'Marketing';
            } else if (suffixLower.includes('revenue')) {
              groupName = 'Revenue';
            } else if (suffixLower.includes('cost')) {
              groupName = 'Cost';
            } else if (suffixLower.includes('expense')) {
              groupName = 'Expense';
            } else if (suffixLower.includes('profit')) {
              groupName = 'Profit';
            } else if (suffixLower.includes('budget')) {
              groupName = 'Budget';
            } else if (suffixLower.includes('target')) {
              groupName = 'Target';
            } else if (suffixLower.includes('actual')) {
              groupName = 'Actual';
            } else if (suffixLower.includes('forecast')) {
              groupName = 'Forecast';
            } else {
              // Extract first meaningful word from suffix
              const firstWord = suffix.match(/^([a-zA-Z]+)/);
              if (firstWord && firstWord[1].length > 2) {
                groupName = firstWord[1].charAt(0).toUpperCase() + firstWord[1].slice(1);
              } else {
                // If no good match, use the full suffix as group name
                groupName = suffix.charAt(0).toUpperCase() + suffix.slice(1);
              }
            }
          }

          if (!separatorGroups[groupName]) {
            separatorGroups[groupName] = [];
          }
          
          separatorGroups[groupName].push({
            ...col,
            originalKey: col.key,
            groupPrefix: prefix,
            groupSuffix: suffix,
            subHeader: suffix.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
          });
          
          processedColumns.add(col.key);
        }
      }
    });

    // Step 3: Handle custom grouping patterns
    groupingPatterns.forEach(pattern => {
      const regex = new RegExp(pattern.regex);
      defaultColumns.forEach(col => {
        if (processedColumns.has(col.key)) return;
        
        if (regex.test(col.key)) {
          const match = col.key.match(regex);
          const groupName = pattern.groupName || match[1] || 'Group';
          
          if (!separatorGroups[groupName]) {
            separatorGroups[groupName] = [];
          }
          
          separatorGroups[groupName].push({
            ...col,
            originalKey: col.key,
            subHeader: pattern.subHeaderExtractor ? pattern.subHeaderExtractor(col.key) : col.title
          });
          
          processedColumns.add(col.key);
        }
      });
    });

    // Step 4: Convert separator groups to column groups
    Object.entries(separatorGroups).forEach(([groupName, groupColumns]) => {
      if (groupColumns.length > 0) {
        groups.push({
          header: groupName,
          columns: groupColumns.sort((a, b) => {
            // Sort by prefix first, then by suffix
            const prefixCompare = (a.groupPrefix || '').localeCompare(b.groupPrefix || '');
            if (prefixCompare !== 0) return prefixCompare;
            return (a.groupSuffix || '').localeCompare(b.groupSuffix || '');
          })
        });
      }
    });

    // Step 5: Handle total columns - try to group them with their parent groups
    const totalCols = defaultColumns.filter(col => 
      !processedColumns.has(col.key) && (
        totalColumns.includes(col.key) || 
        col.key.toLowerCase().includes('total') ||
        col.title.toLowerCase().includes('total')
      )
    );

         totalCols.forEach(col => {
       // Try to match total column to existing group
       let matched = false;
       const colLower = col.key.toLowerCase();
       
       groups.forEach(group => {
         const groupNameLower = group.header.toLowerCase();
         if (colLower.includes(groupNameLower)) {
           group.columns.push({
             ...col,
             originalKey: col.key,
             subHeader: col.title,
             isTotal: true
           });
           matched = true;
           processedColumns.add(col.key);
         }
       });

       if (!matched) {
         // Add to remaining columns if no group match (don't create separate Totals group)
         remainingColumns.push(col);
         processedColumns.add(col.key);
       }
     });

    // Step 6: Remaining ungrouped columns
    defaultColumns.forEach(col => {
      if (!processedColumns.has(col.key)) {
        remainingColumns.push(col);
      }
    });

    return {
      groups,
      ungroupedColumns: [...explicitlyUngroupedColumns, ...remainingColumns]
    };
  }, [enableAutoColumnGrouping, defaultColumns, tableData, groupConfig]);

  // Final column structure with grouping
  const finalColumnStructure = useMemo(() => {
    if (!enableColumnGrouping) {
      return { columns: defaultColumns, hasGroups: false };
    }

    if (enableAutoColumnGrouping) {
      return {
        columns: defaultColumns,
        hasGroups: autoDetectedColumnGroups.groups.length > 0,
        groups: autoDetectedColumnGroups.groups,
        ungroupedColumns: autoDetectedColumnGroups.ungroupedColumns
      };
    }

    // Use manual column groups
    return {
      columns: defaultColumns,
      hasGroups: columnGroups.length > 0,
      groups: columnGroups,
      ungroupedColumns: defaultColumns
    };
  }, [enableColumnGrouping, enableAutoColumnGrouping, defaultColumns, autoDetectedColumnGroups, columnGroups]);


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

  // Parse customFormatters from strings to functions using useMemo
  const parsedCustomFormatters = useMemo(() => {
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

  // Debug customFormatters
  useEffect(() => {
    if (Object.keys(customFormatters).length > 0) {
      console.log('Original Custom Formatters:', customFormatters);
      console.log('Parsed Custom Formatters:', parsedCustomFormatters);
      console.log('Custom Formatters Keys:', Object.keys(customFormatters));
    }
  }, [customFormatters, parsedCustomFormatters]);

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
    
    // Reset all filters to default state
    const clearedFilters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
    
    // Reset column filters to default state
    defaultColumns.forEach(col => {
      if (col.filterable && enableColumnFilter) {
        clearedFilters[col.key] = { 
          operator: FilterOperator.AND, 
          constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] 
        };
      }
    });
    
    setFilters(clearedFilters);
    setSortField(null);
    setSortOrder(1);
    
    // Clear filtered data for totals
    if (enableFooterTotals) {
      setFilteredDataForTotals(tableData.filter(row => row && typeof row === 'object'));
    }
  }, [defaultColumns, enableColumnFilter, enableFooterTotals, tableData]);

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
      <Image
        src={value}
        alt={column.key}
        width={50}
        height={50}
        style={{ objectFit: 'cover', cursor: isPopup ? 'pointer' : 'default' }}
        onClick={isPopup ? () => { 
          setImageModalSrc(value); 
          setImageModalAlt(column.key); 
          setShowImageModal(true); 
        } : undefined}
      />
    );
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

  // Pivot table specific formatters
  const pivotValueBodyTemplate = useCallback((rowData, column) => {
    const value = rowData[column.key];
    if (value === null || value === undefined) return '-';
    
    // Check if this row is a grand total
    const isGrandTotal = rowData.isGrandTotal;
    
    // Format number based on pivot config
    let formattedValue;
    if (currencyColumns.includes(column.key) || column.pivotField && currencyColumns.includes(column.pivotField)) {
      formattedValue = new Intl.NumberFormat(mergedPivotConfig.numberFormat, {
        style: 'currency',
        currency: mergedPivotConfig.currency,
        minimumFractionDigits: mergedPivotConfig.precision,
        maximumFractionDigits: mergedPivotConfig.precision
      }).format(value);
    } else {
      formattedValue = new Intl.NumberFormat(mergedPivotConfig.numberFormat, {
        minimumFractionDigits: mergedPivotConfig.precision,
        maximumFractionDigits: mergedPivotConfig.precision
      }).format(value);
    }
    
    // Apply special styling for totals
    const className = classNames({
      'font-bold': isGrandTotal || column.isPivotTotal,
      'text-blue-600': column.isPivotTotal && !isGrandTotal,
      'text-green-600 font-semibold': isGrandTotal,
      'bg-blue-50': column.isPivotTotal && !isGrandTotal,
      'bg-green-50': isGrandTotal
    });
    
    return (
      <span className={className}>
        {formattedValue}
      </span>
    );
  }, [mergedPivotConfig, currencyColumns]);

  const pivotRowBodyTemplate = (rowData, column) => {
    const value = rowData[column.key];
    const isGrandTotal = rowData.isGrandTotal;
    
    const className = classNames({
      'font-bold text-green-600': isGrandTotal,
      'font-medium': !isGrandTotal
    });
    
    return (
      <span className={className}>
        {value || '-'}
      </span>
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

      {/* Clear Filters Button - Always show when column filtering is enabled */}
      {enableColumnFilter && (
        <Button
          icon="pi pi-filter-slash"
          label="Clear Filters"
          onClick={clearAllFilters}
          className="p-button-outlined p-button-warning p-button-sm"
          tooltip="Clear all column filters and search"
          tooltipOptions={{ position: 'top' }}
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
    if (!enableColumnGrouping || !finalColumnStructure.hasGroups) {
      return null;
    }

    const { groups, ungroupedColumns } = finalColumnStructure;

    // Create header rows for grouped columns
    const headerRows = [];

    // First row: Main group headers + ungrouped column headers
    const firstRowColumns = [];
    
    // Add ungrouped columns to first row
    ungroupedColumns.forEach(col => {
      firstRowColumns.push(
        <Column
          key={`ungrouped-${col.key}`}
          header={col.title}
          field={col.key}
          rowSpan={2} // Span both header rows since ungrouped
        />
      );
    });

    // Add group headers to first row
    groups.forEach(group => {
      firstRowColumns.push(
        <Column
          key={`group-${group.header}`}
          header={group.header}
          colSpan={group.columns.length}
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            ...groupConfig.headerGroupStyle
          }}
        />
      );
    });

    headerRows.push(
      <Row key="group-headers">
        {firstRowColumns}
      </Row>
    );

    // Second row: Sub-column headers for grouped columns
    const secondRowColumns = [];
    
    groups.forEach(group => {
      group.columns.forEach(col => {
        secondRowColumns.push(
          <Column
            key={`sub-${col.originalKey || col.key}`}
            header={col.subHeader || col.title}
            field={col.originalKey || col.key}
            style={{
              textAlign: 'center',
              fontSize: '0.9em',
              backgroundColor: 'var(--surface-50)',
              ...groupConfig.groupStyle
            }}
          />
        );
      });
    });

    headerRows.push(
      <Row key="sub-headers">
        {secondRowColumns}
      </Row>
    );

    return (
      <ColumnGroup>
        {headerRows}
      </ColumnGroup>
    );
  }, [enableColumnGrouping, finalColumnStructure, groupConfig]);

  // Generate footer groups from configuration
  const generateFooterGroups = useCallback(() => {
    if (!enableColumnGrouping || !groupConfig.enableFooterGroups || !finalColumnStructure.hasGroups) {
      return null;
    }

    // If custom footer group is provided, use it
    if (footerColumnGroup) {
      return footerColumnGroup;
    }

    const { groups, ungroupedColumns } = finalColumnStructure;

    // Create footer row
    const footerColumns = [];
    
    // Add ungrouped columns to footer
    ungroupedColumns.forEach(col => {
      footerColumns.push(
        <Column
          key={`footer-ungrouped-${col.key}`}
          footer={enableFooterTotals && col.type === 'number' ? () => footerTemplate(col) : null}
          field={col.key}
        />
      );
    });

    // Add grouped columns to footer
    groups.forEach(group => {
      group.columns.forEach(col => {
        footerColumns.push(
          <Column
            key={`footer-grouped-${col.originalKey || col.key}`}
            footer={enableFooterTotals && col.type === 'number' ? () => footerTemplate(col) : null}
            field={col.originalKey || col.key}
          />
        );
      });
    });

    return (
      <ColumnGroup>
        <Row>
          {footerColumns}
        </Row>
      </ColumnGroup>
    );
  }, [enableColumnGrouping, footerColumnGroup, finalColumnStructure, groupConfig.enableFooterGroups, enableFooterTotals, footerTemplate]);

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
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '0.85em' }}>
          <strong>Debug Info:</strong><br/>
          <strong>Data:</strong> {data.length} rows → {finalTableData.length} final rows<br/>
          <strong>Columns:</strong> {columns.length} custom, {defaultColumns.length} total<br/>
          <strong>Custom Formatters:</strong> {Object.keys(customFormatters).length}<br/>
          <strong>Custom Templates:</strong> {Object.keys(customTemplates).length}<br/>

          <strong>Row Actions:</strong> {rowActions.length}<br/>
          <strong>Bulk Actions:</strong> {bulkActions.length}<br/>
          <strong>Column Groups:</strong> {columnGroups.length}<br/>
          <strong>Features:</strong> Search:{enableSearch ? '✓' : '✗'} | Filter:{enableColumnFilter ? '✓' : '✗'} | Sort:{enableSorting ? '✓' : '✗'} | Pagination:{enablePagination ? '✓' : '✗'}<br/>
          <strong>Column Grouping:</strong> {enableColumnGrouping ? '✓' : '✗'}<br/>
          <strong>Auto Grouping:</strong> {enableAutoColumnGrouping ? '✓' : '✗'}<br/>
          
          <strong>Pivot Table:</strong> {pivotTransformation.isPivot ? '✓ Enabled' : '✗ Disabled'}<br/>
          {pivotTransformation.isPivot && (
            <>
              <strong>Pivot Rows:</strong> {mergedPivotConfig.rows.join(', ') || 'None'}<br/>
              <strong>Pivot Columns:</strong> {mergedPivotConfig.columns.join(', ') || 'None'}<br/>
              <strong>Pivot Values:</strong> {mergedPivotConfig.values.map(v => `${v.field} (${v.aggregation})`).join(', ') || 'None'}<br/>
              <strong>Generated Columns:</strong> {pivotTransformation.pivotColumns.length}<br/>
              <strong>Column Values:</strong> {pivotTransformation.columnValues?.join(', ') || 'None'}<br/>
            </>
          )}
          
          <strong>Size:</strong> {tableSize}<br/>
          <strong>Theme:</strong> Native PrimeReact<br/>
          
          {enableAutoColumnGrouping && (
            <>
              <strong>Auto-detected Groups:</strong> {autoDetectedColumnGroups.groups.length}<br/>
              {autoDetectedColumnGroups.groups.map((group, idx) => (
                <div key={idx} style={{ marginLeft: '1rem' }}>
                  <strong>{group.header}:</strong> {group.columns.map(col => col.originalKey || col.key).join(', ')}
                </div>
              ))}
              <strong>Ungrouped Columns:</strong> {autoDetectedColumnGroups.ungroupedColumns.map(col => col.key).join(', ')}<br/>
              <strong>Group Separator:</strong> {groupConfig.groupSeparator}<br/>
            </>
          )}
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
        value={finalTableData}
        loading={isLoading}
        filters={filters}
        filterDisplay={
          enableColumnFilter 
            ? (enableColumnGrouping && finalColumnStructure.hasGroups && !forceFilterDisplayWithGrouping 
                ? "row" 
                : filterDisplay)
            : undefined
        }
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
            let filteredRows = finalTableData;
            
            // Try to get filtered data from various event properties
            if (e.filteredValue && Array.isArray(e.filteredValue)) {
              filteredRows = e.filteredValue;
            } else if (e.value && Array.isArray(e.value)) {
              filteredRows = e.value;
            } else if (e.data && Array.isArray(e.data)) {
              filteredRows = e.data;
            } else {
              // Apply filters manually using the updated filters
              filteredRows = applyFiltersToData(finalTableData, e.filters);
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
        totalRecords={finalTableData.length}
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

        {(() => {
          // Generate columns in the correct order for grouping
          const columnsToRender = [];
          
          if (enableColumnGrouping && finalColumnStructure.hasGroups) {
            const { groups, ungroupedColumns } = finalColumnStructure;
            
            // First, add ungrouped columns
            ungroupedColumns.forEach(column => {
              columnsToRender.push(column);
            });
            
            // Then, add grouped columns in order
            groups.forEach(group => {
              group.columns.forEach(groupedColumn => {
                // Find the original column definition
                const originalColumn = defaultColumns.find(col => 
                  col.key === (groupedColumn.originalKey || groupedColumn.key)
                );
                if (originalColumn) {
                  columnsToRender.push({
                    ...originalColumn,
                    key: groupedColumn.originalKey || groupedColumn.key,
                    isGrouped: true,
                    groupName: group.header
                  });
                }
              });
            });
          } else {
            // No grouping, use default columns
            columnsToRender.push(...defaultColumns);
          }

          return columnsToRender.map(column => {
            const isImageField = imageFields && Array.isArray(imageFields) && imageFields.includes(column.key);
            const columnKey = column.key;
            const columnType = getColumnType(column);
            
            // Enhanced categorical detection including explicit configuration
            const uniqueValues = getUniqueValues(finalTableData, columnKey);
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
                header={column.title} // Keep headers for filters even with grouping
                sortable={column.sortable !== false && enableSorting}
                filter={column.filterable !== false && enableColumnFilter}
                filterElement={column.filterable !== false && enableColumnFilter ? (options) => getColumnFilterElement(
                  column,
                  options.value,
                  options.filterCallback
                ) : undefined}
                filterPlaceholder={`Filter ${column.title}...`}
                filterClear={enableFilterClear ? filterClearTemplate : undefined}
                filterApply={enableFilterApply ? filterApplyTemplate : undefined}
                filterFooter={enableFilterFooter ? () => filterFooterTemplate(column) : undefined}
                footer={enableFooterTotals && !finalColumnStructure.hasGroups ? () => footerTemplate(column) : undefined}

                showFilterMatchModes={
                  enableFilterMatchModes && 
                  !['dropdown', 'select', 'categorical', 'date', 'datetime', 'number', 'boolean'].includes(columnType)
                }
                filterMatchMode={
                  column.filterMatchMode || (
                    ['dropdown', 'select', 'categorical'].includes(columnType)
                      ? FilterMatchMode.EQUALS
                      : ['date', 'datetime'].includes(columnType)
                      ? FilterMatchMode.BETWEEN
                      : columnType === 'number'
                      ? FilterMatchMode.EQUALS
                      : columnType === 'boolean'
                      ? FilterMatchMode.EQUALS
                      : FilterMatchMode.CONTAINS
                  )
                }

                filterMaxLength={column.filterMaxLength}
                filterMinLength={column.filterMinLength}
                filterOptions={generateFilterOptions(column)}
                filterOptionLabel={column.filterOptionLabel || 'label'}
                filterOptionValue={column.filterOptionValue || 'value'}
                filterShowClear={enableFilterClear}
                filterShowApply={enableFilterApply}
                filterShowMenu={enableFilterMenu}
                filterShowMatchModes={enableFilterMatchModes}

                body={
                  // Pivot table specific templates
                  pivotTransformation.isPivot && column.isPivotValue ? (rowData) => pivotValueBodyTemplate(rowData, column) :
                  pivotTransformation.isPivot && column.isPivotTotal ? (rowData) => pivotValueBodyTemplate(rowData, column) :
                  pivotTransformation.isPivot && column.isPivotRow ? (rowData) => pivotRowBodyTemplate(rowData, column) :
                  
                  // Regular templates
                  isImageField ? (rowData) => imageBodyTemplate(rowData, column) :
                  columnType === 'date' || columnType === 'datetime' ? (rowData) => dateBodyTemplate(rowData, column) :
                  columnType === 'number' ? (rowData) => numberBodyTemplate(rowData, column) :
                  columnType === 'boolean' ? (rowData) => booleanBodyTemplate(rowData, column) :
                  parsedCustomFormatters[column.key] ? (rowData) => parsedCustomFormatters[column.key](rowData[column.key], rowData) :
                  customTemplates[column.key] ? (rowData) => customTemplates[column.key](rowData, column) :
                  column.render ? (rowData) => column.render(rowData[column.key], rowData) : undefined
                }

                frozen={enableFrozenColumns && column.key === defaultColumns[0]?.key}
              />
            );
          });
        })()}

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
        <Image
          src={imageModalSrc}
          alt={imageModalAlt}
          width={800}
          height={600}
          style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
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