import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, } from 'react-native';
export const QuestionScreen = ({ questions, mode, onComplete, }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);
    const [showExplanation, setShowExplanation] = useState(false);
    const currentQuestion = questions[currentIndex];
    const currentAnswer = userAnswers.find((a) => a.questionId === currentQuestion.id);
    const handleSelectAnswer = (optionId) => {
        const newAnswer = {
            questionId: currentQuestion.id,
            selectedOption: optionId,
            answeredAt: new Date(),
        };
        setUserAnswers((prev) => {
            const filtered = prev.filter((a) => a.questionId !== currentQuestion.id);
            return [...filtered, newAnswer];
        });
        if (mode === 'training') {
            setShowExplanation(true);
        }
    };
    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowExplanation(false);
        }
        else {
            onComplete(userAnswers);
        }
    };
    const isAnswered = !!currentAnswer;
    return (_jsxs(ScrollView, { style: styles.container, children: [_jsxs(View, { style: styles.progress, children: [_jsxs(Text, { style: styles.progressText, children: ["Question ", currentIndex + 1, " of ", questions.length] }), _jsx(View, { style: styles.progressBar, children: _jsx(View, { style: [
                                styles.progressFill,
                                { width: `${((currentIndex + 1) / questions.length) * 100}%` },
                            ] }) })] }), _jsx(Text, { style: styles.questionText, children: currentQuestion.text }), currentQuestion.type === 'multiple-choice' ? (_jsx(View, { style: styles.options, children: currentQuestion.options?.map((opt) => (_jsx(TouchableOpacity, { style: [
                        styles.option,
                        currentAnswer?.selectedOption === opt.id && styles.optionSelected,
                    ], onPress: () => handleSelectAnswer(opt.id), children: _jsx(Text, { style: styles.optionText, children: opt.text }) }, opt.id))) })) : (_jsxs(View, { style: styles.essayContainer, children: [_jsx(Text, { style: styles.essayLabel, children: "Your Answer:" }), _jsx(Text, { style: styles.essayPlaceholder, children: "Essay mode - answer will be displayed here" })] })), showExplanation && mode === 'training' && (_jsxs(View, { style: styles.explanation, children: [_jsx(Text, { style: styles.explanationTitle, children: "Explanation:" }), _jsx(Text, { style: styles.explanationText, children: currentQuestion.explanation })] })), _jsx(TouchableOpacity, { style: [styles.button, !isAnswered && styles.buttonDisabled], onPress: handleNext, disabled: !isAnswered, children: _jsx(Text, { style: styles.buttonText, children: currentIndex === questions.length - 1 ? 'Complete' : 'Next' }) })] }));
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    progress: { marginBottom: 24 },
    progressText: { fontSize: 14, color: '#666', marginBottom: 8 },
    progressBar: { backgroundColor: '#ddd', height: 8, borderRadius: 4, overflow: 'hidden' },
    progressFill: { backgroundColor: '#2563eb', height: '100%' },
    questionText: { fontSize: 18, fontWeight: '600', marginBottom: 24, color: '#333' },
    options: { gap: 12, marginBottom: 24 },
    option: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
    },
    optionSelected: { borderColor: '#2563eb', backgroundColor: '#e0e7ff' },
    optionText: { fontSize: 14, color: '#333' },
    essayContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 24 },
    essayLabel: { fontWeight: '600', marginBottom: 8, color: '#333' },
    essayPlaceholder: { color: '#999' },
    explanation: {
        backgroundColor: '#f0fdf4',
        borderLeftWidth: 4,
        borderLeftColor: '#22c55e',
        padding: 16,
        marginBottom: 24,
        borderRadius: 8,
    },
    explanationTitle: { fontWeight: '600', color: '#166534', marginBottom: 8 },
    explanationText: { color: '#15803d', fontSize: 14, lineHeight: 20 },
    button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 32 },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
//# sourceMappingURL=QuestionScreen.js.map