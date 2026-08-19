import React from 'react';
import { useSearchStore } from '../state/useSearchStore.js';

export const DetailPane: React.FC = () => {
  const flatResults = useSearchStore((state) => state.flatResults);
  const selectedIndex = useSearchStore((state) => state.selectedIndex);
  const selectedResult = flatResults[selectedIndex] || null;

  if (!selectedResult) {
    return (
      <div className="detail-pane empty">
        <div className="detail-empty-icon">💡</div>
        <div className="detail-empty-text">Select an item to view details</div>
      </div>
    );
  }

  const providerId = (selectedResult.providerId || selectedResult.id.split(':')[0] || 'other').toLowerCase();

  return (
    <div className="detail-pane">
      <div className="detail-header">
        <span className="detail-icon">{selectedResult.icon}</span>
        <div className="detail-title-group">
          <div className="detail-title">{selectedResult.title}</div>
          <div className="detail-badge">{providerId.toUpperCase()}</div>
        </div>
      </div>

      <div className="detail-content">
        {providerId === 'calc' && (
          <div className="detail-section calc-section">
            <div className="detail-label">Computed Result</div>
            <div className="detail-calc-value">{selectedResult.title.replace(/^=\s*/, '')}</div>
            <div className="detail-label" style={{ marginTop: '12px' }}>Expression</div>
            <div className="detail-calc-expr">{selectedResult.subtitle.replace('Calculation: ', '')}</div>
          </div>
        )}

        {providerId === 'file' && (
          <div className="detail-section file-section">
            <div className="detail-field">
              <span className="detail-label">File Name</span>
              <span className="detail-value">{selectedResult.title}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Location Path</span>
              <span className="detail-value path-text">{selectedResult.subtitle}</span>
            </div>
            {selectedResult.score !== undefined && (
              <div className="detail-field">
                <span className="detail-label">Relevance Score</span>
                <span className="detail-value">{selectedResult.score}</span>
              </div>
            )}
          </div>
        )}

        {providerId === 'clip' && (
          <div className="detail-section clip-section">
            <div className="detail-label">Clipboard Contents</div>
            <div className="detail-clip-box">{selectedResult.title}</div>
            <div className="detail-field" style={{ marginTop: '10px' }}>
              <span className="detail-label">Meta Info</span>
              <span className="detail-value">{selectedResult.subtitle}</span>
            </div>
          </div>
        )}

        {providerId === 'app' && (
          <div className="detail-section app-section">
            <div className="detail-field">
              <span className="detail-label">Application</span>
              <span className="detail-value">{selectedResult.title}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Executable Path</span>
              <span className="detail-value path-text">{selectedResult.subtitle}</span>
            </div>
          </div>
        )}

        {providerId === 'google' && (
          <div className="detail-section google-section">
            <div className="detail-field">
              <span className="detail-label">Web Provider</span>
              <span className="detail-value">Google Search</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Query</span>
              <span className="detail-value">{selectedResult.title.replace('Search Google for ', '')}</span>
            </div>
          </div>
        )}

        {providerId === 'plugin' && (
          <div className="detail-section plugin-section">
            <div className="detail-field">
              <span className="detail-label">Command</span>
              <span className="detail-value">{selectedResult.title}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Details</span>
              <span className="detail-value">{selectedResult.subtitle}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
