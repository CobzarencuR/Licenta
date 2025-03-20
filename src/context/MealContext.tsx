// import React, { createContext, useState, ReactNode } from 'react';

// export type Food = {
//     id: number;
//     foodname: string;
//     grams: number;
//     category: string;
//     calories: number;
//     protein: number;
//     carbs: number;
//     fats: number;
// };

// export type Meal = {
//     id: number;
//     userId: number;
//     title: string;
//     foods: Food[];
// };

// type MealContextType = {
//     meals: Meal[];
//     addMeal: (userId: number) => void;
//     addFoodToMeal: (mealId: number, food: Food) => void;
//     updateFoodInMeal: (mealId: number, updatedFood: Food) => void;
//     deleteMeal: (mealId: number) => void;
//     removeFoodFromMeal: (mealId: number, foodId: number) => void;
//     moveFoodToMeal: (sourceMealId: number, destinationMealId: number, food: Food) => void;
// };

// export const MealContext = createContext<MealContextType>({
//     meals: [],
//     addMeal: () => { },
//     addFoodToMeal: () => { },
//     updateFoodInMeal: () => { },
//     deleteMeal: () => { },
//     removeFoodFromMeal: () => { },
//     moveFoodToMeal: () => { },
// });

// type Props = {
//     children: ReactNode;
// };

// export const MealProvider = ({ children }: Props) => {
//     const [meals, setMeals] = useState<Meal[]>([]);

//     const addMeal = (userId: number) => {
//         setMeals((prevMeals) => {
//             const newMeal: Meal = {
//                 id: Date.now(),
//                 userId,
//                 title: `Meal ${prevMeals.filter(m => m.userId === userId).length + 1}`,
//                 foods: [],
//             };
//             return [...prevMeals, newMeal];
//         });
//     };

//     const addFoodToMeal = (mealId: number, food: Food) => {
//         setMeals((prevMeals) =>
//             prevMeals.map((meal) =>
//                 meal.id === mealId ? { ...meal, foods: [...meal.foods, food] } : meal
//             )
//         );
//         console.log(`Added new food to meal ${mealId}:`, food);
//     };

//     const updateFoodInMeal = (mealId: number, updatedFood: Food) => {
//         setMeals((prevMeals) =>
//             prevMeals.map((meal) => {
//                 if (meal.id === mealId) {
//                     const newFoods = meal.foods.map((f) =>
//                         f.id === updatedFood.id ? updatedFood : f
//                     );
//                     console.log(`Updating food in meal ${mealId}:\nBefore:`, meal.foods, "\nAfter:", newFoods);
//                     return { ...meal, foods: newFoods };
//                 }
//                 return meal;
//             })
//         );
//     };

//     const deleteMeal = (mealId: number) => {
//         setMeals((prevMeals) => {
//             const filteredMeals = prevMeals.filter((meal) => meal.id !== mealId);
//             return filteredMeals.map((meal, index) => ({
//                 ...meal,
//                 title: `Meal ${index + 1}`,
//             }));
//         });
//     };

//     const removeFoodFromMeal = (mealId: number, foodId: number) => {
//         setMeals((prevMeals) =>
//             prevMeals.map((meal) =>
//                 meal.id === mealId
//                     ? { ...meal, foods: meal.foods.filter((food) => food.id !== foodId) }
//                     : meal
//             )
//         );
//         console.log(`Removed food ${foodId} from meal ${mealId}`);
//     };

//     const moveFoodToMeal = (sourceMealId: number, destinationMealId: number, food: Food) => {
//         setMeals((prevMeals) =>
//             prevMeals.map((meal) => {
//                 if (meal.id === sourceMealId) {
//                     return { ...meal, foods: meal.foods.filter((f) => f.id !== food.id) };
//                 }
//                 if (meal.id === destinationMealId) {
//                     return { ...meal, foods: [...meal.foods, food] };
//                 }
//                 return meal;
//             })
//         );
//         console.log(`Moved food ${food.id} from meal ${sourceMealId} to meal ${destinationMealId}`);
//     };

//     return (
//         <MealContext.Provider value={{ meals, addMeal, addFoodToMeal, updateFoodInMeal, deleteMeal, removeFoodFromMeal, moveFoodToMeal }}>
//             {children}
//         </MealContext.Provider>
//     );
// };
import React, { createContext, useState, ReactNode } from 'react';
import SQLite from 'react-native-sqlite-storage';

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
    addMeal: (userId: number) => void;
    addFoodToMeal: (mealId: number, food: Food) => void;
    updateFoodInMeal: (mealId: number, updatedFood: Food) => void;
    deleteMeal: (mealId: number) => void;
    removeFoodFromMeal: (mealId: number, foodId: number) => void;
    moveFoodToMeal: (sourceMealId: number, destinationMealId: number, food: Food) => void;
};

export const MealContext = createContext<MealContextType>({
    meals: [],
    addMeal: () => { },
    addFoodToMeal: () => { },
    updateFoodInMeal: () => { },
    deleteMeal: () => { },
    removeFoodFromMeal: () => { },
    moveFoodToMeal: () => { },
});

const db = SQLite.openDatabase(
    { name: 'fitnessApp.db', location: 'default' },
    () => console.log('MealContext: Database opened successfully'),
    (error) => console.log('MealContext: Error opening database:', error)
);

type Props = {
    children: ReactNode;
};

export const MealProvider = ({ children }: Props) => {
    const [meals, setMeals] = useState<Meal[]>([]);

    // Function to add a meal.
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

    // Function to add food to a meal.
    const addFoodToMeal = (mealId: number, food: Food) => {
        db.transaction((tx) => {
            tx.executeSql(
                `INSERT INTO foods (mealId, foodName, grams, category, calories, protein, carbs, fats)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                    mealId,
                    food.foodname,
                    food.grams,
                    food.category,
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
                            meal.id === mealId
                                ? { ...meal, foods: [...meal.foods, newFood] }
                                : meal
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

    // Function to update an existing food in a meal.
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
            // Delete the meal from the SQLite meals table.
            tx.executeSql(
                'DELETE FROM meals WHERE mealId = ?;',
                [mealId],
                (tx, results) => {
                    console.log(`Deleted meal ${mealId} from SQLite`);
                    // Update state: filter out the deleted meal.
                    setMeals((prevMeals) => {
                        // Filter out the deleted meal.
                        const filteredMeals = prevMeals.filter((meal) => meal.id !== mealId);
                        // Reassign titles for the remaining meals.
                        filteredMeals.forEach((meal, index) => {
                            const newTitle = `Meal ${index + 1}`;
                            // Update the meal object in state.
                            meal.title = newTitle;
                            // Update the SQLite record for this meal.
                            db.transaction((tx2) => {
                                tx2.executeSql(
                                    'UPDATE meals SET name = ? WHERE mealId = ?;',
                                    [newTitle, meal.id],
                                    () => {
                                        console.log(`Updated meal ${meal.id} title to ${newTitle}`);
                                    },
                                    (tx2, error) => {
                                        console.error(`Error updating meal ${meal.id} title:`, error);
                                    }
                                );
                            });
                        });
                        return filteredMeals;
                    });
                },
                (tx, error) => {
                    console.error('Error deleting meal:', error);
                }
            );
        });
    };

    // Function to remove a single food from a meal.
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

    // Function to move a food from one meal to another.
    const moveFoodToMeal = (sourceMealId: number, destinationMealId: number, food: Food) => {
        db.transaction((tx) => {
            tx.executeSql(
                'UPDATE foods SET mealId = ? WHERE foodId = ?;',
                [destinationMealId, food.id],
                (tx, results) => {
                    console.log(`Moved food ${food.id} from meal ${sourceMealId} to ${destinationMealId} in SQLite`);
                    // Update context: remove from source and add to destination.
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
