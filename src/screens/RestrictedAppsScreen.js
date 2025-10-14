import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { GlobalStyles, Colors } from '../styles/GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getRestrictedApps, deleteRestriction } from '../services/StorageService';
import { getInstalledApps } from '../services/AppService';
import moment from 'moment';

const RestrictedAppsScreen = ({ navigation }) => {
  const [restrictedApps, setRestrictedApps] = useState({});
  const [installedApps, setInstalledApps] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [restricted, installed] = await Promise.all([
        getRestrictedApps(),
        getInstalledApps()
      ]);
      setRestrictedApps(restricted);
      setInstalledApps(installed);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getAppInfo = (packageName) => {
    return installedApps.find(app => app.packageName === packageName) || {
      name: packageName,
      packageName
    };
  };

  const handleEdit = (packageName) => {
    const app = getAppInfo(packageName);
    navigation.navigate('Restriction', { app });
  };

  const handleDelete = (packageName) => {
    const app = getAppInfo(packageName);
    Alert.alert(
      'Delete Restriction',
      `Are you sure you want to remove restriction for ${app.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteRestriction(packageName);
            loadData();
          }
        }
      ]
    );
  };

  const isCurrentlyRestricted = (restriction) => {
    if (!restriction.enabled) return false;

    const now = moment();
    const currentTime = now.format('HH:mm');
    const currentDay = now.format('dddd').toLowerCase();

    // Check if restriction is active for current day
    if (!restriction.days[currentDay]) return false;

    // Check if current time is within restriction period
    return currentTime >= restriction.startTime && currentTime <= restriction.endTime;
  };

  const renderRestrictedApp = ({ item: packageName }) => {
    const app = getAppInfo(packageName);
    const restriction = restrictedApps[packageName];
    const isActive = isCurrentlyRestricted(restriction);

    return (
      <View style={GlobalStyles.card}>
        <View style={[GlobalStyles.row, GlobalStyles.spaceBetween]}>
          <View style={[GlobalStyles.row, { flex: 1 }]}>
            <View style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 20, 
              backgroundColor: isActive ? Colors.danger : Colors.success,
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: 12 
            }}>
              <Icon 
                name={isActive ? 'lock' : 'lock-open'} 
                size={20} 
                color="#fff" 
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[GlobalStyles.text, { fontWeight: '600' }]} numberOfLines={1}>
                {app.name}
              </Text>
              <Text style={[GlobalStyles.textMuted, { fontSize: 12 }]}>
                {restriction.startTime} - {restriction.endTime}
              </Text>
              <View style={[GlobalStyles.row, { marginTop: 4 }]}>
                {Object.entries(restriction.days)
                  .filter(([_, enabled]) => enabled)
                  .map(([day]) => (
                    <Text key={day} style={[GlobalStyles.textMuted, { fontSize: 10, marginRight: 4 }]}>
                      {day.slice(0, 3)}
                    </Text>
                  ))
                }
              </View>
            </View>
          </View>

          <View style={[GlobalStyles.row, { alignItems: 'center' }]}>
            <TouchableOpacity 
              style={{ padding: 8, marginRight: 8 }}
              onPress={() => handleEdit(packageName)}
            >
              <Icon name="pencil" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ padding: 8 }}
              onPress={() => handleDelete(packageName)}
            >
              <Icon name="delete" size={20} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[GlobalStyles.row, { marginTop: 8, alignItems: 'center' }]}>
          <View 
            style={{ 
              width: 8, 
              height: 8, 
              borderRadius: 4, 
              backgroundColor: isActive ? Colors.danger : Colors.success,
              marginRight: 8 
            }} 
          />
          <Text style={[GlobalStyles.textMuted, { fontSize: 12 }]}>
            {isActive ? 'Currently restricted' : 'Not active now'}
          </Text>
        </View>
      </View>
    );
  };

  const restrictedAppsList = Object.keys(restrictedApps);

  return (
    <View style={GlobalStyles.container}>
      {restrictedAppsList.length === 0 ? (
        <View style={[GlobalStyles.center, { flex: 1, padding: 32 }]}>
          <Icon name="shield-off" size={64} color={Colors.grayLight} />
          <Text style={[GlobalStyles.title, { textAlign: 'center', marginTop: 16 }]}>
            No Restrictions Set
          </Text>
          <Text style={[GlobalStyles.text, { textAlign: 'center', marginTop: 8 }]}>
            You set any app restrictions yet. Start by selecting apps to restrict.
          </Text>
          <TouchableOpacity 
            style={[GlobalStyles.button, { marginTop: 24 }]}
            onPress={() => navigation.navigate('AppList')}
          >
            <Text style={GlobalStyles.buttonText}>Add Restriction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={restrictedAppsList}
          renderItem={renderRestrictedApp}
          keyExtractor={(item) => item}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadData} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default RestrictedAppsScreen;