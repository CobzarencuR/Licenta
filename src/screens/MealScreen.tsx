import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { MealContext } from '../context/MealContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import SQLite from 'react-native-sqlite-storage';
import UserRemainingMacros from '../components/UserRemainingMacros';

type MealScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MealCategory'>;

const db = SQLite.openDatabase(
    { name: 'fitnessApp.db', location: 'default' },
    () => console.log('Database opened successfully'),
    (error) => console.log('Error opening database:', error)
);

const MealScreen = () => {
    const [user, setUser] = useState<any>(null);
    const { meals, addMeal, deleteMeal, removeFoodFromMeal, moveFoodToMeal } = useContext(MealContext);
    const navigation = useNavigation<MealScreenNavigationProp>();
    // State to manage modals and selection
    const [optionModalVisible, setOptionModalVisible] = useState(false);
    const [moveModalVisible, setMoveModalVisible] = useState(false);
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [selectedMealId, setSelectedMealId] = useState<number | null>(null);

    const handleDeleteMeal = (mealId: number) => {
        Alert.alert(
            'Delete Meal',
            'Are you sure you want to delete this meal?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => deleteMeal(mealId), style: 'destructive' },
            ]
        );
    };

    // Called when a food is long pressed.
    const handleFoodLongPress = (mealId: number, food: any) => {
        setSelectedMealId(mealId);
        setSelectedFood(food);
        setOptionModalVisible(true);
    };

    // Get list of destination meals (exclude the current one)
    const destinationMeals = meals.filter(
        (meal) => meal.id !== selectedMealId
    );

    // Helper to compute totals for a meal.
    const computeMealTotals = (foods: any[]) => {
        return foods.reduce(
            (totals, food) => {
                totals.calories += food.calories;
                totals.protein += food.protein;
                totals.carbs += food.carbs;
                totals.fats += food.fats;
                return totals;
            },
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>

                <UserRemainingMacros />

                <TouchableOpacity style={styles.addMealButton} onPress={addMeal}>
                    <Text style={styles.addMealText}>AddMeal</Text>
                </TouchableOpacity>

                {meals.map((meal) => {
                    // Compute totals for this meal.
                    const totals = computeMealTotals(meal.foods);
                    return (
                        <View key={meal.id} style={styles.mealBox}>
                            <View style={styles.mealHeader}>
                                <Text style={styles.mealTitle}>
                                    {meal.title} {'\n'}
                                    <Text style={styles.mealTotals}>
                                        {totals.calories} kcal | P: {totals.protein.toFixed(1)}g C: {totals.carbs.toFixed(1)}g F: {totals.fats.toFixed(1)}g
                                    </Text>
                                </Text>
                                <TouchableOpacity
                                    style={styles.deleteMealButton}
                                    onPress={() => handleDeleteMeal(meal.id)}
                                >
                                    <Text style={styles.deleteMealText}>X</Text>
                                </TouchableOpacity>
                            </View>
                            {meal.foods.length === 0 ? (
                                <Text style={styles.noFoodsText}>No foods added</Text>
                            ) : (
                                meal.foods.map((food) => (
                                    <TouchableOpacity
                                        key={food.id}
                                        style={styles.foodItem}
                                        // Short press to edit.
                                        onPress={() =>
                                            navigation.navigate('FoodDetail', { mealId: meal.id, food })
                                        }
                                        // Long press to show options.
                                        onLongPress={() => handleFoodLongPress(meal.id, food)}
                                    >
                                        <Text style={styles.foodName}>{food.foodname}</Text>
                                        <Text style={styles.foodDetails}>
                                            {food.grams}g | {food.calories} kcal
                                        </Text>
                                        <Text style={styles.foodDetails}>
                                            P: {food.protein}g C: {food.carbs}g F: {food.fats}g
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            )}
                            <TouchableOpacity
                                style={styles.addFoodButton}
                                onPress={() =>
                                    // Navigate to MealCategory and pass the mealId for adding new food.
                                    navigation.navigate('MealCategory', { mealId: meal.id })
                                }
                            >
                                <Text style={styles.addFoodText}>AddFood</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Option Modal: Cancel, Delete, Move */}
            <Modal
                visible={optionModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setOptionModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                if (selectedMealId && selectedFood) {
                                    removeFoodFromMeal(selectedMealId, selectedFood.id);
                                }
                                setOptionModalVisible(false);
                            }}
                        >
                            <Text style={styles.modalOptionText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setOptionModalVisible(false);
                                setMoveModalVisible(true);
                            }}
                        >
                            <Text style={styles.modalOptionText}>Move</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => setOptionModalVisible(false)}
                        >
                            <Text style={styles.modalOptionText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Move Modal: List of destination meals */}
            <Modal
                visible={moveModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setMoveModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {destinationMeals.map((meal) => (
                            <TouchableOpacity
                                key={meal.id}
                                style={styles.modalOption}
                                onPress={() => {
                                    if (selectedMealId && selectedFood) {
                                        moveFoodToMeal(selectedMealId, meal.id, selectedFood);
                                    }
                                    setMoveModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalOptionText}>{meal.title}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => setMoveModalVisible(false)}
                        >
                            <Text style={styles.modalOptionText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
    },
    addMealButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 16,
        alignItems: 'center',
    },
    addMealText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    mealBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 16,
    },
    mealTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    noFoodsText: {
        fontStyle: 'italic',
        marginBottom: 8,
    },
    addFoodButton: {
        backgroundColor: '#28a745',
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 8,
    },
    addFoodText: {
        color: '#FFF',
    },
    foodItem: {
        marginBottom: 8,
    },
    foodName: {
        fontSize: 16,
        fontWeight: '600',
    },
    foodDetails: {
        fontSize: 14,
    },
    mealHeader: {
        // Relative container for absolute positioning the delete button
        paddingRight: 30,
    },
    deleteMealButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#dc3545',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteMealText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 16,
    },
    modalOption: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    modalOptionText: {
        fontSize: 18,
        textAlign: 'center',
    },
    mealTotals: { fontSize: 14, color: '#555' },
});

export default MealScreen;