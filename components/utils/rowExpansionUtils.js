/**
 * Row Expansion Utilities for PrimeReact DataTable
 * 
 * Provides utility functions for managing row expansion functionality including:
 * - Expansion state management
 * - Row expansion validation
 * - Auto-detection of expandable rows
 * - Expansion template generation
 * - Expand/collapse all functionality
 */

/**
 * Check if a row can be expanded based on data structure
 * @param {Object} rowData - The row data to check
 * @param {Function} customValidator - Custom validation function
 * @param {Function} allowExpansion - Custom expansion condition function
 * @returns {boolean} - Whether the row can be expanded
 */
export const canExpandRow = (rowData, customValidator = null, allowExpansion = null) => {
  try {
    // Safety check for empty or invalid row data
    if (!rowData || typeof rowData !== 'object') {
      return false;
    }
    
    if (customValidator) {
      return customValidator(rowData);
    }
    
    if (allowExpansion) {
      return allowExpansion(rowData);
    }
    
    // Auto-detect nested data patterns - prioritize invoices for your data structure
    const hasNestedData = rowData.invoices || rowData.orders || rowData.children || rowData.subItems || rowData.nestedData;
    return hasNestedData && Array.isArray(hasNestedData) && hasNestedData.length > 0;
  } catch (error) {
    console.warn('Error checking if row can be expanded:', error);
    return false;
  }
};

/**
 * Generate expansion column configuration for PrimeReact DataTable
 * @param {Object} options - Configuration options
 * @returns {Object} - Expansion column configuration
 */
export const generateExpansionColumn = ({
  canExpandRowFn = canExpandRow,
  style = { width: '5rem' },
  header = null,
  body = null,
  position = 'left', // 'left' or 'right'
  width = '5rem'
} = {}) => {
  // Create a simple expander function that doesn't cause serialization issues
  const simpleExpander = (rowData) => {
    try {
      return canExpandRowFn(rowData);
    } catch (error) {
      console.warn('Error in expander function:', error);
      return false;
    }
  };
  
  return {
    expander: simpleExpander,
    style: { ...style, width },
    header,
    body,
    frozen: position === 'left' ? true : 
            position === 'right' ? 'right' : false
  };
};

/**
 * Get nested data label based on data structure
 * @param {Array} nestedData - The nested data array
 * @returns {string} - Human-readable label for the nested data
 */
export const getNestedDataLabel = (nestedData) => {
  if (!nestedData || nestedData.length === 0) return 'Items';
  
  const sampleRow = nestedData[0];
  if (!sampleRow) return 'Items';
  
  // Auto-detect based on common field names
  if (sampleRow.Invoice || sampleRow.invoice) return 'Invoices';
  if (sampleRow.Order || sampleRow.order) return 'Orders';
  if (sampleRow.Product || sampleRow.product) return 'Products';
  if (sampleRow.Item || sampleRow.item) return 'Items';
  if (sampleRow.Transaction || sampleRow.transaction) return 'Transactions';
  if (sampleRow.Record || sampleRow.record) return 'Records';
  
  return 'Items';
};

/**
 * Generate auto-detected expansion template
 * @param {Object} rowData - The row data
 * @param {Object} config - Nested data configuration
 * @returns {JSX.Element} - React component for expansion content
 */
export const generateAutoDetectedExpansionTemplate = (rowData, config = {}) => {
  const {
    enableNestedSorting = true,
    enableNestedFiltering = true,
    enableNestedPagination = false,
    nestedPageSize = 10
  } = config;
  
  try {
    // Safety check for empty or invalid row data
    if (!rowData || typeof rowData !== 'object') {
      return (
        <div className="p-3">
          <p className="text-muted">Invalid row data.</p>
        </div>
      );
    }
  
    // Auto-detect nested data patterns - prioritize invoices for your data structure
    const nestedData = rowData.invoices || rowData.orders || rowData.children || rowData.subItems || rowData.nestedData;
    
    if (!nestedData || !Array.isArray(nestedData) || nestedData.length === 0) {
      return (
        <div className="p-3">
          <p className="text-muted">No nested data available for this row.</p>
        </div>
      );
    }
    
    // Validate that nested data contains valid objects
    const validNestedData = nestedData.filter(item => 
      item && typeof item === 'object' && !Array.isArray(item)
    );
    
    if (validNestedData.length === 0) {
      return (
        <div className="p-3">
          <p className="text-muted">Invalid nested data structure.</p>
        </div>
      );
    }
   
    // Auto-generate columns based on nested data structure
    const sampleNestedRow = nestedData[0];
    if (!sampleNestedRow) return null;
    
    // Create a simple column configuration without body functions to avoid React serialization issues
    const autoColumns = Object.keys(sampleNestedRow).map(key => {
      return {
        field: key,
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        sortable: enableNestedSorting,
        filter: enableNestedFiltering
      };
    });
   
    // Auto-detect parent row identifier for better title
    const parentIdentifier = rowData.Customer || rowData.name || rowData.title || rowData.id || 'Row';
    
    return (
      <div className="p-3">
        <h5 className="text-lg font-semibold text-gray-800 mb-3">
          {nestedData.length} {getNestedDataLabel(nestedData)} for {parentIdentifier}
        </h5>
        <div className="nested-data-table">
          {/* This will be rendered by the parent component with DataTable */}
          {validNestedData}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error generating auto-detected expansion template:', error);
    return (
      <div className="p-3">
        <p className="text-red-500">Error generating expansion content</p>
      </div>
    );
  }
};

/**
 * Generate expand/collapse all buttons
 * @param {Object} options - Configuration options
 * @returns {JSX.Element} - React component with expand/collapse buttons
 */
export const generateExpansionButtons = ({
  onExpandAll,
  onCollapseAll,
  expandAllLabel = "Expand All",
  collapseAllLabel = "Collapse All",
  buttonClassName = "",
  buttonStyle = {}
} = {}) => {
  return (
    <div className="flex flex-wrap justify-content-end gap-2">
      <button 
        className={`p-button p-button-text ${buttonClassName}`}
        onClick={onExpandAll}
        style={buttonStyle}
      >
        <i className="pi pi-plus"></i>
        <span className="ml-2">{expandAllLabel}</span>
      </button>
      <button 
        className={`p-button p-button-text ${buttonClassName}`}
        onClick={onCollapseAll}
        style={buttonStyle}
      >
        <i className="pi pi-minus"></i>
        <span className="ml-2">{collapseAllLabel}</span>
      </button>
    </div>
  );
};

/**
 * Expand all rows in the data
 * @param {Array} data - The data array
 * @param {string} dataKey - The unique identifier field
 * @param {Function} canExpandRowFn - Function to check if row can be expanded
 * @returns {Object} - Object with expanded row keys
 */
export const expandAllRows = (data, dataKey = 'id', canExpandRowFn = canExpandRow) => {
  const newExpandedRows = {};
  
  data.forEach((row) => {
    const rowKey = row[dataKey];
    if (rowKey !== undefined && canExpandRowFn(row)) {
      newExpandedRows[rowKey] = true;
    }
  });
  
  return newExpandedRows;
};

/**
 * Collapse all rows
 * @returns {Object} - Empty object representing no expanded rows
 */
export const collapseAllRows = () => {
  return {};
};

/**
 * Create row expansion configuration object for PrimeReact DataTable
 * @param {Object} options - Configuration options
 * @returns {Object} - Complete row expansion configuration
 */
export const createRowExpansionConfig = ({
  // Data and validation
  data = [],
  dataKey = 'id',
  canExpandRowFn = canExpandRow,
  customValidator = null,
  
  // Expansion column configuration
  expansionColumnStyle = { width: '5rem' },
  expansionColumnWidth = '5rem',
  expansionColumnHeader = null,
  expansionColumnBody = null,
  expansionColumnPosition = 'left',
  
  // Expansion template
  rowExpansionTemplate = null,
  nestedDataConfig = {
    enableNestedSorting: true,
    enableNestedFiltering: true,
    enableNestedPagination: false,
    nestedPageSize: 10
  },
  
  // UI customization
  showExpandAllButtons = true,
  expandAllLabel = "Expand All",
  collapseAllLabel = "Collapse All",
  expansionButtonClassName = "",
  expansionButtonStyle = {},
  
  // Callbacks
  onRowToggle = null,
  onRowExpand = null,
  onRowCollapse = null,
  toastRef = null
} = {}) => {
  
  // Use custom validator if provided, otherwise use canExpandRowFn
  const validateExpansion = customValidator || canExpandRowFn;
  
  // Generate expansion column
  const expansionColumn = generateExpansionColumn({
    canExpandRowFn: validateExpansion,
    style: expansionColumnStyle,
    header: expansionColumnHeader,
    body: expansionColumnBody,
    position: expansionColumnPosition,
    width: expansionColumnWidth
  });
  
  // Generate expansion template
  const expansionTemplate = rowExpansionTemplate || 
    ((rowData) => generateAutoDetectedExpansionTemplate(rowData, nestedDataConfig));
  
  // Generate expansion buttons if enabled
  const expansionButtons = showExpandAllButtons ? 
    generateExpansionButtons({
      onExpandAll: () => {
        const newExpandedRows = expandAllRows(data, dataKey, validateExpansion);
        if (onRowToggle) {
          onRowToggle({ data: newExpandedRows });
        }
        
        // Show toast notification if available
        if (toastRef?.current) {
          toastRef.current.show({ 
            severity: 'info', 
            summary: 'All Rows Expanded', 
            detail: `${Object.keys(newExpandedRows).length} rows expanded`, 
            life: 3000 
          });
        }
      },
      onCollapseAll: () => {
        if (onRowToggle) {
          onRowToggle({ data: {} });
        }
        
        // Show toast notification if available
        if (toastRef?.current) {
          toastRef.current.show({ 
            severity: 'success', 
            summary: 'All Rows Collapsed', 
            detail: 'All rows collapsed', 
            life: 3000 
          });
        }
      },
      expandAllLabel,
      collapseAllLabel,
      buttonClassName: expansionButtonClassName,
      buttonStyle: expansionButtonStyle
    }) : null;
  
  return {
    // Expansion column configuration
    expansionColumn,
    
    // Expansion template
    rowExpansionTemplate: expansionTemplate,
    
    // Expansion buttons
    expansionButtons,
    
    // Utility functions
    canExpandRow: validateExpansion,
    expandAllRows: () => expandAllRows(data, dataKey, validateExpansion),
    collapseAllRows,
    
    // Configuration
    dataKey,
    nestedDataConfig
  };
};

/**
 * Handle row expansion with toast notification
 * @param {Object} event - Row expansion event
 * @param {Function} onRowExpand - Custom row expand callback
 * @param {Object} toastRef - Reference to toast component
 */
export const handleRowExpand = (event, onRowExpand = null, toastRef = null) => {
  if (onRowExpand) {
    onRowExpand(event);
  }
  
  // Show toast notification if available
  if (toastRef?.current) {
    const rowData = event.data;
    const rowName = rowData.name || rowData.title || rowData.id || 'Row';
    toastRef.current.show({ 
      severity: 'info', 
      summary: 'Row Expanded', 
      detail: `${rowName} expanded`, 
      life: 3000 
    });
  }
};

/**
 * Handle row collapse with toast notification
 * @param {Object} event - Row collapse event
 * @param {Function} onRowCollapse - Custom row collapse callback
 * @param {Object} toastRef - Reference to toast component
 */
export const handleRowCollapse = (event, onRowCollapse = null, toastRef = null) => {
  if (onRowCollapse) {
    onRowCollapse(event);
  }
  
  // Show toast notification if available
  if (toastRef?.current) {
    const rowData = event.data;
    const rowName = rowData.name || rowData.title || rowData.id || 'Row';
    toastRef.current.show({ 
      severity: 'success', 
      summary: 'Row Collapsed', 
      detail: `${rowName} collapsed`, 
      life: 3000 
    });
  }
};
