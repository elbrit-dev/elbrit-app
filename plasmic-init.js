import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";
import MicrosoftSSOLogin from "./components/MicrosoftSSOLogin";
import PlasmicDataContext from "./components/PlasmicDataContext";
import PlasmicGraphQLHelper from "./components/PlasmicGraphQLHelper";
import QueryDataTable from "./components/QueryDataTable";
import QueryDataTableDemo, { SimpleDataTableDemo, GraphQLDataTableDemo, CompactDataTableDemo } from "./components/QueryDataTableDemo";
import Sidebar from "./components/Sidebar";
import SidebarDemo, { MinimalSidebar, DarkSidebar } from "./components/SidebarDemo";

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
  props: {
    onSuccess: {
      type: "eventHandler",
      description: "Called when login succeeds",
      argTypes: [
        {
          name: "result",
          type: "object",
          description: "The result object from Firebase sign-in"
        }
      ]
    },
    onError: {
      type: "eventHandler",
      description: "Called when login fails",
      argTypes: [
        {
          name: "error",
          type: "object",
          description: "The error object from Firebase sign-in"
        }
      ]
    },
  },
});

// Register the Plasmic Data Context component
PLASMIC.registerComponent(PlasmicDataContext, {
  name: "PlasmicDataContext",
  props: {},
  importPath: "./components/PlasmicDataContext"
});

// Register the Plasmic GraphQL Helper component
PLASMIC.registerComponent(PlasmicGraphQLHelper, {
  name: "GraphQLQuery",
  props: {
    query: {
      type: "string",
      description: "GraphQL query string"
    },
    variables: {
      type: "object",
      description: "Variables for the GraphQL query"
    },
    endpoint: {
      type: "string",
      description: "GraphQL endpoint URL"
    },
    loadingComponent: {
      type: "slot",
      description: "Component to show while loading"
    },
    errorComponent: {
      type: "slot",
      description: "Component to show on error"
    },
    children: {
      type: "slot",
      description: "Components to render with the GraphQL data"
    }
  },
  importPath: "./components/PlasmicGraphQLHelper"
});

// Register the Query Data Table component
PLASMIC.registerComponent(QueryDataTable, {
  name: "QueryDataTable",
  displayName: "Query Data Table",
  description: "A powerful data table component that displays query results with sorting, pagination, search, and selection features",
  
  props: {
    // Data props
    data: {
      type: "object",
      description: "The data to display in the table (usually from a GraphQL query)",
      defaultValue: []
    },
    dataPath: {
      type: "string",
      description: "JSON path to extract data from response (e.g., 'users.items')",
      defaultValue: ""
    },
    
    // Table configuration
    columns: {
      type: "object",
      description: "Array of column definitions with key, label, sortable, render, etc.",
      defaultValue: [
        { key: "id", label: "ID", sortable: true },
        { key: "name", label: "Name", sortable: true },
        { key: "email", label: "Email", sortable: true },
        { key: "status", label: "Status", sortable: true }
      ]
    },
    itemsPerPage: {
      type: "number",
      description: "Number of items to show per page",
      defaultValue: 10
    },
    showPagination: {
      type: "boolean",
      description: "Whether to show pagination controls",
      defaultValue: true
    },
    showSearch: {
      type: "boolean",
      description: "Whether to show search bar",
      defaultValue: true
    },
    showSorting: {
      type: "boolean",
      description: "Whether to show sorting indicators",
      defaultValue: true
    },
    
    // Styling
    className: {
      type: "string",
      description: "Additional CSS classes for the table container",
      defaultValue: ""
    },
    tableClassName: {
      type: "string",
      description: "Additional CSS classes for the table element",
      defaultValue: ""
    },
    headerClassName: {
      type: "string",
      description: "Additional CSS classes for the table header",
      defaultValue: ""
    },
    rowClassName: {
      type: "string",
      description: "Additional CSS classes for table rows",
      defaultValue: ""
    },
    cellClassName: {
      type: "string",
      description: "Additional CSS classes for table cells",
      defaultValue: ""
    },
    
    // State props
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
    
    // Event handlers
    onRowClick: {
      type: "eventHandler",
      description: "Called when a row is clicked",
      argTypes: [
        {
          name: "item",
          type: "object",
          description: "The clicked row data"
        }
      ]
    },
    onSort: {
      type: "eventHandler",
      description: "Called when sorting changes",
      argTypes: [
        {
          name: "sortConfig",
          type: "object",
          description: "The new sort configuration"
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
    onSelectionChange: {
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
    
    // Custom components
    loadingComponent: {
      type: "slot",
      description: "Custom component to show while loading"
    },
    errorComponent: {
      type: "slot",
      description: "Custom component to show on error"
    },
    emptyComponent: {
      type: "slot",
      description: "Custom component to show when no data is available"
    },
    
    // Additional props
    sortable: {
      type: "boolean",
      description: "Whether the table supports sorting",
      defaultValue: true
    },
    searchable: {
      type: "boolean",
      description: "Whether the table supports searching",
      defaultValue: true
    },
    selectable: {
      type: "boolean",
      description: "Whether the table supports row selection",
      defaultValue: false
    },
    selectedRows: {
      type: "object",
      description: "Array of pre-selected rows",
      defaultValue: []
    },
    
    // Table features
    striped: {
      type: "boolean",
      description: "Whether to show striped rows",
      defaultValue: true
    },
    hoverable: {
      type: "boolean",
      description: "Whether rows should be hoverable",
      defaultValue: true
    },
    bordered: {
      type: "boolean",
      description: "Whether to show table borders",
      defaultValue: false
    },
    compact: {
      type: "boolean",
      description: "Whether to use compact styling",
      defaultValue: false
    },
    
    // Responsive
    responsive: {
      type: "boolean",
      description: "Whether the table should be responsive",
      defaultValue: true
    },
    scrollable: {
      type: "boolean",
      description: "Whether the table should be scrollable",
      defaultValue: false
    },
    
    // Custom styling
    style: {
      type: "object",
      description: "Inline styles for the table container",
      defaultValue: {}
    },
    tableStyle: {
      type: "object",
      description: "Inline styles for the table element",
      defaultValue: {}
    },
    headerStyle: {
      type: "object",
      description: "Inline styles for the table header",
      defaultValue: {}
    },
    rowStyle: {
      type: "object",
      description: "Inline styles for table rows",
      defaultValue: {}
    },
    cellStyle: {
      type: "object",
      description: "Inline styles for table cells",
      defaultValue: {}
    }
  },
  
  importPath: "./components/QueryDataTable"
});

// Register the Query Data Table Demo component
PLASMIC.registerComponent(QueryDataTableDemo, {
  name: "QueryDataTableDemo",
  displayName: "Query Data Table Demo",
  description: "A demo component showing how to use QueryDataTable with GraphQL data",
  
  props: {
    query: {
      type: "string",
      description: "GraphQL query string",
      defaultValue: ""
    },
    variables: {
      type: "object",
      description: "Variables for the GraphQL query",
      defaultValue: {}
    },
    endpoint: {
      type: "string",
      description: "GraphQL endpoint URL",
      defaultValue: "/api/graphql"
    },
    columns: {
      type: "object",
      description: "Array of column definitions",
      defaultValue: []
    },
    dataPath: {
      type: "string",
      description: "JSON path to extract data from response",
      defaultValue: "users.items"
    },
    useDemoData: {
      type: "boolean",
      description: "Whether to use demo data instead of GraphQL",
      defaultValue: false
    },
    demoData: {
      type: "object",
      description: "Demo data to use when useDemoData is true",
      defaultValue: []
    },
    showSearch: {
      type: "boolean",
      description: "Whether to show search bar",
      defaultValue: true
    },
    showPagination: {
      type: "boolean",
      description: "Whether to show pagination controls",
      defaultValue: true
    },
    itemsPerPage: {
      type: "number",
      description: "Number of items per page",
      defaultValue: 10
    },
    selectable: {
      type: "boolean",
      description: "Whether to enable row selection",
      defaultValue: false
    },
    bordered: {
      type: "boolean",
      description: "Whether to show table borders",
      defaultValue: false
    },
    compact: {
      type: "boolean",
      description: "Whether to use compact styling",
      defaultValue: false
    },
    striped: {
      type: "boolean",
      description: "Whether to show striped rows",
      defaultValue: true
    },
    hoverable: {
      type: "boolean",
      description: "Whether rows should be hoverable",
      defaultValue: true
    }
  },
  
  importPath: "./components/QueryDataTableDemo"
});

// Register individual demo components
PLASMIC.registerComponent(SimpleDataTableDemo, {
  name: "SimpleDataTableDemo",
  displayName: "Simple Data Table Demo",
  description: "A simple data table demo with sample data",
  importPath: "./components/QueryDataTableDemo"
});

PLASMIC.registerComponent(GraphQLDataTableDemo, {
  name: "GraphQLDataTableDemo",
  displayName: "GraphQL Data Table Demo",
  description: "A data table demo connected to GraphQL",
  importPath: "./components/QueryDataTableDemo"
});

PLASMIC.registerComponent(CompactDataTableDemo, {
  name: "CompactDataTableDemo",
  displayName: "Compact Data Table Demo",
  description: "A compact data table demo",
  importPath: "./components/QueryDataTableDemo"
});

// Register the Modern Sidebar component
PLASMIC.registerComponent(Sidebar, {
  name: "Sidebar",
  displayName: "Modern Sidebar",
  description: "A modern, responsive sidebar component that transforms into bottom navigation on mobile with dark/light theme support",
  
  props: {
    logo: {
      type: "string",
      defaultValue: "Your App",
      displayName: "App Logo Text",
      description: "The text to display as the app logo/name",
    },
    logoUrl: {
      type: "string",
      defaultValue: "/favicon.ico",
      displayName: "Logo Image URL",
      description: "URL for the logo image",
    },
    navigationItems: {
      type: "object",
      defaultValue: [
        { label: "Dashboard", icon: "home", href: "/dashboard", active: true },
        { label: "Analytics", icon: "chart-bar", href: "/analytics" },
        { label: "Projects", icon: "folder", href: "/projects" },
        { label: "Team", icon: "users", href: "/team" },
        { label: "Settings", icon: "cog", href: "/settings" },
      ],
      displayName: "Navigation Items",
      description: "Array of navigation items with label, icon, href, and optional active/badge properties",
      advanced: true,
    },
    bottomItems: {
      type: "object",
      defaultValue: [
        { label: "Help", icon: "question-circle", href: "/help" },
        { label: "Support", icon: "chat", href: "/support" },
      ],
      displayName: "Bottom Navigation Items",
      description: "Array of items to display at the bottom of the sidebar",
      advanced: true,
    },
    showThemeToggle: {
      type: "boolean",
      defaultValue: true,
      displayName: "Show Theme Toggle",
      description: "Whether to show the dark/light theme toggle button",
    },
    showUserProfile: {
      type: "boolean",
      defaultValue: true,
      displayName: "Show User Profile",
      description: "Whether to show the user profile section (requires AuthContext)",
    },
    onNavigate: {
      type: "eventHandler",
      displayName: "On Navigate",
      description: "Custom function to handle navigation events",
      argTypes: [
        {
          name: "item",
          type: "object",
          description: "The navigation item that was clicked",
        },
      ],
    },
    className: {
      type: "string",
      defaultValue: "",
      displayName: "CSS Classes",
      description: "Additional CSS classes to apply to the sidebar",
      advanced: true,
    },
    style: {
      type: "object",
      defaultValue: {},
      displayName: "Custom Styles",
      description: "Inline styles to apply to the sidebar",
      advanced: true,
    },
  },
  
  importPath: "./components/Sidebar",
});

// Register demo components for reference
PLASMIC.registerComponent(SidebarDemo, {
  name: "SidebarDemo",
  displayName: "Sidebar Demo",
  description: "A complete demo showing how to use the Sidebar component",
  importPath: "./components/SidebarDemo",
});

PLASMIC.registerComponent(MinimalSidebar, {
  name: "MinimalSidebar",
  displayName: "Minimal Sidebar",
  description: "A minimal sidebar configuration example",
  importPath: "./components/SidebarDemo",
});

PLASMIC.registerComponent(DarkSidebar, {
  name: "DarkSidebar",
  displayName: "Dark Sidebar",
  description: "A dark theme sidebar example",
  importPath: "./components/SidebarDemo",
});
