import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Auth Hook
import { useAuth } from './hooks/useAuth';

// Screens
import { LoginScreen } from './screens/LoginScreen';
import { SetupScreen } from './screens/SetupScreen';
import { AIKeyInputScreen } from './screens/AIKeyInputScreen';
import { QuestionScreen } from './screens/QuestionScreen';
import { ResultScreen } from './screens/ResultScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { AdminScreen } from './screens/AdminScreen';

// Modals
import { FeedbackModal } from './components/FeedbackModal';

// Icons
import { Ionicons } from '@expo/vector-icons';

// Injeksi perbaikan viewport mobile web agar tidak terpotong toolbar browser & layout selalu presisi
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'edublox-mobile-viewport-fix';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      html, body {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        width: 100% !important;
        background-color: #f8fafc !important;
      }
      #root {
        display: flex !important;
        flex-direction: column !important;
        height: 100% !important;
        max-height: 100% !important;
        width: 100% !important;
        overflow: hidden !important;
      }
      #root > div {
        display: flex !important;
        flex: 1 1 0% !important;
        flex-direction: column !important;
        height: 100% !important;
        max-height: 100% !important;
        min-height: 0 !important;
        overflow: hidden !important;
        width: 100% !important;
      }
    `;
    document.head.appendChild(style);
  }
  const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  if (meta) {
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover';
  }
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Desktop Modern Navigation Bar
function DesktopHeader({ navigation, route }: any) {
  const { currentUser, logout, isAdmin } = useAuth();
  const currentRoute = route?.name || 'Try Out';
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  return (
    <>
      <View style={headerStyles.container}>
        <View style={headerStyles.inner}>
          {/* Brand Logo */}
          <TouchableOpacity style={headerStyles.brandContainer} onPress={() => navigation.navigate('Try Out')} activeOpacity={0.8}>
            <Text style={headerStyles.brandTitle}>EDUNESIS</Text>
            <View style={headerStyles.aiBadge}>
              <Text style={headerStyles.aiBadgeText}>AI 2.0</Text>
            </View>
          </TouchableOpacity>

          {/* Desktop Nav Items */}
          <View style={headerStyles.navPills}>
            <TouchableOpacity
              style={[headerStyles.pill, currentRoute === 'Try Out' && headerStyles.pillActive]}
              onPress={() => navigation.navigate('Try Out')}
              activeOpacity={0.7}
            >
              <Ionicons name="book" size={17} color={currentRoute === 'Try Out' ? '#2563eb' : '#64748b'} />
              <Text style={[headerStyles.pillText, currentRoute === 'Try Out' && headerStyles.pillTextActive]}>
                Latihan Soal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[headerStyles.pill, currentRoute === 'History' && headerStyles.pillActive]}
              onPress={() => navigation.navigate('History')}
              activeOpacity={0.7}
            >
              <Ionicons name="time" size={17} color={currentRoute === 'History' ? '#2563eb' : '#64748b'} />
              <Text style={[headerStyles.pillText, currentRoute === 'History' && headerStyles.pillTextActive]}>
                Riwayat Ujian
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[headerStyles.pill, currentRoute === 'Settings' && headerStyles.pillActive]}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings" size={17} color={currentRoute === 'Settings' ? '#2563eb' : '#64748b'} />
              <Text style={[headerStyles.pillText, currentRoute === 'Settings' && headerStyles.pillTextActive]}>
                Konfigurasi & Bantuan
              </Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity
                style={[headerStyles.pill, currentRoute === 'Admin' && headerStyles.pillActive, { backgroundColor: currentRoute === 'Admin' ? '#ffffff' : '#fef2f2' }]}
                onPress={() => navigation.navigate('Admin')}
                activeOpacity={0.7}
              >
                <Ionicons name="shield-checkmark" size={17} color="#dc2626" />
                <Text style={[headerStyles.pillText, { color: '#dc2626', fontWeight: currentRoute === 'Admin' ? '800' : '700' }]}>
                  Admin Panel
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* User Info & Feedback & Logout Button */}
          <View style={headerStyles.userContainer}>
            <TouchableOpacity style={headerStyles.feedbackBtn} onPress={() => setFeedbackVisible(true)} activeOpacity={0.7}>
              <Text style={headerStyles.feedbackBtnText}>📬 Bantuan</Text>
            </TouchableOpacity>

            <View style={headerStyles.userBadge}>
              <View style={headerStyles.onlineDot} />
              <Text style={headerStyles.userEmail} numberOfLines={1}>
                {currentUser?.email || 'User'}
              </Text>
            </View>
            <TouchableOpacity style={headerStyles.logoutBtn} onPress={logout} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={16} color="#dc2626" />
              <Text style={headerStyles.logoutText}>Keluar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FeedbackModal visible={feedbackVisible} onClose={() => setFeedbackVisible(false)} />
    </>
  );
}

function MainTabs() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { isAdmin } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: isDesktop,
        header: isDesktop ? (props) => <DesktopHeader {...props} /> : undefined,
        tabBarHideOnKeyboard: true,
        tabBarStyle: isDesktop
          ? { display: 'none' }
          : {
              position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as any,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              borderTopColor: '#e2e8f0',
              borderTopWidth: 1,
              height: 68,
              paddingTop: 4,
              paddingBottom: 6,
              elevation: 20,
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.12,
              shadowRadius: 10,
              zIndex: 99999,
            },
        sceneStyle: {
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        },
        tabBarItemStyle: {
          paddingVertical: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 1,
          marginBottom: 1,
          lineHeight: 14,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Try Out') iconName = 'book';
          else if (route.name === 'History') iconName = 'time';
          else if (route.name === 'Settings') iconName = 'settings';
          else if (route.name === 'Admin') iconName = 'shield-checkmark';
          return <Ionicons name={iconName} size={21} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
      })}
    >
      <Tab.Screen name="Try Out" component={SetupScreen} options={{ title: 'Latihan' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Riwayat' }} />
      <Tab.Screen name="Settings" component={AIKeyInputScreen} options={{ title: 'Konfigurasi' }} />
      {isAdmin && (
        <Tab.Screen name="Admin" component={AdminScreen} options={{ title: 'Admin' }} />
      )}
    </Tab.Navigator>
  );
}

export default function App() {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1, width: '100%', height: '100%' }}>
      <View style={{ flex: 1, width: '100%', height: '100%', minHeight: 0, overflow: 'hidden', backgroundColor: '#f8fafc' }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
              <>
                <Stack.Screen name="Home" component={MainTabs} />
                <Stack.Screen name="Question" component={QuestionScreen} options={{ headerShown: true, title: 'Ujian Sedang Berlangsung' }} />
                <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: true, title: 'Hasil & Pembahasan Ujian' }} />
              </>
            ) : (
              <Stack.Screen name="Login" component={LoginScreen} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
  },
  inner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 1.5,
  },
  aiBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  aiBadgeText: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '800',
  },
  navPills: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#f1f5f9',
    padding: 5,
    borderRadius: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pillActive: {
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  pillTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feedbackBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  feedbackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    maxWidth: 160,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
});
