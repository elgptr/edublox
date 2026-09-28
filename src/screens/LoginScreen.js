import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import firebaseService from '@services/firebaseService';
import firestoreService from '@services/firestoreService';
export const LoginScreen = ({ onLoginSuccess }) => {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const validate = () => {
        if (!email.trim() || !password.trim()) {
            setError('Email dan password harus diisi');
            return false;
        }
        if (mode === 'signup' && !displayName.trim()) {
            setError('Nama harus diisi');
            return false;
        }
        return password.length >= 6 || (setError('Password min 6 char'), false);
    };
    const handleLogin = async () => {
        if (!validate())
            return;
        setLoading(true);
        setError('');
        try {
            const result = await firebaseService.login(email, password);
            onLoginSuccess(result.user.uid);
        }
        catch (err) {
            setError(err.message || 'Login gagal');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSignup = async () => {
        if (!validate())
            return;
        setLoading(true);
        setError('');
        try {
            const result = await firebaseService.signup(email, password);
            await firestoreService.createUserProfile(result.user.uid, email, displayName);
            Alert.alert('Sukses', 'Akun dibuat, silakan login');
            setMode('login');
            [setEmail, setPassword, setDisplayName].forEach(f => f(''));
        }
        catch (err) {
            setError(err.message || 'Signup gagal');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(ScrollView, { style: styles.container, children: _jsxs(View, { style: styles.inner, children: [_jsx(Text, { style: styles.title, children: "Edublox" }), _jsx(Text, { style: styles.sub, children: "Belajar Try Out & Training" }), _jsxs(View, { style: styles.tabs, children: [_jsx(Tab, { active: mode === 'login', label: "Login", onPress: () => setMode('login') }), _jsx(Tab, { active: mode === 'signup', label: "Sign Up", onPress: () => setMode('signup') })] }), _jsxs(View, { style: styles.form, children: [mode === 'signup' && (_jsx(TextInput, { style: styles.input, placeholder: "Nama Lengkap", value: displayName, onChangeText: setDisplayName, editable: !loading })), _jsx(TextInput, { style: styles.input, placeholder: "Email", value: email, onChangeText: setEmail, keyboardType: "email-address", autoCapitalize: "none", editable: !loading }), _jsx(TextInput, { style: styles.input, placeholder: "Password", value: password, onChangeText: setPassword, secureTextEntry: true, autoCapitalize: "none", editable: !loading }), error && _jsx(Text, { style: styles.error, children: error }), _jsx(TouchableOpacity, { style: [styles.btn, loading && styles.btnDis], onPress: mode === 'login' ? handleLogin : handleSignup, disabled: loading, children: _jsx(Text, { style: styles.btnText, children: loading ? '...' : mode === 'login' ? 'Login' : 'Daftar' }) }), _jsxs(Text, { style: styles.foot, children: [mode === 'login' ? 'Belum akun? ' : 'Sudah akun? ', _jsx(Text, { style: styles.link, onPress: () => setMode(mode === 'login' ? 'signup' : 'login'), children: mode === 'login' ? 'Daftar' : 'Login' })] })] })] }) }));
};
const Tab = ({ active, label, onPress }) => (_jsx(TouchableOpacity, { style: [styles.tab, active && styles.tabAct], onPress: onPress, children: _jsx(Text, { style: [styles.tabTxt, active && styles.tabTxtAct], children: label }) }));
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    inner: { padding: 20, paddingTop: 40 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', textAlign: 'center', marginBottom: 8 },
    sub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32 },
    tabs: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    tab: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    tabAct: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    tabTxt: { color: '#666', fontSize: 14, fontWeight: '600' },
    tabTxtAct: { color: '#fff' },
    form: { gap: 16 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
    btn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    btnDis: { opacity: 0.5 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
    foot: { color: '#666', fontSize: 14, textAlign: 'center' },
    link: { color: '#2563eb', fontWeight: '600' },
});
//# sourceMappingURL=LoginScreen.js.map