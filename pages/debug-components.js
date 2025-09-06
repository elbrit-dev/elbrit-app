import { PLASMIC } from '../plasmic-init';

export default function DebugComponents() {
  if (typeof window === 'undefined') {
    return <div>Server-side rendering - check client-side</div>;
  }

  // Get the component registry from the global scope
  const registry = window.__PlasmicComponentRegistry || [];
  const componentNames = registry.map(item => item.meta?.name).filter(Boolean);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Plasmic Component Registry Debug</h1>
      <h2>Total Components: {registry.length}</h2>
      
      <h3>Registered Components:</h3>
      <ul>
        {registry.map((item, index) => (
          <li key={index}>
            <strong>{item.meta?.name || 'Unknown'}</strong>: {item.meta?.displayName || 'No display name'}
          </li>
        ))}
      </ul>

      <h3>Expected Components:</h3>
      <ul>
        <li>MicrosoftSSOLogin</li>
        <li>TruecallerSSOLogin</li>
        <li>PlasmicDataContext</li>
        <li>FirestoreDebug</li>
        <li>EnvironmentCheck</li>
        <li>LinkComponent</li>
        <li>AdvancedTable</li>
        <li>PrimeDataTable</li>
        <li>TagFilterPrimeReact</li>
        <li>PlasmicSkeleton</li>
        <li>PlasmicSearchBar</li>
        <li>PlasmicButton</li>
        <li>PlasmicInput</li>
      </ul>

      <h3>Missing Components:</h3>
      <ul>
        {[
          'MicrosoftSSOLogin',
          'TruecallerSSOLogin', 
          'PlasmicDataContext',
          'FirestoreDebug',
          'EnvironmentCheck',
          'LinkComponent',
          'AdvancedTable',
          'PrimeDataTable',
          'TagFilterPrimeReact',
          'PlasmicSkeleton',
          'PlasmicSearchBar',
          'PlasmicButton',
          'PlasmicInput'
        ].filter(name => !componentNames.includes(name)).map(name => (
          <li key={name} style={{ color: 'red' }}>{name}</li>
        ))}
      </ul>

      <h3>Raw Registry Object:</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(registry, null, 2)}
      </pre>
    </div>
  );
}
