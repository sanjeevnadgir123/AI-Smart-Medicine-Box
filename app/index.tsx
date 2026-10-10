import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { router, usePathname } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const pathname = usePathname();

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? 'authenticated' : 'unauthenticated');
    });

    // 2. Listener for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? 'authenticated' : 'unauthenticated');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Target total splash animation duration: approximately 2.5–4 seconds.
    Animated.parallel([
      // Smooth fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Very subtle scale-up effect
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: 3500, // 3.5 seconds total animation
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimationDone(true);
    });
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (isAnimationDone && authState !== 'loading') {
      if (pathname === '/') {
        if (authState === 'authenticated') {
          router.replace('/(main)/dashboard');
        } else {
          router.replace('/login');
        }
      }
    }
  }, [isAnimationDone, authState, pathname]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/ai-assistant-medical-box-splash.png')}
        style={[
          styles.image,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
