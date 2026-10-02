import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import firestoreService from '../services/firestoreService';
import type { Question, UserAnswer, ExamResult } from '../types';

export const QuestionScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation, route }) => {
  const { currentUser } = useAuth();
  const { examSetupId, setup, questions } = route.params;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [startTime] = useState(new Date());

  const currentQ = questions[currentIndex] as Question;

  const handleSelectOption = (optionId: string) => {
    const existing = [...answers];
    const answerIndex = existing.findIndex(a => a.questionId === currentQ.id);
    
    const newAnswer: UserAnswer = {
      questionId: currentQ.id,
      selectedOption: optionId,
      answeredAt: new Date()
    };

    if (answerIndex >= 0) {
      existing[answerIndex] = newAnswer;
    } else {
      existing.push(newAnswer);
    }
    setAnswers(existing);
  };

  const handleNext = async () => {
    const hasAnswered = answers.find(a => a.questionId === currentQ.id);
    if (!hasAnswered) {
      Alert.alert('Incomplete', 'Please answer the question before proceeding.');
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await finishExam();
    }
  };

  const finishExam = async () => {
    try {
      const endTime = new Date();
      let correctCount = 0;
      
      const gradedAnswers = answers.map(ans => {
        const q = questions.find((q: Question) => q.id === ans.questionId);
        // Assuming AI generated "correctAnswer" or marked option as isCorrect
        // Because prompt says "options": [{"id":"a", "text":"...", "isCorrect":true}]
        const isCorrect = q?.options?.find((o: any) => o.id === ans.selectedOption)?.isCorrect 
                       || q?.correctAnswer === ans.selectedOption; // Fallback
                       
        if (isCorrect) correctCount++;
        return { ...ans, isCorrect };
      });

      const result: ExamResult = {
        id: `res_${Date.now()}`,
        examSetupId: examSetupId,
        userId: currentUser?.uid || 'guest',
        questions,
        userAnswers: gradedAnswers,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        score: Math.round((correctCount / questions.length) * 100),
        mode: setup.mode,
        startedAt: startTime,
        completedAt: endTime,
        timeSpentSeconds: Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      };

      if (currentUser?.uid) {
        result.id = await firestoreService.saveExamResult(currentUser.uid, result);
      }

      navigation.replace('Result', { examResultId: result.id, result: result });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save results');
    }
  };

  if (!currentQ) return <View style={styles.center}><Text>Loading...</Text></View>;

  const currentAnswer = answers.find(a => a.questionId === currentQ.id);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.progress}>Question {currentIndex + 1} of {questions.length}</Text>
      
      <View style={styles.card}>
        <Text style={styles.qText}>{currentQ.text}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQ.options?.map((opt: any) => {
          const isSelected = currentAnswer?.selectedOption === opt.id;
          return (
            <TouchableOpacity 
              key={opt.id} 
              style={[styles.optionBtn, isSelected && styles.optionSelected]} 
              onPress={() => handleSelectOption(opt.id)}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {opt.id.toUpperCase()}. {opt.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextBtnText}>
          {currentIndex === questions.length - 1 ? 'Finish Exam' : 'Next Question'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progress: { fontSize: 16, color: '#666', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2, marginBottom: 20 },
  qText: { fontSize: 18, lineHeight: 26, color: '#333' },
  optionsContainer: { gap: 12 },
  optionBtn: { padding: 16, backgroundColor: '#fff', borderWidth: 2, borderColor: '#eee', borderRadius: 8 },
  optionSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  optionText: { fontSize: 16, color: '#444' },
  optionTextSelected: { color: '#2563eb', fontWeight: 'bold' },
  nextBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 32, marginBottom: 40 },
  nextBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
