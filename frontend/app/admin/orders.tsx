import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, OrderStatus } from '../../src/types';
import { getOrders } from '../../src/services/api';
import { OrderCard } from '../../src/components/OrderCard';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';

const statusFilters: { key: string; label: string; color: string }[] = [
  { key: 'all', label: 'Todos', color: '#666' },
  { key: 'pending', label: 'Pendientes', color: '#FFA500' },
  { key: 'accepted', label: 'Aceptados', color: '#2196F3' },
  { key: 'picking_up', label: 'Recogiendo', color: '#9C27B0' },
  { key: 'delivering', label: 'En camino', color: '#4CAF50' },
  { key: 'delivered', label: 'Entregados', color: '#8BC34A' },
  { key: 'cancelled', label: 'Cancelados', color: '#F44336' },
];

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((o) => o.status === selectedFilter));
    }
  }, [selectedFilter, orders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const getStatusCount = (status: string): number => {
    if (status === 'all') return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  if (loading) {
    return <LoadingSpinner message="Cargando pedidos..." />;
  }

  return (
    <View style={styles.container}>
      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && { backgroundColor: filter.color },
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label} ({getStatusCount(filter.key)})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders list */}
      <ScrollView
        style={styles.ordersList}
        contentContainerStyle={styles.ordersContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9C27B0']} />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No hay pedidos</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all'
                ? 'Los pedidos aparecerán aquí'
                : 'No hay pedidos con este estado'}
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
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
  filtersContainer: {
    backgroundColor: '#FFF',
    maxHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filtersContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  ordersList: {
    flex: 1,
  },
  ordersContent: {
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
