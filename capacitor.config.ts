import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'easy.stock.wms',
  appName: 'Easy Stock',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
  "plugins": {
    "Filesystem": {
      "AndroidPublicDirectory": "DOWNLOADS"
    }
  }
};

export default config;
