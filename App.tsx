import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider } from './src/hooks/useTheme';
import { AppNavigator } from './src/navigation';
import { SplashScreen } from './src/screens/SplashScreen';
import { useIssueStore } from './src/store/issueStore';
import { useCustomFonts } from './src/hooks/useFonts';

export default function App() {
  const fontsLoaded = useCustomFonts();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Initialize network listener on app start
    useIssueStore.getState().initNetworkListener();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
