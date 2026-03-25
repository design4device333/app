import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Driver } from '../../src/types';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '../../src/services/api';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';

export default function AdminDriversScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const fetchDrivers = async () => {
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDrivers();
  }, []);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEditingDriver(null);
  };

  const openModal = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setName(driver.name);
      setPhone(driver.phone);
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setSubmitting(true);
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, {
          name: name.trim(),
          phone: phone.trim(),
        });
        Alert.alert('Éxito', 'Repartidor actualizado correctamente');
      } else {
        await createDriver({
          name: name.trim(),
          phone: phone.trim(),
        });
        Alert.alert('Éxito', 'Repartidor creado correctamente');
      }

      closeModal();
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      Alert.alert('Error', 'No se pudo guardar el repartidor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (driver: Driver) => {
    try {
      await updateDriver(driver.id, { is_available: !driver.is_available });
      fetchDrivers();
    } catch (error) {
      console.error('Error updating driver:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const handleDelete = (driver: Driver) => {
    Alert.alert(
      'Eliminar repartidor',
      `¿Estás seguro de eliminar a "${driver.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDriver(driver.id);
              Alert.alert('Éxito', 'Repartidor eliminado');
              fetchDrivers();
            } catch (error) {
              console.error('Error deleting driver:', error);
              Alert.alert('Error', 'No se pudo eliminar el repartidor');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner message="Cargando repartidores..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9C27B0']} />
        }
      >
        {drivers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No hay repartidores</Text>
            <Text style={styles.emptyText}>Añade tu primer repartidor</Text>
          </View>
        ) : (
          drivers.map((driver) => (
            <View key={driver.id} style={styles.driverCard}>
              <View style={styles.driverAvatar}>
                <Ionicons name="person" size={24} color="#9C27B0" />
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <View style={styles.driverRow}>
                  <Ionicons name="call-outline" size={14} color="#666" />
                  <Text style={styles.driverDetail}>{driver.phone}</Text>
                </View>
                <View style={styles.driverRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: driver.is_available ? '#4CAF50' : '#F44336' },
                    ]}
                  />
                  <Text style={styles.driverDetail}>
                    {driver.is_available ? 'Disponible' : 'Ocupado'}
                  </Text>
                </View>
              </View>
              <View style={styles.driverActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleToggleAvailability(driver)}
                >
                  <Ionicons
                    name={driver.is_available ? 'pause-circle' : 'play-circle'}
                    size={24}
                    color={driver.is_available ? '#F44336' : '#4CAF50'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openModal(driver)}
                >
                  <Ionicons name="pencil" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(driver)}
                >
                  <Ionicons name="trash" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingDriver ? 'Editar Repartidor' : 'Nuevo Repartidor'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre completo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del repartidor"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="612345678"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <LoadingSpinner message="" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editingDriver ? 'Actualizar' : 'Crear Repartidor'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
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
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  driverDetail: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  driverActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#9C27B0',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
