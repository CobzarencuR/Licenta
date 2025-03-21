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
            <View style={styles.photoContainer}>
                {user && user.photoUri ? (
                    <Image source={{ uri: user.photoUri }} style={styles.photo} />
                ) : (
                    <Text style={styles.photoPlaceholder}>Add Photo</Text>
                )}
            </View>
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
        fontSize: 26,
        fontWeight: 'bold',
        color: 'white'
    },
    photoContainer: {
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center'
    },
    photo: {
        width: 40,
        height: 40,
    },
    photoPlaceholder: {
        fontSize: 10,
        color: '#aaa',
        textAlign: 'center',
    },
});
