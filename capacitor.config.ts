import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.wakeup',
  appName: 'WakeUp!',
  webDir: 'dist',
  server: {
    url: 'https://4285714d-c879-4d08-96ed-557a7168a580.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
