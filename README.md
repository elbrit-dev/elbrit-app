# PrimeDataTable - Advanced React Data Table Component

This is a comprehensive data table component built with PrimeReact, featuring advanced functionality including expandable rows, pivot tables, auto-merge, column grouping, and CMS integration.

## Features

### 🚀 Core Features
- **Expandable Rows** - Click to expand rows with custom content templates
- **Pivot Tables** - Excel-like pivot functionality with drag-and-drop configuration
- **Auto-Merge** - Automatic data merging for complex data structures
- **Column Grouping** - Intelligent column organization with custom grouping
- **Advanced Filtering** - Multiple filter types (dropdown, date, number, boolean)
- **CMS Integration** - Direct Plasmic CMS integration for configuration persistence

### 📊 Expandable Table Feature
The expandable table feature allows users to click on rows to reveal additional information:

```jsx
<PrimeDataTable
  data={employeeData}
  enableRowExpansion={true}
  rowExpansionTemplate={(data) => (
    <div className="p-4">
      <h5>Details for {data.name}</h5>
      <p>Skills: {data.skills.join(', ')}</p>
      <p>Projects: {data.projects.join(', ')}</p>
    </div>
  )}
  expandedRows={expandedRows}
  onRowToggle={(e) => setExpandedRows(e.data)}
/>
```

**Props:**
- `enableRowExpansion` - Enable/disable row expansion
- `rowExpansionTemplate` - Custom template for expanded content
- `expandedRows` - Control which rows are expanded
- `onRowToggle` - Callback when rows are expanded/collapsed

### 🔄 Nested Expandable Tables
For hierarchical data like Customer → Invoice → Brand, you can create nested expandable tables:

```jsx
// Customer level expansion (shows invoices)
const customerExpansionTemplate = (customerData) => (
  <div className="p-4">
    <h5>Invoices for {customerData.Customer}</h5>
    <PrimeDataTable
      data={customerData.invoices}
      enableRowExpansion={true}
      rowExpansionTemplate={invoiceExpansionTemplate} // Invoice level
      // ... other props
    />
  </div>
);

// Invoice level expansion (shows brands)
const invoiceExpansionTemplate = (invoiceData) => (
  <div className="p-4">
    <h6>Brands for {invoiceData.Invoice}</h6>
    <PrimeDataTable
      data={invoiceData.brands}
      // ... other props
    />
  </div>
);
```

**Data Structure Required:**
```json
[
  {
    "Customer": "AADITYA PHARMEX",
    "EBSCode": "EBS042",
    "invoices": [
      {
        "Invoice": "INV-25-10451",
        "brands": [
          {
            "Brand": "PAINFREE",
            "Incentive": 1200
          }
        ]
      }
    ]
  }
]
```

### 🔧 Configuration
- **Filter Types**: Dropdown, date picker, number, text, boolean
- **Pagination**: Configurable page sizes and navigation
- **Sorting**: Single and multiple column sorting
- **Export**: CSV, Excel, PDF export options
- **Responsive**: Mobile-friendly design with responsive columns

## Examples

Check out the examples directory for complete implementations:
- `examples/ExpandableTableExample.jsx` - Expandable table with custom templates
- `examples/PivotTableExample.jsx` - Pivot table functionality
- `examples/ColumnGroupingExample.js` - Column grouping and organization

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open your browser to see the result.

You can start editing your project in Plasmic Studio. The page auto-updates as you edit the project.

## Learn More

With Plasmic, you can enable non-developers on your team to publish pages and content into your website or app.

To learn more about Plasmic, take a look at the following resources:

- [Plasmic Website](https://www.plasmic.app/)
- [Plasmic Documentation](https://docs.plasmic.app/learn/)
- [Plasmic Community Forum](https://forum.plasmic.app/)

You can check out [the Plasmic GitHub repository](https://github.com/plasmicapp/plasmic) - your feedback and contributions are welcome!

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open your browser to see the result.

You can start editing your project in Plasmic Studio. The page auto-updates as you edit the project.

## Learn More

With Plasmic, you can enable non-developers on your team to publish pages and content into your website or app.

To learn more about Plasmic, take a look at the following resources:

- [Plasmic Website](https://www.plasmic.app/)
- [Plasmic Documentation](https://docs.plasmic.app/learn/)
- [Plasmic Community Forum](https://forum.plasmic.app/)

You can check out [the Plasmic GitHub repository](https://github.com/plasmicapp/plasmic) - your feedback and contributions are welcome!
