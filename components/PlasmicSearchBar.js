'use client';

import React, { useState, useCallback } from 'react';

/**
 * PlasmicSearchBar - A flexible search bar component for Plasmic
 * 
 * This component provides a search input with various styling options,
 * search functionality, and event handlers that can be configured
 * in Plasmic Studio.
 */
const PlasmicSearchBar = ({
  // Basic props
  placeholder = "Search...",
  value = "",
  disabled = false,
  readOnly = false,
  
  // Styling props
  size = "medium", // small, medium, large
  variant = "outlined", // outlined, filled, underlined
  borderRadius = "8px",
  width = "100%",
  height = "40px",
  
  // Colors
  backgroundColor = "#ffffff",
  borderColor = "#d1d5db",
  textColor = "#374151",
  placeholderColor = "#9ca3af",
  focusBorderColor = "#3b82f6",
  
  // Icons
  showSearchIcon = true,
  showClearIcon = true,
  searchIcon = "🔍",
  clearIcon = "✕",
  
  // Behavior
  debounceMs = 300,
  minLength = 0,
  maxLength = 1000,
  autoFocus = false,
  
  // Labels and accessibility
  label = "",
  helperText = "",
  errorText = "",
  ariaLabel = "",
  
  // CSS classes
  className = "",
  inputClassName = "",
  containerClassName = "",
  
  // Inline styles
  style = {},
  inputStyle = {},
  containerStyle = {},
  
  // Event handlers
  onSearch,
  onInputChange,
  onFocus,
  onBlur,
  onKeyPress,
  onClear,
  
  // Additional props
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [hasError, setHasError] = useState(!!errorText);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchValue) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (onSearch && searchValue.length >= minLength) {
            onSearch(searchValue);
          }
        }, debounceMs);
      };
    })(),
    [onSearch, debounceMs, minLength]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    // Check max length
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    setInternalValue(newValue);
    
    // Call input change handler
    if (onInputChange) {
      onInputChange(newValue);
    }
    
    // Trigger debounced search
    debouncedSearch(newValue);
  };

  // Handle clear
  const handleClear = () => {
    setInternalValue("");
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch("");
    }
  };

  // Handle focus
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (onKeyPress) {
      onKeyPress(e);
    }
    
    // Handle Enter key
    if (e.key === 'Enter' && onSearch) {
      onSearch(internalValue);
    }
  };

  // Size styles
  const sizeStyles = {
    small: {
      height: '32px',
      fontSize: '14px',
      padding: '6px 12px'
    },
    medium: {
      height: '40px',
      fontSize: '16px',
      padding: '8px 16px'
    },
    large: {
      height: '48px',
      fontSize: '18px',
      padding: '12px 20px'
    }
  };

  // Variant styles
  const variantStyles = {
    outlined: {
      border: `1px solid ${isFocused ? focusBorderColor : borderColor}`,
      backgroundColor: backgroundColor,
      borderRadius: borderRadius
    },
    filled: {
      border: 'none',
      backgroundColor: isFocused ? '#f8fafc' : '#f1f5f9',
      borderRadius: borderRadius
    },
    underlined: {
      border: 'none',
      borderBottom: `2px solid ${isFocused ? focusBorderColor : borderColor}`,
      backgroundColor: 'transparent',
      borderRadius: '0'
    }
  };

  const currentSizeStyle = sizeStyles[size] || sizeStyles.medium;
  const currentVariantStyle = variantStyles[variant] || variantStyles.outlined;

  return (
    <div 
      className={`plasmic-search-bar-container ${containerClassName}`}
      style={{
        width,
        position: 'relative',
        ...containerStyle
      }}
    >
      {/* Label */}
      {label && (
        <label 
          style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: '500',
            color: textColor
          }}
        >
          {label}
        </label>
      )}

      {/* Search Input Container */}
      <div
        className={`plasmic-search-bar-input-container ${className}`}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          ...currentVariantStyle,
          ...style
        }}
      >
        {/* Search Icon */}
        {showSearchIcon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              zIndex: 1,
              color: placeholderColor,
              fontSize: '16px',
              pointerEvents: 'none'
            }}
          >
            {searchIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          aria-label={ariaLabel || label || placeholder}
          className={`plasmic-search-bar-input ${inputClassName}`}
          style={{
            width: '100%',
            height: currentSizeStyle.height,
            fontSize: currentSizeStyle.fontSize,
            padding: currentSizeStyle.padding,
            paddingLeft: showSearchIcon ? '40px' : currentSizeStyle.padding.split(' ')[1],
            paddingRight: showClearIcon && internalValue ? '40px' : currentSizeStyle.padding.split(' ')[1],
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: textColor,
            ...inputStyle
          }}
          {...props}
        />

        {/* Clear Icon */}
        {showClearIcon && internalValue && !disabled && !readOnly && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '12px',
              zIndex: 1,
              background: 'none',
              border: 'none',
              color: placeholderColor,
              fontSize: '16px',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Clear search"
          >
            {clearIcon}
          </button>
        )}
      </div>

      {/* Helper Text or Error Text */}
      {(helperText || errorText) && (
        <div
          style={{
            marginTop: '4px',
            fontSize: '12px',
            color: errorText ? '#ef4444' : '#6b7280'
          }}
        >
          {errorText || helperText}
        </div>
      )}
    </div>
  );
};

export default PlasmicSearchBar;
