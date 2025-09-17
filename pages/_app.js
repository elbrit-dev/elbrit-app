import '../styles/globals.css';
import { AuthProvider } from '../components/AuthContext';
import Head from 'next/head';
import localFont from 'next/font/local';
import dynamic from 'next/dynamic';
import { DataProvider } from '@plasmicapp/host';
const FnModule = dynamic(() => import('../utils/fn'), { ssr: false });

// PrimeReact CSS imports
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primeicons/primeicons.css';

// Removed unused Ant Design CSS to reduce global CSS payload

// Local variable fonts with automatic CSS and font-display swap
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  weight: '100 900',
  variable: '--font-geist-sans',
  display: 'swap'
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  weight: '100 900',
  variable: '--font-geist-mono',
  display: 'swap'
});

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
    <>
      <Head>
        <link rel="preconnect" href="https://img.plasmic.app" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.plasmiccdn.com" crossOrigin="anonymous" />
      </Head>
      <div className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <FnModule>
            {({ default: fn }) => (
              <DataProvider name="fn" data={fn}>
                <Component {...pageProps} />
              </DataProvider>
            )}
          </FnModule>
        </AuthProvider>
      </div>
    </>
  );
}

export default MyApp; 