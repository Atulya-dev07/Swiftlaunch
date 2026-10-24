import React from 'react';

export const DocumentIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.25))">
      {/* Paper Sheet */}
      <path
        d="M6 3C4.89543 3 4 3.89543 4 5V23C4 24.1046 4.89543 25 6 25H22C23.1046 25 24 24.1046 24 23V9L18 3H6Z"
        fill="#E8ECF2"
      />
      {/* Folded Corner */}
      <path
        d="M18 3V7.5C18 8.32843 18.6716 9 19.5 9H24L18 3Z"
        fill="#CBD5E1"
      />
      {/* Center Blue Disc Emblem */}
      <circle cx="14" cy="16" r="4.5" fill="#2563EB" />
      <circle cx="14" cy="16" r="2.2" fill="#FFFFFF" />
      <circle cx="14" cy="16" r="1" fill="#2563EB" />
    </g>
  </svg>
);

export const AimlabsIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="6" fill="#141820" />
    <path
      d="M14 6.5L21.5 19.5H17.8L14 12.8L10.2 19.5H6.5L14 6.5Z"
      fill="#00E5FF"
    />
    <path
      d="M14 15.2L16.2 19.5H11.8L14 15.2Z"
      fill="#00E5FF"
    />
  </svg>
);

export const FolderIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 6C4 4.89543 4.89543 4 6 4H11.1716C11.702 4 12.2107 4.21071 12.5858 4.58579L14.4142 6.41421C14.7893 6.78929 15.298 7 15.8284 7H22C23.1046 7 24 7.89543 24 9V22C24 23.1046 23.1046 24 22 24H6C4.89543 24 4 23.1046 4 22V6Z"
      fill="#F59E0B"
    />
    <path
      d="M4 10C4 8.89543 4.89543 8 6 8H22C23.1046 8 24 8.89543 24 10V22C24 23.1046 23.1046 24 22 24H6C4.89543 24 4 23.1046 4 22V10Z"
      fill="#FBBF24"
    />
  </svg>
);

export const AppDefaultIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="6" fill="#1E2330" />
    <rect x="7" y="7" width="6" height="6" rx="1.5" fill="#60A5FA" />
    <rect x="15" y="7" width="6" height="6" rx="1.5" fill="#93C5FD" />
    <rect x="7" y="15" width="6" height="6" rx="1.5" fill="#93C5FD" />
    <rect x="15" y="15" width="6" height="6" rx="1.5" fill="#3B82F6" />
  </svg>
);

export const ImageIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="6" fill="#065F46" />
    <circle cx="10" cy="10" r="2.5" fill="#6EE7B7" />
    <path d="M6 21L12 14L16 18L19 15L23 21H6Z" fill="#A7F3D0" />
  </svg>
);

export const WebIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="12" fill="#2563EB" />
    <circle cx="14" cy="14" r="11" stroke="#60A5FA" strokeWidth="1.5" />
    <ellipse cx="14" cy="14" rx="5" ry="11" stroke="#93C5FD" strokeWidth="1.2" />
    <line x1="3" y1="14" x2="25" y2="14" stroke="#93C5FD" strokeWidth="1.2" />
  </svg>
);

export const CalcIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="6" fill="#D97706" />
    <rect x="7" y="6" width="14" height="4" rx="1" fill="#FEF3C7" />
    <circle cx="9" cy="14" r="1.5" fill="#FFFFFF" />
    <circle cx="14" cy="14" r="1.5" fill="#FFFFFF" />
    <circle cx="19" cy="14" r="1.5" fill="#FFFFFF" />
    <circle cx="9" cy="19" r="1.5" fill="#FFFFFF" />
    <circle cx="14" cy="19" r="1.5" fill="#FFFFFF" />
    <circle cx="19" cy="19" r="1.5" fill="#FFFFFF" />
  </svg>
);

export const ClipIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="6" width="18" height="18" rx="3" fill="#6B7280" />
    <rect x="9" y="3" width="10" height="4" rx="1.5" fill="#374151" />
    <line x1="8" y1="12" x2="20" y2="12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="16" x2="17" y2="16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="20" x2="14" y2="20" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

interface ResultIconProps {
  title: string;
  providerId: string;
  rawIcon?: string;
}

export const ResultIcon: React.FC<ResultIconProps> = ({ title, providerId, rawIcon }) => {
  if (rawIcon && (rawIcon.startsWith('data:') || rawIcon.startsWith('http://') || rawIcon.startsWith('https://'))) {
    return <img src={rawIcon} alt="" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }} />;
  }

  const t = title.toLowerCase();
  const ext = title.includes('.') ? title.split('.').pop()?.toLowerCase() : '';

  // Aimlabs brand icon
  if (t.includes('aimlabs')) {
    return <AimlabsIcon />;
  }

  // Documents / PDFs / HTML
  if (
    ext === 'pdf' ||
    ext === 'html' ||
    ext === 'htm' ||
    ext === 'doc' ||
    ext === 'docx' ||
    ext === 'txt' ||
    ext === 'md' ||
    t.includes('octave')
  ) {
    return <DocumentIcon />;
  }

  // Image files
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'svg' || ext === 'webp') {
    return <ImageIcon />;
  }

  // Folders
  if (ext === 'zip' || ext === 'rar' || ext === '7z' || ext === 'tar' || ext === 'gz' || (!ext && providerId === 'file')) {
    return <FolderIcon />;
  }

  // Apps
  if (providerId === 'app') {
    return <AppDefaultIcon />;
  }

  // Calculator
  if (providerId === 'calc') {
    return <CalcIcon />;
  }

  // Clipboard
  if (providerId === 'clip') {
    return <ClipIcon />;
  }

  // Web
  if (providerId === 'google') {
    return <WebIcon />;
  }

  // Fallback to DocumentIcon or AppDefaultIcon depending on provider
  if (providerId === 'file') {
    return <DocumentIcon />;
  }

  return <AppDefaultIcon />;
};
