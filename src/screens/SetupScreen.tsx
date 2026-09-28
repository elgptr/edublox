import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { ExamSetup, GradeLevel, Semester, QuestionType, ExamMode } from '@types/index';

interface SetupScreenProps {
  onSetupComplete: (setup: ExamSetup) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onSetupComplete }) => {
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(1);
  const [semester, setSemester] = useState<Semester>('I');
  const [bookName, setBookName] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState('10');
  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice');
  const [mode, setMode] = useState<ExamMode>('training');

  const handleSubmit = () => {
    if (!bookName.trim()) {
      Alert.alert('Error', 'Please enter book name');
      return;
    }
    const num = parseInt(numberOfQuestions, 10);
    if (isNaN(num) || num < 1 || num > 100) {
      Alert.alert('Error', 'Questions: 1-100');
      return;
    }
    onSetupComplete({
      gradeLevel,
      semester,
      bookName,
      numberOfQuestions: num,
      questionType,
      mode,
      createdAt: new Date(),
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Setup Exam</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Grade Level</Text>
        <View style={styles.options}>
          {[1, 2, 3, 4, 5, 6].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.btn, gradeLevel === g && styles.btnActive]}
              onPress={() => setGradeLevel(g as GradeLevel)}
            >
              <Text style={[styles.btnText, gradeLevel === g && styles.btnTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Semester</Text>
        <View style={styles.options}>
          {(['I', 'II'] as Semester[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.btn, semester === s && styles.btnActive]}
              onPress={() => setSemester(s)}
            >
              <Text style={[styles.btnText, semester === s && styles.btnTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Book/Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Matematika"
          value={bookName}
          onChangeText={setBookName}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Questions Count</Text>
        <TextInput
          style={styles.input}
          placeholder="1-100"
          value={numberOfQuestions}
          onChangeText={setNumberOfQuestions}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.options}>
          {['multiple-choice', 'essay', 'mixed'].map((t: any) => (
            <TouchableOpacity
              key={t}
              style={[styles.btn, questionType === t && styles.btnActive]}
              onPress={() => setQuestionType(t)}
            >
              <Text style={[styles.btnText, questionType === t && styles.btnTextActive]}>
                {t === 'multiple-choice' ? 'MC' : t === 'essay' ? 'Essay' : 'Mixed'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Mode</Text>
        <View style={styles.options}>
          {['training', 'tryout'].map((m: any) => (
            <TouchableOpacity
              key={m}
              style={[styles.btn, mode === m && styles.btnActive]}
              onPress={() => setMode(m)}
            >
              <Text style={[styles.btnText, mode === m && styles.btnTextActive]}>
                {m === 'training' ? 'Training' : 'Try Out'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>Generate Questions</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#333' },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  btnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  btnText: { color: '#333', fontSize: 12 },
  btnTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 32 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
