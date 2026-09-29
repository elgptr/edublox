import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { useAIKey, AIProvider } from '../hooks/useAIKey';

type RootStackParamList = {
  Login: undefined;
  Setup: undefined;
  AIKeyInput: undefined;
  Question: undefined;
  Result: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'AIKeyInput'>;

const AIKeyInputScreen = ({ navigation }: { navigation: NavigationProp }) => {
  const { keys, saveKey, isLoading } = useAIKey();
  const [inputKeys, setInputKeys] = useState({
    openai: keys.openai || '',
    gemini: keys.gemini || '',
    claude: keys.claude || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (provider: AIProvider) => {
    const key = inputKeys[provider];
    if (!key) {
      Alert.alert('Error', `Please enter a ${provider} API key`);
      return;
    }

    setIsSaving(true);
    const result = await saveKey(provider, key);
    setIsSaving(false);

    if (result.success) {
      Alert.alert('Success', `${provider.toUpperCase()} key saved securely!`);
    } else {
      Alert.alert('Error', `Failed to save ${provider} key`);
    }
  };

  const handleContinue = () => {
    if (keys.openai || keys.gemini || keys.claude) {
      navigation.navigate('Question');
    } else {
      Alert.alert('Missing API Key', 'Please provide at least one AI provider key to proceed.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Configuration</Text>
        <Text style={styles.subtitle}>Enter your API keys to generate exams. Keys are stored securely on your device.</Text>
      </View>

      <View style={styles.card}>
        <KeyInput 
          label="OpenAI Key" 
          value={inputKeys.openai} 
          onChangeText={(t) => setInputKeys({ ...inputKeys, openai: t })}
          onSave={() => handleSave('openai')}
          isSaved={!!keys.openai}
          placeholder="sk-..."
        />
        <View style={styles.divider} />
        <KeyInput 
          label="Google Gemini Key" 
          value={inputKeys.gemini} 
          onChangeText={(t) => setInputKeys({ ...inputKeys, gemini: t })}
          onSave={() => handleSave('gemini')}
          isSaved={!!keys.gemini}
          placeholder="AIza..."
        />
        <View style={styles.divider} />
        <KeyInput 
          label="Anthropic Claude Key" 
          value={inputKeys.claude} 
          onChangeText={(t) => setInputKeys({ ...inputKeys, claude: t })}
          onSave={() => handleSave('claude')}
          isSaved={!!keys.claude}
          placeholder="sk-ant-..."
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleContinue}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>Continue to Exam</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.secondaryButtonText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const KeyInput = ({ label, value, onChangeText, onSave, isSaved, placeholder }: any) => (
  <View style={styles.inputGroup}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {isSaved && <Text style={styles.savedBadge}>✓ Saved</Text>}
    </View>
    <View style={styles.inputRow}>
      <TextInput 
        style={styles.input} 
        value={value} 
        onChangeText={onChangeText} 
        placeholder={placeholder}
        secureTextEntry
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveBtnText}>Save</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  header: { marginTop: 40, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 2, marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  savedBadge: { fontSize: 12, color: '#10B981', fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB' },
  saveBtn: { backgroundColor: '#4F46E5', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 },
  button: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  secondaryButton: { paddingVertical: 16, alignItems: 'center', marginBottom: 40 },
  secondaryButtonText: { color: '#6B7280', fontSize: 16 },
});

export default AIKeyInputScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

export const AIKeyInputScreen: React.FC<{ navigation?: any; route?: any }> = () => {
  const [apiKey, setApiKey] = useState('');
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configure AI Provider (Phase 3)</Text>
      <TextInput style={styles.input} placeholder="Enter API Key" value={apiKey} onChangeText={setApiKey} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Coming in Phase 3')}>
        <Text style={styles.buttonText}>Save & Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
