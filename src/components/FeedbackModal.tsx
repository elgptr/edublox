import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import firestoreService from '../services/firestoreService';
import type { FeedbackCategory, UserFeedback } from '../types';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

type ModalView = 'compose' | 'success' | 'history';

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const { currentUser } = useAuth();

  const [view, setView] = useState<ModalView>('compose');
  const [category, setCategory] = useState<FeedbackCategory>('keluhan_soal');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Success indicator & history state
  const [lastSentInfo, setLastSentInfo] = useState<{
    subject: string;
    category: string;
    date: Date;
  } | null>(null);

  const [userFeedbacks, setUserFeedbacks] = useState<UserFeedback[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load history when modal opens
  const loadUserHistory = async () => {
    if (!currentUser?.uid) return;
    setLoadingHistory(true);
    try {
      const list = await firestoreService.getUserFeedbacks(currentUser.uid);
      list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setUserFeedbacks(list);
    } catch (e) {
      console.warn('Gagal memuat history feedback user:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadUserHistory();
      if (view === 'success') {
        setView('compose');
      }
    }
  }, [visible]);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'keluhan_soal':
        return '🎯 Soal / Kunci';
      case 'kendala_teknis':
        return '⚙️ Teknis';
      case 'saran_fitur':
        return '💡 Saran Fitur';
      case 'pertanyaan':
        return '❓ Tanya';
      default:
        return '📬 Umum';
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Perhatian', 'Silakan isi judul pesan/keluhan Anda.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Perhatian', 'Silakan tulis isi pesan atau keluhan Anda.');
      return;
    }

    try {
      setSubmitting(true);
      await firestoreService.sendFeedback({
        userId: currentUser?.uid || 'guest',
        userEmail: currentUser?.email || 'guest@edunesis.com',
        userName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Siswa',
        category,
        subject: subject.trim(),
        message: message.trim(),
      });

      // Tampilkan indikator & tanda bukti terkirim secara visual
      const sentTime = new Date();
      setLastSentInfo({
        subject: subject.trim(),
        category: getCategoryLabel(category),
        date: sentTime,
      });

      setSubject('');
      setMessage('');
      setView('success');
      loadUserHistory();
    } catch (e: any) {
      Alert.alert('Gagal Mengirim', e.message || 'Terjadi kesalahan saat mengirim pesan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setView('compose');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Modal */}
          <View style={styles.header}>
            <Text style={styles.icon}>📬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Pusat Bantuan & Kotak Surat</Text>
              <Text style={styles.subtitle}>Kirim pesan langsung ke Tim Administrator Edunesis</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeIconBtn} activeOpacity={0.7}>
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Navigasi Modal */}
          <View style={styles.modalTabBar}>
            <TouchableOpacity
              style={[styles.modalTabItem, view === 'compose' && styles.modalTabItemActive]}
              onPress={() => setView('compose')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalTabText, view === 'compose' && styles.modalTabTextActive]}>
                ✍️ Tulis Surat Baru
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalTabItem, view === 'history' && styles.modalTabItemActive]}
              onPress={() => {
                setView('history');
                loadUserHistory();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalTabText, view === 'history' && styles.modalTabTextActive]}>
                📬 Surat Terkirim ({userFeedbacks.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* VIEW 1: SUCCESS CONFIRMATION (TANDA PESAN SUDAH TERKIRIM) */}
          {view === 'success' && (
            <View style={styles.successScreen}>
              <View style={styles.successCheckCircle}>
                <Text style={styles.successCheckIcon}>✅</Text>
              </View>
              <Text style={styles.successHeading}>Surat Berhasil Terkirim!</Text>
              <Text style={styles.successSub}>
                Pesan Anda telah berhasil diterima di sistem Mailbox Administrator Edunesis.
              </Text>

              {/* Bukti Tanda Terima Surat */}
              <View style={styles.receiptBox}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Status Surat:</Text>
                  <View style={styles.statusPillNew}>
                    <Text style={styles.statusPillText}>🟡 Terkirim (Menunggu Review)</Text>
                  </View>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Judul Pesan:</Text>
                  <Text style={styles.receiptValue} numberOfLines={1}>
                    "{lastSentInfo?.subject}"
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Kategori:</Text>
                  <Text style={styles.receiptValue}>{lastSentInfo?.category}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Waktu Kirim:</Text>
                  <Text style={styles.receiptValue}>
                    {lastSentInfo?.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB
                  </Text>
                </View>
              </View>

              {/* Kibo Reassurance Note */}
              <View style={styles.kiboNoteBox}>
                <Text style={styles.kiboNoteText}>
                  🤖 <Text style={{ fontWeight: '800' }}>Kibo:</Text> "Terima kasih banyak atas suratmu! Admin kami akan segera mengecek dan menindaklanjuti pesan ini."
                </Text>
              </View>

              {/* Success Action Buttons */}
              <View style={styles.successActions}>
                <TouchableOpacity
                  style={styles.viewHistoryBtn}
                  onPress={() => setView('history')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewHistoryBtnText}>Lihat Surat Terkirim Saya ➔</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.doneBtnText}>Selesai & Tutup ✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* VIEW 2: TULIS SURAT BARU */}
          {view === 'compose' && (
            <ScrollView style={styles.composeScroll} showsVerticalScrollIndicator={false}>
              {/* Kategori Selector */}
              <Text style={styles.label}>Kategori Pesan</Text>
              <View style={styles.categoryRow}>
                {[
                  { id: 'keluhan_soal', label: '🎯 Soal / Kunci' },
                  { id: 'kendala_teknis', label: '⚙️ Teknis' },
                  { id: 'saran_fitur', label: '💡 Saran Fitur' },
                  { id: 'pertanyaan', label: '❓ Tanya' },
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catBtn, category === cat.id && styles.catBtnActive]}
                    onPress={() => setCategory(cat.id as FeedbackCategory)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.catText, category === cat.id && styles.catTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Judul */}
              <Text style={styles.label}>Judul Pesan</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Soal nomor 3 kunci jawabannya terbalik"
                placeholderTextColor="#94a3b8"
                value={subject}
                onChangeText={setSubject}
              />

              {/* Isi Pesan */}
              <Text style={styles.label}>Isi Pesan / Penjelasan Detail</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ceritakan detail kendala, kritik, atau saran Anda..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
              />

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.7}>
                  <Text style={styles.cancelBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Kirim ke Admin ➔</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* VIEW 3: RIWAYAT SURAT TERKIRIM SAYA */}
          {view === 'history' && (
            <View style={styles.historyContainer}>
              {loadingHistory ? (
                <View style={styles.historyLoadingBox}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={styles.historyLoadingText}>Memuat surat terkirim Anda...</Text>
                </View>
              ) : userFeedbacks.length === 0 ? (
                <View style={styles.emptyHistoryBox}>
                  <Text style={styles.emptyHistoryIcon}>📭</Text>
                  <Text style={styles.emptyHistoryTitle}>Belum Ada Surat Terkirim</Text>
                  <Text style={styles.emptyHistorySub}>
                    Surat atau keluhan yang Anda kirimkan ke admin akan tersimpan dan dapat Anda pantau statusnya di sini.
                  </Text>
                  <TouchableOpacity
                    style={styles.writeFirstBtn}
                    onPress={() => setView('compose')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.writeFirstBtnText}>✍️ Tulis Surat Sekarang</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView style={styles.historyListScroll} showsVerticalScrollIndicator={false}>
                  {userFeedbacks.map((item) => (
                    <View key={item.id} style={styles.userMailCard}>
                      <View style={styles.userMailHeader}>
                        <View style={styles.userMailTag}>
                          <Text style={styles.userMailTagText}>{getCategoryLabel(item.category)}</Text>
                        </View>
                        <View
                          style={[
                            styles.userStatusPill,
                            item.status === 'new'
                              ? styles.userStatusNew
                              : item.status === 'in_progress'
                              ? styles.userStatusProgress
                              : styles.userStatusResolved,
                          ]}
                        >
                          <Text style={styles.userStatusPillText}>
                            {item.status === 'new' ? '🟡 Terkirim (Menunggu Review)' : item.status === 'in_progress' ? '🔵 Sedang Diproses Admin' : '🟢 Selesai Ditindaklanjuti'}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.userMailSubject}>{item.subject}</Text>
                      <Text style={styles.userMailMessage}>{item.message}</Text>

                      {item.adminReply && (
                        <View style={styles.adminReplyBox}>
                          <Text style={styles.adminReplyTitle}>🛡️ Balasan dari Administrator:</Text>
                          <Text style={styles.adminReplyContent}>{item.adminReply}</Text>
                        </View>
                      )}

                      <Text style={styles.userMailDate}>
                        🕒 Dikirim: {item.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} pukul {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 24,
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    elevation: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  icon: { fontSize: 32 },
  title: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  closeIconBtn: { padding: 6 },
  closeIconText: { fontSize: 16, color: '#94a3b8', fontWeight: '700' },

  // Modal Tab Bar
  modalTabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    gap: 6,
  },
  modalTabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modalTabItemActive: {
    backgroundColor: '#ffffff',
    elevation: 1,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  modalTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  modalTabTextActive: {
    color: '#2563eb',
    fontWeight: '800',
  },

  composeScroll: {
    maxHeight: 440,
  },
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginTop: 8, marginBottom: 6 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  catBtn: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
  },
  catBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    borderWidth: 1.5,
  },
  catText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  catTextActive: { color: '#1d4ed8', fontWeight: '800' },

  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  cancelBtnText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
  },
  submitBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  // ================= SUCCESS CONFIRMATION SCREEN =================
  successScreen: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#86efac',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successCheckIcon: {
    fontSize: 32,
  },
  successHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  receiptBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
    marginBottom: 14,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  receiptValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    maxWidth: '65%',
  },
  statusPillNew: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400e',
  },
  kiboNoteBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    width: '100%',
    marginBottom: 18,
  },
  kiboNoteText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 17,
  },
  successActions: {
    width: '100%',
    gap: 10,
  },
  viewHistoryBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewHistoryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  doneBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  doneBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },

  // ================= HISTORY SCREEN =================
  historyContainer: {
    minHeight: 240,
    maxHeight: 440,
  },
  historyLoadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10,
  },
  historyLoadingText: {
    fontSize: 13,
    color: '#64748b',
  },
  emptyHistoryBox: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyHistoryIcon: { fontSize: 44, marginBottom: 8 },
  emptyHistoryTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  emptyHistorySub: { fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 17, marginBottom: 16 },
  writeFirstBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  writeFirstBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  historyListScroll: {
    maxHeight: 400,
  },
  userMailCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  userMailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  userMailTag: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  userMailTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  userStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  userStatusNew: { backgroundColor: '#fef3c7' },
  userStatusProgress: { backgroundColor: '#eff6ff' },
  userStatusResolved: { backgroundColor: '#dcfce7' },
  userStatusPillText: { fontSize: 11, fontWeight: '800' },
  userMailSubject: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  userMailMessage: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  adminReplyBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  adminReplyTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: 2,
  },
  adminReplyContent: {
    fontSize: 12,
    color: '#1e293b',
    lineHeight: 16,
  },
  userMailDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
  },
});
