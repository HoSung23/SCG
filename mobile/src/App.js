import React from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'

const actions = [
  'Iniciar viaje (foto + GPS)',
  'Finalizar viaje (evidencia)',
  'Reportar incidencia',
  'Modo contingencia offline'
]

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>SCG Piloto — Demo Base</Text>
        <Text style={styles.subtitle}>Estructura inicial Expo para Android/iOS.</Text>

        {actions.map((action) => (
          <View key={action} style={styles.card}>
            <Text style={styles.cardText}>{action}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  content: {
    padding: 20,
    gap: 12
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700'
  },
  subtitle: {
    color: '#cbd5e1',
    marginBottom: 8
  },
  card: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14
  },
  cardText: {
    color: '#e2e8f0'
  }
})
