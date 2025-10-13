import AsyncStorage from '@react-native-async-storage/async-storage';

const RESTRICTIONS_KEY = '@restricto_restrictions';

export const saveRestriction = async (packageName, restriction) => {
  try {
    const existingRestrictions = await getRestrictedApps();
    const updatedRestrictions = {
      ...existingRestrictions,
      [packageName]: restriction
    };
    
    await AsyncStorage.setItem(RESTRICTIONS_KEY, JSON.stringify(updatedRestrictions));
    return true;
  } catch (error) {
    console.error('Error saving restriction:', error);
    throw error;
  }
};

export const getRestriction = async (packageName) => {
  try {
    const restrictions = await getRestrictedApps();
    return restrictions[packageName] || null;
  } catch (error) {
    console.error('Error getting restriction:', error);
    return null;
  }
};

export const getRestrictedApps = async () => {
  try {
    const restrictionsJson = await AsyncStorage.getItem(RESTRICTIONS_KEY);
    return restrictionsJson ? JSON.parse(restrictionsJson) : {};
  } catch (error) {
    console.error('Error getting restricted apps:', error);
    return {};
  }
};

export const deleteRestriction = async (packageName) => {
  try {
    const existingRestrictions = await getRestrictedApps();
    const { [packageName]: removed, ...updatedRestrictions } = existingRestrictions;
    
    await AsyncStorage.setItem(RESTRICTIONS_KEY, JSON.stringify(updatedRestrictions));
    return true;
  } catch (error) {
    console.error('Error deleting restriction:', error);
    throw error;
  }
};

export const clearAllRestrictions = async () => {
  try {
    await AsyncStorage.removeItem(RESTRICTIONS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing restrictions:', error);
    throw error;
  }
};