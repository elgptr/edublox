import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageItem {
  [key: string]: any;
}

export const storageService = {
  /**
   * Save data to local storage
   */
  async save(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
      throw e;
    }
  },

  /**
   * Retrieve data from local storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? (JSON.parse(jsonValue) as T) : null;
    } catch (e) {
      console.error(`Error getting ${key} from storage:`, e);
      throw e;
    }
  },

  /**
   * Remove specific item from storage
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key} from storage:`, e);
      throw e;
    }
  },

  /**
   * Clear all storage
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Error clearing all storage:', e);
      throw e;
    }
  },
};
