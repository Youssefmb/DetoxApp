import { Alert, Linking, NativeModules, PermissionsAndroid, Platform } from 'react-native';

// Use our native modules for overlay and usage stats checks
const { OverlayPermissionModule } = NativeModules;

export const checkPermissions = async () => {
    if (Platform.OS !== 'android') {
        return {
            usageAccess: true,
            overlay: true,
            notification: true
        };
    }

    try {
        const [usageAccess, overlay, notification] = await Promise.all([
            checkUsageAccessPermission(),
            checkOverlayPermission(),
            checkNotificationPermission(),
        ]);

        return {
            usageAccess,
            overlay,
            notification
        };
    } catch (error) {
        console.error('Error checking permissions:', error);
        return {
            usageAccess: false,
            overlay: false,
            notification: false
        };
    }
};

// Real implementation for Usage Access Permission
const checkUsageAccessPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
        if (OverlayPermissionModule?.checkUsageStatsPermission) {
            const hasUsageAccess = await OverlayPermissionModule.checkUsageStatsPermission();
            return !!hasUsageAccess;
        }
        return false;
    } catch (error) {
        console.error('Error checking usage access:', error);
        return false;
    }
};

// Real implementation for Overlay Permission
const checkOverlayPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
        if (Platform.Version >= 23 && OverlayPermissionModule?.checkOverlayPermission) {
            const canDrawOverlays = await OverlayPermissionModule.checkOverlayPermission();
            return !!canDrawOverlays;
        }
        return true; // Below Android M, overlay is granted by default
    } catch (error) {
        console.error('Error checking overlay permission:', error);
        return false;
    }
};

// Native method to check overlay permission
// Notification Permission
const checkNotificationPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
        // For Android 13 (API 33) and above
        if (Platform.Version >= 33) {
            const hasNotificationPermission = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            return hasNotificationPermission;
        }
        // Below Android 13, notification permission is granted by default
        return true;
    } catch (error) {
        console.error('Error checking notification permission:', error);
        return true; // Default to true for older Android versions
    }
};

export const requestPermissions = async (permissionType) => {
    try {
        switch (permissionType) {
            case 'usageAccess':
                return await requestUsageAccessPermission();
            case 'overlay':
                return await requestOverlayPermission();
            case 'notification':
                return await requestNotificationPermission();
            default:
                return false;
        }
    } catch (error) {
        console.error('Error requesting permission:', error);
        return false;
    }
};

const requestUsageAccessPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
        // Try to open the Usage Access settings directly (Android-only)
        try {
            await Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS');
            return false;
        } catch (intentError) {
            console.warn('Unable to open usage access settings via intent, falling back:', intentError);
        }

        Alert.alert(
            'Usage Access Required',
            "Restricto needs usage access permission to monitor which apps you're using. Please enable it in settings.",
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Settings',
                    onPress: () => openUsageAccessSettings(),
                },
            ],
        );
        return false;
    } catch (error) {
        console.error('Error requesting usage access permission:', error);
        return false;
    }
};

const requestOverlayPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
        if (Platform.Version >= 23 && OverlayPermissionModule?.requestOverlayPermission) {
            await OverlayPermissionModule.requestOverlayPermission();
            return false;
        }

        Alert.alert(
            'Overlay Permission Required',
            'Restricto needs to display over other apps to show blocking overlays. Please enable this permission in settings.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Settings',
                    onPress: () => openOverlaySettings(),
                },
            ],
        );
        return false;
    } catch (error) {
        console.error('Error requesting overlay permission:', error);
        return false;
    }
};

const requestNotificationPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
        // For Android 13+, request notification permission
        if (Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                {
                    title: 'Notification Permission',
                    message: 'Restricto needs notification permissions to alert you about app usage.',
                    buttonPositive: 'Allow',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true; // Granted by default for older versions
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return true;
    }
};

// Export individual permission checkers
export const hasUsageAccessPermission = checkUsageAccessPermission;
export const hasOverlayPermission = checkOverlayPermission;

export const openUsageAccessSettings = () => {
    if (Platform.OS === 'android') {
        // Open usage access settings list
        Linking.openURL('android.settings.USAGE_ACCESS_SETTINGS').catch(() => {
            Linking.openSettings();
        });
    } else {
        Linking.openSettings();
    }
};

export const openOverlaySettings = () => {
    if (Platform.OS === 'android') {
        Linking.openURL('android.settings.action.MANAGE_OVERLAY_PERMISSION').catch(() => {
            Linking.openSettings();
        });
    } else {
        Linking.openSettings();
    }
};

// Helper function to check if usage stats permission is granted
export const checkUsageStatsPermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
        // This is a more reliable way to check usage stats permission
        const hasPermission = await PermissionsAndroid.check(
            'android.permission.PACKAGE_USAGE_STATS'
        );
        return hasPermission;
    } catch (error) {
        console.error('Error checking usage stats permission:', error);
        return false;
    }
};