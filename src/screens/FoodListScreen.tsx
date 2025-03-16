import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const FoodListScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
    const { category, mealId } = route.params as { category: string; mealId: number };
    const [foods, setFoods] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch(`http://10.0.2.2:3000/getFoodsByCategory?category=${category}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setFoods(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching foods:', error);
                setLoading(false);
            });
    }, [category]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.foodButton}
            onPress={() =>
                navigation.navigate('FoodDetail', { mealId, food: item })
            }
        >
            <Text style={styles.foodText}>{item.foodname}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Foods in {category}</Text>
            <FlatList
                data={foods}
                // Use item.foodId if it exists, otherwise fallback to index as key
                keyExtractor={(item, index) => (item.foodId ? item.foodId.toString() : index.toString())}
                renderItem={renderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    foodButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 5,
        marginBottom: 12,
        alignItems: 'center',
    },
    foodText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default FoodListScreen;
