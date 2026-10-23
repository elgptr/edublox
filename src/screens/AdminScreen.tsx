import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import firestoreService from '../services/firestoreService';
import { QuotaService } from '../services/quotaService';
import { AIService, normalizeBaseUrl } from '../services/aiService';
import { keyStorageService } from '../services/keyStorageService';
import type { User, DiscountCoupon, UserFeedback, FeedbackStatus, SystemAIEndpointConfig, ConnectionTestResult } from '../types';

type AdminTab = 'overview' | 'users' | 'coupons' | 'mailbox' | 'ai-endpoint';

export const AdminScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const { currentUser, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Discount modal state
  const [selectedUserForDiscount, setSelectedUserForDiscount] = useState<User | null>(null);
  const [customDiscountPercent, setCustomDiscountPercent] = useState('50');
  const [discountModalVisible, setDiscountModalVisible] = useState(false);

  // New coupon modal state
  const [newCouponModalVisible, setNewCouponModalVisible] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState('50');
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Feedback filter state
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | FeedbackStatus>('all');

  // AI Endpoint states (OpenAI-compatible / Custom endpoint untuk AI Bawaan Sistem)
  const [aiBaseUrl, setAiBaseUrl] = useState('https://api.txsiber.online/v1');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState('claude-3-7-sonnet-latest');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [showAiKey, setShowAiKey] = useState(false);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<ConnectionTestResult | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSavingAi, setIsSavingAi] = useState(false);
  const [aiSaveBanner, setAiSaveBanner] = useState<string | null>(null);
  const [activeModelFilter, setActiveModelFilter] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [userList, couponList, feedbackList, systemAIConfig] = await Promise.all([
        firestoreService.getAllUsers(),
        firestoreService.getCoupons(),
        firestoreService.getFeedbackMessages(),
        firestoreService.getSystemAIConfig().catch(() => null),
      ]);

      // Isi konfigurasi AI Bawaan jika sudah ada di Firestore atau local cache
      try {
        let aiConfig = systemAIConfig;
        if (!aiConfig) {
          aiConfig = await keyStorageService.getSystemAIConfig();
        }
        if (aiConfig) {
          if (aiConfig.baseUrl) setAiBaseUrl(aiConfig.baseUrl);
          if (aiConfig.apiKey) setAiApiKey(aiConfig.apiKey);
          if (aiConfig.model) setAiModel(aiConfig.model);
          if (aiConfig.enabled !== undefined) setAiEnabled(aiConfig.enabled);
        }
      } catch (err) {
        console.warn('Gagal memuat konfigurasi AI Bawaan:', err);
      }

      // Jika data Firestore kosong (misal baru mulai), sediakan user default
      if (userList.length === 0) {
        setUsers([
          {
            id: 'admin_user_id',
            email: 'admin@edublox.id',
            displayName: 'Administrator Edunesis',
            role: 'admin',
            isSubscribed: true,
            subscriptionPlan: 'Paket Admin Master',
            createdAt: new Date(),
            lastLogin: new Date(),
          },
          {
            id: 'user_test_id',
            email: 'user@edublox.id',
            displayName: 'Siswa Percobaan',
            role: 'user',
            isSubscribed: false,
            createdAt: new Date(),
            lastLogin: new Date(),
          },
        ]);
      } else {
        setUsers(userList);
      }

      setCoupons(couponList);
      setFeedbacks(feedbackList);
    } catch (e: any) {
      console.warn('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handler: Beri Free Upgrade 30 Hari
  const handleGrantFreeUpgrade = async (user: User) => {
    Alert.alert(
      'Konfirmasi Free Upgrade',
      `Berikan akses Langganan 3x Kuota (30 Hari) gratis kepada ${user.email}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Berikan Upgrade ⚡',
          onPress: async () => {
            try {
              // 1. Update di Firestore
              await firestoreService.grantFreeUpgrade(user.id);
              // 2. Aktifkan di QuotaService lokal
              await QuotaService.activateSubscription(user.id, 'Paket Admin Free Upgrade (3x Kuota 30 Hari)');

              Alert.alert('Berhasil! 🎉', `Akun ${user.email} telah berhasil di-upgrade ke Paket 3x Kuota selama 30 hari.`);
              loadAdminData();
            } catch (e: any) {
              Alert.alert('Gagal', e.message || 'Terjadi kesalahan saat meng-upgrade akun.');
            }
          },
        },
      ]
    );
  };

  // Handler: Beri Diskon Khusus ke User
  const handleGrantDiscount = async () => {
    if (!selectedUserForDiscount) return;
    const percent = parseInt(customDiscountPercent) || 0;
    if (percent <= 0 || percent > 100) {
      Alert.alert('Perhatian', 'Persentase diskon harus antara 1% sampai 100%.');
      return;
    }

    try {
      await firestoreService.grantSpecialDiscount(selectedUserForDiscount.id, percent);
      Alert.alert('Diskon Diberikan! 🏷️', `Diskon ${percent}% khusus berhasil diterapkan untuk akun ${selectedUserForDiscount.email}.`);
      setDiscountModalVisible(false);
      loadAdminData();
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Terjadi kesalahan.');
    }
  };

  // Handler: Buat Kupon Baru
  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim()) {
      Alert.alert('Perhatian', 'Kode kupon wajib diisi.');
      return;
    }
    const percent = parseInt(newCouponPercent) || 0;
    if (percent <= 0 || percent > 100) {
      Alert.alert('Perhatian', 'Persentase diskon harus antara 1% sampai 100%.');
      return;
    }

    try {
      const exp = new Date();
      exp.setDate(exp.getDate() + 30);

      await firestoreService.createCoupon({
        code: newCouponCode.trim().toUpperCase(),
        discountPercent: percent,
        validUntil: exp,
        description: newCouponDesc.trim() || `Diskon hemat ${percent}% paket langganan`,
        isActive: true,
        createdAt: new Date(),
      });

      Alert.alert('Kupon Dibuat! 🎟️', `Kupon ${newCouponCode.toUpperCase()} (${percent}%) berhasil diaktifkan.`);
      setNewCouponModalVisible(false);
      setNewCouponCode('');
      setNewCouponDesc('');
      loadAdminData();
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Terjadi kesalahan.');
    }
  };

  // Handler: Update Status Feedback Mailbox
  const handleUpdateFeedback = async (feedbackId: string, status: FeedbackStatus, adminReply?: string) => {
    try {
      await firestoreService.updateFeedbackStatus(feedbackId, status, adminReply);
      loadAdminData();
    } catch (e: any) {
      Alert.alert('Gagal', e.message || 'Gagal update status pesan.');
    }
  };

  // Handler: Hapus Surat Feedback Mailbox
  const handleDeleteFeedback = (item: UserFeedback) => {
    if (!item.id) return;

    const performDelete = async () => {
      try {
        await firestoreService.deleteFeedbackMessage(item.id!);
        setFeedbacks((prev) => prev.filter((f) => f.id !== item.id));
        Alert.alert('Berhasil 🗑️', `Surat "${item.subject}" telah berhasil dihapus dari sistem.`);
      } catch (err: any) {
        Alert.alert('Gagal Menghapus', err?.message || 'Terjadi kesalahan saat menghapus surat.');
      }
    };

    if (typeof window !== 'undefined' && typeof (window as any).confirm === 'function') {
      const ok = (window as any).confirm(`Hapus surat "${item.subject}" dari ${item.userName || item.userEmail}?\n\nTindakan ini permanen.`);
      if (ok) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Konfirmasi Hapus Surat 🗑️',
        `Hapus surat "${item.subject}" dari ${item.userName || item.userEmail} secara permanen?`,
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Hapus Surat', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  // Handler: Test Connection (Sesuai fungsi testConnection() pada TXsiber AI Triad 2.8.1)
  const handleTestAiConnection = async () => {
    if (!aiApiKey.trim()) {
      Alert.alert('Perhatian', 'Masukkan API Key terlebih dahulu sebelum menguji koneksi.');
      return;
    }
    setIsTestingAi(true);
    setAiTestResult(null);

    try {
      const res = await AIService.testConnection('openai', aiApiKey.trim(), {
        baseUrl: aiBaseUrl.trim() || 'https://api.txsiber.online/v1',
        model: aiModel.trim() || 'claude-3-7-sonnet-latest',
      });
      setAiTestResult(res);
      if (res.models && res.models.length > 0) {
        setAvailableModels(res.models);
      }
    } catch (err: any) {
      setAiTestResult({
        success: false,
        message: `❌ Terjadi kesalahan pengujian: ${err?.message || err}`,
      });
    } finally {
      setIsTestingAi(false);
    }
  };

  // Handler: Fetch Available Models from /models (Sesuai refreshModelsFromAPI() TXsiber)
  const handleFetchModels = async () => {
    setIsLoadingModels(true);
    try {
      const res = await AIService.fetchAvailableModels(aiBaseUrl, aiApiKey);
      if (res.success && res.models.length > 0) {
        setAvailableModels(res.models);
        setAiTestResult({
          success: true,
          message: `🟢 Berhasil memuat ${res.models.length} model dari server API (${res.latencyMs || 0} ms)!`,
          latencyMs: res.latencyMs,
          models: res.models,
        });
      } else {
        Alert.alert('Info Muat Model', res.message || 'Server tidak mengembalikan daftar model.');
      }
    } catch (e: any) {
      Alert.alert('Gagal', `Gagal memuat model: ${e?.message || e}`);
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Handler: Save System AI Endpoint Configuration
  const handleSaveAiConfig = async () => {
    if (aiEnabled && !aiApiKey.trim()) {
      Alert.alert('Perhatian', 'API Key wajib diisi jika endpoint custom AI Bawaan diaktifkan.');
      return;
    }

    setIsSavingAi(true);
    setAiSaveBanner(null);

    try {
      const normalizedUrl = normalizeBaseUrl(aiBaseUrl.trim() || 'https://api.txsiber.online/v1');
      const config: SystemAIEndpointConfig = {
        enabled: aiEnabled,
        provider: 'openai',
        baseUrl: normalizedUrl,
        apiKey: aiApiKey.trim(),
        model: aiModel.trim() || 'claude-3-7-sonnet-latest',
        updatedAt: new Date(),
        updatedBy: currentUser?.email || 'admin@edublox.id',
      };

      // 1. Simpan ke Firestore
      await firestoreService.saveSystemAIConfig(config, currentUser?.email || 'admin@edublox.id');

      // 2. Simpan cache lokal
      await keyStorageService.saveSystemAIConfig(config);

      setAiSaveBanner('✅ Konfigurasi AI Bawaan berhasil disimpan dan langsung aktif untuk seluruh pengguna!');
      setTimeout(() => setAiSaveBanner(null), 6000);
    } catch (e: any) {
      Alert.alert('Gagal Menyimpan', e?.message || 'Terjadi kesalahan saat menyimpan pengaturan endpoint.');
    } finally {
      setIsSavingAi(false);
    }
  };

  // Handler: Reset ke Gemini Standar
  const handleResetGeminiDefault = () => {
    Alert.alert(
      'Konfirmasi Reset',
      'Kembalikan pengaturan AI Bawaan ke Google Gemini standar (Free)? Seluruh pengguna sistem bawaan akan beralih ke Gemini kembali.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Kembalikan ke Gemini',
          style: 'destructive',
          onPress: async () => {
            try {
              const resetConfig: SystemAIEndpointConfig = {
                enabled: false,
                provider: 'gemini',
                baseUrl: '',
                apiKey: '',
                model: 'gemini-flash-latest',
                updatedAt: new Date(),
                updatedBy: currentUser?.email || 'admin@edublox.id',
              };
              await firestoreService.saveSystemAIConfig(resetConfig, currentUser?.email || 'admin@edublox.id');
              await keyStorageService.removeSystemAIConfig();
              setAiEnabled(false);
              setAiTestResult(null);
              setAiSaveBanner('↺ Pengaturan AI Bawaan telah di-reset ke Google Gemini standar.');
              setTimeout(() => setAiSaveBanner(null), 5000);
            } catch (err: any) {
              Alert.alert('Gagal', err?.message || 'Gagal reset endpoint.');
            }
          },
        },
      ]
    );
  };

  // Handler: Terapkan Preset Endpoint
  const handleApplyPreset = (name: 'txsiber' | 'openai' | 'groq' | 'openrouter') => {
    if (name === 'txsiber') {
      setAiBaseUrl('https://api.txsiber.online/v1');
      setAiModel('claude-3-7-sonnet-latest');
    } else if (name === 'openai') {
      setAiBaseUrl('https://api.openai.com/v1');
      setAiModel('gpt-4o-mini');
    } else if (name === 'groq') {
      setAiBaseUrl('https://api.groq.com/openai/v1');
      setAiModel('llama-3.3-70b-versatile');
    } else if (name === 'openrouter') {
      setAiBaseUrl('https://openrouter.ai/api/v1');
      setAiModel('anthropic/claude-3.5-sonnet');
    }
    setAiTestResult(null);
  };

  // Filter users
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter feedback
  const filteredFeedbacks = feedbacks.filter((f) => {
    if (feedbackFilter === 'all') return true;
    return f.status === feedbackFilter;
  });

  const activeSubscribersCount = users.filter((u) => u.isSubscribed).length;
  const newFeedbackCount = feedbacks.filter((f) => f.status === 'new').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.wrapper, isDesktop && styles.desktopWrapper]}>
        {/* Admin Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerBrandRow}>
              <Image
                source={require('../../assets/edunesis-logo.jpg')}
                style={styles.adminLogoImg}
                resizeMode="contain"
              />
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>🛡️ PANEL ADMINISTRATOR</Text>
              </View>
            </View>
            <Text style={styles.title}>Pusat Monitoring & Layanan</Text>
            <Text style={styles.subtitle}>
              Kelola seluruh pengguna, kuota langganan, pemberian diskon, dan respons keluhan dari user.
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadAdminData} activeOpacity={0.7}>
            <Text style={styles.refreshBtnText}>🔄 Refresh Data</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
            onPress={() => setActiveTab('overview')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              📊 Ringkasan KPI
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'users' && styles.tabItemActive]}
            onPress={() => setActiveTab('users')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
              👥 User & Subscription ({users.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'coupons' && styles.tabItemActive]}
            onPress={() => setActiveTab('coupons')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'coupons' && styles.tabTextActive]}>
              🏷️ Kupon & Diskon ({coupons.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'mailbox' && styles.tabItemActive]}
            onPress={() => setActiveTab('mailbox')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'mailbox' && styles.tabTextActive]}>
              📬 Mailbox ({newFeedbackCount > 0 ? `🔴 ${newFeedbackCount}` : feedbacks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'ai-endpoint' && styles.tabItemActive]}
            onPress={() => setActiveTab('ai-endpoint')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'ai-endpoint' && styles.tabTextActive]}>
              ⚡ AI Endpoint ({aiEnabled ? (aiModel ? aiModel.split('-')[0] : 'Aktif') : 'Gemini'})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.centerText}>Memuat data administrasi...</Text>
          </View>
        ) : (
          <>
            {/* TAB 1: OVERVIEW & MONITORING */}
            {activeTab === 'overview' && (
              <View style={styles.section}>
                <View style={styles.kpiGrid}>
                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiIcon}>👥</Text>
                    <Text style={styles.kpiValue}>{users.length}</Text>
                    <Text style={styles.kpiLabel}>Total Pengguna Terdaftar</Text>
                    <Text style={styles.kpiSub}>Aktif di ekosistem Edunesis</Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiIcon}>⭐</Text>
                    <Text style={[styles.kpiValue, { color: '#16a34a' }]}>{activeSubscribersCount}</Text>
                    <Text style={styles.kpiLabel}>Active Subscribers (3x Kuota)</Text>
                    <Text style={styles.kpiSub}>Pengguna paket langganan aktif</Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiIcon}>🎟️</Text>
                    <Text style={[styles.kpiValue, { color: '#d97706' }]}>{coupons.length}</Text>
                    <Text style={styles.kpiLabel}>Kupon Promo Aktif</Text>
                    <Text style={styles.kpiSub}>Voucher diskon pembayaran</Text>
                  </View>

                  <View style={styles.kpiCard}>
                    <Text style={styles.kpiIcon}>📬</Text>
                    <Text style={[styles.kpiValue, { color: newFeedbackCount > 0 ? '#dc2626' : '#2563eb' }]}>
                      {newFeedbackCount}
                    </Text>
                    <Text style={styles.kpiLabel}>Pesan Baru di Mailbox</Text>
                    <Text style={styles.kpiSub}>Keluhan / feedback butuh respons</Text>
                  </View>
                </View>

                {/* System Engine Health Card */}
                <View style={styles.systemCard}>
                  <Text style={styles.systemCardTitle}>⚙️ Status Layanan & Infrastruktur</Text>
                  <View style={styles.systemGrid}>
                    <View style={styles.systemItem}>
                      <View style={styles.greenDot} />
                      <Text style={styles.systemItemText}>
                        AI Engine: <Text style={{ fontWeight: '700' }}>Google Gemini Flash (Cascading Active)</Text>
                      </Text>
                    </View>
                    <View style={styles.systemItem}>
                      <View style={styles.greenDot} />
                      <Text style={styles.systemItemText}>
                        Database: <Text style={{ fontWeight: '700' }}>Cloud Firestore (Deep Sanitized)</Text>
                      </Text>
                    </View>
                    <View style={styles.systemItem}>
                      <View style={styles.greenDot} />
                      <Text style={styles.systemItemText}>
                        Authentication: <Text style={{ fontWeight: '700' }}>Firebase Auth Active</Text>
                      </Text>
                    </View>
                    <View style={styles.systemItem}>
                      <View style={styles.greenDot} />
                      <Text style={styles.systemItemText}>
                        Payment Gateway: <Text style={{ fontWeight: '700' }}>Midtrans / QRIS Mock Simulation Ready</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* TAB 2: MANAJEMEN USER */}
            {activeTab === 'users' && (
              <View style={styles.section}>
                {/* Search Bar */}
                <View style={styles.searchBar}>
                  <Text style={{ fontSize: 16 }}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Cari user berdasarkan email atau nama..."
                    placeholderTextColor="#94a3b8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Text style={{ color: '#94a3b8' }}>✕</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* User Cards List */}
                <View style={styles.usersList}>
                  {filteredUsers.map((user) => {
                    const isPremium = user.isSubscribed;
                    const isAdminUser = user.role === 'admin';

                    return (
                      <View key={user.id} style={styles.userCard}>
                        <View style={styles.userCardHeader}>
                          <View style={styles.userAvatar}>
                            <Text style={styles.userAvatarText}>
                              {user.displayName?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text style={styles.userName}>{user.displayName}</Text>
                              {isAdminUser ? (
                                <View style={styles.roleBadgeAdmin}>
                                  <Text style={styles.roleBadgeAdminText}>ADMIN</Text>
                                </View>
                              ) : null}
                            </View>
                            <Text style={styles.userEmailText}>{user.email}</Text>
                          </View>

                          {/* Status Badge */}
                          <View style={[styles.subBadge, isPremium ? styles.subBadgePremium : styles.subBadgeFree]}>
                            <Text style={[styles.subBadgeText, isPremium ? styles.subBadgeTextPremium : styles.subBadgeTextFree]}>
                              {isPremium ? '⭐ 3x Kuota Aktif' : 'Free Tier (5x/hari)'}
                            </Text>
                          </View>
                        </View>

                        {/* Special Discount Indicator */}
                        {user.specialDiscountPercent ? (
                          <View style={styles.userDiscountBadge}>
                            <Text style={styles.userDiscountText}>
                              🏷️ Diskon Khusus: <Text style={{ fontWeight: '800' }}>{user.specialDiscountPercent}%</Text> diterapkan
                            </Text>
                          </View>
                        ) : null}

                        {/* Action Buttons */}
                        <View style={styles.userCardActions}>
                          <TouchableOpacity
                            style={styles.freeUpgradeBtn}
                            onPress={() => handleGrantFreeUpgrade(user)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.freeUpgradeBtnText}>⚡ Beri Free Upgrade 30 Hari</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.giveDiscountBtn}
                            onPress={() => {
                              setSelectedUserForDiscount(user);
                              setDiscountModalVisible(true);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.giveDiscountBtnText}>🏷️ Kasih Diskon Khusus</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* TAB 3: KUPON & DISKON */}
            {activeTab === 'coupons' && (
              <View style={styles.section}>
                <View style={styles.couponHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Daftar Kupon Diskon Aktif</Text>
                    <Text style={styles.sectionSubtitle}>Kupon yang dapat digunakan user saat checkout langganan.</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.createCouponBtn}
                    onPress={() => setNewCouponModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.createCouponBtnText}>+ Buat Kupon Baru</Text>
                  </TouchableOpacity>
                </View>

                {coupons.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={{ fontSize: 32, marginBottom: 8 }}>🎟️</Text>
                    <Text style={styles.emptyTitle}>Belum Ada Kupon Promosi</Text>
                    <Text style={styles.emptySubtitle}>Klik tombol "+ Buat Kupon Baru" untuk membuat voucher diskon pertama.</Text>
                  </View>
                ) : (
                  <View style={styles.couponGrid}>
                    {coupons.map((c) => (
                      <View key={c.id || c.code} style={styles.couponCard}>
                        <View style={styles.couponTop}>
                          <Text style={styles.couponCodeText}>{c.code}</Text>
                          <View style={styles.couponPercentBadge}>
                            <Text style={styles.couponPercentText}>HEMAT {c.discountPercent}%</Text>
                          </View>
                        </View>
                        <Text style={styles.couponDesc}>{c.description}</Text>
                        <Text style={styles.couponExp}>
                          Berlaku hingga: {new Date(c.validUntil).toLocaleDateString('id-ID')}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* TAB 4: MAILBOX / KELUHAN USER */}
            {activeTab === 'mailbox' && (
              <View style={styles.section}>
                {/* Filter Pills */}
                <View style={styles.feedbackFilterRow}>
                  {[
                    { id: 'all', label: `Semua (${feedbacks.length})` },
                    { id: 'new', label: 'Baru 🟡' },
                    { id: 'in_progress', label: 'Diproses 🔵' },
                    { id: 'resolved', label: 'Selesai 🟢' },
                  ].map((flt) => (
                    <TouchableOpacity
                      key={flt.id}
                      style={[styles.fltBtn, feedbackFilter === flt.id && styles.fltBtnActive]}
                      onPress={() => setFeedbackFilter(flt.id as any)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.fltText, feedbackFilter === flt.id && styles.fltTextActive]}>
                        {flt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {filteredFeedbacks.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={{ fontSize: 32, marginBottom: 8 }}>📬</Text>
                    <Text style={styles.emptyTitle}>Mailbox Bersih</Text>
                    <Text style={styles.emptySubtitle}>Tidak ada pesan feedback atau keluhan pada kategori ini.</Text>
                  </View>
                ) : (
                  <View style={styles.mailboxList}>
                    {filteredFeedbacks.map((item) => (
                      <View key={item.id} style={styles.mailCard}>
                        <View style={styles.mailHeader}>
                          <View style={styles.mailSenderInfo}>
                            <Text style={styles.mailSenderName}>{item.userName}</Text>
                            <Text style={styles.mailSenderEmail}>• {item.userEmail}</Text>
                          </View>
                          <View
                            style={[
                              styles.mailStatusBadge,
                              item.status === 'new'
                                ? styles.mailStatusNew
                                : item.status === 'in_progress'
                                ? styles.mailStatusProgress
                                : styles.mailStatusResolved,
                            ]}
                          >
                            <Text style={styles.mailStatusText}>
                              {item.status === 'new' ? 'Baru 🟡' : item.status === 'in_progress' ? 'Diproses 🔵' : 'Selesai 🟢'}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.mailSubject}>{item.subject}</Text>
                        <Text style={styles.mailMessage}>{item.message}</Text>

                        {/* Admin Action Row */}
                        <View style={styles.mailActions}>
                          <TouchableOpacity
                            style={styles.actionBtnProgress}
                            onPress={() => handleUpdateFeedback(item.id!, 'in_progress')}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.actionBtnText}>⏳ Tandai Diproses</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionBtnResolved}
                            onPress={() => handleUpdateFeedback(item.id!, 'resolved')}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.actionBtnText}>✅ Selesaikan Keluhan</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionBtnDelete}
                            onPress={() => handleDeleteFeedback(item)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.actionBtnDeleteText}>🗑️ Hapus Surat</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* TAB 5: AI ENDPOINT SETTINGS (Gaya TXsiber AI Triad 2.8.1) */}
            {activeTab === 'ai-endpoint' && (
              <View style={styles.section}>
                {/* Save banner alert */}
                {aiSaveBanner && (
                  <View style={styles.aiSuccessBanner}>
                    <Text style={styles.aiSuccessText}>{aiSaveBanner}</Text>
                  </View>
                )}

                {/* Hero Status Card (Meniru statusBadge & statusDot TXsiber) */}
                <View style={styles.aiStatusHero}>
                  <View style={styles.aiStatusHeaderRow}>
                    <View style={styles.aiStatusBadgeRow}>
                      <View
                        style={[
                          styles.aiStatusDot,
                          aiTestResult?.success
                            ? styles.aiDotGreen
                            : aiEnabled
                            ? styles.aiDotBlue
                            : styles.aiDotGray,
                        ]}
                      />
                      <Text style={styles.aiStatusText}>
                        {aiTestResult?.success
                          ? 'Terhubung'
                          : aiEnabled
                          ? 'Mode Siap'
                          : 'Nonaktif (Fallback Gemini)'}
                      </Text>
                      {availableModels.length > 0 && (
                        <Text style={styles.aiStatusCountPill}>
                          · {availableModels.length} Model di Server
                        </Text>
                      )}
                      {aiTestResult?.latencyMs !== undefined && (
                        <View style={styles.aiLatencyPill}>
                          <Text style={styles.aiLatencyText}>⚡ {aiTestResult.latencyMs} ms</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.aiProtocolBadge}>
                      <Text style={styles.aiProtocolText}>OpenAI-Compatible API</Text>
                    </View>
                  </View>

                  <Text style={styles.aiHeroHeading}>Konfigurasi AI Bawaan Sistem</Text>
                  <Text style={styles.aiHeroSub}>
                    Atur endpoint custom (Base URL, API Key, dan Model) yang otomatis dipakai oleh seluruh siswa/pengguna ketika memilih AI Bawaan.
                  </Text>
                </View>

                {/* Main Settings Card */}
                <View style={styles.aiCard}>
                  {/* Toggle Aktifkan */}
                  <View style={styles.aiToggleRow}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={styles.aiToggleTitle}>Gunakan Endpoint Custom untuk AI Bawaan</Text>
                      <Text style={styles.aiToggleSub}>
                        Jika diaktifkan, seluruh latihan soal try out akan diproses melalui endpoint ini. Jika nonaktif, sistem kembali memakai Gemini default.
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.aiSwitchBtn, aiEnabled ? styles.aiSwitchOn : styles.aiSwitchOff]}
                      onPress={() => setAiEnabled(!aiEnabled)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.aiSwitchThumb, aiEnabled ? styles.aiSwitchThumbOn : styles.aiSwitchThumbOff]} />
                      <Text style={[styles.aiSwitchLabel, aiEnabled ? styles.aiSwitchLabelOn : styles.aiSwitchLabelOff]}>
                        {aiEnabled ? 'AKTIF' : 'OFF'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Preset Buttons (Gaya TXsiber) */}
                  <View style={styles.aiPresetsBox}>
                    <Text style={styles.aiPresetsLabel}>⚡ Preset Cepat Endpoint:</Text>
                    <View style={styles.aiPresetsRow}>
                      <TouchableOpacity
                        style={styles.aiPresetChip}
                        onPress={() => handleApplyPreset('txsiber')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.aiPresetChipText}>🛡️ TXsiber AI</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.aiPresetChip}
                        onPress={() => handleApplyPreset('openai')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.aiPresetChipText}>🌐 OpenAI Official</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.aiPresetChip}
                        onPress={() => handleApplyPreset('groq')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.aiPresetChipText}>⚡ Groq Cloud</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.aiPresetChip}
                        onPress={() => handleApplyPreset('openrouter')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.aiPresetChipText}>✨ OpenRouter</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Form: Base URL API */}
                  <View style={styles.aiFormGroup}>
                    <Text style={styles.aiFormLabel}>Base URL API</Text>
                    <TextInput
                      style={styles.aiFormInput}
                      placeholder="https://api.txsiber.online/v1"
                      placeholderTextColor="#94a3b8"
                      value={aiBaseUrl}
                      onChangeText={(val) => {
                        setAiBaseUrl(val);
                        setAiTestResult(null);
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Text style={styles.aiFormHint}>
                      Endpoint OpenAI-compatible. Default: <Text style={styles.codeText}>https://api.txsiber.online/v1</Text> (otomatis normalisasi /v1).
                    </Text>
                  </View>

                  {/* Form: API Key */}
                  <View style={styles.aiFormGroup}>
                    <View style={styles.aiLabelRow}>
                      <Text style={styles.aiFormLabel}>API Key Endpoint</Text>
                      <TouchableOpacity onPress={() => setShowAiKey(!showAiKey)} activeOpacity={0.7}>
                        <Text style={styles.aiToggleRevealText}>{showAiKey ? '🙈 Sembunyikan' : '👁️ Tampilkan'}</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.aiFormInput}
                      placeholder="sk-..."
                      placeholderTextColor="#94a3b8"
                      value={aiApiKey}
                      onChangeText={(val) => {
                        setAiApiKey(val);
                        setAiTestResult(null);
                      }}
                      secureTextEntry={!showAiKey}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Text style={styles.aiFormHint}>
                      Disimpan aman di Firestore sistem & perangkat lokal admin untuk melayani seluruh pengguna sistem AI bawaan.
                    </Text>
                  </View>

                  {/* Form: Model Identifier */}
                  <View style={styles.aiFormGroup}>
                    <View style={styles.aiLabelRow}>
                      <Text style={styles.aiFormLabel}>Model Default AI Bawaan</Text>
                      <TouchableOpacity
                        style={styles.aiFetchModelsBtn}
                        onPress={handleFetchModels}
                        disabled={isLoadingModels}
                        activeOpacity={0.7}
                      >
                        {isLoadingModels ? (
                          <ActivityIndicator size="small" color="#2563eb" />
                        ) : (
                          <Text style={styles.aiFetchModelsText}>🔄 Muat Model Server (/models)</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.aiFormInput}
                      placeholder="claude-3-7-sonnet-latest"
                      placeholderTextColor="#94a3b8"
                      value={aiModel}
                      onChangeText={(val) => {
                        setAiModel(val);
                        setAiTestResult(null);
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Text style={styles.aiFormHint}>
                      Identifier model yang dipanggil pada /chat/completions (misal: claude-3-7-sonnet-latest, gpt-4o, deepseek-chat).
                    </Text>

                    {/* Quick Model Suggestions */}
                    <View style={styles.aiQuickModelsRow}>
                      <Text style={styles.aiQuickModelsTitle}>Rekomendasi Cepat:</Text>
                      {['claude-3-7-sonnet-latest', 'gpt-4o', 'gpt-4o-mini', 'deepseek-chat', 'llama-3.3-70b-versatile'].map((m) => (
                        <TouchableOpacity
                          key={m}
                          style={[styles.aiModelChip, aiModel.toLowerCase() === m.toLowerCase() && styles.aiModelChipActive]}
                          onPress={() => {
                            setAiModel(m);
                            setAiTestResult(null);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.aiModelChipText,
                              aiModel.toLowerCase() === m.toLowerCase() && styles.aiModelChipTextActive,
                            ]}
                          >
                            {m}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Available Models from Server if fetched */}
                    {availableModels.length > 0 && (
                      <View style={styles.aiServerModelsBox}>
                        <View style={styles.aiServerModelsHeader}>
                          <Text style={styles.aiServerModelsTitle}>
                            📋 Model Ditemukan di Server ({availableModels.length} model) - Klik untuk memilih:
                          </Text>
                          <TextInput
                            style={styles.aiModelSearchInput}
                            placeholder="Cari model..."
                            placeholderTextColor="#94a3b8"
                            value={activeModelFilter}
                            onChangeText={setActiveModelFilter}
                          />
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.aiModelsScroll}>
                          <View style={styles.aiModelsGrid}>
                            {availableModels
                              .filter((m) => !activeModelFilter || m.toLowerCase().includes(activeModelFilter.toLowerCase()))
                              .slice(0, 30)
                              .map((m) => (
                                <TouchableOpacity
                                  key={m}
                                  style={[styles.aiServerChip, aiModel.toLowerCase() === m.toLowerCase() && styles.aiServerChipActive]}
                                  onPress={() => {
                                    setAiModel(m);
                                    setAiTestResult(null);
                                  }}
                                  activeOpacity={0.7}
                                >
                                  <Text
                                    style={[
                                      styles.aiServerChipText,
                                      aiModel.toLowerCase() === m.toLowerCase() && styles.aiServerChipTextActive,
                                    ]}
                                  >
                                    {m}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Uji Koneksi API & Result Box (Persis testConnBtn & testResultBox TXsiber) */}
                  <View style={styles.aiTestSection}>
                    <TouchableOpacity
                      style={[styles.aiTestBtn, isTestingAi && styles.aiBtnDisabled]}
                      onPress={handleTestAiConnection}
                      disabled={isTestingAi}
                      activeOpacity={0.8}
                    >
                      {isTestingAi ? (
                        <View style={styles.aiBtnRow}>
                          <ActivityIndicator size="small" color="#0f172a" />
                          <Text style={styles.aiTestBtnText}>Menguji koneksi ke endpoint...</Text>
                        </View>
                      ) : (
                        <Text style={styles.aiTestBtnText}>⚡ Uji Koneksi API</Text>
                      )}
                    </TouchableOpacity>

                    {/* Result Box */}
                    {aiTestResult && (
                      <View
                        style={[
                          styles.aiTestResultBox,
                          aiTestResult.success ? styles.aiResultSuccess : styles.aiResultError,
                        ]}
                      >
                        <View style={styles.aiResultTop}>
                          <Text style={styles.aiResultHeading}>
                            {aiTestResult.success ? '🟢 Status Koneksi: Sukses' : '⚠️ Status Koneksi: Gagal / Peringatan'}
                          </Text>
                          {aiTestResult.latencyMs !== undefined && (
                            <Text style={styles.aiResultLatency}>Response Time: {aiTestResult.latencyMs} ms</Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.aiResultMessage,
                            aiTestResult.success ? styles.aiResultMsgSuccess : styles.aiResultMsgError,
                          ]}
                        >
                          {aiTestResult.message}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons: Simpan & Reset */}
                  <View style={styles.aiActionRow}>
                    <TouchableOpacity
                      style={[styles.aiSaveBtn, isSavingAi && styles.aiBtnDisabled]}
                      onPress={handleSaveAiConfig}
                      disabled={isSavingAi}
                      activeOpacity={0.8}
                    >
                      {isSavingAi ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.aiSaveBtnText}>💾 Simpan Pengaturan AI Bawaan</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.aiResetBtn}
                      onPress={handleResetGeminiDefault}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.aiResetBtnText}>↺ Reset ke Gemini Standar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </>
        )}

        {/* Modal: Beri Diskon Khusus */}
        <Modal visible={discountModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Kasih Diskon Khusus</Text>
              <Text style={styles.modalSubtitle}>
                Penerima: <Text style={{ fontWeight: '700', color: '#2563eb' }}>{selectedUserForDiscount?.email}</Text>
              </Text>

              <Text style={styles.modalLabel}>Persentase Potongan Diskon (%)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="50"
                value={customDiscountPercent}
                onChangeText={setCustomDiscountPercent}
              />
              <Text style={styles.modalHint}>
                *Jika diisi 50%, biaya langganan Rp 5.000 menjadi Rp 2.500 saat user checkout.
              </Text>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setDiscountModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleGrantDiscount}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalSubmitText}>Terapkan Diskon ➔</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal: Buat Kupon Baru */}
        <Modal visible={newCouponModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Buat Kupon Promo Baru</Text>
              <Text style={styles.modalSubtitle}>Kupon ini bisa dimasukkan user di halaman checkout langganan.</Text>

              <Text style={styles.modalLabel}>Kode Kupon (Contoh: HEMAT50)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="DISKON50"
                autoCapitalize="characters"
                value={newCouponCode}
                onChangeText={setNewCouponCode}
              />

              <Text style={styles.modalLabel}>Persentase Diskon (%)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="50"
                value={newCouponPercent}
                onChangeText={setNewCouponPercent}
              />

              <Text style={styles.modalLabel}>Keterangan / Deskripsi Kupon</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Diskon khusus menyambut ujian semester"
                value={newCouponDesc}
                onChangeText={setNewCouponDesc}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setNewCouponModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleCreateCoupon}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalSubmitText}>Aktifkan Kupon ➔</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingTop: 20, paddingBottom: 110, paddingHorizontal: 16 },
  wrapper: { width: '100%', maxWidth: 1100, alignSelf: 'center' },
  desktopWrapper: { paddingVertical: 10 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    elevation: 2,
    flexWrap: 'wrap',
    gap: 16,
  },
  headerLeft: { flex: 1, minWidth: 280 },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  adminLogoImg: {
    width: 200,
    height: 70,
    borderRadius: 6,
  },
  adminBadge: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  adminBadgeText: { color: '#dc2626', fontSize: 11, fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  refreshBtn: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  refreshBtnText: { color: '#2563eb', fontSize: 13, fontWeight: '700' },

  tabBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  tabItemActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  tabText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  tabTextActive: { color: '#ffffff' },

  centerBox: { paddingVertical: 40, alignItems: 'center' },
  centerText: { marginTop: 12, color: '#64748b' },

  section: { gap: 16 },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  kpiCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  kpiIcon: { fontSize: 26, marginBottom: 8 },
  kpiValue: { fontSize: 32, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  kpiLabel: { fontSize: 13, fontWeight: '700', color: '#334155' },
  kpiSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  systemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 10,
  },
  systemCardTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 14 },
  systemGrid: { gap: 10 },
  systemItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  systemItemText: { fontSize: 13, color: '#475569' },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#0f172a' },

  // Users List
  usersList: { gap: 12 },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  userCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  userAvatarText: { fontSize: 18, fontWeight: '800', color: '#2563eb' },
  userName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  userEmailText: { fontSize: 13, color: '#64748b', marginTop: 2 },
  roleBadgeAdmin: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeAdminText: { fontSize: 10, fontWeight: '800', color: '#b91c1c' },

  subBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  subBadgePremium: { backgroundColor: '#fefce8', borderColor: '#fef08a' },
  subBadgeFree: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
  subBadgeText: { fontSize: 11, fontWeight: '700' },
  subBadgeTextPremium: { color: '#854d0e' },
  subBadgeTextFree: { color: '#64748b' },

  userDiscountBadge: {
    marginTop: 10,
    backgroundColor: '#eff6ff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  userDiscountText: { fontSize: 12, color: '#1d4ed8' },

  userCardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  freeUpgradeBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  freeUpgradeBtnText: { color: '#15803d', fontSize: 12, fontWeight: '700' },
  giveDiscountBtn: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  giveDiscountBtnText: { color: '#1d4ed8', fontSize: 12, fontWeight: '700' },

  // Coupons
  couponHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  sectionSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  createCouponBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  createCouponBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  couponGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  couponCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  couponTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  couponCodeText: { fontSize: 18, fontWeight: '900', color: '#2563eb', letterSpacing: 1 },
  couponPercentBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  couponPercentText: { color: '#15803d', fontSize: 11, fontWeight: '800' },
  couponDesc: { fontSize: 13, color: '#475569', marginBottom: 8 },
  couponExp: { fontSize: 11, color: '#94a3b8' },

  // Mailbox
  feedbackFilterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  fltBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  fltBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  fltText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  fltTextActive: { color: '#ffffff', fontWeight: '800' },
  mailboxList: { gap: 12 },
  mailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  mailSenderInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  mailSenderName: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  mailSenderEmail: { fontSize: 12, color: '#64748b' },
  mailStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  mailStatusNew: { backgroundColor: '#fef3c7' },
  mailStatusProgress: { backgroundColor: '#eff6ff' },
  mailStatusResolved: { backgroundColor: '#dcfce7' },
  mailStatusText: { fontSize: 11, fontWeight: '700' },
  mailSubject: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  mailMessage: { fontSize: 13, color: '#475569', lineHeight: 20 },
  mailActions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  actionBtnProgress: {
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  actionBtnResolved: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  actionBtnDelete: {
    backgroundColor: '#fef2f2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fca5a5',
    marginLeft: 'auto',
  },
  actionBtnDeleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: '#334155' },

  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: '#64748b', textAlign: 'center' },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    elevation: 6,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginTop: 10, marginBottom: 6 },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  modalHint: { fontSize: 11, color: '#64748b', marginTop: 4 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  modalCancelBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  modalCancelText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  modalSubmitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalSubmitText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  // ================= AI Endpoint Styles (TXsiber inspired) =================
  aiSuccessBanner: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  aiSuccessText: { color: '#166534', fontSize: 13, fontWeight: '700' },

  aiStatusHero: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  aiStatusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 10,
  },
  aiStatusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  aiStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  aiDotGreen: { backgroundColor: '#10b981' },
  aiDotBlue: { backgroundColor: '#38bdf8' },
  aiDotGray: { backgroundColor: '#64748b' },
  aiStatusText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  aiStatusCountPill: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  aiLatencyPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  aiLatencyText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  aiProtocolBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  aiProtocolText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  aiHeroHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  aiHeroSub: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },

  aiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 18,
  },
  aiToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  aiToggleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  aiToggleSub: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  aiSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 78,
    justifyContent: 'space-between',
  },
  aiSwitchOn: { backgroundColor: '#10b981' },
  aiSwitchOff: { backgroundColor: '#cbd5e1' },
  aiSwitchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
  },
  aiSwitchThumbOn: { transform: [{ translateX: 0 }] },
  aiSwitchThumbOff: { transform: [{ translateX: 0 }] },
  aiSwitchLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
  },
  aiSwitchLabelOn: { color: '#ffffff' },
  aiSwitchLabelOff: { color: '#475569' },

  aiPresetsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aiPresetsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  aiPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  aiPresetChip: {
    backgroundColor: '#ffffff',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  aiPresetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },

  aiFormGroup: {
    gap: 6,
  },
  aiFormLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  aiLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiToggleRevealText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  aiFormInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  aiFormHint: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
  codeText: {
    fontFamily: 'monospace',
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
    fontWeight: '700',
  },

  aiFetchModelsBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  aiFetchModelsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  aiQuickModelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  aiQuickModelsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginRight: 4,
  },
  aiModelChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aiModelChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  aiModelChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  aiModelChipTextActive: {
    color: '#2563eb',
    fontWeight: '800',
  },

  aiServerModelsBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  aiServerModelsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  aiServerModelsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    minWidth: 200,
  },
  aiModelSearchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#0f172a',
    minWidth: 140,
  },
  aiModelsScroll: {
    maxHeight: 120,
  },
  aiModelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingVertical: 4,
  },
  aiServerChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  aiServerChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  aiServerChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  aiServerChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  aiTestSection: {
    paddingTop: 8,
    gap: 10,
  },
  aiTestBtn: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  aiTestBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  aiBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiBtnDisabled: {
    opacity: 0.6,
  },

  aiTestResultBox: {
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
  },
  aiResultSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  aiResultError: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  aiResultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  aiResultHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  aiResultLatency: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  aiResultMessage: {
    fontSize: 12,
    lineHeight: 18,
  },
  aiResultMsgSuccess: {
    color: '#166534',
  },
  aiResultMsgError: {
    color: '#92400e',
  },

  aiActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  aiSaveBtn: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#2563eb',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSaveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  aiResetBtn: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiResetBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
});
