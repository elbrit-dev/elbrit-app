import { AuthProvider } from '../components/AuthContext';
import '../styles/globals.css';
import '../plasmic-init'; // Import Plasmic configuration

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp; 