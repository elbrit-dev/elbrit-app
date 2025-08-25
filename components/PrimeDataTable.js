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

// Import utility functions
import { usePlasmicCMS, defaultSaveToCMS, defaultLoadFromCMS } from './utils/cmsUtils';
import { mergeData, needsMerging, processData, getUniqueValues, getDataSize } from './utils/dataUtils';
import { transformToPivotData, generatePivotColumns, groupDataBy, parsePivotFieldName } from './utils/pivotUtils';
import { useROICalculation, calculateFooterTotals, formatFooterNumber, isNumericColumn } from './utils/calculationUtils';
import { formatCalculatedValue } from './utils/calculatedFieldsUtils';
import { getColumnType, applyFiltersToData, createClearAllFilters, safeFilterCallback, matchFilterValue, getFilterOptions, getColumnFilterElement } from './utils/filterUtils';
import { detectGroupKeywords, processFinalColumnStructure, generateDefaultColumns, createColumnGroups } from './utils/columnUtils';
import { 
  createImageBodyTemplate, 
  dateBodyTemplate, 
  numberBodyTemplate, 
  booleanBodyTemplate,
  createROIBodyTemplate,
  createPivotValueBodyTemplate,
  pivotRowBodyTemplate,
  createActionsBodyTemplate,
  createFilterClearTemplate,
  createFilterApplyTemplate,
  createFilterFooterTemplate,
  createFooterTemplate,
  createLeftToolbarTemplate,
  createRightToolbarTemplate,
  createFilterElement
} from './utils/templateUtils';

// Import additional extracted functions
import { createEventHandlers } from './utils/eventHandlers';
import { createPivotConfigHandlers } from './utils/pivotConfigUtils';
import { createColumnGroupingHandlers } from './utils/columnGroupingUtils';
import CalculatedFieldsManager from './CalculatedFieldsManager';

// HIBERNATION FIX: Production-safe console wrapper
const safeConsole = {
  log: process.env.NODE_ENV === 'development' ? console.log : () => {},
  warn: console.warn, // Keep warnings in production
  error: console.error, // Keep errors in production
  info: process.env.NODE_ENV === 'development' ? console.info : () => {}
};


import {
  RefreshCw,
  X,
  Calendar as CalendarIcon
} from "lucide-react";

import { useAuth } from './AuthContext';

// NEW: Direct Plasmic CMS integration functions
// CMS integration moved to utils/cmsUtils.js

// Data processing functions moved to utils/dataUtils.js

// Helper functions moved to utils/dataUtils.js

// Column helper functions moved to utils/dataUtils.js

// Pivot table functions moved to utils/pivotUtils.js

// Group data functions moved to utils/pivotUtils.js

// Large pivot transformation functions moved to utils/pivotUtils.js

// Generate pivot columns function moved to utils/pivotUtils.js

/**
 * PrimeDataTable Component with Configurable Column Filters, Pivot Table Support, and Auto-Merge
 *
 * Auto-Merge Configuration:
 * - enableAutoMerge: Boolean to enable automatic data merging for object with arrays
 * - mergeConfig: Object with merge configuration
 *   Example: {
 *     by: ["drCode", "date"], // Fields to merge by
 *     preserve: ["drName", "salesTeam"], // Fields to preserve across merges
 *     autoDetectMergeFields: true, // Auto-detect common fields for merging
 *     mergeStrategy: "combine" // "combine" or "replace"
 *   }
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
 * Auto-Merge with Column Grouping:
 * <PrimeDataTable
 *   data={$queries.serviceVsSupport.data.response.data} // {service: [...], support: [...]}
 *   enableAutoMerge={true}
 *   enableColumnGrouping={true}
 *   enableAutoColumnGrouping={true}
 *   mergeConfig={{
 *     by: ["drCode", "date"], // Merge by doctor code and date
 *     preserve: ["drName", "salesTeam"], // Preserve these fields
 *     autoDetectMergeFields: true
 *   }}
 *   groupConfig={{
 *     customGroupMappings: {
 *       service: "Service",
 *       support: "Support"
 *     },
 *     ungroupedColumns: ["drCode", "drName", "salesTeam", "date"]
 *   }}
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
 * />
 *
 * Expandable Table:
 * <PrimeDataTable
 *   data={salesData}
 *   enableRowExpansion={true}
 *   rowExpansionTemplate={(data) => (
 *     <div className="p-3">
 *       <h5>Details for {data.name}</h5>
 *       <p>Additional information: {data.description}</p>
 *       <p>Created: {data.createdDate}</p>
 *     </div>
 *   )}
 *   expandedRows={expandedRows}
 *   onRowToggle={(e) => setExpandedRows(e.data)}
 * />
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
  
  // Auto-merge configuration
  enableAutoMerge = false, // Enable automatic data merging for object with arrays
  mergeConfig = {
    by: [], // Fields to merge by (e.g., ['drCode', 'date'])
    preserve: [], // Fields to preserve across merges (e.g., ['drName', 'salesTeam'])
    autoDetectMergeFields: true, // Auto-detect common fields for merging
    mergeStrategy: 'combine' // 'combine' or 'replace'
  },
  
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
  rowExpansionTemplate = null, // Custom template for expanded content
  expandedRows = null, // External control of expanded rows
  onRowToggle = null, // Callback when rows are expanded/collapsed
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
  enableFixedFooterTotals = false, // NEW: Always show footer totals at bottom, even with pivot
  footerTotalsConfig = {
    showTotals: true,
    showAverages: false,
    showCounts: true,
    numberFormat: 'en-US',
    currency: 'USD',
    precision: 2
  },
  
  // NEW: ROI Calculation Props
  enableROICalculation = false, // Enable ROI calculation feature
  roiConfig = {
    // ROI calculation fields
    revenueField: 'revenue', // Field name for revenue data
    costField: 'cost', // Field name for cost data
    investmentField: 'investment', // Field name for investment data
    profitField: 'profit', // Field name for profit data (optional, will be calculated if not provided)
    
    // ROI calculation formula: ROI = ((Revenue - Cost) / Investment) * 100
    // Alternative: ROI = (Profit / Investment) * 100
    calculationMethod: 'standard', // 'standard' (revenue-cost/investment) or 'profit' (profit/investment)
    
    // Display options
    showROIColumn: true, // Show ROI as a separate column
    showROIAsPercentage: true, // Display ROI as percentage
    roiColumnTitle: 'ROI (%)', // Title for ROI column
    roiColumnKey: 'roi', // Key for ROI column in data
    
    // Formatting options
    roiNumberFormat: 'en-US',
    roiPrecision: 2, // Decimal places for ROI
    roiCurrency: 'USD',
    
    // Color coding for ROI values
    enableROIColorCoding: true,
    roiColorThresholds: {
      positive: '#22c55e', // Green for positive ROI
      neutral: '#6b7280', // Gray for neutral ROI
      negative: '#ef4444' // Red for negative ROI
    },
    
    // Thresholds for color coding
    positiveROIThreshold: 0, // Values >= this are positive
    negativeROIThreshold: 0, // Values < this are negative
    
    // Custom ROI calculation function (optional)
    customROICalculation: null, // Custom function for ROI calculation
  },
  
  // NEW: Total display preference - controls which type of totals to show
  totalDisplayMode = "auto", // "auto" (smart), "pivot" (only pivot), "footer" (only footer), "both" (show both), "none" (no totals)
  
  // Pivot Table Props - Excel-like pivot functionality  
  enablePivotTable = false,
  
  // NEW: Pivot UI Configuration Props
  enablePivotUI = true, // Enable pivot configuration UI panel
  pivotUIPosition = "toolbar", // "toolbar", "panel", "sidebar"
  
  // NEW: CMS Persistence Props
  enablePivotPersistence = true, // Enable saving pivot config to CMS
  pivotConfigKey = "pivotConfig", // Key for storing in CMS (e.g., "dashboardPage_salesTable_pivotConfig")
  onSavePivotConfig = null, // Callback to save config to CMS (deprecated - use direct integration)
  onLoadPivotConfig = null, // Callback to load config from CMS (deprecated - use direct integration)
  autoSavePivotConfig = false, // Auto-save changes to CMS (disabled by default for explicit control)
  
  // NEW: Direct Plasmic CMS Integration Props
  plasmicWorkspaceId = null, // Plasmic workspace ID for CMS integration
  plasmicTableConfigsId = null, // TableConfigs table ID for CMS integration
  plasmicApiToken = null, // Plasmic API token for direct CMS integration
  useDirectCMSIntegration = true, // Use direct CMS integration instead of callback props
  
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
    calculatedFields: [], // Array of calculated field objects
    
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
  
  // Common filter state for column grouping
  const [commonFilterField, setCommonFilterField] = useState('');
  const [commonFilterValue, setCommonFilterValue] = useState('');
  
  // Inline editing state
  const [localEditingRows, setLocalEditingRows] = useState(editingRows || {});
  
  // Context menu state
  const [localContextMenuSelection, setLocalContextMenuSelection] = useState(contextMenuSelection || null);
  const contextMenuRef = useRef(null);

  // Row expansion state
  const [localExpandedRows, setLocalExpandedRows] = useState(expandedRows || {});

  // GraphQL data state
  const [graphqlData, setGraphqlData] = useState([]);
  const [graphqlLoading, setGraphqlLoading] = useState(false);
  const [graphqlError, setGraphqlError] = useState(null);

  // Pivot table state
  const [pivotDataCache, setPivotDataCache] = useState(null);
  const [pivotColumnsCache, setPivotColumnsCache] = useState([]);
  
  // NEW: Pivot UI Configuration State
  const [showPivotConfig, setShowPivotConfig] = useState(false);
  const [localPivotConfig, setLocalPivotConfig] = useState({
    enabled: enablePivotTable,
    rows: [],
    columns: [],
    values: [],
    filters: [],
    metaAggregations: [],
    calculatedFields: [],
    showGrandTotals: true,
    showRowTotals: true,
    showColumnTotals: true,
    showSubTotals: true
  });
  
  // NEW: CMS Persistence State
  const [isLoadingPivotConfig, setIsLoadingPivotConfig] = useState(false);
  const [isSavingPivotConfig, setIsSavingPivotConfig] = useState(false);
  const [pivotConfigLoaded, setPivotConfigLoaded] = useState(false);

  // HYDRATION FIX: State to store filtered data for footer totals with safe initialization
  const [filteredDataForTotals, setFilteredDataForTotals] = useState([]);
  
  // NEW: State to store filtered data for grand total calculations
  const [filteredDataForGrandTotal, setFilteredDataForGrandTotal] = useState([]);

  // Get user from AuthContext
  const { user } = useAuth();

  // NEW: Direct Plasmic CMS Integration
  const { saveToCMS: directSaveToCMS, loadFromCMS: directLoadFromCMS, listConfigurationsFromCMS, isAdminUser } = usePlasmicCMS(
    plasmicWorkspaceId || process.env.PLASMIC_WORKSPACE_ID || 'uP7RbyUnivSX75FTKL9RLp',
    plasmicTableConfigsId || process.env.PLASMIC_TABLE_CONFIGS_ID || 'o4o5VRFTDgHHmQ31fCfkuz',
    plasmicApiToken || process.env.PLASMIC_API_TOKEN,
    user
  );



  // ROI calculation functions moved to utils/calculationUtils.js
  const { calculateROI, getROIColor, formatROIValue } = useROICalculation(enableROICalculation, roiConfig);

  // Default CMS functions moved to utils/cmsUtils.js - using imported functions

  // Choose between direct CMS integration, callback props, or built-in defaults
  const finalSaveToCMS = useDirectCMSIntegration && directSaveToCMS 
    ? directSaveToCMS 
    : (onSavePivotConfig || defaultSaveToCMS);
  
  const finalLoadFromCMS = useDirectCMSIntegration && directLoadFromCMS 
    ? directLoadFromCMS 
    : (onLoadPivotConfig || defaultLoadFromCMS);

  // Load pivot configuration from CMS on component mount
  useEffect(() => {
    const loadPivotConfig = async () => {
      if (!enablePivotPersistence || !finalLoadFromCMS || pivotConfigLoaded) return;
      
      setIsLoadingPivotConfig(true);
      try {
        console.log('📥 LOADING FROM CMS - Config Key:', pivotConfigKey);
        console.log('📥 Load function check:', {
          enablePivotPersistence,
          hasLoadFunction: !!finalLoadFromCMS,
          pivotConfigLoaded,
          finalLoadFromCMS: typeof finalLoadFromCMS
        });
        
        const savedConfig = await finalLoadFromCMS(pivotConfigKey);
        console.log('📥 Load result:', savedConfig);
        
        if (savedConfig && typeof savedConfig === 'object') {
          console.log('✅ CMS LOAD SUCCESSFUL:', savedConfig);
          
          // Update local pivot config first
          setLocalPivotConfig(prev => ({
            ...prev,
            ...savedConfig
          }));
          
          // If config was enabled, ensure pivot is enabled and force refresh
          if (savedConfig.enabled) {
            console.log('📊 APPLYING SAVED PIVOT CONFIG - Enabling pivot...');
            // Use setTimeout to ensure state updates are processed
            setTimeout(() => {
              setIsPivotEnabled(true);
              console.log('📊 PIVOT ENABLED FROM SAVED CONFIG');
            }, 100);
          }
        } else {
          console.log('📭 NO SAVED CONFIG FOUND FOR:', pivotConfigKey);
        }
      } catch (error) {
        console.error('❌ CMS LOAD FAILED:', error);
      } finally {
        setIsLoadingPivotConfig(false);
        setPivotConfigLoaded(true);
      }
    };

    loadPivotConfig();
  }, [enablePivotPersistence, finalLoadFromCMS, pivotConfigKey, pivotConfigLoaded]);

  // HIBERNATION FIX: Add cleanup refs and hydration safety
  const isMountedRef = useRef(true);
  const isHydratedRef = useRef(false);
  const saveTimeoutRef = useRef(null);
  
  // HYDRATION FIX: Track hydration completion to prevent setState during SSR/hydration
  useEffect(() => {
    isHydratedRef.current = true;
  }, []);
  
  // HYDRATION FIX: Safe callback wrapper to prevent setState during render
  const safeCallback = useCallback((callback, ...args) => {
    if (typeof callback === 'function' && isMountedRef.current && isHydratedRef.current) {
      // Use setTimeout to defer execution to next tick, avoiding setState during render
      setTimeout(() => {
        if (isMountedRef.current) {
          try {
            callback(...args);
          } catch (error) {
            safeConsole.error('Callback execution error:', error);
          }
        }
      }, 0);
    }
  }, []);
  
  // Save pivot configuration to CMS when it changes - HIBERNATION FIXED
  useEffect(() => {
    const savePivotConfig = async () => {
      if (!isMountedRef.current || !enablePivotPersistence || !finalSaveToCMS || !autoSavePivotConfig || !pivotConfigLoaded || !isAdminUser()) return;
      
      setIsSavingPivotConfig(true);
      try {
        // console.log('Auto-saving pivot config to CMS:', localPivotConfig);
        await finalSaveToCMS(pivotConfigKey, localPivotConfig);
      } catch (error) {
        if (isMountedRef.current) {
          console.error('❌ AUTO-SAVE FAILED:', error);
        }
      } finally {
        if (isMountedRef.current) {
          setIsSavingPivotConfig(false);
        }
      }
    };

    // Clear existing timeout to prevent memory leaks
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save operations to avoid too many CMS calls
    saveTimeoutRef.current = setTimeout(savePivotConfig, 1000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [localPivotConfig, enablePivotPersistence, finalSaveToCMS, autoSavePivotConfig, pivotConfigKey, pivotConfigLoaded, isAdminUser]);

  // HIBERNATION FIX: Missing GraphQL useEffect with proper cleanup
  useEffect(() => {
    if (!graphqlQuery || !isMountedRef.current) return;
    
    let intervalId = null;
    const activeRequests = new Set();
    
    const executeGraphQLQuery = async () => {
      if (!isMountedRef.current) return;
      
      const abortController = new AbortController();
      activeRequests.add(abortController);
      
      setGraphqlLoading(true);
      setGraphqlError(null);
      
      try {
        // This should be replaced with actual GraphQL client implementation
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: graphqlQuery,
            variables: graphqlVariables
          }),
          signal: abortController.signal
        });
        
        if (!response.ok) {
          throw new Error(`GraphQL request failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (isMountedRef.current) {
          if (result.errors) {
            setGraphqlError(result.errors[0]?.message || 'GraphQL error');
          } else {
            setGraphqlData(result.data || []);
            // HYDRATION FIX: Defer callback to next tick to avoid setState during render
            if (onGraphqlData) {
              setTimeout(() => {
                if (isMountedRef.current) {
                  onGraphqlData(result.data);
                }
              }, 0);
            }
          }
        }
      } catch (error) {
        if (isMountedRef.current && error.name !== 'AbortError') {
          setGraphqlError(error.message);
          console.error('GraphQL query failed:', error);
        }
      } finally {
        if (isMountedRef.current) {
          setGraphqlLoading(false);
        }
        activeRequests.delete(abortController);
      }
    };
    
    // Initial query execution
    executeGraphQLQuery();
    
    // Setup refetch interval if specified
    if (refetchInterval > 0) {
      intervalId = setInterval(() => {
        if (isMountedRef.current) {
          executeGraphQLQuery();
        }
      }, refetchInterval);
    }
    
    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      // Cancel all active requests
      activeRequests.forEach(controller => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      });
      activeRequests.clear();
    };
  }, [graphqlQuery, graphqlVariables, refetchInterval, onGraphqlData]);

  // Sync external expandedRows prop with local state
  useEffect(() => {
    if (expandedRows !== undefined && expandedRows !== null) {
      setLocalExpandedRows(expandedRows);
    }
  }, [expandedRows]);

  // HIBERNATION FIX: Optimized pivot config with reduced dependencies
  const mergedPivotConfig = useMemo(() => {
    // NEW: If pivot UI is enabled, use local config
    if (enablePivotUI && localPivotConfig) {
      const config = {
        ...pivotConfig.aggregationFunctions && { aggregationFunctions: pivotConfig.aggregationFunctions },
        ...localPivotConfig,
        aggregationFunctions: {
          ...pivotConfig.aggregationFunctions,
          ...pivotAggregationFunctions
        }
      };

      return config;
    }
    
    const hasIndividualProps = pivotRows.length > 0 || pivotColumns.length > 0 || pivotValues.length > 0;
    
    // console.log('MergedPivotConfig Debug:', {
    //   hasIndividualProps,
    //   enablePivotTable,
    //   pivotRows,
    //   pivotColumns,
    //   pivotValues,
    //   pivotConfigEnabled: pivotConfig.enabled
    // });
    
    if (hasIndividualProps) {
      // Use individual props (Plasmic interface)
      const config = {
        enabled: enablePivotTable,
        rows: pivotRows,
        columns: pivotColumns,
        values: pivotValues,
        filters: pivotFilters,
        calculatedFields: [], // Add calculated fields support
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
      // console.log('Using individual props config:', config);
      return config;
    }
    
    // Use pivotConfig object (direct usage)
    const config = {
      ...pivotConfig,
      enabled: enablePivotTable && pivotConfig.enabled
    };
    // console.log('Using pivotConfig object:', config);
    return config;
  }, [
    // HIBERNATION FIX: Reduced dependency array using JSON.stringify for complex objects
    enablePivotTable, 
    JSON.stringify(pivotRows), 
    JSON.stringify(pivotColumns), 
    JSON.stringify(pivotValues), 
    JSON.stringify(pivotFilters),
    pivotShowGrandTotals, pivotShowRowTotals, pivotShowColumnTotals, pivotShowSubTotals,
    pivotNumberFormat, pivotCurrency, pivotPrecision, pivotFieldSeparator,
    pivotSortRows, pivotSortColumns, pivotSortDirection, 
    JSON.stringify(pivotAggregationFunctions),
    JSON.stringify(pivotConfig), 
    enablePivotUI, 
    JSON.stringify(localPivotConfig)
  ]);

  // HYDRATION FIX: Safe initialization for isPivotEnabled
  const [isPivotEnabled, setIsPivotEnabled] = useState(false);

  // HYDRATION FIX: Update isPivotEnabled when props change with hydration safety
  useEffect(() => {
    if (!isHydratedRef.current) return;
    
    // Don't override if config was loaded from CMS and is enabled
    // Only set based on props if no saved config is loaded or config is explicitly disabled
    if (pivotConfigLoaded && localPivotConfig.enabled) {
      // Config was loaded from CMS and is enabled, keep it enabled
      console.log('🔄 PIVOT STATE SYNC: Keeping CMS config enabled');
      setIsPivotEnabled(true);
    } else {
      // Use prop-based logic for initial state or when config is disabled
      console.log('🔄 PIVOT STATE SYNC: Using prop-based logic', { enablePivotTable, mergedConfigEnabled: mergedPivotConfig.enabled });
      setIsPivotEnabled(enablePivotTable && mergedPivotConfig.enabled);
    }
  }, [enablePivotTable, mergedPivotConfig.enabled, pivotConfigLoaded, localPivotConfig.enabled]);

  // Compute effective total display settings based on totalDisplayMode
  const effectiveTotalSettings = useMemo(() => {
    const isPivotActive = isPivotEnabled && mergedPivotConfig?.enabled;
    
    // NEW: If fixed footer totals is enabled, always show footer totals regardless of pivot
    if (enableFixedFooterTotals) {
      return {
        showPivotTotals: isPivotActive,
        showFooterTotals: true // Always show footer totals when fixed footer is enabled
      };
    }
    
    switch (totalDisplayMode) {
      case "pivot":
        return {
          showPivotTotals: true,
          showFooterTotals: false
        };
      case "footer":
        return {
          showPivotTotals: false,
          showFooterTotals: true
        };
      case "both":
        return {
          showPivotTotals: true,
          showFooterTotals: true
        };
      case "none":
        return {
          showPivotTotals: false,
          showFooterTotals: false
        };
      case "auto":
      default:
        // Auto mode: prefer pivot totals when pivot is active, footer totals otherwise
        if (isPivotActive) {
          return {
            showPivotTotals: true,
            showFooterTotals: false // Hide footer totals when pivot is active
          };
        } else {
          return {
            showPivotTotals: false,
            showFooterTotals: enableFooterTotals
          };
        }
    }
  }, [totalDisplayMode, isPivotEnabled, mergedPivotConfig?.enabled, enableFooterTotals, enableFixedFooterTotals]);

  // Apply effective total settings to pivot config
  const adjustedPivotConfig = useMemo(() => {
    // Ensure we always have valid formatting defaults
    const defaultConfig = {
      enabled: false,
      rows: [],
      columns: [],
      values: [],
      filters: [],
      calculatedFields: [],
      showGrandTotals: false,
      showRowTotals: false,
      showColumnTotals: false,
      showSubTotals: false,
      numberFormat: 'en-US',
      currency: 'USD',
      precision: 2,
      fieldSeparator: '__',
      sortRows: true,
      sortColumns: true,
      sortDirection: 'asc',
      aggregationFunctions: {}
    };

    if (!mergedPivotConfig) {
      return defaultConfig;
    }

    if (!effectiveTotalSettings.showPivotTotals) {
      // If pivot totals are disabled, turn off all pivot totals but preserve formatting
      return {
        ...defaultConfig,
        ...mergedPivotConfig,
        showGrandTotals: false,
        showRowTotals: false,
        showColumnTotals: false,
        showSubTotals: false
      };
    }

    // Merge with defaults to ensure all formatting properties exist
    return {
      ...defaultConfig,
      ...mergedPivotConfig
    };
  }, [mergedPivotConfig, effectiveTotalSettings.showPivotTotals]);

  // Data processing moved to utils/dataUtils.js
  const processedData = useMemo(() => {
    const rawData = graphqlQuery ? graphqlData : data;
    return processData(
      rawData, 
      graphqlQuery, 
      graphqlData, 
      enableAutoMerge, 
      mergeConfig, 
      enableROICalculation, 
      calculateROI, 
      roiConfig
    );
  }, [data, graphqlData, graphqlQuery, enableAutoMerge, mergeConfig, enableROICalculation, calculateROI, roiConfig]);

  // Use processed data
  const tableData = processedData;
  const isLoading = graphqlQuery ? graphqlLoading : loading;
  const tableError = graphqlQuery ? graphqlError : error;

  // HYDRATION FIX: Initialize filtered data for totals
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (tableData && Array.isArray(tableData)) {
      const validData = tableData.filter(row => row && typeof row === 'object');
      setFilteredDataForTotals(validData);
    } else {
      setFilteredDataForTotals([]);
    }
  }, [tableData]); // Update when tableData changes

  // Pivot data transformation
  const pivotTransformation = useMemo(() => {
    // CRITICAL: Ensure tableData is an array before pivot transformation
    if (!Array.isArray(tableData)) {
      console.warn('PrimeDataTable: tableData is not an array before pivot transformation');
      return { 
        pivotData: [], 
        pivotColumns: [], 
        columnValues: [], 
        grandTotalData: null,
        isPivot: false 
      };
    }

    if (!isPivotEnabled || !adjustedPivotConfig.enabled) {
      // console.log('Pivot disabled - returning original data');
      return { 
        pivotData: tableData, 
        pivotColumns: [], 
        columnValues: [], 
        grandTotalData: null,
        isPivot: false 
      };
    }

    try {
      // console.log('Transforming data to pivot...');
      const result = transformToPivotData(tableData, adjustedPivotConfig);
      // console.log('Pivot transformation result:', result);
      
      // CRITICAL: Validate pivot transformation result
      if (!result || !Array.isArray(result.pivotData)) {
        console.error('PrimeDataTable: Pivot transformation did not return valid data structure');
        return { 
          pivotData: tableData, 
          pivotColumns: [], 
          columnValues: [], 
          grandTotalData: null,
          isPivot: false 
        };
      }
      
      return {
        ...result,
        isPivot: true
      };
    } catch (error) {
      console.error('Error transforming data to pivot:', error);
      return { 
        pivotData: Array.isArray(tableData) ? tableData : [], 
        pivotColumns: [], 
        columnValues: [], 
        grandTotalData: null,
        isPivot: false 
      };
    }
  }, [tableData, isPivotEnabled, adjustedPivotConfig]);



  // Final data source - either original data or pivot data
  // CRITICAL: Add final safety check to ensure finalTableData is always an array
  const finalTableData = useMemo(() => {
    let data = pivotTransformation.isPivot ? pivotTransformation.pivotData : tableData;
    
    // CRITICAL: Ensure data is always an array
    if (!Array.isArray(data)) {
      console.error('PrimeDataTable: finalTableData is not an array, converting to empty array. Data type:', typeof data, 'Value:', data);
      return [];
    }

    // Don't modify data - we'll use PrimeReact's footer functionality instead



    return data;
  }, [pivotTransformation, tableData]);
  
  // Initialize filtered data for grand total calculations when finalTableData changes
  useEffect(() => {
    if (finalTableData && finalTableData.length > 0) {
      setFilteredDataForGrandTotal(finalTableData);
    }
  }, [finalTableData]);
  
  // NEW: Handle global filter changes for grand total calculation
  useEffect(() => {
    if (!globalFilterValue || globalFilterValue.trim() === '') {
      // No global filter, use all data
      setFilteredDataForGrandTotal(finalTableData);

    } else {
      // Apply global filter manually for grand total calculation - SIMPLE DIRECT APPROACH
      // Based on your data: {brand: 'PREGABRIT', quantity_total: 65244, quantity: 65244}
      // Search in the main visible fields
      const filteredData = finalTableData.filter(row => {
        const searchValue = globalFilterValue.toLowerCase();
        
        // Search in brand field (main field to search)
        const brandValue = row.brand || row.Brand || '';
        if (String(brandValue).toLowerCase().includes(searchValue)) {
          return true;
        }
        
        // Also search in quantity fields if they contain the search term
        const quantityValue = row.quantity || '';
        if (String(quantityValue).toLowerCase().includes(searchValue)) {
          return true;
        }
        
        const quantityTotalValue = row.quantity_total || '';
        if (String(quantityTotalValue).toLowerCase().includes(searchValue)) {
          return true;
        }
        
        return false;
      });
      

      
      setFilteredDataForGrandTotal(filteredData);

    }
  }, [globalFilterValue, finalTableData]);
  
  // NEW: Dynamic grand total calculation based on filtered data
  const dynamicGrandTotal = useMemo(() => {
    if (!pivotTransformation.isPivot || !effectiveTotalSettings.showPivotTotals) {
      return null;
    }
    
    // CRITICAL: Use filtered data if available, otherwise use all data
    const dataToCalculate = filteredDataForGrandTotal.length > 0 ? filteredDataForGrandTotal : finalTableData;
    
    // Don't calculate if no data
    if (!dataToCalculate || dataToCalculate.length === 0) {
      return null;
    }
    

    
    // Get pivot configuration
    const config = adjustedPivotConfig;
    const { values } = config;
    
    if (!values || values.length === 0) {
      return null;
    }
    
    // Calculate grand totals for each value field
    const grandTotalRow = { isGrandTotal: true };
    
    // Set row field values to "Grand Total"
    if (config.rows) {
      config.rows.forEach(rowField => {
        grandTotalRow[rowField] = 'Grand Total';
      });
    }
    
    // Calculate totals for each value configuration
    values.forEach(valueConfig => {
      const fieldName = valueConfig.field;
      const aggregation = valueConfig.aggregation || 'sum';
      const aggregateFunc = config.aggregationFunctions[aggregation];
      
      if (aggregateFunc) {
        // Extract values from the filtered data ONLY
        const allValues = dataToCalculate
          .map(row => row[fieldName])
          .filter(v => v !== null && v !== undefined && typeof v === 'number');
        
        // Calculate the total from ONLY the visible/filtered rows
        const calculatedTotal = allValues.length > 0 ? aggregateFunc(allValues) : 0;
        
        // Store with the same key structure as pivot data
        if (config.showRowTotals) {
          const totalKey = values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}_total` 
            : `${fieldName}_total`;
          grandTotalRow[totalKey] = calculatedTotal;
        }
        
        // For column grouping, calculate totals for each column
        if (config.columns && config.columns.length > 0) {
          // Get unique column values from filtered data
          const columnValues = [];
          config.columns.forEach(colField => {
            const uniqueVals = [...new Set(dataToCalculate.map(row => row[colField]).filter(v => v !== null && v !== undefined))];
            columnValues.push(...uniqueVals);
          });
          const uniqueColumnValues = [...new Set(columnValues)];
          
          uniqueColumnValues.forEach(colValue => {
            const colRows = dataToCalculate.filter(row => {
              return config.columns.some(colField => row[colField] === colValue);
            });
            const colValues = colRows.map(row => row[fieldName]).filter(v => v !== null && v !== undefined && typeof v === 'number');
            const columnKey = `${colValue}_${fieldName}_${aggregation}`;
            grandTotalRow[columnKey] = colValues.length > 0 ? aggregateFunc(colValues) : 0;
          });
        } else {
          // No column grouping, use simple field name
          const valueKey = values.length > 1 && values.filter(v => v.field === fieldName).length > 1 
            ? `${fieldName}_${aggregation}` 
            : fieldName;
          grandTotalRow[valueKey] = calculatedTotal;
        }
        

      }
    });
    
    // ✅ NEW: Calculate grand totals for calculated fields
    const calculatedFields = config.calculatedFields || [];
    if (calculatedFields.length > 0 && dataToCalculate.length > 0) {
      calculatedFields.forEach(calcField => {
        try {
          // Get the calculated field key
          const baseKey = calcField.id || calcField.name.replace(/\s+/g, '_');
          const calcFieldKey = baseKey.startsWith('calc_') ? baseKey : `calc_${baseKey}`;
          
          // Extract calculated field values from all rows
          const calculatedValues = dataToCalculate
            .map(row => row[calcFieldKey])
            .filter(v => typeof v === 'number' && !isNaN(v) && v !== 'Error');
          
          if (calculatedValues.length > 0) {
            // Sum all calculated field values for grand total
            const grandTotalValue = calculatedValues.reduce((sum, val) => sum + val, 0);
            grandTotalRow[calcFieldKey] = grandTotalValue;
            
            // ✅ Round grand total to 2 decimal places
            const roundedGrandTotal = Math.round(grandTotalValue * 100) / 100;
            grandTotalRow[calcFieldKey] = roundedGrandTotal;
            
            console.log('✅ CALCULATED FIELD GRAND TOTAL:', {
              fieldName: calcField.name,
              calcFieldKey: calcFieldKey,
              formula: calcField.formula,
              valuesCount: calculatedValues.length,
              grandTotal: grandTotalValue,
              roundedGrandTotal: roundedGrandTotal
            });
          } else {
            console.warn('⚠️ NO VALID CALCULATED FIELD VALUES FOR GRAND TOTAL:', {
              fieldName: calcField.name,
              calcFieldKey: calcFieldKey,
              availableKeys: Object.keys(dataToCalculate[0] || {}).filter(k => k.startsWith('calc_'))
            });
          }
        } catch (error) {
          console.error('❌ ERROR CALCULATING GRAND TOTAL FOR CALCULATED FIELD:', {
            fieldName: calcField.name,
            error: error.message
          });
        }
      });
    }
    
    return grandTotalRow;
  }, [
    pivotTransformation.isPivot, 
    effectiveTotalSettings.showPivotTotals, 
    filteredDataForGrandTotal, 
    finalTableData, 
    adjustedPivotConfig
  ]);
  
  const hasPivotData = pivotTransformation.isPivot && pivotTransformation.pivotData.length > 0;

  // NEW: Helper functions for pivot configuration UI
  const getAvailableFields = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    
    const sampleRow = tableData[0];
    if (!sampleRow || typeof sampleRow !== 'object') return [];
    
    return Object.keys(sampleRow).map(key => ({
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      value: key,
      type: typeof sampleRow[key] === 'number' ? 'number' : 
            typeof sampleRow[key] === 'boolean' ? 'boolean' :
            typeof sampleRow[key] === 'string' && /^\d{4}-\d{2}-\d{2}/.test(sampleRow[key]) ? 'date' : 'text'
    }));
  }, [tableData]);

  const getNumericFields = useMemo(() => {
    return getAvailableFields.filter(field => field.type === 'number');
  }, [getAvailableFields]);

  const getCategoricalFields = useMemo(() => {
    return getAvailableFields.filter(field => field.type !== 'number');
  }, [getAvailableFields]);

  const aggregationOptions = [
    { label: 'Sum', value: 'sum' },
    { label: 'Count', value: 'count' },
    { label: 'Average', value: 'average' },
    { label: 'Min', value: 'min' },
    { label: 'Max', value: 'max' },
    { label: 'First', value: 'first' },
    { label: 'Last', value: 'last' }
  ];

  // Pivot configuration handlers - extracted to utils/pivotConfigUtils.js
  const {
    applyPivotConfig,
    applyAndSavePivotConfig,
    resetPivotConfig,
    savePivotConfigManually
  } = createPivotConfigHandlers({
    enablePivotUI,
    localPivotConfig,
    mergedPivotConfig,
    setIsPivotEnabled,
    setShowPivotConfig,
    enablePivotPersistence,
    finalSaveToCMS,
    isAdminUser,
    setIsSavingPivotConfig,
    pivotConfigKey,
    setLocalPivotConfig
  });

  // Debug logging for save functionality
  useEffect(() => {
    console.log('🔍 PrimeDataTable Debug Info:', {
      user: user ? {
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        roleIds: user.roleIds,
        roleName: user.roleName
      } : null,
      isAdmin: isAdminUser(),
      enablePivotPersistence,
      hasSaveFunction: !!finalSaveToCMS,
      pivotConfigKey
    });
  }, [user, isAdminUser, enablePivotPersistence, finalSaveToCMS, pivotConfigKey]);

  // HIBERNATION FIX: Comprehensive component unmount cleanup with performance monitoring
  useEffect(() => {
    // Performance monitoring
    const componentMountTime = Date.now();
    
    // Window event handlers for large dataset warnings
    const handleBeforeUnload = (event) => {
      if (tableData && tableData.length > 5000) {
        event.preventDefault();
        event.returnValue = 'Large dataset is being processed. Are you sure you want to leave?';
      }
    };
    
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.hidden && tableData && tableData.length > 10000) {
        safeConsole.log('⚠️ Page hidden with large dataset - potential hibernation risk');
      }
    };
    
    // Only add event listeners if dealing with large datasets and we're in a proper browser environment
    // Skip in Plasmic Studio to avoid iframe communication issues
    const isValidBrowserEnvironment = typeof window !== 'undefined' && typeof document !== 'undefined' && !window.parent;
    const isPlasmicStudio = typeof window !== 'undefined' && window.location?.hostname?.includes('plasmic');
    
    if (isValidBrowserEnvironment && !isPlasmicStudio && tableData && tableData.length > 5000) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    return () => {
      const componentLifetime = Date.now() - componentMountTime;
      if (componentLifetime > 300000) { // 5 minutes
        safeConsole.log(`⚠️ Long-lived PrimeDataTable component (${componentLifetime}ms) - potential memory leak`);
      }
      
      // Clean up event listeners with proper checks (don't clear isMountedRef here as this effect runs on tableData changes)
      if (typeof window !== 'undefined' && !isPlasmicStudio) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      if (typeof document !== 'undefined' && !isPlasmicStudio) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [tableData]);

  // Column type detection and filter element functions moved to utils/filterUtils.js and utils/templateUtils.js





  // Enhanced column generation with data type detection
  const defaultColumns = useMemo(() => {
    let cols = [];

    // Debug logging
    // console.log('Pivot Transformation:', {
    //   isPivot: pivotTransformation.isPivot,
    //   pivotColumnsLength: pivotTransformation.pivotColumns.length,
    //   pivotColumns: pivotTransformation.pivotColumns,
    //   mergedPivotConfig: mergedPivotConfig
    // });

    // Use pivot columns if pivot is enabled and available
    if (pivotTransformation.isPivot && pivotTransformation.pivotColumns.length > 0) {
      cols = pivotTransformation.pivotColumns.map(col => ({
        ...col,
        sortable: col.sortable !== false,
        filterable: col.filterable !== false,
        type: col.type || 'text'
      }));
      
      // Add calculated field columns to pivot columns
      if (pivotTransformation.pivotData?.length > 0) {
        const sampleRow = pivotTransformation.pivotData[0];
        const processedCalculatedFields = new Set(); // Track processed field names to prevent duplicates
        
        Object.keys(sampleRow).forEach(key => {
          if (key.startsWith('calc_') && !key.endsWith('_meta')) {
            const meta = sampleRow[`${key}_meta`];
            if (meta) {
              // ✅ Step 1: Prevent duplicate columns with same name
              if (processedCalculatedFields.has(meta.name)) {
                console.warn(`⚠️ Skipping duplicate calculated field: ${meta.name} (key: ${key})`);
                return; // Skip this duplicate
              }
              
              // ✅ Step 2: Create unique key for JSX rendering
              const uniqueKey = `${key}_${meta.name}`;
              processedCalculatedFields.add(meta.name);
              
              // ✅ Step 3: Create descriptive title for duplicate fields
              const existingFieldsWithSameName = cols.filter(col => col.title === meta.name);
              const title = existingFieldsWithSameName.length > 0 
                ? `${meta.name} (${existingFieldsWithSameName.length + 1})` 
                : meta.name;
              
              const calculatedFieldColumn = {
                key: key, // Keep original key for internal use
                uniqueKey: uniqueKey, // ✅ Unique key for JSX rendering
                title: title,
                sortable: true,
                filterable: true,
                type: 'number',
                isPivotCalculatedField: true,
                calculatedField: meta,
                // Custom body template for calculated fields
                body: (rowData) => {
                  const value = rowData[key];
                  if (value === 'Error') {
                    return <span style={{ color: 'red' }}>Error</span>;
                  }
                  
                  // ✅ Force 2 decimal places for calculated field values
                  if (typeof value === 'number') {
                    try {
                      return new Intl.NumberFormat(
                        adjustedPivotConfig.numberFormat || 'en-US',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }
                      ).format(value);
                    } catch (error) {
                      // Fallback to simple 2 decimal formatting
                      return value.toFixed(2);
                    }
                  }
                  
                  // Fallback to original formatting for non-numeric values
                  return formatCalculatedValue(value, meta.format || 'number', {
                    currency: adjustedPivotConfig.currency,
                    locale: adjustedPivotConfig.numberFormat,
                    precision: 2 // ✅ Force 2 decimal places
                  });
                }
              };
              
              // ✅ Deduplication guard - prevent duplicate calculated field columns
              const alreadyExists = cols.some(col => col.key === key);
              const duplicateTitle = cols.some(col => col.title === title && col.key !== key);
              
              if (!alreadyExists) {
                // Add calculated field column to the pivot columns
                cols.push(calculatedFieldColumn);
                
                console.log('✅ ADDED CALCULATED FIELD COLUMN:', {
                  key: key,
                  uniqueKey: uniqueKey,
                  title: title,
                  formula: meta.formula,
                  hasDuplicateTitle: duplicateTitle
                });
              } else {
                console.warn('⚠️ SKIPPING DUPLICATE CALCULATED FIELD:', {
                  key: key,
                  title: title,
                  existingColumns: cols.filter(col => col.key === key).map(col => ({ key: col.key, title: col.title }))
                });
              }
            }
          }
        });
      }
    } else if (columns.length > 0) {
      // ✅ Normalize keys from field/header if missing
      const normalizedColumns = columns.map(col => {
        const key = col.key || col.field || col.header || col.name;
        return {
          key,
          title: col.title || col.header || key,
          sortable: col.sortable !== false,
          filterable: col.filterable !== false, // FIXED: Ensure filterable is explicitly set
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
          filterable: true, // FIXED: Ensure auto-generated columns are filterable
          type
        };
      });

      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => autoColumns.find(col => col.key === key)).filter(Boolean)
        : autoColumns;

      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    }

    if (fields && Array.isArray(fields) && fields.length > 0) {
      cols = cols.filter(col => {
        // Always include calculated field columns (they start with 'calc_')
        if (col.key && col.key.startsWith('calc_')) {
          return true;
        }
        // For other columns, check if they're in the fields array
        return fields.includes(col.key);
      });
    }

    // Debug log to confirm calculated fields are included
    console.log("🧠 Final column keys:", cols.map(col => col.key));
    
    // NEW: Debug log to check for duplicate keys in final columns
    const finalColumnKeys = cols.map(col => col.key);
    const duplicateKeys = finalColumnKeys.filter((key, index) => finalColumnKeys.indexOf(key) !== index);
    
    if (duplicateKeys.length > 0) {
      console.error('❌ DUPLICATE COLUMN KEYS DETECTED:', {
        duplicateKeys: duplicateKeys,
        allKeys: finalColumnKeys,
        columns: cols.map(col => ({ key: col.key, title: col.title, uniqueKey: col.uniqueKey }))
      });
    } else {
      console.log('✅ NO DUPLICATE COLUMN KEYS FOUND');
    }
    
    // NEW: Summary of calculated field columns
    const calculatedFieldColumns = cols.filter(col => col.isPivotCalculatedField);
    if (calculatedFieldColumns.length > 0) {
      console.log('📊 FINAL CALCULATED FIELD COLUMNS:', calculatedFieldColumns.map(col => ({
        key: col.key,
        uniqueKey: col.uniqueKey,
        title: col.title,
        formula: col.calculatedField?.formula
      })));
    }

    // NEW: Add ROI column if ROI calculation is enabled
    if (enableROICalculation && roiConfig?.showROIColumn) {
      const roiColumn = {
        key: roiConfig.roiColumnKey,
        title: roiConfig.roiColumnTitle,
        sortable: true,
        filterable: true,
        type: 'roi',
        isROIColumn: true
      };
      
      // Add ROI column to the end of the columns
      cols.push(roiColumn);
    }



    // Debug log to confirm calculated fields are in final columns
    console.log("🧠 Final Columns:", cols.map(col => col.key));
    
    return cols;
  }, [columns, finalTableData, hiddenColumns, columnOrder, fields, pivotTransformation.isPivot, pivotTransformation.pivotColumns, enableROICalculation, roiConfig]);

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

    // Step 2: Post-merge column grouping based on keywords
    // This groups columns after merging based on their names containing keywords like "service", "support", etc.
    const keywordGroups = {};
    
    // Auto-detect group keywords from column names
    const detectGroupKeywords = () => {
      const allColumnKeys = defaultColumns.map(col => col.key.toLowerCase());
      const detectedGroups = new Map();
      
      // Find common prefixes/suffixes in column names
      allColumnKeys.forEach(colKey => {
        // Skip columns that are explicitly ungrouped
        if (ungroupedColumns.includes(colKey)) return;
        
        // Look for patterns like: serviceAmount, serviceId, supportValue, etc.
        // Extract the first word (before camelCase or underscore)
        const match = colKey.match(/^([a-zA-Z]+)/);
        if (match) {
          const prefix = match[1];
          
          // Skip common shared field prefixes
          const sharedPrefixes = ['dr', 'date', 'id', 'name', 'team', 'hq', 'location', 'code','salesTeam'];
          if (sharedPrefixes.includes(prefix)) return;
          
          // Count how many columns start with this prefix
          const count = allColumnKeys.filter(key => key.startsWith(prefix)).length;
          
          // If multiple columns share this prefix, it's likely a group
          if (count > 1) {
            const groupName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            if (!detectedGroups.has(groupName)) {
              detectedGroups.set(groupName, []);
            }
            detectedGroups.get(groupName).push(prefix);
          }
        }
      });
      
      return detectedGroups;
    };
    
    // Get auto-detected groups
    const autoDetectedGroups = detectGroupKeywords();
    
    defaultColumns.forEach(col => {
      if (processedColumns.has(col.key)) return;
      
      const colKey = col.key.toLowerCase();
      
      // Explicitly exclude salesTeam from any grouping
      if (colKey.includes('salesteam') || col.key === 'salesTeam') return;
      
      let assignedGroup = null;
      
      // Check for keyword-based grouping (post-merge logic)
      if (customGroupMappings && Object.keys(customGroupMappings).length > 0) {
        for (const [keyword, groupName] of Object.entries(customGroupMappings)) {
          if (colKey.includes(keyword.toLowerCase())) {
            assignedGroup = groupName;
            break;
          }
        }
      }
      
      // Auto-detect group based on column prefix
      if (!assignedGroup) {
        for (const [groupName, prefixes] of autoDetectedGroups) {
          if (prefixes.some(prefix => colKey.startsWith(prefix))) {
            assignedGroup = groupName;
            break;
          }
        }
      }
      
      // Fallback to hardcoded keywords if no auto-detection
      if (!assignedGroup) {
        if (colKey.includes('service')) {
          assignedGroup = 'Service';
        } else if (colKey.includes('support')) {
          assignedGroup = 'Support';
        } else if (colKey.includes('inventory')) {
          assignedGroup = 'Inventory';
        } else if (colKey.includes('empVisit')) {
          assignedGroup = 'EmpVisit';
        } else if (colKey.includes('drVisit')) {
          assignedGroup = 'DrVisit';
        }
      }
      
      if (assignedGroup) {
        if (!keywordGroups[assignedGroup]) {
          keywordGroups[assignedGroup] = [];
        }
        keywordGroups[assignedGroup].push({
          ...col,
          originalKey: col.key,
          subHeader: col.title,
          groupName: assignedGroup
        });
        processedColumns.add(col.key);
      }
    });

    // Step 3: Detect groups by separator pattern (e.g., "2025-04-01__serviceAmount")
    const separatorGroups = {};
    defaultColumns.forEach(col => {
      if (processedColumns.has(col.key)) return;
      
      if (col.key.includes(groupSeparator)) {
        const parts = col.key.split(groupSeparator);
        if (parts.length >= 2) {
          const prefix = parts[0]; // e.g., "2025-04-01"
          const suffix = parts.slice(1).join(groupSeparator); // e.g., "serviceAmount"
          let groupName = suffix;
          const suffixLower = suffix.toLowerCase();
          
          // Check custom group mappings first
          if (customGroupMappings && Object.keys(customGroupMappings).length > 0) {
            for (const [keyword, groupNameMapping] of Object.entries(customGroupMappings)) {
              if (suffixLower.includes(keyword.toLowerCase())) {
                groupName = groupNameMapping;
                break;
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

    // Step 4: Handle custom grouping patterns
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

    // Step 5: Convert keyword groups to column groups (post-merge grouping takes priority)
    Object.entries(keywordGroups).forEach(([groupName, groupColumns]) => {
      if (groupColumns.length > 0) {
        groups.push({
          header: groupName,
          columns: groupColumns.sort((a, b) => a.title.localeCompare(b.title))
        });
      }
    });

    // Step 6: Convert separator groups to column groups
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

    // Step 7: Handle total columns - try to group them with their parent groups
    const totalCols = defaultColumns.filter(col => 
      !processedColumns.has(col.key) && (
        totalColumns.includes(col.key) || 
        col.key.toLowerCase().includes('total') ||
        col.title.toLowerCase().includes('total')
      )
    );
    totalCols.forEach(col => {
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
        remainingColumns.push(col);
        processedColumns.add(col.key);
      }
    });

    // Step 8: Remaining ungrouped columns
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


  // HIBERNATION FIX: Initialize filters based on columns with debounced global filter
  const initializeFilters = useCallback(() => {
    const initialFilters = {
      global: { value: globalFilterValue, matchMode: FilterMatchMode.CONTAINS }
    };
    
    // Initialize filters for all columns that should be filterable
    defaultColumns.forEach(col => {
      // FIXED: Check filterable property properly - if not explicitly false and enableColumnFilter is true
      const isFilterable = (col.filterable !== false) && enableColumnFilter;
      
      if (isFilterable) {
        // FIXED: Determine appropriate match mode based on column type
        const columnType = getColumnType(col);
        let matchMode = FilterMatchMode.CONTAINS;
        
        switch (columnType) {
          case 'dropdown':
          case 'select':
          case 'categorical':
          case 'boolean':
            matchMode = FilterMatchMode.EQUALS;
            break;
          case 'number':
            matchMode = FilterMatchMode.EQUALS;
            break;
          case 'date':
          case 'datetime':
            matchMode = FilterMatchMode.DATE_IS;
            break;
          default:
            matchMode = FilterMatchMode.CONTAINS;
        }
        
        // Use advanced filter structure for all columns to match official PrimeReact design
        initialFilters[col.key] = { 
          operator: FilterOperator.AND, 
          constraints: [{ value: null, matchMode }] 
        };
      }
    });
    
    // FIXED: Debug logging to help identify filter initialization issues
    console.log('🔍 FILTER INITIALIZATION:', {
      totalColumns: defaultColumns.length,
      filterableColumns: defaultColumns.filter(col => (col.filterable !== false) && enableColumnFilter).length,
      initialFilters: Object.keys(initialFilters),
      enableColumnFilter
    });
    
    setFilters(initialFilters);
  }, [defaultColumns, enableColumnFilter, globalFilterValue, getColumnType]);

  useEffect(() => {
    if (!isMountedRef.current) return;
    
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        initializeFilters();
      }
    }, 100); // Debounce filter initialization
    
    return () => clearTimeout(timeoutId);
  }, [initializeFilters]);

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



  // Event handlers - extracted to utils/eventHandlers.js
  const {
    handleSort,
    handleFilter,
    handleSearch,
    handleBulkAction,
    clearAllFilters,
    handleRowSelect,
    handleExport,
    handleRefresh,
    handleRowEditSave,
    handleRowEditCancel,
    handleRowEditInit,
    handleEditingRowsChange,
    handleContextMenuSelectionChange,
    handleContextMenu,
    handlePageChange
  } = createEventHandlers({
    setSortField,
    setSortOrder,
    onSortChange,
    safeCallback,
    setFilters,
    onFilterChange,
    finalTableData,
    setGlobalFilterValue,
    onSearch,
    onBulkAction,
    selectedRows,
    setCommonFilterField,
    setCommonFilterValue,
    defaultColumns,
    enableColumnFilter,
    enableFooterTotals,
    tableData,
    getColumnType,
    setFilteredDataForTotals,
    setSelectedRows,
    onRowSelect,
    enableExport,
    onExport,
    exportFileType,
    enableExcelExport,
    enablePdfExport,
    exportFilename,
    enableRefresh,
    onRefresh,
    setIsRefreshing,
    setLocalEditingRows,
    onEditingRowsChange,
    setLocalContextMenuSelection,
    onContextMenuSelectionChange,
    onContextMenu,
    setLocalCurrentPage,
    setLocalPageSize,
    onPageChange,
    onRowEditSave,
    onRowEditCancel,
    onRowEditInit
  });

  // Row expansion handler
  const handleRowToggle = useCallback((e) => {
    setLocalExpandedRows(e.data);
    if (onRowToggle) {
      onRowToggle(e);
    }
  }, [onRowToggle]);

  // Custom cell renderers moved to utils/templateUtils.js
  const imageBodyTemplate = createImageBodyTemplate(popupImageFields, setImageModalSrc, setImageModalAlt, setShowImageModal);
  const roiBodyTemplate = createROIBodyTemplate(formatROIValue, getROIColor);

  // Pivot table and action templates moved to utils/templateUtils.js
  const pivotValueBodyTemplate = createPivotValueBodyTemplate(adjustedPivotConfig, currencyColumns);
  const actionsBodyTemplate = createActionsBodyTemplate(rowActions);

  // Advanced filter components


  // Filter templates moved to utils/templateUtils.js
  const filterClearTemplate = createFilterClearTemplate(enableFilterClear);
  const filterApplyTemplate = createFilterApplyTemplate(enableFilterApply);
  const filterFooterTemplate = createFilterFooterTemplate(enableFilterFooter);



  // Filter functions moved to utils/filterUtils.js - using imported functions

  // HIBERNATION FIX: Update filtered data when filters or tableData change with optimized dependencies
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    // Apply current filters to get filtered data for totals
    const filteredData = applyFiltersToData(tableData, filters);
    // Ensure filtered data contains only valid objects
    const validFilteredData = filteredData.filter(row => row && typeof row === 'object');
    
    // Only update if data actually changed to prevent unnecessary re-renders
    setFilteredDataForTotals(prevData => {
      if (prevData.length !== validFilteredData.length) {
        return validFilteredData;
      }
      
      // Simple shallow comparison for performance
      const hasChanged = prevData.some((row, index) => row !== validFilteredData[index]);
      return hasChanged ? validFilteredData : prevData;
    });
  }, [tableData, JSON.stringify(filters)]);  // HIBERNATION FIX: Use JSON.stringify for filters to avoid function dependency

  // Footer totals calculation moved to utils/calculationUtils.js
  const footerTotalsCalculation = useMemo(() => {
    return calculateFooterTotals(filteredDataForTotals, footerTotalsConfig);
  }, [filteredDataForTotals, footerTotalsConfig]);



  // Filter options generation moved to utils/filterUtils.js

  // Footer template moved to utils/templateUtils.js
  const footerTemplate = createFooterTemplate(
    effectiveTotalSettings,
    currencyColumns,
    footerTotalsCalculation,
    footerTotalsConfig,
    tableData
  );

  // Toolbar components moved to utils/templateUtils.js
  const leftToolbarTemplate = createLeftToolbarTemplate(
    enableSearch,
    enableGlobalFilter,
    globalFilterPlaceholder,
    globalFilterValue,
    handleSearch,
    clearAllFilters
  );

  const rightToolbarTemplate = createRightToolbarTemplate(
    selectedRows,
    enableBulkActions,
    bulkActions,
    handleBulkAction,
    enablePivotUI,
    isLoadingPivotConfig,
    isPivotEnabled,
    setShowPivotConfig,
    showPivotConfig,
    enableColumnManagement,
    setShowColumnManager,
    showColumnManager,
    enableColumnFilter,
    clearAllFilters,
    enableExport,
    handleExport,
    enableRefresh,
    handleRefresh,
    isRefreshing
  );

  // Common filter toolbar for column grouping
  const commonFilterToolbarTemplate = useCallback(() => {
    if (!enableColumnGrouping || !finalColumnStructure.hasGroups || !enableColumnFilter) {
      return null;
    }

    // Get all available columns for filtering
    const availableColumns = defaultColumns.filter(col => col.filterable !== false);
    const fieldOptions = [
      { label: 'Select field to filter...', value: '' },
      ...availableColumns.map(col => ({
        label: col.title,
        value: col.key
      }))
    ];

    // Handle common filter field change
    const handleCommonFilterFieldChange = (selectedField) => {
      setCommonFilterField(selectedField);
      setCommonFilterValue('');
      
      // Clear any existing filter for this field
      if (selectedField) {
        const newFilters = { ...filters };
        delete newFilters[selectedField];
        
        // Apply filters and trigger the filtering mechanism
        setFilters(newFilters);
        
        // Manually trigger the filter event to ensure DataTable processes the filter
        const filterEvent = {
          filters: newFilters,
          filteredValue: applyFiltersToData(finalTableData, newFilters)
        };
        
        // Update filtered data for totals calculation
        if (enableFooterTotals) {
          const validFilteredRows = filterEvent.filteredValue.filter(row => row && typeof row === 'object');
          setFilteredDataForTotals(validFilteredRows);
        }
        
        // Call onFilterChange if provided
        if (onFilterChange) {
          onFilterChange(newFilters);
        }
      }
    };

    // Handle common filter value change and apply filter
    const handleCommonFilterValueChange = (value) => {
      setCommonFilterValue(value);
      
      if (commonFilterField) {
        const selectedColumn = defaultColumns.find(col => col.key === commonFilterField);
        if (selectedColumn) {
          const newFilters = { ...filters };
          
          if (value === null || value === '' || value === undefined) {
            // Clear filter
            delete newFilters[commonFilterField];
          } else {
            // Set filter based on column type
            const columnType = getColumnType(selectedColumn);
            let matchMode = FilterMatchMode.CONTAINS;
            
            if (['dropdown', 'select', 'categorical'].includes(columnType)) {
              matchMode = FilterMatchMode.EQUALS;
            } else if (['date', 'datetime'].includes(columnType)) {
              matchMode = FilterMatchMode.BETWEEN;
            } else if (columnType === 'number') {
              matchMode = FilterMatchMode.EQUALS;
            } else if (columnType === 'boolean') {
              matchMode = FilterMatchMode.EQUALS;
            }
            
            newFilters[commonFilterField] = {
              operator: FilterOperator.AND,
              constraints: [{ value: value, matchMode: matchMode }]
            };
          }
          
          // Apply filters and trigger the filtering mechanism
          setFilters(newFilters);
          
          // Manually trigger the filter event to ensure DataTable processes the filter
          const filterEvent = {
            filters: newFilters,
            filteredValue: applyFiltersToData(finalTableData, newFilters)
          };
          
          // Update filtered data for totals calculation
          if (enableFooterTotals) {
            const validFilteredRows = filterEvent.filteredValue.filter(row => row && typeof row === 'object');
            setFilteredDataForTotals(validFilteredRows);
          }
          
          // Call onFilterChange if provided
          if (onFilterChange) {
            onFilterChange(newFilters);
          }
        }
      }
    };

    // Clear common filter
    const clearCommonFilter = () => {
      if (commonFilterField) {
        const newFilters = { ...filters };
        delete newFilters[commonFilterField];
        
        // Apply filters and trigger the filtering mechanism
        setFilters(newFilters);
        
        // Manually trigger the filter event to ensure DataTable processes the filter
        const filterEvent = {
          filters: newFilters,
          filteredValue: applyFiltersToData(finalTableData, newFilters)
        };
        
        // Update filtered data for totals calculation
        if (enableFooterTotals) {
          const validFilteredRows = filterEvent.filteredValue.filter(row => row && typeof row === 'object');
          setFilteredDataForTotals(validFilteredRows);
        }
        
        // Call onFilterChange if provided
        if (onFilterChange) {
          onFilterChange(newFilters);
        }
      }
      setCommonFilterField('');
      setCommonFilterValue('');
    };

    // Get the appropriate filter element for the selected field
    const getCommonFilterElement = () => {
      if (!commonFilterField) return null;
      
      const selectedColumn = defaultColumns.find(col => col.key === commonFilterField);
      if (!selectedColumn) return null;

      return getColumnFilterElement(selectedColumn, commonFilterValue, handleCommonFilterValueChange);
    };

    return (
      <div className="flex align-items-center gap-3 p-3 border-round surface-50 mb-3">
        <i className="pi pi-filter text-primary"></i>
        <span className="font-semibold text-primary">Common Filter:</span>
        
        <Dropdown
          value={commonFilterField}
          options={fieldOptions}
          onChange={(e) => handleCommonFilterFieldChange(e.value)}
          placeholder="Select field to filter..."
          className="w-12rem"
          showClear={false}
        />
        
        {commonFilterField && (
          <div className="flex align-items-center gap-2">
            {getCommonFilterElement()}
            <Button
              icon="pi pi-times"
              onClick={clearCommonFilter}
              className="p-button-text p-button-sm p-button-danger"
              tooltip="Clear this filter"
              tooltipOptions={{ position: 'top' }}
            />
          </div>
        )}
      </div>
    );
  }, [
    enableColumnGrouping, 
    finalColumnStructure.hasGroups, 
    enableColumnFilter, 
    defaultColumns, 
    commonFilterField, 
    commonFilterValue, 
    filters, 
    finalTableData, 
    enableFooterTotals, 
    onFilterChange, 
    getColumnType, 
    getColumnFilterElement, 
    applyFiltersToData, 
    setFilteredDataForTotals
  ]);

  // Column grouping handlers - extracted to utils/columnGroupingUtils.js
  const {
    generateColumnGroups,
    generateFooterGroups,
    createColumnGroup
  } = createColumnGroupingHandlers({
    enableColumnGrouping,
    finalColumnStructure,
    enableSorting,
    enableColumnFilter,
    getColumnFilterElement,
    defaultColumns,
    groupConfig,
    footerColumnGroup,
    effectiveTotalSettings,
    footerTemplate
  });
  
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

      

      
      {/* Toolbar */}
      <Toolbar
        left={leftToolbarTemplate}
        right={rightToolbarTemplate}
        className="mb-4"
      />

      {/* Common Filter Toolbar for Column Grouping */}
      {commonFilterToolbarTemplate()}



      {/* DataTable */}
      <DataTable
        key={`datatable-${Array.isArray(finalTableData) ? finalTableData.length : 0}-${isPivotEnabled ? 'pivot' : 'normal'}`} // HYDRATION FIX: Force re-render on data structure changes
        value={Array.isArray(finalTableData) ? finalTableData : []} // CRITICAL: Final safety check before DataTable
        loading={isLoading}
        filters={filters}
        filterDisplay={
          enableColumnFilter 
            ? (enableColumnGrouping && finalColumnStructure.hasGroups && !forceFilterDisplayWithGrouping 
                ? "row" 
                : filterDisplay)
            : "row"  // FIXED: Always enable filter display, DataTable will handle it based on column filter props
        }
        globalFilterFields={(() => {
          const fields = globalFilterFields.length > 0 ? globalFilterFields : defaultColumns.map(col => col.key);

          return fields;
        })()}
        globalFilter={globalFilterValue}
        emptyMessage="No data found matching the filter criteria"
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onFilter={(e) => {
          // Update filters first
          handleFilter(e);
          

          
          // Update filtered data for totals calculation
          if (enableFooterTotals || (pivotTransformation.isPivot && effectiveTotalSettings.showPivotTotals)) {
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
            
            // CRITICAL FIX: Don't override global filter for grand total!
            // Only update grand total if there's no global filter active
            if (!globalFilterValue || globalFilterValue.trim() === '') {
              setFilteredDataForGrandTotal(validFilteredRows);

            } else {

            }
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
        totalRecords={Array.isArray(finalTableData) ? finalTableData.length : 0}
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
        resizableColumns={enableResizableColumns}
        reorderableColumns={enableReorderableColumns}
        virtualScrollerOptions={
          enableVirtualScrolling || (Array.isArray(finalTableData) && finalTableData.length > 1000) ? 
          { 
            itemSize: 46,
            // HIBERNATION FIX: Auto-enable virtual scrolling for large datasets
                          numToleratedItems: (Array.isArray(finalTableData) && finalTableData.length > 5000) ? 10 : 5,
              delay: (Array.isArray(finalTableData) && finalTableData.length > 10000) ? 150 : 0
          } : undefined
        }
        lazy={enableLazyLoading || (Array.isArray(finalTableData) && finalTableData.length > 2000)} // HIBERNATION FIX: Auto-enable lazy loading for large datasets
        rowGroupMode={enableRowGrouping ? 'subheader' : undefined}
        expandableRowGroups={enableRowGrouping}
        rowExpansionTemplate={enableRowExpansion ? (rowExpansionTemplate || ((data) => {
          // Safety check for data parameter
          if (!data || typeof data !== 'object') {
            return <div className="p-4 text-red-500">Invalid data format</div>;
          }
          
          // Dynamic nested structure detection and rendering
          const nestedArrays = Object.entries(data).filter(([key, value]) => 
            Array.isArray(value) && value.length > 0
          );
          
          // Helper function to safely render values
          const safeRenderValue = (value) => {
            if (value === null || value === undefined) return 'N/A';
            if (typeof value === 'object') return JSON.stringify(value);
            if (typeof value === 'number') return value.toLocaleString();
            return String(value);
          };
          
          // Helper function to get a safe display name
          const getDisplayName = (data) => {
            // Find the first non-object, non-array value for display
            for (const [key, value] of Object.entries(data)) {
              if (value !== null && value !== undefined && typeof value !== 'object' && !Array.isArray(value)) {
                return String(value);
              }
            }
            // If all values are objects/arrays, use the first key
            const firstKey = Object.keys(data)[0];
            return firstKey ? firstKey.charAt(0).toUpperCase() + firstKey.slice(1) : 'Item';
          };
          
          if (nestedArrays.length > 0) {
            return (
              <div className="p-4 bg-gray-50 border-l-4 border-blue-500">
                <h5 className="text-lg font-semibold mb-3">Details for {getDisplayName(data)}</h5>
                {nestedArrays.map(([arrayKey, arrayData]) => (
                  <div key={arrayKey} className="mb-4">
                    <h6 className="text-md font-medium text-gray-700 mb-2 capitalize">
                      {arrayKey.replace(/([A-Z])/g, ' $1').trim()} ({arrayData.length})
                    </h6>
                    {arrayData.map((item, index) => {
                      // Safety check for item
                      if (!item || typeof item !== 'object') {
                        return <div key={index} className="p-3 bg-red-100 text-red-600">Invalid item data</div>;
                      }
                      
                      return (
                        <div key={index} className="p-3 bg-white rounded border mb-2">
                          {/* Dynamically render item properties */}
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(item).map(([propKey, propValue]) => {
                              // Skip if it's another nested array
                              if (Array.isArray(propValue)) return null;
                              
                              return (
                                <div key={propKey} className="text-sm">
                                  <span className="font-medium text-gray-600 capitalize">
                                    {propKey.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="ml-1 text-gray-800">
                                    {safeRenderValue(propValue)}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                        
                        {/* Check for nested arrays within this item */}
                        {Object.entries(item).some(([key, value]) => Array.isArray(value) && value.length > 0) && (
                          <div className="mt-2 pt-2 border-t">
                            {Object.entries(item).map(([nestedKey, nestedValue]) => {
                              if (!Array.isArray(nestedValue) || nestedValue.length === 0) return null;
                              
                              return (
                                <div key={nestedKey} className="mt-2">
                                  <span className="text-xs font-medium text-gray-500 capitalize">
                                    {nestedKey.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {nestedValue.map((nestedItem, nestedIndex) => (
                                      <span key={nestedIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {getDisplayName(nestedItem)}
                                        {(() => {
                                          const values = Object.values(nestedItem);
                                          if (values[1] && typeof values[1] !== 'object' && !Array.isArray(values[1])) {
                                            return ` (${safeRenderValue(values[1])})`;
                                          }
                                          return '';
                                        })()}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                ))}
              </div>
            );
          }
          
          // Fallback for simple data
          return (
            <div className="p-4">
              <h5 className="text-lg font-semibold mb-2">Details</h5>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="ml-1 text-gray-800">
                      {safeRenderValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })) : undefined}
        expandedRows={enableRowExpansion ? localExpandedRows : undefined}
        onRowToggle={enableRowExpansion ? handleRowToggle : undefined}
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

        {enableRowExpansion && (
          <Column
            expander
            style={{ width: '3rem' }}
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



          // Ensure calculated field columns are not filtered out
          const finalColumnsToRender = columnsToRender.filter(col => {
            if (col.key && col.key.startsWith('calc_')) {
              return true; // Always include calculated fields
            }
            return !hiddenColumns.includes(col.key);
          });

          // Helper function to generate filter options for columns
          const generateFilterOptions = (column) => {
            return getFilterOptions(finalTableData, column.key, customFilterOptions);
          };

          return finalColumnsToRender.map(column => {
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
                key={column.uniqueKey || column.key}
                field={column.key}
                header={column.title} // Keep headers for filters even with grouping
                sortable={column.sortable !== false && enableSorting}
                filter={column.filterable !== false && enableColumnFilter}
                filterField={column.key}  // FIXED: Explicitly set filterField to ensure DataTable knows which field to filter
                filterElement={
                  // FIXED: Only use custom filter elements for specific column types, let PrimeReact handle standard text/number filtering
                  (column.filterable !== false && enableColumnFilter && 
                   ['dropdown', 'select', 'categorical', 'boolean'].includes(columnType)) ? 
                  (options) => {
                    const filterValue = options.value;
                    const filterCallback = options.filterCallback;
                    
                    console.log('🔍 CUSTOM FILTER ELEMENT:', {
                      columnKey: column.key,
                      columnType,
                      filterValue,
                      hasCallback: !!filterCallback,
                      options
                    });
                    
                    return getColumnFilterElement(column, filterValue, filterCallback);
                  } : undefined
                }
                filterPlaceholder={`Filter ${column.title}...`}
                filterClear={enableFilterClear ? filterClearTemplate : undefined}
                filterApply={enableFilterApply ? filterApplyTemplate : undefined}
                filterFooter={enableFilterFooter ? () => filterFooterTemplate(column) : undefined}

                showFilterMatchModes={
                  enableFilterMatchModes && 
                  !['dropdown', 'select', 'categorical', 'date', 'datetime', 'number', 'boolean'].includes(columnType)
                }
                filterMatchMode={
                  column.filterMatchMode || (
                    ['dropdown', 'select', 'categorical'].includes(columnType)
                      ? FilterMatchMode.EQUALS
                      : ['date', 'datetime'].includes(columnType)
                      ? FilterMatchMode.DATE_IS  // FIXED: Use DATE_IS instead of BETWEEN for compatibility
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

                footer={(() => {
                  // Priority 1: Show DYNAMIC grand total in footer for pivot tables
                  if (pivotTransformation.isPivot && 
                      dynamicGrandTotal && 
                      effectiveTotalSettings.showPivotTotals) {
                    
                    const grandTotalValue = dynamicGrandTotal[column.key];
                    
                    // First column shows "Grand Total" label with row count
                    if (defaultColumns.indexOf(column) === 0) {
                      const dataCount = filteredDataForGrandTotal.length > 0 ? filteredDataForGrandTotal.length : finalTableData.length;
                      return (
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: '#28a745',
                          fontSize: '14px',
                          padding: '8px 0'
                        }}>
                          📊 Grand Total ({dataCount} rows)
                        </div>
                      );
                    }
                    
                    // Other columns show formatted values
                    if (grandTotalValue !== null && grandTotalValue !== undefined && typeof grandTotalValue === 'number') {
                      try {
                        const formattedValue = new Intl.NumberFormat(
                          adjustedPivotConfig.numberFormat || 'en-US',
                          {
                            minimumFractionDigits: adjustedPivotConfig.precision || 2,
                            maximumFractionDigits: adjustedPivotConfig.precision || 2
                          }
                        ).format(grandTotalValue);
                        
                        return (
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#28a745',
                            fontSize: '14px',
                            textAlign: 'right',
                            padding: '8px 0'
                          }}>
                            {formattedValue}
                          </div>
                        );
                      } catch (error) {
                        return (
                          <div style={{ 
                            fontWeight: 'bold', 
                            color: '#28a745',
                            fontSize: '14px',
                            textAlign: 'right',
                            padding: '8px 0'
                          }}>
                            {grandTotalValue.toLocaleString()}
                          </div>
                        );
                      }
                    }
                    
                    return null;
                  }
                  
                  // Priority 2: Show regular footer totals when not in pivot mode
                  if (effectiveTotalSettings.showFooterTotals) {
                    return footerTemplate(column);
                  }
                  
                  return null;
                })()}

                body={
                  // Pivot table specific templates
                  pivotTransformation.isPivot && column.isPivotCalculatedField ? (rowData) => {
                    const value = rowData[column.key];
                    if (value === 'Error') {
                      return <span style={{ color: 'red' }}>Error</span>;
                    }
                    // Use the custom body template from calculated field column
                    if (column.calculatedField && column.calculatedField.body) {
                      return column.calculatedField.body(rowData);
                    }
                    // ✅ Fallback formatting with forced 2 decimal places for calculated fields
                    return formatCalculatedValue(value, column.format || 'number', {
                      currency: adjustedPivotConfig.currency,
                      locale: adjustedPivotConfig.numberFormat,
                      precision: 2 // ✅ Force 2 decimal places for calculated fields
                    });
                  } :
                  pivotTransformation.isPivot && column.isPivotValue ? (rowData) => pivotValueBodyTemplate(rowData, column) :
                  pivotTransformation.isPivot && column.isPivotTotal ? (rowData) => pivotValueBodyTemplate(rowData, column) :
                  pivotTransformation.isPivot && column.isPivotRow ? (rowData) => pivotRowBodyTemplate(rowData, column) :
                  
                  // Regular templates
                  isImageField ? (rowData) => imageBodyTemplate(rowData, column) :
                  columnType === 'date' || columnType === 'datetime' ? (rowData) => dateBodyTemplate(rowData, column) :
                  columnType === 'number' ? (rowData) => numberBodyTemplate(rowData, column) :
                  columnType === 'boolean' ? (rowData) => booleanBodyTemplate(rowData, column) :
                  columnType === 'roi' || column.isROIColumn ? (rowData) => roiBodyTemplate(rowData, column) :
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

      {/* NEW: Pivot Configuration Dialog */}
      <Dialog
        visible={showPivotConfig}
        onHide={() => setShowPivotConfig(false)}
        header="Configure Pivot Table"
        style={{ width: '90vw', maxWidth: '800px' }}
        modal
        closable
        draggable={false}
        resizable={false}
        className="pivot-config-dialog"
      >
        <div className="pivot-config-content">
          {/* Pivot Table Enable/Disable */}
          <div className="pivot-enable-section">
            <div className="field-checkbox">
              <Checkbox
                inputId="enablePivot"
                checked={localPivotConfig.enabled}
                onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, enabled: e.checked }))}
              />
              <label htmlFor="enablePivot" className="ml-2">Enable Pivot Table</label>
            </div>
          </div>

          {localPivotConfig.enabled && (
            <div className="pivot-config-grid">
              {/* Rows Configuration */}
              <div className="pivot-section">
                <div className="pivot-section-header rows-header">
                  <i className="pi pi-bars"></i>
                  <span className="pivot-section-label">Rows (Group By)</span>
                </div>
                <Dropdown
                  value={null}
                  options={getCategoricalFields}
                  onChange={(e) => {
                    if (e.value && !localPivotConfig.rows.includes(e.value)) {
                      setLocalPivotConfig(prev => ({
                        ...prev,
                        rows: [...prev.rows, e.value]
                      }));
                    }
                  }}
                  placeholder="Add row grouping..."
                  className="w-full"
                />
                <div className="pivot-selected-items">
                  {localPivotConfig.rows.length === 0 ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>No row grouping selected</div>
                    </div>
                  ) : (
                    localPivotConfig.rows.map((row, index) => (
                      <div key={index} className="pivot-selected-item rows-item">
                        <span className="pivot-selected-item-label">
                          {getCategoricalFields.find(f => f.value === row)?.label || row}
                        </span>
                        <Button
                          icon="pi pi-times"
                          className="p-button-text p-button-sm p-button-danger"
                          onClick={() => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              rows: prev.rows.filter((_, i) => i !== index)
                            }));
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Columns Configuration */}
              <div className="pivot-section">
                <div className="pivot-section-header columns-header">
                  <i className="pi pi-table"></i>
                  <span className="pivot-section-label">Columns (Pivot By)</span>
                </div>
                <Dropdown
                  value={null}
                  options={getCategoricalFields}
                  onChange={(e) => {
                    if (e.value && !localPivotConfig.columns.includes(e.value)) {
                      setLocalPivotConfig(prev => ({
                        ...prev,
                        columns: [...prev.columns, e.value]
                      }));
                    }
                  }}
                  placeholder="Add column grouping..."
                  className="w-full"
                />
                <div className="pivot-selected-items">
                  {localPivotConfig.columns.length === 0 ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>No column grouping selected</div>
                    </div>
                  ) : (
                    localPivotConfig.columns.map((col, index) => (
                      <div key={index} className="pivot-selected-item columns-item">
                        <span className="pivot-selected-item-label">
                          {getCategoricalFields.find(f => f.value === col)?.label || col}
                        </span>
                        <Button
                          icon="pi pi-times"
                          className="p-button-text p-button-sm p-button-danger"
                          onClick={() => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              columns: prev.columns.filter((_, i) => i !== index)
                            }));
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Values Configuration */}
              <div className="pivot-section pivot-values-section">
                <div className="pivot-section-header values-header">
                  <i className="pi pi-calculator"></i>
                  <span className="pivot-section-label">Values (Aggregations)</span>
                </div>
                <Dropdown
                  value={null}
                  options={getNumericFields}
                  onChange={(e) => {
                    if (e.value && !localPivotConfig.values.find(v => v.field === e.value)) {
                      setLocalPivotConfig(prev => ({
                        ...prev,
                        values: [...prev.values, { field: e.value, aggregation: 'sum' }]
                      }));
                    }
                  }}
                  placeholder="Add value field..."
                  className="w-full"
                />
                <div className="pivot-selected-items">
                  {localPivotConfig.values.length === 0 ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>No value fields selected</div>
                    </div>
                  ) : (
                    localPivotConfig.values.map((value, index) => (
                      <div key={index} className="pivot-value-item">
                        <div className="pivot-value-item-header">
                          <span className="pivot-value-item-label">
                            {getNumericFields.find(f => f.value === value.field)?.label || value.field}
                          </span>
                          <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm p-button-danger"
                            onClick={() => {
                              setLocalPivotConfig(prev => ({
                                ...prev,
                                values: prev.values.filter((_, i) => i !== index)
                              }));
                            }}
                          />
                        </div>
                        <Dropdown
                          value={value.aggregation}
                          options={aggregationOptions}
                          onChange={(e) => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              values: prev.values.map((v, i) => 
                                i === index ? { ...v, aggregation: e.value } : v
                              )
                            }));
                          }}
                          className="w-full"
                          placeholder="Select aggregation..."
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Value Aggregations (Meta-Aggregations) */}
              <div className="pivot-section pivot-meta-aggregations-section">
                <div className="pivot-section-header meta-aggregations-header">
                  <i className="pi pi-chart-bar"></i>
                  <span className="pivot-section-label">Value Aggregations</span>
                  <span className="pivot-section-subtitle" style={{ fontSize: '11px', color: '#6c757d', marginLeft: '8px' }}>
                    Aggregate the already-aggregated values
                  </span>
                </div>
                
                {/* Available Value Aggregations Dropdown */}
                {localPivotConfig.values.length > 0 && (
                  <Dropdown
                    value={null}
                    options={localPivotConfig.values.map(v => ({
                      label: `${getNumericFields.find(f => f.value === v.field)?.label || v.field} (${v.aggregation})`,
                      value: `${v.field}_${v.aggregation}`
                    }))}
                    onChange={(e) => {
                      if (e.value && !localPivotConfig.metaAggregations?.find(ma => ma.sourceKey === e.value)) {
                        const [field, aggregation] = e.value.split('_');
                        setLocalPivotConfig(prev => ({
                          ...prev,
                          metaAggregations: [
                            ...(prev.metaAggregations || []),
                            { 
                              sourceKey: e.value,
                              field: field,
                              sourceAggregation: aggregation,
                              metaAggregation: 'max'
                            }
                          ]
                        }));
                      }
                    }}
                    placeholder="Add aggregation for value..."
                    className="w-full"
                  />
                )}
                
                <div className="pivot-selected-items">
                  {(!localPivotConfig.metaAggregations || localPivotConfig.metaAggregations.length === 0) ? (
                    <div className="pivot-empty-state">
                      <i className="pi pi-plus"></i>
                      <div>
                        {localPivotConfig.values.length === 0 
                          ? "Add value fields first to enable value aggregations"
                          : "No value aggregations selected"
                        }
                      </div>
                    </div>
                  ) : (
                    localPivotConfig.metaAggregations.map((metaAgg, index) => (
                      <div key={index} className="pivot-value-item">
                        <div className="pivot-value-item-header">
                          <span className="pivot-value-item-label">
                            {getNumericFields.find(f => f.value === metaAgg.field)?.label || metaAgg.field} ({metaAgg.sourceAggregation})
                          </span>
                          <Button
                            icon="pi pi-times"
                            className="p-button-text p-button-sm p-button-danger"
                            onClick={() => {
                              setLocalPivotConfig(prev => ({
                                ...prev,
                                metaAggregations: prev.metaAggregations.filter((_, i) => i !== index)
                              }));
                            }}
                          />
                        </div>
                        <Dropdown
                          value={metaAgg.metaAggregation}
                          options={aggregationOptions}
                          onChange={(e) => {
                            setLocalPivotConfig(prev => ({
                              ...prev,
                              metaAggregations: prev.metaAggregations.map((ma, i) => 
                                i === index ? { ...ma, metaAggregation: e.value } : ma
                              )
                            }));
                          }}
                          className="w-full"
                          placeholder="Select meta-aggregation..."
                        />
                        <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                          {metaAgg.metaAggregation?.toUpperCase()} of {getNumericFields.find(f => f.value === metaAgg.field)?.label || metaAgg.field} {metaAgg.sourceAggregation?.toUpperCase()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Calculated Fields */}
              <div className="pivot-section pivot-calculated-fields-section">
                <CalculatedFieldsManager 
                  calculatedFields={localPivotConfig.calculatedFields || []}
                  onCalculatedFieldsChange={(calculatedFields) => {
                    setLocalPivotConfig(prev => ({
                      ...prev,
                      calculatedFields
                    }));
                  }}
                  availableFields={[
                    // Add aggregated value fields that can be used in calculated fields
                    ...localPivotConfig.values.map(value => ({
                      key: localPivotConfig.showRowTotals 
                        ? (localPivotConfig.values.filter(v => v.field === value.field).length > 1 
                          ? `${value.field}_${value.aggregation || 'sum'}_total` 
                          : `${value.field}_total`)
                        : (localPivotConfig.values.length > 1 && localPivotConfig.values.filter(v => v.field === value.field).length > 1 
                          ? `${value.field}_${value.aggregation || 'sum'}` 
                          : value.field),
                      field: value.field,
                      aggregation: value.aggregation || 'sum',
                      type: 'number',
                      title: `${getNumericFields.find(f => f.value === value.field)?.label || value.field} (${value.aggregation || 'sum'})`
                    })),
                    // Add column-specific value fields if columns are configured
                    ...(localPivotConfig.columns.length > 0 && localPivotConfig.values.length > 0 
                      ? localPivotConfig.columns.flatMap(colField => {
                          // Get unique values for this column from the data
                          const columnValues = finalTableData 
                            ? [...new Set(finalTableData.map(row => row[colField]).filter(v => v !== null && v !== undefined))]
                            : [];
                          
                          return columnValues.slice(0, 5).flatMap(colValue => // Limit to first 5 values for performance
                            localPivotConfig.values.map(value => ({
                              key: `${colValue}_${value.field}_${value.aggregation || 'sum'}`,
                              field: value.field,
                              aggregation: value.aggregation || 'sum',
                              type: 'number',
                              title: `${colValue} - ${getNumericFields.find(f => f.value === value.field)?.label || value.field} (${value.aggregation || 'sum'})`,
                              pivotColumn: colValue
                            }))
                          );
                        })
                      : [])
                  ]}
                  sampleData={finalTableData?.slice(0, 1) || []}
                />
              </div>

              {/* Display Options */}
              <div className="pivot-display-section">
                <div className="pivot-display-header">
                  <i className="pi pi-cog"></i>
                  <span className="pivot-section-label">Display Options</span>
                </div>
                <div className="pivot-display-options">
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showGrandTotals"
                      checked={localPivotConfig.showGrandTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showGrandTotals: e.checked }))}
                    />
                    <label htmlFor="showGrandTotals">Grand Totals</label>
                  </div>
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showRowTotals"
                      checked={localPivotConfig.showRowTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showRowTotals: e.checked }))}
                    />
                    <label htmlFor="showRowTotals">Row Totals</label>
                  </div>
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showColumnTotals"
                      checked={localPivotConfig.showColumnTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showColumnTotals: e.checked }))}
                    />
                    <label htmlFor="showColumnTotals">Column Totals</label>
                  </div>
                  <div className="pivot-display-option">
                    <Checkbox
                      inputId="showSubTotals"
                      checked={localPivotConfig.showSubTotals}
                      onChange={(e) => setLocalPivotConfig(prev => ({ ...prev, showSubTotals: e.checked }))}
                    />
                    <label htmlFor="showSubTotals">Sub Totals</label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pivot-actions">
            <Button
              label="Reset"
              icon="pi pi-refresh"
              className="p-button-outlined p-button-secondary"
              onClick={resetPivotConfig}
              disabled={isSavingPivotConfig}
            />
            
            {/* Manual Save Button - only show if auto-save is disabled */}
            {enablePivotPersistence && finalSaveToCMS && !autoSavePivotConfig && (
              <Button
                label={isSavingPivotConfig ? "Saving..." : "Save"}
                icon={isSavingPivotConfig ? "pi pi-spin pi-spinner" : "pi pi-save"}
                className="p-button-outlined p-button-info"
                onClick={savePivotConfigManually}
                disabled={isSavingPivotConfig}
              />
            )}
            
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-outlined"
              onClick={() => setShowPivotConfig(false)}
              disabled={isSavingPivotConfig}
            />
            
            {/* Apply (Temporary UI Only) */}
            <Button
              label="Apply"
              icon="pi pi-eye"
              className="p-button-outlined p-button-info"
              onClick={applyPivotConfig}
              disabled={
                localPivotConfig.enabled && (localPivotConfig.rows.length === 0 || localPivotConfig.values.length === 0)
              }
              tooltip="Apply temporarily (not saved to CMS)"
              tooltipOptions={{ position: 'top' }}
            />
            
            {/* Apply & Save (Persistent) */}
            {enablePivotPersistence && finalSaveToCMS && (
              <Button
                label={isSavingPivotConfig ? "Applying & Saving..." : "Apply & Save"}
                icon={isSavingPivotConfig ? "pi pi-spin pi-spinner" : "pi pi-check"}
                className="p-button-success"
                onClick={applyAndSavePivotConfig}
                disabled={
                  isSavingPivotConfig || 
                  (localPivotConfig.enabled && (localPivotConfig.rows.length === 0 || localPivotConfig.values.length === 0))
                }
                tooltip="Apply and save to CMS for persistence"
                tooltipOptions={{ position: 'top' }}
              />
            )}
          </div>
      </Dialog>
            </div>
  );
};

export default PrimeDataTable; 