import React from 'react';

interface SectionHeaderProps {
  title: string;
  count: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count }) => {
  return (
    <div className="section-header">
      <span className="section-title">{title}</span>
      <span className="section-count">{count}</span>
    </div>
  );
};
