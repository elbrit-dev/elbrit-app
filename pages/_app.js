import { AuthProvider } from '../components/AuthContext';
import '../styles/globals.css';
import '../plasmic-init'; // Import Plasmic configuration

// PrimeReact CSS imports
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp; 