import React from 'react';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#9C27B0',
        },
        headerTintColor: '#FFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Admin - ViPallá',
        }}
      />
      <Stack.Screen
        name="stores"
        options={{
          title: 'Gestionar Tiendas',
        }}
      />
      <Stack.Screen
        name="drivers"
        options={{
          title: 'Gestionar Repartidores',
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: 'Todos los Pedidos',
        }}
      />
    </Stack>
  );
}
