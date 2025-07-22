import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";
import MicrosoftSSOLogin from "./components/MicrosoftSSOLogin";
import PlasmicDataContext from "./components/PlasmicDataContext";
import AdvancedTable from "./components/AdvancedTable";
import PrimeReactAdvancedTable from "./components/PrimeReactAdvancedTable";
import FirestoreDebug from "./components/FirestoreDebug";
import EnvironmentCheck from "./components/EnvironmentCheck";
import TableDemo from "./pages/table-demo";
import TestTables from "./pages/test-tables";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: process.env.NEXT_PUBLIC_PLASMIC_PROJECT_ID,  // ID of a project you are using
      token: process.env.PLASMIC_API_TOKEN  // API token for that project
    }
  ],

  // Fetches the latest revisions, whether or not they were unpublished!
  // Disable for production to ensure you render only published changes.
  preview: true,
});

// You can register any code components that you want to use here; see
// https://docs.plasmic.app/learn/code-components-ref/
// And configure your Plasmic project to use the host url pointing at
// the /plasmic-host page of your nextjs app (for example,
// http://localhost:3000/plasmic-host).  See
// https://docs.plasmic.app/learn/app-hosting/#set-a-plasmic-project-to-use-your-app-host

PLASMIC.registerComponent(MicrosoftSSOLogin, {
  name: "MicrosoftSSOLogin",
  displayName: "Microsoft SSO Login",
  description: "Microsoft SSO login component using FirebaseUI",
  props: {
    onSuccess: {
      type: "eventHandler",
      argTypes: [
        {
          name: "firebaseUser",
          type: "object"
        }
      ]
    },
    onError: {
      type: "eventHandler",
      argTypes: [
        {
          name: "error",
          type: "object"
        }
      ]
    }
  },
  importPath: "./components/MicrosoftSSOLogin"
});

// Register the Plasmic Data Context component
PLASMIC.registerComponent(PlasmicDataContext, {
  name: "PlasmicDataContext",
  displayName: "Plasmic Data Context",
  description: "Provides user data context for Plasmic Studio data queries",
  props: {},
  importPath: "./components/PlasmicDataContext"
});

// Register the Firestore Debug component
PLASMIC.registerComponent(FirestoreDebug, {
  name: "FirestoreDebug",
  displayName: "Firestore Debug Panel",
  description: "Debug component to test Firestore connectivity and user creation",
  props: {},
  importPath: "./components/FirestoreDebug"
});

// Register the Environment Check component
PLASMIC.registerComponent(EnvironmentCheck, {
  name: "EnvironmentCheck",
  displayName: "Environment Variables Check",
  description: "Check if all required environment variables are set",
  props: {},
  importPath: "./components/EnvironmentCheck"
});

// Register the Advanced Table component
PLASMIC.registerComponent(AdvancedTable, {
  name: "AdvancedTable",
  displayName: "Advanced Data Table",
  description: "A comprehensive data table component with advanced features including search, filtering, sorting, pagination, row selection, and export capabilities",
  
  props: {
    // Data props
    data: {
      type: "object",
      description: "Array of data objects to display in the table",
      defaultValue: []
    },
    columns: {
      type: "object",
      description: "Array of column definitions with key, title, sortable, filterable, type, etc.",
      defaultValue: []
    },
    loading: {
      type: "boolean",
      description: "Whether the table is in loading state",
      defaultValue: false
    },
    error: {
      type: "string",
      description: "Error message to display",
      defaultValue: null
    },
    
    // GraphQL props
    graphqlQuery: {
      type: "string",
      description: "GraphQL query string to fetch data",
      defaultValue: null
    },
    graphqlVariables: {
      type: "object",
      description: "Variables for the GraphQL query",
      defaultValue: {}
    },
    refetchInterval: {
      type: "number",
      description: "Interval in milliseconds to refetch GraphQL data (0 = disabled)",
      defaultValue: 0
    },
    
    // Table configuration
    enableSearch: {
      type: "boolean",
      description: "Enable global search functionality",
      defaultValue: true
    },
    enableColumnFilter: {
      type: "boolean",
      description: "Enable column-specific filtering",
      defaultValue: true
    },
    enableSorting: {
      type: "boolean",
      description: "Enable column sorting",
      defaultValue: true
    },
    enablePagination: {
      type: "boolean",
      description: "Enable pagination controls",
      defaultValue: true
    },
    enableRowSelection: {
      type: "boolean",
      description: "Enable row selection with checkboxes",
      defaultValue: false
    },
    enableExport: {
      type: "boolean",
      description: "Enable CSV export functionality",
      defaultValue: true
    },
    enableRefresh: {
      type: "boolean",
      description: "Enable manual refresh button",
      defaultValue: false
    },
    enableColumnManagement: {
      type: "boolean",
      description: "Enable column visibility management",
      defaultValue: true
    },
    enableBulkActions: {
      type: "boolean",
      description: "Enable bulk actions for selected rows",
      defaultValue: false
    },
    
    // Pagination
    pageSize: {
      type: "number",
      description: "Number of items per page",
      defaultValue: 10
    },
    currentPage: {
      type: "number",
      description: "Current page number",
      defaultValue: 1
    },
    pageSizeOptions: {
      type: "object",
      description: "Array of page size options",
      defaultValue: [5, 10, 25, 50, 100]
    },
    
    // Styling
    className: {
      type: "string",
      description: "Additional CSS classes for the table container",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles for the table container",
      defaultValue: {}
    },
    tableHeight: {
      type: "string",
      description: "Height of the table container",
      defaultValue: "600px"
    },
    theme: {
      type: "choice",
      options: ["default", "dark", "minimal"],
      description: "Theme for the table styling",
      defaultValue: "default"
    },
    
    // Event handlers
    onRowClick: {
      type: "eventHandler",
      description: "Called when a row is clicked",
      argTypes: [
        {
          name: "row",
          type: "object",
          description: "The clicked row data"
        },
        {
          name: "index",
          type: "number",
          description: "The row index"
        }
      ]
    },
    onRowSelect: {
      type: "eventHandler",
      description: "Called when row selection changes",
      argTypes: [
        {
          name: "rowId",
          type: "string",
          description: "The row ID"
        },
        {
          name: "checked",
          type: "boolean",
          description: "Whether the row is selected"
        }
      ]
    },
    onExport: {
      type: "eventHandler",
      description: "Called when export is triggered",
      argTypes: [
        {
          name: "data",
          type: "object",
          description: "The data being exported"
        }
      ]
    },
    onRefresh: {
      type: "eventHandler",
      description: "Called when refresh is triggered",
      argTypes: []
    },
    onPageChange: {
      type: "eventHandler",
      description: "Called when page changes",
      argTypes: [
        {
          name: "page",
          type: "number",
          description: "The new page number"
        }
      ]
    },
    onFilterChange: {
      type: "eventHandler",
      description: "Called when filters change",
      argTypes: [
        {
          name: "column",
          type: "string",
          description: "The column being filtered"
        },
        {
          name: "filterConfig",
          type: "object",
          description: "The filter configuration"
        }
      ]
    },
    onSortChange: {
      type: "eventHandler",
      description: "Called when sorting changes",
      argTypes: [
        {
          name: "columnKey",
          type: "string",
          description: "The column being sorted"
        },
        {
          name: "direction",
          type: "string",
          description: "The sort direction (asc/desc)"
        }
      ]
    },
    onSearch: {
      type: "eventHandler",
      description: "Called when search term changes",
      argTypes: [
        {
          name: "searchTerm",
          type: "string",
          description: "The search term"
        }
      ]
    },
    onBulkAction: {
      type: "eventHandler",
      description: "Called when bulk action is triggered",
      argTypes: [
        {
          name: "action",
          type: "object",
          description: "The bulk action configuration"
        },
        {
          name: "selectedRows",
          type: "object",
          description: "Array of selected row IDs"
        }
      ]
    },
    onGraphqlData: {
      type: "eventHandler",
      description: "Called when GraphQL data is received",
      argTypes: [
        {
          name: "data",
          type: "object",
          description: "The GraphQL response data"
        }
      ]
    },
    
    // Action buttons
    rowActions: {
      type: "object",
      description: "Array of action buttons for each row",
      defaultValue: []
    },
    bulkActions: {
      type: "object",
      description: "Array of bulk action buttons",
      defaultValue: []
    },
    enableRowActions: {
      type: "boolean",
      description: "Enable row action buttons",
      defaultValue: false
    },
    fields: {
      type: "object",
      description: "Array of field keys to display as columns in the table. If empty, all fields are shown.",
      defaultValue: []
    },
    imageFields: {
      type: "object",
      description: "Array of field keys to render as images.",
      defaultValue: []
    },
    popupImageFields: {
      type: "object",
      description: "Array of image field keys that should open a popup modal when clicked.",
      defaultValue: []
    }
  },
  
  importPath: "./components/AdvancedTable"
});

// Register the PrimeReact Advanced Table component
PLASMIC.registerComponent(PrimeReactAdvancedTable, {
  name: "PrimeReactAdvancedTable",
  displayName: "PrimeReact Advanced Data Table",
  description: "A comprehensive data table component built with PrimeReact DataTable library, featuring advanced filtering, sorting, pagination, row selection, export capabilities, and enterprise-level features",
  
  props: {
    // Data props
    data: {
      type: "object",
      description: "Array of data objects to display in the table",
      defaultValue: []
    },
    columns: {
      type: "object",
      description: "Array of column definitions with field, header, type, sortable, filterable, etc.",
      defaultValue: []
    },
    loading: {
      type: "boolean",
      description: "Whether the table is in loading state",
      defaultValue: false
    },
    error: {
      type: "string",
      description: "Error message to display",
      defaultValue: null
    },
    fields: {
      type: "object",
      description: "Array of field keys to display as columns. If empty, all fields are shown.",
      defaultValue: []
    },
    imageFields: {
      type: "object",
      description: "Array of field keys to render as images",
      defaultValue: []
    },
    popupImageFields: {
      type: "object",
      description: "Array of image field keys that should open a popup modal when clicked",
      defaultValue: []
    },
    
    // GraphQL props
    graphqlQuery: {
      type: "string",
      description: "GraphQL query string to fetch data",
      defaultValue: null
    },
    graphqlVariables: {
      type: "object",
      description: "Variables for the GraphQL query",
      defaultValue: {}
    },
    refetchInterval: {
      type: "number",
      description: "Interval in milliseconds to refetch GraphQL data (0 = disabled)",
      defaultValue: 0
    },
    
    // Table configuration
    enableSearch: {
      type: "boolean",
      description: "Enable search functionality",
      defaultValue: true
    },
    enableColumnFilter: {
      type: "boolean",
      description: "Enable column-specific filtering",
      defaultValue: true
    },
    enableSorting: {
      type: "boolean",
      description: "Enable column sorting",
      defaultValue: true
    },
    enablePagination: {
      type: "boolean",
      description: "Enable pagination controls",
      defaultValue: true
    },
    enableRowSelection: {
      type: "boolean",
      description: "Enable row selection with checkboxes",
      defaultValue: false
    },
    enableExport: {
      type: "boolean",
      description: "Enable export functionality",
      defaultValue: true
    },
    enableRefresh: {
      type: "boolean",
      description: "Enable manual refresh button",
      defaultValue: false
    },
    enableColumnManagement: {
      type: "boolean",
      description: "Enable column visibility management",
      defaultValue: true
    },
    enableBulkActions: {
      type: "boolean",
      description: "Enable bulk actions for selected rows",
      defaultValue: false
    },
    enableGlobalFilter: {
      type: "boolean",
      description: "Enable global search filter",
      defaultValue: true
    },
    enableRowActions: {
      type: "boolean",
      description: "Enable row action buttons",
      defaultValue: false
    },
    
    // Pagination
    pageSize: {
      type: "number",
      description: "Number of items per page",
      defaultValue: 10
    },
    currentPage: {
      type: "number",
      description: "Current page number",
      defaultValue: 1
    },
    pageSizeOptions: {
      type: "object",
      description: "Array of page size options",
      defaultValue: [5, 10, 25, 50, 100]
    },
    
    // Styling
    className: {
      type: "string",
      description: "Additional CSS classes for the table container",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles for the table container",
      defaultValue: {}
    },
    tableHeight: {
      type: "string",
      description: "Height of the table container",
      defaultValue: "600px"
    },
    theme: {
      type: "choice",
      options: ["default", "dark", "minimal"],
      description: "Theme for the table styling",
      defaultValue: "default"
    },
    
    // Display options
    title: {
      type: "string",
      description: "Title displayed above the table",
      defaultValue: "Advanced Data Table"
    },
    showTitle: {
      type: "boolean",
      description: "Whether to show the table title",
      defaultValue: true
    },
    showToolbar: {
      type: "boolean",
      description: "Whether to show the toolbar with actions",
      defaultValue: true
    },
    showStatusBar: {
      type: "boolean",
      description: "Whether to show the status bar with row counts",
      defaultValue: true
    },
    showRowCount: {
      type: "boolean",
      description: "Whether to show total row count",
      defaultValue: true
    },
    showSelectedCount: {
      type: "boolean",
      description: "Whether to show selected row count",
      defaultValue: true
    },
    showExportOptions: {
      type: "boolean",
      description: "Whether to show export options",
      defaultValue: true
    },
    showColumnToggle: {
      type: "boolean",
      description: "Whether to show column management toggle",
      defaultValue: true
    },
    showGlobalFilter: {
      type: "boolean",
      description: "Whether to show global search filter",
      defaultValue: true
    },
    showColumnFilters: {
      type: "boolean",
      description: "Whether to show column-specific filters",
      defaultValue: true
    },
    showBulkActions: {
      type: "boolean",
      description: "Whether to show bulk actions",
      defaultValue: true
    },
    showRowActions: {
      type: "boolean",
      description: "Whether to show row action buttons",
      defaultValue: true
    },
    
    // Export options
    exportFormats: {
      type: "object",
      description: "Array of export formats (csv, excel, pdf)",
      defaultValue: ["csv", "excel", "pdf"]
    },
    exportFileName: {
      type: "string",
      description: "Default filename for exports",
      defaultValue: "table-data"
    },
    
    // Filter options
    globalFilterPlaceholder: {
      type: "string",
      description: "Placeholder text for global search",
      defaultValue: "Search all data..."
    },
    filterPlaceholder: {
      type: "string",
      description: "Placeholder text for column filters",
      defaultValue: "Filter..."
    },
    
    // Status options
    statusOptions: {
      type: "object",
      description: "Array of status options for status field rendering",
      defaultValue: [
        { label: 'Active', value: 'active', severity: 'success' },
        { label: 'Inactive', value: 'inactive', severity: 'danger' },
        { label: 'Pending', value: 'pending', severity: 'warning' },
        { label: 'Draft', value: 'draft', severity: 'info' }
      ]
    },
    
    // Role options
    roleOptions: {
      type: "object",
      description: "Array of role options for role field rendering",
      defaultValue: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'User', value: 'user' },
        { label: 'Guest', value: 'guest' }
      ]
    },
    
    // Event handlers
    onRowClick: {
      type: "eventHandler",
      description: "Called when a row is clicked",
      argTypes: [
        {
          name: "row",
          type: "object",
          description: "The clicked row data"
        },
        {
          name: "index",
          type: "number",
          description: "The row index"
        }
      ]
    },
    onRowSelect: {
      type: "eventHandler",
      description: "Called when row selection changes",
      argTypes: [
        {
          name: "selectedRows",
          type: "object",
          description: "Array of selected row data"
        }
      ]
    },
    onExport: {
      type: "eventHandler",
      description: "Called when export is triggered",
      argTypes: [
        {
          name: "data",
          type: "object",
          description: "The data being exported"
        },
        {
          name: "format",
          type: "string",
          description: "The export format (csv, excel, pdf)"
        }
      ]
    },
    onRefresh: {
      type: "eventHandler",
      description: "Called when refresh is triggered",
      argTypes: []
    },
    onPageChange: {
      type: "eventHandler",
      description: "Called when page changes",
      argTypes: [
        {
          name: "page",
          type: "number",
          description: "The new page number"
        }
      ]
    },
    onFilterChange: {
      type: "eventHandler",
      description: "Called when filters change",
      argTypes: [
        {
          name: "filters",
          type: "object",
          description: "The current filter state"
        }
      ]
    },
    onSortChange: {
      type: "eventHandler",
      description: "Called when sorting changes",
      argTypes: [
        {
          name: "sortField",
          type: "string",
          description: "The field being sorted"
        },
        {
          name: "sortOrder",
          type: "number",
          description: "The sort order (1 for asc, -1 for desc)"
        }
      ]
    },
    onSearch: {
      type: "eventHandler",
      description: "Called when search term changes",
      argTypes: [
        {
          name: "searchTerm",
          type: "string",
          description: "The search term"
        }
      ]
    },
    onBulkAction: {
      type: "eventHandler",
      description: "Called when bulk action is triggered",
      argTypes: [
        {
          name: "action",
          type: "object",
          description: "The bulk action configuration"
        },
        {
          name: "selectedRows",
          type: "object",
          description: "Array of selected row data"
        }
      ]
    },
    onAdd: {
      type: "eventHandler",
      description: "Called when add button is clicked",
      argTypes: []
    },
    onEdit: {
      type: "eventHandler",
      description: "Called when edit action is triggered",
      argTypes: [
        {
          name: "row",
          type: "object",
          description: "The row data to edit"
        }
      ]
    },
    onDelete: {
      type: "eventHandler",
      description: "Called when delete action is triggered",
      argTypes: [
        {
          name: "row",
          type: "object",
          description: "The row data to delete"
        }
      ]
    },
    onView: {
      type: "eventHandler",
      description: "Called when view action is triggered",
      argTypes: [
        {
          name: "row",
          type: "object",
          description: "The row data to view"
        }
      ]
    },
    onGraphqlData: {
      type: "eventHandler",
      description: "Called when GraphQL data is received",
      argTypes: [
        {
          name: "data",
          type: "object",
          description: "The GraphQL response data"
        }
      ]
    },
    
    // Action buttons
    rowActions: {
      type: "object",
      description: "Array of action buttons for each row",
      defaultValue: []
    },
    bulkActions: {
      type: "object",
      description: "Array of bulk action buttons",
      defaultValue: []
    },
    
    // Custom renderers
    customRenderers: {
      type: "object",
      description: "Object mapping field names to custom render functions",
      defaultValue: {}
    }
  },
  
  importPath: "./components/PrimeReactAdvancedTable"
});

// Register the Table Demo component
PLASMIC.registerComponent(TableDemo, {
  name: "TableDemo",
  displayName: "Table Components Demo",
  description: "Demo page showcasing both custom AdvancedTable and PrimeReact AdvancedTable components with comparison",
  props: {},
  importPath: "./pages/table-demo"
});

// Register the Test Tables component
PLASMIC.registerComponent(TestTables, {
  name: "TestTables",
  displayName: "Table Components Test",
  description: "Simple test page to verify both table components work without errors",
  props: {},
  importPath: "./pages/test-tables"
});
