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
                    photoUri TEXT,
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

            // Create meals table
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS meals (
                mealId INTEGER PRIMARY KEY AUTOINCREMENT, 
                user_id INTEGER NOT NULL,  
                name TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );`,
                [],
                () => console.log('Meals table created successfully'),
                (error) => console.log('Error creating meals table', error)
            );

            // Create foods table
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS foods (
                foodId INTEGER PRIMARY KEY AUTOINCREMENT,
                mealId INTEGER NOT NULL,
                foodName TEXT NOT NULL,
                grams REAL NOT NULL,
                category TEXT NOT NULL,
                calories REAL NOT NULL,
                protein REAL NOT NULL,
                carbs REAL NOT NULL,
                fats REAL NOT NULL,
                FOREIGN KEY (mealId) REFERENCES meals(mealId) ON DELETE CASCADE
            );`,
                [],
                () => console.log('Foods table created successfully'),
                (error) => console.log('Error creating foods table', error)
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
                                async () => {
                                    // Send data to PostgreSQL
                                    try {
                                        const response = await fetch('http://10.0.2.2:3000/register', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({ username, email, password }),
                                        });

                                        const data = await response.json();
                                        if (response.ok) {
                                            Alert.alert('Registration Successful', 'You can now log in');
                                            navigation.navigate('Login');
                                        } else {
                                            Alert.alert('Error', data.message || 'Could not register user in PostgreSQL');
                                        }
                                    } catch (error) {
                                        Alert.alert('Error', 'Failed to connect to the server');
                                        console.log('PostgreSQL registration error:', error);
                                    }
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

