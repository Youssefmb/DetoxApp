import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import AppListScreen from '../screens/AppListScreen';
import RestrictionScreen from '../screens/RestrictionScreen';
import RestrictedAppsScreen from '../screens/RestrictedAppsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#6366f1" barStyle="light-content" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          cardStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Restricto' }}
        />
        <Stack.Screen 
          name="AppList" 
          component={AppListScreen}
          options={{ title: 'Select Apps' }}
        />
        <Stack.Screen 
          name="Restriction" 
          component={RestrictionScreen}
          options={{ title: 'Set Restriction' }}
        />
        <Stack.Screen 
          name="RestrictedApps" 
          component={RestrictedAppsScreen}
          options={{ title: 'Restricted Apps' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;