import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';

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
    const [objective, setObjective] = useState('');
    const navigation = useNavigation();

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

    const sexOptions = [
        { label: 'Male', value: 'M' },
        { label: 'Female', value: 'F' }
    ];

    const ActivityLevelOptions = [
        { label: 'Not Very Active', value: '1.1' },
        { label: 'Light Active', value: '1.2' },
        { label: 'Active', value: '1.3' },
        { label: 'Very Active', value: '1.4' }
    ];

    const ObjectiveOptions = [
        { label: 'Weight Loss', value: 'lose' },
        { label: 'Maintenance', value: 'maintain' },
        { label: 'Weight Gain', value: 'gain' }
    ]

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
                            setObjective(row.objective || '');
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

    const calculateCaloriesAndMacros = () => {
        const weightKg = parseFloat(weight);
        const heightCm = parseFloat(height);
        const age = calculateAge(dob);
        const activityMultiplier = parseFloat(activityLevel);

        let BMR;
        if (sex === 'M') {
            BMR = 66 + 13.7 * weightKg + 5 * heightCm - 6.75 * age;
        } else if (sex === 'F') {
            BMR = 655 + 9.6 * weightKg + 1.7 * heightCm - 4.7 * age;
        } else {
            return null;
        }

        const totalCalories = BMR * activityMultiplier;

        const proteinGrams = weightKg * 1.75;
        const fatGrams = weightKg * 0.88;
        const proteinCalories = proteinGrams * 4;
        const fatCalories = fatGrams * 9;
        let carbsCalories = 0;
        let carbsGrams = 0;

        if (objective === 'maintain') {
            carbsCalories = totalCalories - (proteinCalories + fatCalories);
            carbsGrams = carbsCalories / 4;
        } else if (objective === 'lose') {
            carbsCalories = totalCalories - (proteinCalories + fatCalories) - 300;
            carbsGrams = carbsCalories / 4;
        } else if (objective === 'gain') {
            carbsCalories = totalCalories - (proteinCalories + fatCalories) + 150;
            carbsGrams = carbsCalories / 4;
        }

        return {
            totalCalories: Math.round(totalCalories),
            protein: Math.round(proteinGrams),
            carbs: Math.round(carbsGrams),
            fat: Math.round(fatGrams),
        };
    };

    // Function to update user profile
    const updateProfile = async () => {
        const storedUsername = await AsyncStorage.getItem('loggedInUsername');

        if (!storedUsername) {
            Alert.alert('Error', 'User not found. Please log in again.');
            return;
        }

        if (!height || !weight || !sex || !dob || !activityLevel || !objective) {
            Alert.alert('Error', 'All fields must be filled in before saving.');
            return;
        }

        const age = calculateAge(dob);
        const macros = calculateCaloriesAndMacros();

        if (!macros) return;

        console.log('Updating profile for username:', storedUsername);

        db.transaction(tx => {
            tx.executeSql(
                `UPDATE users
                        SET height = ?, weight = ?, sex = ?, dob = ?, age = ?, activityLevel = ?, objective = ?, calories = ?, protein = ?, carbs = ?, fats = ?
                        WHERE username = ?;`,
                [height, weight, sex, dob.toISOString().split('T')[0], age, activityLevel, objective, macros.totalCalories, macros.protein, macros.carbs, macros.fat, username],
                (_, result) => {
                    console.log('Rows affected:', result.rowsAffected);
                    if (result.rowsAffected > 0) {
                        Alert.alert('Success', 'Profile updated successfully');
                    } else {
                        Alert.alert('Error', 'All fields must be filled in');
                    }
                },
                (error) => {
                    console.log('Error updating profile:', error);
                    Alert.alert('Database Error', (error as any).message);
                }
            );
        });
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('loggedInUsername');
        navigation.navigate('Login' as never);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Profile</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Username:</Text>
                <Text style={styles.value}>{username}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{email}</Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Height (cm):</Text>
                <TextInput placeholder="Insert height" value={height} onChangeText={setHeight} keyboardType="numeric" />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Weight (kg):</Text>
                <TextInput placeholder="Insert weight" value={weight} onChangeText={setWeight} keyboardType="numeric" />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Sex:</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={sexOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Select sex"
                    value={sex}
                    onChange={item => setSex(item.value)}
                />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Date of Birth:</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => setShowDatePicker(true)}>
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
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Activity Level:</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={ActivityLevelOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Select level"
                    value={activityLevel}
                    onChange={item => setActivityLevel(item.value)}
                />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Objective:</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={ObjectiveOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Select objective"
                    value={objective}
                    onChange={item => setObjective(item.value)}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={updateProfile}>
                <Text style={styles.buttonText}>Save Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    label: { fontSize: 16, fontWeight: '500' },
    value: { fontSize: 16, color: '#333' },
    dropdownButton: { padding: 10, borderWidth: 1, borderRadius: 5, borderColor: '#ccc', width: 'auto' },
    dropdown: { backgroundColor: '#fff', borderColor: '#ccc', borderRadius: 5, width: 100, },
    button: { width: '50%', alignSelf: 'center', backgroundColor: '#007BFF', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 20 },
    buttonText: { color: 'white', fontWeight: 'bold' },
    logoutButton: { width: '50%', alignSelf: 'center', backgroundColor: '#FF3B30', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 },
    logoutText: { color: 'white', fontWeight: 'bold' }
});

