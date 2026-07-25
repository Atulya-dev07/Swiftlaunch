import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div style={styles.container}>
      <h2>SwiftLaunch Settings</h2>
      <p style={styles.comingSoon}>Coming soon</p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    textAlign: 'center'
  },
  comingSoon: {
    marginTop: '12px',
    color: 'var(--text-secondary)'
  }
};
