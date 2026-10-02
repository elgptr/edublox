import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';

interface AIGuideModalProps {
  provider: 'gemini' | 'openai' | 'claude';
  onClose: () => void;
}

const AIGuideModal: React.FC<AIGuideModalProps> = ({ provider, onClose }) => {
  const getGuideContent = () => {
    switch (provider) {
      case 'gemini':
        return {
          title: 'Dapatkan Google Gemini API Key Gratis 🟢',
          steps: [
            {
              number: 1,
              title: 'Buka Google AI Studio',
              description: 'Klik tombol di bawah untuk membuka halaman resmi Google AI Studio.',
              action: 'Buka Google AI Studio',
              url: 'https://aistudio.google.com/app/apikey',
            },
            {
              number: 2,
              title: 'Login & Buat API Key',
              description:
                'Login dengan akun Google Anda, lalu klik tombol "Create API Key". Pilih project baru atau yang sudah ada.',
            },
            {
              number: 3,
              title: 'Salin & Tempel di Edublox',
              description:
                'Setelah key terbuat, salin key tersebut. Kembali ke Edublox dan tempel key ke kolom input, lalu klik "Verifikasi".',
            },
          ],
          note: 'API Key Gemini gratis dan unlimited untuk generasi pertanyaan!',
        };
      case 'openai':
        return {
          title: 'Dapatkan OpenAI API Key ⚡',
          steps: [
            {
              number: 1,
              title: 'Daftar / Login ke OpenAI',
              description:
                'Buka https://platform.openai.com dan login dengan akun Anda atau buat akun baru.',
            },
            {
              number: 2,
              title: 'Buka API Keys',
              description:
                'Pergi ke menu "API keys" di settings. Klik "Create new secret key".',
            },
            {
              number: 3,
              title: 'Salin & Tempel',
              description:
                'Salin API key yang baru dibuat. Tempel di Edublox dan verifikasi.',
            },
          ],
          note: 'Perhatian: OpenAI memerlukan payment method dan memiliki biaya per API call.',
        };
      case 'claude':
        return {
          title: 'Dapatkan Anthropic Claude API Key 🤖',
          steps: [
            {
              number: 1,
              title: 'Daftar Console Anthropic',
              description: 'Buka https://console.anthropic.com dan daftar akun baru.',
            },
            {
              number: 2,
              title: 'Generate API Key',
              description:
                'Di dashboard, buka menu "API Keys" dan klik "Generate Key".',
            },
            {
              number: 3,
              title: 'Tempel di Edublox',
              description:
                'Salin key dan tempel ke form Edublox, lalu verifikasi.',
            },
          ],
          note: 'Claude adalah AI yang powerful. Setup memerlukan payment method.',
        };
      default:
        return null;
    }
  };

  const content = getGuideContent();
  if (!content) return null;

  const handleOpenURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      alert('Tidak bisa membuka browser');
    });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{content.title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {content.steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
              </View>

              <Text style={styles.stepDescription}>{step.description}</Text>

              {step.action && step.url && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleOpenURL(step.url)}
                >
                  <Text style={styles.actionButtonText}>🔗 {step.action}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View style={styles.noteCard}>
            <Text style={styles.noteIcon}>ℹ️</Text>
            <Text style={styles.noteText}>{content.note}</Text>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.closeButtonBottom} onPress={onClose}>
          <Text style={styles.closeButtonText}>Mengerti, Tutup Panduan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  stepCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  stepDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  noteCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
  },
  noteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  noteText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
    flex: 1,
  },
  closeButtonBottom: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 20,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AIGuideModal;
