import React from 'react';

class PlasmicErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.retryTimeoutId = null;
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('Plasmic Error Boundary caught an error:', error, errorInfo);
    
    // Check if it's a hydration or setState during render error
    const isHydrationError = error.message?.includes('setState') || 
                            error.message?.includes('hydration') ||
                            error.message?.includes('render');
    
    // Check if it's a TypeError (like the one in the console)
    const isTypeError = error instanceof TypeError;
    
    if (isHydrationError) {
      console.warn('Hydration/setState error detected. Manual recovery may be needed.');
    }
    
    if (isTypeError) {
      console.warn('TypeError detected. This might be a race condition in authentication.');
      // For TypeErrors, we might want to auto-retry after a delay
      if (!this.retryTimeoutId) {
        this.retryTimeoutId = setTimeout(() => {
          console.log('🔄 Auto-retrying after TypeError...');
          this.handleRetry();
        }, 2000); // Wait 2 seconds before auto-retry
      }
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  componentWillUnmount() {
    // Clean up any pending timeouts
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
    
    // Reset the error state to retry rendering
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ff6b6b', 
          borderRadius: '4px', 
          backgroundColor: '#ffe0e0',
          margin: '10px 0'
        }}>
          <h3>⚠️ Component Error</h3>
          <p>There was an error loading this component.</p>
          
          {/* Show specific message for TypeErrors */}
          {this.state.error instanceof TypeError && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '4px', 
              padding: '10px', 
              margin: '10px 0' 
            }}>
              <p><strong>Authentication Error Detected</strong></p>
              <p>This might be a temporary issue with the authentication system. The page will automatically retry in a few seconds.</p>
            </div>
          )}
          
          <button 
            onClick={this.handleRetry}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Try Again
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '10px' }}>
              <summary>Error Details (Development Only)</summary>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default PlasmicErrorBoundary; 