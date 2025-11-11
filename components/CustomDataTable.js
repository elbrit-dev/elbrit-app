import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Download, ChevronsDown, ChevronsUp, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

/**
 * CustomDataTable - Fully customizable responsive data table
 * 
 * Features:
 * - Expand/collapse rows with nested data
 * - Responsive design using rem/em
 * - Toolbar with expand all, export, and search
 * - In-row filters (dedicated search row)
 * - Column sorting
 * - Mobile-friendly
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {Array} props.columns - Array of column definitions
 * @param {String} props.rowKey - Unique key for each row (default: 'id')
 * @param {String} props.nestedKey - Key for nested/expandable data (default: 'items')
 * @param {Boolean} props.enableExpansion - Enable row expansion (default: true)
 * @param {Boolean} props.enableSearch - Enable global search (default: true)
 * @param {Boolean} props.enableExport - Enable export functionality (default: true)
 * @param {Boolean} props.enableFilters - Enable column filters (default: true)
 * @param {Boolean} props.enableSorting - Enable column sorting (default: true)
 * @param {Function} props.onRowClick - Callback when row is clicked
 * @param {Function} props.onExport - Custom export handler
 * @param {String} props.tableHeight - Max height for scrollable table (default: '70vh')
 * @param {Object} props.customStyles - Custom style overrides
 */
const CustomDataTable = ({
  data = [],
  columns = [],
  rowKey = 'id',
  nestedKey = 'items',
  enableExpansion = true,
  enableSearch = true,
  enableExport = true,
  enableFilters = true,
  enableSorting = true,
  onRowClick,
  onExport,
  tableHeight = '70vh',
  customStyles = {}
}) => {
  // State management
  const [expandedRows, setExpandedRows] = useState({});
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const tableRef = useRef(null);

  // Toggle single row expansion
  const toggleRow = useCallback((rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  }, []);

  // Expand all rows
  const expandAll = useCallback(() => {
    const allExpanded = {};
    data.forEach(row => {
      const id = row[rowKey];
      if (row[nestedKey] && Array.isArray(row[nestedKey]) && row[nestedKey].length > 0) {
        allExpanded[id] = true;
      }
    });
    setExpandedRows(allExpanded);
  }, [data, rowKey, nestedKey]);

  // Collapse all rows
  const collapseAll = useCallback(() => {
    setExpandedRows({});
  }, []);

  // Handle sorting
  const handleSort = useCallback((columnKey) => {
    if (!enableSorting) return;
    
    setSortConfig(prev => {
      if (prev.key === columnKey) {
        // Cycle through: asc -> desc -> none
        if (prev.direction === 'asc') return { key: columnKey, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: 'asc' };
      }
      return { key: columnKey, direction: 'asc' };
    });
  }, [enableSorting]);

  // Handle column filter change
  const handleFilterChange = useCallback((columnKey, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setColumnFilters({});
    setGlobalSearch('');
  }, []);

  // Filter data based on search and column filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply global search
    if (globalSearch && globalSearch.trim() !== '') {
      const searchLower = globalSearch.toLowerCase().trim();
      filtered = filtered.filter(row => {
        return columns.some(col => {
          const value = row[col.key];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply column filters
    Object.keys(columnFilters).forEach(columnKey => {
      const filterValue = columnFilters[columnKey];
      if (filterValue && filterValue.trim() !== '') {
        const filterLower = filterValue.toLowerCase().trim();
        filtered = filtered.filter(row => {
          const value = row[columnKey];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(filterLower);
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        // Handle null/undefined
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        // Number comparison
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        // String comparison
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [data, globalSearch, columnFilters, sortConfig, columns]);

  // Export functionality
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport(filteredData);
      return;
    }

    // Default CSV export
    const csvHeaders = columns.map(col => col.title || col.key).join(',');
    const csvRows = filteredData.map(row => 
      columns.map(col => {
        const value = row[col.key];
        // Escape commas and quotes
        const stringValue = String(value || '');
        return stringValue.includes(',') || stringValue.includes('"') 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      }).join(',')
    );
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredData, columns, onExport]);

  // Format cell value
  const formatCellValue = useCallback((value, column) => {
    if (value === null || value === undefined) return '';
    
    // Custom formatter
    if (column.formatter && typeof column.formatter === 'function') {
      return column.formatter(value);
    }
    
    // Number formatting
    if (typeof value === 'number') {
      if (column.type === 'currency') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: column.currency || 'USD'
        }).format(value);
      }
      if (column.decimals !== undefined) {
        return value.toFixed(column.decimals);
      }
      return value.toLocaleString();
    }
    
    // Date formatting
    if (column.type === 'date' && value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    return String(value);
  }, []);

  return (
    <div 
      className="custom-datatable-container" 
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        ...customStyles.container
      }}
    >
      {/* Toolbar */}
      <div 
        className="datatable-toolbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          ...customStyles.toolbar
        }}
      >
        {/* Left section - Search */}
        {enableSearch && (
          <div 
            className="toolbar-search"
            style={{
              flex: '1 1 18rem',
              minWidth: '15rem',
              position: 'relative'
            }}
          >
            <Search 
              size={18} 
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search in all columns..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                fontSize: '0.875rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}

        {/* Right section - Actions */}
        <div 
          className="toolbar-actions"
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginLeft: 'auto',
            flexWrap: 'wrap'
          }}
        >
          {/* Expand/Collapse All */}
          {enableExpansion && (
            <>
              <button
                onClick={expandAll}
                className="toolbar-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#475569',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                  e.target.style.borderColor = '#94a3b8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.borderColor = '#cbd5e1';
                }}
              >
                <ChevronsDown size={16} />
                <span>Expand All</span>
              </button>
              <button
                onClick={collapseAll}
                className="toolbar-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#475569',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                  e.target.style.borderColor = '#94a3b8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.borderColor = '#cbd5e1';
                }}
              >
                <ChevronsUp size={16} />
                <span>Collapse All</span>
              </button>
            </>
          )}

          {/* Clear Filters */}
          {enableFilters && (Object.keys(columnFilters).length > 0 || globalSearch) && (
            <button
              onClick={clearAllFilters}
              className="toolbar-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#dc2626',
                backgroundColor: '#ffffff',
                border: '1px solid #fecaca',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#fef2f2';
                e.target.style.borderColor = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.borderColor = '#fecaca';
              }}
            >
              <span>✕</span>
              <span>Clear Filters</span>
            </button>
          )}

          {/* Export */}
          {enableExport && (
            <button
              onClick={handleExport}
              className="toolbar-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#ffffff',
                backgroundColor: '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.borderColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.borderColor = '#3b82f6';
              }}
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div 
        className="datatable-scroll-container"
        style={{
          width: '100%',
          maxHeight: tableHeight,
          overflow: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          backgroundColor: '#ffffff',
          ...customStyles.scrollContainer
        }}
        ref={tableRef}
      >
        <table 
          className="custom-datatable"
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: '0.875rem',
            ...customStyles.table
          }}
        >
          {/* Table Head */}
          <thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              backgroundColor: '#f8fafc',
              ...customStyles.thead
            }}
          >
            {/* Header Row */}
            <tr>
              {enableExpansion && (
                <th
                  style={{
                    width: '3rem',
                    padding: '0.75rem',
                    textAlign: 'center',
                    borderBottom: '2px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    position: 'sticky',
                    top: 0
                  }}
                />
              )}
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: column.align || 'left',
                    fontWeight: '600',
                    color: '#1e293b',
                    borderBottom: '2px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    cursor: column.sortable !== false && enableSorting ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    position: 'sticky',
                    top: 0,
                    transition: 'background-color 0.2s',
                    ...customStyles.th
                  }}
                  onMouseEnter={(e) => {
                    if (column.sortable !== false && enableSorting) {
                      e.target.style.backgroundColor = '#f1f5f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start' }}>
                    <span>{column.title || column.key}</span>
                    {enableSorting && column.sortable !== false && (
                      <span style={{ display: 'flex', alignItems: 'center', opacity: sortConfig.key === column.key ? 1 : 0.3 }}>
                        {sortConfig.key === column.key ? (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>

            {/* Filter Row */}
            {enableFilters && (
              <tr style={{ backgroundColor: '#ffffff' }}>
                {enableExpansion && (
                  <th
                    style={{
                      padding: '0.5rem',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      position: 'sticky',
                      top: '3rem'
                    }}
                  />
                )}
                {columns.map((column, index) => (
                  <th
                    key={`filter-${column.key || index}`}
                    style={{
                      padding: '0.5rem',
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      position: 'sticky',
                      top: '3rem'
                    }}
                  >
                    {column.filterable !== false && (
                      <input
                        type="text"
                        placeholder={`Filter ${column.title || column.key}...`}
                        value={columnFilters[column.key] || ''}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.5rem',
                          fontSize: '0.8125rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '0.25rem',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3b82f6';
                          e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cbd5e1';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    )}
                  </th>
                ))}
              </tr>
            )}
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (enableExpansion ? 1 : 0)}
                  style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.875rem'
                  }}
                >
                  No data found matching the filter criteria
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => {
                const rowId = row[rowKey] || rowIndex;
                const isExpanded = expandedRows[rowId];
                const hasNested = row[nestedKey] && Array.isArray(row[nestedKey]) && row[nestedKey].length > 0;

                return (
                  <React.Fragment key={rowId}>
                    {/* Main Row */}
                    <tr
                      onClick={() => onRowClick && onRowClick(row)}
                      style={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        transition: 'background-color 0.15s',
                        backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                        ...customStyles.tr
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb';
                      }}
                    >
                      {/* Expand/Collapse Cell */}
                      {enableExpansion && (
                        <td
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasNested) toggleRow(rowId);
                          }}
                          style={{
                            width: '3rem',
                            padding: '0.75rem',
                            textAlign: 'center',
                            borderBottom: '1px solid #e2e8f0',
                            cursor: hasNested ? 'pointer' : 'default',
                            color: hasNested ? '#3b82f6' : '#cbd5e1'
                          }}
                        >
                          {hasNested && (
                            isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
                          )}
                        </td>
                      )}

                      {/* Data Cells */}
                      {columns.map((column, colIndex) => (
                        <td
                          key={`${rowId}-${column.key || colIndex}`}
                          style={{
                            padding: '0.75rem 1rem',
                            textAlign: column.align || 'left',
                            borderBottom: '1px solid #e2e8f0',
                            color: '#334155',
                            whiteSpace: column.wrap ? 'normal' : 'nowrap',
                            overflow: column.wrap ? 'visible' : 'hidden',
                            textOverflow: column.wrap ? 'clip' : 'ellipsis',
                            ...customStyles.td
                          }}
                        >
                          {column.render 
                            ? column.render(row[column.key], row, rowIndex)
                            : formatCellValue(row[column.key], column)
                          }
                        </td>
                      ))}
                    </tr>

                    {/* Expanded Nested Rows */}
                    {enableExpansion && hasNested && isExpanded && (
                      <tr>
                        <td
                          colSpan={columns.length + 1}
                          style={{
                            padding: 0,
                            borderBottom: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc'
                          }}
                        >
                          <div style={{ padding: '1rem 1rem 1rem 3.5rem' }}>
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.8125rem',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.375rem',
                                overflow: 'hidden'
                              }}
                            >
                              <thead style={{ backgroundColor: '#f1f5f9' }}>
                                <tr>
                                  {columns.map((column, colIndex) => (
                                    <th
                                      key={`nested-header-${colIndex}`}
                                      style={{
                                        padding: '0.5rem 0.75rem',
                                        textAlign: column.align || 'left',
                                        fontWeight: '600',
                                        color: '#475569',
                                        borderBottom: '1px solid #e2e8f0',
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      {column.title || column.key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {row[nestedKey].map((nestedRow, nestedIndex) => (
                                  <tr
                                    key={`${rowId}-nested-${nestedIndex}`}
                                    style={{
                                      backgroundColor: nestedIndex % 2 === 0 ? '#ffffff' : '#f9fafb'
                                    }}
                                  >
                                    {columns.map((column, colIndex) => (
                                      <td
                                        key={`${rowId}-nested-${nestedIndex}-${colIndex}`}
                                        style={{
                                          padding: '0.5rem 0.75rem',
                                          textAlign: column.align || 'left',
                                          borderBottom: nestedIndex === row[nestedKey].length - 1 ? 'none' : '1px solid #f1f5f9',
                                          color: '#64748b'
                                        }}
                                      >
                                        {column.render 
                                          ? column.render(nestedRow[column.key], nestedRow, nestedIndex)
                                          : formatCellValue(nestedRow[column.key], column)
                                        }
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Results Info */}
      <div 
        style={{
          padding: '0.75rem 1rem',
          fontSize: '0.8125rem',
          color: '#64748b',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '0.375rem',
          border: '1px solid #e2e8f0'
        }}
      >
        Showing <strong>{filteredData.length}</strong> of <strong>{data.length}</strong> records
        {(globalSearch || Object.keys(columnFilters).length > 0) && ' (filtered)'}
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .custom-datatable-container {
            font-size: 0.75rem;
          }
          
          .datatable-toolbar {
            flex-direction: column;
            align-items: stretch !important;
          }
          
          .toolbar-search {
            min-width: 100% !important;
          }
          
          .toolbar-actions {
            margin-left: 0 !important;
            width: 100%;
            justify-content: space-between;
          }
          
          .toolbar-btn {
            flex: 1;
            justify-content: center;
            padding: 0.5rem 0.75rem !important;
            font-size: 0.75rem !important;
          }
          
          .toolbar-btn span:last-child {
            display: none;
          }
          
          .custom-datatable th,
          .custom-datatable td {
            padding: 0.5rem !important;
            font-size: 0.75rem !important;
          }
          
          .datatable-scroll-container {
            max-height: 60vh !important;
          }
        }
        
        @media (max-width: 480px) {
          .custom-datatable th,
          .custom-datatable td {
            padding: 0.375rem !important;
            font-size: 0.6875rem !important;
          }
          
          .toolbar-btn {
            padding: 0.375rem 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomDataTable;

