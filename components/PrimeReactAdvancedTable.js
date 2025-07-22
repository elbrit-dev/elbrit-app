import React, { useState, useEffect, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";

const PrimeReactAdvancedTable = ({
  data = [],
  columns = [],
  fields = [],
  loading = false,
  error = null,

  // Built-in configuration
  enablePagination = true,
  enableSearch = true,
  enableSorting = true,
  enableRowSelection = false,
  enableExport = false,
  enableColumnFilter = true,

  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  tableHeight = "auto",

  // Optional identity keys
  idField = "id",

  // Event handlers
  onRowClick,
  onRowSelect,
  onExport,
  onAdd,
  onEdit,
  onDelete,
  onView,

  // Row actions
  rowActions = [],

  // Context + GraphQL
  graphqlQuery = null,
  graphqlVariables = {},
  onGraphqlData,
  refetchInterval = 0,

  // Style
  className = "",
  style = {},

  title = "Advanced Data Table",
  showTitle = true,
  showToolbar = true
}) => {
  const [filters, setFilters] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [toastRef, setToastRef] = useState(null);
  const [internalData, setInternalData] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Simulated GraphQL loading
  useEffect(() => {
    if (!graphqlQuery) {
      setInternalData(data);
      return;
    }

    setFetching(true);
    setTimeout(() => {
      try {
        const simulated = data.length ? data : [
          { id: 1, name: "John", email: "john@example.com", status: "active" },
          { id: 2, name: "Jane", email: "jane@example.com", status: "inactive" }
        ];
        setInternalData(simulated);
        onGraphqlData?.(simulated);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setFetching(false);
      }
    }, 1000);
  }, [graphqlQuery, JSON.stringify(graphqlVariables), data]);

  // Auto-initialize filters
  useEffect(() => {
    const f = {};
    (columns || []).forEach((col) => {
      f[col.field] = { value: null, matchMode: FilterMatchMode.CONTAINS };
    });
    setFilters(f);
  }, [columns]);

  const visibleColumns = useMemo(() => {
    if (fields.length) {
      return columns.filter((col) => fields.includes(col.field));
    }
    return columns;
  }, [columns, fields]);

  const getDefaultRenderer = (col) => {
    if (col.field === "status") {
      return (row) => <Tag value={row[col.field]} severity={row[col.field] === "active" ? "success" : "danger"} />;
    }
    if (col.field === "role") {
      return (row) => <Chip label={row[col.field]} />;
    }
    return null;
  };

  const handleRowAction = (type, row) => {
    switch (type) {
      case "view": return onView?.(row);
      case "edit": return onEdit?.(row);
      case "delete":
        return confirmDialog({
          message: `Delete ${row.name || "row"}?`,
          header: "Confirm",
          accept: () => {
            onDelete?.(row);
            toastRef?.show({ severity: "success", summary: "Deleted", detail: "Row deleted" });
          }
        });
    }
  };

  if (fetching || loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (error || fetchError) {
    return (
      <div style={{ padding: 20 }}>
        <Message severity="error" text={String(error || fetchError)} />
      </div>
    );
  }

  return (
    <div className={className} style={{ ...style }}>
      <Toast ref={setToastRef} />
      <ConfirmDialog />

      {showTitle && <h2>{title}</h2>}

      {showToolbar && (
        <Toolbar
          left={() => onAdd && (
            <Button label="Add" icon="pi pi-plus" onClick={onAdd} />
          )}
          right={() => enableExport && (
            <Button
              label="Export"
              icon="pi pi-download"
              onClick={() => {
                const csv = [
                  visibleColumns.map((col) => col.header).join(","),
                  ...internalData.map((row) =>
                    visibleColumns.map((col) => `"${row[col.field] || ""}"`).join(",")
                  )
                ].join("\n");

                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "export.csv";
                a.click();
                URL.revokeObjectURL(url);
                onExport?.(internalData);
              }}
            />
          )}
        />
      )}

      {enableSearch && (
        <span className="p-input-icon-left" style={{ marginBottom: 12 }}>
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={(e) => setGlobalFilterValue(e.target.value)}
            placeholder="Search..."
          />
        </span>
      )}

      <DataTable
        value={internalData}
        paginator={enablePagination}
        rows={pageSize}
        rowsPerPageOptions={pageSizeOptions}
        selection={enableRowSelection ? selectedRows : undefined}
        onSelectionChange={(e) => {
          setSelectedRows(e.value);
          onRowSelect?.(e.value);
        }}
        globalFilter={globalFilterValue}
        globalFilterFields={visibleColumns.map((c) => c.field)}
        filters={filters}
        dataKey={idField}
        responsiveLayout="scroll"
        onRowClick={(e) => onRowClick?.(e.data)}
        className="p-datatable-gridlines"
        scrollable
        scrollHeight={tableHeight}
      >
        {enableRowSelection && (
          <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />
        )}

        {visibleColumns.map((col) => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            sortable={enableSorting}
            filter={enableColumnFilter}
            body={getDefaultRenderer(col)}
          />
        ))}

        {rowActions.length > 0 && (
          <Column
            header="Actions"
            body={(row) => (
              <div className="p-buttonset">
                {rowActions.map((action, i) => (
                  <Button
                    key={i}
                    icon={action.icon || `pi pi-${action.type}`}
                    className="p-button-sm p-button-text"
                    onClick={() => handleRowAction(action.type, row)}
                    tooltip={action.title}
                  />
                ))}
              </div>
            )}
            style={{ width: "10rem" }}
          />
        )}
      </DataTable>
    </div>
  );
};

export default PrimeReactAdvancedTable;
