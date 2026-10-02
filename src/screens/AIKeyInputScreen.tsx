import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAIKey } from "../hooks/useAIKey";
import type { AIProvider } from "../types";
import { AIService } from "../services/aiService";
import * as Clipboard from "expo-clipboard";
import AIGuideModal from "../components/AIGuideModal";
import type { RootStackParamList } from "../types";

const AIKeyInputScreen = ({ navigation, route }: any) => {
  const { keys, saveKey, saveAIConfig, activeKeyInfo, isLoading } = useAIKey();
  const [mode, setMode] = useState("system");
  const [provider, setProvider] = useState<AIProvider>("gemini");
  const [customKey, setCustomKey] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (activeKeyInfo?.isSystemDefault === false) {
      setMode("custom");
      setProvider(activeKeyInfo.provider);
      setBaseUrl(activeKeyInfo.baseUrl || "");
      setModel(activeKeyInfo.model || "");
      setAdvanced(!!activeKeyInfo.baseUrl || !!activeKeyInfo.model);
    }
  }, [activeKeyInfo]);

  const handleSaveCustomKey = async () => {
    if (!customKey.trim()) {
      Alert.alert("Error", `Enter API key`);
      return;
    }
    setIsSaving(true);
    try {
      const result = await saveKey(provider, customKey);
      if (result.success) {
        await saveAIConfig({ provider, baseUrl: advanced && provider === "openai" ? baseUrl.trim() || undefined : undefined, model: advanced && provider === "openai" ? model.trim() || undefined : undefined });
        Alert.alert("Success", "Key saved!");
        setCustomKey("");
      } else {
        Alert.alert("Error", "Key gagal disimpan. Coba lagi.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!customKey.trim()) {
      Alert.alert("Error", "Masukkan API key terlebih dahulu.");
      return;
    }
    if (advanced && provider === "openai" && !model.trim()) {
      Alert.alert("Error", "Masukkan nama model untuk mode Advanced.");
      return;
    }
    setIsTesting(true);
    try {
      const result = await AIService.testConnection(provider, customKey, {
        baseUrl: advanced && provider === "openai" ? baseUrl : undefined,
        model: advanced && provider === "openai" ? model : undefined,
      });
      Alert.alert(result.success ? "Koneksi berhasil" : "Koneksi gagal", result.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handlePasteKey = async () => {
    const value = await Clipboard.getStringAsync();
    if (!value.trim()) {
      Alert.alert("Clipboard kosong", "Salin API key terlebih dahulu.");
      return;
    }
    setCustomKey(value.trim());
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
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Pengaturan AI Key</Text>
        <Text style={styles.subtitle}>Pilih cara untuk mengakses AI</Text>
      </View>

      <View style={styles.modeCard}>
        <Text style={styles.sectionTitle}>Pilih Mode</Text>
        <TouchableOpacity
          style={[styles.modeOption, mode === "system" && styles.modeOptionActive]}
          onPress={() => setMode("system")}
        >
          <View style={styles.modeRadio}>
            {mode === "system" && <View style={styles.modeRadioInner} />}
          </View>
          <View>
            <Text style={styles.modeTitle}>🟢 Gunakan Gemini Sistem</Text>
            <Text style={styles.modeSubtitle}>Gratis & siap pakai</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeOption, mode === "custom" && styles.modeOptionActive]}
          onPress={() => setMode("custom")}
        >
          <View style={styles.modeRadio}>
            {mode === "custom" && <View style={styles.modeRadioInner} />}
          </View>
          <View>
            <Text style={styles.modeTitle}>⚙️ Gunakan API Key Sendiri</Text>
            <Text style={styles.modeSubtitle}>OpenAI, Gemini, Claude</Text>
          </View>
        </TouchableOpacity>
      </View>

      {mode === "system" && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Mengapa Gemini Sistem?</Text>
          <Text style={styles.infoText}>• Gratis{"\n"}• Setup mudah{"\n"}• Cepat</Text>
          <TouchableOpacity style={styles.learnMoreBtn} onPress={() => setShowGuide(true)}>
            <Text style={styles.learnMoreText}>📖 Panduan Setup</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === "custom" && (
        <View style={styles.customCard}>
          <Text style={styles.sectionTitle}>API Key Custom</Text>
          <Text style={styles.label}>Provider</Text>
          <View style={styles.providerGrid}>
            {(["openai", "gemini", "claude"] as AIProvider[]).map((prov) => (
              <TouchableOpacity
                key={prov}
                style={[styles.providerBtn, provider === prov && styles.providerBtnActive]}
                onPress={() => setProvider(prov)}
              >
                <Text style={[styles.providerText, provider === prov && styles.providerTextActive]}>
                  {prov === "openai" ? "⚡ OpenAI" : prov === "gemini" ? "🟢 Gemini" : "🤖 Claude"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>API Key</Text>
          <TextInput style={styles.input} placeholder="Key..." value={customKey} onChangeText={setCustomKey} secureTextEntry />
          <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteKey}>
            <Text style={styles.pasteBtnText}>📋 Paste dari Clipboard</Text>
          </TouchableOpacity>
          {provider === "openai" && (
            <>
              <TouchableOpacity style={styles.advancedToggle} onPress={() => setAdvanced(!advanced)}>
                <Text style={styles.advancedText}>{advanced ? "▾" : "▸"} Pengaturan Advanced (OpenAI-compatible)</Text>
              </TouchableOpacity>
              {advanced && (
                <>
                  <TextInput style={styles.input} placeholder="Base URL, contoh: https://openrouter.ai/api/v1" value={baseUrl} onChangeText={setBaseUrl} autoCapitalize="none" autoCorrect={false} />
                  <TextInput style={styles.input} placeholder="Nama model, contoh: openai/gpt-4o-mini" value={model} onChangeText={setModel} autoCapitalize="none" autoCorrect={false} />
                </>
              )}
            </>
          )}
          <TouchableOpacity style={styles.testBtn} onPress={handleTestConnection} disabled={isTesting || isSaving}>
            <Text style={styles.testBtnText}>{isTesting ? "Mengecek..." : "🔌 Tes Koneksi"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveCustomKey} disabled={isSaving}>
            <Text style={styles.primaryBtnText}>💾 Simpan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: "#10B981" }]} onPress={() => setShowGuide(true)}>
            <Text style={styles.primaryBtnText}>📖 Bantuan</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.continueBtnText}>← Kembali</Text>
      </TouchableOpacity>

      <Modal visible={showGuide} animationType="slide" transparent onRequestClose={() => setShowGuide(false)}>
        <AIGuideModal provider={provider} onClose={() => setShowGuide(false)} />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" },
  header: { marginTop: 20, marginBottom: 30 },
  title: { fontSize: 28, fontWeight: "bold", color: "#111827", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#6B7280" },
  modeCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, elevation: 2, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 16 },
  modeOption: { flexDirection: "row", alignItems: "flex-start", padding: 16, borderRadius: 12, backgroundColor: "#F9FAFB", marginBottom: 12, borderWidth: 2, borderColor: "#E5E7EB" },
  modeOptionActive: { borderColor: "#4F46E5", backgroundColor: "#F0F4FF" },
  modeRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#D1D5DB", marginRight: 12, justifyContent: "center", alignItems: "center", marginTop: 2 },
  modeRadioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#4F46E5" },
  modeTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  modeSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  infoCard: { backgroundColor: "#EFF6FF", borderRadius: 12, padding: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: "#3B82F6" },
  infoTitle: { fontSize: 14, fontWeight: "700", color: "#1E40AF", marginBottom: 8 },
  infoText: { fontSize: 13, color: "#1E40AF", lineHeight: 20, marginBottom: 12 },
  learnMoreBtn: { backgroundColor: "#3B82F6", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  learnMoreText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
  customCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, elevation: 2, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 10, marginTop: 12 },
  providerGrid: { flexDirection: "row", gap: 10, marginBottom: 16 },
  providerBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: "#F3F4F6", borderWidth: 2, borderColor: "#E5E7EB", alignItems: "center" },
  providerBtnActive: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  providerText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  providerTextActive: { color: "#FFFFFF" },
  input: { backgroundColor: "#F3F4F6", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: "#111827", borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 16 },
  advancedToggle: { paddingVertical: 8, marginBottom: 8 },
  advancedText: { color: "#4F46E5", fontSize: 13, fontWeight: "600" },
  testBtn: { backgroundColor: "#E0E7FF", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
  testBtnText: { color: "#3730A3", fontWeight: "700", fontSize: 14 },
  pasteBtn: { backgroundColor: "#F3F4F6", borderRadius: 8, paddingVertical: 12, alignItems: "center", marginBottom: 12 },
  pasteBtnText: { color: "#374151", fontWeight: "600", fontSize: 13 },
  primaryBtn: { backgroundColor: "#4F46E5", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
  primaryBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  continueBtn: { backgroundColor: "#4F46E5", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 40, marginTop: 24 },
  continueBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});

export default AIKeyInputScreen;
