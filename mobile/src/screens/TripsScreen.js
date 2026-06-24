import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as Location from 'expo-location'
import { supabase } from '../supabaseClient'
import StartTripModal from '../components/StartTripModal'

const { height } = Dimensions.get('window')

export default function TripsScreen({ pilot, user, onLogout }) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [startingTrip, setStartingTrip] = useState(false)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('assigned_pilot_id', pilot.id)
        .in('status', ['pending', 'assigned'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setTrips(data || [])
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los viajes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTripPress = (trip) => {
    setSelectedTrip(trip)
    setShowModal(true)
  }

  const handleStartTrip = async () => {
    if (!selectedTrip) return

    setStartingTrip(true)
    try {
      // Solicitar permiso de ubicación
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requiere permiso de ubicación para iniciar un viaje')
        setStartingTrip(false)
        return
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      })

      const { latitude, longitude } = location.coords

      // Actualizar viaje con ubicación inicial y cambiar estado
      const { error } = await supabase
        .from('trips')
        .update({
          status: 'in_progress',
          start_location: `${latitude},${longitude}`,
          start_latitude: latitude,
          start_longitude: longitude,
          started_at: new Date().toISOString()
        })
        .eq('id', selectedTrip.id)

      if (error) throw error

      Alert.alert('Éxito', 'Viaje iniciado correctamente')
      setShowModal(false)
      setSelectedTrip(null)
      fetchTrips() // Recargar viajes
    } catch (err) {
      Alert.alert('Error', 'No se pudo iniciar el viaje')
      console.error(err)
    } finally {
      setStartingTrip(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      onLogout()
    } catch (err) {
      Alert.alert('Error', 'No se pudo cerrar sesión')
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {pilot.name}</Text>
          <Text style={styles.headerSubtitle}>Viajes disponibles</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Trips List */}
      <ScrollView contentContainerStyle={styles.content}>
        {trips.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No hay viajes disponibles</Text>
            <Text style={styles.emptyText}>Vuelve más tarde para ver nuevas asignaciones</Text>
          </View>
        ) : (
          trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => handleTripPress(trip)}
            >
              <View style={styles.tripHeader}>
                <Text style={styles.tripRoute}>{trip.origin} → {trip.destination}</Text>
                <Text style={styles.tripStatus}>{trip.status}</Text>
              </View>

              <View style={styles.tripDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Distancia:</Text>
                  <Text style={styles.detailValue}>{trip.distance} km</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Carga:</Text>
                  <Text style={styles.detailValue}>{trip.cargo_type}</Text>
                </View>
              </View>

              <View style={styles.tripFooter}>
                <Text style={styles.tripDate}>
                  {new Date(trip.created_at).toLocaleDateString('es-ES')}
                </Text>
                <Text style={styles.tripAction}>Presiona para iniciar →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Start Trip Modal */}
      <StartTripModal
        visible={showModal}
        trip={selectedTrip}
        loading={startingTrip}
        onConfirm={handleStartTrip}
        onCancel={() => {
          setShowModal(false)
          setSelectedTrip(null)
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomColor: '#1e293b',
    borderBottomWidth: 1
  },
  greeting: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700'
  },
  headerSubtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 4
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 8
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600'
  },
  content: {
    padding: 16,
    gap: 12
  },
  tripCard: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  tripRoute: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  tripStatus: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tripDetails: {
    gap: 8,
    marginBottom: 12
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  detailLabel: {
    color: '#cbd5e1',
    fontSize: 13
  },
  detailValue: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '500'
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopColor: '#334155',
    borderTopWidth: 1
  },
  tripDate: {
    color: '#64748b',
    fontSize: 12
  },
  tripAction: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600'
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.2
  },
  emptyTitle: {
    color: '#cbd5e1',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14
  }
})
