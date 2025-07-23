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
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputNumber } from 'primereact/inputnumber';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { classNames } from 'primereact/utils';
import { 
  RefreshCw,
  X,
  Calendar as CalendarIcon
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
  tableHeight = "600px",
  theme = "default", // default, dark, minimal
  tableSize = "normal", // small, normal, large
  tableStyle = "default", // default, compact, comfortable
  
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
  globalFilterFields = [],
  showFilterMatchModes = true,
  filterMenuStyle = {},
  
  // Custom templates
  customTemplates = {},
  customFilters = {},
  customFormatters = {}
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
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);
  const [globalFilterValue, setGlobalFilterValue] = useState('');

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
          width: type === 'email' ? '200px' : type === 'date' ? '120px' : 'auto',
          minWidth: type === 'email' ? '200px' : type === 'date' ? '120px' : '150px'
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
    const initialFilters = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
    
    defaultColumns.forEach(col => {
      if (col.filterable && enableColumnFilter) {
        switch (col.type) {
          case 'number':
            initialFilters[col.key] = { 
              operator: FilterOperator.AND, 
              constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] 
            };
            break;
          case 'date':
          case 'datetime':
            initialFilters[col.key] = { 
              operator: FilterOperator.AND, 
              constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] 
            };
            break;
          case 'boolean':
            initialFilters[col.key] = { 
              value: null, 
              matchMode: FilterMatchMode.EQUALS 
            };
            break;
          default:
            initialFilters[col.key] = { 
              operator: FilterOperator.AND, 
              constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] 
            };
        }
      }
    });
    setFilters(initialFilters);
  }, [defaultColumns, enableColumnFilter]);

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
    
    let _filters = { ...filters };
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

  const booleanBodyTemplate = (rowData, column) => {
    const value = rowData[column.key];
    return (
      <i className={classNames('pi', { 
        'text-green-500 pi-check-circle': value, 
        'text-red-500 pi-times-circle': !value 
      })}></i>
    );
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

  // Advanced filter components
  const getFilterComponent = (column) => {
    // Check for custom filter template
    if (customFilters[column.key]) {
      return customFilters[column.key];
    }

    switch (column.type) {
      case 'number':
        return (
          <InputNumber
            placeholder={`Filter ${column.title}...`}
            className="p-column-filter"
            style={{ width: '100%' }}
            mode="currency"
            currency="USD"
            locale="en-US"
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
            dateFormat="mm/dd/yy"
            mask="99/99/9999"
          />
        );
      
      case 'boolean':
        return (
          <div className="flex align-items-center gap-2">
            <label htmlFor={`${column.key}-filter`} className="font-bold">
              {column.title}
            </label>
            <TriStateCheckbox 
              inputId={`${column.key}-filter`} 
              value={null} 
              onChange={(e) => {}} 
            />
          </div>
        );
      
      case 'select':
        const uniqueValues = [...new Set(tableData.map(row => row[column.key]))];
        return (
          <MultiSelect
            placeholder={`Filter ${column.title}...`}
            className="p-column-filter"
            style={{ width: '100%' }}
            options={uniqueValues.map(value => ({ label: String(value), value }))}
            showClear
            optionLabel="label"
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

  // Filter templates
  const filterClearTemplate = (options) => {
    if (!enableFilterClear) return null;
    return (
      <Button 
        type="button" 
        icon="pi pi-times" 
        onClick={options.filterClearCallback} 
        severity="secondary"
        className="p-button-sm"
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
        severity="success"
        className="p-button-sm"
      />
    );
  };

  const filterFooterTemplate = (column) => {
    if (!enableFilterFooter) return null;
    return (
      <div className="px-3 pt-0 pb-3 text-center">
        Filter by {column.title}
      </div>
    );
  };

  // Toolbar components
  const leftToolbarTemplate = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
      {enableSearch && enableGlobalFilter && (
        <IconField iconPosition="left" style={{ width: "300px" }}>
          <InputIcon className="pi pi-search" />
          <InputText
            placeholder="Keyword Search"
            value={globalFilterValue}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: "100%" }}
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
          icon="pi pi-columns"
          label="Columns"
          onClick={() => setShowColumnManager(!showColumnManager)}
          className="p-button-outlined p-button-sm"
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

  // Get table size class
  const getTableSizeClass = () => {
    switch (tableSize) {
      case 'small': return 'p-datatable-sm';
      case 'large': return 'p-datatable-lg';
      default: return '';
    }
  };

  // Get table style class
  const getTableStyleClass = () => {
    switch (tableStyle) {
      case 'compact': return 'p-datatable-compact';
      case 'comfortable': return 'p-datatable-comfortable';
      default: return '';
    }
  };

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
        filterDisplay={filterDisplay}
        globalFilterFields={globalFilterFields.length > 0 ? globalFilterFields : defaultColumns.map(col => col.key)}
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
        showGridlines={enableGridLines}
        stripedRows={enableStripedRows}
        size={tableSize}
        className={`${getTableSizeClass()} ${getTableStyleClass()}`}
        style={{ height: tableHeight }}
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
        filterMenuStyle={filterMenuStyle}
      >
        {enableRowSelection && (
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '50px' }}
            frozen={enableFrozenColumns}
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
              filterClear={enableFilterClear ? filterClearTemplate : undefined}
              filterApply={enableFilterApply ? filterApplyTemplate : undefined}
              filterFooter={enableFilterFooter ? () => filterFooterTemplate(column) : undefined}
              showFilterMatchModes={enableFilterMatchModes}
              filterMenuStyle={filterMenuStyle}
              body={isImageField ? (rowData) => imageBodyTemplate(rowData, column) :
                    column.type === 'date' || column.type === 'datetime' ? (rowData) => dateBodyTemplate(rowData, column) :
                    column.type === 'number' ? (rowData) => numberBodyTemplate(rowData, column) :
                    column.type === 'boolean' ? (rowData) => booleanBodyTemplate(rowData, column) :
                    customTemplates[column.key] ? (rowData) => customTemplates[column.key](rowData, column) :
                    column.render ? (rowData) => column.render(rowData[column.key], rowData) : undefined}
              style={{ 
                width: column.width || 'auto',
                minWidth: column.minWidth || '150px'
              }}
              frozen={enableFrozenColumns && column.key === defaultColumns[0]?.key}
            />
          );
        })}

        {enableRowActions && rowActions.length > 0 && (
          <Column
            body={actionsBodyTemplate}
            header="Actions"
            style={{ width: '100px', textAlign: 'center' }}
            frozen={enableFrozenColumns ? "right" : undefined}
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