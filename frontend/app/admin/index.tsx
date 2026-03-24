import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Stats } from '../../src/types';
import { getStats } from '../../src/services/api';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';

export default function AdminHomeScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Cargando estadísticas..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9C27B0']} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administración</Text>
        <Text style={styles.subtitle}>Gestiona tu servicio de reparto</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statPrimary]}>
          <Ionicons name="receipt" size={28} color="#FFF" />
          <Text style={styles.statValue}>{stats?.total_orders || 0}</Text>
          <Text style={styles.statLabel}>Total Pedidos</Text>
        </View>
        <View style={[styles.statCard, styles.statWarning]}>
          <Ionicons name="time" size={28} color="#FFF" />
          <Text style={styles.statValue}>{stats?.pending_orders || 0}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={[styles.statCard, styles.statInfo]}>
          <Ionicons name="bicycle" size={28} color="#FFF" />
          <Text style={styles.statValue}>{stats?.active_orders || 0}</Text>
          <Text style={styles.statLabel}>En Reparto</Text>
        </View>
        <View style={[styles.statCard, styles.statSuccess]}>
          <Ionicons name="checkmark-circle" size={28} color="#FFF" />
          <Text style={styles.statValue}>{stats?.delivered_orders || 0}</Text>
          <Text style={styles.statLabel}>Entregados</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStatItem}>
          <View style={styles.quickStatIcon}>
            <Ionicons name="storefront" size={24} color="#9C27B0" />
          </View>
          <View>
            <Text style={styles.quickStatValue}>{stats?.total_stores || 0}</Text>
            <Text style={styles.quickStatLabel}>Tiendas</Text>
          </View>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStatItem}>
          <View style={styles.quickStatIcon}>
            <Ionicons name="people" size={24} color="#9C27B0" />
          </View>
          <View>
            <Text style={styles.quickStatValue}>{stats?.total_drivers || 0}</Text>
            <Text style={styles.quickStatLabel}>Repartidores</Text>
          </View>
        </View>
        <View style={styles.quickStatDivider} />
        <View style={styles.quickStatItem}>
          <View style={styles.quickStatIcon}>
            <Ionicons name="flash" size={24} color="#4CAF50" />
          </View>
          <View>
            <Text style={styles.quickStatValue}>{stats?.available_drivers || 0}</Text>
            <Text style={styles.quickStatLabel}>Disponibles</Text>
          </View>
        </View>
      </View>

      {/* Menu Options */}
      <Text style={styles.sectionTitle}>Gestión</Text>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/admin/orders')}
      >
        <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
          <Ionicons name="list" size={24} color="#4CAF50" />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Todos los Pedidos</Text>
          <Text style={styles.menuDescription}>Ver y gestionar todos los pedidos</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#CCC" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/admin/stores')}
      >
        <View style={[styles.menuIcon, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="storefront" size={24} color="#FF9800" />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Tiendas</Text>
          <Text style={styles.menuDescription}>Añadir y editar establecimientos</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#CCC" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push('/admin/drivers')}
      >
        <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="people" size={24} color="#2196F3" />
        </View>
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>Repartidores</Text>
          <Text style={styles.menuDescription}>Gestionar equipo de reparto</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#CCC" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/')}
      >
        <Ionicons name="arrow-back" size={20} color="#666" />
        <Text style={styles.backButtonText}>Volver al inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    margin: '1.5%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statPrimary: {
    backgroundColor: '#9C27B0',
  },
  statWarning: {
    backgroundColor: '#FF9800',
  },
  statInfo: {
    backgroundColor: '#2196F3',
  },
  statSuccess: {
    backgroundColor: '#4CAF50',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  quickStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#EEE',
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  menuDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginTop: 8,
  },
  backButtonText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
  },
});
