# PrimeMultiSelect Component

A Plasmic Studio compatible wrapper for PrimeReact's MultiSelect component. This component exposes all PrimeReact MultiSelect features as props, making it fully customizable within Plasmic Studio.

## Features

- ✅ **All PrimeReact MultiSelect Features**: Every feature from PrimeReact MultiSelect is exposed as a prop
- ✅ **Plasmic Studio Compatible**: Fully integrated with Plasmic Studio's visual editor
- ✅ **Data Source Support**: Can read options from props, pageData, queryData, or cmsData
- ✅ **Event Handlers**: All events are exposed for use in Plasmic Studio interactions
- ✅ **Styling**: Full control over styling via className, style, and variant props
- ✅ **Accessibility**: Built-in accessibility support with ARIA props

## Basic Usage in Plasmic Studio

1. Drag the "MultiSelect (PrimeReact)" component onto your canvas
2. Configure the `options` prop with your data array
3. Set `optionLabel` and `optionValue` to specify which fields to use
4. Connect the `onChange` event handler to update state or trigger actions

## Props Reference

### Core Props

- **value** (array): Selected value(s)
- **onChange** (eventHandler): Callback when selection changes
- **options** (array): Array of objects to display as available options
- **optionLabel** (string): Property name to use as the label (default: "label")
- **optionValue** (string): Property name to use as the value (default: "value")

### Display Props

- **display** (choice): How selected items are displayed - "comma" or "chip" (default: "comma")
- **placeholder** (string): Placeholder text when no option is selected
- **maxSelectedLabels** (number): Max number of selected item labels to show (default: 3)
- **selectedItemsLabel** (string): Label when exceeding maxSelectedLabels (default: "{0} items selected")

### Filter Props

- **filter** (boolean): Enable filter input at header (default: false)
- **filterBy** (string): Fields used when filtering
- **filterMatchMode** (choice): How items are filtered - "contains", "startsWith", "endsWith", etc. (default: "contains")
- **filterPlaceholder** (string): Placeholder for filter input (default: "Search...")

### Selection Props

- **selectionLimit** (number): Maximum number of selectable items
- **showSelectAll** (boolean): Show header checkbox to toggle all items (default: false)
- **selectAll** (boolean): Whether all data is selected (default: false)

### State Props

- **disabled** (boolean): Disable the component (default: false)
- **loading** (boolean): Show loading indicator (default: false)
- **invalid** (boolean): Invalid state style (default: false)
- **variant** (choice): Input variant - "outlined" or "filled" (default: "outlined")

### Data Source Props (Plasmic Studio)

- **dataSource** (choice): Where to read options from - "props", "pageData", "queryData", or "cmsData" (default: "props")
- **dataPath** (string): Path to options within the selected data source (e.g., "categories.items")

### Event Handlers

- **onChange**: Fired when selection changes
- **onSelectAll**: Fired when select all is toggled
- **onShow**: Fired when overlay panel becomes visible
- **onHide**: Fired when overlay panel becomes hidden
- **onFilter**: Fired when filtering
- **onFocus**: Fired when component receives focus
- **onBlur**: Fired when component loses focus

### Style Props

- **className** (string): Style class of the component
- **style** (object): Inline style of the component
- **panelClassName** (string): Style class of the overlay panel
- **panelStyle** (object): Inline style of the overlay panel
- **inputClassName** (string): Style class of the input field
- **inputStyle** (object): Inline style of the input field

### Accessibility Props

- **ariaLabelledBy** (string): Element ID(s) that label the component
- **ariaLabel** (string): String that labels the component
- **inputId** (string): Identifier of the underlying input element

## Example Usage

### Basic Example

```jsx
<PrimeMultiSelect
  options={[
    { label: "New York", value: "NY" },
    { label: "Rome", value: "RM" },
    { label: "London", value: "LDN" },
    { label: "Istanbul", value: "IST" },
    { label: "Paris", value: "PRS" }
  ]}
  optionLabel="label"
  optionValue="value"
  placeholder="Select Cities"
  maxSelectedLabels={3}
  onChange={(e) => console.log("Selected:", e.value)}
/>
```

### With Filtering

```jsx
<PrimeMultiSelect
  options={cities}
  optionLabel="name"
  filter
  filterPlaceholder="Search cities..."
  placeholder="Select Cities"
  display="chip"
/>
```

### With Grouped Options

```jsx
<PrimeMultiSelect
  options={groupedCities}
  optionLabel="label"
  optionGroupLabel="label"
  optionGroupChildren="items"
  placeholder="Select Cities"
  display="chip"
/>
```

### Reading from Plasmic Data

```jsx
<PrimeMultiSelect
  dataSource="queryData"
  dataPath="cities"
  optionLabel="name"
  optionValue="id"
  placeholder="Select Cities"
  onChange={(e) => updateSelection(e.value)}
/>
```

## Advanced Features

### Virtual Scrolling

For large lists (100K+ records), use virtual scrolling:

```jsx
<PrimeMultiSelect
  options={largeDataSet}
  virtualScrollerOptions={{ itemSize: 43 }}
  scrollHeight="400px"
/>
```

### Select All Feature

```jsx
<PrimeMultiSelect
  options={options}
  showSelectAll
  selectAll={allSelected}
  onSelectAll={(e) => setAllSelected(e.checked)}
/>
```

### Custom Styling

```jsx
<PrimeMultiSelect
  options={options}
  variant="filled"
  className="custom-multiselect"
  panelClassName="custom-panel"
  style={{ width: "100%" }}
/>
```

## Notes

- **Templates**: Advanced template props (itemTemplate, selectedItemTemplate, etc.) are available in the component but require code customization. They cannot be visually configured in Plasmic Studio.

- **Controlled vs Uncontrolled**: The component works in both controlled (with `value` prop) and uncontrolled (without `value` prop) modes.

- **Data Source Integration**: When using `dataSource` other than "props", ensure the data structure matches the expected format in `dataPath`.

## PrimeReact Documentation

For more details on PrimeReact MultiSelect features, visit:
https://primereact.org/multiselect/

