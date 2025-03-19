import React, { useContext, useCallback } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import SettingsButton from './SettingsButton';
import { UserContext } from '../context/UserContext';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const db = SQLite.openDatabase(
    { name: 'fitnessApp.db', location: 'default' },
    () => console.log('Database opened successfully'),
    (error) => console.log('Error opening database:', error)
);

export default function Header() {
    const { user, setUser } = useContext(UserContext);

    const fetchUserPhoto = async () => {
        try {
            const storedUsername = await AsyncStorage.getItem('loggedInUsername');
            if (storedUsername) {
                db.transaction((tx) => {
                    tx.executeSql(
                        'SELECT photoUri FROM users WHERE username = ?;',
                        [storedUsername],
                        (tx, results) => {
                            if (results.rows.length > 0) {
                                const row = results.rows.item(0);
                                setUser({ username: storedUsername, photoUri: row.photoUri });
                            }
                        },
                        (error) => console.log('Error fetching photoUri:', error)
                    );
                });
            }
        } catch (error) {
            console.error('Error fetching user photo:', error);
        }
    };

    // Re-fetch photoUri every time the header gains focus.
    useFocusEffect(
        useCallback(() => {
            fetchUserPhoto();
        }, [])
    );

    return (
        <View style={styles.header}>
            {user && user.photoUri ? (
                <Image source={{ uri: user.photoUri }} style={styles.photo} />
            ) : (
                <Text style={styles.placeholderText}>{user?.username}</Text>
            )}
            <Text style={styles.headerText}>MyFitnessApp</Text>
            <SettingsButton />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 25,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white'
    },
    placeholderText: {
        fontSize: 14,
        color: 'white'
    },
    photo: {
        width: 40,
        height: 40,
        borderRadius: 20
    }
});
