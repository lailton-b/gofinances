import React from 'react'
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Dashboard } from '../screens/Dashboard';
import { Register } from '../screens/Register';
import { useTheme } from 'styled-components';

const { Navigator, Screen } = createBottomTabNavigator()

export function AppRoutes() {
  const theme = useTheme();
  const screenOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.secondary,
    tabBarInactiveTintColor: theme.colors.text,
    tabBarLabelPosition: 'beside-icon',
    tabBarStyle: {
      height: 88,
      // paddingVertical: Platform.OS === 'ios' ? 20 : 0
    }
  }

  return (
    <NavigationContainer>
      <Navigator
        screenOptions={screenOptions}
      >
        <Screen
          name="Listagem"
          component={Dashboard}
          options={{
            tabBarIcon: (({ size, color }) => 
              <MaterialIcons 
                name="format-list-bulleted"
                size={size}
                color={color}
              />
            )
          }}
        />
        <Screen
          name="Cadastrar"
          component={Register}
          options={{
            tabBarIcon: (({ size, color }) => 
              <MaterialIcons 
                name="attach-money"
                size={size}
                color={color}
              />
            )
          }}
        />
        <Screen
          name="Resumo"
          component={Register}
          options={{
            tabBarIcon: (({ size, color }) => 
              <MaterialIcons 
                name="pie-chart"
                size={size}
                color={color}
              />
            )
          }}
        />
      </Navigator>
    </NavigationContainer>
  )
}