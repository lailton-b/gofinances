import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { PrivateRoutes } from './routes'
import { SignIn } from '../screens/SignIn'

const { Navigator, Screen } = createStackNavigator<PrivateRoutes>()

export function AuthRoutes() {
    return (
        <Navigator screenOptions={{
            headerShown: false
        }}>
            <Screen
                name='SignIn'
                component={SignIn}
            />
        </Navigator>
    )
}