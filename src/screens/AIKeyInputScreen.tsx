import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAIKey } from '../hooks/useAIKey';
import type { AIProvider, RootStackParamList } from '../types';
import { AIService } from '../services/aiService';
import * as Clipboard from 'expo-clipboard';
import AIGuideModal from '../components/AIGuideModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AIKeyInput'>;

interface AIKeyInputScreenProps {
  navigation: NavigationProp;
  route?: any;
}

const AIKeyInputScreen: React.FC<AIKeyInputScreenProps> = ({ navigation, route }) => {
  const { keys, saveKey, saveAIConfig, activeKeyInfo, isLoading } = useAIKey();
  
  // Mode state: 'system' (Gunakan Gemini Sistem) or 'custom' (Gunakan API Key Sendiri)
  const [mode, setMode] = useState<'system' | 'custom'>('system');
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [customKey, setCustomKey] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    provider: AIProvider;
    success: boolean;
    message: string;
  } | null>(null);

  // Initialize mode based on active key info
  useEffect(() => {
    if (activeKeyInfo?.isSystemDefault === false) {
      setMode('custom');
      setProvider(activeKeyInfo.provider);
      setBaseUrl(activeKeyInfo.baseUrl || '');
      setModel(activeKeyInfo.model || '');
      setAdvanced(!!activeKeyInfo.baseUrl || !!activeKeyInfo.model);
    }
  }, [activeKeyInfo]);

  const handleSaveCustomKey = async () => {
    if (!customKey.trim()) {
      Alert.alert('Error', 'Masukkan API key terlebih dahulu.');
      return;
    }
    setIsSaving(true);
    try {
      const result = await saveKey(provider, customKey);
      if (result.success) {
        await saveAIConfig({
          provider,
          baseUrl:
            advanced && provider === 'openai'
              ? baseUrl.trim() || undefined
              : undefined,
          model:
            advanced && provider === 'openai'
              ? model.trim() || undefined
              : undefined,
        });
        Alert.alert('Sukses', 'Key berhasil disimpan!');
        setCustomKey('');
        setConnectionStatus(null);
      } else {
        Alert.alert('Error', 'Key gagal disimpan. Coba lagi.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!customKey.trim()) {
      Alert.alert('Error', 'Masukkan API key terlebih dahulu.');
      return;
    }
    if (advanced && provider === 'openai' && !model.trim()) {
      Alert.alert('Error', 'Masukkan nama model untuk mode Advanced.');
      return;
    }
    setIsTesting(true);
    try {
      const result = await AIService.testConnection(provider, customKey, {
        baseUrl: advanced && provider === 'openai' ? baseUrl : undefined,
        model: advanced && provider === 'openai' ? model : undefined,
      });
      setConnectionStatus({
        provider,
        success: result.success,
        message: result.message,
      });
      Alert.alert(
        result.success ? '✅ Koneksi Berhasil' : '❌ Koneksi Gagal',
        result.message
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handlePasteKey = async () => {
    try {
      const value = await Clipboard.getStringAsync();
      if (!value || !value.trim()) {
        Alert.alert('Clipboard kosong', 'Salin API key terlebih dahulu.');
        return;
      }
      setCustomKey(value.trim());
    } catch (error) {
      Alert.alert('Error', 'Gagal membaca clipboard.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Pengaturan AI Key</Text>
        <Text style={styles.subtitle}>Pilih cara untuk mengakses AI</Text>
      </View>

      {/* Mode Selector Card */}
      <View style={styles.modeCard}>
        <Text style={styles.sectionTitle}>Pilih Mode</Text>

        {/* System Mode Option */}
        <TouchableOpacity
          style={[
            styles.modeOption,
            mode === 'system' && styles.modeOptionActive,
          ]}
          onPress={() => setMode('system')}
        >
          <View style={styles.modeRadio}>
            {mode === 'system' && <View style={styles.modeRadioInner} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.modeTitle}>🟢 Gunakan Gemini Sistem</Text>
            <Text style={styles.modeSubtitle}>Gratis & siap pakai</Text>
          </View>
        </TouchableOpacity>

        {/* Custom Mode Option */}
        <TouchableOpacity
          style={[
            styles.modeOption,
            mode === 'custom' && styles.modeOptionActive,
          ]}
          onPress={() => setMode('custom')}
        >
          <View style={styles.modeRadio}>
            {mode === 'custom' && <View style={styles.modeRadioInner} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.modeTitle}>⚙️ Gunakan API Key Sendiri</Text>
            <Text style={styles.modeSubtitle}>OpenAI, Gemini, Claude</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* System Mode Info Card */}
      {mode === 'system' && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🟢 Gemini Sistem</Text>
          {activeKeyInfo?.isSystemDefault ? (
            <>
              <Text style={styles.infoText}>
                ✅ Status: Aktif dan siap digunakan{'\n'}
                • Gratis{'\n'}
                • Setup mudah{'\n'}
                • Cepat
              </Text>
              <View style={styles.statusBadgeSystem}>
                <Text style={styles.statusBadgeText}>✅ Aktif</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.infoText}>
                • Gratis{'\n'}
                • Setup mudah{'\n'}
                • Cepat
              </Text>
              <TouchableOpacity
                style={styles.learnMoreBtn}
                onPress={() => setShowGuide(true)}
              >
                <Text style={styles.learnMoreText}>📖 Panduan Setup</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Custom Mode Form */}
      {mode === 'custom' && (
        <View style={styles.customCard}>
          <Text style={styles.sectionTitle}>API Key Custom</Text>

          {/* Provider Selection */}
          <Text style={styles.label}>Provider</Text>
          <View style={styles.providerGrid}>
            {(['openai', 'gemini', 'claude'] as AIProvider[]).map((prov) => (
              <TouchableOpacity
                key={prov}
                style={[
                  styles.providerBtn,
                  provider === prov && styles.providerBtnActive,
                ]}
                onPress={() => setProvider(prov)}
              >
                <Text
                  style={[
                    styles.providerText,
                    provider === prov && styles.providerTextActive,
                  ]}
                >
                  {prov === 'openai'
                    ? '⚡ OpenAI'
                    : prov === 'gemini'
                    ? '🟢 Gemini'
                    : '🤖 Claude'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* API Key Input */}
          <Text style={styles.label}>API Key</Text>
          <TextInput
            style={styles.input}
            placeholder="Tempel API key di sini..."
            value={customKey}
            onChangeText={setCustomKey}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Paste from Clipboard Button */}
          <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteKey}>
            <Text style={styles.pasteBtnText}>📋 Paste dari Clipboard</Text>
          </TouchableOpacity>

          {/* Advanced Settings for OpenAI */}
          {provider === 'openai' && (
            <>
              <TouchableOpacity
                style={styles.advancedToggle}
                onPress={() => setAdvanced(!advanced)}
              >
                <Text style={styles.advancedText}>
                  {advanced ? '▾' : '▸'} Pengaturan Advanced
                  (OpenAI-compatible)
                </Text>
              </TouchableOpacity>
              {advanced && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Base URL, contoh: https://openrouter.ai/api/v1"
                    value={baseUrl}
                    onChangeText={setBaseUrl}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nama model, contoh: openai/gpt-4o-mini"
                    value={model}
                    onChangeText={setModel}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </>
              )}
            </>
          )}

          {/* Test Connection Button */}
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestConnection}
            disabled={isTesting || isSaving}
          >
            <Text style={styles.testBtnText}>
              {isTesting ? '⏳ Mengecek...' : '🔌 Cek Koneksi Key'}
            </Text>
          </TouchableOpacity>

          {/* Connection Status Display */}
          {connectionStatus && (
            <View
              style={[
                styles.statusCard,
                connectionStatus.success
                  ? styles.statusCardSuccess
                  : styles.statusCardError,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  connectionStatus.success
                    ? styles.statusTextSuccess
                    : styles.statusTextError,
                ]}
              >
                {connectionStatus.success ? '✅ ' : '❌ '}
                {connectionStatus.message}
              </Text>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSaveCustomKey}
            disabled={isSaving || !customKey.trim()}
          >
            <Text style={styles.primaryBtnText}>
              {isSaving ? '💾 Menyimpan...' : '💾 Simpan Key'}
            </Text>
          </TouchableOpacity>

          {/* Help Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#10B981' }]}
            onPress={() => setShowGuide(true)}
          >
            <Text style={styles.primaryBtnText}>📖 Bantuan & Panduan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.continueBtnText}>← Kembali</Text>
      </TouchableOpacity>

      {/* Guide Modal */}
      <Modal
        visible={showGuide}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGuide(false)}
      >
        <AIGuideModal
          provider={provider}
          onClose={() => setShowGuide(false)}
        />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Mode Selector Card
  modeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  modeOptionActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#F0F4FF',
  },
  modeRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  modeRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  modeSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  // Info Card for System Mode
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
    marginBottom: 12,
  },
  statusBadgeSystem: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statusBadgeText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 12,
  },
  learnMoreBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  learnMoreText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  // Custom Card
  customCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    marginTop: 12,
  },
  providerGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  providerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  providerBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  providerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  providerTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  pasteBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  pasteBtnText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 13,
  },
  advancedToggle: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  advancedText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '600',
  },
  testBtn: {
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  testBtnText: {
    color: '#3730A3',
    fontWeight: '700',
    fontSize: 14,
  },
  statusCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statusCardSuccess: {
    backgroundColor: '#D1FAE5',
  },
  statusCardError: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusTextSuccess: {
    color: '#065F46',
  },
  statusTextError: {
    color: '#991B1B',
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  continueBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 24,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AIKeyInputScreen;
