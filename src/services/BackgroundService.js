import BackgroundTimer from 'react-native-background-timer';
import { getForegroundApp } from './AppService';
import { getRestrictedApps } from './StorageService';
import { showBlockingOverlay, hideBlockingOverlay } from './OverlayService';
import moment from 'moment';

let isMonitoring = false;
let currentBlockedApp = null;

export const startAppMonitoring = () => {
  if (isMonitoring) {
    console.log('App monitoring already started');
    return;
  }

  isMonitoring = true;
  console.log('Starting app monitoring service...');

  BackgroundTimer.runBackgroundTimer(async () => {
    try {
      await checkForegroundApp();
    } catch (error) {
      console.error('Error in background monitoring:', error);
    }
  }, 2000); // Check every 2 seconds
};

export const stopAppMonitoring = () => {
  if (!isMonitoring) {
    return;
  }

  isMonitoring = false;
  BackgroundTimer.stopBackgroundTimer();
  console.log('App monitoring service stopped');
  
  // Hide any active overlay
  if (currentBlockedApp) {
    hideBlockingOverlay();
    currentBlockedApp = null;
  }
};

const checkForegroundApp = async () => {
  try {
    const foregroundApp = await getForegroundApp();
    const restrictedApps = await getRestrictedApps();

    if (!foregroundApp || !restrictedApps[foregroundApp.packageName]) {
      // No restricted app in foreground, hide overlay if shown
      if (currentBlockedApp) {
        hideBlockingOverlay();
        currentBlockedApp = null;
      }
      return;
    }

    const restriction = restrictedApps[foregroundApp.packageName];
    
    if (shouldBlockApp(restriction)) {
      if (currentBlockedApp !== foregroundApp.packageName) {
        currentBlockedApp = foregroundApp.packageName;
        await showBlockingOverlay(foregroundApp.name, restriction);
      }
    } else {
      // App shouldn't be blocked now, hide overlay
      if (currentBlockedApp === foregroundApp.packageName) {
        hideBlockingOverlay();
        currentBlockedApp = null;
      }
    }
  } catch (error) {
    console.error('Error checking foreground app:', error);
  }
};

const shouldBlockApp = (restriction) => {
  if (!restriction.enabled) {
    return false;
  }

  const now = moment();
  const currentTime = now.format('HH:mm');
  const currentDay = now.format('dddd').toLowerCase();

  // Check if restriction is active for current day
  if (!restriction.days[currentDay]) {
    return false;
  }

  // Check if current time is within restriction period
  return currentTime >= restriction.startTime && currentTime <= restriction.endTime;
};

export const isMonitoringActive = () => {
  return isMonitoring;
};