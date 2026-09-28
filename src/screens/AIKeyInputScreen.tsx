import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { AIProvider } from '@types/index';
import { EncryptionService } from '@utils/encryption';

interface AIKeyInputScreenProps {
  onKeysConfigured: () => void;
}

export const AIKeyInputScreen: React.FC<AIKeyInputScreenProps> = ({ onKeysConfigured }) => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
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
    } catch (error) {
      Alert.alert('Error', 'Failed to save API keys');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configure AI Provider</Text>
      <Text style={styles.subtitle}>
        Provide your API keys. They will be stored securely on your device.
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>OpenAI API Key</Text>
        <TextInput
          style={styles.input}
          placeholder="sk-..."
          value={openaiKey}
          onChangeText={setOpenaiKey}
          secureTextEntry
          editable={!loading}
        />
        <Text style={styles.hint}>Leave empty to skip</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Google Gemini API Key</Text>
        <TextInput
          style={styles.input}
          placeholder="AIzaSy..."
          value={geminiKey}
          onChangeText={setGeminiKey}
          secureTextEntry
          editable={!loading}
        />
        <Text style={styles.hint}>Leave empty to skip</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Anthropic Claude API Key</Text>
        <TextInput
          style={styles.input}
          placeholder="sk-ant-..."
          value={claudeKey}
          onChangeText={setClaudeKey}
          secureTextEntry
          editable={!loading}
        />
        <Text style={styles.hint}>Leave empty to skip</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSaveKeys}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save & Continue'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
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
