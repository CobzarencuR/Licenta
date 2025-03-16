import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { MealContext } from '../context/MealContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type MealScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MealCategory'>;
const MealScreen = () => {
    const { meals, addMeal, deleteMeal } = useContext(MealContext);
    const navigation = useNavigation<MealScreenNavigationProp>();

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

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.addMealButton} onPress={addMeal}>
                <Text style={styles.addMealText}>AddMeal</Text>
            </TouchableOpacity>

            {meals.map((meal) => (
                <View key={meal.id} style={styles.mealBox}>
                    <Text style={styles.mealTitle}>{meal.title}</Text>
                    <TouchableOpacity
                        style={styles.deleteMealButton}
                        onPress={() => handleDeleteMeal(meal.id)}
                    >
                        <Text style={styles.deleteMealText}>X</Text>
                    </TouchableOpacity>
                    {meal.foods.length === 0 ? (
                        <Text style={styles.noFoodsText}>No foods added</Text>
                    ) : (
                        meal.foods.map((food) => (
                            <TouchableOpacity
                                key={food.id}
                                style={styles.foodItem}
                                onPress={() =>
                                    navigation.navigate('FoodDetail', { mealId: meal.id, food })
                                }
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
                            navigation.navigate('MealCategory', { mealId: meal.id })
                        }
                    >
                        <Text style={styles.addFoodText}>AddFood</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
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
});

export default MealScreen;