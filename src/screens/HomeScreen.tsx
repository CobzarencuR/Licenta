import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import UserRemainingMacros from '../components/UserRemainingMacros';

export default function HomeScreen() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <UserRemainingMacros />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});
