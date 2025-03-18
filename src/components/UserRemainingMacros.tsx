import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealContext, Meal } from '../context/MealContext';
import { useFocusEffect } from '@react-navigation/native';

const db = SQLite.openDatabase(
    { name: 'fitnessApp.db', location: 'default' },
    () => console.log('Database opened successfully'),
    (error) => console.log('Error opening database:', error)
);

type Macros = {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
};

const UserRemainingMacros = () => {
    const { meals } = useContext(MealContext);
    const [target, setTarget] = useState<Macros | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch the logged-in user's target calories and macros from SQLite.
    const fetchUserMacros = async () => {
        const storedUsername = await AsyncStorage.getItem('loggedInUsername');
        if (!storedUsername) {
            Alert.alert('Error', 'No logged-in user found.');
            setLoading(false);
            return;
        }
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT calories, protein, carbs, fats FROM users WHERE username = ?;',
                [storedUsername],
                (tx, results) => {
                    if (results.rows.length > 0) {
                        const row = results.rows.item(0);
                        setTarget({
                            calories: row.calories ? parseFloat(row.calories) : 0,
                            protein: row.protein ? parseFloat(row.protein) : 0,
                            carbs: row.carbs ? parseFloat(row.carbs) : 0,
                            fats: row.fats ? parseFloat(row.fats) : 0,
                        });
                    } else {
                        Alert.alert('Error', 'User not found in database.');
                    }
                    setLoading(false);
                },
                (error) => {
                    console.log('Error fetching user macros:', error);
                    setLoading(false);
                }
            );
        });
    };

    // Use useFocusEffect to re-fetch user data each time the screen is focused.
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchUserMacros();
        }, [])
    );

    // Compute consumed macros from all meals in MealContext.
    const computeConsumedMacros = (meals: Meal[]): Macros => {
        return meals.reduce(
            (totals, meal) => {
                meal.foods.forEach((food) => {
                    totals.calories += food.calories;
                    totals.protein += food.protein;
                    totals.carbs += food.carbs;
                    totals.fats += food.fats;
                });
                return totals;
            },
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    if (!target) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Unable to fetch target macros.</Text>
            </View>
        );
    }

    const consumed = computeConsumedMacros(meals);
    // Calculate remaining values: target minus consumed (ensure no negative values).
    const remaining: Macros = {
        calories: Math.max(target.calories - consumed.calories, 0),
        protein: Math.max(target.protein - consumed.protein, 0),
        carbs: Math.max(target.carbs - consumed.carbs, 0),
        fats: Math.max(target.fats - consumed.fats, 0),
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Remaining Macros</Text>
            <View style={styles.box}>
                <Text style={styles.boxText}>
                    {remaining.calories} kcal | P: {remaining.protein.toFixed(1)}g, C: {remaining.carbs.toFixed(1)}g, F: {remaining.fats.toFixed(1)}g
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    box: {
        width: '90%',
        borderWidth: 1,
        borderColor: '#007BFF',
        borderRadius: 8,
        padding: 16,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
    },
    boxText: { fontSize: 18, textAlign: 'center' },
    errorText: { fontSize: 18, color: 'red' },
});

export default UserRemainingMacros;
