import React from 'react';
import type { Result } from '@swiftlaunch/shared';
import { useResultActions } from '../hooks/useResultActions.js';

interface ResultItemProps {
  result: Result;
  isSelected?: boolean;
  itemIndex?: number;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export const ResultItem: React.FC<ResultItemProps> = ({
  result,
  isSelected = false,
  itemIndex,
  onClick,
  onDoubleClick
}) => {
  const { executeResultAction } = useResultActions();

  const providerId = (result.providerId || result.id.split(':')[0] || 'other')
    .toLowerCase()
    .replace(/provider$/, '');

  const getProviderBadgeLabel = (p: string): string => {
    switch (p) {
      case 'context':
        return 'Context';
      case 'app':
        return 'App';
      case 'file':
        return 'File';
      case 'calc':
        return 'Math';
      case 'clip':
        return 'Clip';
      case 'google':
        return 'Web';
      case 'plugin':
        return 'Plugin';
      default:
        return p;
    }
  };

  const getMaterialIcon = (p: string, title: string): string => {
    const ext = title.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'picture_as_pdf';
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'svg') return 'image';
    if (ext === 'doc' || ext === 'docx' || ext === 'txt' || ext === 'md') return 'description';
    if (ext === 'zip' || ext === 'rar' || ext === '7z') return 'folder_zip';

    switch (p) {
      case 'context':
        return 'screen_search_desktop';
      case 'app':
        return 'apps';
      case 'file':
        return 'description';
      case 'calc':
        return 'calculate';
      case 'clip':
        return 'content_paste';
      case 'google':
        return 'travel_explore';
      case 'plugin':
        return 'extension';
      default:
        return 'article';
    }
  };

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    executeResultAction(result);
  };

  const iconName = getMaterialIcon(providerId, result.title);

  return (
    <div
      className={`result-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick || handleExecute}
      data-provider={providerId}
    >
      <div className="item-icon-wrapper">
        <span className="material-symbols-outlined">{iconName}</span>
      </div>

      <div className="item-text-container">
        <div className="item-title-row">
          <span className="item-title">{result.title}</span>
          <span className={`item-provider-badge badge-${providerId}`}>
            {getProviderBadgeLabel(providerId)}
          </span>
        </div>
        <div className="item-subtitle">{result.subtitle}</div>
      </div>

      <div className="item-actions-hint">
        {itemIndex !== undefined && itemIndex < 9 && (
          <span className="quick-shortcut-hint">Ctrl+{itemIndex + 1}</span>
        )}
        {isSelected && (
          <div className="selected-action-badges">
            <span className="inline-keycap">↵ Open</span>
            <span className="inline-keycap">Tab</span>
          </div>
        )}
      </div>
    </div>
  );
};
