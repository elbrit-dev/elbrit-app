# MaterialDataTable - Inline Expand Icon Feature

## ✨ New Feature: Inline Expand Icon

The MaterialDataTable now supports **two styles** for the expand/collapse icon:

### 1. **Inline Icon** (Like your design) ✅ RECOMMENDED
```
Sale Team
─────────────────────
Elbrit Rajasthan    +
CND Chennai         +
Aura & Proxima      +
```

### 2. **Left Icon** (Traditional)
```
  │ Sale Team
──┼───────────────────
▶ │ Elbrit Rajasthan
▶ │ CND Chennai
▶ │ Aura & Proxima
```

## 🎨 Visual Comparison

### Inline Icon (Your Design)
```
┌─────────────────────────────────────────────┐
│ Sales Team Performance    [Search...] [📥] │
├──────────────────┬───────────┬──────────────┤
│ Sales Team       │ Target    │ Gross Sales  │
├──────────────────┼───────────┼──────────────┤
│ Elbrit Rajasthan       +  │ 0.00 │ $840,517.74 │  ← Icon inline
│ CND Chennai            +  │ 0.00 │ $762,754.14 │
│ Aura & Proxima +       +  │ 0.00 │ $524,123.45 │
└──────────────────┴───────────┴──────────────┘
```

### When Expanded (Inline)
```
┌──────────────────────────────────────────────┐
│ Elbrit Rajasthan       ×  │ 0.00 │ $840,517.74│  ← × icon when expanded
│ └────────────────────────────────────────────┐
│   │ Details (3 HQs)                          │
│   ├────────────────┬──────┬──────────────┬───┤
│   │ HQ             │ Type │ Gross Sales  │...│
│   ├────────────────┼──────┼──────────────┼───┤
│   │ HQ-Coimbatore  │ HQ   │ $216,859.02  │...│
│   │ HQ-Erode       │ HQ   │ $468,383.30  │...│
│   └────────────────┴──────┴──────────────┴───┘
│ CND Chennai            +  │ 0.00 │ $762,754.14│
└──────────────────────────────────────────────┘
```

## 💻 How to Use

### Quick Usage (Inline Icon)
```jsx
<MaterialDataTable
  data={yourSalesData}
  expandable
  nestedKey="HQs"
  expandIconPosition="inline"  // ← This is the magic!
  title="Sales Team Performance"
/>
```

### Traditional Left Icon
```jsx
<MaterialDataTable
  data={yourSalesData}
  expandable
  nestedKey="HQs"
  expandIconPosition="left"  // ← Traditional separate column
  title="Sales Team Performance"
/>
```

## 🎯 Icon Behavior

### Inline Icon States

**Collapsed** (Default):
- Icon: `>` (right-pointing arrow)
- Position: Right side of the first column text
- Color: Blue (#1976d2)
- Hover: Light blue background

**Expanded**:
- Icon: `×` (close/X icon)  
- Position: Same position, right side
- Rotation: Rotates 45° for smooth animation
- Color: Blue (#1976d2)
- Hover: Light blue background

## 🎨 Styling

The inline icon automatically:
- ✅ Aligns with your text
- ✅ Uses proper spacing (0.5rem gap)
- ✅ Smooth rotation animation (0.2s ease)
- ✅ Hover effect for better UX
- ✅ Responsive sizing (scales with font)
- ✅ Accessible click target (minimum 2.5rem)

## 📱 Responsive Design

Works perfectly on all screen sizes:

**Desktop**: Full icon with smooth hover
**Tablet**: Optimized touch target
**Mobile**: Easy-to-tap button

## 🔧 Complete Example

```jsx
import MaterialDataTable from './components/MaterialDataTable';

const SalesTeamTable = ({ data }) => {
  const columns = [
    { 
      key: 'SalesTeam', 
      title: 'Sales Team',
      sortable: true,
      filterable: true 
    },
    { 
      key: 'GrossSales', 
      title: 'Gross Sales',
      align: 'right',
      render: (value) => `$${value.toLocaleString()}`
    },
    { 
      key: 'NetSales', 
      title: 'Net Sales',
      align: 'right',
      render: (value) => `$${value.toLocaleString()}`
    },
  ];

  return (
    <MaterialDataTable
      data={data}
      columns={columns}
      expandable
      nestedKey="HQs"
      expandIconPosition="inline"  // ← Clean inline design
      title="Sales Team Performance"
      showFilters
      pagination
    />
  );
};
```

## 🎯 In Plasmic Studio

1. Drag **"Material-UI Data Table"** onto canvas
2. Set these props:
   - `data`: Your sales data source
   - `expandable`: ✓ true
   - `nestedKey`: "HQs"
   - **`expandIconPosition`: "inline"** ← KEY SETTING
   - `title`: "Sales Team Performance"
   - `showFilters`: ✓ true
   - `pagination`: ✓ true

## ✨ Benefits of Inline Icon

### Compared to Left Icon:
- ✅ **Saves space** - No extra column
- ✅ **Cleaner look** - More like your design
- ✅ **Better UX** - Icon next to the item name
- ✅ **Modern design** - Follows current UI trends
- ✅ **More content space** - Full width for data

### Visual Space Comparison:
```
Left Icon:     [▶] | Sales Team Name | Data | Data | Data
                ↑
              Wasted
              space

Inline Icon:   Sales Team Name [+] | Data | Data | Data
                                ↑
                           Space used
                           efficiently
```

## 🎨 Icon Customization

The inline icon:
- **Size**: Scales with your font size (rem-based)
- **Color**: Material-UI primary blue (#1976d2)
- **Hover**: Subtle blue background (rgba(25, 118, 210, 0.08))
- **Animation**: Smooth 0.2s rotation
- **Touch**: Minimum 2.5rem × 2.5rem for accessibility

## 📊 Real-World Example

Your sales data:
```javascript
[
  {
    SalesTeam: "Elbrit Rajasthan",
    GrossSales: 840517.74,
    HQs: [...]  // ← Nested data
  },
  {
    SalesTeam: "CND Chennai",
    GrossSales: 762754.14,
    HQs: [...]
  }
]
```

Will render as:
```
┌────────────────────────────────────────┐
│ Sales Team Performance                │
├──────────────────────┬─────────────────┤
│ Sales Team           │ Gross Sales     │
├──────────────────────┼─────────────────┤
│ Elbrit Rajasthan  +  │   $840,517.74   │  ← Click + to expand
│ CND Chennai       +  │   $762,754.14   │
│ Aura & Proxima +  +  │   $524,123.45   │
└──────────────────────┴─────────────────┘
```

## 🚀 Try It Now!

1. Set `expandIconPosition="inline"` in your MaterialDataTable
2. Your table will instantly match the design you showed!
3. Click the `+` icon to expand/collapse
4. Enjoy the clean, modern look! 🎉

## 🎭 Default Behavior

**Default value**: `"left"` (for backward compatibility)
**Recommended**: Use `"inline"` for modern, space-efficient design

To make inline the default in Plasmic, the registration has been updated with `defaultValue: "inline"`.

## 📝 Summary

✅ **Added**: `expandIconPosition` prop
✅ **Options**: `"left"` or `"inline"`
✅ **Default in Plasmic**: `"inline"`
✅ **Icons**: `+` when collapsed, `×` when expanded
✅ **Position**: Right side of first column text
✅ **Animation**: Smooth rotation
✅ **UX**: Better space usage and modern look

**Your design is now supported!** 🎉

