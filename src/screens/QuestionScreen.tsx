import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const QuestionScreen: React.FC<{ navigation?: any; route?: any }> = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Questions (Phase 3)</Text>
      <Text style={styles.text}>Exam questions will appear here</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  text: { fontSize: 16, color: '#666' },
});
