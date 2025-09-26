import React, { useEffect } from 'react';
import { Button } from 'primereact/button';

/**
 * PrintButton - A ready-made Plasmic Code Component for printing documents
 * 
 * This component handles cross-iframe communication between Plasmic (iframe) and 
 * the parent window to trigger printing. Perfect for when you need print 
 * functionality inside a Plasmic embedded iframe context.
 * 
 * Usage in Plasmic:
 * 1. Register this component as a Code Component in your Plasmic project
 * 2. Place it anywhere you want a print button
 * 3. The component automatically detects if it's running in an iframe and creates
 *    the necessary communication bridge
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Button text (default: "Print")
 * @param {string} props.icon - Icon class name (default: 'pi pi-print')
 * @param {string} props.iconPos - Icon position ('left' or 'right')
 * @param {string} props.severity - Button color theme ('primary', 'secondary', etc.)
 * @param {string} props.size - Button size ('small', 'normal', 'large')
 * @param {boolean} props.outlined - Whether button should be outlined
 * @param {boolean} props.rounded - Whether button should have rounded corners
 * @param {boolean} props.text - Whether button should be text only
 * @param {boolean} props.raised - Whether button should have shadow
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 * @param {string} props.tooltip - Tooltip text
 * @param {Object} props.tooltipOptions - Tooltip options
 * @param {string} props.badge - Badge text to display on button
 * @param {string} props.badgeClass - Badge CSS classes
 * @param {function} props.onPrint - Callback fired when print is initiated
 * @param {string} props.parentWindowOrigin - Origin for postMessage (for security)
 */
const PrintButton = ({
  label = 'Print',
  icon = 'pi pi-print',
  iconPos = 'left',
  severity = 'primary',
  size = 'normal',
  outlined = false,
  rounded = false,
  text = false,
  raised = false,
  loading = false,
  disabled = false,
  className = '',
  style = {},
  tooltip = 'Print this page',
  tooltipOptions = { position: 'top' },
  badge = null,
  badgeClass = 'p-badge-danger',
  onPrint,
  parentWindowOrigin = '*',
  ...otherProps
}) => {
  
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
          window.print();
          if (onPrint) onPrint();
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [parentWindowOrigin, onPrint]);

  const handleClick = () => {
    // Check if we're in an iframe context
    if (typeof window !== 'undefined' && window.parent && window !== window.parent) {
      // We're inside an iframe - send message to parent
      window.parent.postMessage({ action: 'print-page' }, parentWindowOrigin);
    } else {
      // We're in the main window - print directly
      window.print();
    }
    
    // Call the onPrint callback
    if (onPrint) onPrint();
  };

  // Map size prop to PrimeReact size classes
  const sizeClass = {
    small: 'p-button-sm',
    normal: '',
    large: 'p-button-lg'
  }[size] || '';

  // Combine all classes
  const buttonClass = `${className} ${sizeClass}`.trim();

  return (
    <Button
      label={label}
      icon={icon}
      iconPos={iconPos}
      severity={severity}
      outlined={outlined}
      rounded={rounded}
      text={text}
      raised={raised}
      loading={loading}
      disabled={disabled}
      onClick={handleClick}
      className={buttonClass}
      style={style}
      tooltip={tooltip}
      tooltipOptions={tooltipOptions}
      badge={badge}
      badgeClassName={badgeClass}
      {...otherProps}
    />
  );
};

export default PrintButton;
