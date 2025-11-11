import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TextField,
  IconButton,
  Toolbar,
  Typography,
  Box,
  Collapse,
  InputAdornment,
  Checkbox,
  Button,
  styled,
  alpha,
  Tooltip,
  TablePagination,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// Styled components for better design
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '0.5rem',
  boxShadow: '0 0.125rem 0.5rem rgba(0, 0, 0, 0.1)',
  '& .MuiTable-root': {
    minWidth: '100%',
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
  '& .MuiTableCell-head': {
    fontWeight: 700,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#475569',
    padding: '1rem',
    borderBottom: `0.125rem solid ${theme.palette.divider}`,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.mode === 'dark' ? alpha('#1e293b', 0.5) : alpha('#f8fafc', 0.5),
  },
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? alpha('#3b82f6', 0.1) : alpha('#3b82f6', 0.05),
    transition: 'background-color 0.2s ease',
  },
  '& .MuiTableCell-root': {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
  },
}));

const FilterRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
  '& .MuiTableCell-root': {
    padding: '0.5rem',
    borderBottom: `0.0625rem solid ${theme.palette.divider}`,
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  padding: '1rem 1.5rem !important',
  gap: '1rem',
  flexWrap: 'wrap',
  minHeight: '4rem !important',
  backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
  borderBottom: `0.0625rem solid ${theme.palette.divider}`,
  borderTopLeftRadius: '0.5rem',
  borderTopRightRadius: '0.5rem',
}));

const ExpandableCell = styled(TableCell)(({ theme }) => ({
  padding: '0 !important',
  backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc',
}));

const NestedTable = styled(Table)(({ theme }) => ({
  margin: '1rem',
  border: `0.0625rem solid ${theme.palette.divider}`,
  borderRadius: '0.375rem',
  '& .MuiTableCell-root': {
    padding: '0.5rem',
    fontSize: '0.8125rem',
  },
}));

// Helper function to safely render cell values
const safeCell = (val) => {
  if (val == null) return '';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    const first = val[0];
    const looksLikeObjects = first && typeof first === 'object' && !Array.isArray(first);
    return looksLikeObjects ? `${val.length} item(s)` : val.join(', ');
  }
  try {
    const s = JSON.stringify(val);
    return s.length > 120 ? s.slice(0, 117) + '...' : s;
  } catch {
    return '[object]';
  }
};

// Helper function to detect nested data key
const detectNestedKey = (data) => {
  if (!Array.isArray(data) || data.length === 0) return 'items';
  const sample = data[0];
  if (!sample) return 'items';
  const commonKeys = ['items', 'invoices', 'orders', 'products', 'children', 'subItems', 'nestedData', 'details'];
  for (const key of commonKeys) {
    if (sample[key] && Array.isArray(sample[key]) && sample[key].length > 0) {
      return key;
    }
  }
  for (const [key, value] of Object.entries(sample)) {
    if (Array.isArray(value) && value.length > 0) {
      return key;
    }
  }
  return 'items';
};

// Helper function to export to CSV
const exportToCSV = (data, columns, filename = 'data.csv') => {
  if (!data || data.length === 0) return;
  
  const headers = columns.map(col => col.title || col.key).join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key];
      if (value == null) return '';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      return value;
    }).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// Row component with expand/collapse functionality
const TableRowComponent = ({ 
  row, 
  columns, 
  expandable, 
  nestedKey, 
  isExpanded, 
  onToggle,
  dataKey,
  showFilters,
  onRowClick,
  selectable,
  isSelected,
  onSelect,
  expandIconPosition = 'left' // 'left' or 'inline'
}) => {
  const hasNestedData = expandable && row[nestedKey] && Array.isArray(row[nestedKey]) && row[nestedKey].length > 0;
  const rowId = row[dataKey] || JSON.stringify(row);

  return (
    <>
      <StyledTableRow onClick={() => onRowClick?.(row)}>
        {selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect?.(row);
              }}
              size="small"
            />
          </TableCell>
        )}
        {expandable && expandIconPosition === 'left' && (
          <TableCell sx={{ width: '3rem', padding: '0.5rem' }}>
            {hasNestedData && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(rowId);
                }}
                sx={{ 
                  transition: 'transform 0.2s ease',
                  transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}
              >
                <KeyboardArrowDownIcon fontSize="small" />
              </IconButton>
            )}
          </TableCell>
        )}
        {columns.map((column, index) => {
          const isFirstColumn = index === 0;
          const showInlineIcon = expandable && expandIconPosition === 'inline' && isFirstColumn && hasNestedData;
          
          return (
            <TableCell 
              key={column.key}
              align={column.align || (typeof row[column.key] === 'number' ? 'right' : 'left')}
              sx={{
                fontFamily: typeof row[column.key] === 'number' ? 'monospace' : 'inherit',
                fontWeight: typeof row[column.key] === 'number' ? 600 : 400,
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: showInlineIcon ? 'space-between' : (column.align === 'right' ? 'flex-end' : 'flex-start'),
                gap: '0.5rem'
              }}>
                <span>
                  {column.render ? column.render(row[column.key], row) : safeCell(row[column.key])}
                </span>
                {showInlineIcon && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(rowId);
                    }}
                    sx={{ 
                      padding: '0.25rem',
                      transition: 'all 0.2s ease',
                      transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
                      color: '#1976d2',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      }
                    }}
                  >
                    {isExpanded ? (
                      <ClearIcon fontSize="small" />
                    ) : (
                      <KeyboardArrowDownIcon fontSize="small" sx={{ transform: 'rotate(-90deg)' }} />
                    )}
                  </IconButton>
                )}
              </Box>
            </TableCell>
          );
        })}
      </StyledTableRow>
      {expandable && hasNestedData && (
        <TableRow>
          <ExpandableCell colSpan={columns.length + (selectable ? 1 : 0) + (expandIconPosition === 'left' ? 1 : 0)}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ margin: '1rem' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700, mb: '0.75rem' }}>
                  Details ({row[nestedKey].length} {nestedKey})
                </Typography>
                <NestedTable size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(row[nestedKey][0] || {}).map((key) => (
                        <TableCell key={key} sx={{ fontWeight: 600 }}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row[nestedKey].map((nestedRow, idx) => (
                      <TableRow key={idx}>
                        {Object.keys(nestedRow).map((key) => (
                          <TableCell key={key}>
                            {safeCell(nestedRow[key])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </NestedTable>
              </Box>
            </Collapse>
          </ExpandableCell>
        </TableRow>
      )}
    </>
  );
};

/**
 * MaterialDataTable - Fully customizable Material-UI data table component
 * 
 * Features:
 * - Expand/collapse rows for nested data
 * - Row filtering (dedicated filter row)
 * - Column sorting
 * - Global search
 * - Export to CSV
 * - Expand/collapse all
 * - Responsive design with rem/em units
 * - Pagination
 * - Row selection
 * - Customizable columns
 * - Nested data support
 * 
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Array of column definitions { key, title, sortable, filterable, render, align }
 * @param {boolean} expandable - Enable row expansion for nested data
 * @param {string} nestedKey - Key name for nested data (auto-detected if not provided)
 * @param {boolean} showFilters - Show filter row
 * @param {boolean} pagination - Enable pagination
 * @param {number} rowsPerPage - Initial rows per page
 * @param {Array} rowsPerPageOptions - Options for rows per page
 * @param {string} dataKey - Key to use as unique row identifier
 * @param {Function} onRowClick - Callback when row is clicked
 * @param {boolean} selectable - Enable row selection
 * @param {Function} onSelectionChange - Callback when selection changes
 * @param {string} title - Table title
 * @param {boolean} dense - Dense table padding
 * @param {string} exportFilename - Filename for CSV export
 * @param {string} expandIconPosition - Position of expand icon: 'left' (separate column) or 'inline' (inline with first column)
 */
const MaterialDataTable = ({
  data = [],
  columns = [],
  expandable = false,
  nestedKey: propNestedKey = null,
  showFilters = true,
  pagination = true,
  rowsPerPage: initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  dataKey = 'id',
  onRowClick,
  selectable = false,
  onSelectionChange,
  title = '',
  dense = false,
  exportFilename = 'data.csv',
  expandIconPosition = 'left', // 'left' or 'inline'
  // Styling props
  className = '',
  style = {},
}) => {
  // State management
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [selectedRows, setSelectedRows] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Auto-detect nested key
  const nestedKey = propNestedKey || detectNestedKey(data);

  // Auto-generate columns if not provided
  const finalColumns = useMemo(() => {
    if (columns.length > 0) return columns;
    if (data.length === 0) return [];
    
    const sampleRow = data[0];
    return Object.keys(sampleRow)
      .filter(key => !Array.isArray(sampleRow[key])) // Exclude nested arrays
      .map(key => ({
        key,
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        sortable: true,
        filterable: true,
      }));
  }, [columns, data]);

  // Handle sorting
  const handleSort = useCallback((columnKey) => {
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((columnKey, value) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value,
    }));
    setPage(0); // Reset to first page when filtering
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({});
    setGlobalFilter('');
    setPage(0);
  }, []);

  // Handle global search
  const handleGlobalSearch = useCallback((value) => {
    setGlobalFilter(value);
    setPage(0);
  }, []);

  // Expand/collapse all rows
  const handleExpandAll = useCallback(() => {
    const allExpanded = {};
    data.forEach(row => {
      const rowId = row[dataKey] || JSON.stringify(row);
      if (row[nestedKey] && Array.isArray(row[nestedKey]) && row[nestedKey].length > 0) {
        allExpanded[rowId] = true;
      }
    });
    setExpandedRows(allExpanded);
  }, [data, dataKey, nestedKey]);

  const handleCollapseAll = useCallback(() => {
    setExpandedRows({});
  }, []);

  // Toggle single row expansion
  const handleToggleRow = useCallback((rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  }, []);

  // Handle row selection
  const handleSelectRow = useCallback((row) => {
    const rowId = row[dataKey] || JSON.stringify(row);
    setSelectedRows(prev => {
      const newSelection = prev.includes(rowId)
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId];
      
      onSelectionChange?.(newSelection.map(id => 
        data.find(r => (r[dataKey] || JSON.stringify(r)) === id)
      ));
      
      return newSelection;
    });
  }, [data, dataKey, onSelectionChange]);

  const handleSelectAll = useCallback((event) => {
    if (event.target.checked) {
      const allIds = data.map(row => row[dataKey] || JSON.stringify(row));
      setSelectedRows(allIds);
      onSelectionChange?.(data);
    } else {
      setSelectedRows([]);
      onSelectionChange?.([]);
    }
  }, [data, dataKey, onSelectionChange]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply global filter
    if (globalFilter) {
      filtered = filtered.filter(row =>
        finalColumns.some(col => {
          const value = row[col.key];
          return value != null && String(value).toLowerCase().includes(globalFilter.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => {
          const cellValue = row[key];
          return cellValue != null && String(cellValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, globalFilter, filters, sortConfig, finalColumns]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    const startIndex = page * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, page, rowsPerPage, pagination]);

  // Handle page change
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Export functionality
  const handleExport = useCallback(() => {
    exportToCSV(processedData, finalColumns, exportFilename);
    setMenuAnchor(null);
  }, [processedData, finalColumns, exportFilename]);

  return (
    <Box className={className} style={style}>
      <Paper elevation={3} sx={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
        {/* Toolbar */}
        <StyledToolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            {title && (
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
                {title}
              </Typography>
            )}
            {selectedRows.length > 0 && (
              <Chip 
                label={`${selectedRows.length} selected`} 
                size="small" 
                color="primary"
                onDelete={() => {
                  setSelectedRows([]);
                  onSelectionChange?.([]);
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Global Search */}
            <TextField
              size="small"
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: globalFilter && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleGlobalSearch('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: '15rem' }}
            />

            {/* Expand/Collapse All */}
            {expandable && (
              <>
                <Tooltip title="Expand All">
                  <IconButton onClick={handleExpandAll} size="small">
                    <UnfoldMoreIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Collapse All">
                  <IconButton onClick={handleCollapseAll} size="small">
                    <UnfoldLessIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {/* Clear Filters */}
            {(Object.keys(filters).length > 0 || globalFilter) && (
              <Tooltip title="Clear All Filters">
                <Button
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={clearAllFilters}
                  variant="outlined"
                >
                  Clear Filters
                </Button>
              </Tooltip>
            )}

            {/* Export */}
            <Tooltip title="Export">
              <IconButton onClick={handleExport} size="small">
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </StyledToolbar>

        {/* Table */}
        <StyledTableContainer>
          <Table size={dense ? 'small' : 'medium'}>
            <StyledTableHead>
              {/* Header Row */}
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                      checked={data.length > 0 && selectedRows.length === data.length}
                      onChange={handleSelectAll}
                      size="small"
                    />
                  </TableCell>
                )}
                {expandable && expandIconPosition === 'left' && <TableCell sx={{ width: '3rem' }} />}
                {finalColumns.map((column) => (
                  <TableCell key={column.key}>
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={sortConfig.key === column.key}
                        direction={sortConfig.key === column.key ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort(column.key)}
                        sx={{ fontWeight: 'inherit', fontSize: 'inherit' }}
                      >
                        {column.title}
                      </TableSortLabel>
                    ) : (
                      column.title
                    )}
                  </TableCell>
                ))}
              </TableRow>

              {/* Filter Row */}
              {showFilters && (
                <FilterRow>
                  {selectable && <TableCell padding="checkbox" />}
                  {expandable && expandIconPosition === 'left' && <TableCell />}
                  {finalColumns.map((column) => (
                    <TableCell key={`filter-${column.key}`}>
                      {column.filterable !== false && (
                        <TextField
                          size="small"
                          placeholder={`Filter ${column.title}...`}
                          value={filters[column.key] || ''}
                          onChange={(e) => handleFilterChange(column.key, e.target.value)}
                          fullWidth
                          InputProps={{
                            endAdornment: filters[column.key] && (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() => handleFilterChange(column.key, '')}
                                  edge="end"
                                >
                                  <ClearIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiInputBase-root': {
                              fontSize: '0.8125rem',
                            },
                          }}
                        />
                      )}
                    </TableCell>
                  ))}
                </FilterRow>
              )}
            </StyledTableHead>

            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={finalColumns.length + (expandable && expandIconPosition === 'left' ? 1 : 0) + (selectable ? 1 : 0)} 
                    align="center"
                    sx={{ py: '3rem' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No data found matching the filter criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => {
                  const rowId = row[dataKey] || JSON.stringify(row);
                  return (
                    <TableRowComponent
                      key={rowId}
                      row={row}
                      columns={finalColumns}
                      expandable={expandable}
                      nestedKey={nestedKey}
                      isExpanded={expandedRows[rowId]}
                      onToggle={handleToggleRow}
                      dataKey={dataKey}
                      showFilters={showFilters}
                      onRowClick={onRowClick}
                      selectable={selectable}
                      isSelected={selectedRows.includes(rowId)}
                      onSelect={handleSelectRow}
                      expandIconPosition={expandIconPosition}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>

        {/* Pagination */}
        {pagination && (
          <TablePagination
            component="div"
            count={processedData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            sx={{
              borderTop: `0.0625rem solid`,
              borderColor: 'divider',
              '& .MuiTablePagination-toolbar': {
                minHeight: '3.5rem',
              },
            }}
          />
        )}
      </Paper>
    </Box>
  );
};

export default MaterialDataTable;

