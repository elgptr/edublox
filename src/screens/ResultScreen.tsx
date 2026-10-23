import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Image } from 'react-native';
import type { ExamResult, Question } from '../types';

export const ResultScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { result } = route.params as { result: ExamResult };
  const isTrainingMode = result.mode === 'training';

  const [showFullReview, setShowFullReview] = useState(!isTrainingMode);

  // Analisis soal yang belum tepat
  const wrongQuestions = result.questions.filter((q: Question) => {
    const ans = result.userAnswers.find((a) => a.questionId === q.id);
    return !ans?.isCorrect;
  });

  const correctQuestions = result.questions.filter((q: Question) => {
    const ans = result.userAnswers.find((a) => a.questionId === q.id);
    return ans?.isCorrect;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 85) return { text: 'Sangat Memuaskan 🏆', color: '#16a34a', bg: '#f0fdf4' };
    if (score >= 70) return { text: 'Baik & Tuntas 👍', color: '#2563eb', bg: '#eff6ff' };
    if (score >= 55) return { text: 'Cukup (Perlu Pemantapan) ⚡', color: '#d97706', bg: '#fffbeb' };
    return { text: 'Perlu Latihan Ulang 📚', color: '#dc2626', bg: '#fef2f2' };
  };

  const badge = getScoreBadge(result.score);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.contentWrapper, isDesktop && styles.desktopWrapper]}>
        {/* Header Hasil */}
        <View style={styles.header}>
          <Text style={styles.modeBadge}>
            {isTrainingMode ? 'HASIL SESI LATIHAN MANDIRI' : 'HASIL TRY OUT RESMI'}
          </Text>
          {result.curriculum ? (
            <View style={styles.metaCurriculumBadge}>
              <Text style={styles.metaCurriculumBadgeText}>
                {result.curriculum.toUpperCase()} {result.language ? `• ${result.language.toUpperCase()}` : ''}
              </Text>
            </View>
          ) : null}
          <Text style={styles.title}>
            {result.score >= 70 ? 'Selamat! Sesi Selesai 🎉' : 'Sesi Ujian Selesai 🎯'}
          </Text>

          <View style={[styles.badgePill, { backgroundColor: badge.bg, borderColor: badge.color }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
          </View>

          {/* Kibo Mascot Feedback Card */}
          <View style={styles.mascotPraiseBox}>
            <Image
              source={require('../../assets/edublox-mascot-kibo.png')}
              style={styles.mascotResultImg}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.mascotPraiseTitle}>
                {result.score >= 85
                  ? 'Luar Biasa, Sahabat Hebat! 🌟'
                  : result.score >= 70
                  ? 'Bagus Sekali, Hasil Tuntas! 👏'
                  : 'Tetap Semangat Terus Belajar! 💪'}
              </Text>
              <Text style={styles.mascotPraiseSub}>
                {result.score >= 70
                  ? 'Kibo sangat bangga dengan usahamu. Pertahankan prestasimu di ujian sesungguhnya!'
                  : 'Jangan berkecil hati ya! Kibo siap mendampingimu mengulang materi sampai paham tuntas.'}
              </Text>
            </View>
          </View>

          <Text style={styles.scoreText}>Skor Akhir</Text>
          <Text style={styles.score}>{result.score}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{result.correctAnswers}</Text>
              <Text style={styles.statLabel}>Benar ✅</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: '#dc2626' }]}>{wrongQuestions.length}</Text>
              <Text style={styles.statLabel}>Salah ❌</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s
              </Text>
              <Text style={styles.statLabel}>Durasi ⏱️</Text>
            </View>
          </View>
        </View>

        {/* Analisis Kekurangan & Diagnostik Belajar */}
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <Text style={styles.analysisIcon}>📊</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.analysisTitle}>Analisis Diagnostik & Kekurangan</Text>
              <Text style={styles.analysisSubtitle}>
                {isTrainingMode
                  ? 'Ringkasan bagian materi yang perlu diperdalam berdasarkan jawaban Anda.'
                  : 'Evaluasi kekuatan dan kelemahan dari hasil tryout ini.'}
              </Text>
            </View>
          </View>

          {wrongQuestions.length === 0 ? (
            <View style={styles.perfectBox}>
              <Text style={styles.perfectIcon}>🌟</Text>
              <Text style={styles.perfectTitle}>Pemahaman Materi Sempurna!</Text>
              <Text style={styles.perfectText}>
                Luar biasa! Seluruh {result.totalQuestions} soal dijawab dengan tepat tanpa ada kesalahan konsep.
                Kemampuan pemahaman materi Anda sudah sangat solid. Silakan lanjut ke tingkat materi berikutnya atau coba simulasi Try Out resmi!
              </Text>
            </View>
          ) : (
            <View style={styles.weaknessList}>
              <Text style={styles.weaknessSummary}>
                Terdeteksi <Text style={{ fontWeight: '800', color: '#dc2626' }}>{wrongQuestions.length} bagian</Text> materi yang belum Anda kuasai dengan baik:
              </Text>

              {wrongQuestions.map((q: Question) => {
                const ans = result.userAnswers.find((a) => a.questionId === q.id);
                const qIdx = result.questions.findIndex((item) => item.id === q.id) + 1;
                const correctOpt =
                  q.options?.find((o: any) => o.isCorrect)?.id?.toUpperCase() ||
                  String(q.correctAnswer || '').toUpperCase();

                return (
                  <View key={q.id} style={styles.weaknessItem}>
                    <View style={styles.weaknessHeader}>
                      <View style={styles.weaknessNumberBadge}>
                        <Text style={styles.weaknessNumberText}>Soal #{qIdx}</Text>
                      </View>
                      <Text style={styles.weaknessAnswerSummary}>
                        Jawabanmu: <Text style={{ color: '#dc2626', fontWeight: '700' }}>{ans?.selectedOption?.toUpperCase() || '-'}</Text> • Kunci: <Text style={{ color: '#16a34a', fontWeight: '700' }}>{correctOpt}</Text>
                      </Text>
                    </View>

                    <Text style={styles.weaknessQuestionText} numberOfLines={2}>
                      "{q.text}"
                    </Text>

                    {q.explanation ? (
                      <View style={styles.weaknessHintBox}>
                        <Text style={styles.weaknessHintTitle}>💡 Catatan Perbaikan:</Text>
                        <Text style={styles.weaknessHintText}>{q.explanation}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}

              <View style={styles.actionableRecommendation}>
                <Text style={styles.recommendationTitle}>🎯 Saran Rencana Belajar AI:</Text>
                <Text style={styles.recommendationText}>
                  Pelajari kembali konsep materi pada soal-soal di atas, lalu buat sesi latihan baru dengan mode{' '}
                  <Text style={{ fontWeight: '700', color: '#2563eb' }}>Training (5 - 10 Soal)</Text> untuk topik yang sama sampai mencapai akurasi 100%.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Toggle Review Seluruh Soal */}
        <TouchableOpacity
          style={styles.toggleReviewBtn}
          onPress={() => setShowFullReview(!showFullReview)}
          activeOpacity={0.8}
        >
          <Text style={styles.toggleReviewText}>
            {showFullReview ? 'Sembunyikan Lembar Soal Lengkap ▴' : 'Lihat Seluruh Soal & Pembahasan ▾'}
          </Text>
        </TouchableOpacity>

        {/* Full Question Review */}
        {showFullReview ? (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewSectionTitle}>Lembar Pembahasan Lengkap</Text>
            {result.questions.map((q: Question, idx: number) => {
              const ans = result.userAnswers.find((a) => a.questionId === q.id);
              const isCorrect = !!ans?.isCorrect;
              const correctOpt =
                q.options?.find((o: any) => o.isCorrect)?.id?.toUpperCase() ||
                String(q.correctAnswer || '').toUpperCase();

              return (
                <View key={q.id} style={[styles.card, isCorrect ? styles.cardCorrect : styles.cardWrong]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardIndex}>Soal #{idx + 1}</Text>
                    <Text style={[styles.cardStatus, isCorrect ? styles.cardStatusCorrect : styles.cardStatusWrong]}>
                      {isCorrect ? '✅ Benar' : '❌ Salah'}
                    </Text>
                  </View>

                  <Text style={styles.qText}>{q.text}</Text>

                  {q.bilingualText ? (
                    <View style={styles.reviewBilingualBox}>
                      <Text style={styles.reviewBilingualLabel}>🌐 Terjemahan / Translation:</Text>
                      <Text style={styles.reviewBilingualText}>{q.bilingualText}</Text>
                    </View>
                  ) : null}

                  {q.latexFormulas && q.latexFormulas.length > 0 ? (
                    <View style={styles.reviewFormulaBox}>
                      <Text style={styles.reviewFormulaLabel}>📐 Rumus & Notasi Matematika/Sains:</Text>
                      {q.latexFormulas.map((f, fIdx) => (
                        <Text key={fIdx} style={styles.reviewFormulaCode}>{f}</Text>
                      ))}
                    </View>
                  ) : null}

                  {q.parentTeacherGuide ? (
                    <View style={styles.reviewGuideBox}>
                      <Text style={styles.reviewGuideTitle}>👨‍🏫 Panduan Observasi:</Text>
                      <Text style={styles.reviewGuideText}>{q.parentTeacherGuide}</Text>
                    </View>
                  ) : null}

                  {q.visualIllustration ? (
                    <View style={styles.reviewVisualCard}>
                      <Text style={styles.reviewVisualText}>{q.visualIllustration}</Text>
                      {q.imageCaption ? (
                        <Text style={styles.reviewVisualCaption}>🔍 {q.imageCaption}</Text>
                      ) : null}
                    </View>
                  ) : null}

                  {q.options?.map((opt: any) => {
                    const isUserPick = ans?.selectedOption?.toLowerCase() === opt.id?.toLowerCase();
                    const isAnswerKey = opt.id?.toLowerCase() === correctOpt.toLowerCase();

                    let optStyle: any = null;
                    if (isAnswerKey) optStyle = styles.reviewOptCorrect;
                    else if (isUserPick && !isAnswerKey) optStyle = styles.reviewOptWrong;

                    return (
                      <View key={opt.id} style={[styles.reviewOpt, optStyle]}>
                        <Text style={styles.reviewOptLetter}>{opt.id.toUpperCase()}.</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.reviewOptText}>{opt.text}</Text>
                          {opt.bilingualText ? (
                            <Text style={styles.reviewOptBilingualText}>{opt.bilingualText}</Text>
                          ) : null}
                        </View>
                        {isAnswerKey ? <Text style={styles.reviewTag}>Kunci</Text> : null}
                        {isUserPick && !isAnswerKey ? <Text style={[styles.reviewTag, { color: '#dc2626' }]}>Pilihanmu</Text> : null}
                      </View>
                    );
                  })}

                  {q.explanation ? (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationTitle}>Pembahasan:</Text>
                      <Text style={styles.explanationText}>{q.explanation}</Text>
                      {q.bilingualExplanation ? (
                        <View style={{ marginTop: 6 }}>
                          <Text style={styles.reviewBilingualLabel}>🌐 Explanation (Bilingual):</Text>
                          <Text style={styles.explanationText}>{q.bilingualExplanation}</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>✨ Mulai Latihan Baru</Text>
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
  desktopWrapper: { maxWidth: 760 },

  header: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  modeBadge: { fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 1.5, marginBottom: 6 },
  metaCurriculumBadge: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  metaCurriculumBadgeText: { fontSize: 11, fontWeight: '800', color: '#1d4ed8', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  badgePill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginBottom: 14 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  mascotPraiseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
    marginVertical: 14,
    width: '100%',
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  mascotResultImg: {
    width: 140,
    height: 95,
    borderRadius: 12,
  },
  mascotPraiseTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  mascotPraiseSub: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  scoreText: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  score: { fontSize: 60, fontWeight: '900', color: '#2563eb', marginVertical: 2 },

  statsRow: { flexDirection: 'row', gap: 12, marginTop: 14, width: '100%' },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: { fontSize: 18, fontWeight: '800', color: '#16a34a' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '600' },

  // Analysis Card
  analysisCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  analysisHeader: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'flex-start' },
  analysisIcon: { fontSize: 24 },
  analysisTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  analysisSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2, lineHeight: 18 },

  perfectBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignItems: 'center',
  },
  perfectIcon: { fontSize: 32, marginBottom: 8 },
  perfectTitle: { fontSize: 16, fontWeight: '800', color: '#166534', marginBottom: 4 },
  perfectText: { fontSize: 13, color: '#15803d', textAlign: 'center', lineHeight: 20 },

  weaknessList: { gap: 12 },
  weaknessSummary: { fontSize: 14, color: '#334155', fontWeight: '600', marginBottom: 4 },
  weaknessItem: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 14,
  },
  weaknessHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  weaknessNumberBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  weaknessNumberText: { fontSize: 11, fontWeight: '800', color: '#dc2626' },
  weaknessAnswerSummary: { fontSize: 12, color: '#475569' },
  weaknessQuestionText: { fontSize: 13, color: '#1f2937', fontWeight: '600', lineHeight: 18, marginBottom: 8 },
  weaknessHintBox: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  weaknessHintTitle: { fontSize: 11, fontWeight: '800', color: '#b91c1c', marginBottom: 2 },
  weaknessHintText: { fontSize: 12, color: '#475569', lineHeight: 18 },

  actionableRecommendation: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
  },
  recommendationTitle: { fontSize: 13, fontWeight: '800', color: '#1e40af', marginBottom: 4 },
  recommendationText: { fontSize: 13, color: '#1e3a8a', lineHeight: 20 },

  // Toggle Review
  toggleReviewBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleReviewText: { fontSize: 13, fontWeight: '700', color: '#475569' },

  // Review Section
  reviewSection: { marginBottom: 16 },
  reviewSectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  card: { backgroundColor: '#ffffff', padding: 18, borderRadius: 14, marginBottom: 14, borderWidth: 1 },
  cardCorrect: { borderColor: '#86efac', backgroundColor: '#ffffff' },
  cardWrong: { borderColor: '#fca5a5', backgroundColor: '#ffffff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardIndex: { fontSize: 12, fontWeight: '800', color: '#64748b' },
  cardStatus: { fontSize: 12, fontWeight: '800' },
  cardStatusCorrect: { color: '#16a34a' },
  cardStatusWrong: { color: '#dc2626' },

  qText: { fontSize: 15, fontWeight: '700', color: '#0f172a', lineHeight: 22, marginBottom: 12 },
  reviewVisualCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reviewVisualText: {
    fontSize: 26,
    textAlign: 'center',
    letterSpacing: 3,
  },
  reviewVisualCaption: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  reviewOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    marginBottom: 6,
    gap: 8,
  },
  reviewOptCorrect: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac' },
  reviewOptWrong: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
  reviewOptLetter: { fontSize: 13, fontWeight: '800', color: '#475569' },
  reviewOptText: { fontSize: 13, color: '#334155', flex: 1 },
  reviewTag: { fontSize: 10, fontWeight: '800', color: '#15803d', backgroundColor: '#ffffff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  explanationBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  explanationTitle: { fontSize: 11, fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: 2 },
  explanationText: { fontSize: 13, color: '#64748b', lineHeight: 20 },

  reviewBilingualBox: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  reviewBilingualLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: 2 },
  reviewBilingualText: { fontSize: 13, fontStyle: 'italic', color: '#475569', lineHeight: 18 },

  reviewFormulaBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  reviewFormulaLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  reviewFormulaCode: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#38bdf8',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginVertical: 2,
  },

  reviewGuideBox: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  reviewGuideTitle: { fontSize: 11, fontWeight: '800', color: '#854d0e', marginBottom: 2 },
  reviewGuideText: { fontSize: 12, color: '#713f12', lineHeight: 17 },

  reviewOptBilingualText: { fontSize: 11, fontStyle: 'italic', color: '#64748b', marginTop: 1 },

  footerActions: { marginTop: 8, marginBottom: 40 },
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  primaryBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
});
