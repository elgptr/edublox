import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, } from 'react-native';
import { EncryptionService } from '@utils/encryption';
export const AIKeyInputScreen = ({ onKeysConfigured }) => {
    const [openaiKey, setOpenaiKey] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [claudeKey, setClaudeKey] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('openai');
    const [loading, setLoading] = useState(false);
    const handleSaveKeys = async () => {
        try {
            setLoading(true);
            if (openaiKey.trim()) {
                await EncryptionService.saveAPIKey('openai', openaiKey.trim());
            }
            if (geminiKey.trim()) {
                await EncryptionService.saveAPIKey('gemini', geminiKey.trim());
            }
            if (claudeKey.trim()) {
                await EncryptionService.saveAPIKey('claude', claudeKey.trim());
            }
            if (!openaiKey.trim() && !geminiKey.trim() && !claudeKey.trim()) {
                Alert.alert('Error', 'Please provide at least one API key');
                return;
            }
            Alert.alert('Success', 'API keys saved securely');
            onKeysConfigured();
        }
        catch (error) {
            Alert.alert('Error', 'Failed to save API keys');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(ScrollView, { style: styles.container, children: [_jsx(Text, { style: styles.title, children: "Configure AI Provider" }), _jsx(Text, { style: styles.subtitle, children: "Provide your API keys. They will be stored securely on your device." }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.label, children: "OpenAI API Key" }), _jsx(TextInput, { style: styles.input, placeholder: "sk-...", value: openaiKey, onChangeText: setOpenaiKey, secureTextEntry: true, editable: !loading }), _jsx(Text, { style: styles.hint, children: "Leave empty to skip" })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.label, children: "Google Gemini API Key" }), _jsx(TextInput, { style: styles.input, placeholder: "AIzaSy...", value: geminiKey, onChangeText: setGeminiKey, secureTextEntry: true, editable: !loading }), _jsx(Text, { style: styles.hint, children: "Leave empty to skip" })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.label, children: "Anthropic Claude API Key" }), _jsx(TextInput, { style: styles.input, placeholder: "sk-ant-...", value: claudeKey, onChangeText: setClaudeKey, secureTextEntry: true, editable: !loading }), _jsx(Text, { style: styles.hint, children: "Leave empty to skip" })] }), _jsx(TouchableOpacity, { style: [styles.button, loading && styles.buttonDisabled], onPress: handleSaveKeys, disabled: loading, children: _jsx(Text, { style: styles.buttonText, children: loading ? 'Saving...' : 'Save & Continue' }) })] }));
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
    section: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    hint: { fontSize: 12, color: '#999', marginTop: 4 },
    button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 32 },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
//# sourceMappingURL=AIKeyInputScreen.js.map