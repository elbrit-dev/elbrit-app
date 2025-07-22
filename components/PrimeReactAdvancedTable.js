import React, { useState, useEffect, useMemo, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import { Slider } from "primereact/slider";
import { Rating } from "primereact/rating";
import { Badge } from "primereact/badge";
import { Avatar } from "primereact/avatar";
import { AvatarGroup } from "primereact/avatargroup";
import { Menu } from "primereact/menu";
import { OverlayPanel } from "primereact/overlaypanel";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Skeleton } from "primereact/skeleton";
import { classNames } from "primereact/utils";

const PrimeReactAdvancedTable = ({
  // Data and Configuration
  data = [],
  columns = [],
  fields = [],
  loading = false,
  error = null,
  
  // Table Features
  enablePagination = true,
  enableSearch = true,
  enableSorting = true,
  enableRowSelection = false,
  enableExport = true,
  enableColumnFilter = true,
  enableColumnResize = true,
  enableColumnReorder = true,
  enableRowGrouping = false,
  enableVirtualScrolling = false,
  enableLazyLoading = false,
  
  // Pagination
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  currentPage = 0,
  totalRecords = 0,
  
  // Styling
  tableHeight = "600px",
  tableWidth = "100%",
  className = "",
  style = {},
  title = "Advanced Data Table",
  showTitle = true,
  showToolbar = true,
  showBreadcrumb = false,
  showStatusBar = true,
  
  // Row Configuration
  idField = "id",
  rowHover = true,
  stripedRows = true,
  showGridlines = true,
  responsiveLayout = "scroll",
  
  // Callbacks
  onRowClick,
  onRowSelect,
  onRowUnselect,
  onSelectionChange,
  onPage,
  onSort,
  onFilter,
  onExport,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onRefresh,
  onBulkDelete,
  
  // Actions
  rowActions = [],
  bulkActions = [],
  
  // Data Integration
  graphqlQuery = null,
  graphqlVariables = {},
  onGraphqlData,
  refetchInterval = 0,
  apiEndpoint = null,
  apiMethod = "GET",
  apiHeaders = {},
  
  // Advanced Features
  enableRowExpansion = false,
  expandedRows = {},
  onRowToggle,
  rowExpansionTemplate,
  
  // Filter Configuration
  globalFilterPlaceholder = "Search all columns...",
  filterPlaceholder = "Search...",
  
  // Export Options
  exportFormats = ["csv", "xlsx", "pdf"],
  exportFileName = "table-export",
  
  // Custom Renderers
  customRenderers = {},
  
  // Theme and Styling
  theme = "lara-light-blue",
  size = "normal",
  severity = "info"
}) => {
  // State Management
  const [filters, setFilters] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedRowsState, setExpandedRowsState] = useState(expandedRows);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(1);
  const [first, setFirst] = useState(currentPage * pageSize);
  const [rows, setRows] = useState(pageSize);
  const [internalData, setInternalData] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: pageSize,
    sortField: null,
    sortOrder: null,
    filters: {}
  });

  // Refs
  const toastRef = useRef(null);
  const dtRef = useRef(null);
  const menuRef = useRef(null);
  const overlayPanelRef = useRef(null);

  // Memoized Values
  const serializedVariables = useMemo(() => JSON.stringify(graphqlVariables), [graphqlVariables]);
  
  const visibleColumns = useMemo(() => {
    if (fields.length) {
      return columns.filter((col) => fields.includes(col.field));
    }
    return columns;
  }, [columns, fields]);

  // Data Fetching
  useEffect(() => {
    if (!graphqlQuery && !apiEndpoint) {
      setInternalData(data);
      return;
    }

    setFetching(true);
    const fetchData = async () => {
      try {
        let result;
        
        if (apiEndpoint) {
          const response = await fetch(apiEndpoint, {
            method: apiMethod,
            headers: {
              'Content-Type': 'application/json',
              ...apiHeaders
            },
            body: apiMethod !== 'GET' ? JSON.stringify(graphqlVariables) : undefined
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          result = await response.json();
        } else {
          // Simulated GraphQL response
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = data.length ? data : [
            { id: 1, name: "John Doe", email: "john@example.com", status: "active", role: "admin", created: new Date(), rating: 4.5 },
            { id: 2, name: "Jane Smith", email: "jane@example.com", status: "inactive", role: "user", created: new Date(), rating: 3.8 },
            { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "active", role: "manager", created: new Date(), rating: 4.2 }
          ];
        }
        
        setInternalData(result);
        onGraphqlData?.(result);
        setFetchError(null);
      } catch (err) {
        setFetchError(err.message);
        console.error('Data fetching error:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [graphqlQuery, apiEndpoint, serializedVariables, data, onGraphqlData, apiMethod, apiHeaders, graphqlVariables]);

  // Initialize Filters
  useEffect(() => {
    const initialFilters = {};
    visibleColumns.forEach((col) => {
      if (col.filterable !== false) {
        initialFilters[col.field] = { 
          value: null, 
          matchMode: col.filterMatchMode || FilterMatchMode.CONTAINS,
          operator: col.filterOperator || FilterOperator.AND
        };
      }
    });
    setFilters(initialFilters);
  }, [visibleColumns]);

  // Auto-refetch
  useEffect(() => {
    if (refetchInterval > 0) {
      const interval = setInterval(() => {
        // Trigger refetch
        setFetching(true);
      }, refetchInterval);
      
      return () => clearInterval(interval);
    }
  }, [refetchInterval]);

  // Enhanced Renderers
  const getDefaultRenderer = (col) => {
    // Check for custom renderer first
    if (customRenderers[col.field]) {
      return customRenderers[col.field];
    }

    // Default renderers based on field type or name
    switch (col.field) {
      case "status":
        const StatusRenderer = (row) => {
          const status = row[col.field];
          const severity = status === "active" ? "success" : 
                          status === "inactive" ? "danger" : 
                          status === "pending" ? "warning" : "info";
          return <Tag value={status} severity={severity} />;
        };
        StatusRenderer.displayName = 'StatusRenderer';
        return StatusRenderer;

      case "role":
        const RoleRenderer = (row) => <Chip label={row[col.field]} className="p-chip-sm" />;
        RoleRenderer.displayName = 'RoleRenderer';
        return RoleRenderer;

      case "rating":
        const RatingRenderer = (row) => <Rating value={row[col.field]} readOnly stars={5} cancel={false} />;
        RatingRenderer.displayName = 'RatingRenderer';
        return RatingRenderer;

      case "avatar":
      case "image":
        const AvatarRenderer = (row) => (
          <Avatar 
            image={row[col.field]} 
            label={row.name?.charAt(0) || 'U'} 
            size="normal" 
            shape="circle"
          />
        );
        AvatarRenderer.displayName = 'AvatarRenderer';
        return AvatarRenderer;

      case "created":
      case "updated":
      case "date":
        const DateRenderer = (row) => {
          const date = new Date(row[col.field]);
          return date.toLocaleDateString();
        };
        DateRenderer.displayName = 'DateRenderer';
        return DateRenderer;

      case "amount":
      case "price":
      case "cost":
        const CurrencyRenderer = (row) => {
          const value = row[col.field];
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(value);
        };
        CurrencyRenderer.displayName = 'CurrencyRenderer';
        return CurrencyRenderer;

      default:
        return null;
    }
  };

  // Filter Templates
  const getFilterTemplate = (col) => {
    switch (col.filterType) {
      case "text":
        const TextFilter = (options) => (
          <InputText
            value={options.value}
            onChange={(e) => options.filterCallback(e.target.value)}
            placeholder={filterPlaceholder}
            className="p-column-filter"
          />
        );
        TextFilter.displayName = 'TextFilter';
        return TextFilter;

      case "dropdown":
        const DropdownFilter = (options) => (
          <Dropdown
            value={options.value}
            options={col.filterOptions || []}
            onChange={(e) => options.filterCallback(e.value)}
            placeholder={filterPlaceholder}
            className="p-column-filter"
            showClear
          />
        );
        DropdownFilter.displayName = 'DropdownFilter';
        return DropdownFilter;

      case "multiselect":
        const MultiSelectFilter = (options) => (
          <MultiSelect
            value={options.value}
            options={col.filterOptions || []}
            onChange={(e) => options.filterCallback(e.value)}
            placeholder={filterPlaceholder}
            className="p-column-filter"
            showClear
          />
        );
        MultiSelectFilter.displayName = 'MultiSelectFilter';
        return MultiSelectFilter;

      case "date":
        const DateFilter = (options) => (
          <Calendar
            value={options.value}
            onChange={(e) => options.filterCallback(e.value)}
            placeholder={filterPlaceholder}
            className="p-column-filter"
            showClear
            dateFormat="mm/dd/yy"
          />
        );
        DateFilter.displayName = 'DateFilter';
        return DateFilter;

      case "boolean":
        const BooleanFilter = (options) => (
          <TriStateCheckbox
            value={options.value}
            onChange={(e) => options.filterCallback(e.value)}
            className="p-column-filter"
          />
        );
        BooleanFilter.displayName = 'BooleanFilter';
        return BooleanFilter;

      case "numeric":
        const NumericFilter = (options) => (
          <Slider
            value={options.value}
            onChange={(e) => options.filterCallback(e.value)}
            min={col.filterMin || 0}
            max={col.filterMax || 100}
            className="p-column-filter"
          />
        );
        NumericFilter.displayName = 'NumericFilter';
        return NumericFilter;

      default:
        const DefaultFilter = (options) => (
          <InputText
            value={options.value}
            onChange={(e) => options.filterCallback(e.target.value)}
            placeholder={filterPlaceholder}
            className="p-column-filter"
          />
        );
        DefaultFilter.displayName = 'DefaultFilter';
        return DefaultFilter;
    }
  };

  // Action Handlers
  const handleRowAction = (type, row) => {
    switch (type) {
      case "view":
        return onView?.(row);
      case "edit":
        return onEdit?.(row);
      case "delete":
        return confirmDialog({
          message: `Are you sure you want to delete ${row.name || "this item"}?`,
          header: "Confirm Deletion",
          icon: "pi pi-exclamation-triangle",
          acceptClassName: "p-button-danger",
          accept: () => {
            onDelete?.(row);
            toastRef.current?.show({ 
              severity: "success", 
              summary: "Deleted", 
              detail: "Item deleted successfully",
              life: 3000
            });
          }
        });
      default:
        return null;
    }
  };

  const handleBulkAction = (type) => {
    if (selectedRows.length === 0) {
      toastRef.current?.show({ 
        severity: "warn", 
        summary: "No Selection", 
        detail: "Please select items to perform bulk actions",
        life: 3000
      });
      return;
    }

    switch (type) {
      case "delete":
        confirmDialog({
          message: `Are you sure you want to delete ${selectedRows.length} selected items?`,
          header: "Confirm Bulk Deletion",
          icon: "pi pi-exclamation-triangle",
          acceptClassName: "p-button-danger",
          accept: () => {
            onBulkDelete?.(selectedRows);
            setSelectedRows([]);
            toastRef.current?.show({ 
              severity: "success", 
              summary: "Bulk Deleted", 
              detail: `${selectedRows.length} items deleted successfully`,
              life: 3000
            });
          }
        });
        break;
      default:
        break;
    }
  };

  // Export Functions
  const exportCSV = () => {
    dtRef.current?.exportCSV();
    onExport?.({ format: 'csv', data: internalData });
  };

  const loadXLSX = async () => {
    if (typeof window !== 'undefined' && window.XLSX) {
      return window.XLSX;
    }
    
    try {
      // Try to load from CDN if not available locally
      if (!window.XLSX) {
        const script = document.createElement('script');
        script.src = 'https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js';
        script.async = true;
        
        return new Promise((resolve, reject) => {
          script.onload = () => resolve(window.XLSX);
          script.onerror = () => reject(new Error('Failed to load XLSX library'));
          document.head.appendChild(script);
        });
      }
    } catch (error) {
      throw new Error('XLSX library not available');
    }
  };

  const exportExcel = async () => {
    try {
      const XLSX = await loadXLSX();
      const worksheet = XLSX.utils.json_to_sheet(internalData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
      onExport?.({ format: 'xlsx', data: internalData });
    } catch (error) {
      console.warn('Excel export requires xlsx package. Install with: npm install xlsx');
      toastRef.current?.show({ 
        severity: "warn", 
        summary: "Export Unavailable", 
        detail: "Excel export requires xlsx package to be installed. Run: npm install xlsx",
        life: 5000
      });
    }
  };

  const loadPDF = async () => {
    if (typeof window !== 'undefined' && window.jsPDF) {
      return window.jsPDF;
    }
    
    try {
      // Try to load from CDN if not available locally
      if (!window.jsPDF) {
        const jsPDFScript = document.createElement('script');
        jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        jsPDFScript.async = true;
        
        const autoTableScript = document.createElement('script');
        autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js';
        autoTableScript.async = true;
        
        return new Promise((resolve, reject) => {
          jsPDFScript.onload = () => {
            autoTableScript.onload = () => resolve(window.jsPDF);
            autoTableScript.onerror = () => reject(new Error('Failed to load autoTable library'));
            document.head.appendChild(autoTableScript);
          };
          jsPDFScript.onerror = () => reject(new Error('Failed to load jsPDF library'));
          document.head.appendChild(jsPDFScript);
        });
      }
    } catch (error) {
      throw new Error('PDF libraries not available');
    }
  };

  const exportPDF = async () => {
    try {
      const jsPDF = await loadPDF();
      const doc = new jsPDF();
      
      doc.autoTable({
        head: [visibleColumns.map(col => col.header)],
        body: internalData.map(row => visibleColumns.map(col => row[col.field]))
      });
      doc.save(`${exportFileName}.pdf`);
      onExport?.({ format: 'pdf', data: internalData });
    } catch (error) {
      console.warn('PDF export requires jspdf and jspdf-autotable packages. Install with: npm install jspdf jspdf-autotable');
      toastRef.current?.show({ 
        severity: "warn", 
        summary: "Export Unavailable", 
        detail: "PDF export requires jspdf and jspdf-autotable packages to be installed. Run: npm install jspdf jspdf-autotable",
        life: 5000
      });
    }
  };

  // Toolbar Components
  const renderLeftToolbar = () => {
    const items = [];
    
    if (onAdd) {
      items.push(
        <Button 
          key="add" 
          label="Add New" 
          icon="pi pi-plus" 
          onClick={onAdd}
          className="p-button-success"
        />
      );
    }

    if (onRefresh) {
      items.push(
        <Button 
          key="refresh" 
          label="Refresh" 
          icon="pi pi-refresh" 
          onClick={onRefresh}
          className="p-button-secondary"
        />
      );
    }

    if (bulkActions.length > 0 && selectedRows.length > 0) {
      bulkActions.forEach(action => {
        items.push(
          <Button 
            key={action.type}
            label={action.label || action.type}
            icon={action.icon || `pi pi-${action.type}`}
            onClick={() => handleBulkAction(action.type)}
            className={action.className || "p-button-warning"}
          />
        );
      });
    }

    return items;
  };

  const renderRightToolbar = () => {
    const items = [];

    if (enableExport) {
      items.push(
        <Button
          key="export-menu"
          label="Export"
          icon="pi pi-download"
          onClick={(e) => overlayPanelRef.current?.toggle(e)}
          className="p-button-outlined"
        />
      );
    }

    if (selectedRows.length > 0) {
      items.push(
        <Badge 
          key="selection-badge" 
          value={selectedRows.length} 
          severity="info"
          className="p-mr-2"
        />
      );
    }

    return items;
  };

  // Loading State
  if (fetching || loading) {
    return (
      <Card className={className}>
        <div className="p-d-flex p-jc-center p-ai-center" style={{ minHeight: "200px" }}>
          <div className="p-text-center">
            <ProgressSpinner size="large" />
            <p className="p-mt-3">Loading data...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Error State
  if (error || fetchError) {
    return (
      <Card className={className}>
        <Message 
          severity="error" 
          text={String(error || fetchError)}
          className="p-mb-3"
        />
        <Button 
          label="Retry" 
          icon="pi pi-refresh" 
          onClick={() => window.location.reload()}
        />
      </Card>
    );
  }

  return (
    <div className={classNames("prime-react-advanced-table", className)} style={style}>
      {/* Toast for notifications */}
      <Toast ref={toastRef} position="top-right" />
      
      {/* Confirmation dialogs */}
      <ConfirmDialog />
      
      {/* Export overlay panel */}
      <OverlayPanel ref={overlayPanelRef}>
        <div className="p-d-flex p-flex-column p-gap-2">
          <Button 
            label="Export CSV" 
            icon="pi pi-file" 
            onClick={exportCSV}
            className="p-button-text"
            tooltip="Export as CSV file"
          />
          <Button 
            label="Export Excel" 
            icon="pi pi-file-excel" 
            onClick={() => exportExcel()}
            className="p-button-text"
            tooltip="Export as Excel file (loads from CDN if needed)"
          />
          <Button 
            label="Export PDF" 
            icon="pi pi-file-pdf" 
            onClick={() => exportPDF()}
            className="p-button-text"
            tooltip="Export as PDF file (loads from CDN if needed)"
          />
        </div>
      </OverlayPanel>

      {/* Title */}
      {showTitle && (
        <div className="p-mb-4">
          <h2 className="p-m-0">{title}</h2>
          {showBreadcrumb && (
            <nav aria-label="breadcrumb" className="p-mt-2">
              <ol className="p-breadcrumb p-m-0">
                <li className="p-breadcrumb-item">Home</li>
                <li className="p-breadcrumb-item">{title}</li>
              </ol>
            </nav>
          )}
        </div>
      )}

      {/* Toolbar */}
      {showToolbar && (
        <Toolbar
          left={renderLeftToolbar}
          right={renderRightToolbar}
          className="p-mb-4"
        />
      )}

      {/* Global Search */}
      {enableSearch && (
        <div className="p-mb-4">
          <span className="p-input-icon-left p-input-icon-right" style={{ width: "100%" }}>
            <i className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={(e) => setGlobalFilterValue(e.target.value)}
              placeholder={globalFilterPlaceholder}
              className="p-inputtext-lg"
              style={{ width: "100%" }}
            />
            {globalFilterValue && (
              <i 
                className="pi pi-times p-input-icon-right" 
                style={{ cursor: "pointer" }}
                onClick={() => setGlobalFilterValue("")}
              />
            )}
          </span>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        ref={dtRef}
        value={internalData}
        lazy={enableLazyLoading}
        lazyParams={lazyParams}
        onLazyLoad={setLazyParams}
        paginator={enablePagination}
        rows={rows}
        rowsPerPageOptions={pageSizeOptions}
        first={first}
        onPage={(e) => {
          setFirst(e.first);
          setRows(e.rows);
          onPage?.(e);
        }}
        selection={enableRowSelection ? selectedRows : undefined}
        onSelectionChange={(e) => {
          setSelectedRows(e.value);
          onSelectionChange?.(e);
        }}
        onRowSelect={onRowSelect}
        onRowUnselect={onRowUnselect}
        globalFilter={globalFilterValue}
        globalFilterFields={visibleColumns.map((c) => c.field)}
        filters={filters}
        onFilter={(e) => {
          setFilters(e.filters);
          onFilter?.(e);
        }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={(e) => {
          setSortField(e.sortField);
          setSortOrder(e.sortOrder);
          onSort?.(e);
        }}
        dataKey={idField}
        responsiveLayout={responsiveLayout}
        onRowClick={(e) => onRowClick?.(e)}
        expandedRows={expandedRowsState}
        onRowToggle={(e) => {
          setExpandedRowsState(e.data);
          onRowToggle?.(e);
        }}
        rowExpansionTemplate={rowExpansionTemplate}
        rowHover={rowHover}
        stripedRows={stripedRows}
        showGridlines={showGridlines}
        scrollable
        scrollHeight={tableHeight}
        scrollWidth={tableWidth}
        resizableColumns={enableColumnResize}
        reorderableColumns={enableColumnReorder}
        reorderableRows={false}
        className={classNames(
          "p-datatable-lg",
          {
            "p-datatable-sm": size === "small",
            "p-datatable-lg": size === "large"
          }
        )}
        emptyMessage="No records found"
        loading={loading}
        loadingIcon="pi pi-spinner"
        showLoader={true}
        virtualScrollerOptions={enableVirtualScrolling ? {
          itemSize: 46,
          numToleratedItems: 10
        } : undefined}
        virtualScrollerHeight={enableVirtualScrolling ? tableHeight : undefined}
      >
        {/* Row Selection */}
        {enableRowSelection && (
          <Column 
            selectionMode="multiple" 
            headerStyle={{ width: "3rem" }}
            frozen
          />
        )}

        {/* Row Expansion */}
        {enableRowExpansion && (
          <Column 
            expander={true} 
            style={{ width: "3rem" }}
            frozen
          />
        )}

        {/* Data Columns */}
        {visibleColumns.map((col) => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            sortable={col.sortable !== false && enableSorting}
            filter={col.filterable !== false && enableColumnFilter}
            filterMatchMode={col.filterMatchMode}
            filterType={col.filterType}
            filterElement={getFilterTemplate(col)}
            body={col.body || getDefaultRenderer(col)}
            style={col.style}
            className={col.className}
            headerStyle={col.headerStyle}
            bodyStyle={col.bodyStyle}
            frozen={col.frozen}
            align={col.align}
            exportable={col.exportable !== false}
            showFilterMenu={col.showFilterMenu !== false}
            filterMenuStyle={col.filterMenuStyle}
            filterMenuClassName={col.filterMenuClassName}
            showClearButton={col.showClearButton !== false}
            showApplyButton={col.showApplyButton !== false}
            showFilterOperator={col.showFilterOperator !== false}
            showFilterMatchModes={col.showFilterMatchModes !== false}
            showAddButton={col.showAddButton !== false}
            filterMaxlength={col.filterMaxlength}
            filterPlaceholder={col.filterPlaceholder}
            filterAriaLabel={col.filterAriaLabel}
            resizable={col.resizable !== false && enableColumnResize}
            reorderable={col.reorderable !== false && enableColumnReorder}
            headerClassName={col.headerClassName}
            bodyClassName={col.bodyClassName}
            sortFunction={col.sortFunction}
            editor={col.editor}
            onCellEditComplete={col.onCellEditComplete}
            onCellEditInit={col.onCellEditInit}
            onCellEditCancel={col.onCellEditCancel}
            onCellEdit={col.onCellEdit}
          />
        ))}

        {/* Row Actions */}
        {rowActions.length > 0 && (
          <Column
            header="Actions"
            body={(row) => (
              <div className="p-d-flex p-gap-1">
                {rowActions.map((action, i) => (
                  <Button
                    key={i}
                    icon={action.icon || `pi pi-${action.type}`}
                    className={classNames(
                      "p-button-sm p-button-text",
                      action.className
                    )}
                    onClick={() => handleRowAction(action.type, row)}
                    tooltip={action.title || action.type}
                    tooltipOptions={{ position: "top" }}
                    disabled={action.disabled?.(row)}
                  />
                ))}
              </div>
            )}
            style={{ width: "8rem" }}
            frozen="right"
            exportable={false}
          />
        )}
      </DataTable>

      {/* Status Bar */}
      {showStatusBar && (
        <div className="p-mt-3 p-d-flex p-jc-between p-ai-center">
          <small className="p-text-muted">
            Showing {first + 1} to {Math.min(first + rows, internalData.length)} of {internalData.length} entries
          </small>
          <small className="p-text-muted">
            {selectedRows.length > 0 && `${selectedRows.length} item(s) selected`}
          </small>
        </div>
      )}
    </div>
  );
};

PrimeReactAdvancedTable.displayName = "PrimeReactAdvancedTable";
export default PrimeReactAdvancedTable;
