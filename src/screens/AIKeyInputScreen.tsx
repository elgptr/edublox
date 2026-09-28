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
