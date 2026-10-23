import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Image,
} from 'react-native';
import firebaseService from '../services/firebaseService';
import firestoreService from '../services/firestoreService';

export const LoginScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi.');
      return false;
    }
    if (mode === 'signup' && !displayName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return false;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await firebaseService.login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login gagal, periksa email & password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const result = await firebaseService.signup(email.trim(), password);
      await firestoreService.createUserProfile(result.user.uid, email.trim(), displayName.trim());
      setSuccessMsg('Akun berhasil dibuat! Silakan masuk dengan akun Anda.');
      setMode('login');
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err: any) {
      setError(err.message || 'Signup gagal, coba gunakan email lain.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setError('');
    setMode('login');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.mainLayout, isDesktop && styles.desktopLayout]}>
        {/* Left Column (Desktop Hero Branding) */}
        {isDesktop ? (
          <View style={styles.heroColumn}>
            {/* Mascot Kibo & Brand Hero Card */}
            <View style={styles.heroMascotCard}>
              <Image
                source={require('../../assets/edunesis-mascot-kibo.png')}
                style={styles.heroMascotImg}
                resizeMode="contain"
              />
              <View style={styles.mascotSpeechContainer}>
                <View style={styles.badgeRow}>
                  <Text style={styles.heroBadge}>EDUNESIS AI</Text>
                  <Text style={styles.subBadge}>Multi-Jenjang (TK - SMA)</Text>
                </View>
                <Text style={styles.mascotGreeting}>"Halo Sahabat Juara! Aku Kibo 🤖"</Text>
                <Text style={styles.mascotSubGreeting}>
                  Yuk mulai latihan try out seru, asah nalar berpikir, dan taklukkan materi ujian bersama kecerdasan buatan. Belajar jadi lebih cerdas dan berprestasi!
                </Text>
              </View>
            </View>

            <Text style={styles.heroHeading}>Belajar & Latihan Try Out Interaktif TK hingga SMA</Text>
            <Text style={styles.heroSub}>
              Tingkatkan pemahaman materi belajar dengan soal-soal berkualitas yang dirumuskan secara presisi oleh kecerdasan buatan.
            </Text>

            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>Generasi Soal Otomatis</Text>
                  <Text style={styles.featureDesc}>Pilih buku/topik apa saja, AI langsung menyusun pertanyaan pilihan ganda lengkap dengan 4 opsi.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎯</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>Evaluasi & Pembahasan Instan</Text>
                  <Text style={styles.featureDesc}>Setiap jawaban disertai pembahasan mendalam untuk mengasah nalar berpikir siswa.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>Dukungan Kunci Fleksibel</Text>
                  <Text style={styles.featureDesc}>Gunakan Gemini gratis sistem atau gunakan API Key pribadi untuk akses tanpa batas.</Text>
                </View>
              </View>
            </View>

            {/* Quick Login Test Accounts for easy clicking */}
            <View style={styles.quickAccountsCard}>
              <Text style={styles.quickTitle}>⚡ Akun Cepat Pengujian (Klik untuk isi):</Text>
              <View style={styles.quickRow}>
                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() => fillQuickAccount('admin@edublox.id', 'admin123456')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickBtnText}>🛡️ Akun Admin</Text>
                  <Text style={styles.quickSub}>admin@edublox.id</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() => fillQuickAccount('user@edublox.id', 'user123456')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickBtnText}>👤 Akun Siswa</Text>
                  <Text style={styles.quickSub}>user@edublox.id</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* Right Column / Centered Form */}
        <View style={[styles.formColumn, isDesktop && styles.desktopFormColumn]}>
          {!isDesktop ? (
            <View style={styles.mobileHeroHeader}>
              <Image
                source={require('../../assets/edunesis-mascot-kibo.png')}
                style={styles.mobileHeroImg}
                resizeMode="contain"
              />
              <View style={styles.mobileGreetingBox}>
                <View style={styles.badgeRow}>
                  <Text style={styles.heroBadge}>EDUNESIS AI</Text>
                  <Text style={styles.subBadge}>Multi-Jenjang (TK - SMA)</Text>
                </View>
                <Text style={styles.mobileTitle}>Latihan Try Out Cerdas</Text>
                <Text style={styles.mobileSub}>Belajar interaktif bersama Kibo & AI</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.card}>
            {/* Top Brand Logo inside Login Card */}
            <View style={styles.cardLogoRow}>
              <Image
                source={require('../../assets/edunesis-logo.jpg')}
                style={styles.cardLogoImg}
                resizeMode="contain"
              />
            </View>

            <View style={styles.tabs}>
              <Tab active={mode === 'login'} label="Masuk Akun" onPress={() => { setMode('login'); setError(''); setSuccessMsg(''); }} />
              <Tab active={mode === 'signup'} label="Daftar Baru" onPress={() => { setMode('signup'); setError(''); setSuccessMsg(''); }} />
            </View>

            {successMsg ? (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>✅ {successMsg}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              {mode === 'signup' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nama Lengkap Siswa</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Budi Santoso"
                    placeholderTextColor="#94a3b8"
                    value={displayName}
                    onChangeText={setDisplayName}
                    editable={!loading}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alamat Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="nama@email.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kata Sandi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDis]}
                onPress={mode === 'login' ? handleLogin : handleSignup}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.btnText}>{mode === 'login' ? 'Masuk ke Edunesis' : 'Buat Akun Gratis'}</Text>
                )}
              </TouchableOpacity>

              {/* Mobile Quick Test Accounts */}
              {!isDesktop ? (
                <View style={styles.mobileQuickBox}>
                  <Text style={styles.quickTitle}>Gunakan Akun Cepat Pengujian:</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    <TouchableOpacity
                      style={[styles.quickBtn, { flex: 1 }]}
                      onPress={() => fillQuickAccount('admin@edublox.id', 'admin123456')}
                    >
                      <Text style={styles.quickBtnText}>🛡️ Admin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickBtn, { flex: 1 }]}
                      onPress={() => fillQuickAccount('user@edublox.id', 'user123456')}
                    >
                      <Text style={styles.quickBtnText}>👤 Siswa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              <Text style={styles.foot}>
                {mode === 'login' ? 'Belum memiliki akun? ' : 'Sudah memiliki akun? '}
                <Text
                  style={styles.link}
                  onPress={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError('');
                    setSuccessMsg('');
                  }}
                >
                  {mode === 'login' ? 'Daftar sekarang' : 'Masuk sekarang'}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const Tab = ({ active, label, onPress }: any) => (
  <TouchableOpacity style={[styles.tab, active && styles.tabAct]} onPress={onPress} activeOpacity={0.7}>
    <Text style={[styles.tabTxt, active && styles.tabTxtAct]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 16 },
  mainLayout: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  desktopLayout: { maxWidth: 1040, flexDirection: 'row', gap: 48, alignItems: 'center' },

  // Hero Section (Desktop)
  heroColumn: { flex: 1.1 },
  heroMascotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    alignItems: 'center',
  },
  heroMascotImg: {
    width: '100%',
    height: 310,
    borderRadius: 16,
  },
  mascotSpeechContainer: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 14,
  },
  mascotGreeting: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  mascotSubGreeting: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  heroBadge: { backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: '800', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, letterSpacing: 1 },
  subBadge: { backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  heroHeading: { fontSize: 32, fontWeight: '900', color: '#0f172a', lineHeight: 42, marginBottom: 14 },
  heroSub: { fontSize: 15, color: '#64748b', lineHeight: 24, marginBottom: 28 },

  featureList: { gap: 18, marginBottom: 28 },
  featureItem: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  featureIcon: { fontSize: 24 },
  featureTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  featureDesc: { fontSize: 13, color: '#64748b', lineHeight: 18 },

  quickAccountsCard: { backgroundColor: '#f1f5f9', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  quickTitle: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 8 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1, backgroundColor: '#ffffff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center' },
  quickBtnText: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  quickSub: { fontSize: 11, color: '#64748b', marginTop: 2 },

  // Form Section
  formColumn: { width: '100%' },
  desktopFormColumn: { flex: 0.9 },
  mobileHeroHeader: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  mobileHeroImg: {
    width: '100%',
    maxWidth: 420,
    height: 220,
    borderRadius: 16,
    marginBottom: 10,
  },
  mobileGreetingBox: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  mobileTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 4 },
  mobileSub: { fontSize: 13, color: '#64748b', textAlign: 'center' },

  card: { backgroundColor: '#ffffff', borderRadius: 20, padding: 26, borderWidth: 1, borderColor: '#e2e8f0', elevation: 3 },
  cardLogoRow: {
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardLogoImg: {
    width: '100%',
    maxWidth: 260,
    height: 115,
  },
  tabs: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center' },
  tabAct: { backgroundColor: '#2563eb' },
  tabTxt: { color: '#64748b', fontSize: 13, fontWeight: '700' },
  tabTxtAct: { color: '#ffffff' },

  successBanner: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac', borderRadius: 10, padding: 12, marginBottom: 16 },
  successText: { color: '#166534', fontSize: 13, fontWeight: '700' },
  errorBanner: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#991b1b', fontSize: 13, fontWeight: '700' },

  form: { gap: 14 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#334155' },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 13, fontSize: 14, color: '#0f172a' },
  btn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnDis: { opacity: 0.6 },
  btnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },

  mobileQuickBox: { marginTop: 14, padding: 12, backgroundColor: '#f8fafc', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  foot: { color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 10 },
  link: { color: '#2563eb', fontWeight: '800' },
});
