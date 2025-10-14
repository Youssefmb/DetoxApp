import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  NativeModules,
} from 'react-native';
import { GlobalStyles, Colors } from '../styles/GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  checkPermissions, 
  requestPermissions,
  openUsageAccessSettings,
  openOverlaySettings 
} from '../services/PermissionService';

const { OverlayPermissionModule } = NativeModules;

const SettingsScreen = () => {
  const [permissions, setPermissions] = useState({
    usageAccess: false,
    overlay: false,
    notification: false,
  });
  const [backgroundService, setBackgroundService] = useState(true);

  useEffect(() => {
    checkPermissionStatus();
    
    // Refresh permissions periodically since we can't use navigation focus
    const interval = setInterval(() => {
      checkPermissionStatus();
    }, 2000); // Check every 2 seconds when screen is open
    
    return () => clearInterval(interval);
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const status = await checkPermissions();
      setPermissions(status);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const handlePermissionRequest = async (permissionType) => {
    try {
      const granted = await requestPermissions(permissionType);
      
      // Re-check permissions after a short delay to see if user granted them
      setTimeout(() => {
        checkPermissionStatus();
      }, 1000);
      
      if (!granted && permissionType !== 'notification') {
        // For usageAccess and overlay, we need to guide user to settings
        Alert.alert(
          'Permission Required',
          `Restricto needs ${permissionType} permission to function properly. Please grant the permission in settings.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (permissionType === 'usageAccess') {
                  openUsageAccessSettings();
                } else if (permissionType === 'overlay') {
                  openOverlaySettings();
                }
              }
            }
          ]
        );
      } else if (granted) {
        Alert.alert('Success', `${permissionType} permission granted`);
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      Alert.alert('Error', `Failed to request ${permissionType} permission`);
    }
  };

  const PermissionItem = ({ 
    icon, 
    title, 
    description, 
    permissionType, 
    granted 
  }) => (
    <View style={GlobalStyles.card}>
      <View style={[GlobalStyles.row, { marginBottom: 8 }]}>
        <Icon 
          name={icon} 
          size={24} 
          color={granted ? Colors.success : Colors.warning} 
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[GlobalStyles.text, { fontWeight: '600' }]}>{title}</Text>
          <Text style={[GlobalStyles.textMuted, { fontSize: 14, marginTop: 4 }]}>
            {description}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          GlobalStyles.button, 
          { 
            backgroundColor: granted ? Colors.success : Colors.primary,
            paddingVertical: 8 
          }
        ]}
        onPress={() => handlePermissionRequest(permissionType)}
      >
        <Text style={GlobalStyles.buttonText}>
          {granted ? 'Granted' : 'Grant Permission'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={GlobalStyles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Permissions Section */}
      <Text style={GlobalStyles.subtitle}>App Permissions</Text>
      
      <PermissionItem
        icon="eye"
        title="Usage Access"
        description="Required to monitor which apps are currently in use"
        permissionType="usageAccess"
        granted={permissions.usageAccess}
      />
      
      <PermissionItem
        icon="layers"
        title="Display Over Other Apps"
        description="Required to show blocking overlay when restricted apps are opened"
        permissionType="overlay"
        granted={permissions.overlay}
      />
      
      <PermissionItem
        icon="bell"
        title="Notifications"
        description="Required to show notifications when restrictions are triggered"
        permissionType="notification"
        granted={permissions.notification}
      />

      {/* Background Service */}
      <View style={GlobalStyles.card}>
        <View style={[GlobalStyles.row, GlobalStyles.spaceBetween]}>
          <View style={{ flex: 1 }}>
            <Text style={[GlobalStyles.text, { fontWeight: '600' }]}>
              Background Service
            </Text>
            <Text style={[GlobalStyles.textMuted, { fontSize: 14, marginTop: 4 }]}>
              Continuously monitor app usage and enforce restrictions
            </Text>
          </View>
          <Switch
            value={backgroundService}
            onValueChange={setBackgroundService}
            trackColor={{ false: Colors.grayLight, true: Colors.primary }}
            thumbColor={backgroundService ? Colors.primaryDark : Colors.gray}
          />
        </View>
      </View>

      {/* App Info */}
      <View style={GlobalStyles.card}>
        <Text style={[GlobalStyles.text, { fontWeight: '600', marginBottom: 12 }]}>
          About Restricto
        </Text>
        <Text style={[GlobalStyles.textMuted, { marginBottom: 8 }]}>
          Version: 1.0.0
        </Text>
        <Text style={GlobalStyles.textMuted}>
          Restricto helps you stay focused by blocking distracting apps during your specified time periods.
        </Text>
      </View>

      {/* Support */}
      <TouchableOpacity style={GlobalStyles.card}>
        <View style={GlobalStyles.row}>
          <Icon name="help-circle" size={24} color={Colors.primary} />
          <Text style={[GlobalStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
            Help & Support
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={GlobalStyles.card}>
        <View style={GlobalStyles.row}>
          <Icon name="shield-check" size={24} color={Colors.primary} />
          <Text style={[GlobalStyles.text, { fontWeight: '600', marginLeft: 12 }]}>
            Privacy Policy
          </Text>
        </View>
      </TouchableOpacity>

      {/* Refresh Button */}
      <TouchableOpacity 
        style={[GlobalStyles.button, { marginTop: 16 }]}
        onPress={checkPermissionStatus}
      >
        <Text style={GlobalStyles.buttonText}>Refresh Permission Status</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsScreen;