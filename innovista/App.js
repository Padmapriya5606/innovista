import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from './src/theme';

// Screens
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import AiMatchmakingScreen from './src/screens/AiMatchmakingScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import EcosystemGraphScreen from './src/screens/EcosystemGraphScreen';

const Stack = createNativeStackNavigator();

const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.alert,
    },
};

export default function App() {
    return (
        <NavigationContainer theme={CustomDarkTheme}>
            <StatusBar style="light" />
            <Stack.Navigator
                initialRouteName="RoleSelection"
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                    contentStyle: { backgroundColor: theme.colors.background }
                }}
            >
                <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                <Stack.Screen name="AiMatchmaking" component={AiMatchmakingScreen} />
                <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                <Stack.Screen name="EcosystemGraph" component={EcosystemGraphScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
