import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
type MealScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FoodList'>;

const MealCategoryScreen = () => {
    const navigation = useNavigation<MealScreenNavigationProp>();
    const route = useRoute();
    const { mealId } = route.params as { mealId: number };
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch('http://10.0.2.2:3000/getCategories')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                // data is expected to be an array of strings like ["Meat", "Fruit", ...]
                setCategories(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
                setLoading(false);
            });
    }, []);

    const navigateToFoodList = (category: string) => {
        navigation.navigate('FoodList', { category, mealId });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Select a Food Category</Text>
            {categories.map((category) => (
                <TouchableOpacity
                    key={category}
                    style={styles.categoryButton}
                    onPress={() => navigateToFoodList(category)}
                >
                    <Text style={styles.categoryText}>{category}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    categoryButton: {
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 5,
        marginBottom: 16,
        alignItems: 'center',
    },
    categoryText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default MealCategoryScreen;