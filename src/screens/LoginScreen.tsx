import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import SQLite from 'react-native-sqlite-storage';
import Toast from 'react-native-toast-message';
import { ToastAndroid } from 'react-native';
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
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM users WHERE username = ? AND password = ?;',
                    [username, password],
                    async (tx, results) => {
                        if (results.rows.length > 0) {
                            // setUsername(username);
                            await AsyncStorage.setItem('loggedInUsername', username);
                            // navigation.navigate('Main', { username }); // Navigate to Main screen with username
                            navigation.navigate('Main');
                        } else {
                            Alert.alert('Error', 'Invalid username or password');
                        }
                    },
                    (error) => {
                        console.log('Error checking credentials', error);
                        Alert.alert('Error', 'Something went wrong');
                    }
                );
            });
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
            {/* <Button title="Login" onPress={loginUser} /> */}
            <TouchableOpacity onPress={loginUser}>
                <Text style={styles.input}>LOGIN</Text>
            </TouchableOpacity>
            {/* <Button title="Go to Register" onPress={() => navigation.navigate('Register')} /> */}
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.input}>GO TO REGISTER</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '80%', padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
});
