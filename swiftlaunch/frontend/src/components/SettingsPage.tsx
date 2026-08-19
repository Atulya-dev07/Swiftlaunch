import React from 'react';
import { useUiStore } from '../state/useUiStore.js';

interface SettingsPageProps {
  onClose: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onClose }) => {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <div className="settings-page-overlay" onClick={onClose}>
      <div
        className="settings-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <div className="settings-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--electric-blue)' }}>
              tune
            </span>
            <h2 className="settings-title">SwiftLaunch Settings</h2>
          </div>
          <button type="button" className="settings-close-btn" onClick={onClose} title="Close (Esc)">
            ✕
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-row">
            <div>
              <div className="settings-label">Appearance Theme</div>
              <div className="settings-description">Mica / Glassmorphic deep obsidian theme</div>
            </div>
            <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === 'dark' ? '🌙 Dark Obsidian' : '☀️ Light Glass'}
            </button>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Global Launcher Hotkey</div>
              <div className="settings-description">Global shortcut to summon SwiftLaunch window</div>
            </div>
            <span className="keycap-large">Alt + Space</span>
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Keyboard Flow Navigation</div>
              <div className="settings-description">
                Arrow keys / Ctrl+J/K, Enter to launch, Tab for actions
              </div>
            </div>
            <span className="status-badge active">Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
