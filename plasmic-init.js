import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";
import MicrosoftSSOLogin from "./components/MicrosoftSSOLogin";
import TruecallerSSOLogin from "./components/TruecallerSSOLogin";
import PlasmicDataContext from "./components/PlasmicDataContext";
import AdvancedTable from "./components/AdvancedTable";
import PrimeDataTable from "./components/PrimeDataTable";
// import PrimeDataTableOptimized from "./components/PrimeDataTableOptimized";
import FirestoreDebug from "./components/FirestoreDebug";
import EnvironmentCheck from "./components/EnvironmentCheck";
import PrimeDataTab from "./components/pimereact";
import LinkComponent from "./components/LinkComponent";
import TagFilterPrimeReact from "./components/TagFilterPrimeReact";


export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: 'oiawYdGgGKrh1ZZAv15gDZ',  // ID of a project you are using
      token: 'at5jesnXc89u9hbeOAv8HEZRXhbDHtJCVKm7DsJoRGxuRCGXsNP4LynYxAea6cDCjlePUmjN5TIX3ImE35A'  // API token for that project
    }
  ],

  // Fetches the latest revisions, whether or not they were unpublished!
  // Disable for production to ensure you render only published changes.
  preview: true,
  
  // Disable Plasmic's built-in authentication system
  // This allows our custom authentication to work without interference
  auth: {
    // Disable Plasmic's built-in auth
    enabled: false,
    // Provide a custom auth handler that always returns authenticated
    getUserAndToken: async () => {
      // Return null to indicate no Plasmic auth is needed
      // Our custom auth will handle everything
      return null;
    }
  }
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

PLASMIC.registerComponent(TruecallerSSOLogin, {
  name: "TruecallerSSOLogin",
  displayName: "Truecaller SSO Login",
  description: "Truecaller deep-link login with backend polling",
  props: {
    apiUrl: {
      type: "string",
      description: "Base backend URL exposing /api/method/truecaller",
      defaultValue: "https://uat.elbrit.org"
    },
    partnerKey: {
      type: "string",
      description: "Truecaller partner key",
      defaultValue: ""
    },
    partnerName: { type: "string", defaultValue: "App" },
    privacyUrl: { type: "string", defaultValue: "https://yourdomain.com/privacy" },
    termsUrl: { type: "string", defaultValue: "https://yourdomain.com/terms" },
    ttl: { type: "number", defaultValue: 60000 },
    lang: { type: "string", defaultValue: "en" },
    loginPrefix: { type: "string", defaultValue: "getstarted" },
    loginSuffix: { type: "string", defaultValue: "register" },
    ctaPrefix: { type: "string", defaultValue: "use" },
    ctaColor: { type: "string", defaultValue: "#f75d34" },
    ctaTextColor: { type: "string", defaultValue: "#ffffff" },
    btnShape: { type: "choice", options: ["round", "square"], defaultValue: "round" },
    skipOption: { type: "string", defaultValue: "useanothernum" },
    buttonText: { type: "string", defaultValue: "Truecaller" },
    showDebug: { type: "boolean", defaultValue: false },
    showStatus: { type: "boolean", defaultValue: true },
    showRequestId: { type: "boolean", defaultValue: false },
    fullWidth: { type: "boolean", defaultValue: false },
    enableAuthIntegration: { type: "boolean", defaultValue: false, description: "Store session/user and write to Firestore/ERPNext" },
    redirectOnSuccess: { type: "boolean", defaultValue: true, description: "Navigate after successful verification" },
    redirectPath: { type: "string", defaultValue: "/", description: "Path to navigate to on success" },
    className: { type: "string", defaultValue: "" },
    onSuccess: {
      type: "eventHandler",
      argTypes: [ { name: "response", type: "object" } ]
    },
    onError: {
      type: "eventHandler",
      argTypes: [ { name: "error", type: "object" } ]
    },
    onFailure: {
      type: "eventHandler",
      argTypes: [ { name: "error", type: "object" } ]
    }
  },
  importPath: "./components/TruecallerSSOLogin"
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

// Register the Link Component
PLASMIC.registerComponent(LinkComponent, {
  name: "LinkComponent",
  displayName: "Link Component",
  description: "A wrapper component for Next.js Link with instant navigation - no page refresh",
  props: {
    href: {
      type: "string",
      description: "The URL to navigate to",
      required: true,
      defaultValue: "/"
    },
    children: {
      type: "slot",
      description: "Content to render inside the link"
    },
    className: {
      type: "string",
      description: "Additional CSS classes",
      defaultValue: ""
    },
    target: {
      type: "choice",
      options: ["_self", "_blank", "_parent", "_top"],
      description: "Link target attribute",
      defaultValue: "_self"
    },
    rel: {
      type: "string",
      description: "Link rel attribute",
      defaultValue: ""
    },
    style: {
      type: "object",
      description: "Inline styles for the component"
    },
    replace: {
      type: "boolean",
      description: "Use replace instead of push for navigation",
      defaultValue: false
    },
    scroll: {
      type: "boolean",
      description: "Enable smooth scrolling to top",
      defaultValue: true
    },
    shallow: {
      type: "boolean",
      description: "Enable shallow routing for dynamic routes",
      defaultValue: false
    },
    prefetch: {
      type: "boolean",
      description: "Prefetch pages for faster navigation",
      defaultValue: true
    }
  },
  importPath: "./components/LinkComponent"
})

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
    
    // Filter configuration props
    dropdownFilterColumns: {
      type: "object",
      description: "Array of column keys that should use dropdown filters. Example: ['salesteam', 'status', 'category']",
      defaultValue: []
    },
    datePickerFilterColumns: {
      type: "object",
      description: "Array of column keys that should use date picker filters. Example: ['createdDate', 'updatedDate', 'dueDate']",
      defaultValue: []
    },
    numberFilterColumns: {
      type: "object",
      description: "Array of column keys that should use number filters. Example: ['amount', 'quantity', 'price']",
      defaultValue: []
    },
    textFilterColumns: {
      type: "object",
      description: "Array of column keys that should use text filters. Example: ['name', 'description', 'notes']",
      defaultValue: []
    },
    booleanFilterColumns: {
      type: "object",
      description: "Array of column keys that should use boolean filters. Example: ['isActive', 'isCompleted', 'isPublished']",
      defaultValue: []
    },
    customFilterOptions: {
      type: "object",
      description: "Object with column keys as keys and array of filter options as values. Example: { 'salesteam': [{ label: 'All', value: null }, { label: 'Team A', value: 'team_a' }] }",
      defaultValue: {}
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

    
    // Table styling options
    tableSize: {
      type: "choice",
      options: ["small", "normal", "large"],
      description: "Size of the table",
      defaultValue: "normal"
    },

    
    // Custom templates
    customTemplates: {
      type: "object",
      description: "Custom cell templates for specific columns",
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
    enableFixedFooterTotals: {
      type: "boolean",
      description: "Always show footer totals at bottom of table, even when pivot is used",
      defaultValue: false
    },
    footerTotalsConfig: {
      type: "object",
      description: "Configuration for footer totals (showTotals, showAverages, showCounts, numberFormat, currency, precision)",
      defaultValue: {
        showTotals: true,
        showAverages: false,
        showCounts: true,
        numberFormat: 'en-US',
        currency: 'USD',
        precision: 2
      }
    },
    currencyColumns: {
      type: "object",
      description: "Array of column keys to be formatted as currency in footer totals",
      defaultValue: []
    },

    // ROI Calculation Props
    enableROICalculation: {
      type: "boolean",
      description: "Enable ROI calculation feature",
      defaultValue: false
    },
    roiConfig: {
      type: "object",
      description: "Configuration for ROI calculation including field names, calculation method, display options, and color coding",
      defaultValue: {
        revenueField: 'revenue',
        costField: 'cost',
        investmentField: 'investment',
        profitField: 'profit',
        calculationMethod: 'standard',
        showROIColumn: true,
        showROIAsPercentage: true,
        roiColumnTitle: 'ROI (%)',
        roiColumnKey: 'roi',
        roiNumberFormat: 'en-US',
        roiPrecision: 2,
        roiCurrency: 'USD',
        enableROIColorCoding: true,
        roiColorThresholds: {
          positive: '#22c55e',
          neutral: '#6b7280',
          negative: '#ef4444'
        },
        positiveROIThreshold: 0,
        negativeROIThreshold: 0,
        customROICalculation: null
      }
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
      description: "Configuration for column grouping styling and behavior. Object with properties like enableHeaderGroups, enableFooterGroups, groupSeparator, ungroupedColumns, totalColumns, customGroupMappings, etc.",
      defaultValue: {
        enableHeaderGroups: true,
        enableFooterGroups: true,
        groupStyle: {},
        headerGroupStyle: {},
        footerGroupStyle: {},
        groupSeparator: '__',
        ungroupedColumns: [],
        totalColumns: [],
        customGroupMappings: {},
        groupingPatterns: []
      }
    },

    // Auto-merge configuration props
    enableAutoMerge: {
      type: "boolean",
      description: "Enable automatic data merging for object with arrays (e.g., {service: [...], support: [...]})",
      defaultValue: false
    },
    mergeConfig: {
      type: "object",
      description: "Configuration for auto-merge functionality. Object with properties like by, preserve, autoDetectMergeFields, mergeStrategy.",
      defaultValue: {
        by: [],
        preserve: [],
        autoDetectMergeFields: true,
        mergeStrategy: "combine"
      }
    },
    enableAutoColumnGrouping: {
      type: "boolean",
      description: "Enable automatic column grouping based on merged data or column patterns",
      defaultValue: false
    },


    
    // Advanced filter options
    filterDelay: {
      type: "number",
      description: "Delay in milliseconds before applying filter",
      defaultValue: 300
    },
    globalFilterPlaceholder: {
      type: "string",
      description: "Placeholder text for global search input",
      defaultValue: "Search..."
    },
    filterLocale: {
      type: "string",
      description: "Locale for filter formatting",
      defaultValue: "en"
    },
    
    // Inline editing
    enableInlineEditing: {
      type: "boolean",
      description: "Enable inline row editing",
      defaultValue: false
    },
    editingRows: {
      type: "object",
      description: "Currently editing rows",
      defaultValue: null
    },
    onRowEditSave: {
      type: "eventHandler",
      description: "Called when row edit is saved",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Row edit save event"
        }
      ]
    },
    onRowEditCancel: {
      type: "eventHandler",
      description: "Called when row edit is cancelled",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Row edit cancel event"
        }
      ]
    },
    onRowEditInit: {
      type: "eventHandler",
      description: "Called when row edit is initialized",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Row edit init event"
        }
      ]
    },
    onEditingRowsChange: {
      type: "eventHandler",
      description: "Called when editing rows change",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Editing rows change event"
        }
      ]
    },
    
    // Context menu
    enableContextMenu: {
      type: "boolean",
      description: "Enable context menu on right-click",
      defaultValue: false
    },
    contextMenu: {
      type: "object",
      description: "Context menu items configuration",
      defaultValue: null
    },
    contextMenuSelection: {
      type: "object",
      description: "Currently selected context menu item",
      defaultValue: null
    },
    onContextMenuSelectionChange: {
      type: "eventHandler",
      description: "Called when context menu selection changes",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Context menu selection change event"
        }
      ]
    },
    onContextMenu: {
      type: "eventHandler",
      description: "Called when context menu is triggered",
      argTypes: [
        {
          name: "event",
          type: "object",
          description: "Context menu event"
        }
      ]
    },
    
    // Advanced pagination
    showFirstLastIcon: {
      type: "boolean",
      description: "Show first/last page icons in pagination",
      defaultValue: true
    },
    showPageLinks: {
      type: "boolean",
      description: "Show page number links in pagination",
      defaultValue: true
    },
    showCurrentPageReport: {
      type: "boolean",
      description: "Show current page report in pagination",
      defaultValue: true
    },
    currentPageReportTemplate: {
      type: "string",
      description: "Template for current page report",
      defaultValue: "Showing {first} to {last} of {totalRecords} entries"
    },
    
    // Advanced export
    exportFilename: {
      type: "string",
      description: "Filename for exported data",
      defaultValue: "data"
    },
    exportFileType: {
      type: "choice",
      options: ["csv", "excel", "pdf"],
      description: "File type for export",
      defaultValue: "csv"
    },
    enableExcelExport: {
      type: "boolean",
      description: "Enable Excel export functionality",
      defaultValue: false
    },
    enablePdfExport: {
      type: "boolean",
      description: "Enable PDF export functionality",
      defaultValue: false
    },
    
    // Advanced selection
    selectionMode: {
      type: "choice",
      options: ["single", "multiple", "checkbox"],
      description: "Selection mode for rows",
      defaultValue: "multiple"
    },
    metaKeySelection: {
      type: "boolean",
      description: "Enable meta key selection",
      defaultValue: true
    },
    selectOnEdit: {
      type: "boolean",
      description: "Select row when editing",
      defaultValue: false
    },
    
    // Auto Column Grouping props
    enableAutoColumnGrouping: {
      type: "boolean",
      description: "Enable automatic column grouping based on column name patterns",
      defaultValue: false
    },
    groupSeparator: {
      type: "string",
      description: "Separator used to detect column groups (e.g., '__' for '2025-04-01__serviceAmount')",
      defaultValue: "__"
    },
    ungroupedColumns: {
      type: "object",
      description: "Array of column keys that should remain ungrouped (e.g., ['drCode', 'drName', 'salesTeam'])",
      defaultValue: []
    },
    totalColumns: {
      type: "object",
      description: "Array of column keys that represent totals (e.g., ['serviceAmount Total', 'supportValue Total'])",
      defaultValue: []
    },
    customGroupMappings: {
      type: "object",
      description: "Custom mappings for column grouping. Object with keywords as keys and group names as values (e.g., { 'inventory': 'Inventory Management', 'warehouse': 'Warehouse Operations' })",
      defaultValue: {}
    },
    groupingPatterns: {
      type: "object",
      description: "Array of custom regex patterns for advanced grouping scenarios",
      defaultValue: []
    },
    enableHeaderGroups: {
      type: "boolean",
      description: "Show grouped headers in the table",
      defaultValue: true
    },
    enableFooterGroups: {
      type: "boolean",
      description: "Show grouped footers in the table",
      defaultValue: true
    },
    headerGroupStyle: {
      type: "object",
      description: "CSS styles for group headers (e.g., { backgroundColor: '#e3f2fd', fontWeight: 'bold', textAlign: 'center' })",
      defaultValue: {}
    },
    groupStyle: {
      type: "object",
      description: "CSS styles for sub-headers (e.g., { backgroundColor: '#f5f5f5', fontSize: '0.9em' })",
      defaultValue: {}
    },
    footerGroupStyle: {
      type: "object",
      description: "CSS styles for group footers",
      defaultValue: {}
    },
    
    // Pivot Table Props - Excel-like pivot functionality
    enablePivotTable: {
      type: "boolean",
      description: "Enable Excel-like pivot table functionality",
      defaultValue: false
    },
    
    // NEW: Pivot UI Configuration Props
    enablePivotUI: {
      type: "boolean",
      description: "Enable pivot table configuration UI panel with dropdowns populated from data",
      defaultValue: true
    },
    pivotUIPosition: {
      type: "choice",
      options: ["toolbar", "panel", "sidebar"],
      description: "Position of the pivot configuration UI",
      defaultValue: "toolbar"
    },
    
    // NEW: CMS Persistence Props
    enablePivotPersistence: {
      type: "boolean",
      description: "Enable saving pivot configuration to CMS for persistence across refreshes",
      defaultValue: true
    },
    pivotConfigKey: {
      type: "string",
      description: "Key for storing pivot configuration in CMS (unique identifier)",
      defaultValue: "pivotConfig"
    },
    autoSavePivotConfig: {
      type: "boolean",
      description: "Automatically save pivot configuration changes to CMS (disable for manual save with 'Apply & Save' button)",
      defaultValue: false
    },
    
    // NEW: Direct Plasmic CMS Integration Props
    plasmicWorkspaceId: {
      type: "string",
      description: "Plasmic workspace ID for CMS integration (optional - uses env var if not provided)",
      defaultValue: ""
    },
    plasmicTableConfigsId: {
      type: "string",
      description: "TableConfigs table ID for CMS integration (optional - uses env var if not provided)",
      defaultValue: ""
    },
    plasmicApiToken: {
      type: "string",
      description: "Plasmic API token for direct CMS integration (optional - uses env var if not provided)",
      defaultValue: ""
    },
    useDirectCMSIntegration: {
      type: "boolean",
      description: "Use direct CMS integration instead of callback props",
      defaultValue: true
    },
    
    // DEPRECATED: Callback-based CMS Props (use direct integration instead)
    onSavePivotConfig: {
      type: "eventHandler",
      description: "DEPRECATED: Called to save pivot configuration to CMS (use direct integration instead)",
      argTypes: [
        {
          name: "configKey",
          type: "string",
          description: "The configuration key"
        },
        {
          name: "pivotConfig",
          type: "object",
          description: "The pivot configuration object to save"
        }
      ]
    },
    onLoadPivotConfig: {
      type: "eventHandler",
      description: "DEPRECATED: Called to load pivot configuration from CMS (use direct integration instead)",
      argTypes: [
        {
          name: "configKey",
          type: "string",
          description: "The configuration key to load"
        }
      ]
    },
    
    pivotRows: {
      type: "object",
      description: "Array of field names to use as row grouping (like Excel's 'Rows' area). Example: ['drName', 'salesTeam']",
      defaultValue: []
    },
    pivotColumns: {
      type: "object", 
      description: "Array of field names to use as column headers (like Excel's 'Columns' area). Example: ['date', 'category']",
      defaultValue: []
    },
    pivotValues: {
      type: "object",
      description: "Array of value configuration objects with field and aggregation. Example: [{ field: 'serviceAmount', aggregation: 'sum' }, { field: 'supportValue', aggregation: 'average' }]",
      defaultValue: []
    },
    pivotFilters: {
      type: "object",
      description: "Array of field names to use as pivot filters (like Excel's 'Filters' area). Example: ['region', 'status']",
      defaultValue: []
    },
    pivotShowGrandTotals: {
      type: "boolean",
      description: "Show grand total row in pivot table",
      defaultValue: true
    },
    pivotShowRowTotals: {
      type: "boolean",
      description: "Show row totals column in pivot table",
      defaultValue: true
    },
    pivotShowColumnTotals: {
      type: "boolean",
      description: "Show column totals in pivot table",
      defaultValue: true
    },
    pivotShowSubTotals: {
      type: "boolean",
      description: "Show subtotals in pivot table",
      defaultValue: true
    },
    pivotNumberFormat: {
      type: "string",
      description: "Number format locale for pivot table (e.g., 'en-US', 'de-DE')",
      defaultValue: "en-US"
    },
    pivotCurrency: {
      type: "string",
      description: "Currency code for pivot table formatting (e.g., 'USD', 'EUR', 'GBP')",
      defaultValue: "USD"
    },
    pivotPrecision: {
      type: "number",
      description: "Number of decimal places for pivot table numbers",
      defaultValue: 2
    },
    pivotFieldSeparator: {
      type: "string",
      description: "Separator for parsing complex field names like '2025-04-01__serviceAmount'",
      defaultValue: "__"
    },
    pivotSortRows: {
      type: "boolean",
      description: "Sort row values in pivot table",
      defaultValue: true
    },
    pivotSortColumns: {
      type: "boolean",
      description: "Sort column values in pivot table",
      defaultValue: true
    },
    pivotSortDirection: {
      type: "choice",
      options: ["asc", "desc"],
      description: "Sort direction for pivot table",
      defaultValue: "asc"
    },
    pivotAggregationFunctions: {
      type: "object",
      description: "Custom aggregation functions for pivot table. Object with function names as keys",
      defaultValue: {}
    }
  },
  
  importPath: "./components/PrimeDataTable"
});

// Register the Optimized PrimeReact Data Table component
// PLASMIC.registerComponent(PrimeDataTableOptimized, {
//   name: "PrimeDataTableOptimized",
//   displayName: "Optimized PrimeReact Data Table",
//   description: "OPTIMIZED VERSION: A comprehensive data table component built with PrimeReact DataTable, featuring advanced search, filtering, sorting, pagination, pivot tables, auto-merge, column grouping, and CMS integration. Reduced from 3349 lines to 904 lines (73% smaller) while maintaining all features.",
  
//   props: {
//     // Data props
//     data: {
//       type: "object",
//       description: "Array of data objects to display in the table",
//       defaultValue: []
//     },
//     columns: {
//       type: "object",
//       description: "Array of column definitions with key, title, sortable, filterable, type, etc.",
//       defaultValue: []
//     },
//     loading: {
//       type: "boolean",
//       description: "Whether the table is in loading state",
//       defaultValue: false
//     },
//     error: {
//       type: "string",
//       description: "Error message to display",
//       defaultValue: null
//     },
    
//     // GraphQL props
//     graphqlQuery: {
//       type: "string",
//       description: "GraphQL query string to fetch data",
//       defaultValue: null
//     },
//     graphqlVariables: {
//       type: "object",
//       description: "Variables for the GraphQL query",
//       defaultValue: {}
//     },
//     refetchInterval: {
//       type: "number",
//       description: "Interval in milliseconds to refetch GraphQL data (0 = disabled)",
//       defaultValue: 0
//     },
    
//     // Table configuration
//     enableSearch: {
//       type: "boolean",
//       description: "Enable global search functionality",
//       defaultValue: true
//     },
//     enableColumnFilter: {
//       type: "boolean",
//       description: "Enable column-specific filtering",
//       defaultValue: true
//     },
//     enableSorting: {
//       type: "boolean",
//       description: "Enable column sorting",
//       defaultValue: true
//     },
//     enablePagination: {
//       type: "boolean",
//       description: "Enable pagination controls",
//       defaultValue: true
//     },
//     enableRowSelection: {
//       type: "boolean",
//       description: "Enable row selection with checkboxes",
//       defaultValue: false
//     },
//     enableExport: {
//       type: "boolean",
//       description: "Enable CSV export functionality",
//       defaultValue: true
//     },
//     enableRefresh: {
//       type: "boolean",
//       description: "Enable manual refresh button",
//       defaultValue: false
//     },
//     enableColumnManagement: {
//       type: "boolean",
//       description: "Enable column visibility management",
//       defaultValue: true
//     },
//     enableBulkActions: {
//       type: "boolean",
//       description: "Enable bulk actions for selected rows",
//       defaultValue: false
//     },
    
//     // Pagination
//     pageSize: {
//       type: "number",
//       description: "Number of items per page",
//       defaultValue: 10
//     },
//     currentPage: {
//       type: "number",
//       description: "Current page number",
//       defaultValue: 1
//     },
//     pageSizeOptions: {
//       type: "object",
//       description: "Array of page size options",
//       defaultValue: [5, 10, 25, 50, 100]
//     },
    
//     // Styling
//     className: {
//       type: "string",
//       description: "Additional CSS classes for the table container",
//       defaultValue: ""
//     },
//     style: {
//       type: "object",
//       description: "Inline styles for the table container",
//       defaultValue: {}
//     },
    
//     // Event handlers
//     onRowClick: {
//       type: "eventHandler",
//       description: "Called when a row is clicked",
//       argTypes: [
//         {
//           name: "row",
//           type: "object",
//           description: "The clicked row data"
//         },
//         {
//           name: "index",
//           type: "number",
//           description: "The row index"
//         }
//       ]
//     },
//     onRowSelect: {
//       type: "eventHandler",
//       description: "Called when row selection changes",
//       argTypes: [
//         {
//           name: "selectedRows",
//           type: "object",
//           description: "Array of selected row data"
//         }
//       ]
//     },
//     onExport: {
//       type: "eventHandler",
//       description: "Called when export is triggered",
//       argTypes: [
//         {
//           name: "data",
//           type: "object",
//           description: "The data being exported"
//         }
//       ]
//     },
//     onRefresh: {
//       type: "eventHandler",
//       description: "Called when refresh is triggered",
//       argTypes: []
//     },
//     onPageChange: {
//       type: "eventHandler",
//       description: "Called when page changes",
//       argTypes: [
//         {
//           name: "page",
//           type: "number",
//           description: "The new page number"
//         }
//       ]
//     },
//     onFilterChange: {
//       type: "eventHandler",
//       description: "Called when filters change",
//       argTypes: [
//         {
//           name: "filters",
//           type: "object",
//           description: "The current filters state"
//         }
//       ]
//     },
//     onSortChange: {
//       type: "eventHandler",
//       description: "Called when sorting changes",
//       argTypes: [
//         {
//           name: "sortField",
//           type: "string",
//           description: "The column being sorted"
//         },
//         {
//           name: "sortOrder",
//           type: "number",
//           description: "The sort order (1 for asc, -1 for desc)"
//         }
//       ]
//     },
//     onSearch: {
//       type: "eventHandler",
//       description: "Called when search term changes",
//       argTypes: [
//         {
//           name: "searchTerm",
//           type: "string",
//           description: "The search term"
//         }
//       ]
//     },
//     onBulkAction: {
//       type: "eventHandler",
//       description: "Called when bulk action is triggered",
//       argTypes: [
//         {
//           name: "action",
//           type: "object",
//           description: "The bulk action configuration"
//         },
//         {
//           name: "selectedRows",
//           type: "object",
//           description: "Array of selected row data"
//         }
//       ]
//     },
//     onGraphqlData: {
//       type: "eventHandler",
//       description: "Called when GraphQL data is received",
//       argTypes: [
//         {
//           name: "data",
//           type: "object",
//           description: "The GraphQL response data"
//         }
//       ]
//     },
    
//     // Action buttons
//     rowActions: {
//       type: "object",
//       description: "Array of action buttons for each row",
//       defaultValue: []
//     },
//     bulkActions: {
//       type: "object",
//       description: "Array of bulk action buttons",
//       defaultValue: []
//     },
//     enableRowActions: {
//       type: "boolean",
//       description: "Enable row action buttons",
//       defaultValue: false
//     },
//     fields: {
//       type: "object",
//       description: "Array of field keys to display as columns in the table. If empty, all fields are shown.",
//       defaultValue: []
//     },
//     imageFields: {
//       type: "object",
//       description: "Array of field keys to render as images.",
//       defaultValue: []
//     },
//     popupImageFields: {
//       type: "object",
//       description: "Array of image field keys that should open a popup modal when clicked.",
//       defaultValue: []
//     },
    
//     // Filter configuration props
//     dropdownFilterColumns: {
//       type: "object",
//       description: "Array of column keys that should use dropdown filters. Example: ['salesteam', 'status', 'category']",
//       defaultValue: []
//     },
//     datePickerFilterColumns: {
//       type: "object",
//       description: "Array of column keys that should use date picker filters. Example: ['createdDate', 'updatedDate', 'dueDate']",
//       defaultValue: []
//     },
//     numberFilterColumns: {
//       type: "object",
//       description: "Array of column keys that should use number filters. Example: ['amount', 'quantity', 'price']",
//       defaultValue: []
//     },
//     textFilterColumns: {
//       type: "object",
//       description: "Array of column keys that should use text filters. Example: ['name', 'description', 'notes']",
//       defaultValue: []
//     },
//     booleanFilterColumns: {
//       type: "object",
//       description: "Array of column keys that should use boolean filters. Example: ['isActive', 'isCompleted', 'isPublished']",
//       defaultValue: []
//     },
//     customFilterOptions: {
//       type: "object",
//       description: "Object with column keys as keys and array of filter options as values. Example: { 'salesteam': [{ label: 'All', value: null }, { label: 'Team A', value: 'team_a' }] }",
//       defaultValue: {}
//     },
    
//     // Advanced toggle features
//     enableGlobalFilter: {
//       type: "boolean",
//       description: "Enable global filter functionality",
//       defaultValue: true
//     },
//     enableFilterMenu: {
//       type: "boolean",
//       description: "Enable filter menu display",
//       defaultValue: true
//     },
//     enableFilterMatchModes: {
//       type: "boolean",
//       description: "Show filter match modes in filter menus",
//       defaultValue: true
//     },
//     enableFilterClear: {
//       type: "boolean",
//       description: "Show clear filter button in filter menus",
//       defaultValue: true
//     },
//     enableFilterApply: {
//       type: "boolean",
//       description: "Show apply filter button in filter menus",
//       defaultValue: true
//     },
//     enableFilterFooter: {
//       type: "boolean",
//       description: "Show filter footer in filter menus",
//       defaultValue: true
//     },
//     enableGridLines: {
//       type: "boolean",
//       description: "Show grid lines in the table",
//       defaultValue: true
//     },
//     enableStripedRows: {
//       type: "boolean",
//       description: "Enable striped row styling",
//       defaultValue: true
//     },
//     enableHoverEffect: {
//       type: "boolean",
//       description: "Enable hover effects on rows",
//       defaultValue: true
//     },
//     enableResizableColumns: {
//       type: "boolean",
//       description: "Allow column resizing",
//       defaultValue: false
//     },
//     enableReorderableColumns: {
//       type: "boolean",
//       description: "Allow column reordering",
//       defaultValue: false
//     },
//     enableVirtualScrolling: {
//       type: "boolean",
//       description: "Enable virtual scrolling for large datasets",
//       defaultValue: false
//     },
//     enableLazyLoading: {
//       type: "boolean",
//       description: "Enable lazy loading for data",
//       defaultValue: false
//     },
//     enableRowGrouping: {
//       type: "boolean",
//       description: "Enable row grouping functionality",
//       defaultValue: false
//     },
//     enableRowExpansion: {
//       type: "boolean",
//       description: "Enable row expansion functionality",
//       defaultValue: false
//     },
//     enableFrozenColumns: {
//       type: "boolean",
//       description: "Enable frozen columns",
//       defaultValue: false
//     },
//     enableFrozenRows: {
//       type: "boolean",
//       description: "Enable frozen rows",
//       defaultValue: false
//     },
    
//     // Advanced filter options
//     filterDisplay: {
//       type: "choice",
//       options: ["menu", "row"],
//       description: "Display mode for filters",
//       defaultValue: "menu"
//     },
//     globalFilterFields: {
//       type: "object",
//       description: "Array of field names to include in global filter",
//       defaultValue: []
//     },
//     showFilterMatchModes: {
//       type: "boolean",
//       description: "Show filter match modes",
//       defaultValue: true
//     },
    
//     // Table styling options
//     tableSize: {
//       type: "choice",
//       options: ["small", "normal", "large"],
//       description: "Size of the table",
//       defaultValue: "normal"
//     },
    
//     // Custom templates
//     customTemplates: {
//       type: "object",
//       description: "Custom cell templates for specific columns",
//       defaultValue: {}
//     },
//     customFormatters: {
//       type: "object",
//       description: "Custom formatters for specific columns",
//       defaultValue: {}
//     },
    
//     // Footer totals props
//     enableFooterTotals: {
//       type: "boolean",
//       description: "Enable footer totals for numeric columns",
//       defaultValue: false
//     },
//     footerTotalsConfig: {
//       type: "object",
//       description: "Configuration for footer totals (showTotals, showAverages, showCounts, numberFormat, currency, precision)",
//       defaultValue: {
//         showTotals: true,
//         showAverages: false,
//         showCounts: true,
//         numberFormat: 'en-US',
//         currency: 'USD',
//         precision: 2
//       }
//     },
//     currencyColumns: {
//       type: "object",
//       description: "Array of column keys to be formatted as currency in footer totals",
//       defaultValue: []
//     },

//     // Column grouping props
//     enableColumnGrouping: {
//       type: "boolean",
//       description: "Enable column grouping functionality",
//       defaultValue: false
//     },
//     headerColumnGroup: {
//       type: "object",
//       description: "Custom header column group component",
//       defaultValue: null
//     },
//     footerColumnGroup: {
//       type: "object",
//       description: "Custom footer column group component",
//       defaultValue: null
//     },
//     columnGroups: {
//       type: "object",
//       description: "Array of column group configurations",
//       defaultValue: []
//     },
//     groupConfig: {
//       type: "object",
//       description: "Configuration for column grouping styling and behavior. Object with properties like enableHeaderGroups, enableFooterGroups, groupSeparator, ungroupedColumns, totalColumns, customGroupMappings, etc.",
//       defaultValue: {
//         enableHeaderGroups: true,
//         enableFooterGroups: true,
//         groupStyle: {},
//         headerGroupStyle: {},
//         footerGroupStyle: {},
//         groupSeparator: '__',
//         ungroupedColumns: [],
//         totalColumns: [],
//         customGroupMappings: {},
//         groupingPatterns: []
//       }
//     },

//     // Auto-merge configuration props
//     enableAutoMerge: {
//       type: "boolean",
//       description: "Enable automatic data merging for object with arrays (e.g., {service: [...], support: [...]})",
//       defaultValue: false
//     },
//     mergeConfig: {
//       type: "object",
//       description: "Configuration for auto-merge functionality. Object with properties like by, preserve, autoDetectMergeFields, mergeStrategy.",
//       defaultValue: {
//         by: [],
//         preserve: [],
//         autoDetectMergeFields: true,
//         mergeStrategy: "combine"
//       }
//     },
//     enableAutoColumnGrouping: {
//       type: "boolean",
//       description: "Enable automatic column grouping based on merged data or column patterns",
//       defaultValue: false
//     },
    
//     // Advanced filter options
//     filterDelay: {
//       type: "number",
//       description: "Delay in milliseconds before applying filter",
//       defaultValue: 300
//     },
//     globalFilterPlaceholder: {
//       type: "string",
//       description: "Placeholder text for global search input",
//       defaultValue: "Search..."
//     },
//     filterLocale: {
//       type: "string",
//       description: "Locale for filter formatting",
//       defaultValue: "en"
//     },
    
//     // Inline editing
//     enableInlineEditing: {
//       type: "boolean",
//       description: "Enable inline row editing",
//       defaultValue: false
//     },
//     editingRows: {
//       type: "object",
//       description: "Currently editing rows",
//       defaultValue: null
//     },
//     onRowEditSave: {
//       type: "eventHandler",
//       description: "Called when row edit is saved",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Row edit save event"
//         }
//       ]
//     },
//     onRowEditCancel: {
//       type: "eventHandler",
//       description: "Called when row edit is cancelled",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Row edit cancel event"
//         }
//       ]
//     },
//     onRowEditInit: {
//       type: "eventHandler",
//       description: "Called when row edit is initialized",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Row edit init event"
//         }
//       ]
//     },
//     onEditingRowsChange: {
//       type: "eventHandler",
//       description: "Called when editing rows change",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Editing rows change event"
//         }
//       ]
//     },
    
//     // Context menu
//     enableContextMenu: {
//       type: "boolean",
//       description: "Enable context menu on right-click",
//       defaultValue: false
//     },
//     contextMenu: {
//       type: "object",
//       description: "Context menu items configuration",
//       defaultValue: null
//     },
//     contextMenuSelection: {
//       type: "object",
//       description: "Currently selected context menu item",
//       defaultValue: null
//     },
//     onContextMenuSelectionChange: {
//       type: "eventHandler",
//       description: "Called when context menu selection changes",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Context menu selection change event"
//         }
//       ]
//     },
//     onContextMenu: {
//       type: "eventHandler",
//       description: "Called when context menu is triggered",
//       argTypes: [
//         {
//           name: "event",
//           type: "object",
//           description: "Context menu event"
//         }
//       ]
//     },
    
//     // Advanced pagination
//     showFirstLastIcon: {
//       type: "boolean",
//       description: "Show first/last page icons in pagination",
//       defaultValue: true
//     },
//     showPageLinks: {
//       type: "boolean",
//       description: "Show page number links in pagination",
//       defaultValue: true
//     },
//     showCurrentPageReport: {
//       type: "boolean",
//       description: "Show current page report in pagination",
//       defaultValue: true
//     },
//     currentPageReportTemplate: {
//       type: "string",
//       description: "Template for current page report",
//       defaultValue: "Showing {first} to {last} of {totalRecords} entries"
//     },
    
//     // Advanced export
//     exportFilename: {
//       type: "string",
//       description: "Filename for exported data",
//       defaultValue: "data"
//     },
//     exportFileType: {
//       type: "choice",
//       options: ["csv", "excel", "pdf"],
//       description: "File type for export",
//       defaultValue: "csv"
//     },
//     enableExcelExport: {
//       type: "boolean",
//       description: "Enable Excel export functionality",
//       defaultValue: false
//     },
//     enablePdfExport: {
//       type: "boolean",
//       description: "Enable PDF export functionality",
//       defaultValue: false
//     },
    
//     // Advanced selection
//     selectionMode: {
//       type: "choice",
//       options: ["single", "multiple", "checkbox"],
//       description: "Selection mode for rows",
//       defaultValue: "multiple"
//     },
//     metaKeySelection: {
//       type: "boolean",
//       description: "Enable meta key selection",
//       defaultValue: true
//     },
//     selectOnEdit: {
//       type: "boolean",
//       description: "Select row when editing",
//       defaultValue: false
//     },
    
//     // Pivot Table Props - Excel-like pivot functionality
//     enablePivotTable: {
//       type: "boolean",
//       description: "Enable Excel-like pivot table functionality",
//       defaultValue: false
//     },
    
//     // NEW: Pivot UI Configuration Props
//     enablePivotUI: {
//       type: "boolean",
//       description: "Enable pivot table configuration UI panel with dropdowns populated from data",
//       defaultValue: true
//     },
//     pivotUIPosition: {
//       type: "choice",
//       options: ["toolbar", "panel", "sidebar"],
//       description: "Position of the pivot configuration UI",
//       defaultValue: "toolbar"
//     },
    
//     // NEW: CMS Persistence Props
//     enablePivotPersistence: {
//       type: "boolean",
//       description: "Enable saving pivot configuration to CMS for persistence across refreshes",
//       defaultValue: true
//     },
//     pivotConfigKey: {
//       type: "string",
//       description: "Key for storing pivot configuration in CMS (unique identifier)",
//       defaultValue: "pivotConfig"
//     },
//     autoSavePivotConfig: {
//       type: "boolean",
//       description: "Automatically save pivot configuration changes to CMS (disable for manual save with 'Apply & Save' button)",
//       defaultValue: false
//     },
    
//     // NEW: Direct Plasmic CMS Integration Props
//     plasmicWorkspaceId: {
//       type: "string",
//       description: "Plasmic workspace ID for CMS integration (optional - uses env var if not provided)",
//       defaultValue: ""
//     },
//     plasmicTableConfigsId: {
//       type: "string",
//       description: "TableConfigs table ID for CMS integration (optional - uses env var if not provided)",
//       defaultValue: ""
//     },
//     plasmicApiToken: {
//       type: "string",
//       description: "Plasmic API token for direct CMS integration (optional - uses env var if not provided)",
//       defaultValue: ""
//     },
//     useDirectCMSIntegration: {
//       type: "boolean",
//       description: "Use direct CMS integration instead of callback props",
//       defaultValue: true
//     },
    
//     // DEPRECATED: Callback-based CMS Props (use direct integration instead)
//     onSavePivotConfig: {
//       type: "eventHandler",
//       description: "DEPRECATED: Called to save pivot configuration to CMS (use direct integration instead)",
//       argTypes: [
//         {
//           name: "configKey",
//           type: "string",
//           description: "The configuration key"
//         },
//         {
//           name: "pivotConfig",
//           type: "object",
//           description: "The pivot configuration object to save"
//         }
//       ]
//     },
//     onLoadPivotConfig: {
//       type: "eventHandler",
//       description: "DEPRECATED: Called to load pivot configuration from CMS (use direct integration instead)",
//       argTypes: [
//         {
//           name: "configKey",
//           type: "string",
//           description: "The configuration key to load"
//         }
//       ]
//     },
    
//     pivotRows: {
//       type: "object",
//       description: "Array of field names to use as row grouping (like Excel's 'Rows' area). Example: ['drName', 'salesTeam']",
//       defaultValue: []
//     },
//     pivotColumns: {
//       type: "object", 
//       description: "Array of field names to use as column headers (like Excel's 'Columns' area). Example: ['date', 'category']",
//       defaultValue: []
//     },
//     pivotValues: {
//       type: "object",
//       description: "Array of value configuration objects with field and aggregation. Example: [{ field: 'serviceAmount', aggregation: 'sum' }, { field: 'supportValue', aggregation: 'average' }]",
//       defaultValue: []
//     },
//     pivotFilters: {
//       type: "object",
//       description: "Array of field names to use as pivot filters (like Excel's 'Filters' area). Example: ['region', 'status']",
//       defaultValue: []
//     },
//     pivotShowGrandTotals: {
//       type: "boolean",
//       description: "Show grand total row in pivot table",
//       defaultValue: true
//     },
//     pivotShowRowTotals: {
//       type: "boolean",
//       description: "Show row totals column in pivot table",
//       defaultValue: true
//     },
//     pivotShowColumnTotals: {
//       type: "boolean",
//       description: "Show column totals in pivot table",
//       defaultValue: true
//     },
//     pivotShowSubTotals: {
//       type: "boolean",
//       description: "Show subtotals in pivot table",
//       defaultValue: true
//     },
//     pivotNumberFormat: {
//       type: "string",
//       description: "Number format locale for pivot table (e.g., 'en-US', 'de-DE')",
//       defaultValue: "en-US"
//     },
//     pivotCurrency: {
//       type: "string",
//       description: "Currency code for pivot table formatting (e.g., 'USD', 'EUR', 'GBP')",
//       defaultValue: "USD"
//     },
//     pivotPrecision: {
//       type: "number",
//       description: "Number of decimal places for pivot table numbers",
//       defaultValue: 2
//     },
//     pivotFieldSeparator: {
//       type: "string",
//       description: "Separator for parsing complex field names like '2025-04-01__serviceAmount'",
//       defaultValue: "__"
//     },
//     pivotSortRows: {
//       type: "boolean",
//       description: "Sort row values in pivot table",
//       defaultValue: true
//     },
//     pivotSortColumns: {
//       type: "boolean",
//       description: "Sort column values in pivot table",
//       defaultValue: true
//     },
//     pivotSortDirection: {
//       type: "choice",
//       options: ["asc", "desc"],
//       description: "Sort direction for pivot table",
//       defaultValue: "asc"
//     },
//     pivotAggregationFunctions: {
//       type: "object",
//       description: "Custom aggregation functions for pivot table. Object with function names as keys",
//       defaultValue: {}
//     }
//   },
  
//   importPath: "./components/PrimeDataTableOptimized"
// });

// Register Tag Filter Components
PLASMIC.registerComponent(TagFilterPrimeReact, {
  name: "TagFilterPrimeReact",
  displayName: "Tag Filter (PrimeReact)",
  description: "Interactive tag filter component using PrimeReact UI components with native styling",
  props: {
    // Data props
    tagList: {
      type: "object",
      description: "Static list of tags to display (fallback when not using data sources)",
      defaultValue: []
    },
    tagDataSource: {
      type: "choice",
      options: ["props", "pageData", "queryData", "cmsData"],
      description: "Data source to read tags from",
      defaultValue: "props"
    },
    tagDataPath: {
      type: "string",
      description: "Path to tags within the selected data source (e.g., 'categories.items')",
      defaultValue: ""
    },
    tagField: {
      type: "string",
      description: "Field name to extract when data source items are objects",
      defaultValue: "name"
    },
    
    // Behavior props
    multiSelect: {
      type: "boolean",
      description: "Allow multiple tag selections",
      defaultValue: true
    },
    allowDeselect: {
      type: "boolean",
      description: "Allow deselecting selected tags",
      defaultValue: true
    },
    maxSelections: {
      type: "number",
      description: "Maximum number of tags that can be selected",
      defaultValue: 10
    },
    defaultSelected: {
      type: "object",
      description: "Initially selected tags",
      defaultValue: []
    },
    stateKey: {
      type: "string",
      description: "Key used in custom event payload for state management",
      defaultValue: "selectedTags"
    },
    
    // Event handlers
    onSelectionChange: {
      type: "eventHandler",
      description: "Called when tag selection changes",
      argTypes: [
        {
          name: "selectedTags",
          type: "object",
          description: "Array of currently selected tags"
        },
        {
          name: "clickedTag",
          type: "string",
          description: "The tag that was just clicked"
        }
      ]
    },
    onTagClick: {
      type: "eventHandler",
      description: "Called when a specific tag is clicked",
      argTypes: [
        {
          name: "clickedTag",
          type: "string",
          description: "The tag that was clicked"
        },
        {
          name: "selectedTags",
          type: "object",
          description: "Array of currently selected tags"
        }
      ]
    },
    
    // Search props
    showSearch: {
      type: "boolean",
      description: "Enable search functionality for tags",
      defaultValue: true
    },
    searchPlaceholder: {
      type: "string",
      description: "Placeholder text for search input",
      defaultValue: "Search tags..."
    },
    searchDebounceMs: {
      type: "number",
      description: "Search debounce delay in milliseconds",
      defaultValue: 300
    },
    searchLabel: {
      type: "string",
      description: "Label text to display above search bar (when showSearchLabel is true)",
      defaultValue: "Search"
    },
    selectedLabel: {
      type: "string",
      description: "Label text for selected items section",
      defaultValue: "Selected"
    },
    showSearchLabel: {
      type: "boolean",
      description: "Show label above search bar",
      defaultValue: false
    },
    
    // Color props
    enableTagColors: {
      type: "boolean",
      description: "Enable automatic color generation for tags",
      defaultValue: true
    },
    colorScheme: {
      type: "choice",
      options: ["default", "rainbow", "pastel", "material"],
      description: "Color scheme for tag colors",
      defaultValue: "default"
    },
    
    // Visual props (PrimeReact specific)
    display: {
      type: "choice",
      options: ["tag", "chip", "button", "badge"],
      description: "Visual style for tags",
      defaultValue: "tag"
    },
    size: {
      type: "choice",
      options: ["small", "medium", "large"],
      description: "Size of tag elements",
      defaultValue: "medium"
    },
    severity: {
      type: "choice",
      options: ["success", "info", "warn", "danger"],
      description: "Color severity for selected tags (PrimeReact theme)",
      defaultValue: undefined
    },
    icon: {
      type: "string",
      description: "Icon name for button display mode",
      defaultValue: null
    },
    iconPos: {
      type: "choice",
      options: ["left", "right"],
      description: "Icon position for button display mode",
      defaultValue: "left"
    }
  },
  importPath: "./components/TagFilterPrimeReact"
});


