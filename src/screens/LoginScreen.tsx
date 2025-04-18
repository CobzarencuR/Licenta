import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = SQLite.openDatabase(
    { name: 'fitnessApp.db', location: 'default' },
    () => console.log('Database opened successfully'),
    (error) => console.log('Error opening database:', error)
);

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const loginUser = async () => {
        if (username && password) {
            try {
                const response = await fetch('http://10.0.2.2:3000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();
                if (!response.ok) {
                    Alert.alert('Error', data.error || 'Invalid username or password');
                } else {
                    // Save token and username in AsyncStorage
                    await AsyncStorage.setItem('auth-token', data.token);
                    await AsyncStorage.setItem('loggedInUsername', username);

                    // 3) Look up the *local* user ID in SQLite by username
                    db.transaction(tx => {
                        tx.executeSql(
                            'SELECT id FROM users WHERE username = ?;',
                            [username],
                            async (_, { rows }) => {
                                if (rows.length > 0) {
                                    const localId = rows.item(0).id.toString();
                                    await AsyncStorage.setItem('loggedInUserId', localId);
                                } else {
                                    console.warn('Local SQLite user not found for', username);
                                }
                                navigation.navigate('Main');
                            },
                            (_, error) => {
                                console.error('Error fetching local user id:', error);
                                // even on error, go ahead
                                navigation.navigate('Main');
                                return true; // signal error handled
                            }
                        );
                    });
                }
            } catch (error) {
                console.error('Login error:', error);
                Alert.alert('Error', 'Something went wrong');
            }
        } else {
            Alert.alert('Error', 'Please fill in both fields');
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={loginUser}>
                <Text style={styles.buttonText}>LOGIN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
                <Text style={styles.buttonText}>REGISTER</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '80%', padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
    button: { width: '50%', alignSelf: 'center', backgroundColor: '#007BFF', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontWeight: 'bold' },
});
