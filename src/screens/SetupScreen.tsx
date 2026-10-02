import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import firestoreService from '../services/firestoreService';
import type { ExamSetup, GradeLevel, Semester, QuestionType, ExamMode } from '../types';
import { AIService } from '../services/aiService';
import { useAIKey } from '../hooks/useAIKey';

export const SetupScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation }) => {
  const { currentUser } = useAuth();
  const { activeKeyInfo, isUsingSystemKey, isLoading: isKeyLoading } = useAIKey();
  
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(4);
  const [semester, setSemester] = useState<Semester>('I');
  const [bookName, setBookName] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [type, setType] = useState<QuestionType>('multiple-choice');
  const [mode, setMode] = useState<ExamMode>('training');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!bookName.trim()) {
      Alert.alert('Error', 'Please enter a book name or subject topic');
      return;
    }
    
    try {
      setLoading(true);
      const qCount = parseInt(questionCount) || 5;
      
      const setup: ExamSetup = {
        gradeLevel,
        semester,
        bookName,
        numberOfQuestions: qCount,
        questionType: type,
        mode,
        createdAt: new Date(),
      };
      
      // Resolve custom key first, then fall back to the system Gemini key.
      const activeKey = activeKeyInfo || await AIService.getActiveKey();

      const aiResponse = await AIService.generateQuestions({
        ...setup,
        aiConfig: { provider: activeKey.provider, apiKey: activeKey.apiKey, baseUrl: activeKey.baseUrl, model: activeKey.model }
      });
      
      let setupId = 'temp_id';
      if (currentUser?.uid) {
        setupId = await firestoreService.saveExamSetup(currentUser.uid, setup);
      }
      
      // Pass questions in navigation state to QuestionScreen
      navigation.navigate('Question', { 
        examSetupId: setupId, 
        setup: setup,
        questions: aiResponse.questions,
        questionIndex: 0 
      });
      
    } catch (e: any) {
      const errorText = `${e?.message || ''} ${e?.details || ''}`.toLowerCase();
      const isRateLimited = e?.status === 429 || e?.code === 'RATE_LIMIT' ||
        errorText.includes('429') || errorText.includes('rate limit') ||
        errorText.includes('quota') || errorText.includes('resource_exhausted');

      if (isRateLimited) {
        Alert.alert(
          'Server sedang ramai',
          'Coba 1 menit lagi, atau masukkan API Key pribadimu di Pengaturan untuk akses bebas antrean.',
          [
            { text: 'Nanti', style: 'cancel' },
            { text: 'Buka Pengaturan', onPress: () => navigation?.navigate('Settings') },
          ]
        );
      } else {
        Alert.alert('Gagal membuat soal', e.message || 'Terjadi kesalahan saat membuat soal.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Setup Try Out</Text>

      <View style={styles.aiBanner}>
        <Text style={styles.aiBannerTitle}>
          {isUsingSystemKey ? '✨ Menggunakan Gemini AI Gratis (Sistem)' : '🔑 Menggunakan API Key Pribadi'}
        </Text>
        <TouchableOpacity onPress={() => navigation?.navigate('Settings')}>
          <Text style={styles.settingsLink}>Ingin pakai key sendiri? Atur di Pengaturan</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.label}>Grade Level: {gradeLevel}</Text>
      <View style={styles.row}>
        {[1,2,3,4,5,6].map(g => (
          <TouchableOpacity key={g} style={[styles.choiceBtn, gradeLevel === g && styles.choiceBtnActive]} onPress={() => setGradeLevel(g as GradeLevel)}>
            <Text style={[styles.choiceText, gradeLevel === g && styles.choiceTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.label}>Semester: {semester}</Text>
      <View style={styles.row}>
        {['I', 'II'].map(s => (
          <TouchableOpacity key={s} style={[styles.choiceBtn, semester === s && styles.choiceBtnActive]} onPress={() => setSemester(s as Semester)}>
            <Text style={[styles.choiceText, semester === s && styles.choiceTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.label}>Topic / Book Name</Text>
      <TextInput style={styles.input} placeholder="e.g. Matematika Pecahan" value={bookName} onChangeText={setBookName} />
      
      <Text style={styles.label}>Number of Questions</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={questionCount} onChangeText={setQuestionCount} />
      
      <TouchableOpacity style={styles.btn} onPress={handleGenerate} disabled={loading || isKeyLoading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Generate Questions</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  aiBanner: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  aiBannerTitle: { color: '#065f46', fontSize: 14, fontWeight: '700' },
  settingsLink: { color: '#047857', fontSize: 13, marginTop: 6, textDecorationLine: 'underline' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  choiceBtn: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff', minWidth: 40, alignItems: 'center' },
  choiceBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  choiceText: { color: '#333' },
  choiceTextActive: { color: '#fff', fontWeight: 'bold' },
  btn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 32, marginBottom: 40 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
