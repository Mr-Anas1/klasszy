import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.klasszy.app',
  appName: 'Klasszy',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
