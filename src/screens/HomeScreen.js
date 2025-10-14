import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { GlobalStyles, Colors } from '../styles/GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { checkPermissions } from '../services/PermissionService';
import { getRestrictedApps } from '../services/StorageService';

const HomeScreen = ({ navigation }) => {
  const [restrictedAppsCount, setRestrictedAppsCount] = useState(0);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const apps = await getRestrictedApps();
    setRestrictedAppsCount(Object.keys(apps).length);

    const hasPermissions = await checkPermissions();
    setPermissionsGranted(hasPermissions);
  };

  const handleGetStarted = () => {
    if (!permissionsGranted) {
      Alert.alert(
        'Permissions Required',
        'Restricto needs special permissions to monitor and restrict apps. Please grant the required permissions to continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permissions', onPress: () => navigation.navigate('Settings') }
        ]
      );
      return;
    }
    navigation.navigate('AppList');
  };

  const FeatureCard = ({ icon, title, description, color }) => (
    <View style={[GlobalStyles.card, { borderLeftWidth: 4, borderLeftColor: color }]}>
      <View style={[GlobalStyles.row, { marginBottom: 8 }]}>
        <Icon name={icon} size={24} color={color} />
        <Text style={[GlobalStyles.subtitle, { marginLeft: 12, flex: 1 }]}>{title}</Text>
      </View>
      <Text style={GlobalStyles.textMuted}>{description}</Text>
    </View>
  );

  return (
    <ScrollView style={GlobalStyles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View style={[GlobalStyles.card, { backgroundColor: Colors.primary }]}>
        <Text style={[GlobalStyles.title, { color: '#fff', textAlign: 'center' }]}>
          Take Control of Your Time
        </Text>
        <Text style={[GlobalStyles.text, { color: '#fff', textAlign: 'center', marginTop: 8 }]}>
          Block distracting apps during your focused hours and boost your productivity
        </Text>
        <View style={[GlobalStyles.card, { backgroundColor: Colors.light }]}>
          <View style={[GlobalStyles.row, GlobalStyles.spaceBetween]}>
            <View style={[GlobalStyles.row, { alignItems: 'center' }]}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: permissionsGranted ? Colors.success : Colors.warning,
                  marginRight: 8
                }}
              />
              <Text style={GlobalStyles.text}>
                {permissionsGranted ? 'Protection Active' : 'Setup Required'}
              </Text>
            </View>
            <TouchableOpacity
              style={[GlobalStyles.badge, { backgroundColor: Colors.primary }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={GlobalStyles.badgeText}>
                {permissionsGranted ? 'ACTIVE' : 'SETUP'}
              </Text>
            </TouchableOpacity>
          </View>

          {!permissionsGranted && (
            <Text style={[GlobalStyles.textMuted, { fontSize: 14, marginTop: 8 }]}>
              Grant permissions in Settings to enable app blocking
            </Text>
          )}
        </View>
        <View style={[GlobalStyles.row, { justifyContent: 'space-around', marginTop: 24 }]}>
          <View style={GlobalStyles.center}>
            <Text style={[GlobalStyles.title, { color: '#fff', fontSize: 32 }]}>
              {restrictedAppsCount}
            </Text>
            <Text style={[GlobalStyles.text, { color: '#fff', fontSize: 14 }]}>
              Apps Restricted
            </Text>
          </View>
          <View style={GlobalStyles.center}>
            <Icon
              name={permissionsGranted ? 'shield-check' : 'shield-alert'}
              size={32}
              color={permissionsGranted ? Colors.success : Colors.warning}
            />
            <Text style={[GlobalStyles.text, { color: '#fff', fontSize: 14, marginTop: 4 }]}>
              {permissionsGranted ? 'Active' : 'Setup Required'}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={{ marginVertical: 24 }}>
        <Text style={GlobalStyles.subtitle}>Quick Actions</Text>
        <View style={[GlobalStyles.row, { flexWrap: 'wrap', justifyContent: 'space-between' }]}>
          <TouchableOpacity
            style={[GlobalStyles.card, { width: '48%', alignItems: 'center' }]}
            onPress={() => navigation.navigate('AppList')}
          >
            <Icon name="plus-circle" size={32} color={Colors.primary} />
            <Text style={[GlobalStyles.text, { marginTop: 8, fontWeight: '600' }]}>
              Add Restriction
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[GlobalStyles.card, { width: '48%', alignItems: 'center' }]}
            onPress={() => navigation.navigate('RestrictedApps')}
          >
            <Icon name="view-list" size={32} color={Colors.primary} />
            <Text style={[GlobalStyles.text, { marginTop: 8, fontWeight: '600' }]}>
              View Restricted
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features */}
      <View style={{ marginBottom: 24 }}>
        <Text style={GlobalStyles.subtitle}>How It Works</Text>
        <FeatureCard
          icon="apps"
          title="Select Apps"
          description="Choose which apps you want to restrict from your installed applications"
          color={Colors.primary}
        />
        <FeatureCard
          icon="clock-outline"
          title="Set Schedule"
          description="Define specific time ranges when these apps should be blocked"
          color={Colors.secondary}
        />
        <FeatureCard
          icon="shield-lock"
          title="Automatic Blocking"
          description="The app automatically prevents access to restricted apps during scheduled times"
          color={Colors.success}
        />
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        style={[GlobalStyles.button, { marginTop: 16 }]}
        onPress={handleGetStarted}
      >
        <Text style={GlobalStyles.buttonText}>
          {permissionsGranted ? 'Manage Restrictions' : 'Setup Permissions'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default HomeScreen;