import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ExamResult } from '@types/index';

interface ResultScreenProps {
  result: ExamResult;
  onRetry: () => void;
  onHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onRetry,
  onHome,
}) => {
  const percentage = ((result.correctAnswers / result.totalQuestions) * 100).toFixed(1);
  const passed = result.correctAnswers >= result.totalQuestions * 0.7;

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.scoreCard, passed ? styles.scoreCardPass : styles.scoreCardFail]}>
        <Text style={styles.scoreText}>{percentage}%</Text>
        <Text style={styles.scoreLabel}>{passed ? 'PASSED' : 'FAILED'}</Text>
        <Text style={styles.scoreDetail}>
          {result.correctAnswers} of {result.totalQuestions} correct
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time Spent</Text>
          <Text style={styles.statValue}>
            {Math.floor(result.timeSpentSeconds / 60)}m
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Mode</Text>
          <Text style={styles.statValue}>
            {result.mode === 'training' ? 'Training' : 'Try Out'}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Difficulty</Text>
          <Text style={styles.statValue}>Mixed</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Review Answers</Text>
        {result.questions.map((q, i) => {
          const answer = result.userAnswers.find((a) => a.questionId === q.id);
          const isCorrect = answer?.isCorrect;

          return (
            <View key={q.id} style={styles.reviewItem}>
              <View
                style={[
                  styles.reviewHeader,
                  isCorrect ? styles.correctHeader : styles.incorrectHeader,
                ]}
              >
                <Text style={styles.reviewNumber}>Q{i + 1}</Text>
                <Text style={styles.reviewStatus}>{isCorrect ? '✓' : '✗'}</Text>
              </View>
              <Text style={styles.reviewQuestion}>{q.text}</Text>
              <Text style={styles.reviewAnswer}>Your answer: {answer?.selectedOption}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={onHome}>
          <Text style={styles.buttonTextSecondary}>Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  scoreCard: { borderRadius: 12, padding: 24, marginBottom: 24, alignItems: 'center' },
  scoreCardPass: { backgroundColor: '#dcfce7' },
  scoreCardFail: { backgroundColor: '#fee2e2' },
  scoreText: { fontSize: 48, fontWeight: 'bold', marginBottom: 8 },
  scoreLabel: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  scoreDetail: { fontSize: 14, opacity: 0.8 },
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '600', color: '#333' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  reviewItem: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
  reviewHeader: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  correctHeader: { backgroundColor: '#dcfce7' },
  incorrectHeader: { backgroundColor: '#fee2e2' },
  reviewNumber: { fontWeight: '600' },
  reviewStatus: { fontSize: 18, fontWeight: 'bold' },
  reviewQuestion: { padding: 12, fontSize: 14, color: '#333' },
  reviewAnswer: { padding: 12, fontSize: 12, color: '#666', backgroundColor: '#f9f9f9' },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  button: { flex: 1, backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonSecondary: { backgroundColor: '#e5e7eb' },
  buttonText: { color: '#fff', fontWeight: '600' },
  buttonTextSecondary: { color: '#333', fontWeight: '600' },
});
