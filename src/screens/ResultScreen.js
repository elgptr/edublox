import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, } from 'react-native';
export const ResultScreen = ({ result, onRetry, onHome, }) => {
    const percentage = ((result.correctAnswers / result.totalQuestions) * 100).toFixed(1);
    const passed = result.correctAnswers >= result.totalQuestions * 0.7;
    return (_jsxs(ScrollView, { style: styles.container, children: [_jsxs(View, { style: [styles.scoreCard, passed ? styles.scoreCardPass : styles.scoreCardFail], children: [_jsxs(Text, { style: styles.scoreText, children: [percentage, "%"] }), _jsx(Text, { style: styles.scoreLabel, children: passed ? 'PASSED' : 'FAILED' }), _jsxs(Text, { style: styles.scoreDetail, children: [result.correctAnswers, " of ", result.totalQuestions, " correct"] })] }), _jsxs(View, { style: styles.statsContainer, children: [_jsxs(View, { style: styles.statBox, children: [_jsx(Text, { style: styles.statLabel, children: "Time Spent" }), _jsxs(Text, { style: styles.statValue, children: [Math.floor(result.timeSpentSeconds / 60), "m"] })] }), _jsxs(View, { style: styles.statBox, children: [_jsx(Text, { style: styles.statLabel, children: "Mode" }), _jsx(Text, { style: styles.statValue, children: result.mode === 'training' ? 'Training' : 'Try Out' })] }), _jsxs(View, { style: styles.statBox, children: [_jsx(Text, { style: styles.statLabel, children: "Difficulty" }), _jsx(Text, { style: styles.statValue, children: "Mixed" })] })] }), _jsxs(View, { style: styles.section, children: [_jsx(Text, { style: styles.sectionTitle, children: "Review Answers" }), result.questions.map((q, i) => {
                        const answer = result.userAnswers.find((a) => a.questionId === q.id);
                        const isCorrect = answer?.isCorrect;
                        return (_jsxs(View, { style: styles.reviewItem, children: [_jsxs(View, { style: [
                                        styles.reviewHeader,
                                        isCorrect ? styles.correctHeader : styles.incorrectHeader,
                                    ], children: [_jsxs(Text, { style: styles.reviewNumber, children: ["Q", i + 1] }), _jsx(Text, { style: styles.reviewStatus, children: isCorrect ? '✓' : '✗' })] }), _jsx(Text, { style: styles.reviewQuestion, children: q.text }), _jsxs(Text, { style: styles.reviewAnswer, children: ["Your answer: ", answer?.selectedOption] })] }, q.id));
                    })] }), _jsxs(View, { style: styles.actions, children: [_jsx(TouchableOpacity, { style: styles.button, onPress: onRetry, children: _jsx(Text, { style: styles.buttonText, children: "Retry" }) }), _jsx(TouchableOpacity, { style: [styles.button, styles.buttonSecondary], onPress: onHome, children: _jsx(Text, { style: styles.buttonTextSecondary, children: "Home" }) })] })] }));
};
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
    scoreCard: { borderRadius: 12, padding: 24, marginBottom: 24, alignItems: 'center' },
    scoreCardPass: { backgroundColor: '#dcfce7' },
    scoreCardFail: { backgroundColor: '#fee2e2' },
    scoreText: { fontSize: 48, fontWeight: 'bold', marginBottom: 8 },
    scoreLabel: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
    scoreDetail: { fontSize: 14, opacity: 0.8 },
    statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statBox: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center' },
    statLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
    statValue: { fontSize: 18, fontWeight: '600', color: '#333' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
    reviewItem: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
    reviewHeader: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    correctHeader: { backgroundColor: '#dcfce7' },
    incorrectHeader: { backgroundColor: '#fee2e2' },
    reviewNumber: { fontWeight: '600' },
    reviewStatus: { fontSize: 18, fontWeight: 'bold' },
    reviewQuestion: { padding: 12, fontSize: 14, color: '#333' },
    reviewAnswer: { padding: 12, fontSize: 12, color: '#666', backgroundColor: '#f9f9f9' },
    actions: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    button: { flex: 1, backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
    buttonSecondary: { backgroundColor: '#e5e7eb' },
    buttonText: { color: '#fff', fontWeight: '600' },
    buttonTextSecondary: { color: '#333', fontWeight: '600' },
});
//# sourceMappingURL=ResultScreen.js.map