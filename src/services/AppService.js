import { Platform, NativeModules } from 'react-native';
import { checkPermissions } from './PermissionService';

const { AppListeModule } = NativeModules;

// Mock data as fallback
// const MOCK_APPS = [
//   {
//     name: 'Facebook',
//     packageName: 'com.facebook.katana',
//     icon: null
//   },
//   {
//     name: 'Instagram',
//     packageName: 'com.instagram.android',
//     icon: null
//   },
//   {
//     name: 'Twitter', 
//     packageName: 'com.twitter.android',
//     icon: null
//   },
//   {
//     name: 'WhatsApp',
//     packageName: 'com.whatsapp',
//     icon: null
//   },
//   {
//     name: 'Chrome',
//     packageName: 'com.android.chrome',
//     icon: null
//   }
// ];

export const getInstalledApps = async () => {
  try {
    // Check if we have necessary permissions
    const hasPermissions = await checkPermissions();

    if (!hasPermissions) {
      console.warn('Missing permissions for getting installed apps');
      // return MOCK_APPS;
    }

    // Use native module to get real installed apps
    if (Platform.OS === 'android' && AppListeModule) {
      try {
        const apps = await AppListeModule.getNonSystemApps();
        console.log(`Found ${apps.length} installed apps`);

        // Process the apps to ensure they have the correct structure
        const processedApps = apps.map(app => ({
          name: app.name || 'Unknown App',
          packageName: app.packageName,
          icon: app.icon || null
        }));

        return processedApps;
      } catch (nativeError) {
        console.error('Error getting apps from native module:', nativeError);
        // return MOCK_APPS;
      }
    } else {
      console.warn('Native module not available, using mock data');
      // return MOCK_APPS;
    }
  } catch (error) {
    console.error('Error getting installed apps:', error);
    // return MOCK_APPS; // Fallback to mock data
  }
};

export const getAllInstalledApps = async () => {
  try {
    if (Platform.OS === 'android' && AppListeModule) {
      const apps = await AppListeModule.getInstalledApps();
      return apps.map(app => ({
        name: app.name || 'Unknown App',
        packageName: app.packageName,
        icon: app.icon || null
      }));
    }
    return await getInstalledApps();
  } catch (error) {
    console.error('Error getting all installed apps:', error);
    // return MOCK_APPS;
  }
};

export const getForegroundApp = async () => {
  try {
    // This will be implemented in the AppBlockingModule
    // For now, return null
    return null;
  } catch (error) {
    console.error('Error getting foreground app:', error);
    return null;
  }
};

// Helper function to get app icon URL from base64
export const getAppIconSource = (app) => {
  if (app.icon) {
    return { uri: `data:image/png;base64,${app.icon}` };
  }
  return null;
};