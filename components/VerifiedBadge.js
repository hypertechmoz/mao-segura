import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants';

export default function VerifiedBadge({ size = 16, style, color = Colors.primary }) {
    return (
        <View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
            <MaterialIcons name="verified" size={size} color={color} />
        </View>
    );
}
