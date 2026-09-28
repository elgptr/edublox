import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Question, UserAnswer } from '@types/index';

interface QuestionScreenProps {
  questions: Question[];
  mode: 'training' | 'tryout';
  onComplete: (answers: UserAnswer[]) => void;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  questions,
  mode,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = userAnswers.find((a) => a.questionId === currentQuestion.id);

  const handleSelectAnswer = (optionId: string) => {
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption: optionId,
      answeredAt: new Date(),
    };

    setUserAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== currentQuestion.id);
      return [...filtered, newAnswer];
    });

    if (mode === 'training') {
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
    } else {
      onComplete(userAnswers);
    }
  };

  const isAnswered = !!currentAnswer;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progress}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <Text style={styles.questionText}>{currentQuestion.text}</Text>

      {currentQuestion.type === 'multiple-choice' ? (
        <View style={styles.options}>
          {currentQuestion.options?.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.option,
                currentAnswer?.selectedOption === opt.id && styles.optionSelected,
              ]}
              onPress={() => handleSelectAnswer(opt.id)}
            >
              <Text style={styles.optionText}>{opt.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.essayContainer}>
          <Text style={styles.essayLabel}>Your Answer:</Text>
          <Text style={styles.essayPlaceholder}>Essay mode - answer will be displayed here</Text>
        </View>
      )}

      {showExplanation && mode === 'training' && (
        <View style={styles.explanation}>
          <Text style={styles.explanationTitle}>Explanation:</Text>
          <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, !isAnswered && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!isAnswered}
      >
        <Text style={styles.buttonText}>
          {currentIndex === questions.length - 1 ? 'Complete' : 'Next'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  progress: { marginBottom: 24 },
  progressText: { fontSize: 14, color: '#666', marginBottom: 8 },
  progressBar: { backgroundColor: '#ddd', height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { backgroundColor: '#2563eb', height: '100%' },
  questionText: { fontSize: 18, fontWeight: '600', marginBottom: 24, color: '#333' },
  options: { gap: 12, marginBottom: 24 },
  option: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
  },
  optionSelected: { borderColor: '#2563eb', backgroundColor: '#e0e7ff' },
  optionText: { fontSize: 14, color: '#333' },
  essayContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 24 },
  essayLabel: { fontWeight: '600', marginBottom: 8, color: '#333' },
  essayPlaceholder: { color: '#999' },
  explanation: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
    padding: 16,
    marginBottom: 24,
    borderRadius: 8,
  },
  explanationTitle: { fontWeight: '600', color: '#166534', marginBottom: 8 },
  explanationText: { color: '#15803d', fontSize: 14, lineHeight: 20 },
  button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 32 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
