import React from 'react';
import { useUiStore } from '../state/useUiStore.js';

interface SettingsPageProps {
  onClose: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onClose }) => {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <div className="settings-page-overlay">
      <div className="settings-card">
        <div className="settings-header">
          <h2 className="settings-title">SwiftLaunch Settings</h2>
          <button type="button" className="settings-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-row">
            <div>
              <div className="settings-label">Appearance Theme</div>
              <div className="settings-description">Dark glassmorphism command launcher theme</div>
            </div>
            <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Global Launcher Hotkey</div>
              <div className="settings-description">Press shortcut anywhere to open launcher</div>
            </div>
            <span className="keycap-large">Alt + Space</span>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Keyboard Flow</div>
              <div className="settings-description">Use Arrow keys / Ctrl+J/K, Enter to launch, Tab for actions</div>
            </div>
            <span className="status-badge active">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
