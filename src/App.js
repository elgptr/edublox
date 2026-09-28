import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@hooks/useAuth';
import { LoginScreen } from '@screens/LoginScreen';
import { SetupScreen } from '@screens/SetupScreen';
import { AIKeyInputScreen } from '@screens/AIKeyInputScreen';
import { QuestionScreen } from '@screens/QuestionScreen';
import { ResultScreen } from '@screens/ResultScreen';
const Stack = createNativeStackNavigator();
export default function App() {
    const { isLoading, isLoggedIn } = useAuth();
    if (isLoading) {
        return _jsx(View, { style: { flex: 1, justifyContent: 'center', alignItems: 'center' }, children: _jsx(ActivityIndicator, { size: "large", color: "#2563eb" }) });
    }
    return (_jsx(NavigationContainer, { children: _jsx(Stack.Navigator, { screenOptions: { headerShown: false, animationEnabled: true }, children: isLoggedIn ? (_jsxs(_Fragment, { children: [_jsx(Stack.Screen, { name: "Setup", component: SetupScreen }), _jsx(Stack.Screen, { name: "AIKeyInput", component: AIKeyInputScreen }), _jsx(Stack.Screen, { name: "Question", component: QuestionScreen }), _jsx(Stack.Screen, { name: "Result", component: ResultScreen })] })) : (_jsx(Stack.Screen, { name: "Login", component: LoginScreen })) }) }));
}
//# sourceMappingURL=App.js.map