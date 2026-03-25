import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../types';

interface StoreCardProps {
  store: Store;
  onPress: () => void;
}

const getCategoryIcon = (category: string): string => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes('restaurante') || lowerCategory.includes('comida')) return 'restaurant-outline';
  if (lowerCategory.includes('farmacia')) return 'medkit-outline';
  if (lowerCategory.includes('supermercado') || lowerCategory.includes('tienda')) return 'cart-outline';
  if (lowerCategory.includes('panadería') || lowerCategory.includes('pastelería')) return 'cafe-outline';
  if (lowerCategory.includes('floristería') || lowerCategory.includes('flores')) return 'flower-outline';
  if (lowerCategory.includes('carnicería')) return 'nutrition-outline';
  if (lowerCategory.includes('pescadería')) return 'fish-outline';
  return 'storefront-outline';
};

export const StoreCard: React.FC<StoreCardProps> = ({ store, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name={getCategoryIcon(store.category) as any} size={32} color="#FF6B35" />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{store.name}</Text>
        <Text style={styles.category}>{store.category}</Text>
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color="#999" />
          <Text style={styles.address} numberOfLines={1}>{store.address}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#CCC" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: '#FF6B35',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
    flex: 1,
  },
});
