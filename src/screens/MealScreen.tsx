import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { MealContext, Meal } from '../context/MealContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserRemainingMacros from '../components/UserRemainingMacros';
import DateTimePicker from '@react-native-community/datetimepicker';

type MealScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MealCategory'>;

const MealScreen = () => {
    const { meals, loadMeals, addMeal, deleteMeal, removeFoodFromMeal, moveFoodToMeal } = useContext(MealContext);
    const navigation = useNavigation<MealScreenNavigationProp>();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [optionModalVisible, setOptionModalVisible] = useState(false);
    const [moveModalVisible, setMoveModalVisible] = useState(false);
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [selectedMealId, setSelectedMealId] = useState<number | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const formattedDate = selectedDate.toISOString().split('T')[0];

    useEffect(() => {
        const fetchUserId = async () => {
            const storedUserId = await AsyncStorage.getItem('loggedInUserId');
            if (storedUserId) {
                setCurrentUserId(parseInt(storedUserId, 10));
            }
        };
        fetchUserId();
    }, []);

    // Reload meals when the screen gains focus or when selectedDate changes.
    useFocusEffect(
        React.useCallback(() => {
            loadMeals(formattedDate);
        }, [formattedDate])
    );

    // Filter meals for current user (should already be filtered in loadMeals)
    const userMeals = currentUserId
        ? meals.filter((meal) => meal.userId === currentUserId)
        : [];

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

    const handleFoodLongPress = (mealId: number, food: any) => {
        setSelectedMealId(mealId);
        setSelectedFood(food);
        setOptionModalVisible(true);
    };

    const destinationMeals = userMeals.filter((meal) => meal.id !== selectedMealId);

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

    const handleAddMeal = () => {
        if (currentUserId) {
            addMeal(currentUserId, formattedDate);
        } else {
            Alert.alert('Error', 'User id not found');
        }
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>

                <View style={styles.datePickerRow}>
                    <Text style={styles.dateLabel}>Selected Date:</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                    </TouchableOpacity>
                </View>
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) setSelectedDate(date);
                        }}
                    />
                )}

                <UserRemainingMacros />

                <TouchableOpacity style={styles.addMealButton} onPress={handleAddMeal}>
                    <Text style={styles.addMealText}>Add Meal</Text>
                </TouchableOpacity>

                {userMeals.map((meal) => {
                    const totals = computeMealTotals(meal.foods);
                    return (
                        <View key={meal.id} style={styles.mealBox}>
                            <View style={styles.mealHeader}>
                                <Text style={styles.mealTitle}>
                                    {meal.title}{'\n'}
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
                                        onPress={() =>
                                            navigation.navigate('FoodDetail', { mealId: meal.id, food })
                                        }
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
                                    navigation.navigate('MealCategory', { mealId: meal.id })
                                }
                            >
                                <Text style={styles.addFoodText}>Add Food</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>

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
    datePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateLabel: { fontSize: 18, marginRight: 8 },
    dateText: { fontSize: 18, color: '#007AFF' },
    addMealButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 16,
        alignItems: 'center',
    },
    addMealText: { color: '#FFF', fontWeight: 'bold' },
    mealBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 16,
        position: 'relative',
    },
    mealHeader: {
        paddingRight: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mealTitle: { fontSize: 18, fontWeight: 'bold' },
    mealTotals: { fontSize: 14, color: '#555' },
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
    deleteMealText: { color: '#FFF', fontWeight: 'bold' },
    noFoodsText: { fontStyle: 'italic', marginVertical: 8 },
    addFoodButton: {
        backgroundColor: '#28a745',
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 8,
    },
    addFoodText: { color: '#FFF' },
    foodItem: { marginBottom: 8 },
    foodName: { fontSize: 16, fontWeight: '600' },
    foodDetails: { fontSize: 14 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: { backgroundColor: '#fff', padding: 16 },
    modalOption: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    modalOptionText: { fontSize: 18, textAlign: 'center' },
});

export default MealScreen;
