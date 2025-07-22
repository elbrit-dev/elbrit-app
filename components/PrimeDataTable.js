import React, { useState, useMemo, useCallback, useEffect } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Toolbar } from 'primereact/toolbar';
import { Paginator } from 'primereact/paginator';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Check,
  X,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckSquare,
  Square,
  Calendar as CalendarIcon,
  Hash,
  Type,
  RotateCcw,
  Columns,
  SortAsc,
  SortDesc
} from "lucide-react";

const PrimeDataTable = ({
  // Data props
  data = [],
  columns = [],
  loading = false,
  error = null,
  fields = [],
  imageFields = [],
  popupImageFields = [],
  
  // GraphQL props
  graphqlQuery = null,
  graphqlVariables = {},
  onGraphqlData,
  refetchInterval = 0,
  
  // Table configuration
  enableSearch = true,
  enableColumnFilter = true,
  enableSorting = true,
  enablePagination = true,
  enableRowSelection = false,
  enableExport = true,
  enableRefresh = false,
  enableColumnManagement = true,
  enableBulkActions = false,
  
  // Pagination
  pageSize = 10,
  currentPage = 1,
  pageSizeOptions = [5, 10, 25, 50, 100],
  
  // Styling
  className = "",
  style = {},
  tableHeight = "600px",
  theme = "default", // default, dark, minimal
  
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
  enableRowActions = false
}) => {
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ value: null, operator: 'equals' });
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
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);

  // GraphQL data state
  const [graphqlData, setGraphqlData] = useState([]);
  const [graphqlLoading, setGraphqlLoading] = useState(false);
  const [graphqlError, setGraphqlError] = useState(null);

  // Use GraphQL data if available, otherwise use provided data
  const tableData = graphqlQuery ? graphqlData : data;
  const isLoading = graphqlQuery ? graphqlLoading : loading;
  const tableError = graphqlQuery ? graphqlError : error;

  // Enhanced column generation with data type detection
  const defaultColumns = useMemo(() => {
    let cols = [];
    if (columns.length > 0) {
      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => columns.find(col => col.key === key)).filter(Boolean)
        : columns;
      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    } else if (tableData.length > 0) {
      const sampleRow = tableData[0];
      const autoColumns = Object.keys(sampleRow).map(key => {
        const value = sampleRow[key];
        let type = 'text';
        if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
          type = 'datetime';
        } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          type = 'date';
        } else if (typeof value === 'string' && value.includes('@')) {
          type = 'email';
        }
        return {
          key,
          title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          sortable: true,
          filterable: true,
          type,
          width: type === 'email' ? '200px' : type === 'date' ? '120px' : 'auto'
        };
      });
      const orderedColumns = columnOrder.length > 0 
        ? columnOrder.map(key => autoColumns.find(col => col.key === key)).filter(Boolean)
        : autoColumns;
      cols = orderedColumns.filter(col => !hiddenColumns.includes(col.key));
    }
    // Filter by fields prop if provided
    if (fields && Array.isArray(fields) && fields.length > 0) {
      cols = cols.filter(col => fields.includes(col.key));
    }
    return cols;
  }, [columns, tableData, hiddenColumns, columnOrder, fields]);

  // Initialize filters based on columns
  useEffect(() => {
    const initialFilters = {};
    defaultColumns.forEach(col => {
      if (col.filterable) {
        switch (col.type) {
          case 'number':
            initialFilters[col.key] = { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] };
            break;
          case 'date':
          case 'datetime':
            initialFilters[col.key] = { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] };
            break;
          default:
            initialFilters[col.key] = { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] };
        }
      }
    });
    setFilters(initialFilters);
  }, [defaultColumns]);

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
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch]);

  const handleBulkAction = useCallback((action) => {
    if (onBulkAction) {
      onBulkAction(action, selectedRows);
    }
  }, [onBulkAction, selectedRows]);

  const clearAllFilters = useCallback(() => {
    setDateFilter({ value: null, operator: 'equals' });
    setSearchTerm("");
    setFilters({});
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
    a.download = 'table-data.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    if (onExport) {
      onExport(tableData);
    }
  }, [enableExport, tableData, defaultColumns, onExport]);

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
        style={{ 
          maxWidth: 64, 
          maxHeight: 64, 
          cursor: isPopup ? 'pointer' : 'default', 
          border: '1px solid #e5e7eb', 
          borderRadius: 4 
        }}
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

  const actionsBodyTemplate = (rowData) => {
    return (
      <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
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
            style={{ color: action.color || "#6b7280" }}
          />
        ))}
      </div>
    );
  };

  // Filter components
  const getFilterComponent = (column) => {
    switch (column.type) {
      case 'number':
        return (
          <InputText
            placeholder={`Filter ${column.title}...`}
            className="p-column-filter"
            style={{ width: '100%' }}
          />
        );
      
      case 'date':
      case 'datetime':
        return (
          <Calendar
            placeholder={`Filter ${column.title}...`}
            className="p-column-filter"
            style={{ width: '100%' }}
            showTime={column.type === 'datetime'}
            showSeconds={column.type === 'datetime'}
          />
        );
      
      case 'select':
        const uniqueValues = [...new Set(tableData.map(row => row[column.key]))];
        return (
          <Dropdown
            placeholder={`Filter ${column.title}...`}
            className="p-column-filter"
            style={{ width: '100%' }}
            options={uniqueValues.map(value => ({ label: String(value), value }))}
            showClear
          />
        );
      
      default:
        return (
          <InputText
            placeholder={`Filter ${column.title}...`}
            className="p-column-filter"
            style={{ width: '100%' }}
          />
        );
    }
  };

  // Toolbar components
  const leftToolbarTemplate = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
      {enableSearch && (
        <div style={{ position: "relative" }}>
          <Search size={18} style={{ 
            position: "absolute", 
            left: "16px", 
            top: "50%", 
            transform: "translateY(-50%)",
            color: "#6b7280"
          }} />
          <InputText
            placeholder="Search all data..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              paddingLeft: "48px",
              paddingRight: "16px",
              width: "300px"
            }}
          />
        </div>
      )}
      
      {enableColumnFilter && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CalendarIcon size={18} style={{ color: "#6b7280" }} />
          <Dropdown
            value={dateFilter.operator}
            options={[
              { label: 'On date', value: 'equals' },
              { label: 'After date', value: 'after' },
              { label: 'Before date', value: 'before' }
            ]}
            onChange={(e) => setDateFilter(prev => ({ ...prev, operator: e.value }))}
            style={{ width: '120px' }}
          />
          <Calendar
            value={dateFilter.value}
            onChange={(e) => setDateFilter(prev => ({ ...prev, value: e.value }))}
            showClear
          />
        </div>
      )}

      {(searchTerm || dateFilter.value) && (
        <Button
          icon={<RotateCcw size={16} />}
          label="Clear"
          onClick={clearAllFilters}
          className="p-button-outlined p-button-danger p-button-sm"
        />
      )}
    </div>
  );

  const rightToolbarTemplate = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {selectedRows.length > 0 && enableBulkActions && bulkActions.length > 0 && (
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ fontSize: "14px", color: "#6b7280", padding: "8px 12px" }}>
            {selectedRows.length} selected
          </span>
          {bulkActions.map((action, index) => (
            <Button
              key={index}
              label={action.title}
              onClick={() => handleBulkAction(action)}
              className="p-button-sm"
              style={{ backgroundColor: action.color || "#3b82f6" }}
            />
          ))}
        </div>
      )}

      {enableColumnManagement && (
        <Button
          icon={<Columns size={16} />}
          label="Columns"
          onClick={() => setShowColumnManager(!showColumnManager)}
          className="p-button-outlined p-button-sm"
        />
      )}

      {enableExport && (
        <Button
          icon={<Download size={16} />}
          label="Export"
          onClick={handleExport}
          className="p-button-outlined p-button-sm"
        />
      )}

      {enableRefresh && (
        <Button
          icon={<RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />}
          label="Refresh"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-button-outlined p-button-sm"
        />
      )}
    </div>
  );

  // Loading and error states
  if (isLoading) {
    return (
      <div className={className} style={style}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "64px",
          color: "#6b7280"
        }}>
          <RefreshCw size={24} className="animate-spin" style={{ marginRight: "12px" }} />
          Loading data...
        </div>
      </div>
    );
  }

  if (tableError) {
    return (
      <div className={className} style={style}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "64px",
          color: "#dc2626"
        }}>
          <X size={24} style={{ marginRight: "12px" }} />
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
        style={{ 
          padding: "20px 24px", 
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb"
        }}
      />

      {/* DataTable */}
      <DataTable
        value={tableData}
        loading={isLoading}
        filters={filters}
        filterDisplay="menu"
        globalFilter={searchTerm}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
        onFilter={handleFilter}
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
        showGridlines
        stripedRows
        size="small"
        style={{ height: tableHeight }}
        className="p-datatable-sm"
      >
        {enableRowSelection && (
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '50px' }}
            frozen
          />
        )}

        {defaultColumns.map(column => {
          const isImageField = imageFields && Array.isArray(imageFields) && imageFields.includes(column.key);
          
          return (
            <Column
              key={column.key}
              field={column.key}
              header={column.title}
              sortable={column.sortable && enableSorting}
              filter={column.filterable && enableColumnFilter}
              filterPlaceholder={`Filter ${column.title}...`}
              filterElement={column.filterable && enableColumnFilter ? getFilterComponent(column) : undefined}
              body={isImageField ? (rowData) => imageBodyTemplate(rowData, column) :
                    column.type === 'date' || column.type === 'datetime' ? (rowData) => dateBodyTemplate(rowData, column) :
                    column.type === 'number' ? (rowData) => numberBodyTemplate(rowData, column) :
                    column.render ? (rowData) => column.render(rowData[column.key], rowData) : undefined}
              style={{ width: column.width || 'auto' }}
              showFilterMenu={false}
            />
          );
        })}

        {enableRowActions && rowActions.length > 0 && (
          <Column
            body={actionsBodyTemplate}
            header="Actions"
            style={{ width: '100px', textAlign: 'center' }}
            frozen="right"
          />
        )}
      </DataTable>

      {/* Image Modal */}
      <Dialog
        visible={showImageModal}
        onHide={() => setShowImageModal(false)}
        header={imageModalAlt}
        style={{ width: '80vw', maxWidth: '800px' }}
        modal
        className="p-fluid"
      >
        <img
          src={imageModalSrc}
          alt={imageModalAlt}
          style={{ 
            width: '100%', 
            height: 'auto', 
            borderRadius: 8, 
            border: '1px solid #e5e7eb' 
          }}
        />
      </Dialog>

      {/* Column Manager Dialog */}
      <Dialog
        visible={showColumnManager}
        onHide={() => setShowColumnManager(false)}
        header="Manage Columns"
        style={{ width: '400px' }}
        modal
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {defaultColumns.map(column => (
            <div key={column.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
    </div>
  );
};

export default PrimeDataTable; 