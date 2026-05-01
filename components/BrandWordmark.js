import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants';

/**
 * Marca "Trabalhe já" com suporte a:
 * - texto empilhado (mobile/app icon feel)
 * - texto em linha (web)
 * - apenas ícone (telas pequenas)
 *
 * @param {'default'|'onDark'|'onDarkLarge'|'muted'|'compact'|'footer'} variant
 * @param {'stack'|'inline'} layout
 * @param {boolean} showIcon
 * @param {boolean} iconOnly
 */
export default function BrandWordmark({
    variant = 'default',
    layout = 'stack',
    showIcon = false,
    iconOnly = false,
    style,
}) {
    const v = stylesByVariant[variant] || stylesByVariant.default;
    const isInline = layout === 'inline';

    return (
        <View style={[styles.wrap, isInline && styles.inlineWrap, style]} accessibilityRole="header" accessibilityLabel="Trabalhe Já">
            {showIcon && (
                <View style={[styles.iconSquare, v.iconSquare]}>
                    <Text style={[styles.iconText, v.iconText]}>TJ</Text>
                </View>
            )}
            {!iconOnly && (
                <View style={isInline && styles.inlineTextWrap}>
                    <Text style={[styles.line1, v.line1]}>Trabalhe</Text>
                    <Text style={[styles.line2, isInline && styles.inlineLine2, v.line2, isInline && v.inlineLine2]}>Já</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { justifyContent: 'center' },
    inlineWrap: { flexDirection: 'row', alignItems: 'center' },
    inlineTextWrap: { flexDirection: 'row', alignItems: 'baseline' },
    line1: { fontWeight: '800', letterSpacing: -0.5 },
    line2: { fontWeight: '800', letterSpacing: -0.5, marginTop: -2 },
    inlineLine2: { marginTop: 0, marginLeft: 6 },
    iconSquare: {
        width: 34,
        height: 34,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        backgroundColor: Colors.primary,
    },
    iconText: { fontSize: 13, fontWeight: '900', color: Colors.white, letterSpacing: -0.2 },
});

const stylesByVariant = {
    default: {
        line1: { fontSize: 17, color: Colors.primary },
        line2: { fontSize: 15, color: Colors.primary },
        inlineLine2: { fontSize: 17, color: Colors.primary },
        iconSquare: { backgroundColor: Colors.primary },
        iconText: { color: Colors.white },
    },
    compact: {
        line1: { fontSize: 15, color: Colors.primary },
        line2: { fontSize: 13, color: Colors.primary },
        inlineLine2: { fontSize: 15, color: Colors.primary },
        iconSquare: { width: 30, height: 30, borderRadius: 7, marginRight: 0, backgroundColor: Colors.primary },
        iconText: { fontSize: 11, color: Colors.white },
    },
    onDark: {
        line1: { fontSize: 18, color: Colors.white },
        line2: { fontSize: 16, color: Colors.white },
        inlineLine2: { fontSize: 18, color: Colors.white },
        iconSquare: { backgroundColor: Colors.white },
        iconText: { color: Colors.primary },
    },
    onDarkLarge: {
        line1: { fontSize: 22, color: Colors.white },
        line2: { fontSize: 19, color: Colors.white },
        inlineLine2: { fontSize: 22, color: Colors.white },
        iconSquare: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.white },
        iconText: { fontSize: 14, color: Colors.primary },
    },
    muted: {
        line1: { fontSize: 56, color: Colors.text, opacity: 0.08 },
        line2: { fontSize: 48, color: Colors.text, opacity: 0.08, marginTop: -4 },
        inlineLine2: { fontSize: 56, color: Colors.text, opacity: 0.08 },
        iconSquare: { width: 84, height: 84, borderRadius: 20, marginRight: 20, backgroundColor: Colors.text, opacity: 0.08 },
        iconText: { fontSize: 30, color: Colors.white, opacity: 0.65 },
    },
    footer: {
        line1: { fontSize: 18, color: Colors.white },
        line2: { fontSize: 16, color: Colors.white },
        inlineLine2: { fontSize: 18, color: Colors.white },
        iconSquare: { backgroundColor: Colors.primary, marginRight: 12 },
        iconText: { color: Colors.white },
    },
};
