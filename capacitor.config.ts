import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wms.app',
  appName: 'qual_temporaneo',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
