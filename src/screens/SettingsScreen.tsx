import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const settingsOptions = [
    { name: "Profile", screen: "Profile" },
    { name: "Notifications", screen: "NotificationsScreen" },
    { name: "Privacy", screen: "PrivacyScreen" },
    { name: "Security", screen: "SecurityScreen" },
    { name: "About", screen: "AboutScreen" },
];

export default function SettingsScreen({ navigation }: Props) {
    const handleLogout = async () => {
        await AsyncStorage.removeItem('loggedInUsername');
        navigation.navigate('Login' as never);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            {settingsOptions.map((option) => (
                <TouchableOpacity
                    key={option.screen}
                    style={styles.option}
                    onPress={() => navigation.navigate(option.screen as any)}
                // onPress={() => navigation.navigate("Main", { screen: option.screen } as never)}
                >
                    <Text style={styles.optionText}>{option.name}</Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    option: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    optionText: {
        fontSize: 18,
    },
    buttonText: { color: 'white', fontWeight: 'bold' },
    logoutButton: { width: '25%', alignSelf: 'flex-start', backgroundColor: '#FF3B30', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 20, marginLeft: 10, },

});
