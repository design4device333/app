import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Driver, Order } from '../../src/types';
import { getDrivers, createDriver, getPendingOrders, getActiveOrders, acceptOrder, updateOrderStatus } from '../../src/services/api';
import { OrderCard } from '../../src/components/OrderCard';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';

export default function DriverHomeScreen() {
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'my'>('available');

  useEffect(() => {
    loadDriverSession();
  }, []);

  useEffect(() => {
    if (driver) {
      fetchOrders();
    }
  }, [driver]);

  const loadDriverSession = async () => {
    try {
      const session = await AsyncStorage.getItem('driver_session');
      if (session) {
        const savedDriver = JSON.parse(session);
        setDriver(savedDriver);
      }
    } catch (error) {
      console.error('Error loading driver session:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const [pending, active] = await Promise.all([
        getPendingOrders(),
        getActiveOrders(),
      ]);
      setPendingOrders(pending);
      setMyOrders(active.filter((o) => o.driver_id === driver?.id));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRegister = async () => {
    if (!driverName.trim() || !driverPhone.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setRegistering(true);
    try {
      const newDriver = await createDriver({
        name: driverName.trim(),
        phone: driverPhone.trim(),
      });
      setDriver(newDriver);
      await AsyncStorage.setItem('driver_session', JSON.stringify(newDriver));
      Alert.alert('¡Bienvenido!', 'Te has registrado como repartidor');
    } catch (error) {
      console.error('Error registering driver:', error);
      Alert.alert('Error', 'No se pudo registrar. Inténtalo de nuevo.');
    } finally {
      setRegistering(false);
    }
  };

  const handleAcceptOrder = async (order: Order) => {
    if (!driver) return;

    Alert.alert(
      'Aceptar pedido',
      `¿Quieres aceptar el pedido de ${order.store_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            try {
              await acceptOrder(order.id, driver.id, driver.name);
              Alert.alert('¡Pedido aceptado!', 'Ve a recoger el pedido');
              fetchOrders();
            } catch (error) {
              console.error('Error accepting order:', error);
              Alert.alert('Error', 'No se pudo aceptar el pedido');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    try {
      await updateOrderStatus(order.id, newStatus as any);
      fetchOrders();
      if (newStatus === 'delivered') {
        Alert.alert('¡Entregado!', 'Pedido completado correctamente');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('driver_session');
            setDriver(null);
            router.replace('/');
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando..." />;
  }

  // Registration screen
  if (!driver) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.registerContainer}>
        <View style={styles.registerHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="bicycle" size={48} color="#2196F3" />
          </View>
          <Text style={styles.registerTitle}>Regístrate como Repartidor</Text>
          <Text style={styles.registerSubtitle}>
            Comienza a hacer entregas y ganar dinero
          </Text>
        </View>

        <View style={styles.registerForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              value={driverName}
              onChangeText={setDriverName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="612345678"
              value={driverPhone}
              onChangeText={setDriverPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={registering}
          >
            {registering ? (
              <LoadingSpinner message="" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                <Text style={styles.registerButtonText}>Registrarme</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.replace('/')}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.backLinkText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Driver dashboard
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.driverInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#2196F3" />
          </View>
          <View>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverStatus}>
              {driver.is_available ? 'Disponible' : 'Ocupado'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
            Disponibles ({pendingOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
            Mis pedidos ({myOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders list */}
      <ScrollView
        style={styles.ordersList}
        contentContainerStyle={styles.ordersContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchOrders();
          }} colors={['#2196F3']} />
        }
      >
        {activeTab === 'available' ? (
          pendingOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={64} color="#CCC" />
              <Text style={styles.emptyTitle}>No hay pedidos disponibles</Text>
              <Text style={styles.emptyText}>Desliza hacia abajo para actualizar</Text>
            </View>
          ) : (
            pendingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                showActions
                onAccept={() => handleAcceptOrder(order)}
              />
            ))
          )
        ) : (
          myOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bicycle-outline" size={64} color="#CCC" />
              <Text style={styles.emptyTitle}>No tienes pedidos activos</Text>
              <Text style={styles.emptyText}>Acepta un pedido disponible</Text>
            </View>
          ) : (
            myOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                showActions
                onUpdateStatus={(status) => handleUpdateStatus(order, status)}
              />
            ))
          )
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
  registerContainer: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  registerHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  registerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  registerSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  registerForm: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backLinkText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  driverStatus: {
    fontSize: 13,
    color: '#4CAF50',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2196F3',
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
  },
});
