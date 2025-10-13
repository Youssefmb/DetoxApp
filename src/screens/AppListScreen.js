import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { GlobalStyles, Colors } from '../styles/GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getInstalledApps } from '../services/AppService';
import { getRestrictedApps } from '../services/StorageService';

const AppListScreen = ({ navigation }) => {
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [restrictedApps, setRestrictedApps] = useState({});

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    filterApps();
  }, [searchQuery, apps]);

  const loadApps = async () => {
    try {
      setLoading(true);
      const installedApps = await getInstalledApps();
      const restricted = await getRestrictedApps();
      
      setApps(installedApps);
      setRestrictedApps(restricted);
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApps = () => {
    if (!searchQuery) {
      setFilteredApps(apps);
      return;
    }
    
    const filtered = apps.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredApps(filtered);
  };

  const handleAppPress = (app) => {
    navigation.navigate('Restriction', { app });
  };

  const isAppRestricted = (packageName) => {
    return restrictedApps[packageName];
  };

  const renderAppItem = ({ item }) => (
    <TouchableOpacity 
      style={GlobalStyles.card}
      onPress={() => handleAppPress(item)}
    >
      <View style={[GlobalStyles.row, GlobalStyles.spaceBetween]}>
        <View style={[GlobalStyles.row, { flex: 1 }]}>
          {item.icon ? (
            <Image 
              source={{ uri: `data:image/png;base64,${item.icon}` }} 
              style={{ width: 40, height: 40, borderRadius: 8 }}
            />
          ) : (
            <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: Colors.grayLight, 
              alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="android" size={24} color={Colors.gray} />
            </View>
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[GlobalStyles.text, { fontWeight: '600' }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[GlobalStyles.textMuted, { fontSize: 12 }]} numberOfLines={1}>
              {item.packageName}
            </Text>
          </View>
        </View>
        
        <View style={[GlobalStyles.row, { alignItems: 'center' }]}>
          {isAppRestricted(item.packageName) && (
            <View style={[GlobalStyles.badge, { backgroundColor: Colors.success, marginRight: 8 }]}>
              <Text style={GlobalStyles.badgeText}>Restricted</Text>
            </View>
          )}
          <Icon name="chevron-right" size={20} color={Colors.gray} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[GlobalStyles.container, GlobalStyles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[GlobalStyles.text, { marginTop: 16 }]}>Loading installed apps...</Text>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      {/* Search Bar */}
      <View style={[GlobalStyles.card, { margin: 16, marginBottom: 0 }]}>
        <View style={[GlobalStyles.row, { alignItems: 'center' }]}>
          <Icon name="magnify" size={20} color={Colors.gray} />
          <TextInput
            style={[GlobalStyles.input, { borderWidth: 0, flex: 1, marginLeft: 8 }]}
            placeholder="Search apps..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={Colors.gray} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* App List */}
      <FlatList
        data={filteredApps}
        renderItem={renderAppItem}
        keyExtractor={(item) => item.packageName}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[GlobalStyles.center, { padding: 32 }]}>
            <Icon name="apps" size={64} color={Colors.grayLight} />
            <Text style={[GlobalStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              {searchQuery ? 'No apps found matching your search' : 'No apps found'}
            </Text>
          </View>
        }
      />

      {/* View Restricted Apps Button */}
      <TouchableOpacity 
        style={[GlobalStyles.button, { margin: 16 }]}
        onPress={() => navigation.navigate('RestrictedApps')}
      >
        <Text style={GlobalStyles.buttonText}>View Restricted Apps</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AppListScreen;