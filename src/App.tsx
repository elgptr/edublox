import React from 'react';
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
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Setup" component={SetupScreen} />
            <Stack.Screen name="AIKeyInput" component={AIKeyInputScreen} />
            <Stack.Screen name="Question" component={QuestionScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

