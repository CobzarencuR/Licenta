import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SettingsButton from './SettingsButton';


const Header: React.FC = () => {
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('loggedInUsername');
                if (storedUsername) {
                    setUsername(storedUsername);
                } else {
                    console.log('No logged-in user found.');
                }
            } catch (error) {
                console.error('Failed to load username:', error);
            }
        };
        fetchUsername();
    }, []);
    return (
        <View style={styles.header}>
            <Text style={styles.usernameText}>{username}</Text>
            <Text style={styles.headerText}>MyFitnessApp</Text>
            <SettingsButton />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 25,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    usernameText: {
        fontSize: 14,
        color: 'white',
    },
});

export default Header;