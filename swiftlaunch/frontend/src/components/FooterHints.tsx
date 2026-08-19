import React from 'react';
import { useSearchStore } from '../state/useSearchStore.js';

export const FooterHints: React.FC = () => {
  const actionPanelOpen = useSearchStore((state) => state.actionPanelOpen);
  const detailPaneOpen = useSearchStore((state) => state.detailPaneOpen);
  const toggleDetailPane = useSearchStore((state) => state.toggleDetailPane);
  const flatResults = useSearchStore((state) => state.flatResults);

  if (actionPanelOpen) {
    return (
      <footer className="footer-hints">
        <div className="footer-hints-left">
          <div className="hint-group">
            <span className="keycap">↵</span>
            <span className="hint-label">Execute Action</span>
          </div>
          <div className="hint-group">
            <span className="keycap">Esc</span>
            <span className="hint-label">Back to List</span>
          </div>
          <div className="hint-group">
            <span className="keycap">↑↓</span>
            <span className="hint-label">Select Action</span>
          </div>
        </div>
        <div className="footer-right">
          <span className="footer-brand">SwiftLaunch</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer-hints">
      <div className="footer-hints-left">
        <div className="hint-group">
          <span className="keycap">↵</span>
          <span className="hint-label">Open</span>
        </div>
        <div className="hint-group">
          <span className="keycap">Tab</span>
          <span className="hint-label">Actions</span>
        </div>
        <div
          className={`hint-group clickable ${detailPaneOpen ? 'active' : ''}`}
          onClick={() => toggleDetailPane()}
          title="Toggle Preview Detail Pane (Alt+D)"
        >
          <span className="keycap">Alt+D</span>
          <span className="hint-label">Preview</span>
        </div>
        <div className="hint-group">
          <span className="keycap">Esc</span>
          <span className="hint-label">Close</span>
        </div>
        <div className="hint-group">
          <span className="keycap">↑↓</span>
          <span className="hint-label">Navigate</span>
        </div>
      </div>

      <div className="footer-right">
        {flatResults.length > 0 && (
          <span className="results-count-pill">{flatResults.length} items</span>
        )}
        <span className="footer-brand">SwiftLaunch</span>
      </div>
    </footer>
  );
};
