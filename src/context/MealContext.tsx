import React, { createContext, useState, ReactNode } from 'react';

export type Food = {
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
    title: string;
    foods: Food[];
};

type MealContextType = {
    meals: Meal[];
    addMeal: () => void;
    addFoodToMeal: (mealId: number, food: Food) => void;
    updateFoodInMeal: (mealId: number, updatedFood: Food) => void;
    deleteMeal: (mealId: number) => void;
};

export const MealContext = createContext<MealContextType>({
    meals: [],
    addMeal: () => { },
    addFoodToMeal: () => { },
    updateFoodInMeal: () => { },
    deleteMeal: () => { }
});

type Props = {
    children: ReactNode;
};

export const MealProvider = ({ children }: Props) => {
    const [meals, setMeals] = useState<Meal[]>([]);

    // Add a new meal with a unique id and a sequential title based on current count.
    const addMeal = () => {
        setMeals((prevMeals) => {
            const newMeal: Meal = {
                id: Date.now(), // Unique id based on timestamp
                title: `Meal ${prevMeals.length + 1}`,
                foods: [],
            };
            return [...prevMeals, newMeal];
        });
    };

    const addFoodToMeal = (mealId: number, food: Food) => {
        setMeals((prevMeals) =>
            prevMeals.map((meal) =>
                meal.id === mealId ? { ...meal, foods: [...meal.foods, food] } : meal
            )
        );
        console.log(`Added new food to meal ${mealId}:`, food);
    };

    const updateFoodInMeal = (mealId: number, updatedFood: Food) => {
        setMeals((prevMeals) =>
            prevMeals.map((meal) => {
                if (meal.id === mealId) {
                    const newFoods = meal.foods.map((f) =>
                        f.id === updatedFood.id ? updatedFood : f
                    );
                    console.log(`Updating food in meal ${mealId}:\nBefore:`, meal.foods, "\nAfter:", newFoods);
                    return { ...meal, foods: newFoods };
                }
                return meal;
            })
        );
    };

    // Delete a meal by its id and reassign titles to keep numbering sequential.
    const deleteMeal = (mealId: number) => {
        setMeals((prevMeals) => {
            const filteredMeals = prevMeals.filter((meal) => meal.id !== mealId);
            // Reassign titles to be sequential.
            return filteredMeals.map((meal, index) => ({
                ...meal,
                title: `Meal ${index + 1}`,
            }));
        });
    };

    return (
        <MealContext.Provider value={{ meals, addMeal, addFoodToMeal, updateFoodInMeal, deleteMeal }}>
            {children}
        </MealContext.Provider>
    );
};
