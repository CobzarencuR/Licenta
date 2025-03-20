import React, { createContext, useState, useEffect, ReactNode } from 'react';
import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Food = {
    category: string;
    id: number;
    foodname: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
};

export type Meal = {
    id: number;
    userId: number;
    title: string;
    foods: Food[];
};

type MealContextType = {
    meals: Meal[];
    loadMeals: () => void;
    addMeal: (userId: number) => void;
    addFoodToMeal: (mealId: number, food: Food) => void;
    updateFoodInMeal: (mealId: number, updatedFood: Food) => void;
    deleteMeal: (mealId: number) => void;
    removeFoodFromMeal: (mealId: number, foodId: number) => void;
    moveFoodToMeal: (sourceMealId: number, destinationMealId: number, food: Food) => void;
};

export const MealContext = createContext<MealContextType>({
    meals: [],
    loadMeals: () => { },
    addMeal: () => { },
    addFoodToMeal: () => { },
    updateFoodInMeal: () => { },
    deleteMeal: () => { },
    removeFoodFromMeal: () => { },
    moveFoodToMeal: () => { },
});

type Props = {
    children: ReactNode;
};

const db = SQLite.openDatabase(
    { name: 'fitnessApp.db', location: 'default' },
    () => {
        console.log('MealProvider: Database opened successfully'),
            // Enable foreign key constraints
            db.executeSql('PRAGMA foreign_keys = ON;');
    },
    (error) => console.log('MealProvider: Error opening database:', error)
);

export const MealProvider = ({ children }: Props) => {
    const [meals, setMeals] = useState<Meal[]>([]);

    // Load meals from SQLite for the currently logged-in user.
    const loadMeals = async () => {
        const storedUserId = await AsyncStorage.getItem('loggedInUserId');
        if (!storedUserId) {
            setMeals([]);
            return;
        }
        const userId = parseInt(storedUserId, 10);
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT * FROM meals WHERE user_id = ?;',
                [userId],
                (tx, results) => {
                    const rows = results.rows;
                    let loadedMeals: Meal[] = [];
                    for (let i = 0; i < rows.length; i++) {
                        const item = rows.item(i);
                        loadedMeals.push({
                            id: item.mealId,
                            userId: item.user_id,
                            title: item.name,
                            foods: [],
                        });
                    }

                    loadedMeals.forEach((meal, index) => {
                        tx.executeSql(
                            'SELECT * FROM foods WHERE mealId = ?;',
                            [meal.id],
                            (tx, res) => {
                                let foods: Food[] = [];
                                for (let j = 0; j < res.rows.length; j++) {
                                    const foodRow = res.rows.item(j);
                                    foods.push({
                                        id: foodRow.foodId,
                                        foodname: foodRow.foodName,
                                        grams: foodRow.grams,
                                        category: foodRow.category,
                                        calories: foodRow.calories,
                                        protein: foodRow.protein,
                                        carbs: foodRow.carbs,
                                        fats: foodRow.fats,
                                    });
                                }
                                loadedMeals[index].foods = foods;
                                // If last meal, update state.
                                if (index === loadedMeals.length - 1) {
                                    setMeals(loadedMeals);
                                }
                            },
                            (tx, error) => console.error('Error fetching foods for meal', meal.id, error)
                        );
                    });
                    if (loadedMeals.length === 0) {
                        setMeals([]);
                    }
                },
                (tx, error) => {
                    console.error('Error loading meals:', error);
                }
            );
        });
    };

    // Load meals on provider mount.
    useEffect(() => {
        loadMeals();
    }, []);

    // Add a new meal for the current user.
    const addMeal = (userId: number) => {
        const currentMealsForUser = meals.filter((meal) => meal.userId === userId);
        const newTitle = `Meal ${currentMealsForUser.length + 1}`;
        db.transaction((tx) => {
            tx.executeSql(
                'INSERT INTO meals (user_id, name) VALUES (?, ?);',
                [userId, newTitle],
                (tx, results) => {
                    const insertedId = results.insertId;
                    const newMeal: Meal = {
                        id: insertedId,
                        userId,
                        title: newTitle,
                        foods: [],
                    };
                    setMeals((prevMeals) => [...prevMeals, newMeal]);
                    console.log('Meal added with id:', insertedId);
                },
                (tx, error) => {
                    console.error('Error adding meal:', error);
                }
            );
        });
    };

    const addFoodToMeal = (mealId: number, food: Food) => {
        db.transaction((tx) => {
            tx.executeSql(
                `INSERT INTO foods (mealId, foodName, grams, category, calories, protein, carbs, fats)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                    mealId,
                    food.foodname,
                    food.grams,
                    food.category || '',
                    food.calories,
                    food.protein,
                    food.carbs,
                    food.fats,
                ],
                (tx, results) => {
                    const insertedId = results.insertId;
                    const newFood: Food = { ...food, id: insertedId };
                    setMeals((prevMeals) =>
                        prevMeals.map((meal) =>
                            meal.id === mealId ? { ...meal, foods: [...meal.foods, newFood] } : meal
                        )
                    );
                    console.log(`Food added to meal ${mealId} with id:`, insertedId);
                },
                (tx, error) => {
                    console.error('Error adding food:', error);
                }
            );
        });
    };

    const updateFoodInMeal = (mealId: number, updatedFood: Food) => {
        db.transaction((tx) => {
            tx.executeSql(
                `UPDATE foods 
         SET foodName = ?, grams = ?, calories = ?, protein = ?, carbs = ?, fats = ?
         WHERE foodId = ?;`,
                [
                    updatedFood.foodname,
                    updatedFood.grams,
                    updatedFood.calories,
                    updatedFood.protein,
                    updatedFood.carbs,
                    updatedFood.fats,
                    updatedFood.id,
                ],
                (tx, results) => {
                    console.log(`Updated food ${updatedFood.id} in meal ${mealId}`);
                    setMeals((prevMeals) =>
                        prevMeals.map((meal) => {
                            if (meal.id === mealId) {
                                const newFoods = meal.foods.map((f) =>
                                    f.id === updatedFood.id ? updatedFood : f
                                );
                                return { ...meal, foods: newFoods };
                            }
                            return meal;
                        })
                    );
                },
                (tx, error) => {
                    console.error('Error updating food:', error);
                }
            );
        });
    };

    const deleteMeal = (mealId: number) => {
        db.transaction((tx) => {
            tx.executeSql(
                'DELETE FROM meals WHERE mealId = ?;',
                [mealId],
                (tx, results) => {
                    console.log(`Deleted meal ${mealId} from SQLite`);
                    AsyncStorage.getItem('loggedInUserId').then((storedUserId) => {
                        if (storedUserId) {
                            const userId = parseInt(storedUserId, 10);
                            // Update state: filter meals by current user and remove the deleted meal.
                            setMeals((prevMeals) => {
                                // Filter meals that belong to the current user (and are not deleted)
                                const userMeals = prevMeals.filter(
                                    (meal) => meal.userId === userId && meal.id !== mealId
                                );
                                // Reassign titles for userMeals.
                                const updatedUserMeals = userMeals.map((meal, index) => ({
                                    ...meal,
                                    title: `Meal ${index + 1}`,
                                }));
                                // Now, update the database for each updated meal.
                                updatedUserMeals.forEach((meal) => {
                                    db.transaction((tx2) => {
                                        tx2.executeSql(
                                            'UPDATE meals SET name = ? WHERE mealId = ?;',
                                            [meal.title, meal.id],
                                            () => console.log(`Updated meal ${meal.id} title to ${meal.title}`),
                                            (tx2, error) =>
                                                console.error(`Error updating meal ${meal.id} title:`, error)
                                        );
                                    });
                                });
                                // Now, combine updated meals for the current user with meals from other users (if any).
                                const otherMeals = prevMeals.filter((meal) => meal.userId !== userId);
                                return [...otherMeals, ...updatedUserMeals];
                            });
                        }
                    });
                },
                (tx, error) => {
                    console.error('Error deleting meal:', error);
                }
            );
        });
    };


    const removeFoodFromMeal = (mealId: number, foodId: number) => {
        db.transaction((tx) => {
            tx.executeSql(
                'DELETE FROM foods WHERE foodId = ?;',
                [foodId],
                (tx, results) => {
                    console.log(`Deleted food ${foodId} from SQLite`);
                    setMeals((prevMeals) =>
                        prevMeals.map((meal) =>
                            meal.id === mealId
                                ? { ...meal, foods: meal.foods.filter((food) => food.id !== foodId) }
                                : meal
                        )
                    );
                },
                (tx, error) => {
                    console.error('Error deleting food:', error);
                }
            );
        });
    };

    const moveFoodToMeal = (sourceMealId: number, destinationMealId: number, food: Food) => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE foods SET mealId = ? WHERE foodId = ?;',
                [destinationMealId, food.id],
                (tx, results) => {
                    console.log(`Moved food ${food.id} from meal ${sourceMealId} to ${destinationMealId} in SQLite`);
                    setMeals((prevMeals) =>
                        prevMeals.map((meal) => {
                            if (meal.id === sourceMealId) {
                                return { ...meal, foods: meal.foods.filter((f) => f.id !== food.id) };
                            }
                            if (meal.id === destinationMealId) {
                                return { ...meal, foods: [...meal.foods, food] };
                            }
                            return meal;
                        })
                    );
                },
                (tx, error) => {
                    console.error('Error moving food:', error);
                }
            );
        });
    };

    return (
        <MealContext.Provider
            value={{
                meals,
                loadMeals,
                addMeal,
                addFoodToMeal,
                updateFoodInMeal,
                deleteMeal,
                removeFoodFromMeal,
                moveFoodToMeal,
            }}
        >
            {children}
        </MealContext.Provider>
    );
};
