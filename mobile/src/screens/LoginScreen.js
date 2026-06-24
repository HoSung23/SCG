import React, { useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '../supabaseClient'

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        Alert.alert('Error de login', error.message)
        return
      }

      // Verificar que el usuario es piloto
      const { data: pilot, error: pilotError } = await supabase
        .from('pilots')
        .select('*')
        .eq('user_id', data.user.id)
        .single()

      if (pilotError || !pilot) {
        Alert.alert('Error', 'Este usuario no está registrado como piloto')
        await supabase.auth.signOut()
        return
      }

      onLoginSuccess(data.user, pilot)
    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>SCG Pilotos</Text>
          <Text style={styles.subtitle}>Login para acceder a tus viajes</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Demo</Text>
          <Text style={styles.footerSubtext}>
            Usa credenciales de prueba para acceder
          </Text>
        </View>
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
    justifyContent: 'space-between',
    minHeight: '100%'
  },
  header: {
    marginTop: 40,
    marginBottom: 40
  },
  title: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16
  },
  form: {
    gap: 20
  },
  inputGroup: {
    gap: 8
  },
  label: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    color: '#f8fafc',
    fontSize: 16
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 10
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    alignItems: 'center',
    marginTop: 40
  },
  footerText: {
    color: '#cbd5e1',
    fontSize: 12
  },
  footerSubtext: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4
  }
})
