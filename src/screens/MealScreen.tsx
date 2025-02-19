import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MealScreen() {
    return (
        <React.Fragment>
            <View style={styles.container}>
                <Text style={styles.text}>Meals Screen</Text>
            </View>
        </React.Fragment>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 20, fontWeight: 'bold' },
});
