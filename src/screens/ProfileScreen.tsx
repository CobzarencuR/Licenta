import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Alert, TouchableOpacity, Modal, FlatList } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import * as ImagePicker from 'react-native-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = SQLite.openDatabase(
    { name: 'fitnessApp.db', location: 'default' },
    () => console.log('Database opened successfully'),
    (error) => console.log('Error opening database:', error)
);

export default function ProfileScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [sex, setSex] = useState('');
    const [dob, setDob] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activityLevel, setActivityLevel] = useState('');
    const [showSexModal, setShowSexModal] = useState(false);
    const [showActivityLevelModal, setShowActivityLevelModal] = useState(false);

    // Calculate age based on DOB
    const calculateAge = (dob: Date) => {
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();

        if (month < dob.getMonth() || (month === dob.getMonth() && day < dob.getDate())) {
            age--;
        }
        return age;
    };

    interface Option {
        label: string;
        value: string;
    }

    const sexOptions: Option[] = [
        { label: 'Male', value: 'M' },
        { label: 'Female', value: 'F' }
    ];

    const activityLevelOptions: Option[] = [
        { label: 'Not Very Active', value: '1.1' },
        { label: 'Light Active', value: '1.2' },
        { label: 'Active', value: '1.3' },
        { label: 'Very Active', value: '1.4' }
    ];

    const renderOption = (item: Option, type: 'sex' | 'activityLevel') => {
        return (
            <TouchableOpacity onPress={() => {
                if (type === 'sex') setSex(item.value);
                else setActivityLevel(item.value);
                type === 'sex' ? setShowSexModal(false) : setShowActivityLevelModal(false);
            }}>
                <Text style={styles.option}>{item.label}</Text>
            </TouchableOpacity>
        );
    };

    // Fetch user data from the database
    useEffect(() => {
        const fetchUserProfile = async () => {
            const storedUsername = await AsyncStorage.getItem('loggedInUsername');

            if (!storedUsername) {
                console.log('No logged-in user found.');
                Alert.alert('Error', 'No logged-in user. Please log in again.');
                return;
            }

            console.log('Fetching profile for username:', storedUsername);

            db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM users WHERE username = ?;',
                    [storedUsername],
                    (tx, results) => {
                        if (results.rows.length > 0) {
                            const row = results.rows.item(0);
                            setUsername(row.username);
                            setEmail(row.email);
                            setHeight(row.height ? row.height.toString() : '');
                            setWeight(row.weight ? row.weight.toString() : '');
                            setSex(row.sex || '');
                            setDob(row.dob ? new Date(row.dob) : new Date());
                            setActivityLevel(row.activityLevel ? row.activityLevel.toString() : '');
                        } else {
                            console.log('No user found in the database.');
                        }
                    },
                    (error) => console.log('Error fetching user data:', error)
                );
            });
        };

        fetchUserProfile();
    }, []);

    // Function to update user profile
    const updateProfile = async () => {
        const storedUsername = await AsyncStorage.getItem('loggedInUsername');

        if (!storedUsername) {
            Alert.alert('Error', 'User not found. Please log in again.');
            return;
        }

        const age = calculateAge(dob); // Calculate age

        console.log('Updating profile for username:', storedUsername);

        db.transaction(tx => {
            tx.executeSql(
                `UPDATE users 
                    SET height = ?, weight = ?, sex = ?, dob = ?, age = ?, activityLevel = ? 
                    WHERE username = ?;`,
                [height || null, weight || null, sex || null, dob.toISOString().split('T')[0], age, activityLevel || null, username],
                (_, result) => {
                    console.log('Rows affected:', result.rowsAffected);
                    if (result.rowsAffected > 0) {
                        Alert.alert('Success', 'Profile updated successfully');
                    } else {
                        Alert.alert('Error', 'No user found or no changes made');
                    }
                },
                (error) => {
                    console.log('Error updating profile:', error);
                    Alert.alert('Database Error', (error as any).message);
                }
            );
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profile</Text>

            <Text style={styles.label}>Username: {username}</Text>
            <Text style={styles.label}>Email: {email}</Text>

            <TextInput style={styles.input} placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />

            <Text style={styles.label}>Sex:</Text>
            <TouchableOpacity onPress={() => setShowSexModal(true)} style={styles.dropdownButton}>
                <Text>{sex === 'M' ? 'Male' : 'Female'}</Text>
            </TouchableOpacity>

            {/* Sex Modal */}
            <Modal visible={showSexModal} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <FlatList
                        data={sexOptions}
                        renderItem={({ item }) => renderOption(item, 'sex')}
                        keyExtractor={(item) => item.value}
                    />
                </View>
            </Modal>

            <Text style={styles.label}>Date of Birth:</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Text>{dob.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={dob}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDob(selectedDate);
                    }}
                />
            )}

            <Text style={styles.label}>Activity Level:</Text>
            <TouchableOpacity onPress={() => setShowActivityLevelModal(true)} style={styles.dropdownButton}>
                <Text>{activityLevel === '1.1' ? 'Not Very Active' : activityLevel === '1.2' ? 'Light Active' : activityLevel === '1.3' ? 'Active' : 'Very Active'}</Text>
            </TouchableOpacity>

            {/* Activity Level Modal */}
            <Modal visible={showActivityLevelModal} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <FlatList
                        data={activityLevelOptions}
                        renderItem={({ item }) => renderOption(item, 'activityLevel')}
                        keyExtractor={(item) => item.value}
                    />
                </View>
            </Modal>

            <TouchableOpacity style={styles.button} onPress={updateProfile}>
                <Text style={styles.buttonText}>Save Profile</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
    input: { width: '100%', padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 10 },
    label: { fontSize: 16, marginVertical: 5 },
    dateButton: { padding: 10, backgroundColor: '#ddd', borderRadius: 5, marginVertical: 5 },
    buttonGroup: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
    button: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5, marginVertical: 5 },
    selected: { backgroundColor: '#4CAF50' },
    buttonText: { color: 'white', fontWeight: 'bold' },
    dropdownButton: {
        padding: 10,
        backgroundColor: '#ddd',
        marginBottom: 20,
        borderRadius: 5,
        width: 200,
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    option: {
        padding: 10,
        backgroundColor: 'white',
        marginBottom: 5,
        borderRadius: 5,
        width: 200,
        textAlign: 'center',
    },
});
