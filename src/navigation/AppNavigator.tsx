import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MealScreen from '../screens/MealScreen';
import WorkoutsScreen from '../screens/WorkoutScreen';
import LoginScreen from '../screens/LoginScreen';
import Register from '../screens/Register';

import Header from '../components/Header';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
    Login: undefined;
    Main: undefined;
    Register: undefined;
    Settings: undefined;
    Profile: undefined;
};

export type RootTabParamList = {
    Home: undefined;
    Meals: undefined;
    Workouts: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const BottomTabs = () => {
    return (
        <>
            <Header />
            <Tab.Navigator screenOptions={{
                headerShown: false,
                tabBarIcon: () => null,
                tabBarLabelStyle: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    position: 'absolute',
                    top: '50%',
                    transform: [{ translateY: -7.5 }]
                },
                tabBarStyle: {
                    display: 'flex',
                }
            }}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Meals" component={MealScreen} />
                <Tab.Screen name="Workouts" component={WorkoutsScreen} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
        </>
    );
};

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="Main" component={BottomTabs} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
