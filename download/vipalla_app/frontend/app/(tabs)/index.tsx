import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../../src/types';
import { getStores } from '../../src/services/api';
import { StoreCard } from '../../src/components/StoreCard';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';

export default function StoresScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'Todas', icon: 'grid-outline' },
    { id: 'restaurante', name: 'Restaurantes', icon: 'restaurant-outline' },
    { id: 'supermercado', name: 'Supermercados', icon: 'cart-outline' },
    { id: 'farmacia', name: 'Farmacias', icon: 'medkit-outline' },
    { id: 'panadería', name: 'Panaderías', icon: 'cafe-outline' },
    { id: 'otros', name: 'Otros', icon: 'storefront-outline' },
  ];

  const fetchStores = async () => {
    try {
      const data = await getStores();
      setStores(data);
      setFilteredStores(data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    let filtered = stores;

    if (searchQuery) {
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((store) =>
        store.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    setFilteredStores(filtered);
  }, [searchQuery, selectedCategory, stores]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStores();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Cargando tiendas..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tiendas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              (selectedCategory === cat.id || (!selectedCategory && cat.id === 'all')) &&
                styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={
                (selectedCategory === cat.id || (!selectedCategory && cat.id === 'all'))
                  ? '#FFF'
                  : '#666'
              }
            />
            <Text
              style={[
                styles.categoryText,
                (selectedCategory === cat.id || (!selectedCategory && cat.id === 'all')) &&
                  styles.categoryTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.storesList}
        contentContainerStyle={styles.storesContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />
        }
      >
        {filteredStores.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No hay tiendas disponibles</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory
                ? 'Prueba con otra búsqueda o categoría'
                : 'Las tiendas aparecerán aquí'}
            </Text>
          </View>
        ) : (
          filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onPress={() => router.push(`/order/${store.id}`)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
    color: '#333',
  },
  categoriesContainer: {
    backgroundColor: '#FFF',
    maxHeight: 56,
  },
  categoriesContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryChipActive: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  storesList: {
    flex: 1,
  },
  storesContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});
