import { Platform } from 'react-native';
import { checkPermissions } from './PermissionService';

// Mock data for development - in production, this would use native modules
const MOCK_APPS = [
  {
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    icon: null
  },
  {
    name: 'Instagram',
    packageName: 'com.instagram.android',
    icon: null
  },
  {
    name: 'Twitter',
    packageName: 'com.twitter.android',
    icon: null
  },
  {
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    icon: null
  },
  {
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    icon: null
  },
  {
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    icon: null
  },
  {
    name: 'Chrome',
    packageName: 'com.android.chrome',
    icon: null
  }
];

export const getInstalledApps = async () => {
  try {
    // Check if we have necessary permissions
    const hasPermissions = await checkPermissions();
    
    if (!hasPermissions) {
      console.warn('Missing permissions for getting installed apps');
      return MOCK_APPS; // Return mock data for development
    }

    // In a real implementation, you would use a native module here
    // For now, return mock data
    return MOCK_APPS;
  } catch (error) {
    console.error('Error getting installed apps:', error);
    return MOCK_APPS; // Fallback to mock data
  }
};

export const getForegroundApp = async () => {
  try {
    // This would use UsageStatsManager or ActivityManager in native code
    // For now, return null and handle in the background service
    return null;
  } catch (error) {
    console.error('Error getting foreground app:', error);
    return null;
  }
};