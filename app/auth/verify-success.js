import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Fonts } from '../../constants';

export default function VerifySuccess() {
    const router = useRouter();

    const handleContinue = () => {
        router.replace('/(tabs)/home');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={100} color={Colors.primary} />
                </View>
                
                <Text style={styles.title}>Email Verificado!</Text>
                <Text style={styles.description}>
                    A sua conta foi ativada com sucesso. Agora já pode explorar todos os serviços do Mão Segura.
                </Text>

                <TouchableOpacity style={styles.button} onPress={handleContinue}>
                    <Text style={styles.buttonText}>Começar a usar</Text>
                    <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.white },
    content: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
    successIcon: { marginBottom: 30 },
    title: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 16, textAlign: 'center' },
    description: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
    button: { 
        backgroundColor: Colors.primary, 
        flexDirection: 'row',
        height: 56, 
        width: '100%',
        borderRadius: 16, 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 10,
        shadowColor: Colors.primary, 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 8, 
        elevation: 4 
    },
    buttonText: { color: Colors.white, fontSize: 16, fontWeight: '700' }
});
