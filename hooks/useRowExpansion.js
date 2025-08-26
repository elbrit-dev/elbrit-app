import { useMemo } from 'react';
import RowExpansionManager from '../components/RowExpansionManager';

/**
 * useRowExpansion - Custom hook for row expansion functionality
 * 
 * This hook provides a clean interface to the RowExpansionManager component
 * and returns all necessary props and handlers for DataTable integration.
 * 
 * @param {Object} config - Configuration object for row expansion
 * @returns {Object} Object containing all expansion-related props and handlers
 */
const useRowExpansion = (config = {}) => {
  const {
    // Basic configuration
    enabled = false,
    data = [],
    dataKey = 'id',
    
    // Expansion state
    expandedRows,
    onRowToggle,
    onRowExpand,
    onRowCollapse,
    
    // Templates and validation
    rowExpansionTemplate,
    allowExpansion,
    validateExpansion,
    
    // UI customization
    expansionColumnStyle = { width: '5rem' },
    expansionColumnWidth = '5rem',
    expansionColumnHeader = null,
    expansionColumnBody = null,
    expansionColumnPosition = 'left',
    
    // Expand/Collapse all buttons
    showExpandAllButtons = true,
    expandAllLabel = "Expand All",
    collapseAllLabel = "Collapse All",
    expansionButtonStyle = {},
    expansionButtonClassName = "",
    
    // Icons and animation
    expandIcon = "pi pi-plus",
    collapseIcon = "pi pi-minus",
    enableExpansionAnimation = true,
    
    // Nested data configuration
    nestedDataConfig = {
      enableNestedSorting: true,
      enableNestedFiltering: true,
      enableNestedPagination: false,
      nestedPageSize: 10
    },
    
    // Toast reference for notifications
    toastRef = null
  } = config;
  
  // Only create expansion manager if enabled
  const expansionManager = useMemo(() => {
    if (!enabled) {
      return {
        // Return empty expansion configuration when disabled
        expandedRows: {},
        onRowToggle: () => {},
        onRowExpand: () => {},
        onRowCollapse: () => {},
        expansionColumn: null,
        expansionHeader: null,
        rowExpansionTemplate: () => null,
        expandAll: () => {},
        collapseAll: () => {},
        canExpandRow: () => false,
        dataKey,
        enableExpansionAnimation: false
      };
    }
    
    // Create expansion manager when enabled
    return RowExpansionManager({
      expandedRows,
      onRowToggle,
      onRowExpand,
      onRowCollapse,
      rowExpansionTemplate,
      allowExpansion,
      expansionColumnStyle,
      expandAllLabel,
      collapseAllLabel,
      showExpandAllButtons,
      expansionColumnWidth,
      toastRef,
      dataKey,
      expansionColumnHeader,
      expansionColumnBody,
      expansionColumnPosition,
      expandIcon,
      collapseIcon,
      enableExpansionAnimation,
      expansionButtonStyle,
      expansionButtonClassName,
      validateExpansion,
      nestedDataConfig,
      data
    });
  }, [
    enabled,
    expandedRows,
    onRowToggle,
    onRowExpand,
    onRowCollapse,
    rowExpansionTemplate,
    allowExpansion,
    expansionColumnStyle,
    expandAllLabel,
    collapseAllLabel,
    showExpandAllButtons,
    expansionColumnWidth,
    toastRef,
    dataKey,
    expansionColumnHeader,
    expansionColumnBody,
    expansionColumnPosition,
    expandIcon,
    collapseIcon,
    enableExpansionAnimation,
    expansionButtonStyle,
    expansionButtonClassName,
    validateExpansion,
    nestedDataConfig,
    data
  ]);
  
  // Return expansion configuration
  return {
    // Basic expansion state
    expandedRows: expansionManager.expandedRows,
    onRowToggle: expansionManager.onRowToggle,
    onRowExpand: expansionManager.onRowExpand,
    onRowCollapse: expansionManager.onRowCollapse,
    
    // Expansion column (can be null if disabled)
    expansionColumn: expansionManager.expansionColumn,
    
    // Expansion header with buttons
    expansionHeader: expansionManager.expansionHeader,
    
    // Row expansion template
    rowExpansionTemplate: expansionManager.rowExpansionTemplate,
    
    // Utility functions
    expandAll: expansionManager.expandAll,
    collapseAll: expansionManager.collapseAll,
    canExpandRow: expansionManager.canExpandRow,
    
    // Configuration
    dataKey: expansionManager.dataKey,
    enableExpansionAnimation: expansionManager.enableExpansionAnimation,
    
    // Helper properties
    isEnabled: enabled,
    hasExpansionColumn: !!expansionManager.expansionColumn,
    hasExpansionHeader: !!expansionManager.expansionHeader
  };
};

export default useRowExpansion;
