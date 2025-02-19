import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeaderProps {
    username: string;
}

const Header: React.FC<HeaderProps> = ({ username }) => {
    return (
        <View style={styles.header}>
            <Text style={styles.headerText}>MyFitnessApp</Text>
            <Text style={styles.usernameText}>{username}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#007AFF',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    usernameText: {
        fontSize: 16,
        color: 'white',
        marginTop: 5,
    },
});

export default Header;