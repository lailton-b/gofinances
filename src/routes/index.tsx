import React from 'react'
import { NavigationContainer } from "@react-navigation/native";
import { AuthRoutes } from './auth.routes';
import { AppRoutes } from './app.routes';
import { StatusBar } from 'react-native';
import { useAuth } from '../hooks/auth';

export function Routes() {
    const { user } = useAuth()
    return (
        <NavigationContainer>
            <StatusBar barStyle='light-content' />
            {user?.id ? <AppRoutes /> : <AuthRoutes />}
        </NavigationContainer>
    )
}