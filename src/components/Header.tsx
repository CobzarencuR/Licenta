import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
            <Text style={styles.headerText}>MyFitnessApp</Text>
            <Text style={styles.usernameText}>{username}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#007AFF',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    usernameText: {
        fontSize: 16,
        color: 'white',
        marginTop: 5,
    },
});

export default Header;