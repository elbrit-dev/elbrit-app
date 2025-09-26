import React, { useEffect } from 'react';

/**
 * PrintWrapper - A wrapper component that triggers A3 printing when any child element is clicked
 * 
 * This component wraps any content (icons, images, text) and makes the entire area clickable
 * to trigger printing with A3 page size. Perfect for icons, images, or custom print buttons.
 * 
 * Features:
 * - Wrap any content (icons, images, text, custom designs)
 * - Entire wrapper area is clickable
 * - Automatic A3 page size preset when print dialog opens
 * - Works in iframe contexts (Plasmic preview) and main window
 * - Zero configuration required
 * 
 * Usage in Plasmic:
 * 1. Drag PrintWrapper component onto canvas
 * 2. Add any content inside (icons, images, text)
 * 3. Click anywhere on the wrapper = Print dialog opens with A3 size
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @param {string} props.className - Additional CSS classes for wrapper
 * @param {Object} props.style - Inline styles for wrapper
 * @param {string} props.cursor - Cursor style (default: 'pointer')
 * @param {function} props.onPrint - Callback fired when print is initiated
 * @param {string} props.parentWindowOrigin - Origin for postMessage (for security)
 * @param {boolean} props.disabled - Disable the print wrapper
 * @param {string} props.tooltip - Tooltip text to show on hover
 */
const PrintWrapper = ({
  children,
  className = '',
  style = {},
  cursor = 'pointer',
  onPrint,
  parentWindowOrigin = '*',
  disabled = false,
  tooltip,
  ...otherProps
}) => {
  
  // Function to immediately trigger print with A3 page size - NO SETUP REQUIRED
  const triggerAutoPrint = () => {
    if (disabled) return;

    // Apply A3 page size styles instantly
    let printStyle = document.getElementById('print-wrapper-a3-styles');
    if (!printStyle) {
      printStyle = document.createElement('style');
      printStyle.id = 'print-wrapper-a3-styles';
      printStyle.textContent = `
        @media print {
          @page {
            size: A3 !important;
            margin: 0.3in !important;
          }
          body {
            color: black !important;
            background: white !important;
          }
        }
      `;
      document.head.appendChild(printStyle);
    }

    // IMMEDIATE print trigger - no delays
    window.print();
    
    // Call callback if provided
    if (onPrint) onPrint();
  };

  // Set up message listener for parent window communication
  useEffect(() => {
    // Only add listener in parent window (not iframe)
    if (typeof window !== 'undefined' && window === window.parent) {
      const handleMessage = (event) => {
        // Optional: Check origin for security
        if (parentWindowOrigin !== '*' && event.origin !== parentWindowOrigin) {
          return;
        }
        
        if (event.data?.action === 'print-page') {
          triggerAutoPrint();
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [parentWindowOrigin, onPrint, disabled]);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;

    // Check if we're in an iframe context
    if (typeof window !== 'undefined' && window.parent && window !== window.parent) {
      // We're inside an iframe - send message to parent
      window.parent.postMessage({ action: 'print-page' }, parentWindowOrigin);
    } else {
      // We're in the main window - automatically print with A3
      triggerAutoPrint();
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    
    // Trigger print on Enter or Space key
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const wrapperStyle = {
    cursor: disabled ? 'not-allowed' : cursor,
    userSelect: 'none',
    display: 'inline-block',
    ...style
  };

  return (
    <div
      className={className}
      style={wrapperStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={tooltip || 'Click to print this page'}
      title={tooltip}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default PrintWrapper;
