import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="bicycle" size={48} color="#FFF" />
          <Text style={styles.logo}>ViPallá</Text>
        </View>
        <Text style={styles.tagline}>Reparto a domicilio de cualquier establecimiento</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Selecciona tu perfil</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)')}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="person" size={32} color="#FF6B35" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Cliente</Text>
            <Text style={styles.cardDescription}>
              Haz pedidos de cualquier tienda del municipio
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/driver')}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="bicycle" size={32} color="#FF6B35" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Repartidor</Text>
            <Text style={styles.cardDescription}>
              Acepta y entrega pedidos en tu zona
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/admin')}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="settings" size={32} color="#FF6B35" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Administración</Text>
            <Text style={styles.cardDescription}>
              Gestiona pedidos, repartidores y tiendas
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#CCC" />
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={24} color="#FF6B35" />
            <Text style={styles.infoTitle}>Rápido</Text>
            <Text style={styles.infoText}>Entrega en menos de 1 hora</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#FF6B35" />
            <Text style={styles.infoTitle}>Seguro</Text>
            <Text style={styles.infoText}>Pago por Bizum, tarjeta o efectivo</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 12,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 60,
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
  },
  infoSection: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 40,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
