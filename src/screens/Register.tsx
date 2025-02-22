import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
    { name: 'fitnessApp.db', location: 'default' },
    () => console.log('Database opened successfully'),
    (error) => console.log('Error opening database:', error)
);

export default function Register({ navigation }: any) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const createTable = () => {
        db.transaction((tx) => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    username TEXT, 
                    email TEXT, 
                    password TEXT, 
                    height REAL, 
                    weight REAL, 
                    sex TEXT, 
                    dob TEXT,
                    age INTEGER,
                    activityLevel REAL,
                    objective TEXT,
                    calories REAL,
                    protein REAL,
                    carbs REAL,
                    fats REAL
                );`,
                [],
                () => console.log('Users table created successfully'),
                (error) => console.log('Error creating users table', error)
            );
        });
    };


    const registerUser = () => {
        if (username && email && password) {
            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM users WHERE username = ?;',
                    [username],
                    (tx, results) => {
                        if (results.rows.length > 0) {
                            Alert.alert('Error', 'Username already exists. Please choose another one.');
                        } else {
                            tx.executeSql(
                                'INSERT INTO users (username, email, password) VALUES (?, ?, ?);',
                                [username, email, password],
                                () => {
                                    Alert.alert('Registration Successful', 'You can now log in');
                                    navigation.navigate('Login');
                                },
                                (error) => {
                                    Alert.alert('Error', 'Could not register user');
                                    console.log('Error inserting user', error);
                                }
                            );
                        }
                    },
                    (error) => {
                        Alert.alert('Error', 'Something went wrong');
                        console.log('Error checking username', error);
                    }
                );
            });
        } else {
            Alert.alert('Error', 'Please fill in both fields');
        }
    };

    React.useEffect(() => {
        createTable();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
            />
            {/* <Button title="Register" onPress={registerUser} /> */}
            <TouchableOpacity style={styles.button} onPress={registerUser}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '100%', padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
    button: { width: '50%', alignSelf: 'center', backgroundColor: '#007BFF', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontWeight: 'bold' },
});
