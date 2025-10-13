import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
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
        startAppMonitoring();
      }
      
      setServicesReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setServicesReady(true); // Continue anyway
    }
  };

  if (!servicesReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Initializing Restricto...</Text>
      </View>
    );
  }

  return <AppNavigator />;
};

export default App;