import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { trackOrder } from '../../src/services/api';
import { Order } from '../../src/types';
import { OrderCard } from '../../src/components/OrderCard';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';

export default function TrackScreen() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async () => {
    if (!orderId.trim()) {
      Alert.alert('Error', 'Por favor ingresa un ID de pedido');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const result = await trackOrder(orderId.trim());
      setOrder(result);
    } catch (error: any) {
      console.error('Error tracking order:', error);
      setOrder(null);
      if (error.response?.status === 404) {
        Alert.alert('No encontrado', 'No se encontró ningún pedido con ese ID');
      } else {
        Alert.alert('Error', 'No se pudo buscar el pedido. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Pendiente', icon: 'time-outline' },
      { key: 'accepted', label: 'Aceptado', icon: 'checkmark-circle-outline' },
      { key: 'picking_up', label: 'Recogiendo', icon: 'basket-outline' },
      { key: 'delivering', label: 'En camino', icon: 'bicycle-outline' },
      { key: 'delivered', label: 'Entregado', icon: 'home-outline' },
    ];

    if (order?.status === 'cancelled') {
      return [{ key: 'cancelled', label: 'Cancelado', icon: 'close-circle-outline' }];
    }

    return steps;
  };

  const getStepStatus = (stepKey: string) => {
    if (!order) return 'pending';
    const statusOrder = ['pending', 'accepted', 'picking_up', 'delivering', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.searchSection}>
          <Text style={styles.title}>Seguir tu pedido</Text>
          <Text style={styles.subtitle}>
            Ingresa el ID del pedido para ver su estado
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ej: abc123-def456-ghi789"
              value={orderId}
              onChangeText={setOrderId}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleTrack}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner message="" />
              ) : (
                <Ionicons name="search" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner message="Buscando pedido..." />
          </View>
        )}

        {!loading && order && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Estado del pedido</Text>

            <View style={styles.timeline}>
              {getStatusSteps().map((step, index) => {
                const status = getStepStatus(step.key);
                return (
                  <View key={step.key} style={styles.timelineItem}>
                    <View
                      style={[
                        styles.timelineIcon,
                        status === 'completed' && styles.timelineIconCompleted,
                        status === 'current' && styles.timelineIconCurrent,
                      ]}
                    >
                      <Ionicons
                        name={step.icon as any}
                        size={20}
                        color={
                          status === 'pending' ? '#CCC' : '#FFF'
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.timelineLabel,
                        status === 'current' && styles.timelineLabelCurrent,
                        status === 'completed' && styles.timelineLabelCompleted,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {index < getStatusSteps().length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          status === 'completed' && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>

            {order.driver_name && (
              <View style={styles.driverInfo}>
                <Ionicons name="person-circle" size={40} color="#FF6B35" />
                <View style={styles.driverDetails}>
                  <Text style={styles.driverLabel}>Tu repartidor</Text>
                  <Text style={styles.driverName}>{order.driver_name}</Text>
                </View>
              </View>
            )}

            <OrderCard order={order} />
          </View>
        )}

        {!loading && searched && !order && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>Pedido no encontrado</Text>
            <Text style={styles.emptyText}>
              Verifica que el ID sea correcto e inténtalo de nuevo
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  searchSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#333',
    marginRight: 12,
  },
  searchButton: {
    backgroundColor: '#FF6B35',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 40,
  },
  resultSection: {
    marginTop: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  timeline: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIconCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineIconCurrent: {
    backgroundColor: '#FF6B35',
  },
  timelineLabel: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  timelineLabelCurrent: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  timelineLabelCompleted: {
    color: '#4CAF50',
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
  },
  timelineLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  driverDetails: {
    marginLeft: 12,
  },
  driverLabel: {
    fontSize: 12,
    color: '#666',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
