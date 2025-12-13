'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MultiSelect } from 'primereact/multiselect';

/**
 * PrimeMultiSelect - A Plasmic Studio compatible wrapper for PrimeReact MultiSelect
 * Exposes all PrimeReact MultiSelect features as props for use in Plasmic Studio
 * 
 * @see https://primereact.org/multiselect/
 */
const PrimeMultiSelect = ({
  // Core props
  value,
  onChange,
  options = [],
  optionLabel = undefined, // Auto-detect: undefined for primitives, "label" for objects
  optionValue = undefined, // Auto-detect: undefined for primitives, "value" for objects
  optionDisabled,
  optionGroupLabel = "label",
  optionGroupChildren = "items",
  
  // Display props
  display = "comma",
  placeholder = "Select Items",
  maxSelectedLabels = 3,
  selectedItemsLabel = "{0} items selected",
  
  // Filter props
  filter = false,
  filterBy = undefined,
  filterMatchMode = "contains",
  filterPlaceholder = "Search...",
  filterLocale = undefined,
  
  // Selection props
  selectionLimit = null,
  showSelectAll = false,
  selectAll = false,
  onSelectAll,
  
  // Virtual scroll props
  virtualScrollerOptions = undefined,
  scrollHeight = "200px",
  
  // Templates
  itemTemplate = undefined,
  selectedItemTemplate = undefined,
  optionGroupTemplate = undefined,
  panelHeaderTemplate = undefined,
  panelFooterTemplate = undefined,
  emptyFilterMessage = "No results found",
  emptyMessage = "No available options",
  
  // State props
  disabled = false,
  loading = false,
  invalid = false,
  variant = "outlined",
  
  // Float label props (for use with FloatLabel wrapper)
  inputId = undefined,
  
  // Style props
  className = "",
  style = {},
  panelClassName = "",
  panelStyle = {},
  inputClassName = "",
  inputStyle = {},
  pt = undefined,
  unstyled = false,
  
  // Data source props (for Plasmic Studio)
  dataSource = "props", // "props" | "pageData" | "queryData" | "cmsData"
  dataPath = "",
  
  // Plasmic data context
  pageData,
  queryData,
  cmsData,
  
  // Event handlers
  onShow,
  onHide,
  onFilter,
  onFocus,
  onBlur,
  
  // Accessibility props
  ariaLabelledBy = undefined,
  ariaLabel = undefined,
  filterInputProps = undefined,
  closeButtonProps = undefined,
  
  ...restProps
}) => {
  // Get options from data source if configured
  const resolvedOptions = useMemo(() => {
    // If using dataSource with dataPath, try to extract from that
    if (dataSource !== "props" && dataPath) {
      let sourceData;
      switch (dataSource) {
        case "pageData":
          sourceData = pageData;
          break;
        case "queryData":
          sourceData = queryData;
          break;
        case "cmsData":
          sourceData = cmsData;
          break;
        default:
          break;
      }
      
      if (sourceData) {
        // Navigate through data path (e.g., "categories.items")
        const pathParts = dataPath.split('.');
        let result = sourceData;
        
        for (const part of pathParts) {
          if (result && typeof result === 'object' && part in result) {
            result = result[part];
          } else {
            result = null;
            break;
          }
        }
        
        if (Array.isArray(result)) {
          return result;
        }
      }
    }
    
    // Use options directly - ensure it's an array
    if (Array.isArray(options)) {
      return options;
    }
    
    // Fallback to empty array if options is not valid
    return [];
  }, [dataSource, dataPath, options, pageData, queryData, cmsData]);
  
  // Internal state management if value is not controlled
  const [internalValue, setInternalValue] = useState(value || []);
  
  // Sync internal state with prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);
  
  // Handle change event
  const handleChange = (e) => {
    const newValue = e.value;
    
    // Update internal state if uncontrolled
    if (value === undefined) {
      setInternalValue(newValue);
    }
    
    // Call onChange handler
    if (onChange) {
      onChange({
        value: newValue,
        originalEvent: e.originalEvent,
        target: e.target
      });
    }
  };
  
  // Handle select all event
  const handleSelectAll = (e) => {
    if (onSelectAll) {
      onSelectAll({
        checked: e.checked,
        originalEvent: e.originalEvent
      });
    }
  };
  
  // Determine controlled vs uncontrolled
  const controlledValue = value !== undefined ? value : internalValue;
  
  // Auto-detect if options are primitives (strings/numbers) or objects
  // If options are primitives, don't pass optionLabel/optionValue
  const hasPrimitiveOptions = useMemo(() => {
    if (!resolvedOptions || resolvedOptions.length === 0) return false;
    const firstItem = resolvedOptions[0];
    return typeof firstItem === 'string' || typeof firstItem === 'number';
  }, [resolvedOptions]);
  
  // Normalize optionLabel and optionValue - treat empty strings, "unset", null as undefined
  const normalizedOptionLabel = (optionLabel && 
    optionLabel !== "unset" && 
    optionLabel !== "" &&
    (typeof optionLabel !== 'string' || optionLabel.trim() !== ""))
    ? optionLabel 
    : undefined;
  
  const normalizedOptionValue = (optionValue && 
    optionValue !== "unset" && 
    optionValue !== "" &&
    (typeof optionValue !== 'string' || optionValue.trim() !== ""))
    ? optionValue 
    : undefined;
  
  // Determine optionLabel and optionValue
  // If explicitly provided (and not empty), use them; otherwise auto-detect
  const finalOptionLabel = normalizedOptionLabel !== undefined
    ? normalizedOptionLabel
    : (hasPrimitiveOptions ? undefined : "label");
  
  const finalOptionValue = normalizedOptionValue !== undefined
    ? normalizedOptionValue
    : (hasPrimitiveOptions ? undefined : "value");
  
  // Debug logging (can be removed in production)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PrimeMultiSelect] Options:', resolvedOptions);
      console.log('[PrimeMultiSelect] Has primitive options:', hasPrimitiveOptions);
      console.log('[PrimeMultiSelect] Final optionLabel:', finalOptionLabel);
      console.log('[PrimeMultiSelect] Final optionValue:', finalOptionValue);
    }
  }, [resolvedOptions, hasPrimitiveOptions, finalOptionLabel, finalOptionValue]);
  
  // Build props object for PrimeReact MultiSelect
  const multiSelectProps = {
    value: controlledValue,
    onChange: handleChange,
    options: resolvedOptions,
    ...(finalOptionLabel !== undefined && { optionLabel: finalOptionLabel }),
    ...(finalOptionValue !== undefined && { optionValue: finalOptionValue }),
    ...(optionDisabled !== undefined && { optionDisabled }),
    ...(optionGroupLabel !== undefined && { optionGroupLabel }),
    ...(optionGroupChildren !== undefined && { optionGroupChildren }),
    display,
    placeholder,
    maxSelectedLabels,
    selectedItemsLabel,
    filter,
    filterBy,
    filterMatchMode,
    filterPlaceholder,
    filterLocale,
    selectionLimit,
    showSelectAll,
    selectAll,
    onSelectAll: showSelectAll ? handleSelectAll : undefined,
    virtualScrollerOptions,
    scrollHeight,
    itemTemplate,
    selectedItemTemplate,
    optionGroupTemplate,
    panelHeaderTemplate,
    panelFooterTemplate,
    emptyFilterMessage,
    emptyMessage,
    disabled,
    loading,
    invalid,
    variant,
    inputId,
    className,
    style,
    panelClassName,
    panelStyle,
    inputClassName,
    inputStyle,
    pt,
    unstyled,
    onShow,
    onHide,
    onFilter,
    onFocus,
    onBlur,
    ariaLabelledBy,
    ariaLabel,
    filterInputProps,
    closeButtonProps,
    ...restProps
  };
  
  // Remove undefined props to avoid warnings
  Object.keys(multiSelectProps).forEach(key => {
    if (multiSelectProps[key] === undefined) {
      delete multiSelectProps[key];
    }
  });
  
  return <MultiSelect {...multiSelectProps} />;
};

export default PrimeMultiSelect;

