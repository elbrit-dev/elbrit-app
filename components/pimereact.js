
import React, { useState, useEffect, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Slider } from "primereact/slider";
import { FilterMatchMode } from "primereact/api";
import { Image } from "primereact/image";

const PrimeDataTable = ({
  data = [],
  columns = [],
  columnGroups = null,
  loading = false,
  footerTotals = false,
  enableSearch = true,
  enableExport = true,
  enableColumnManagement = true,
  enableRowActions = false,
  enableRowSelection = false,
  enablePagination = true,
  pageSize = 10,
  customFormatters = {},
  rowActions = [],
  enableRowExpansion = false,
  rowExpansionTemplate = () => <span>Expanded</span>,
  enableEditable = false,
  onRowEditComplete,
  graphqlQuery = null,
  graphqlVariables = {},
  onGraphqlData,
  enableLazyLoading = false,
  onLazyLoad = () => {}
}) => {
  const [filters, setFilters] = useState({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(columns);
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedRows, setExpandedRows] = useState(null);
  const [editingRows, setEditingRows] = useState({});
  const [lazyData, setLazyData] = useState([]);
  const [first, setFirst] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    if (graphqlQuery && enableLazyLoading) {
      onLazyLoad({ first, rows: pageSize, filters, globalFilterValue });
    }
  }, [first, filters, globalFilterValue]);

  const displayedData = graphqlQuery ? lazyData : data;

  const tableColumns = useMemo(() => selectedColumns.length ? selectedColumns : columns, [selectedColumns, columns]);

  const applyGlobalFilter = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, global: { value, matchMode: FilterMatchMode.CONTAINS } }));
    setGlobalFilterValue(value);
  };

  const totalRow = useMemo(() => {
    if (!footerTotals || !data.length) return null;
    const totals = {};
    columns.forEach(col => {
      if (typeof data[0][col.field] === "number") {
        totals[col.field] = data.reduce((sum, row) => sum + (row[col.field] || 0), 0);
      }
    });
    return totals;
  }, [data, columns, footerTotals]);

  const renderFooter = (col) => {
    if (!footerTotals || !totalRow || typeof totalRow[col.field] === "undefined") return null;
    return totalRow[col.field].toLocaleString();
  };

  const getFilterElement = (col) => {
    switch (col.filterType) {
      case 'dropdown':
        return <Dropdown options={col.filterOptions || []} value={filters[col.field]?.value || null}
                         onChange={(e) => setFilters({ ...filters, [col.field]: { value: e.value, matchMode: FilterMatchMode.EQUALS } })}
                         placeholder={`Select ${col.header}`} className="p-column-filter" />;
      case 'calendar':
        return <Calendar value={filters[col.field]?.value || null}
                         onChange={(e) => setFilters({ ...filters, [col.field]: { value: e.value, matchMode: FilterMatchMode.DATE_IS } })}
                         placeholder={`Pick ${col.header}`} showIcon />;
      case 'number':
        return <InputNumber value={filters[col.field]?.value || null}
                            onValueChange={(e) => setFilters({ ...filters, [col.field]: { value: e.value, matchMode: FilterMatchMode.EQUALS } })}
                            placeholder={`Filter ${col.header}`} className="p-column-filter" />;
      case 'slider':
        return <Slider value={filters[col.field]?.value || 0}
                       onChange={(e) => setFilters({ ...filters, [col.field]: { value: e.value, matchMode: FilterMatchMode.GREATER_THAN } })}
                       min={col.min || 0} max={col.max || 100} />;
      default:
        return <InputText value={filters[col.field]?.value || ''}
                          onChange={(e) => setFilters({ ...filters, [col.field]: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS } })}
                          placeholder={`Search ${col.header}`} className="p-column-filter" />;
    }
  };

  const exportCSV = () => {
    const csv = [
      tableColumns.map(col => col.header).join(","),
      ...data.map(row => tableColumns.map(col => JSON.stringify(row[col.field] || "")).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "export.csv";
    a.click();
  };

  return (
    <div>
      <Toolbar
        left={enableSearch && (
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText value={globalFilterValue} onChange={applyGlobalFilter} placeholder="Search..." />
          </span>
        )}
        right={<div className="flex gap-2">
          {enableColumnManagement && <Button icon="pi pi-cog" onClick={() => setShowColumnManager(true)} />}
          {enableExport && <Button icon="pi pi-download" onClick={exportCSV} />}
        </div>}
      />
      <DataTable
        value={displayedData}
        paginator={enablePagination}
        rows={pageSize}
        filters={filters}
        first={first}
        onPage={(e) => setFirst(e.first)}
        totalRecords={graphqlQuery ? totalRecords : undefined}
        lazy={!!graphqlQuery}
        globalFilterFields={columns.map(col => col.field)}
        selection={enableRowSelection ? selectedRows : null}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        selectionMode={enableRowSelection ? "multiple" : null}
        headerColumnGroup={columnGroups?.header}
        footerColumnGroup={columnGroups?.footer}
        showGridlines
        stripedRows
        responsiveLayout="scroll"
        expandedRows={enableRowExpansion ? expandedRows : null}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={enableRowExpansion ? rowExpansionTemplate : undefined}
        editMode={enableEditable ? "row" : undefined}
        editingRows={editingRows}
        onRowEditChange={(e) => setEditingRows(e.data)}
        onRowEditComplete={enableEditable ? onRowEditComplete : undefined}
        loading={loading}
      >
        {enableRowSelection && <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />}
        {enableRowExpansion && <Column expander style={{ width: '3em' }} />}
        {tableColumns.map(col => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            sortable
            filter
            filterElement={getFilterElement(col)}
            editor={enableEditable ? col.editor : undefined}
            body={(rowData) =>
              customFormatters[col.field]
                ? customFormatters[col.field](rowData[col.field], rowData)
                : col.isImage
                  ? <Image src={rowData[col.field]} alt={col.header} width="50" preview />
                  : rowData[col.field]
            }
            footer={renderFooter(col)}
            style={{ minWidth: col.minWidth || "120px", textAlign: col.align || "center" }}
          />
        ))}
        {enableRowActions && rowActions.length > 0 && (
          <Column
            header="Actions"
            body={(row) => (
              <div className="flex gap-2 justify-center">
                {rowActions.map((action, idx) => (
                  <Button key={idx} icon={action.icon} onClick={() => action.onClick(row)} tooltip={action.title} className="p-button-text p-button-sm" />
                ))}
              </div>
            )}
            style={{ minWidth: "120px" }}
          />
        )}
      </DataTable>
      <Dialog header="Manage Columns" visible={showColumnManager} style={{ width: '20rem' }} modal onHide={() => setShowColumnManager(false)}>
        <div className="flex flex-column gap-3">
          <MultiSelect
            value={selectedColumns}
            options={columns}
            optionLabel="header"
            onChange={(e) => setSelectedColumns(e.value)}
            placeholder="Select Columns"
            display="chip"
          />
        </div>
      </Dialog>
    </div>
  );
};

export default PrimeDataTable;
