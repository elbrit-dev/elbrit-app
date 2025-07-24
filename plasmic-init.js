import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";
import MicrosoftSSOLogin from "./components/MicrosoftSSOLogin";
import PlasmicDataContext from "./components/PlasmicDataContext";
import AdvancedTable from "./components/AdvancedTable";
import PrimeDataTable from "./components/PrimeDataTable";
import FirestoreDebug from "./components/FirestoreDebug";
import EnvironmentCheck from "./components/EnvironmentCheck";
import PrimeDataTab from "./components/pimereact";

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
    
    // Cell styling props
    cellWidth: {
      type: "string",
      description: "Width of table cells (auto, fixed, or specific value like '150px')",
      defaultValue: "auto"
    },
    cellHeight: {
      type: "string",
      description: "Height of table cells (auto, fixed, or specific value like '50px')",
      defaultValue: "auto"
    },
    cellMinWidth: {
      type: "string",
      description: "Minimum width of table cells (auto or specific value like '100px')",
      defaultValue: "auto"
    },
    cellMinHeight: {
      type: "string",
      description: "Minimum height of table cells (auto or specific value like '40px')",
      defaultValue: "auto"
    },
    cellMaxWidth: {
      type: "string",
      description: "Maximum width of table cells (none or specific value like '300px')",
      defaultValue: "none"
    },
    cellMaxHeight: {
      type: "string",
      description: "Maximum height of table cells (none or specific value like '100px')",
      defaultValue: "none"
    },
    
    // Default styling props
    defaultHeaderStyle: {
      type: "object",
      description: "Default header styling for auto-generated columns",
      defaultValue: {}
    },
    defaultBodyStyle: {
      type: "object",
      description: "Default body styling for auto-generated columns",
      defaultValue: {}
    },
    
    // Column grouping props
    enableColumnGrouping: {
      type: "boolean",
      description: "Enable column grouping functionality",
      defaultValue: false
    },
    headerColumnGroup: {
      type: "object",
      description: "Custom header column group component",
      defaultValue: null
    },
    footerColumnGroup: {
      type: "object",
      description: "Custom footer column group component",
      defaultValue: null
    },
    columnGroups: {
      type: "object",
      description: "Array of column group configurations",
      defaultValue: []
    },
    groupConfig: {
      type: "object",
      description: "Configuration for column grouping styling and behavior",
      defaultValue: {
        enableHeaderGroups: true,
        enableFooterGroups: true,
        groupStyle: {},
        headerGroupStyle: {},
        footerGroupStyle: {}
      }
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

// Register the PrimeReact Data Table component
PLASMIC.registerComponent(PrimeDataTable, {
  name: "PrimeDataTable",
  displayName: "PrimeReact Data Table",
  description: "A comprehensive data table component built with PrimeReact DataTable, featuring advanced search, filtering, sorting, pagination, row selection, and export capabilities",
  
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
          description: "The current filters state"
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
          description: "The column being sorted"
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
    },
    
    // Advanced toggle features
    enableGlobalFilter: {
      type: "boolean",
      description: "Enable global filter functionality",
      defaultValue: true
    },
    enableFilterMenu: {
      type: "boolean",
      description: "Enable filter menu display",
      defaultValue: true
    },
    enableFilterMatchModes: {
      type: "boolean",
      description: "Show filter match modes in filter menus",
      defaultValue: true
    },
    enableFilterClear: {
      type: "boolean",
      description: "Show clear filter button in filter menus",
      defaultValue: true
    },
    enableFilterApply: {
      type: "boolean",
      description: "Show apply filter button in filter menus",
      defaultValue: true
    },
    enableFilterFooter: {
      type: "boolean",
      description: "Show filter footer in filter menus",
      defaultValue: true
    },
    enableGridLines: {
      type: "boolean",
      description: "Show grid lines in the table",
      defaultValue: true
    },
    enableStripedRows: {
      type: "boolean",
      description: "Enable striped row styling",
      defaultValue: true
    },
    enableHoverEffect: {
      type: "boolean",
      description: "Enable hover effects on rows",
      defaultValue: true
    },
    enableResizableColumns: {
      type: "boolean",
      description: "Allow column resizing",
      defaultValue: false
    },
    enableReorderableColumns: {
      type: "boolean",
      description: "Allow column reordering",
      defaultValue: false
    },
    enableVirtualScrolling: {
      type: "boolean",
      description: "Enable virtual scrolling for large datasets",
      defaultValue: false
    },
    enableLazyLoading: {
      type: "boolean",
      description: "Enable lazy loading for data",
      defaultValue: false
    },
    enableRowGrouping: {
      type: "boolean",
      description: "Enable row grouping functionality",
      defaultValue: false
    },
    enableRowExpansion: {
      type: "boolean",
      description: "Enable row expansion functionality",
      defaultValue: false
    },
    enableFrozenColumns: {
      type: "boolean",
      description: "Enable frozen columns",
      defaultValue: false
    },
    enableFrozenRows: {
      type: "boolean",
      description: "Enable frozen rows",
      defaultValue: false
    },
    
    // Advanced filter options
    filterDisplay: {
      type: "choice",
      options: ["menu", "row"],
      description: "Display mode for filters",
      defaultValue: "menu"
    },
    globalFilterFields: {
      type: "object",
      description: "Array of field names to include in global filter",
      defaultValue: []
    },
    showFilterMatchModes: {
      type: "boolean",
      description: "Show filter match modes",
      defaultValue: true
    },
    filterMenuStyle: {
      type: "object",
      description: "Custom styles for filter menus",
      defaultValue: {}
    },
    
    // Table styling options
    tableSize: {
      type: "choice",
      options: ["small", "normal", "large"],
      description: "Size of the table",
      defaultValue: "normal"
    },
    tableStyle: {
      type: "choice",
      options: ["default", "compact", "comfortable"],
      description: "Style of the table",
      defaultValue: "default"
    },
    
    // Custom templates
    customTemplates: {
      type: "object",
      description: "Custom cell templates for specific columns",
      defaultValue: {}
    },
    customFilters: {
      type: "object",
      description: "Custom filter components for specific columns",
      defaultValue: {}
    },
    customFormatters: {
      type: "object",
      description: "Custom formatters for specific columns",
      defaultValue: {}
    },
    
    // Footer totals props
    enableFooterTotals: {
      type: "boolean",
      description: "Enable footer totals for numeric columns",
      defaultValue: false
    },
    footerTotalsConfig: {
      type: "object",
      description: "Configuration for footer totals (showTotals, showAverages, showCounts, numberFormat, currency, precision, maxDecimalPlaces, formatType, includeColumns, excludeColumns)",
      defaultValue: {
        showTotals: true,
        showAverages: false,
        showCounts: false,
        numberFormat: 'en-IN',
        currency: null,
        precision: 0,
        maxDecimalPlaces: 2,
        formatType: 'decimal',
        includeColumns: [],
        excludeColumns: []
      }
    }
  },
  
  importPath: "./components/PrimeDataTable"
});

PLASMIC.registerComponent(PrimeDataTab, {
  name: "PrimeDataTab",
  displayName: "Prime Data Table",
  description: "A comprehensive data table component with advanced features including search, filtering, sorting, pagination, row selection, and export capabilities",
  props: {
    // Data props
    data: {
      type: "array",
      description: "Array of rows to display in the table",
      defaultValue: []
    },
    columns: {
      type: "array",
      description: "Column definitions (field, header, filterType, filterOptions, minWidth, align, isImage, editor, etc.)",
      defaultValue: []
    },
    columnGroups: {
      type: "object",
      description: "Column grouping configuration with header and footer groups",
      defaultValue: null
    },
    loading: {
      type: "boolean",
      description: "Whether the table is in loading state",
      defaultValue: false
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
    enableLazyLoading: {
      type: "boolean",
      description: "Enable lazy loading for GraphQL data",
      defaultValue: false
    },
    
    // Table configuration
    enableSearch: {
      type: "boolean",
      description: "Enable global search functionality",
      defaultValue: true
    },
    enableColumnManagement: {
      type: "boolean",
      description: "Enable column visibility management",
      defaultValue: true
    },
    enableRowSelection: {
      type: "boolean",
      description: "Enable row selection with checkboxes",
      defaultValue: false
    },
    enableRowActions: {
      type: "boolean",
      description: "Enable row action buttons",
      defaultValue: false
    },
    enableRowExpansion: {
      type: "boolean",
      description: "Enable row expansion functionality",
      defaultValue: false
    },
    enableEditable: {
      type: "boolean",
      description: "Enable inline row editing",
      defaultValue: false
    },
    enableExport: {
      type: "boolean",
      description: "Enable CSV export functionality",
      defaultValue: true
    },
    enablePagination: {
      type: "boolean",
      description: "Enable pagination controls",
      defaultValue: true
    },
    footerTotals: {
      type: "boolean",
      description: "Show footer totals for numeric columns",
      defaultValue: false
    },
    footerTotalsConfig: {
      type: "object",
      description: "Configuration for footer totals (showTotals, showAverages, showCounts, numberFormat, currency, precision, maxDecimalPlaces, formatType, includeColumns, excludeColumns)",
      defaultValue: {
        showTotals: true,
        showAverages: false,
        showCounts: false,
        numberFormat: 'en-IN',
        currency: null,
        precision: 0,
        maxDecimalPlaces: 2,
        formatType: 'decimal',
        includeColumns: [],
        excludeColumns: []
      }
    },
    
    // Pagination
    pageSize: {
      type: "number",
      description: "Number of items per page",
      defaultValue: 10
    },
    
    // Custom formatters and actions
    customFormatters: {
      type: "object",
      description: "Custom formatters for specific columns",
      defaultValue: {}
    },
    rowActions: {
      type: "array",
      description: "Array of action buttons for each row (icon, onClick, title)",
      defaultValue: []
    },
    rowExpansionTemplate: {
      type: "function",
      description: "Template function for expanded row content"
    },
    
    // Event handlers
    onRowEditComplete: {
      type: "eventHandler",
      description: "Called when row editing is completed",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Edit event data"
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
    onLazyLoad: {
      type: "eventHandler",
      description: "Called when lazy loading is triggered",
      argTypes: [
        {
          name: "params",
          type: "object",
          description: "Lazy load parameters (first, rows, filters, globalFilterValue)"
        }
      ]
    },
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
          name: "sortField",
          type: "string",
          description: "The column being sorted"
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
    
    // Additional configuration props
    showGridlines: {
      type: "boolean",
      description: "Show grid lines in the table",
      defaultValue: true
    },
    stripedRows: {
      type: "boolean",
      description: "Enable striped row styling",
      defaultValue: true
    },
    responsiveLayout: {
      type: "choice",
      options: ["scroll", "stack"],
      description: "Responsive layout mode",
      defaultValue: "scroll"
    },
    tableHeight: {
      type: "string",
      description: "Height of the table container",
      defaultValue: "600px"
    },
    
    // Styling props
    className: {
      type: "string",
      description: "Additional CSS classes for the table container",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles for the table container",
      defaultValue: {}
    }
  },
  
  importPath: "./components/pimereact"
});