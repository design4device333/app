import React from 'react';
import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
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
          title: 'Repartidor - ViPallá',
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          title: 'Mis Pedidos',
        }}
      />
    </Stack>
  );
}
