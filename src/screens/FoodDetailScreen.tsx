import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MealContext, Food } from '../context/MealContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const FoodDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { mealId, food } = route.params as { mealId: number; food: Food };

    // Set up state for editable grams. In a real app you might recalc macros/calories based on grams.
    const [grams, setGrams] = useState(food.grams.toString());
    const { addFoodToMeal, updateFoodInMeal } = useContext(MealContext);

    const handleSave = () => {
        const newGrams = parseFloat(grams);
        if (isNaN(newGrams) || newGrams <= 0) {
            Alert.alert('Invalid input', 'Please enter a valid number for grams.');
            return;
        }
        // Calculate the factor based on the original food grams.
        // (You might want to store an immutable baseline if you expect multiple edits.)

        const factor = newGrams / food.grams;
        const updatedFood: Food = {
            ...food,
            grams: newGrams,
            calories: Math.round(food.calories * factor),
            protein: parseFloat((food.protein * factor).toFixed(1)),
            carbs: parseFloat((food.carbs * factor).toFixed(1)),
            fats: parseFloat((food.fats * factor).toFixed(1)),
            // id: Date.now(),
        };

        console.log("handleSave: updatedFood computed:", updatedFood);

        // Check if the food already exists (has a non-zero id)
        if (food.id && food.id !== 0) {
            updateFoodInMeal(mealId, updatedFood);
        } else {
            updatedFood.id = Date.now();
            addFoodToMeal(mealId, updatedFood);
        }
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Food Details</Text>
            <Text style={styles.label}>Name: {food.foodname}</Text>
            <Text style={styles.label}>Default grams: {food.grams}g</Text>
            <Text style={styles.label}>Enter new grams:</Text>
            <TextInput
                style={styles.input}
                value={grams}
                onChangeText={setGrams}
                keyboardType="numeric"
            />
            <Text style={styles.details}>
                Calories: {Math.round(food.calories * (parseFloat(grams) / food.grams))} kcal
            </Text>
            <Text style={styles.details}>
                Protein: {(food.protein * (parseFloat(grams) / food.grams)).toFixed(1)}g | Carbs:{' '}
                {(food.carbs * (parseFloat(grams) / food.grams)).toFixed(1)}g | Fats:{' '}
                {(food.fats * (parseFloat(grams) / food.grams)).toFixed(1)}g
            </Text>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: 'center' },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 12,
    },
    details: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
    saveButton: {
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 16,
    },
    saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default FoodDetailScreen;
