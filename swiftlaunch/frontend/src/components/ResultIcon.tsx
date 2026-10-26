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

export const AntigravityIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="6" fill="#18132B" />
    <circle cx="14" cy="14" r="8" stroke="url(#ag-grad)" strokeWidth="1.8" strokeDasharray="3 2" />
    <circle cx="14" cy="14" r="4.2" fill="url(#ag-core)" />
    <circle cx="14" cy="7" r="1.8" fill="#A855F7" />
    <defs>
      <linearGradient id="ag-grad" x1="6" y1="6" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#818CF8" />
        <stop offset="1" stopColor="#C084FC" />
      </linearGradient>
      <linearGradient id="ag-core" x1="10" y1="10" x2="18" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" />
        <stop offset="1" stopColor="#EC4899" />
      </linearGradient>
    </defs>
  </svg>
);

export const ChromeIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="6" fill="#1C212B" />
    <circle cx="14" cy="14" r="9" fill="#1F2937" />
    <circle cx="14" cy="14" r="4" fill="#3B82F6" />
    <path d="M14 5C17.2 5 20 6.8 21.5 9.5L14 14H5.3C6.3 8.8 10.7 5 14 5Z" fill="#EF4444" opacity="0.9" />
    <path d="M21.5 9.5C22.5 11.2 23 13.1 23 15C23 19.5 19.6 23 15.1 23L11.5 16.8L14 14L21.5 9.5Z" fill="#10B981" opacity="0.9" />
    <path d="M5.3 14H14L11.5 16.8L6.8 21.5C5.7 19.6 5 17.4 5 15C5 14.6 5.1 14.3 5.3 14Z" fill="#F59E0B" opacity="0.9" />
    <circle cx="14" cy="14" r="3.2" fill="#FFFFFF" />
  </svg>
);

export const VsCodeIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="6" fill="#171C26" />
    <path d="M21 7.2L17.5 5.5L7.8 12.8L5 10.7L4 11.4V16.6L5 17.3L7.8 15.2L17.5 22.5L21 20.8V7.2Z" fill="#007ACC" />
    <path d="M17.5 5.5L11.2 12.5L17.5 17.5V5.5Z" fill="#1F9CF0" />
    <path d="M17.5 10.5L11.2 15.5L17.5 22.5V10.5Z" fill="#0065A9" />
  </svg>
);

export const ComboIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="28" height="28" rx="6" fill="#181E2E" />
    {/* Interlocking app layers */}
    <rect x="6" y="6" width="10" height="10" rx="3" fill="#6366F1" opacity="0.9" />
    <rect x="12" y="12" width="10" height="10" rx="3" fill="#EC4899" opacity="0.9" />
    <circle cx="11" cy="11" r="2" fill="#FFFFFF" opacity="0.9" />
    <circle cx="17" cy="17" r="2" fill="#FFFFFF" opacity="0.9" />
    {/* Plus spark */}
    <path d="M20 5V8M18.5 6.5H21.5" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
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

  // Combos / App Clubs
  if (providerId === 'combo' || providerId === 'appcombo' || t.startsWith('combo:') || t.includes('[combo]')) {
    return <ComboIcon />;
  }

  // Antigravity
  if (t.includes('antigravity')) {
    return <AntigravityIcon />;
  }

  // Google Chrome
  if (t.includes('chrome')) {
    return <ChromeIcon />;
  }

  // Visual Studio Code
  if (t.includes('vs code') || t.includes('visual studio code') || t.includes('code.exe')) {
    return <VsCodeIcon />;
  }

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
