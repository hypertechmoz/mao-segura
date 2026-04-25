import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAlertStore } from '../store/alertStore';
import { Colors } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function GlobalAlerts() {
    const alerts = useAlertStore(state => state.alerts);
    const removeAlert = useAlertStore(state => state.removeAlert);
    const insets = useSafeAreaInsets();

    if (alerts.length === 0) return null;

    return (
        <View style={[styles.container, { top: insets.top + 10 }]} pointerEvents="box-none">
            {alerts.map((alert) => (
                <View key={alert.id} style={[styles.card, alert.type === 'error' ? styles.cardError : styles.cardSuccess]}>
                    <Ionicons 
                        name={alert.type === 'error' ? 'alert-circle' : 'checkmark-circle'} 
                        size={28} 
                        color={alert.type === 'error' ? Colors.error : Colors.primary} 
                    />
                    <View style={styles.textContainer}>
                        {!!alert.title && <Text style={styles.title}>{alert.title}</Text>}
                        <Text style={styles.message}>{alert.message}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeAlert(alert.id)} style={{ padding: 4 }}>
                        <Ionicons name="close" size={20} color={Colors.textLight} />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 9999,
        gap: 10,
        alignItems: 'center'
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
        borderLeftWidth: 5,
        width: '100%',
        maxWidth: 400
    },
    cardSuccess: { borderLeftColor: Colors.primary },
    cardError: { borderLeftColor: Colors.error },
    textContainer: { flex: 1, marginLeft: 12 },
    title: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 2 },
    message: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' }
});
