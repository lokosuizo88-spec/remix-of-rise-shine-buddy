import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

/**
 * Initialize native platform features (status bar, back button handling, etc.)
 */
export async function initNativePlatform() {
  if (!Capacitor.isNativePlatform()) return;

  // Dark status bar
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1a0a2e' });
  } catch (e) {
    console.log('StatusBar config skipped');
  }

  // Prevent back button from closing app while alarm is ringing
  App.addListener('backButton', ({ canGoBack }) => {
    const isRinging = localStorage.getItem('wakeup_is_ringing') === 'true';
    if (isRinging) {
      // Don't allow back during alarm
      return;
    }
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });

  // When app resumes, check if alarm should be ringing
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      const isRinging = localStorage.getItem('wakeup_is_ringing') === 'true';
      if (isRinging && !window.location.pathname.includes('/alarm/ringing')) {
        window.location.href = '/alarm/ringing';
      }
    }
  });
}
