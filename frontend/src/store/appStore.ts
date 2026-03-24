import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Driver } from '../types';

interface AppState {
  // Driver session (stored locally)
  currentDriver: Driver | null;
  setCurrentDriver: (driver: Driver | null) => void;
  loadDriverSession: () => Promise<void>;
  
  // Tracking order ID
  trackingOrderId: string | null;
  setTrackingOrderId: (orderId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentDriver: null,
  trackingOrderId: null,
  
  setCurrentDriver: async (driver) => {
    set({ currentDriver: driver });
    if (driver) {
      await AsyncStorage.setItem('driver_session', JSON.stringify(driver));
    } else {
      await AsyncStorage.removeItem('driver_session');
    }
  },
  
  loadDriverSession: async () => {
    try {
      const session = await AsyncStorage.getItem('driver_session');
      if (session) {
        set({ currentDriver: JSON.parse(session) });
      }
    } catch (error) {
      console.error('Error loading driver session:', error);
    }
  },
  
  setTrackingOrderId: (orderId) => set({ trackingOrderId: orderId }),
}));
