import React from 'react';

/**
 * PlasmicButton - A flexible button component for Plasmic
 */
const PlasmicButton = ({
  // Content
  children = "Button",
  text = "",
  
  // Styling
  variant = "primary", // primary, secondary, outline, ghost, danger
  size = "medium", // small, medium, large
  width = "auto",
  height = "auto",
  
  // Colors
  backgroundColor = "",
  textColor = "",
  borderColor = "",
  
  // State
  disabled = false,
  loading = false,
  loadingText = "Loading...",
  
  // Icons
  leftIcon = "",
  rightIcon = "",
  iconOnly = false,
  
  // Behavior
  type = "button",
  fullWidth = false,
  
  // Styling props
  borderRadius = "6px",
  fontSize = "",
  fontWeight = "500",
  padding = "",
  
  // CSS classes
  className = "",
  
  // Inline styles
  style = {},
  
  // Event handlers
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  
  ...props
}) => {
  const displayText = text || children;
  
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
      padding: '12px 24px'
    }
  };

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      border: '1px solid #3b82f6'
    },
    secondary: {
      backgroundColor: '#6b7280',
      color: '#ffffff',
      border: '1px solid #6b7280'
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      border: '1px solid #3b82f6'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      border: '1px solid transparent'
    },
    danger: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
      border: '1px solid #ef4444'
    }
  };

  const currentSizeStyle = sizeStyles[size] || sizeStyles.medium;
  const currentVariantStyle = variantStyles[variant] || variantStyles.primary;

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : width,
    height: height === 'auto' ? currentSizeStyle.height : height,
    fontSize: fontSize || currentSizeStyle.fontSize,
    fontWeight,
    padding: padding || currentSizeStyle.padding,
    borderRadius,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    ...currentVariantStyle,
    ...(backgroundColor && { backgroundColor }),
    ...(textColor && { color: textColor }),
    ...(borderColor && { borderColor }),
    ...style
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`plasmic-button ${className}`}
      style={buttonStyle}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      {...props}
    >
      {loading ? (
        <>
          <span style={{ 
            width: '16px', 
            height: '16px', 
            border: '2px solid currentColor',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          {loadingText}
        </>
      ) : (
        <>
          {leftIcon && !iconOnly && <span>{leftIcon}</span>}
          {iconOnly ? (leftIcon || rightIcon) : displayText}
          {rightIcon && !iconOnly && <span>{rightIcon}</span>}
        </>
      )}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default PlasmicButton;
