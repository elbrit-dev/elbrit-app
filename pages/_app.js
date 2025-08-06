import '../styles/globals.css';
import { AuthProvider } from '../components/AuthContext';
import '../plasmic-init'; // Import Plasmic configuration

// PrimeReact CSS imports
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primeicons/primeicons.css';

// Global error handler to catch unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Check if it's a TypeError related to authentication
    if (event.reason instanceof TypeError) {
      console.warn('TypeError detected in promise rejection. This might be an authentication race condition.');
      
      // Prevent the error from being logged to console
      event.preventDefault();
      
      // Optionally, you could show a user-friendly message here
      // or trigger a retry mechanism
    }
  });
  
  // Also catch regular errors
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    
    // Check if it's a TypeError
    if (event.error instanceof TypeError) {
      console.warn('TypeError detected in global error handler.');
      // You could add specific handling here if needed
    }
  });
}

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp; 