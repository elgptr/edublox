import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, } from 'react-native';
export const SetupScreen = ({ onSetupComplete }) => {
    const [gradeLevel, setGradeLevel] = useState(1);
    const [semester, setSemester] = useState('I');
    const [bookName, setBookName] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState('10');
    const [questionType, setQuestionType] = useState('multiple-choice');
    const [mode, setMode] = useState('training');
    const handleSubmit = () => {
        if (!bookName.trim()) {
            Alert.alert('Error', 'Please enter book name');
            return;
        }
        const num = parseInt(numberOfQuestions, 10);
        if (isNaN(num) || num < 1 || num > 100) {
            Alert.alert('Error', 'Questions: 1-100');
            return;
        }
        onSetupComplete({
            gradeLevel,
            semester,
            bookName,
            numberOfQuestions: num,
            questionType,
            mode,
            createdAt: new Date(),
        });
    };
    return (_jsxs(ScrollView, { style: styles.container, children: [_jsx(Text, { style: styles.title, children: "Setup Exam" }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.label, children: "Grade Level" }), _jsx(View, { style: styles.options, children: [1, 2, 3, 4, 5, 6].map((g) => (_jsx(TouchableOpacity, { style: [styles.btn, gradeLevel === g && styles.btnActive], onPress: () => setGradeLevel(g), children: _jsx(Text, { style: [styles.btnText, gradeLevel === g && styles.btnTextActive], children: g }) }, g))) })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.label, children: "Semester" }), _jsx(View, { style: styles.options, children: ['I', 'II'].map((s) => (_jsx(TouchableOpacity, { style: [styles.btn, semester === s && styles.btnActive], onPress: () => setSemester(s), children: _jsx(Text, { style: [styles.btnText, semester === s && styles.btnTextActive], children: s }) }, s))) })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.label, children: "Book/Subject" }), _jsx(TextInput, { style: styles.input, placeholder: "e.g., Matematika", value: bookName, onChangeText: setBookName })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.label, children: "Questions Count" }), _jsx(TextInput, { style: styles.input, placeholder: "1-100", value: numberOfQuestions, onChangeText: setNumberOfQuestions, keyboardType: "number-pad" })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.label, children: "Type" }), _jsx(View, { style: styles.options, children: ['multiple-choice', 'essay', 'mixed'].map((t) => (_jsx(TouchableOpacity, { style: [styles.btn, questionType === t && styles.btnActive], onPress: () => setQuestionType(t), children: _jsx(Text, { style: [styles.btnText, questionType === t && styles.btnTextActive], children: t === 'multiple-choice' ? 'MC' : t === 'essay' ? 'Essay' : 'Mixed' }) }, t))) })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.label, children: "Mode" }), _jsx(View, { style: styles.options, children: ['training', 'tryout'].map((m) => (_jsx(TouchableOpacity, { style: [styles.btn, mode === m && styles.btnActive], onPress: () => setMode(m), children: _jsx(Text, { style: [styles.btnText, mode === m && styles.btnTextActive], children: m === 'training' ? 'Training' : 'Try Out' }) }, m))) })] }), _jsx(TouchableOpacity, { style: styles.submitBtn, onPress: handleSubmit, children: _jsx(Text, { style: styles.submitBtnText, children: "Generate Questions" }) })] }));
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#333' },
    section: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    btn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
    btnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    btnText: { color: '#333', fontSize: 12 },
    btnTextActive: { color: '#fff' },
    submitBtn: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 32 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
//# sourceMappingURL=SetupScreen.js.map