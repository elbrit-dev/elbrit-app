# Plasmic Interface Configuration Examples

This document shows exactly how to configure the PrimeDataTable pivot table props in the Plasmic interface.

## Plasmic Right Panel - Pivot Table Props Section

When you select the PrimeDataTable component in Plasmic, you'll see these fields in the right panel:

```
┌─────────────────────────────────────────┐
│ PrimeDataTable Properties               │
├─────────────────────────────────────────┤
│ ... (other existing props)              │
├─────────────────────────────────────────┤
│ ▼ Pivot Table Props                     │
│                                         │
│ □ enablePivotTable                      │
│   Enable Excel-like pivot table        │
│   functionality                         │
│                                         │
│ pivotRows                   [ + ]       │
│ Array of field names to use as row      │
│ grouping (like Excel's 'Rows' area)     │
│ Example: ['drName', 'salesTeam']        │
│                                         │
│ pivotColumns               [ + ]        │
│ Array of field names to use as column   │
│ headers (like Excel's 'Columns' area)   │
│ Example: ['date', 'category']           │
│                                         │
│ pivotValues                [ + ]        │
│ Array of value configuration objects    │
│ with field and aggregation              │
│                                         │
│ pivotFilters               [ + ]        │
│ Array of field names to use as pivot    │
│ filters (like Excel's 'Filters' area)   │
│                                         │
│ ☑ pivotShowGrandTotals                  │
│   Show grand total row in pivot table   │
│                                         │
│ ☑ pivotShowRowTotals                    │
│   Show row totals column in pivot table │
│                                         │
│ ☑ pivotShowColumnTotals                 │
│   Show column totals in pivot table     │
│                                         │
│ ☑ pivotShowSubTotals                    │
│   Show subtotals in pivot table         │
│                                         │
│ pivotNumberFormat          [en-US  ▼]   │
│ Number format locale for pivot table    │
│                                         │
│ pivotCurrency              [USD    ▼]   │
│ Currency code for pivot table           │
│ formatting                              │
│                                         │
│ pivotPrecision             [2      ]    │
│ Number of decimal places for pivot      │
│ table numbers                           │
│                                         │
│ pivotFieldSeparator        [__     ]    │
│ Separator for parsing complex field     │
│ names like '2025-04-01__serviceAmount'  │
│                                         │
│ ☑ pivotSortRows                         │
│   Sort row values in pivot table        │
│                                         │
│ ☑ pivotSortColumns                      │
│   Sort column values in pivot table     │
│                                         │
│ pivotSortDirection         [asc    ▼]   │
│ Sort direction for pivot table          │
│                                         │
│ pivotAggregationFunctions  [{}     ]    │
│ Custom aggregation functions for        │
│ pivot table                             │
└─────────────────────────────────────────┘
```

## Step-by-Step Configuration Examples

### Example 1: Basic Sales Pivot

**Step 1: Enable Pivot Table**
```
✓ enablePivotTable: true
```

**Step 2: Configure Row Grouping**
Click on `pivotRows` → Add Array Items:
```json
[
  "salesTeam",
  "drName"
]
```

**Step 3: Configure Column Pivoting**  
Click on `pivotColumns` → Add Array Items:
```json
[
  "date"
]
```

**Step 4: Configure Values**
Click on `pivotValues` → Add Array Items:
```json
[
  {
    "field": "serviceAmount",
    "aggregation": "sum"
  },
  {
    "field": "supportValue", 
    "aggregation": "sum"
  }
]
```

**Step 5: Configure Display Options**
```
✓ pivotShowGrandTotals: true
✓ pivotShowRowTotals: true
✓ pivotShowColumnTotals: true
```

**Step 6: Configure Formatting**
```
pivotCurrency: "USD"
pivotPrecision: 0
pivotNumberFormat: "en-US"
```

### Example 2: Complex Field Names (Your Data Structure)

For data with fields like `"2025-04-01__serviceAmount"`:

**Step 1: Enable Pivot Table**
```
✓ enablePivotTable: true
```

**Step 2: Set Field Separator**
```
pivotFieldSeparator: "__"
```

**Step 3: Configure for Complex Fields**
Since your data is already pivoted in a way, you might want to:

**Option A: Use as regular table with grouping**
```
✗ enablePivotTable: false
✓ enableColumnGrouping: true
✓ enableAutoColumnGrouping: true
```

**Option B: Transform data first, then pivot**
Transform your data structure first, then use pivot table:
```json
// Transformed data structure:
[
  {
    "drName": "Yuvaraj",
    "salesTeam": "Elbrit Coimbatore", 
    "date": "2025-04-01",
    "serviceAmount": 0,
    "supportValue": 16521
  },
  {
    "drName": "Yuvaraj",
    "salesTeam": "Elbrit Coimbatore",
    "date": "2025-04-02", 
    "serviceAmount": 2500,
    "supportValue": 18000
  }
]
```

Then configure pivot:
```json
pivotRows: ["drName", "salesTeam"]
pivotColumns: ["date"]
pivotValues: [
  {"field": "serviceAmount", "aggregation": "sum"},
  {"field": "supportValue", "aggregation": "sum"}
]
```

## Common Configuration Patterns

### Pattern 1: Summary Report (No Column Pivoting)
```
enablePivotTable: true
pivotRows: ["drName"]
pivotColumns: []  // Empty - no column pivoting
pivotValues: [
  {"field": "serviceAmount", "aggregation": "sum"},
  {"field": "serviceAmount", "aggregation": "count"}
]
```

### Pattern 2: Time-based Analysis
```
enablePivotTable: true
pivotRows: ["salesTeam"]
pivotColumns: ["month"]
pivotValues: [
  {"field": "revenue", "aggregation": "sum"}
]
```

### Pattern 3: Multi-dimensional Analysis  
```
enablePivotTable: true
pivotRows: ["region", "salesTeam"]
pivotColumns: ["quarter", "category"]
pivotValues: [
  {"field": "amount", "aggregation": "sum"},
  {"field": "deals", "aggregation": "count"}
]
```

## JSON Configuration Examples

For complex configurations, you can also paste JSON directly:

### pivotValues JSON Example:
```json
[
  {
    "field": "serviceAmount",
    "aggregation": "sum"
  },
  {
    "field": "serviceAmount", 
    "aggregation": "average"
  },
  {
    "field": "supportValue",
    "aggregation": "sum"
  },
  {
    "field": "cases",
    "aggregation": "count"
  }
]
```

### pivotRows JSON Example:
```json
[
  "drName",
  "salesTeam",
  "region"
]
```

### pivotColumns JSON Example:
```json
[
  "date",
  "category",
  "status"
]
```

## Validation and Error Handling

Plasmic will validate your configuration and show errors for:

- ❌ Invalid field names (not found in data)
- ❌ Invalid aggregation functions
- ❌ Malformed JSON in array/object fields
- ❌ Missing required fields

## Testing Your Configuration

1. **Preview Mode**: Use Plasmic's preview to see your pivot table
2. **Debug Info**: Enable debug mode to see pivot configuration details
3. **Data Validation**: Check the browser console for any data issues

## Integration with Other Props

Remember to also configure related props:

### Currency Formatting
```json
currencyColumns: ["serviceAmount", "supportValue", "totalRevenue"]
```

### Column Filtering (works with pivot results)
```json
numberFilterColumns: ["serviceAmount", "supportValue"]
```

### Export (works with pivot data)
```
✓ enableExport: true
exportFilename: "sales-pivot-report"
```

This interface makes it easy to create powerful pivot tables without writing any code! 