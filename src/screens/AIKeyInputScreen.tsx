import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
} from "react-native";
import { useAIKey } from "../hooks/useAIKey";
import type { AIProvider } from "../types";
import { AIService } from "../services/aiService";
import * as Clipboard from "expo-clipboard";
import AIGuideModal from "../components/AIGuideModal";
import { FeedbackModal } from "../components/FeedbackModal";

export const AIKeyInputScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { keys, saveKey, saveAIConfig, removeKey, activeKeyInfo, isLoading, isUsingSystemKey } = useAIKey();
  const [mode, setMode] = useState<"system" | "custom">("system");
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [customKey, setCustomKey] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  // Inline feedback states
  const [testResult, setTestResult] = useState<{ status: "idle" | "testing" | "success" | "error"; message?: string }>({
    status: "idle",
  });
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  useEffect(() => {
    if (activeKeyInfo?.isSystemDefault === false) {
      setMode("custom");
      setProvider(activeKeyInfo.provider);
      setCustomKey(activeKeyInfo.apiKey || "");
      setBaseUrl(activeKeyInfo.baseUrl || "");
      setModel(activeKeyInfo.model || "");
      setAdvanced(!!activeKeyInfo.baseUrl || !!activeKeyInfo.model);
    } else {
      setMode("system");
    }
  }, [activeKeyInfo]);

  // When changing provider, check if there is an existing saved key for that provider
  const handleSelectProvider = (prov: AIProvider) => {
    setProvider(prov);
    setTestResult({ status: "idle" });
    setSaveBanner(null);
    const existing = keys[prov];
    if (existing) {
      setCustomKey(existing);
    }
  };

  const handleSaveCustomKey = async () => {
    if (!customKey.trim()) {
      setTestResult({ status: "error", message: "Masukkan API Key terlebih dahulu sebelum menyimpan." });
      return;
    }
    setIsSaving(true);
    setSaveBanner(null);
    try {
      const result = await saveKey(provider, customKey.trim());
      if (result.success) {
        await saveAIConfig({
          provider,
          baseUrl: advanced && provider === "openai" ? baseUrl.trim() || undefined : undefined,
          model: advanced && provider === "openai" ? model.trim() || undefined : undefined,
        });
        setSaveBanner(`API Key ${provider.toUpperCase()} berhasil disimpan & aktif digunakan!`);
        setTimeout(() => setSaveBanner(null), 5000);
      } else {
        setTestResult({ status: "error", message: "Gagal menyimpan key ke penyimpanan perangkat." });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    const keyToTest = customKey.trim() || keys[provider] || (mode === "system" ? activeKeyInfo?.apiKey : "");
    if (!keyToTest) {
      setTestResult({ status: "error", message: "Masukkan API Key terlebih dahulu untuk diuji." });
      return;
    }
    if (advanced && provider === "openai" && !model.trim()) {
      setTestResult({ status: "error", message: "Masukkan nama model untuk mode Advanced." });
      return;
    }

    setIsTesting(true);
    setTestResult({
      status: "testing",
      message: mode === "system" ? "Sedang menguji koneksi ke AI Bawaan Sistem..." : `Sedang menguji koneksi ke ${provider.toUpperCase()}...`,
    });

    try {
      const result = await AIService.testConnection(mode === "system" ? (activeKeyInfo?.provider || "gemini") : provider, keyToTest, {
        baseUrl: advanced && provider === "openai" ? baseUrl : (mode === "system" ? activeKeyInfo?.baseUrl : undefined),
        model: advanced && provider === "openai" ? model : (mode === "system" ? activeKeyInfo?.model : undefined),
      });

      let displayMessage = result.message;
      if (mode === "system" && result.success) {
        displayMessage = `🟢 Koneksi ke AI Bawaan Sistem berhasil terverifikasi (${result.latencyMs || 0} ms)! Siap membuat soal.`;
      }

      setTestResult({
        status: result.success ? "success" : "error",
        message: displayMessage,
      });
    } catch (err: any) {
      setTestResult({
        status: "error",
        message: err.message || "Gagal menghubungi server AI.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemoveKey = async () => {
    await removeKey(provider);
    setCustomKey("");
    setSaveBanner(`Key ${provider.toUpperCase()} telah dihapus. Kembali ke Gemini Sistem.`);
    setMode("system");
    setTimeout(() => setSaveBanner(null), 4000);
  };

  const handlePasteKey = async () => {
    try {
      const value = await Clipboard.getStringAsync();
      if (!value.trim()) {
        setTestResult({ status: "error", message: "Clipboard kosong. Salin API key Anda terlebih dahulu." });
        return;
      }
      setCustomKey(value.trim());
      setTestResult({ status: "idle" });
    } catch {
      setTestResult({
        status: "error",
        message: "Izin clipboard ditolak. Silakan tempel (Ctrl + V) langsung pada kolom input.",
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Memuat konfigurasi AI...</Text>
      </View>
    );
  }

  const maskedActiveKey = activeKeyInfo?.apiKey
    ? `${activeKeyInfo.apiKey.substring(0, 10)}••••••••${activeKeyInfo.apiKey.substring(activeKeyInfo.apiKey.length - 6)}`
    : "Tidak ada key aktif";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.contentWrapper, isDesktop && styles.desktopWrapper]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Konfigurasi AI Provider</Text>
          <Text style={styles.subtitle}>
            Kelola model kecerdasan buatan untuk membuat soal latihan, evaluasi, dan pembahasan otomatis.
          </Text>
        </View>

        {/* Status Banner */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusDot} />
            <Text style={styles.statusTitle}>
              Status AI: <Text style={styles.bold}>{isUsingSystemKey ? "Edublox AI Bawaan (Aktif)" : (activeKeyInfo?.provider?.toUpperCase() || "GEMINI")}</Text>
            </Text>
          </View>
          <Text style={styles.statusKeyInfo}>
            {isUsingSystemKey ? "✨ Menggunakan AI Bawaan Sistem (Gratis)" : `🔑 Key Custom (${activeKeyInfo?.provider?.toUpperCase()})`}
          </Text>
          <Text style={styles.statusKey}>
            {isUsingSystemKey ? "Tersambung otomatis & siap digunakan" : maskedActiveKey}
          </Text>
        </View>

        {/* Save Banner Toast */}
        {saveBanner ? (
          <View style={styles.saveSuccessBanner}>
            <Text style={styles.saveSuccessText}>✅ {saveBanner}</Text>
          </View>
        ) : null}

        {/* Inline Test Result Toast */}
        {testResult.status !== "idle" ? (
          <View
            style={[
              styles.testResultBanner,
              testResult.status === "testing" && styles.testResultTesting,
              testResult.status === "success" && styles.testResultSuccess,
              testResult.status === "error" && styles.testResultError,
            ]}
          >
            {testResult.status === "testing" ? (
              <ActivityIndicator size="small" color="#1e40af" style={{ marginRight: 8 }} />
            ) : null}
            <Text
              style={[
                styles.testResultText,
                testResult.status === "success" && styles.testSuccessText,
                testResult.status === "error" && styles.testErrorText,
              ]}
            >
              {testResult.status === "testing" ? "⏳ " : testResult.status === "success" ? "🟢 " : "🔴 "}
              {testResult.message}
            </Text>
          </View>
        ) : null}

        {/* Mode Selector Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pilih Sumber AI</Text>

          <View style={[styles.modeRow, isDesktop && styles.desktopModeRow]}>
            <TouchableOpacity
              style={[styles.modeCard, mode === "system" && styles.modeCardActive]}
              onPress={() => {
                setMode("system");
                setTestResult({ status: "idle" });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.modeRadio}>
                {mode === "system" ? <View style={styles.modeRadioInner} /> : null}
              </View>
              <View style={styles.modeTextContainer}>
                <Text style={styles.modeTitle}>AI Bawaan Sistem (Default)</Text>
                <Text style={styles.modeSubtitle}>Gratis tanpa perlu setup API Key pribadi. Siap langsung pakai.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeCard, mode === "custom" && styles.modeCardActive]}
              onPress={() => {
                setMode("custom");
                setTestResult({ status: "idle" });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.modeRadio}>
                {mode === "custom" ? <View style={styles.modeRadioInner} /> : null}
              </View>
              <View style={styles.modeTextContainer}>
                <Text style={styles.modeTitle}>API Key Pribadi (Custom)</Text>
                <Text style={styles.modeSubtitle}>Gunakan kuota sendiri untuk Google Gemini, OpenAI (GPT-4o), atau Claude.</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Mode Details */}
        {mode === "system" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Keunggulan Mode Sistem</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Bebas biaya langganan — disediakan langsung oleh Edublox.</Text>
              <Text style={styles.bulletItem}>• Menggunakan AI berkecepatan tinggi yang dioptimalkan untuk kurikulum sekolah.</Text>
              <Text style={styles.bulletItem}>• Sistem terenkripsi dan siap melayani pembuatan soal kapan saja.</Text>
            </View>
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestConnection}
              disabled={isTesting}
              activeOpacity={0.8}
            >
              {isTesting ? (
                <ActivityIndicator color="#1e40af" size="small" />
              ) : (
                <Text style={styles.testBtnText}>🔌 Tes Koneksi AI Sistem</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* Custom Mode Configuration */
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Pengaturan API Key Kustom</Text>

            {/* Provider Tabs */}
            <Text style={styles.inputLabel}>Pilih Provider AI</Text>
            <View style={styles.providerGrid}>
              {(["gemini", "openai", "claude"] as AIProvider[]).map((prov) => {
                const isActive = provider === prov;
                const hasSaved = !!keys[prov];
                return (
                  <TouchableOpacity
                    key={prov}
                    style={[styles.providerBtn, isActive && styles.providerBtnActive]}
                    onPress={() => handleSelectProvider(prov)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.providerText, isActive && styles.providerTextActive]}>
                      {prov === "gemini" ? "🟢 Google Gemini" : prov === "openai" ? "⚡ OpenAI (GPT)" : "🤖 Anthropic Claude"}
                    </Text>
                    {hasSaved ? (
                      <View style={styles.savedDot}>
                        <Text style={styles.savedDotText}>Tersimpan</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* API Key Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>API Key {provider.toUpperCase()}</Text>
                <TouchableOpacity onPress={() => setShowGuide(true)}>
                  <Text style={styles.guideLink}>❓ Cara dapat key gratis</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder={`Masukkan API key ${provider.toUpperCase()} Anda...`}
                placeholderTextColor="#94a3b8"
                value={customKey}
                onChangeText={(val) => {
                  setCustomKey(val);
                  setTestResult({ status: "idle" });
                  setSaveBanner(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Action Buttons for Key Input */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteKey} activeOpacity={0.7}>
                <Text style={styles.pasteBtnText}>📋 Tempel dari Clipboard</Text>
              </TouchableOpacity>

              {customKey ? (
                <TouchableOpacity style={styles.clearBtn} onPress={() => setCustomKey("")} activeOpacity={0.7}>
                  <Text style={styles.clearBtnText}>✕ Bersihkan</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* OpenAI Advanced Settings */}
            {provider === "openai" ? (
              <View style={styles.advancedContainer}>
                <TouchableOpacity
                  style={styles.advancedToggle}
                  onPress={() => setAdvanced(!advanced)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.advancedToggleText}>
                    {advanced ? "▾ Sembunyikan" : "▸ Tampilkan"} Pengaturan Lanjutan (OpenRouter / Custom Base URL)
                  </Text>
                </TouchableOpacity>

                {advanced ? (
                  <View style={styles.advancedFields}>
                    <Text style={styles.inputLabel}>Custom Base URL (Opsional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Contoh: https://openrouter.ai/api/v1"
                      placeholderTextColor="#94a3b8"
                      value={baseUrl}
                      onChangeText={setBaseUrl}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />

                    <Text style={styles.inputLabel}>Model ID (Opsional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Contoh: openai/gpt-4o-mini atau mistralai/mistral-7b"
                      placeholderTextColor="#94a3b8"
                      value={model}
                      onChangeText={setModel}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Bottom Actions */}
            <View style={[styles.bottomActions, isDesktop && styles.desktopBottomActions]}>
              <TouchableOpacity
                style={[styles.testBtn, { flex: 1 }]}
                onPress={handleTestConnection}
                disabled={isTesting || isSaving}
                activeOpacity={0.8}
              >
                {isTesting ? (
                  <ActivityIndicator color="#1e40af" size="small" />
                ) : (
                  <Text style={styles.testBtnText}>🔌 Tes Koneksi</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1.2 }]}
                onPress={handleSaveCustomKey}
                disabled={isSaving || isTesting}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>💾 Simpan & Aktifkan</Text>
                )}
              </TouchableOpacity>
            </View>

            {keys[provider] ? (
              <TouchableOpacity style={styles.deleteKeyBtn} onPress={handleRemoveKey} activeOpacity={0.7}>
                <Text style={styles.deleteKeyText}>🗑️ Hapus Key Tersimpan ({provider.toUpperCase()})</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Pusat Bantuan & Kotak Surat Administrator (Digabung di Konfigurasi) */}
        <View style={styles.card}>
          <View style={styles.helpHeaderRow}>
            <View style={styles.helpIconCircle}>
              <Text style={{ fontSize: 24 }}>📬</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Pusat Bantuan & Kotak Surat</Text>
              <Text style={styles.helpSubtitle}>
                Butuh bantuan, punya saran perbaikan, kendala teknis, atau ingin melaporkan soal? Kirim surat ke Administrator Edublox dan pantau status surat serta balasannya langsung di sini.
              </Text>
            </View>
          </View>

          <View style={styles.helpActionButtons}>
            <TouchableOpacity
              style={styles.helpOpenBtn}
              onPress={() => setFeedbackVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.helpOpenBtnText}>✉️ Buka Kotak Surat & Hubungi Admin ➔</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FeedbackModal visible={feedbackVisible} onClose={() => setFeedbackVisible(false)} />

        <Modal visible={showGuide} animationType="slide" transparent onRequestClose={() => setShowGuide(false)}>
          <AIGuideModal provider={provider} onClose={() => setShowGuide(false)} />
        </Modal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { paddingBottom: 110 },
  contentWrapper: { width: "100%", maxWidth: 640, alignSelf: "center", padding: 20 },
  desktopWrapper: { maxWidth: 760, paddingVertical: 32 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  loadingText: { marginTop: 12, color: "#64748b", fontSize: 14, fontWeight: "600" },

  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#64748b", lineHeight: 20 },

  statusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
    elevation: 1,
  },
  statusHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#10b981", marginRight: 8 },
  statusTitle: { fontSize: 14, color: "#334155", fontWeight: "600" },
  bold: { fontWeight: "800", color: "#2563eb" },
  statusKeyInfo: { fontSize: 13, color: "#64748b", marginBottom: 6 },
  statusKey: { fontSize: 13, fontFamily: "monospace", color: "#0f172a", backgroundColor: "#f1f5f9", padding: 8, borderRadius: 6 },

  saveSuccessBanner: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  saveSuccessText: { color: "#166534", fontSize: 14, fontWeight: "700" },

  testResultBanner: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  testResultTesting: { backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe" },
  testResultSuccess: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#86efac" },
  testResultError: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fca5a5" },
  testResultText: { fontSize: 14, fontWeight: "600", flex: 1 },
  testSuccessText: { color: "#166534" },
  testErrorText: { color: "#991b1b" },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 14 },

  modeRow: { gap: 12 },
  desktopModeRow: { flexDirection: "row" },
  modeCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  modeCardActive: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  modeRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  modeRadioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#2563eb" },
  modeTextContainer: { flex: 1 },
  modeTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  modeSubtitle: { fontSize: 13, color: "#64748b", lineHeight: 18 },

  bulletList: { gap: 8, marginBottom: 18 },
  bulletItem: { fontSize: 14, color: "#475569", lineHeight: 20 },

  providerGrid: { flexDirection: "row", gap: 10, marginBottom: 18 },
  providerBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    position: "relative",
  },
  providerBtnActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  providerText: { fontSize: 13, fontWeight: "700", color: "#475569" },
  providerTextActive: { color: "#ffffff" },
  savedDot: { marginTop: 4, backgroundColor: "#10b981", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  savedDotText: { color: "#ffffff", fontSize: 10, fontWeight: "800" },

  inputGroup: { marginBottom: 12 },
  inputLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  inputLabel: { fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 },
  guideLink: { fontSize: 12, color: "#2563eb", fontWeight: "600", textDecorationLine: "underline" },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 8,
  },

  actionRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  pasteBtn: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  pasteBtnText: { fontSize: 13, fontWeight: "600", color: "#334155" },
  clearBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  clearBtnText: { fontSize: 13, color: "#ef4444", fontWeight: "600" },

  advancedContainer: { marginBottom: 18, borderTopWidth: 1, borderColor: "#e2e8f0", paddingTop: 14 },
  advancedToggle: { paddingVertical: 6 },
  advancedToggleText: { fontSize: 13, fontWeight: "700", color: "#2563eb" },
  advancedFields: { marginTop: 12, gap: 4 },

  bottomActions: { gap: 10, marginTop: 8 },
  desktopBottomActions: { flexDirection: "row" },
  testBtn: {
    backgroundColor: "#eff6ff",
    borderWidth: 1.5,
    borderColor: "#bfdbfe",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  testBtnText: { color: "#1e40af", fontSize: 14, fontWeight: "700" },
  saveBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },

  deleteKeyBtn: { marginTop: 14, paddingVertical: 8, alignItems: "center" },
  deleteKeyText: { color: "#ef4444", fontSize: 13, fontWeight: "600", textDecorationLine: "underline" },

  helpHeaderRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  helpIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  helpSubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
    marginTop: 4,
  },
  helpActionButtons: {
    marginTop: 6,
  },
  helpOpenBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  helpOpenBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default AIKeyInputScreen;
