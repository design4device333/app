import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, OrderStatus } from '../types';

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  showActions?: boolean;
  onAccept?: () => void;
  onUpdateStatus?: (status: OrderStatus) => void;
}

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending': return '#FFA500';
    case 'accepted': return '#2196F3';
    case 'picking_up': return '#9C27B0';
    case 'delivering': return '#4CAF50';
    case 'delivered': return '#8BC34A';
    case 'cancelled': return '#F44336';
    default: return '#666';
  }
};

const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'accepted': return 'Aceptado';
    case 'picking_up': return 'Recogiendo';
    case 'delivering': return 'En camino';
    case 'delivered': return 'Entregado';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
};

const getPaymentIcon = (method: string): string => {
  switch (method) {
    case 'bizum': return 'phone-portrait-outline';
    case 'card': return 'card-outline';
    case 'cash': return 'cash-outline';
    default: return 'wallet-outline';
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onPress, 
  showActions = false,
  onAccept,
  onUpdateStatus 
}) => {
  const getNextStatus = (): OrderStatus | null => {
    switch (order.status) {
      case 'accepted': return 'picking_up';
      case 'picking_up': return 'delivering';
      case 'delivering': return 'delivered';
      default: return null;
    }
  };

  const getNextStatusText = (): string => {
    const next = getNextStatus();
    if (!next) return '';
    switch (next) {
      case 'picking_up': return 'Recogiendo';
      case 'delivering': return 'En camino';
      case 'delivered': return 'Entregado';
      default: return '';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <Ionicons name="storefront-outline" size={20} color="#FF6B35" />
          <Text style={styles.storeName}>{order.store_name}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>
      
      <View style={styles.customerInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{order.customer_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.infoText} numberOfLines={1}>{order.customer_address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{order.customer_phone}</Text>
        </View>
      </View>

      <View style={styles.itemsSection}>
        <Text style={styles.itemsTitle}>Artículos:</Text>
        {order.items.map((item, index) => (
          <Text key={index} style={styles.itemText}>
            • {item.quantity}x {item.name}{item.notes ? ` (${item.notes})` : ''}
          </Text>
        ))}
      </View>

      {order.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notas:</Text>
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.paymentInfo}>
          <Ionicons name={getPaymentIcon(order.payment_method) as any} size={16} color="#FF6B35" />
          <Text style={styles.paymentText}>
            {order.payment_method === 'bizum' ? 'Bizum' : 
             order.payment_method === 'card' ? 'Tarjeta' : 'Efectivo'}
          </Text>
        </View>
        {order.total_amount && (
          <Text style={styles.totalText}>{order.total_amount.toFixed(2)}€</Text>
        )}
      </View>

      {showActions && order.status === 'pending' && onAccept && (
        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Aceptar Pedido</Text>
        </TouchableOpacity>
      )}

      {showActions && order.status !== 'pending' && order.status !== 'delivered' && order.status !== 'cancelled' && onUpdateStatus && (
        <TouchableOpacity 
          style={styles.statusButton} 
          onPress={() => {
            const next = getNextStatus();
            if (next) onUpdateStatus(next);
          }}
        >
          <Ionicons name="arrow-forward-circle" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Marcar como {getNextStatusText()}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  customerInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  itemsSection: {
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  notesSection: {
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  notesText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 8,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 13,
    color: '#FF6B35',
    marginLeft: 4,
    fontWeight: '500',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
