import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';

// Dynamic imports for PrimeReact components
const DataTable = dynamic(() => import('primereact/datatable').then(m => m.DataTable), { ssr: false });
const Column = dynamic(() => import('primereact/column').then(m => m.Column), { ssr: false });
const InputText = dynamic(() => import('primereact/inputtext').then(m => m.InputText), { ssr: false });
const Button = dynamic(() => import('primereact/button').then(m => m.Button), { ssr: false });
const Toolbar = dynamic(() => import('primereact/toolbar').then(m => m.Toolbar), { ssr: false });
const Dropdown = dynamic(() => import('primereact/dropdown').then(m => m.Dropdown), { ssr: false });
const Calendar = dynamic(() => import('primereact/calendar').then(m => m.Calendar), { ssr: false });
const InputNumber = dynamic(() => import('primereact/inputnumber').then(m => m.InputNumber), { ssr: false });
const Paginator = dynamic(() => import('primereact/paginator').then(m => m.Paginator), { ssr: false });

import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Search, X, ChevronDown, ChevronRight } from "lucide-react";

/**
 * SimpleDataTable - A simplified, clean version of PrimeDataTable
 * 
 * Features:
 * - Basic table with sorting and filtering
 * - Row expansion with auto-detection
 * - Custom column-wise filters (toggle with native filters)
 * - Custom toolbar (toggle with native toolbar)
 * - Single expand/collapse all button
 * - Responsive sizing with em/rem units
 * 
 * Props:
 * @param {Array} data - Table data
 * @param {Array} columns - Column definitions
 * @param {boolean} enableSearch - Enable global search
 * @param {boolean} enableSorting - Enable column sorting
 * @param {boolean} enablePagination - Enable pagination
 * @param {boolean} enableRowExpansion - Enable row expansion
 * @param {boolean} useCustomFilters - Use custom filters instead of native
 * @param {boolean} useCustomToolbar - Use custom toolbar instead of native
 * @param {number} pageSize - Rows per page
 * @param {string} dataKey - Unique identifier for rows
 */

const SimpleDataTable = ({
  // Data props
  data = [],
  columns = [],
  loading = false,
  
  // Feature toggles
  enableSearch = true,
  enableSorting = true,
  enablePagination = true,
  enableRowExpansion = false,
  useCustomFilters = false,
  useCustomToolbar = false,
  
  // Configuration
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  dataKey = 'id',
  
  // Expansion
  rowExpansionTemplate = null,
  nestedDataKey = 'items',
  
  // Styling
  tableSize = "normal", // small, normal, large
  responsiveLayout = "scroll",
  className = "",
  style = {},
  
  // Callbacks
  onRowClick,
  onRefresh,
}) => {
  // State management
  const [tableData, setTableData] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [customFilters, setCustomFilters] = useState({});
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rows, setRows] = useState(pageSize);
  const [expandedRows, setExpandedRows] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);
  
  const isMountedRef = useRef(true);

  // Initialize data
  useEffect(() => {
    if (Array.isArray(data)) {
      setTableData(data);
    }
  }, [data]);

  // Auto-detect dataKey from data
  const resolvedDataKey = useMemo(() => {
    if (dataKey) return dataKey;
    
    if (tableData.length > 0) {
      const firstRow = tableData[0];
      const possibleKeys = ['id', 'Id', 'ID', '_id', 'code', 'key', 'uid'];
      
      for (const key of possibleKeys) {
        if (firstRow.hasOwnProperty(key)) return key;
      }
      
      return Object.keys(firstRow)[0] || 'id';
    }
    
    return 'id';
  }, [dataKey, tableData]);

  // Ensure all rows have the dataKey
  useEffect(() => {
    if (!Array.isArray(tableData)) return;
    
    tableData.forEach((row, i) => {
      if (row && row[resolvedDataKey] === undefined) {
        row[resolvedDataKey] = `_row_${i}`;
      }
    });
  }, [tableData, resolvedDataKey]);

  // Generate columns from data if not provided
  const generatedColumns = useMemo(() => {
    if (columns && columns.length > 0) {
      return columns.map(col => ({
        key: col.key || col.field || col.header,
        title: col.title || col.header || col.key,
        sortable: col.sortable !== false,
        filterable: col.filterable !== false,
        type: col.type || 'text',
        ...col
      }));
    }
    
    if (tableData.length === 0) return [];
    
    const firstRow = tableData[0];
    return Object.keys(firstRow).map(key => {
      const value = firstRow[key];
      let type = 'text';
      
      if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) type = 'date';
      else if (Array.isArray(value)) type = 'array';
      
      return {
        key,
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        sortable: true,
        filterable: type !== 'array',
        type
      };
    });
  }, [columns, tableData]);

  // Filter out array columns from display
  const displayColumns = useMemo(() => {
    return generatedColumns.filter(col => col.type !== 'array');
  }, [generatedColumns]);

  // Detect column types for custom filters
  const getColumnType = useCallback((column) => {
    if (column.type) return column.type;
    
    if (tableData.length === 0) return 'text';
    
    const sampleValues = tableData
      .slice(0, 10)
      .map(row => row[column.key])
      .filter(val => val !== null && val !== undefined);
    
    if (sampleValues.length === 0) return 'text';
    
    const uniqueValues = [...new Set(sampleValues)];
    
    if (uniqueValues.length <= 10 && uniqueValues.length > 1) {
      return 'dropdown';
    }
    
    const firstValue = sampleValues[0];
    if (typeof firstValue === 'number') return 'number';
    if (typeof firstValue === 'boolean') return 'boolean';
    if (typeof firstValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(firstValue)) return 'date';
    
    return 'text';
  }, [tableData]);

  // Get unique values for dropdown filters
  const getUniqueValues = useCallback((columnKey) => {
    const values = tableData
      .map(row => row[columnKey])
      .filter(val => val !== null && val !== undefined);
    return [...new Set(values)];
  }, [tableData]);

  // Apply custom filters
  const filteredData = useMemo(() => {
    if (!useCustomFilters) return tableData;
    
    let filtered = [...tableData];
    
    // Apply global filter
    if (globalFilterValue) {
      const searchLower = globalFilterValue.toLowerCase();
      filtered = filtered.filter(row => {
        return displayColumns.some(col => {
          const value = row[col.key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }
    
    // Apply column filters
    Object.keys(customFilters).forEach(key => {
      const filterValue = customFilters[key];
      if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
        filtered = filtered.filter(row => {
          const rowValue = row[key];
          if (rowValue === null || rowValue === undefined) return false;
          
          const column = displayColumns.find(col => col.key === key);
          const columnType = getColumnType(column);
          
          if (columnType === 'dropdown') {
            return String(rowValue) === String(filterValue);
          } else if (columnType === 'number') {
            return Number(rowValue) === Number(filterValue);
          } else if (columnType === 'date') {
            const rowDate = new Date(rowValue).toDateString();
            const filterDate = new Date(filterValue).toDateString();
            return rowDate === filterDate;
          } else {
            return String(rowValue).toLowerCase().includes(String(filterValue).toLowerCase());
          }
        });
      }
    });
    
    return filtered;
  }, [tableData, customFilters, globalFilterValue, displayColumns, useCustomFilters, getColumnType]);

  // Data to display (filtered or original)
  const displayData = useCustomFilters ? filteredData : tableData;

  // Handle global search
  const handleGlobalSearch = useCallback((e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    
    if (!useCustomFilters) {
      const newFilters = { ...filters };
      newFilters['global'].value = value;
      setFilters(newFilters);
    }
  }, [filters, useCustomFilters]);

  // Handle custom filter change
  const handleCustomFilterChange = useCallback((columnKey, value) => {
    setCustomFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setGlobalFilterValue('');
    setCustomFilters({});
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
  }, []);

  // Handle sort
  const handleSort = useCallback((e) => {
    setSortField(e.sortField);
    setSortOrder(e.sortOrder);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((e) => {
    setCurrentPage(e.page + 1);
    setRows(e.rows);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Toggle expand/collapse all
  const toggleExpandAll = useCallback(() => {
    if (allExpanded) {
      // Collapse all
      setExpandedRows({});
      setAllExpanded(false);
    } else {
      // Expand all
      const expanded = {};
      displayData.forEach(row => {
        expanded[row[resolvedDataKey]] = true;
      });
      setExpandedRows(expanded);
      setAllExpanded(true);
    }
  }, [allExpanded, displayData, resolvedDataKey]);

  // Auto-detect nested data for expansion
  const defaultRowExpansionTemplate = useCallback((data) => {
    const nestedData = data[nestedDataKey] || data.items || data.children;
    
    if (!nestedData || !Array.isArray(nestedData) || nestedData.length === 0) {
      return <div style={{ padding: '1rem', color: '#6b7280' }}>No nested data available</div>;
    }
    
    const nestedColumns = Object.keys(nestedData[0]).map(key => ({
      key,
      title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
    }));
    
    return (
      <div style={{ padding: '1rem' }}>
        <h5 style={{ marginBottom: '0.75rem', color: '#374151' }}>
          Details ({nestedData.length} items)
        </h5>
        <DataTable value={nestedData} size="small">
          {nestedColumns.map(col => (
            <Column 
              key={col.key} 
              field={col.key} 
              header={col.title}
              body={(rowData) => {
                const value = rowData[col.key];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return JSON.stringify(value);
                return String(value);
              }}
            />
          ))}
        </DataTable>
      </div>
    );
  }, [nestedDataKey]);

  // Safe cell renderer
  const safeCell = useCallback((value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      return `${value.length} item(s)`;
    }
    if (typeof value === 'object') {
      try {
        const s = JSON.stringify(value);
        return s.length > 50 ? s.slice(0, 47) + '...' : s;
      } catch {
        return '[object]';
      }
    }
    return String(value);
  }, []);

  // Render custom filter element
  const renderCustomFilterElement = useCallback((column) => {
    const columnType = getColumnType(column);
    const filterValue = customFilters[column.key] || '';
    
    const commonStyle = {
      width: '100%',
      padding: '0.5rem',
      fontSize: '0.875rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem'
    };
    
    if (columnType === 'dropdown') {
      const options = getUniqueValues(column.key).map(val => ({
        label: String(val),
        value: val
      }));
      
      return (
        <Dropdown
          value={filterValue}
          options={[{ label: 'All', value: '' }, ...options]}
          onChange={(e) => handleCustomFilterChange(column.key, e.value)}
          placeholder={`Filter ${column.title}`}
          style={commonStyle}
          showClear
        />
      );
    } else if (columnType === 'number') {
      return (
        <InputNumber
          value={filterValue}
          onValueChange={(e) => handleCustomFilterChange(column.key, e.value)}
          placeholder={`Filter ${column.title}`}
          style={commonStyle}
        />
      );
    } else if (columnType === 'date') {
      return (
        <Calendar
          value={filterValue ? new Date(filterValue) : null}
          onChange={(e) => handleCustomFilterChange(column.key, e.value)}
          placeholder={`Filter ${column.title}`}
          dateFormat="yy-mm-dd"
          showIcon
          style={commonStyle}
        />
      );
    } else {
      return (
        <InputText
          value={filterValue}
          onChange={(e) => handleCustomFilterChange(column.key, e.target.value)}
          placeholder={`Filter ${column.title}`}
          style={commonStyle}
        />
      );
    }
  }, [getColumnType, customFilters, getUniqueValues, handleCustomFilterChange]);

  // Custom Toolbar
  const customToolbar = useMemo(() => {
    if (!useCustomToolbar) return null;
    
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Left section - Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 auto' }}>
          {enableSearch && (
            <div style={{ position: 'relative', minWidth: '15rem' }}>
              <Search 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }} 
              />
              <InputText
                value={globalFilterValue}
                onChange={handleGlobalSearch}
                placeholder="Search all columns..."
                style={{
                  paddingLeft: '2.5rem',
                  width: '100%',
                  fontSize: '0.875rem',
                  padding: '0.5rem 0.5rem 0.5rem 2.5rem'
                }}
              />
            </div>
          )}
          
          {/* Clear filters button */}
          <Button
            icon="pi pi-filter-slash"
            label="Clear"
            className="p-button-outlined p-button-secondary"
            onClick={clearAllFilters}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            tooltip="Clear all filters"
          />
        </div>
        
        {/* Right section - Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Expand/Collapse All Button */}
          {enableRowExpansion && (
            <Button
              icon={allExpanded ? "pi pi-minus" : "pi pi-plus"}
              label={allExpanded ? "Collapse All" : "Expand All"}
              className="p-button-outlined p-button-info"
              onClick={toggleExpandAll}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            />
          )}
          
          {/* Refresh button */}
          {onRefresh && (
            <Button
              icon="pi pi-refresh"
              label="Refresh"
              className="p-button-outlined"
              onClick={handleRefresh}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            />
          )}
        </div>
      </div>
    );
  }, [
    useCustomToolbar,
    enableSearch,
    globalFilterValue,
    handleGlobalSearch,
    clearAllFilters,
    enableRowExpansion,
    allExpanded,
    toggleExpandAll,
    onRefresh,
    handleRefresh
  ]);

  // Native Toolbar
  const nativeToolbarLeft = useMemo(() => {
    return (
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {enableSearch && (
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={handleGlobalSearch}
              placeholder="Search..."
              style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
            />
          </span>
        )}
        
        <Button
          icon="pi pi-filter-slash"
          label="Clear"
          className="p-button-outlined p-button-secondary"
          onClick={clearAllFilters}
          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
        />
      </div>
    );
  }, [enableSearch, globalFilterValue, handleGlobalSearch, clearAllFilters]);

  const nativeToolbarRight = useMemo(() => {
    return (
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {enableRowExpansion && (
          <Button
            icon={allExpanded ? "pi pi-minus" : "pi pi-plus"}
            label={allExpanded ? "Collapse All" : "Expand All"}
            className="p-button-outlined p-button-info"
            onClick={toggleExpandAll}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          />
        )}
        
        {onRefresh && (
          <Button
            icon="pi pi-refresh"
            className="p-button-outlined"
            onClick={handleRefresh}
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
          />
        )}
      </div>
    );
  }, [enableRowExpansion, allExpanded, toggleExpandAll, onRefresh, handleRefresh]);

  // Custom Filters Row
  const customFiltersRow = useMemo(() => {
    if (!useCustomFilters) return null;
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        marginBottom: '1rem'
      }}>
        {displayColumns.filter(col => col.filterable).map(column => (
          <div key={column.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ 
              fontSize: '0.75rem', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              {column.title}
            </label>
            {renderCustomFilterElement(column)}
          </div>
        ))}
      </div>
    );
  }, [useCustomFilters, displayColumns, renderCustomFilterElement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={className} style={style}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
          <p style={{ marginTop: '1rem' }}>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <style jsx>{`
        /* Responsive sizing with em/rem units */
        .simple-datatable-wrapper {
          font-size: 1rem;
        }
        
        .simple-datatable-wrapper .p-datatable {
          font-size: 0.875rem;
        }
        
        .simple-datatable-wrapper .p-datatable-thead > tr > th {
          padding: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .simple-datatable-wrapper .p-datatable-tbody > tr > td {
          padding: 0.75rem;
          font-size: 0.875rem;
        }
        
        .simple-datatable-wrapper.size-small .p-datatable-thead > tr > th {
          padding: 0.5rem;
          font-size: 0.8125rem;
        }
        
        .simple-datatable-wrapper.size-small .p-datatable-tbody > tr > td {
          padding: 0.5rem;
          font-size: 0.8125rem;
        }
        
        .simple-datatable-wrapper.size-large .p-datatable-thead > tr > th {
          padding: 1rem;
          font-size: 1rem;
        }
        
        .simple-datatable-wrapper.size-large .p-datatable-tbody > tr > td {
          padding: 1rem;
          font-size: 1rem;
        }
        
        /* Responsive breakpoints */
        @media (max-width: 48rem) {
          .simple-datatable-wrapper {
            font-size: 0.875rem;
          }
          
          .simple-datatable-wrapper .p-datatable-thead > tr > th {
            padding: 0.5rem;
            font-size: 0.8125rem;
          }
          
          .simple-datatable-wrapper .p-datatable-tbody > tr > td {
            padding: 0.5rem;
            font-size: 0.8125rem;
          }
        }
        
        @media (max-width: 30rem) {
          .simple-datatable-wrapper {
            font-size: 0.8125rem;
          }
          
          .simple-datatable-wrapper .p-datatable-thead > tr > th {
            padding: 0.375rem;
            font-size: 0.75rem;
          }
          
          .simple-datatable-wrapper .p-datatable-tbody > tr > td {
            padding: 0.375rem;
            font-size: 0.75rem;
          }
        }
        
        /* Expansion row styling */
        .simple-datatable-wrapper .p-datatable-tbody > tr.p-datatable-row-expansion > td {
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        /* Hover effect */
        .simple-datatable-wrapper .p-datatable-tbody > tr:hover {
          background-color: #f3f4f6;
        }
      `}</style>
      
      <div className={`simple-datatable-wrapper size-${tableSize}`}>
        {/* Render toolbar based on toggle */}
        {useCustomToolbar ? (
          customToolbar
        ) : (
          <Toolbar
            left={nativeToolbarLeft}
            right={nativeToolbarRight}
            style={{ marginBottom: '1rem', borderRadius: '0.5rem' }}
          />
        )}
        
        {/* Render custom filters if enabled */}
        {customFiltersRow}
        
        {/* DataTable */}
        <DataTable
          value={displayData}
          loading={loading}
          dataKey={resolvedDataKey}
          filters={useCustomFilters ? undefined : filters}
          filterDisplay={useCustomFilters ? undefined : "row"}
          globalFilterFields={displayColumns.map(col => col.key)}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onRowClick={onRowClick ? (e) => onRowClick(e.data, e.index) : undefined}
          expandedRows={enableRowExpansion ? expandedRows : undefined}
          onRowToggle={enableRowExpansion ? (e) => {
            setExpandedRows(e.data);
            setAllExpanded(false);
          } : undefined}
          rowExpansionTemplate={enableRowExpansion ? (rowExpansionTemplate || defaultRowExpansionTemplate) : undefined}
          paginator={enablePagination}
          rows={rows}
          rowsPerPageOptions={pageSizeOptions}
          onPage={handlePageChange}
          first={(currentPage - 1) * rows}
          totalRecords={displayData.length}
          size={tableSize}
          responsiveLayout={responsiveLayout}
          stripedRows
          showGridlines
          emptyMessage="No data available"
          style={{ borderRadius: '0.5rem' }}
        >
          {/* Expander column */}
          {enableRowExpansion && (
            <Column 
              expander 
              style={{ width: '3rem' }}
              headerStyle={{ textAlign: 'center' }}
              bodyStyle={{ textAlign: 'center' }}
            />
          )}
          
          {/* Data columns */}
          {displayColumns.map(column => (
            <Column
              key={column.key}
              field={column.key}
              header={column.title}
              sortable={column.sortable && enableSorting}
              filter={column.filterable && !useCustomFilters}
              filterPlaceholder={`Filter by ${column.title}`}
              body={(rowData) => safeCell(rowData[column.key])}
              style={column.style}
              headerStyle={column.headerStyle}
            />
          ))}
        </DataTable>
      </div>
    </div>
  );
};

export default SimpleDataTable;

