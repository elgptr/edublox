import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { ExamResult, Question } from '../types';

export const ResultScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation, route }) => {
  const { result } = route.params as { result: ExamResult };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exam Completed!</Text>
        <Text style={styles.scoreText}>Score</Text>
        <Text style={styles.score}>{result.score}</Text>
        <Text style={styles.stats}>
          {result.correctAnswers} correct out of {result.totalQuestions}
        </Text>
        <Text style={styles.stats}>
          Time: {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s
        </Text>
      </View>

      <Text style={styles.reviewTitle}>Review Answers</Text>
      
      {result.questions.map((q: Question, idx: number) => {
        const ans = result.userAnswers.find(a => a.questionId === q.id);
        const isCorrect = ans?.isCorrect;
        
        return (
          <View key={q.id} style={[styles.card, isCorrect ? styles.cardCorrect : styles.cardWrong]}>
            <Text style={styles.qText}>{idx + 1}. {q.text}</Text>
            <Text style={styles.ansText}>Your Answer: {ans?.selectedOption || 'None'}</Text>
            {!isCorrect && (
              <Text style={styles.correctText}>Correct Answer: {q.correctAnswer || q.options?.find(o => o.isCorrect)?.id}</Text>
            )}
            <Text style={styles.explanation}>Explanation: {q.explanation}</Text>
          </View>
        );
      })}

      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.btnText}>Start New Exam</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { alignItems: 'center', backgroundColor: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  scoreText: { fontSize: 16, color: '#6B7280' },
  score: { fontSize: 64, fontWeight: 'bold', color: '#2563eb', marginVertical: 8 },
  stats: { fontSize: 16, color: '#4B5563' },
  reviewTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1f2937' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1 },
  cardCorrect: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  cardWrong: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  qText: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#1f2937' },
  ansText: { fontSize: 14, marginBottom: 4, color: '#4B5563' },
  correctText: { fontSize: 14, color: '#059669', fontWeight: '500', marginBottom: 4 },
  explanation: { fontSize: 14, color: '#6B7280', marginTop: 8, fontStyle: 'italic' },
  btn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16, marginBottom: 40 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
