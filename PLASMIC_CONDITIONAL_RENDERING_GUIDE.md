# How to Set Up Conditional Rendering in Plasmic Studio

You're correct - conditional rendering in Plasmic Studio is not done through props, but through Plasmic's built-in conditional rendering feature. Here's exactly how to do it:

## Step-by-Step Guide

### 1. Add Your Components to the Canvas

1. **Add a Container** (or any wrapper element)
2. **Add PlasmicSkeleton** inside the container
3. **Add your actual content component** (like PrimeDataTable) inside the same container

### 2. Set Up Conditional Rendering

#### For the Skeleton Component:

1. **Select the PlasmicSkeleton component** on the canvas
2. **In the right panel, find "Conditional Rendering"** section
3. **Click "Add Condition"**
4. **Set the condition to:** `loading === true`
   - You can use any variable that tracks your loading state
   - Common variables: `loading`, `isLoading`, `dataLoading`, etc.

#### For Your Content Component:

1. **Select your content component** (PrimeDataTable, etc.)
2. **In the right panel, find "Conditional Rendering"** section  
3. **Click "Add Condition"**
4. **Set the condition to:** `loading === false && data !== null`
   - This ensures content only shows when loading is complete AND data exists

### 3. Connect to Data Source

#### Option A: Using GraphQL Query
1. **Add a GraphQL query** in Plasmic Studio
2. **The query automatically provides loading states** like:
   - `$queries.yourQueryName.loading`
   - `$queries.yourQueryName.data`
3. **Use these in your conditions:**
   - Skeleton: `$queries.yourQueryName.loading === true`
   - Content: `$queries.yourQueryName.loading === false && $queries.yourQueryName.data !== null`

#### Option B: Using Data Context
1. **Set up a data context** with your loading state
2. **Use the context variable** in conditions:
   - Skeleton: `$ctx.loading === true`
   - Content: `$ctx.loading === false && $ctx.data !== null`

### 4. Visual Setup in Plasmic Studio

```
┌─────────────────────────────────────────┐
│ Container (no conditions)               │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ PlasmicSkeleton                    │ │ ← Condition: loading === true
│ │ pattern: "table"                   │ │
│ │ tableRows: 5                       │ │
│ │ tableColumns: 4                    │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ PrimeDataTable                     │ │ ← Condition: loading === false && data !== null
│ │ data: $queries.myQuery.data        │ │
│ │ columns: [...]                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Common Condition Patterns

### Basic Loading States
```javascript
// Show skeleton while loading
loading === true

// Show content when loaded
loading === false && data !== null

// Show error when failed
loading === false && error !== null
```

### GraphQL Query States
```javascript
// Show skeleton while GraphQL query is loading
$queries.myQuery.loading === true

// Show content when GraphQL data is ready
$queries.myQuery.loading === false && $queries.myQuery.data !== null

// Show error when GraphQL query fails
$queries.myQuery.loading === false && $queries.myQuery.error !== null
```

### Data Context States
```javascript
// Show skeleton while data context is loading
$ctx.isLoading === true

// Show content when data context is ready
$ctx.isLoading === false && $ctx.data !== null
```

## Setting Up the Loading State Variable

### Method 1: Using GraphQL Query (Recommended)
1. **Add a GraphQL query** in Plasmic Studio
2. **The query automatically provides:**
   - `$queries.queryName.loading` - boolean
   - `$queries.queryName.data` - your data
   - `$queries.queryName.error` - any errors

### Method 2: Using Data Context
1. **Create a data context** in your component
2. **Set up the context** with loading state:
   ```javascript
   // In your component
   const [loading, setLoading] = useState(true);
   const [data, setData] = useState(null);
   
   // Pass to Plasmic via data context
   <DataProvider name="loadingState" data={{ loading, data }}>
     <YourPlasmicComponent />
   </DataProvider>
   ```
3. **Use in conditions:**
   - `$ctx.loadingState.loading === true`
   - `$ctx.loadingState.data !== null`

### Method 3: Using Custom Code Component
1. **Create a custom component** that manages loading state
2. **Pass loading state as props** to Plasmic components
3. **Use in conditions:**
   - `$props.loading === true`
   - `$props.data !== null`

## Complete Example Setup

### 1. In Plasmic Studio Canvas:
```
Container
├── PlasmicSkeleton (Condition: loading === true)
└── PrimeDataTable (Condition: loading === false && data !== null)
```

### 2. In Plasmic Studio Data:
- **GraphQL Query:** `getUsers`
- **Query Variables:** `{ limit: 10 }`

### 3. In Plasmic Studio Conditions:
- **Skeleton Condition:** `$queries.getUsers.loading === true`
- **Table Condition:** `$queries.getUsers.loading === false && $queries.getUsers.data !== null`

## Troubleshooting

### Condition Not Working
- **Check variable names:** Make sure the variable exists in your data source
- **Check syntax:** Use `===` not `==`, proper boolean values
- **Check data source:** Ensure your GraphQL query or data context is properly set up

### Skeleton Not Showing
- **Check condition:** Make sure the loading condition is correct
- **Check data source:** Ensure the loading state is actually `true`
- **Check component visibility:** Make sure the skeleton component isn't hidden

### Content Not Showing
- **Check condition:** Make sure the content condition is correct
- **Check data:** Ensure data exists and is not null
- **Check data binding:** Make sure data is properly bound to your component

## Pro Tips

1. **Use descriptive variable names:** `isDataLoading` instead of just `loading`
2. **Test conditions:** Use Plasmic's preview mode to test different states
3. **Add error states:** Always handle error cases with appropriate UI
4. **Use multiple conditions:** You can have more than two states (loading, loaded, error, empty)
5. **Group related components:** Put skeleton and content in the same container for easier management

This is the correct way to implement conditional rendering in Plasmic Studio - through the UI interface, not through component props!
