import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { startAppMonitoring, stopAppMonitoring } from './src/services/BackgroundService';
import { checkPermissions } from './src/services/PermissionService';

const App = () => {
  const [servicesReady, setServicesReady] = useState(false);

  useEffect(() => {
    initializeApp();
    
    return () => {
      // Cleanup when app is closed
      stopAppMonitoring();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Check permissions and start services
      const hasPermissions = await checkPermissions();
      
      if (hasPermissions.usageAccess && hasPermissions.overlay) {
        // Start the app blocking service
        await startAppMonitoring();
        Alert.alert(
          '✅ Protection Active',
          'Restricto is now monitoring and blocking restricted apps during your specified times.',
          [{ text: 'Got it' }]
        );
      } else {
        // Alert.alert(
        //   '⚠️ Permissions Needed',
        //   'Please grant all permissions in Settings for app blocking to work properly.',
        //   [{ text: 'Open Settings', onPress: () => {} }]
        // );
      }
      
      setServicesReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setServicesReady(true); // Continue anyway
    }
  };

  if (!servicesReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6366f1' }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Restricto</Text>
        <Text style={{ color: 'white', marginTop: 10 }}>Initializing app protection...</Text>
      </View>
    );
  }

  return <AppNavigator />;
};

export default App;