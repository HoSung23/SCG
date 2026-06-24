import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions
} from 'react-native'

const { height, width } = Dimensions.get('window')

export default function StartTripModal({ visible, trip, loading, onConfirm, onCancel }) {
  if (!trip) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Iniciar Viaje</Text>

          <View style={styles.tripInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ruta:</Text>
              <Text style={styles.infoValue}>
                {trip.origin} → {trip.destination}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distancia:</Text>
              <Text style={styles.infoValue}>{trip.distance} km</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo de carga:</Text>
              <Text style={styles.infoValue}>{trip.cargo_type}</Text>
            </View>

            {trip.notes && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Notas:</Text>
                <Text style={styles.infoValue}>{trip.notes}</Text>
              </View>
            )}
          </View>

          <Text style={styles.warning}>
            ⚠️ Se capturará tu ubicación GPS al iniciar. Asegúrate de estar en el punto de salida.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmButtonText}>Sí, Iniciar Viaje</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    width: width - 40,
    maxHeight: height - 100
  },
  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center'
  },
  tripInfo: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '500'
  },
  infoValue: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right'
  },
  warning: {
    color: '#fca5a5',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftColor: '#ef4444',
    borderLeftWidth: 3
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    backgroundColor: '#334155',
    borderColor: '#475569',
    borderWidth: 1
  },
  cancelButtonText: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '600'
  },
  confirmButton: {
    backgroundColor: '#10b981'
  },
  buttonDisabled: {
    opacity: 0.6
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  }
})
