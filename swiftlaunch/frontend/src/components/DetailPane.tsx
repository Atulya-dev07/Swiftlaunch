import React from 'react';
import { useSearchStore } from '../state/useSearchStore.js';
import { useResultActions } from '../hooks/useResultActions.js';

export const DetailPane: React.FC = () => {
  const flatResults = useSearchStore((state) => state.flatResults);
  const selectedIndex = useSearchStore((state) => state.selectedIndex);
  const selectedResult = flatResults[selectedIndex] || null;
  const { executeResultAction } = useResultActions();

  if (!selectedResult) {
    return (
      <aside className="detail-pane empty">
        <span className="material-symbols-outlined detail-empty-icon">info</span>
        <div className="detail-empty-text">Select an item to view preview details</div>
      </aside>
    );
  }

  const providerId = (selectedResult.providerId || selectedResult.id.split(':')[0] || 'other').toLowerCase();

  const getDetailIcon = (p: string, title: string): string => {
    const ext = title.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'picture_as_pdf';
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'svg') return 'image';
    if (ext === 'doc' || ext === 'docx' || ext === 'txt' || ext === 'md') return 'description';
    if (ext === 'zip' || ext === 'rar') return 'folder_zip';

    switch (p) {
      case 'app':
        return 'apps';
      case 'file':
        return 'description';
      case 'google':
        return 'travel_explore';
      case 'plugin':
        return 'extension';
      default:
        return 'preview';
    }
  };

  const getKindLabel = (p: string, title: string): string => {
    const ext = title.split('.').pop()?.toUpperCase();
    switch (p) {
      case 'app':
        return 'Application';
      case 'file':
        return ext ? `${ext} Document` : 'File Item';
      case 'google':
        return 'Web Query';
      case 'plugin':
        return 'Plugin Command';
      default:
        return 'System Item';
    }
  };

  const iconName = getDetailIcon(providerId, selectedResult.title);

  return (
    <aside className="detail-pane" aria-label="Item Preview and Details">
      {/* Top Preview Card */}
      <div className="preview-card">
        <div className="preview-grid-pattern" />
        <span className="material-symbols-outlined preview-card-icon">{iconName}</span>
        <div className="preview-card-title">{selectedResult.title}</div>
      </div>

      {/* Metadata Detail Information */}
      <div className="detail-info-section">
        <div className="detail-info-header">Information</div>

        <div className="detail-grid">
          <span className="detail-grid-label">Kind</span>
          <span className="detail-grid-value">{getKindLabel(providerId, selectedResult.title)}</span>

          <span className="detail-grid-label">Target</span>
          <span className="detail-grid-value mono" title={selectedResult.subtitle}>
            {selectedResult.subtitle}
          </span>

          {selectedResult.score !== undefined && (
            <>
              <span className="detail-grid-label">Score</span>
              <span className="detail-grid-value">{selectedResult.score}</span>
            </>
          )}

          <span className="detail-grid-label">Provider</span>
          <span className="detail-grid-value">{providerId.toUpperCase()}</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        className="detail-action-btn"
        onClick={() => executeResultAction(selectedResult)}
      >
        <span className="btn-shimmer" />
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          open_in_new
        </span>
        <span>Open Item</span>
        <span className="keycap" style={{ marginLeft: '4px' }}>↵</span>
      </button>
    </aside>
  );
};
