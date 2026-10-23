import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import firestoreService from '../services/firestoreService';
import type { ExamResult } from '../types';

export const HistoryScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isSmallMobile = width < 480;

  const { currentUser } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [currentUser]);

  const loadHistory = async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await firestoreService.getExamResults(currentUser.uid);

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

  // Metrics computation for dashboard
  const totalExams = results.length;
  const avgScore = totalExams > 0 ? Math.round(results.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalExams) : 0;
  const maxScore = totalExams > 0 ? Math.max(...results.map((r) => r.score || 0)) : 0;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Header Section */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextCol}>
          <Text style={styles.badgeLabel}>REKAM JEJAK BELAJAR</Text>
          <Text style={[styles.title, isSmallMobile && styles.titleMobile]}>
            Riwayat & Analisis Try Out
          </Text>
          <Text style={styles.subtitle}>
            Pantau progres latihan, skor kelulusan, dan evaluasi hasil pengerjaan soal Anda.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={loadHistory}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshBtnText}>🔄 Perbarui</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Metrics Dashboard */}
      {totalExams > 0 ? (
        <View style={[styles.statsGrid, isSmallMobile && styles.statsGridSmall, isDesktop && styles.desktopStatsGrid]}>
          <View style={[styles.kpiCard, isSmallMobile && styles.kpiCardSmall]}>
            <Text style={[styles.kpiLabel, isSmallMobile && styles.kpiLabelSmall]} numberOfLines={1}>
              Total Ujian
            </Text>
            <Text style={[styles.kpiValue, isSmallMobile && styles.kpiValueSmall]}>{totalExams}</Text>
            <Text style={[styles.kpiSub, isSmallMobile && styles.kpiSubSmall]}>Sesi pengerjaan</Text>
          </View>

          <View style={[styles.kpiCard, isSmallMobile && styles.kpiCardSmall]}>
            <Text style={[styles.kpiLabel, isSmallMobile && styles.kpiLabelSmall]} numberOfLines={1}>
              Rata-Rata Nilai
            </Text>
            <Text style={[styles.kpiValue, isSmallMobile && styles.kpiValueSmall, { color: '#2563eb' }]}>{avgScore}</Text>
            <Text style={[styles.kpiSub, isSmallMobile && styles.kpiSubSmall]}>Skala 100</Text>
          </View>

          <View style={[styles.kpiCard, isSmallMobile && styles.kpiCardSmall]}>
            <Text style={[styles.kpiLabel, isSmallMobile && styles.kpiLabelSmall]} numberOfLines={1}>
              Skor Tertinggi
            </Text>
            <Text style={[styles.kpiValue, isSmallMobile && styles.kpiValueSmall, { color: '#16a34a' }]}>{maxScore}</Text>
            <Text style={[styles.kpiSub, isSmallMobile && styles.kpiSubSmall]}>Pencapaian terbaik</Text>
          </View>
        </View>
      ) : null}
    </View>
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyContainer, isSmallMobile && styles.emptyContainerSmall]}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>Belum Ada Riwayat Ujian</Text>
      <Text style={styles.emptyText}>
        Anda belum mengerjakan latihan try out. Mulai latihan pertama Anda untuk melihat progres dan ulasan soal di sini.
      </Text>
      <TouchableOpacity
        style={styles.startBtn}
        onPress={() => navigation.navigate('Try Out')}
        activeOpacity={0.8}
      >
        <Text style={styles.startBtnText}>✨ Mulai Latihan Sekarang</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: ExamResult }) => {
    const date = item.completedAt
      ? new Date((item.completedAt as any).seconds * 1000).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Tanggal tidak diketahui';

    const isHigh = (item.score || 0) >= 80;
    const isMedium = (item.score || 0) >= 60 && (item.score || 0) < 80;

    return (
      <TouchableOpacity
        style={[styles.card, isDesktop && styles.desktopCard, isSmallMobile && styles.cardSmall]}
        onPress={() => navigation.navigate('Result', { result: item, examResultId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <View style={styles.badge}>
              <Text style={styles.modeText}>{item.mode.toUpperCase()}</Text>
            </View>
            {item.curriculum ? (
              <View style={[styles.badge, { backgroundColor: '#eff6ff' }]}>
                <Text style={[styles.modeText, { color: '#2563eb' }]}>{item.curriculum.toUpperCase()}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.dateText}>{date}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <View>
            <Text style={styles.scoreLabel}>Hasil Ujian:</Text>
            <Text
              style={[
                styles.scoreText,
                isSmallMobile && styles.scoreTextSmall,
                isHigh && styles.scoreHigh,
                isMedium && styles.scoreMedium,
                !isHigh && !isMedium && styles.scoreLow,
              ]}
            >
              {item.score} <Text style={styles.scoreMax}>/ 100</Text>
            </Text>
          </View>

          <View style={styles.statsBox}>
            <Text style={[styles.statsText, isSmallMobile && styles.statsTextSmall]}>
              🎯 <Text style={{ fontWeight: '800' }}>{item.correctAnswers}</Text> / {item.totalQuestions} Benar
            </Text>
            <Text style={styles.detailLink}>Lihat Pembahasan →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && results.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Memuat riwayat ujian...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.contentWrapper, isDesktop && styles.desktopContentWrapper, isSmallMobile && styles.mobileContentWrapper]}>
        <FlatList
          key={isDesktop ? 'desktop-grid' : 'mobile-list'}
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={isDesktop ? 2 : 1}
          columnWrapperStyle={isDesktop && results.length > 0 ? styles.columnWrapper : undefined}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshing={loading}
          onRefresh={loadHistory}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    flex: 1,
  },
  mobileContentWrapper: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  desktopContentWrapper: {
    maxWidth: 1100,
    paddingHorizontal: 28,
    paddingTop: 26,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },

  headerContainer: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  headerTextCol: {
    flex: 1,
    minWidth: 0, // CRITICAL: allows flex child to shrink properly on web and wrap text!
  },
  badgeLabel: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  titleMobile: {
    fontSize: 20,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 19,
    flexShrink: 1,
  },

  refreshBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // CRITICAL: prevents Perbarui from being squished or cut off
    alignSelf: 'flex-start',
  },
  refreshBtnText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },

  // KPI Metrics
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statsGridSmall: {
    gap: 8,
  },
  desktopStatsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
    minWidth: 0,
  },
  kpiCardSmall: {
    borderRadius: 10,
    padding: 10,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  kpiLabelSmall: {
    fontSize: 11,
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
  },
  kpiValueSmall: {
    fontSize: 20,
  },
  kpiSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  kpiSubSmall: {
    fontSize: 10,
  },

  // Cards
  list: {
    paddingBottom: 110,
    flexGrow: 1,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    marginBottom: 12,
  },
  cardSmall: {
    padding: 14,
    borderRadius: 12,
  },
  desktopCard: {
    flex: 1,
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeText: {
    fontWeight: '800',
    color: '#2563eb',
    fontSize: 11,
  },
  dateText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
  },

  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0f172a',
  },
  scoreTextSmall: {
    fontSize: 24,
  },
  scoreMax: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
  },
  scoreHigh: { color: '#16a34a' },
  scoreMedium: { color: '#2563eb' },
  scoreLow: { color: '#dc2626' },

  statsBox: {
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  statsTextSmall: {
    fontSize: 13,
  },
  detailLink: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyContainerSmall: {
    padding: 24,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 440,
    marginBottom: 24,
  },
  startBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
