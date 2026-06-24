import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/stack'
import { supabase } from './supabaseClient'
import LoginScreen from './screens/LoginScreen'
import TripsScreen from './screens/TripsScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  const [user, setUser] = useState(null)
  const [pilot, setPilot] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión existente
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        // Aquí podrías cargar los datos del piloto
      } else {
        setUser(null)
        setPilot(null)
      }
      setLoading(false)
    })
  }, [])

  const handleLoginSuccess = (newUser, pilotData) => {
    setUser(newUser)
    setPilot(pilotData)
  }

  const handleLogout = () => {
    setUser(null)
    setPilot(null)
  }

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#0f172a' }} />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true
        }}
      >
        {user && pilot ? (
          <Stack.Screen
            name="Trips"
            options={{ animationEnabled: false }}
          >
            {(props) => (
              <TripsScreen
                {...props}
                pilot={pilot}
                user={user}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen
            name="Login"
            options={{ animationEnabled: false }}
          >
            {(props) => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
