import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

export const useCustomFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'SpaceGrotesk-Regular': require('../../assets/fonts/SpaceGrotesk-Regular.ttf'),
          'SpaceGrotesk-Medium': require('../../assets/fonts/SpaceGrotesk-Medium.ttf'),
          'SpaceGrotesk-Bold': require('../../assets/fonts/SpaceGrotesk-Bold.ttf'),
          'Satoshi-Regular': require('../../assets/fonts/Satoshi-Regular.otf'),
          'Satoshi-Medium': require('../../assets/fonts/Satoshi-Medium.otf'),
          'Satoshi-Bold': require('../../assets/fonts/Satoshi-Bold.otf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Continue anyway with system fonts
      }
    }

    loadFonts();
  }, []);

  return fontsLoaded;
};
