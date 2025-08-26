import React, { useState, useCallback, useMemo } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

/**
 * RowExpansionManager - Handles row expansion functionality for PrimeReact DataTable
 * 
 * Features:
 * - Expandable rows with custom templates
 * - Expand/Collapse all functionality
 * - Custom expansion conditions
 * - Nested data display
 * - Toast notifications for expansion events
 * 
 * Props:
 * - expandedRows: Object containing expanded row states
 * - onRowToggle: Callback when rows are expanded/collapsed
 * - onRowExpand: Callback when a row is expanded
 * - onRowCollapse: Callback when a row is collapsed
 * - rowExpansionTemplate: Function to render expanded content
 * - allowExpansion: Function to determine if a row can be expanded
 * - expansionColumnStyle: Style for the expansion column
 * - expandAllLabel: Label for expand all button
 * - collapseAllLabel: Label for collapse all button
 * - showExpandAllButtons: Whether to show expand/collapse all buttons
 * - toastRef: Reference to toast component for notifications
 * - dataKey: Unique identifier for rows (default: 'id')
 * - expansionColumnWidth: Width of expansion column (default: '5rem')
 */

const RowExpansionManager = ({
  // State props
  expandedRows,
  onRowToggle,
  onRowExpand,
  onRowCollapse,
  
  // Template and configuration
  rowExpansionTemplate,
  allowExpansion,
  expansionColumnStyle = { width: '5rem' },
  
  // UI customization
  expandAllLabel = "Expand All",
  collapseAllLabel = "Collapse All",
  showExpandAllButtons = true,
  expansionColumnWidth = '5rem',
  
  // Callbacks
  toastRef,
  dataKey = 'id',
  
  // Data for expansion buttons
  data = [],
  
  // Custom expansion column header
  expansionColumnHeader = null,
  
  // Custom expansion column body
  expansionColumnBody = null,
  
  // Expansion column position
  expansionColumnPosition = 'left', // 'left' or 'right'
  
  // Custom expand/collapse icons
  expandIcon = "pi pi-plus",
  collapseIcon = "pi pi-minus",
  
  // Expansion animation
  enableExpansionAnimation = true,
  
  // Custom expansion button styling
  expansionButtonStyle = {},
  expansionButtonClassName = "",
  
  // Row expansion validation
  validateExpansion = null, // Custom validation function
  
  // Nested data configuration
  nestedDataConfig = {
    enableNestedSorting: true,
    enableNestedFiltering: true,
    enableNestedPagination: false,
    nestedPageSize: 10
  }
}) => {
  
  // Local state for expansion management
  const [localExpandedRows, setLocalExpandedRows] = useState(expandedRows || {});
  
  // Memoized expansion state
  const currentExpandedRows = useMemo(() => {
    return expandedRows !== undefined ? expandedRows : localExpandedRows;
  }, [expandedRows, localExpandedRows]);
  
  // Handle row toggle with local state fallback
  const handleRowToggle = useCallback((event) => {
    if (onRowToggle) {
      onRowToggle(event);
    } else {
      setLocalExpandedRows(event.data);
    }
  }, [onRowToggle]);
  
  // Handle row expand with toast notification
  const handleRowExpand = useCallback((event) => {
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
  }, [onRowExpand, toastRef]);
  
  // Handle row collapse with toast notification
  const handleRowCollapse = useCallback((event) => {
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
  }, [onRowCollapse, toastRef]);
  
  // Expand all rows
  const expandAll = useCallback(() => {
    const newExpandedRows = {};
    
    data.forEach((row) => {
      const rowKey = row[dataKey];
      if (rowKey !== undefined && (!allowExpansion || allowExpansion(row))) {
        newExpandedRows[rowKey] = true;
      }
    });
    
    if (onRowToggle) {
      onRowToggle({ data: newExpandedRows });
    } else {
      setLocalExpandedRows(newExpandedRows);
    }
    
    // Show toast notification
    if (toastRef?.current) {
      toastRef.current.show({ 
        severity: 'info', 
        summary: 'All Rows Expanded', 
        detail: `${Object.keys(newExpandedRows).length} rows expanded`, 
        life: 3000 
      });
    }
  }, [data, dataKey, allowExpansion, onRowToggle, toastRef]);
  
  // Collapse all rows
  const collapseAll = useCallback(() => {
    if (onRowToggle) {
      onRowToggle({ data: {} });
    } else {
      setLocalExpandedRows({});
    }
    
    // Show toast notification
    if (toastRef?.current) {
      toastRef.current.show({ 
        severity: 'success', 
        summary: 'All Rows Collapsed', 
        detail: 'All rows collapsed', 
        life: 3000 
      });
    }
  }, [onRowToggle, toastRef]);
  
  // Check if a row can be expanded
  const canExpandRow = useCallback((rowData) => {
    try {
      // Safety check for empty or invalid row data
      if (!rowData || typeof rowData !== 'object') {
        return false;
      }
      
      if (validateExpansion) {
        return validateExpansion(rowData);
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
  }, [allowExpansion, validateExpansion]);
  
  // Generate expansion column
  const generateExpansionColumn = useCallback(() => {
    // Create a simple expander function that doesn't cause serialization issues
    const simpleExpander = (rowData) => {
      try {
        return canExpandRow(rowData);
      } catch (error) {
        console.warn('Error in expander function:', error);
        return false;
      }
    };
    
    const expansionColumn = {
      expander: simpleExpander,
      style: { ...expansionColumnStyle, width: expansionColumnWidth },
      header: expansionColumnHeader,
      body: expansionColumnBody,
      frozen: expansionColumnPosition === 'left' ? true : 
              expansionColumnPosition === 'right' ? 'right' : false
    };
    
    return expansionColumn;
  }, [
    canExpandRow,
    expansionColumnStyle, 
    expansionColumnWidth, 
    expansionColumnHeader, 
    expansionColumnBody, 
    expansionColumnPosition
  ]);
  
  // Generate expand/collapse all header
  const generateExpansionHeader = useCallback(() => {
    if (!showExpandAllButtons) return null;
    
    return (
      <div className="flex flex-wrap justify-content-end gap-2">
        <Button 
          icon="pi pi-plus" 
          label={expandAllLabel} 
          onClick={expandAll} 
          text 
          className={expansionButtonClassName}
          style={expansionButtonStyle}
        />
        <Button 
          icon="pi pi-minus" 
          label={collapseAllLabel} 
          onClick={collapseAll} 
          text 
          className={expansionButtonClassName}
          style={expansionButtonStyle}
        />
      </div>
    );
  }, [
    showExpandAllButtons, 
    expandAllLabel, 
    collapseAllLabel, 
    expandAll, 
    collapseAll, 
    expansionButtonClassName, 
    expansionButtonStyle
  ]);
  

  
  // Enhanced row expansion template with nested DataTable support
  const enhancedRowExpansionTemplate = useCallback((rowData) => {
    try {
      if (!rowExpansionTemplate) {
        // Auto-detect and generate template based on data structure
        return generateAutoDetectedExpansionTemplate(rowData);
      }
      
      return rowExpansionTemplate(rowData);
    } catch (error) {
      console.error('Error in row expansion template:', error);
      return (
        <div className="p-3">
          <p className="text-red-500">Error rendering expansion content</p>
        </div>
      );
    }
  }, [rowExpansionTemplate, generateAutoDetectedExpansionTemplate]);
  
           // Generate auto-detected expansion template
    const generateAutoDetectedExpansionTemplate = useCallback((rowData) => {
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
          const value = sampleNestedRow[key];
          
          return {
            field: key,
            header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            sortable: nestedDataConfig.enableNestedSorting,
            filter: nestedDataConfig.enableNestedFiltering
          };
        });
       
        // Auto-detect parent row identifier for better title
        const parentIdentifier = rowData.Customer || rowData.name || rowData.title || rowData.id || 'Row';
        
        return (
          <div className="p-3">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">
              {nestedData.length} {getNestedDataLabel(nestedData)} for {parentIdentifier}
            </h5>
            <DataTable 
              value={validNestedData}
              paginator={nestedDataConfig.enableNestedPagination}
              rows={nestedDataConfig.nestedPageSize}
              showGridlines
              stripedRows
              className="nested-data-table"
            >
              {autoColumns.map((col, index) => (
                <Column
                  key={index}
                  field={col.field}
                  header={col.header}
                  sortable={col.sortable}
                  filter={col.filter}
                />
              ))}
            </DataTable>
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
    }, [nestedDataConfig]);
  
  // Helper function to get nested data label
  const getNestedDataLabel = useCallback((nestedData) => {
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
  }, []);
  
  // Generate default expansion template (fallback)
  const generateDefaultExpansionTemplate = useCallback((rowData) => {
    // Try to find nested data
    const nestedData = rowData.children || rowData.orders || rowData.subItems || rowData.nestedData;
    
    if (!nestedData || !Array.isArray(nestedData) || nestedData.length === 0) {
      return (
        <div className="p-3">
          <p>No nested data available for this row.</p>
        </div>
      );
    }
    
    // Auto-generate columns based on nested data structure
    const sampleNestedRow = nestedData[0];
    if (!sampleNestedRow) return null;
    
    // Create simple columns without body functions to avoid React serialization issues
    const autoColumns = Object.keys(sampleNestedRow).map(key => {
      const value = sampleNestedRow[key];
      
      return {
        field: key,
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        sortable: nestedDataConfig.enableNestedSorting,
        filter: nestedDataConfig.enableNestedFiltering
      };
    });
    
    return (
      <div className="p-3">
        <h5>Details for {rowData.name || rowData.title || rowData.id}</h5>
        <DataTable 
          value={nestedData}
          paginator={nestedDataConfig.enableNestedPagination}
          rows={nestedDataConfig.nestedPageSize}
          showGridlines
          stripedRows
        >
          {autoColumns.map((col, index) => (
            <Column
              key={index}
              field={col.field}
              header={col.header}
              sortable={col.sortable}
              filter={col.filter}
            />
          ))}
        </DataTable>
      </div>
    );
  }, [nestedDataConfig]);
  

  
  // Return the expansion configuration object
  return {
    // Expansion state and handlers
    expandedRows: currentExpandedRows,
    onRowToggle: handleRowToggle,
    onRowExpand: handleRowExpand,
    onRowCollapse: handleRowCollapse,
    
    // Expansion column configuration
    expansionColumn: generateExpansionColumn(),
    
    // Expansion header
    expansionHeader: generateExpansionHeader(),
    
    // Row expansion template
    rowExpansionTemplate: enhancedRowExpansionTemplate,
    
    // Utility functions
    expandAll,
    collapseAll,
    canExpandRow,
    
    // Configuration
    dataKey,
    enableExpansionAnimation
  };
};

export default RowExpansionManager;
