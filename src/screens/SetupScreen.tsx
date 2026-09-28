import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';

export const SetupScreen: React.FC<{ navigation?: any; route?: any }> = () => {
  const [bookName, setBookName] = useState('');
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Setup Exam (Phase 3)</Text>
      <TextInput style={styles.input} placeholder="Book Name" value={bookName} onChangeText={setBookName} />
      <TouchableOpacity style={styles.btn} onPress={() => Alert.alert('Coming in Phase 3')}>
        <Text style={styles.btnText}>Generate Questions</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 16 },
  btn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
