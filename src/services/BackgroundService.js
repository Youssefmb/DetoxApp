import { NativeModules, Platform } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import { getRestrictedApps } from './StorageService';
import { showBlockingOverlay } from './OverlayService';
import moment from 'moment';

const { AppBlockingModule } = NativeModules;

let isMonitoring = false;
let currentBlockedApp = null;

export const startAppMonitoring = async () => {
  if (isMonitoring) {
    console.log('App monitoring already started');
    return;
  }

  try {
    if (Platform.OS === 'android') {
      // Start native Android service
      await AppBlockingModule.startAppBlockingService();
    }
    
    isMonitoring = true;
    console.log('Starting app monitoring service...');

    // JavaScript-based monitoring as fallback
    BackgroundTimer.runBackgroundTimer(async () => {
      try {
        await checkAndBlockApps();
      } catch (error) {
        console.error('Error in background monitoring:', error);
      }
    }, 3000); // Check every 3 seconds

  } catch (error) {
    console.error('Error starting app monitoring:', error);
  }
};

export const stopAppMonitoring = () => {
  if (!isMonitoring) {
    return;
  }

  try {
    if (Platform.OS === 'android') {
      AppBlockingModule.stopAppBlockingService();
    }
    
    isMonitoring = false;
    BackgroundTimer.stopBackgroundTimer();
    console.log('App monitoring service stopped');
    
    // Hide any active overlay
    if (currentBlockedApp) {
      currentBlockedApp = null;
    }
  } catch (error) {
    console.error('Error stopping app monitoring:', error);
  }
};

const checkAndBlockApps = async () => {
  try {
    const restrictedApps = await getRestrictedApps();
    const currentTime = moment().format('HH:mm');
    const currentDay = moment().format('dddd').toLowerCase();

    // Get mock foreground app (in real implementation, this would come from native module)
    const mockForegroundApp = await getMockForegroundApp();
    
    if (mockForegroundApp && restrictedApps[mockForegroundApp.packageName]) {
      const restriction = restrictedApps[mockForegroundApp.packageName];
      
      if (shouldBlockApp(restriction, currentTime, currentDay)) {
        console.log(`Blocking app: ${mockForegroundApp.name}`);
        await showBlockingOverlay(mockForegroundApp.name, restriction);
        currentBlockedApp = mockForegroundApp.packageName;
      }
    }
  } catch (error) {
    console.error('Error checking and blocking apps:', error);
  }
};

const shouldBlockApp = (restriction, currentTime, currentDay) => {
  if (!restriction.enabled) {
    return false;
  }

  // Check if restriction is active for current day
  if (!restriction.days[currentDay]) {
    return false;
  }

  // Check if current time is within restriction period
  return currentTime >= restriction.startTime && currentTime <= restriction.endTime;
};

// Mock function to simulate detecting foreground app
const getMockForegroundApp = async () => {
  // In real implementation, this would come from native Android module
  // For demo purposes, we'll randomly return a restricted app
  const restrictedApps = await getRestrictedApps();
  const restrictedPackages = Object.keys(restrictedApps);
  
  if (restrictedPackages.length > 0) {
    // Simulate detecting a restricted app 30% of the time for demo
    if (Math.random() < 0.3) {
      const randomPackage = restrictedPackages[Math.floor(Math.random() * restrictedPackages.length)];
      return {
        packageName: randomPackage,
        name: randomPackage.split('.').pop() // Extract app name from package
      };
    }
  }
  
  return null;
};

export const isMonitoringActive = () => {
  return isMonitoring;
};