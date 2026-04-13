import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.088cda14e3c949278f46a75afe9cbb86',
  appName: 'gentle-nudge-alarm',
  webDir: 'dist',
  server: {
    url: 'https://088cda14-e3c9-4927-8f46-a75afe9cbb86.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: '#1a0a2e',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#a855f7',
      sound: 'alarm.wav',
    },
  },
};

export default config;
