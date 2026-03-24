import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Store, OrderItem, PaymentMethod } from '../../src/types';
import { getStore, createOrder } from '../../src/services/api';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';

export default function OrderScreen() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ name: '', quantity: 1, notes: '' }]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [totalAmount, setTotalAmount] = useState('');

  useEffect(() => {
    fetchStore();
  }, [storeId]);

  const fetchStore = async () => {
    try {
      if (storeId) {
        const data = await getStore(storeId);
        setStore(data);
      }
    } catch (error) {
      console.error('Error fetching store:', error);
      Alert.alert('Error', 'No se pudo cargar la tienda');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, notes: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const openWhatsApp = () => {
    if (!store) return;

    const itemsList = items
      .filter((item) => item.name.trim())
      .map((item) => `- ${item.quantity}x ${item.name}${item.notes ? ` (${item.notes})` : ''}`)
      .join('\n');

    const message = `¡Hola! Quiero hacer un pedido a través de ViPallá:

*Tienda:* ${store.name}
*Nombre:* ${customerName}
*Teléfono:* ${customerPhone}
*Dirección:* ${customerAddress}

*Productos:*
${itemsList}

*Método de pago:* ${paymentMethod === 'bizum' ? 'Bizum' : paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}
${totalAmount ? `*Total aproximado:* ${totalAmount}€` : ''}
${notes ? `\n*Notas:* ${notes}` : ''}`;

    const whatsappNumber = '34612345678'; // Número de ViPallá
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const handleSubmit = async () => {
    // Validation
    if (!customerName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }
    if (!customerPhone.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu teléfono');
      return;
    }
    if (!customerAddress.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu dirección');
      return;
    }
    
    const validItems = items.filter((item) => item.name.trim());
    if (validItems.length === 0) {
      Alert.alert('Error', 'Por favor añade al menos un producto');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        store_id: storeId!,
        store_name: store?.name || '',
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        items: validItems,
        notes: notes || undefined,
        payment_method: paymentMethod,
        total_amount: totalAmount ? parseFloat(totalAmount) : undefined,
      });

      Alert.alert(
        '¡Pedido creado!',
        `Tu pedido ha sido recibido.\n\nID de seguimiento:\n${order.id}\n\n¿Deseas contactar por WhatsApp para confirmar?`,
        [
          {
            text: 'Solo guardar',
            style: 'cancel',
            onPress: () => router.back(),
          },
          {
            text: 'Abrir WhatsApp',
            onPress: () => {
              openWhatsApp();
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'No se pudo crear el pedido. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando tienda..." />;
  }

  if (!store) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>Tienda no encontrada</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Store Info */}
        <View style={styles.storeCard}>
          <View style={styles.storeIcon}>
            <Ionicons name="storefront" size={28} color="#FF6B35" />
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeCategory}>{store.category}</Text>
            <Text style={styles.storeAddress}>{store.address}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tus datos</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre completo"
              value={customerName}
              onChangeText={setCustomerName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 612345678"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección de entrega *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Calle, número, piso, código postal..."
              value={customerAddress}
              onChangeText={setCustomerAddress}
              multiline
              numberOfLines={2}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos</Text>
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Ionicons name="add-circle" size={24} color="#FF6B35" />
              <Text style={styles.addButtonText}>Añadir</Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemNumber}>Producto {index + 1}</Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                  </TouchableOpacity>
                )}
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Nombre del producto"
                value={item.name}
                onChangeText={(value) => updateItem(index, 'name', value)}
                placeholderTextColor="#999"
              />
              
              <View style={styles.quantityRow}>
                <Text style={styles.quantityLabel}>Cantidad:</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                >
                  <Ionicons name="remove" size={20} color="#FF6B35" />
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateItem(index, 'quantity', item.quantity + 1)}
                >
                  <Ionicons name="add" size={20} color="#FF6B35" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Notas (opcional)"
                value={item.notes}
                onChangeText={(value) => updateItem(index, 'notes', value)}
                placeholderTextColor="#999"
              />
            </View>
          ))}
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          
          <View style={styles.paymentOptions}>
            {[
              { id: 'bizum' as PaymentMethod, label: 'Bizum', icon: 'phone-portrait-outline' },
              { id: 'card' as PaymentMethod, label: 'Tarjeta', icon: 'card-outline' },
              { id: 'cash' as PaymentMethod, label: 'Efectivo', icon: 'cash-outline' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.paymentOption,
                  paymentMethod === option.id && styles.paymentOptionActive,
                ]}
                onPress={() => setPaymentMethod(option.id)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={paymentMethod === option.id ? '#FF6B35' : '#666'}
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    paymentMethod === option.id && styles.paymentOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total aproximado (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 25.50"
              value={totalAmount}
              onChangeText={setTotalAmount}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas adicionales</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Instrucciones especiales, alergias, etc."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />
        </View>

        {/* Submit buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <LoadingSpinner message="" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                <Text style={styles.submitButtonText}>Enviar pedido</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
            <Ionicons name="logo-whatsapp" size={22} color="#FFF" />
            <Text style={styles.whatsappButtonText}>Pedir por WhatsApp</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  storeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  storeCategory: {
    fontSize: 13,
    color: '#FF6B35',
    marginTop: 2,
  },
  storeAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  itemCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
  },
  paymentOptions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  paymentOption: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
  },
  paymentOptionActive: {
    backgroundColor: '#FFF5F0',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  paymentOptionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontWeight: '500',
  },
  paymentOptionTextActive: {
    color: '#FF6B35',
  },
  buttonContainer: {
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 12,
    padding: 16,
  },
  whatsappButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
