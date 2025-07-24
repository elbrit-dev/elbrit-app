import { AuthProvider } from '../components/AuthContext';
import '../styles/globals.css';
import '../plasmic-init'; // Import Plasmic configuration

// PrimeReact CSS imports
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primeicons/primeicons.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp; 