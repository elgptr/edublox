import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import firestoreService from '../services/firestoreService';
import type { ExamResult } from '../types';

export const HistoryScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { currentUser } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (!currentUser?.uid) return;
    try {
      setLoading(true);
      const data = await firestoreService.getExamResults(currentUser.uid);
      
      // Sort by date descending
      data.sort((a: any, b: any) => {
        const dateA = a.completedAt?.seconds || 0;
        const dateB = b.completedAt?.seconds || 0;
        return dateB - dateA;
      });
      
      setResults(data as ExamResult[]);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ExamResult }) => {
    const date = item.completedAt ? new Date((item.completedAt as any).seconds * 1000).toLocaleDateString() : 'Unknown date';
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('Result', { result: item, examResultId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.modeText}>{item.mode.toUpperCase()}</Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {item.score}</Text>
          <Text style={styles.statsText}>{item.correctAnswers}/{item.totalQuestions} Correct</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>History</Text>
      {results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You haven't taken any exams yet.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#111827' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1, borderWidth: 1, borderColor: '#eee' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  modeText: { fontWeight: '600', color: '#2563eb', fontSize: 14 },
  dateText: { color: '#6B7280', fontSize: 14 },
  scoreContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  scoreText: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  statsText: { fontSize: 14, color: '#4B5563' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#6B7280', fontSize: 16 },
});
