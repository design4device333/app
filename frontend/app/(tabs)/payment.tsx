import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPaymentInfo } from '../../src/services/api';
import { PaymentInfo } from '../../src/types';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import * as Clipboard from 'expo-clipboard';

export default function PaymentScreen() {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  const fetchPaymentInfo = async () => {
    try {
      const data = await getPaymentInfo();
      setPaymentInfo(data);
    } catch (error) {
      console.error('Error fetching payment info:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('¡Copiado!', `${label} copiado al portapapeles`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar al portapapeles');
    }
  };

  const openWhatsApp = () => {
    const phone = paymentInfo?.bizum_phone || '612345678';
    const message = 'Hola, quiero realizar un pago por Bizum para mi pedido de ViPallá';
    const url = `https://wa.me/34${phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  if (loading) {
    return <LoadingSpinner message="Cargando información de pago..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="wallet" size={48} color="#FF6B35" />
        <Text style={styles.title}>Métodos de Pago</Text>
        <Text style={styles.subtitle}>
          Elige cómo prefieres pagar tu pedido
        </Text>
      </View>

      {/* Bizum */}
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentIcon}>
            <Ionicons name="phone-portrait" size={28} color="#FF6B35" />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Bizum</Text>
            <Text style={styles.paymentDescription}>Pago instantáneo desde tu móvil</Text>
          </View>
        </View>
        
        <View style={styles.paymentDetails}>
          <Text style={styles.detailLabel}>Número de teléfono:</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailValue}>{paymentInfo?.bizum_phone}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(paymentInfo?.bizum_phone || '', 'Número de Bizum')}
            >
              <Ionicons name="copy-outline" size={18} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
          <Text style={styles.whatsappText}>Contactar por WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Tarjeta */}
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentIcon}>
            <Ionicons name="card" size={28} color="#FF6B35" />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Tarjeta</Text>
            <Text style={styles.paymentDescription}>Pago con tarjeta de crédito/débito</Text>
          </View>
        </View>
        
        <View style={styles.paymentDetails}>
          <Text style={styles.detailLabel}>Información:</Text>
          <Text style={styles.detailText}>{paymentInfo?.card_info}</Text>
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.noteText}>
            Contáctanos por WhatsApp para coordinar el pago con tarjeta
          </Text>
        </View>
      </View>

      {/* Efectivo */}
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentIcon}>
            <Ionicons name="cash" size={28} color="#FF6B35" />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Efectivo</Text>
            <Text style={styles.paymentDescription}>Paga al recibir tu pedido</Text>
          </View>
        </View>
        
        <View style={styles.paymentDetails}>
          <Text style={styles.detailText}>{paymentInfo?.cash_note}</Text>
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="bulb" size={20} color="#FFA500" />
          <Text style={styles.tipText}>
            Ten el importe exacto preparado para facilitar el proceso
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ¿Tienes dudas sobre el pago?
        </Text>
        <TouchableOpacity style={styles.helpButton} onPress={openWhatsApp}>
          <Ionicons name="help-circle" size={20} color="#FF6B35" />
          <Text style={styles.helpText}>Contáctanos</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  paymentDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  paymentDetails: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  detailText: {
    fontSize: 15,
    color: '#333',
  },
  copyButton: {
    padding: 8,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: 12,
    padding: 14,
  },
  whatsappText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    marginLeft: 8,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#F57C00',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 15,
    color: '#FF6B35',
    fontWeight: '600',
    marginLeft: 6,
  },
});
