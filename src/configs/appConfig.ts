export type AppConfig = {
  appName: string;
  packageName: string;
  schoolId: string;
  schoolCode?: string;
  themeColor: string;
  logo: string;
  features: Record<string, boolean>;
};

import abc from "../../configs/abc-school.json";

function parseFromEnv(): AppConfig | null {
  const raw = process.env.NEXT_PUBLIC_APP_CONFIG;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppConfig;
  } catch {
    return null;
  }
}

// Detect if we're on mobile app vs web
export const isMobileApp = typeof window !== 'undefined' && 'Capacitor' in window;

// For web, don't use default school config to allow school selection
// For mobile app, use the configured school
export const appConfig: AppConfig = parseFromEnv() ?? (isMobileApp ? (abc as AppConfig) : {
  ...abc,
  schoolCode: undefined // Remove school code for web to enable school selection
});
