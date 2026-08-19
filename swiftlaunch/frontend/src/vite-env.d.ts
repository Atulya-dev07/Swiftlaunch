/// <reference types="vite/client" />

import type { SwiftLaunchApi } from '@swiftlaunch/shared';

declare global {
  interface Window {
    api?: SwiftLaunchApi;
  }
}

export {};
