import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import firestoreService from '../services/firestoreService';
import type { Question, UserAnswer, ExamResult } from '../types';

export const QuestionScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { currentUser } = useAuth();
  const { examSetupId, setup, questions } = route.params;

  const isTrainingMode = setup?.mode === 'training';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [startTime] = useState(new Date());
  const [savingResult, setSavingResult] = useState(false);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const currentQ = questions[currentIndex] as Question;

  // Mendapatkan ID jawaban yang benar
  const correctOptionId =
    currentQ?.options?.find((o: any) => o.isCorrect)?.id?.toLowerCase() ||
    String(currentQ?.correctAnswer || '').toLowerCase();

  const currentAnswer = answers.find((a) => a.questionId === currentQ?.id);
  const isAnswered = !!currentAnswer?.selectedOption;
  const isUserCorrect =
    isAnswered &&
    currentAnswer.selectedOption?.toLowerCase() === correctOptionId;

  const handleSelectOption = (optionId: string) => {
    setValidationWarning(null);

    // Di mode training, jika sudah memilih opsi, biarkan tetap bisa ganti atau kunci
    const existing = [...answers];
    const answerIndex = existing.findIndex((a) => a.questionId === currentQ.id);

    const isCorrect = optionId.toLowerCase() === correctOptionId;

    const newAnswer: UserAnswer = {
      questionId: currentQ.id,
      selectedOption: optionId,
      isCorrect,
      answeredAt: new Date(),
    };

    if (answerIndex >= 0) {
      existing[answerIndex] = newAnswer;
    } else {
      existing.push(newAnswer);
    }
    setAnswers(existing);
  };

  const handleNext = async () => {
    const hasAnswered = answers.find((a) => a.questionId === currentQ.id);
    if (!hasAnswered) {
      setValidationWarning('Silakan pilih salah satu jawaban (A, B, C, atau D) sebelum melanjutkan.');
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setValidationWarning(null);
    } else {
      await finishExam();
    }
  };

  const finishExam = async () => {
    try {
      setSavingResult(true);
      const endTime = new Date();
      let correctCount = 0;

      const gradedAnswers = answers.map((ans) => {
        const q = questions.find((item: Question) => item.id === ans.questionId);
        const qCorrect =
          q?.options?.find((o: any) => o.id?.toLowerCase() === ans.selectedOption?.toLowerCase())?.isCorrect ||
          String(q?.correctAnswer).toLowerCase() === String(ans.selectedOption).toLowerCase();

        if (qCorrect) correctCount++;

        return {
          questionId: ans.questionId,
          selectedOption: ans.selectedOption || '',
          isCorrect: !!qCorrect,
          answeredAt: ans.answeredAt || new Date(),
        };
      });

      const totalQuestions = questions.length;
      const score = Math.round((correctCount / totalQuestions) * 100);
      const timeSpentSeconds = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 1000));

      // Sanitize questions array to guarantee no undefined values
      const sanitizedQuestions = questions.map((q: Question) => ({
        id: q.id,
        text: q.text || '',
        type: q.type || 'multiple-choice',
        visualIllustration: q.visualIllustration || null,
        imageUrl: q.imageUrl || null,
        imageCaption: q.imageCaption || null,
        options: (q.options || []).map((opt) => ({
          id: opt.id,
          text: opt.text || '',
          isCorrect: !!opt.isCorrect,
        })),
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || '',
      }));

      const result: ExamResult = {
        id: 'res_' + Date.now(),
        userId: currentUser?.uid || 'guest',
        startedAt: startTime,
        examSetupId: examSetupId || 'local_setup',
        totalQuestions,
        correctAnswers: correctCount,
        score,
        timeSpentSeconds,
        mode: setup?.mode || 'training',
        completedAt: endTime,
        userAnswers: gradedAnswers,
        questions: sanitizedQuestions,
      };

      if (currentUser?.uid) {
        try {
          const docId = await firestoreService.saveExamResult(currentUser.uid, result);
          if (docId) result.id = docId;
        } catch (saveErr: any) {
          console.warn('Gagal sinkronisasi ke cloud Firestore:', saveErr);
        }
      }

      navigation.replace('Result', { examResultId: result.id, result: result });
    } catch (e: any) {
      setValidationWarning('Gagal memproses hasil: ' + (e?.message || 'Error'));
    } finally {
      setSavingResult(false);
    }
  };

  if (!currentQ) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: '#64748b' }}>Menyiapkan lembar soal...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.contentWrapper, isDesktop && styles.desktopWrapper]}>
        {/* Mode Indicator Banner */}
        <View style={[styles.modeBanner, isTrainingMode ? styles.modeBannerTraining : styles.modeBannerTryout]}>
          <Text style={styles.modeBannerIcon}>{isTrainingMode ? '💡' : '⏱️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.modeBannerTitle, isTrainingMode ? styles.modeBannerTitleTraining : styles.modeBannerTitleTryout]}>
              {isTrainingMode ? 'Mode Latihan (Instant Feedback & Pembahasan)' : 'Mode Try Out (Simulasi Ujian Resmi)'}
            </Text>
            <Text style={styles.modeBannerSub}>
              {isTrainingMode
                ? 'Pilih jawaban untuk langsung melihat kunci & pembahasan ilmiah.'
                : 'Kerjakan seluruh soal dengan fokus. Skor & evaluasi tampil di akhir.'}
            </Text>
          </View>
        </View>

        {/* Top Progress & Stepper */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepperHeader}>
            <Text style={styles.progressText}>
              Pertanyaan <Text style={{ color: '#2563eb', fontWeight: '800' }}>{currentIndex + 1}</Text> dari {questions.length}
            </Text>
            <Text style={styles.answeredBadge}>
              {answers.length}/{questions.length} Terjawab
            </Text>
          </View>

          {/* Stepper Pills */}
          <View style={styles.pillsRow}>
            {questions.map((q: Question, idx: number) => {
              const userAns = answers.find((a) => a.questionId === q.id);
              const isAns = !!userAns;
              const isCur = idx === currentIndex;

              // Di mode latihan, warnai pil sesuai benar/salah
              let pillCorrectStyle: any = null;
              if (isTrainingMode && isAns) {
                pillCorrectStyle = userAns.isCorrect ? styles.stepPillCorrect : styles.stepPillWrong;
              }

              return (
                <TouchableOpacity
                  key={q.id}
                  style={[
                    styles.stepPill,
                    isCur && styles.stepPillCurrent,
                    isAns && !isCur && !pillCorrectStyle && styles.stepPillAnswered,
                    pillCorrectStyle && !isCur && pillCorrectStyle,
                  ]}
                  onPress={() => {
                    setCurrentIndex(idx);
                    setValidationWarning(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.stepPillText,
                      isCur && styles.stepPillTextCurrent,
                      isAns && !isCur && styles.stepPillTextAnswered,
                      pillCorrectStyle && !isCur && { color: userAns?.isCorrect ? '#15803d' : '#b91c1c' },
                    ]}
                  >
                    {idx + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Question Card */}
        <View style={styles.card}>
          <View style={styles.questionMeta}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaTopic}>{setup?.bookName || 'Materi Ujian'}</Text>
              {setup?.curriculum ? (
                <View style={styles.metaCurriculumBadge}>
                  <Text style={styles.metaCurriculumBadgeText}>
                    {setup.curriculum.toUpperCase()} {setup.language ? `• ${setup.language.toUpperCase()}` : ''}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.metaGrade}>
              {setup?.gradeLevel === 'pra-tk'
                ? '🧸 Pra-TK (PAUD)'
                : setup?.gradeLevel === 'tk'
                ? '🎨 Taman Kanak-Kanak'
                : setup?.gradeLevel === 'pra-sd'
                ? '🎒 Pra-SD (Calistung)'
                : [7, 8, 9].includes(Number(setup?.gradeLevel))
                ? `Kelas ${setup?.gradeLevel} SMP`
                : [10, 11, 12].includes(Number(setup?.gradeLevel))
                ? `Kelas ${setup?.gradeLevel} SMA`
                : `Kelas ${setup?.gradeLevel || 'SD'} SD`}
            </Text>
          </View>

          {/* Visual Illustration / Gambar Soal */}
          {currentQ.visualIllustration ? (
            <View style={styles.visualCard}>
              <Text style={styles.visualIllustrationText}>{currentQ.visualIllustration}</Text>
              {currentQ.imageCaption ? (
                <Text style={styles.visualCaptionText}>🔍 {currentQ.imageCaption}</Text>
              ) : null}
            </View>
          ) : null}

          {currentQ.imageUrl ? (
            <View style={styles.imageCard}>
              <Image source={{ uri: currentQ.imageUrl }} style={styles.questionImage} resizeMode="contain" />
              {currentQ.imageCaption ? (
                <Text style={styles.visualCaptionText}>🔍 {currentQ.imageCaption}</Text>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.qText}>{currentQ.text}</Text>

          {/* Bilingual Translation Text */}
          {currentQ.bilingualText ? (
            <View style={styles.bilingualBox}>
              <Text style={styles.bilingualLabel}>🌐 Terjemahan / Translation:</Text>
              <Text style={styles.bilingualText}>{currentQ.bilingualText}</Text>
            </View>
          ) : null}

          {/* LaTeX Formulas for Secondary Math / Science */}
          {currentQ.latexFormulas && currentQ.latexFormulas.length > 0 ? (
            <View style={styles.formulaBox}>
              <Text style={styles.formulaLabel}>📐 Rumus & Notasi Matematika/Sains:</Text>
              {currentQ.latexFormulas.map((formula, fIdx) => (
                <Text key={fIdx} style={styles.formulaCode}>{formula}</Text>
              ))}
            </View>
          ) : null}

          {/* Parent & Teacher Observation Guide for Early Childhood */}
          {currentQ.parentTeacherGuide ? (
            <View style={styles.guideBox}>
              <Text style={styles.guideTitle}>👨‍🏫 Panduan Observasi & Pendampingan Orang Tua/Guru:</Text>
              <Text style={styles.guideText}>{currentQ.parentTeacherGuide}</Text>
            </View>
          ) : null}
        </View>

        {/* Validation Warning Toast */}
        {validationWarning ? (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>⚠️ {validationWarning}</Text>
          </View>
        ) : null}

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {currentQ.options?.map((opt: any) => {
            const optId = opt.id?.toLowerCase();
            const isSelected = currentAnswer?.selectedOption?.toLowerCase() === optId;
            const isThisCorrect = optId === correctOptionId;

            // Di mode training setelah user memilih jawaban:
            let optionCustomStyle: any = null;
            let letterCustomStyle: any = null;
            let letterTextCustom: any = null;

            if (isTrainingMode && isAnswered) {
              if (isThisCorrect) {
                // Jawaban yang benar selalu hijau
                optionCustomStyle = styles.optionCorrect;
                letterCustomStyle = styles.letterCorrect;
                letterTextCustom = styles.letterTextCorrect;
              } else if (isSelected && !isThisCorrect) {
                // Jawaban salah yang dipilih user jadi merah
                optionCustomStyle = styles.optionWrong;
                letterCustomStyle = styles.letterWrong;
                letterTextCustom = styles.letterTextWrong;
              }
            } else if (isSelected) {
              optionCustomStyle = styles.optionSelected;
              letterCustomStyle = styles.letterBadgeSelected;
              letterTextCustom = styles.letterTextSelected;
            }

            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionBtn, optionCustomStyle]}
                onPress={() => handleSelectOption(opt.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.letterBadge, letterCustomStyle]}>
                  <Text style={[styles.letterText, letterTextCustom]}>
                    {opt.id.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {opt.text}
                  </Text>
                  {opt.bilingualText ? (
                    <Text style={styles.optBilingualText}>{opt.bilingualText}</Text>
                  ) : null}
                </View>
                {isTrainingMode && isAnswered && isThisCorrect ? (
                  <View style={styles.correctPillBadge}>
                    <Text style={styles.correctPillText}>✓ Kunci Jawaban</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Instant Feedback & Pembahasan Box (Khusus Mode Latihan) */}
        {isTrainingMode && isAnswered ? (
          <View style={[styles.feedbackBox, isUserCorrect ? styles.feedbackBoxCorrect : styles.feedbackBoxWrong]}>
            <View style={styles.feedbackHeader}>
              <Text style={styles.feedbackIcon}>{isUserCorrect ? '🎉' : '💡'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.feedbackTitle, isUserCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleWrong]}>
                  {isUserCorrect ? 'Jawaban Kamu Tepat!' : 'Jawaban Kurang Tepat'}
                </Text>
                <Text style={styles.feedbackSubtitle}>
                  {isUserCorrect
                    ? 'Pemahaman Anda pada butir soal ini sudah sangat baik.'
                    : `Kunci jawaban yang benar adalah opsi ${correctOptionId.toUpperCase()}. Simak penjelasannya di bawah ini:`}
                </Text>
              </View>
            </View>

            {currentQ.explanation ? (
              <View style={styles.explanationContainer}>
                <Text style={styles.explanationLabel}>📖 Pembahasan Ilmiah:</Text>
                <Text style={styles.explanationText}>{currentQ.explanation}</Text>
                {currentQ.bilingualExplanation ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.bilingualExplanationLabel}>🌐 Explanation (Bilingual):</Text>
                    <Text style={styles.explanationText}>{currentQ.bilingualExplanation}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Navigation Buttons */}
        <View style={styles.bottomNav}>
          {currentIndex > 0 ? (
            <TouchableOpacity
              style={styles.prevBtn}
              onPress={() => {
                setCurrentIndex(currentIndex - 1);
                setValidationWarning(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.prevBtnText}>← Sebelumnya</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <TouchableOpacity
            style={[styles.nextBtn, isTrainingMode && isAnswered && styles.nextBtnTraining, savingResult && { opacity: 0.7 }]}
            onPress={handleNext}
            disabled={savingResult}
            activeOpacity={0.8}
          >
            {savingResult ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.nextBtnText}>
                {currentIndex === questions.length - 1
                  ? isTrainingMode
                    ? 'Selesai & Analisis Kekurangan 📊'
                    : 'Kumpulkan Lembar Try Out 🎯'
                  : isTrainingMode
                  ? 'Lanjut ke Soal Berikutnya ➔'
                  : 'Pertanyaan Selanjutnya →'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingVertical: 24, paddingHorizontal: 16 },
  contentWrapper: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  desktopWrapper: { maxWidth: 760, paddingVertical: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },

  modeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  modeBannerTraining: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  modeBannerTryout: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  modeBannerIcon: { fontSize: 22 },
  modeBannerTitle: { fontSize: 13, fontWeight: '800' },
  modeBannerTitleTraining: { color: '#166534' },
  modeBannerTitleTryout: { color: '#1e40af' },
  modeBannerSub: { fontSize: 12, color: '#475569', marginTop: 2 },

  stepperContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  stepperHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  answeredBadge: { fontSize: 12, fontWeight: '700', color: '#16a34a', backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stepPill: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepPillCurrent: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  stepPillAnswered: { backgroundColor: '#dbeafe', borderColor: '#93c5fd' },
  stepPillCorrect: { backgroundColor: '#dcfce7', borderColor: '#86efac' },
  stepPillWrong: { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
  stepPillText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  stepPillTextCurrent: { color: '#ffffff' },
  stepPillTextAnswered: { color: '#1e40af' },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    marginBottom: 16,
  },
  visualCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  visualIllustrationText: {
    fontSize: 34,
    textAlign: 'center',
    letterSpacing: 4,
    marginVertical: 4,
  },
  visualCaptionText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  imageCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    alignItems: 'center',
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metaTopic: { fontSize: 12, fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaGrade: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  qText: { fontSize: 17, lineHeight: 26, fontWeight: '700', color: '#0f172a' },

  warningBanner: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  warningText: { color: '#92400e', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  optionsContainer: { gap: 10, marginBottom: 18 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  optionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionCorrect: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  optionWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },

  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterBadgeSelected: { backgroundColor: '#2563eb' },
  letterCorrect: { backgroundColor: '#22c55e' },
  letterWrong: { backgroundColor: '#ef4444' },

  letterText: { fontSize: 14, fontWeight: '800', color: '#475569' },
  letterTextSelected: { color: '#ffffff' },
  letterTextCorrect: { color: '#ffffff' },
  letterTextWrong: { color: '#ffffff' },

  optionText: { fontSize: 15, color: '#334155', flex: 1, lineHeight: 22, fontWeight: '500' },
  optionTextSelected: { color: '#0f172a', fontWeight: '700' },

  correctPillBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  correctPillText: { fontSize: 11, fontWeight: '800', color: '#15803d' },

  // Instant Feedback Box
  feedbackBox: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  feedbackBoxCorrect: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  feedbackBoxWrong: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  feedbackHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  feedbackIcon: { fontSize: 24 },
  feedbackTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  feedbackTitleCorrect: { color: '#166534' },
  feedbackTitleWrong: { color: '#991b1b' },
  feedbackSubtitle: { fontSize: 13, color: '#475569', lineHeight: 18 },

  explanationContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  explanationLabel: { fontSize: 12, fontWeight: '800', color: '#334155', textTransform: 'uppercase', marginBottom: 6 },
  explanationText: { fontSize: 14, color: '#334155', lineHeight: 22 },

  metaCurriculumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  metaCurriculumBadgeText: { fontSize: 10, fontWeight: '800', color: '#1d4ed8', letterSpacing: 0.5 },

  bilingualBox: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  bilingualLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  bilingualText: { fontSize: 14, fontStyle: 'italic', color: '#475569', lineHeight: 20 },

  formulaBox: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  formulaLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 },
  formulaCode: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#38bdf8',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginVertical: 2,
  },

  guideBox: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  guideTitle: { fontSize: 12, fontWeight: '800', color: '#854d0e', marginBottom: 4 },
  guideText: { fontSize: 13, color: '#713f12', lineHeight: 19 },

  optBilingualText: { fontSize: 12, fontStyle: 'italic', color: '#64748b', marginTop: 2 },
  bilingualExplanationLabel: { fontSize: 11, fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: 4 },

  bottomNav: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  prevBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  prevBtnText: { color: '#475569', fontSize: 14, fontWeight: '700' },
  nextBtn: {
    flex: 1.6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    elevation: 2,
  },
  nextBtnTraining: {
    backgroundColor: '#16a34a',
  },
  nextBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});
