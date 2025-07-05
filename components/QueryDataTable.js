import React, { useState, useMemo } from 'react';
import styles from '../styles/QueryDataTable.module.css';

/**
 * QueryDataTable Component for Plasmic Studio
 * 
 * This component displays query data in a table format with features like:
 * - Sorting
 * - Pagination
 * - Search/filtering
 * - Customizable columns
 * - Loading and error states
 */
export default function QueryDataTable({
  // Data props
  data = [],
  dataPath = '', // JSON path to extract data from response (e.g., "users.items")
  
  // Table configuration
  columns = [],
  itemsPerPage = 10,
  showPagination = true,
  showSearch = true,
  showSorting = true,
  
  // Styling
  className = '',
  tableClassName = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  
  // State props
  loading = false,
  error = null,
  
  // Event handlers
  onRowClick,
  onSort,
  onSearch,
  
  // Custom components
  loadingComponent,
  errorComponent,
  emptyComponent,
  
  // Additional props
  sortable = true,
  searchable = true,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  
  // Table features
  striped = true,
  hoverable = true,
  bordered = false,
  compact = false,
  
  // Responsive
  responsive = true,
  scrollable = false,
  
  // Custom styling
  style = {},
  tableStyle = {},
  headerStyle = {},
  rowStyle = {},
  cellStyle = {},
}) {
  // Always use an array for columns
  const safeColumns = Array.isArray(columns) ? columns : [];

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedItems, setSelectedItems] = useState(selectedRows || []);

  // Extract data from the response using dataPath
  const extractedData = useMemo(() => {
    if (!data) return [];
    
    if (!dataPath) return Array.isArray(data) ? data : [data];
    
    const pathParts = dataPath.split('.');
    let result = data;
    
    for (const part of pathParts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return [];
      }
    }
    
    return Array.isArray(result) ? result : [result];
  }, [data, dataPath]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchable) return extractedData;
    
    return extractedData.filter(item => {
      return safeColumns.some(column => {
        const value = getNestedValue(item, column.key);
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [extractedData, searchTerm, searchable, safeColumns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    });
  }, [filteredData, sortConfig, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage, showPagination]);

  // Helper function to get nested object values
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;
    
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    
    if (onSort) {
      onSort(newSortConfig);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
    
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle row selection
  const handleRowSelection = (item, checked) => {
    let newSelection;
    if (checked) {
      newSelection = [...selectedItems, item];
    } else {
      newSelection = selectedItems.filter(selected => selected !== item);
    }
    
    setSelectedItems(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    const newSelection = checked ? [...paginatedData] : [];
    setSelectedItems(newSelection);
    
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  // Loading state
  if (loading) {
    if (loadingComponent) {
      return loadingComponent;
    }
    return (
      <div className={`${styles.queryDataTableLoading} ${className}`} style={style}>
        <div className={styles.loadingSpinner}>Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    if (errorComponent) {
      return React.cloneElement(errorComponent, { error });
    }
    return (
      <div className={`${styles.queryDataTableError} ${className}`} style={style}>
        <div className={styles.errorMessage}>Error: {error}</div>
      </div>
    );
  }

  // Empty state
  if (extractedData.length === 0) {
    if (emptyComponent) {
      return emptyComponent;
    }
    return (
      <div className={`${styles.queryDataTableEmpty} ${className}`} style={style}>
        <div className={styles.emptyMessage}>No data available</div>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const isAllSelected = paginatedData.length > 0 && paginatedData.every(item => selectedItems.includes(item));

  return (
    <div className={`${styles.queryDataTable} ${className}`} style={style}>
      {/* Search Bar */}
      {showSearch && searchable && (
        <div className={styles.queryDataTableSearch}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      )}

      {/* Table */}
      <div className={`${styles.queryDataTableContainer} ${responsive ? styles.responsive : ''} ${scrollable ? styles.scrollable : ''}`}>
        <table 
          className={`${styles.queryDataTableTable} ${tableClassName} ${bordered ? styles.bordered : ''} ${striped ? styles.striped : ''} ${hoverable ? styles.hoverable : ''} ${compact ? styles.compact : ''}`}
          style={tableStyle}
        >
          <thead className={`${styles.queryDataTableHeader} ${headerClassName}`} style={headerStyle}>
            <tr>
              {/* Select all checkbox */}
              {selectable && (
                <th className={styles.selectAllCell}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              
              {/* Column headers */}
              {safeColumns.map((column) => (
                <th
                  key={column.key}
                  className={`${styles.queryDataTableHeaderCell} ${column.sortable !== false && sortable ? styles.sortable : ''} ${column.className || ''}`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  style={{ ...column.headerStyle, ...cellStyle }}
                >
                  <div className={styles.headerContent}>
                    <span>{column.label || column.key}</span>
                    {column.sortable !== false && sortable && sortConfig.key === column.key && (
                      <span className={styles.sortIndicator}>
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className={styles.queryDataTableBody}>
            {paginatedData.map((item, index) => (
              <tr
                key={item.id || item._id || index}
                className={`${styles.queryDataTableRow} ${rowClassName} ${striped && index % 2 === 1 ? styles.striped : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
                style={rowStyle}
              >
                {/* Row selection checkbox */}
                {selectable && (
                  <td className={styles.selectCell}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item)}
                      onChange={(e) => handleRowSelection(item, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                
                {/* Data cells */}
                {safeColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`${styles.queryDataTableCell} ${cellClassName} ${column.className || ''}`}
                    style={{ ...column.cellStyle, ...cellStyle }}
                  >
                    {column.render ? (
                      column.render(getNestedValue(item, column.key), item, index)
                    ) : (
                      getNestedValue(item, column.key)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className={styles.queryDataTablePagination}>
          <div className={styles.paginationInfo}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          
          <div className={styles.paginationControls}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`${styles.paginationButton} ${currentPage === pageNum ? styles.active : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 