import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="loading-state">
      <div className="loading-bar-shimmer" />
      <div className="loading-rows">
        <div className="loading-row-skeleton" />
        <div className="loading-row-skeleton" style={{ width: '85%' }} />
        <div className="loading-row-skeleton" style={{ width: '70%' }} />
      </div>
    </div>
  );
};
