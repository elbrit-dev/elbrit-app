import React, { useState } from 'react';

/**
 * PlasmicInput - A flexible input component for Plasmic
 */
const PlasmicInput = ({
  // Basic props
  type = "text",
  placeholder = "",
  value = "",
  defaultValue = "",
  disabled = false,
  readOnly = false,
  required = false,
  
  // Styling
  size = "medium", // small, medium, large
  variant = "outlined", // outlined, filled, underlined
  width = "100%",
  height = "auto",
  
  // Colors
  backgroundColor = "",
  textColor = "",
  borderColor = "",
  focusBorderColor = "#3b82f6",
  placeholderColor = "#9ca3af",
  
  // Labels and help
  label = "",
  helperText = "",
  errorText = "",
  
  // Icons
  leftIcon = "",
  rightIcon = "",
  
  // Validation
  minLength = 0,
  maxLength = 1000,
  pattern = "",
  
  // Styling props
  borderRadius = "6px",
  fontSize = "",
  fontWeight = "400",
  padding = "",
  
  // CSS classes
  className = "",
  inputClassName = "",
  containerClassName = "",
  
  // Inline styles
  style = {},
  inputStyle = {},
  containerStyle = {},
  
  // Event handlers
  onChange,
  onFocus,
  onBlur,
  onKeyPress,
  onKeyDown,
  onKeyUp,
  
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value || defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [hasError, setHasError] = useState(!!errorText);

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
      border: `1px solid ${isFocused ? focusBorderColor : (borderColor || '#d1d5db')}`,
      backgroundColor: backgroundColor || '#ffffff',
      borderRadius: borderRadius
    },
    filled: {
      border: 'none',
      backgroundColor: isFocused ? '#f8fafc' : (backgroundColor || '#f1f5f9'),
      borderRadius: borderRadius
    },
    underlined: {
      border: 'none',
      borderBottom: `2px solid ${isFocused ? focusBorderColor : (borderColor || '#d1d5db')}`,
      backgroundColor: 'transparent',
      borderRadius: '0'
    }
  };

  const currentSizeStyle = sizeStyles[size] || sizeStyles.medium;
  const currentVariantStyle = variantStyles[variant] || variantStyles.outlined;

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Check max length
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    setInternalValue(newValue);
    
    if (onChange) {
      onChange(e);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div 
      className={`plasmic-input-container ${containerClassName}`}
      style={{
        width,
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
            color: textColor || '#374151'
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}

      {/* Input Container */}
      <div
        className={`plasmic-input-wrapper ${className}`}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          ...currentVariantStyle,
          ...style
        }}
      >
        {/* Left Icon */}
        {leftIcon && (
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
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          type={type}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={onKeyPress}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          className={`plasmic-input ${inputClassName}`}
          style={{
            width: '100%',
            height: height === 'auto' ? currentSizeStyle.height : height,
            fontSize: fontSize || currentSizeStyle.fontSize,
            fontWeight,
            padding: padding || currentSizeStyle.padding,
            paddingLeft: leftIcon ? '40px' : currentSizeStyle.padding.split(' ')[1],
            paddingRight: rightIcon ? '40px' : currentSizeStyle.padding.split(' ')[1],
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: textColor || '#374151',
            ...inputStyle
          }}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              zIndex: 1,
              color: placeholderColor,
              fontSize: '16px',
              pointerEvents: 'none'
            }}
          >
            {rightIcon}
          </div>
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

export default PlasmicInput;
