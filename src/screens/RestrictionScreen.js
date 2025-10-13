import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { GlobalStyles, Colors } from '../styles/GlobalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { saveRestriction, getRestriction, deleteRestriction } from '../services/StorageService';

const RestrictionScreen = ({ navigation, route }) => {
  const { app } = route.params;
  const [restriction, setRestriction] = useState({
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
    days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    }
  });
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadRestriction();
  }, []);

  const loadRestriction = async () => {
    const existingRestriction = await getRestriction(app.packageName);
    if (existingRestriction) {
      setRestriction(existingRestriction);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await saveRestriction(app.packageName, restriction);
      Alert.alert(
        'Success',
        `Restriction for ${app.name} has been ${isEditing ? 'updated' : 'saved'} successfully`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save restriction');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Restriction',
      `Are you sure you want to remove restriction for ${app.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteRestriction(app.packageName);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleTimeSelect = (time, isStart) => {
    const timeString = moment(time).format('HH:mm');
    if (isStart) {
      setRestriction(prev => ({ ...prev, startTime: timeString }));
      setStartTimePickerVisible(false);
    } else {
      setRestriction(prev => ({ ...prev, endTime: timeString }));
      setEndTimePickerVisible(false);
    }
  };

  const toggleDay = (day) => {
    setRestriction(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: !prev.days[day]
      }
    }));
  };

  const DayButton = ({ day, label }) => (
    <TouchableOpacity
      style={[
        {
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: Colors.grayLight,
          flex: 1,
          alignItems: 'center',
          margin: 2,
        },
        restriction.days[day] && { backgroundColor: Colors.primary, borderColor: Colors.primary }
      ]}
      onPress={() => toggleDay(day)}
    >
      <Text style={[
        GlobalStyles.text,
        { fontWeight: '600' },
        restriction.days[day] && { color: '#fff' }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={GlobalStyles.container} contentContainerStyle={{ padding: 16 }}>
      {/* App Info */}
      <View style={GlobalStyles.card}>
        <View style={GlobalStyles.row}>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.grayLight,
            alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="android" size={32} color={Colors.gray} />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[GlobalStyles.text, { fontWeight: '600', fontSize: 18 }]}>
              {app.name}
            </Text>
            <Text style={[GlobalStyles.textMuted, { fontSize: 14 }]} numberOfLines={1}>
              {app.packageName}
            </Text>
          </View>
        </View>
      </View>

      {/* Enable/Disable Switch */}
      <View style={[GlobalStyles.card, GlobalStyles.row, GlobalStyles.spaceBetween]}>
        <Text style={[GlobalStyles.text, { fontWeight: '600' }]}>Enable Restriction</Text>
        <Switch
          value={restriction.enabled}
          onValueChange={(value) => setRestriction(prev => ({ ...prev, enabled: value }))}
          trackColor={{ false: Colors.grayLight, true: Colors.primary }}
          thumbColor={restriction.enabled ? Colors.primaryDark : Colors.gray}
        />
      </View>

      {restriction.enabled && (
        <>
          {/* Time Selection */}
          <View style={GlobalStyles.card}>
            <Text style={[GlobalStyles.subtitle, { marginBottom: 16 }]}>Restriction Time</Text>
            
            <View style={[GlobalStyles.row, { justifyContent: 'space-between' }]}>
              <TouchableOpacity 
                style={[GlobalStyles.button, { flex: 1, marginRight: 8 }]}
                onPress={() => setStartTimePickerVisible(true)}
              >
                <Text style={GlobalStyles.buttonText}>Start: {restriction.startTime}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[GlobalStyles.button, { flex: 1, marginLeft: 8 }]}
                onPress={() => setEndTimePickerVisible(true)}
              >
                <Text style={GlobalStyles.buttonText}>End: {restriction.endTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Days Selection */}
          <View style={GlobalStyles.card}>
            <Text style={[GlobalStyles.subtitle, { marginBottom: 16 }]}>Active Days</Text>
            <View style={[GlobalStyles.row, { flexWrap: 'wrap', marginHorizontal: -2 }]}>
              <DayButton day="monday" label="Mon" />
              <DayButton day="tuesday" label="Tue" />
              <DayButton day="wednesday" label="Wed" />
              <DayButton day="thursday" label="Thu" />
              <DayButton day="friday" label="Fri" />
              <DayButton day="saturday" label="Sat" />
              <DayButton day="sunday" label="Sun" />
            </View>
          </View>

          {/* Summary */}
          <View style={[GlobalStyles.card, { backgroundColor: Colors.light }]}>
            <Text style={[GlobalStyles.subtitle, { marginBottom: 8 }]}>Restriction Summary</Text>
            <Text style={GlobalStyles.text}>
              {app.name} will be restricted from {restriction.startTime} to {restriction.endTime} on{' '}
              {Object.entries(restriction.days)
                .filter(([_, enabled]) => enabled)
                .map(([day]) => day.slice(0, 3))
                .join(', ')}
            </Text>
          </View>
        </>
      )}

      {/* Action Buttons */}
      <View style={{ marginTop: 24 }}>
        <TouchableOpacity 
          style={[GlobalStyles.button, { marginBottom: 12 }]}
          onPress={handleSave}
          disabled={!restriction.enabled}
        >
          <Text style={GlobalStyles.buttonText}>
            {isEditing ? 'Update Restriction' : 'Save Restriction'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity 
            style={[GlobalStyles.button, GlobalStyles.buttonDanger]}
            onPress={handleDelete}
          >
            <Text style={GlobalStyles.buttonText}>Delete Restriction</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Time Pickers */}
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        onConfirm={(time) => handleTimeSelect(time, true)}
        onCancel={() => setStartTimePickerVisible(false)}
      />
      
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        onConfirm={(time) => handleTimeSelect(time, false)}
        onCancel={() => setEndTimePickerVisible(false)}
      />
    </ScrollView>
  );
};

export default RestrictionScreen;