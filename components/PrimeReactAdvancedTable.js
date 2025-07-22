import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Chip } from 'primereact/chip';
import { Badge } from 'primereact/badge';
import { Menu } from 'primereact/menu';
import {
  Search,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
  Columns,
  XCircle,
  Star,
  Heart
} from 'lucide-react';

const PrimeReactAdvancedTable = ({
  data = [],
  columns = [],
  fields = [],
  imageFields = [],
  popupImageFields = [],
  rowActions = [],
  loading = false,
  error = null,
  title = "Advanced Data Table",
  showTitle = true,
  showToolbar = true,
  showRowCount = true,
  showSelectedCount = true,
  showExportOptions = true,
  showGlobalFilter = true,
  enablePagination = true,
  enableSearch = true,
  enableRowSelection = false,
  enableExport = true,
  pageSize = 10,
  className = "",
  style = {},
  onRowClick,
  onRowSelect,
  onExport,
  onAdd,
  onDelete,
  onEdit,
  onView,
  customRenderers = {}
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({});
  const [toast, setToast] = useState(null);

  const tableData = data;
  const isLoading = loading;
  const tableError = error;

  useEffect(() => {
    const initial = {};
    (columns || []).forEach(col => {
      if (col.filterable !== false) {
        initial[col.field] = { value: null, matchMode: FilterMatchMode.CONTAINS };
      }
    });
    setFilters(initial);
  }, [columns]);

  const filteredColumns = useMemo(() => {
    const base = columns && columns.length > 0 ? columns : (tableData[0] ? Object.keys(tableData[0]).map(key => ({
      field: key,
      header: key.charAt(0).toUpperCase() + key.slice(1),
      filterable: true,
      sortable: true,
    })) : []);
    return fields.length ? base.filter(col => fields.includes(col.field)) : base;
  }, [columns, tableData, fields]);

  const getActionIcon = (type) => {
    switch (type) {
      case 'edit': return <Edit size={16} />;
      case 'delete': return <Trash2 size={16} />;
      case 'view': return <Eye size={16} />;
      default: return null;
    }
  };

  const handleRowAction = (action, row) => {
    switch (action.type) {
      case 'view': return onView?.(row);
      case 'edit': return onEdit?.(row);
      case 'delete':
        return confirmDialog({
          message: `Are you sure you want to delete ${row.name || 'this row'}?`,
          header: 'Delete Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            onDelete?.(row);
            setToast({ severity: 'success', summary: 'Deleted', detail: 'Row deleted', life: 3000 });
          }
        });
      default:
        return action.onClick?.(row);
    }
  };

  const renderActions = (row) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {rowActions.slice(0, 2).map((action, idx) => (
        <Button
          key={idx}
          icon={typeof action.icon === 'string' ? undefined : action.icon || getActionIcon(action.type)}
          text
          size="small"
          onClick={() => handleRowAction(action, row)}
          tooltip={action.title}
        />
      ))}
      {rowActions.length > 2 && (
        <Button
          icon={<MoreVertical size={16} />}
          text
          size="small"
        />
      )}
    </div>
  );

  if (!Array.isArray(tableData)) {
    console.error("Invalid `data` prop passed:", tableData);
    return <Message severity="error" text="Invalid data format. Table requires array." />;
  }

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '32px' }}><ProgressSpinner /></div>;
  }

  if (tableError) {
    return <Message severity="error" text={String(tableError)} />;
  }

  return (
    <div className={className} style={style}>
      <Toast ref={setToast} />
      <ConfirmDialog />

      {showTitle && <h3>{title}</h3>}

      {showToolbar && (
        <Toolbar
          left={() => (
            <div style={{ display: 'flex', gap: '8px' }}>
              {onAdd && <Button label="Add" icon={<Plus size={16} />} onClick={onAdd} />}
              {enableExport && (
                <Button
                  label="Export"
                  icon={<Download size={16} />}
                  onClick={() => {
                    const csv = [
                      filteredColumns.map(col => col.header).join(','),
                      ...tableData.map(row => filteredColumns.map(col => `"${row[col.field] || ''}"`).join(','))
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'export.csv';
                    link.click();
                  }}
                />
              )}
            </div>
          )}
        />
      )}

      {enableSearch && showGlobalFilter && (
        <div style={{ margin: '1rem 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Search size={16} />
          <InputText
            value={globalFilterValue}
            onChange={(e) => setGlobalFilterValue(e.target.value)}
            placeholder="Search..."
          />
          {globalFilterValue && (
            <Button icon={<XCircle size={14} />} text onClick={() => setGlobalFilterValue('')} />
          )}
        </div>
      )}

      <DataTable
        value={tableData}
        paginator={enablePagination}
        rows={pageSize}
        selection={enableRowSelection ? selectedRows : undefined}
        onSelectionChange={(e) => {
          setSelectedRows(e.value);
          onRowSelect?.(e.value);
        }}
        filters={filters}
        globalFilterFields={filteredColumns.map(col => col.field)}
        globalFilter={globalFilterValue}
        responsiveLayout="scroll"
        size="small"
      >
        {enableRowSelection && (
          <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
        )}
        {filteredColumns.map(col => (
          <Column
            key={col.field}
            field={col.field}
            header={col.header}
            sortable={col.sortable !== false}
            filter={col.filterable !== false}
            body={customRenderers[col.field]}
          />
        ))}
        {rowActions.length > 0 && (
          <Column header="Actions" body={renderActions} style={{ width: '10em' }} />
        )}
      </DataTable>

      {showRowCount && (
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          Total rows: {tableData.length}
        </div>
      )}
    </div>
  );
};

export default PrimeReactAdvancedTable;
