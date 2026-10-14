import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAIKey } from '../hooks/useAIKey';
import { AIService } from '../services/aiService';

type RootStackParamList = {
  Login: undefined;
  Setup: undefined;
  AIKeyInput: { from?: string };
  Question: {
    examSetupId: string;
    questionIndex: number;
  };
  Result: {
    examResultId: string;
  };
  History: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Setup'>;

export const SetupScreen: React.FC<{
  navigation: NavigationProp;
  route?: any;
}> = ({ navigation }) => {
  const { keys, activeKeyInfo } = useAIKey();
  const [bookName, setBookName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('1');
  const [semester, setSemester] = useState('I');
  const [questionCount, setQuestionCount] = useState('10');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [mode, setMode] = useState('training');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAIMode, setSelectedAIMode] = useState<'custom' | 'system'>('system');

  // Determine available AI provider
  const customKeyAvailable = !!(keys.openai || keys.gemini || keys.claude);
  const hasSystemGemini = activeKeyInfo?.isSystemDefault ?? false;
  const canStartExam = customKeyAvailable || hasSystemGemini;
  const activeProvider = selectedAIMode === 'custom' 
    ? (keys.openai ? 'openai' : keys.gemini ? 'gemini' : keys.claude ? 'claude' : null)
    : 'gemini';

  const handleStartExam = async () => {
    if (!bookName.trim()) {
      Alert.alert('Error', 'Please enter a book name');
      return;
    }

    if (!canStartExam) {
      Alert.alert(
        'No AI Provider',
        'Please set up an AI provider in settings or use the system Gemini fallback.',
        [
          { text: 'Go to Settings', onPress: () => navigation.navigate('AIKeyInput', { from: 'Setup' }) },
          { text: 'Cancel' },
        ]
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate exam start - in real app, would call aiService to generate questions
      // For now, just navigate to Question screen
      setTimeout(() => {
        setIsGenerating(false);
        navigation.navigate('Question', {
          examSetupId: `exam_${Date.now()}`,
          questionIndex: 0,
        });
      }, 500);
    } catch (error: any) {
      setIsGenerating(false);
      
      // Handle specific error codes
      if (error?.code === 'RATE_LIMIT_ERROR') {
        Alert.alert(
          'Rate Limit Reached',
          'The AI service is temporarily overloaded. Please wait a few minutes and try again.\n\nAlternatively, you can:\n• Switch to a different AI provider in Settings\n• Reduce the number of questions\n• Try again later',
          [
            { text: 'Go to Settings', onPress: () => navigation.navigate('AIKeyInput', { from: 'Setup' }) },
            { text: 'OK' },
          ]
        );
      } else {
        Alert.alert('Error', error?.message || 'Failed to start exam. Please try again.');
      }
    }
  };

  const handleOpenSettings = () => {
    navigation.navigate('AIKeyInput', { from: 'Setup' });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Setup Exam</Text>
        <Text style={styles.subtitle}>Configure your exam parameters</Text>
      </View>

      {/* AI Mode Selection */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Provider</Text>
        </View>

        {/* System Gemini Badge */}
        {hasSystemGemini && (
          <TouchableOpacity
            style={[
              styles.aiModeOption,
              selectedAIMode === 'system' && styles.aiModeOptionActive,
            ]}
            onPress={() => setSelectedAIMode('system')}
          >
            <View style={styles.aiModeContent}>
              <Text style={styles.aiModeName}>🔄 System Gemini (Fallback)</Text>
              <Text style={styles.aiModeDesc}>Free AI model, no custom key needed</Text>
            </View>
            {selectedAIMode === 'system' && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Custom Provider Option */}
        {customKeyAvailable && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity
              style={[
                styles.aiModeOption,
                selectedAIMode === 'custom' && styles.aiModeOptionActive,
              ]}
              onPress={() => setSelectedAIMode('custom')}
            >
              <View style={styles.aiModeContent}>
                <Text style={styles.aiModeName}>
                  ⚙️ Custom {activeProvider ? `(${activeProvider.toUpperCase()})` : ''}
                </Text>
                <Text style={styles.aiModeDesc}>Your configured API key</Text>
              </View>
              {selectedAIMode === 'custom' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Settings Link */}
        <TouchableOpacity
          style={styles.settingsLink}
          onPress={handleOpenSettings}
        >
          <Text style={styles.settingsLinkText}>⚙️ Manage AI Keys in Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Exam Configuration */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Exam Configuration</Text>

        {/* Book Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Book Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Mathematics Textbook Grade 5"
            value={bookName}
            onChangeText={setBookName}
          />
        </View>

        {/* Grade Level */}
        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Grade Level</Text>
            <View style={styles.pickerContainer}>
              <TextInput
                style={styles.input}
                value={gradeLevel}
                onChangeText={setGradeLevel}
                keyboardType="number-pad"
                maxLength={1}
                placeholder="1-6"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Semester</Text>
            <View style={styles.segmentedControl}>
              {['I', 'II'].map((sem) => (
                <TouchableOpacity
                  key={sem}
                  style={[
                    styles.segmentButton,
                    semester === sem && styles.segmentButtonActive,
                  ]}
                  onPress={() => setSemester(sem)}
                >
                  <Text
                    style={[
                      styles.segmentButtonText,
                      semester === sem && styles.segmentButtonTextActive,
                    ]}
                  >
                    {sem}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Question Count */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Questions</Text>
          <TextInput
            style={styles.input}
            value={questionCount}
            onChangeText={setQuestionCount}
            keyboardType="number-pad"
            placeholder="10"
          />
        </View>

        {/* Question Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Question Type</Text>
          <View style={styles.buttonGroup}>
            {['multiple-choice', 'essay', 'mixed'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  questionType === type && styles.typeButtonActive,
                ]}
                onPress={() => setQuestionType(type)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    questionType === type && styles.typeButtonTextActive,
                  ]}
                >
                  {type === 'multiple-choice' ? 'Multiple Choice' : type === 'essay' ? 'Essay' : 'Mixed'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Exam Mode */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mode</Text>
          <View style={styles.buttonGroup}>
            {['training', 'tryout'].map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.modeButton,
                  mode === m && styles.modeButtonActive,
                ]}
                onPress={() => setMode(m)}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === m && styles.modeButtonTextActive,
                  ]}
                >
                  {m === 'training' ? 'Training' : 'Try Out'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Start Exam Button */}
      <TouchableOpacity
        style={[
          styles.startButton,
          (!canStartExam || isGenerating) && styles.startButtonDisabled,
        ]}
        onPress={handleStartExam}
        disabled={!canStartExam || isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.startButtonText}>
            {canStartExam ? '▶️ Start Exam' : '❌ No AI Provider'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Tip: Zero-Friction Start</Text>
        <Text style={styles.infoText}>
          You can start exams immediately using the system Gemini fallback—no API key setup required. Add custom AI providers in Settings anytime for more options.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  aiModeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  aiModeOptionActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  aiModeContent: {
    flex: 1,
  },
  aiModeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  aiModeDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  checkmark: {
    fontSize: 18,
    color: '#10b981',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  settingsLink: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  settingsLinkText: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    flex: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    padding: 2,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#2563eb',
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  segmentButtonTextActive: {
    color: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  typeButtonActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#2563eb',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modeButtonActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#d97706',
  },
  startButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  startButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b45309',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
});
