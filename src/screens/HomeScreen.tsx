import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
    return (
        <React.Fragment>
            <View style={styles.container}>
                <Text style={styles.text}>Welcome to the Fitness App! 🏋️‍♂️</Text>
            </View>
        </React.Fragment>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 20, fontWeight: 'bold' },
});
