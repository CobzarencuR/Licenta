import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SettingsButton() {
    const navigation = useNavigation();
    return (
        <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)}>
            <Icon name="settings-outline" size={26} color="white" />
        </TouchableOpacity>
    );
};
