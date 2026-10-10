import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router, useGlobalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { globalLatestAuthUrl } from '../_layout';
import { supabase } from '../../lib/supabase';
import { AppButton } from '../../components/AppButton';
import { Colors, Spacing, Typography } from '../../constants/theme';

const safeLogUrl = (urlStr: string | null, source: string) => {
  if (!__DEV__) return;
  console.log(`\n[Auth Diagnostics] CALLBACK RECEIVED from: ${source}`);
  if (!urlStr) {
    console.log(`- URL is null or undefined.`);
    return;
  }
  try {
    const parsed = Linking.parse(urlStr);
    console.log(`- scheme:`, parsed.scheme);
    console.log(`- hostname:`, parsed.hostname);
    console.log(`- path:`, parsed.path);
    console.log(`- query params:`, parsed.queryParams ? Object.keys(parsed.queryParams) : 'none');
    
    // safe hash logging without revealing values
    console.log(`- has code:`, urlStr.includes('code='));
    console.log(`- has token_hash:`, urlStr.includes('token_hash='));
    console.log(`- has access_token:`, urlStr.includes('access_token='));
    console.log(`- has refresh_token:`, urlStr.includes('refresh_token='));
    console.log(`- has type:`, urlStr.includes('type='));
    console.log(`- has error:`, urlStr.includes('error='));
    console.log(`- has error_code:`, urlStr.includes('error_code='));
  } catch {
    console.log(`- Failed to parse URL.`);
  }
  console.log('\n');
};

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const processedRef = useRef(false);
  
  const url = Linking.useURL();
  const params = useGlobalSearchParams();

  // Failsafe timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading' && !processedRef.current) {
        if (__DEV__) console.log('[Auth Diagnostics] Failsafe timeout reached. No valid URL processed.');
        setStatus('error');
        const fallbackUrl = globalLatestAuthUrl || url || '<null>';
        setErrorMessage(`Verification timed out. URL received: ${fallbackUrl}\n\nPlease request a new link.`);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [status, url]);

  const handleUrl = useCallback(async (urlString: string | null, searchParams?: any) => {
    if (processedRef.current) return;
    
    if (__DEV__) {
      console.log(`[Auth Diagnostics] handleUrl invoked.`);
      if (searchParams) console.log(`[Auth Diagnostics] Search params keys:`, Object.keys(searchParams));
    }

    try {
      let code: string | null = null;
      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      let tokenHash: string | null = null;
      let type: string | null = null;
      let authError: string | null = null;
      let authErrorDescription: string | null = null;

      // 1. Try to extract from string
      if (urlString) {
        const codeMatch = urlString.match(/[?&#]code=([^&]+)/);
        if (codeMatch) code = codeMatch[1];

        const accessMatch = urlString.match(/[?&#]access_token=([^&]+)/);
        if (accessMatch) accessToken = accessMatch[1];

        const refreshMatch = urlString.match(/[?&#]refresh_token=([^&]+)/);
        if (refreshMatch) refreshToken = refreshMatch[1];

        const tokenHashMatch = urlString.match(/[?&#]token_hash=([^&]+)/);
        if (tokenHashMatch) tokenHash = tokenHashMatch[1];

        const typeMatch = urlString.match(/[?&#]type=([^&]+)/);
        if (typeMatch) type = typeMatch[1];
        
        const errMatch = urlString.match(/[?&#]error=([^&]+)/);
        if (errMatch) authError = errMatch[1];
        
        const errDescMatch = urlString.match(/[?&#]error_description=([^&]+)/);
        if (errDescMatch) authErrorDescription = decodeURIComponent(errDescMatch[1].replace(/\+/g, '%20'));
      }

      // 2. Fallback to Expo Router params if regex missed it
      if (!code && searchParams?.code) code = searchParams.code as string;
      if (!tokenHash && searchParams?.token_hash) tokenHash = searchParams.token_hash as string;
      if (!type && searchParams?.type) type = searchParams.type as string;
      if (!authError && searchParams?.error) authError = searchParams.error as string;
      if (!authErrorDescription && searchParams?.error_description) authErrorDescription = searchParams.error_description as string;

      if (__DEV__) {
        console.log('[Auth Diagnostics] Extracted params summary:', {
          hasCode: !!code,
          hasAccessToken: !!accessToken,
          hasTokenHash: !!tokenHash,
          type: type || 'none',
          hasError: !!authError
        });
      }

      // If we don't have any identifiable auth parameters, we don't process yet, 
      // but we shouldn't block forever if it's genuinely empty.
      if (!code && !tokenHash && !accessToken && !authError) {
         if (__DEV__) console.log('[Auth Diagnostics] No actionable tokens found yet. Waiting for other listeners or timeout.');
         return; // Let the timeout or another listener catch it
      }

      // We have actionable data, lock the processor
      processedRef.current = true;
      setStatus('loading');
      
      // FORMAT 4: Explicit Error from Supabase
      if (authError) {
         if (__DEV__) console.log('[Auth Diagnostics] Supabase returned an explicit error in the URL.');
         setStatus('error');
         setErrorMessage(authErrorDescription || 'Authentication failed. Please try again.');
         return;
      }

      // FORMAT 2 & Supabase OTP Flow
      if (tokenHash && (type === 'email' || type === 'signup')) {
        if (__DEV__) console.log('[Auth Diagnostics] Exchange type: OTP/Token Hash');
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: (type === 'email' || type === 'signup') ? type : 'email'
        });
        
        if (error) {
          if (__DEV__) console.log('[Auth Diagnostics] Supabase verifyOtp error:', error.message);
          setStatus('error');
          setErrorMessage('Verification link has expired or is invalid. Please request a new verification email.');
        } else {
          if (__DEV__) console.log('[Auth Diagnostics] verifyOtp Success!');
          setStatus('success');
        }
        return;
      } 
      
      // FORMAT 1: PKCE Flow
      if (code) {
        if (__DEV__) console.log('[Auth Diagnostics] Exchange type: Authorization Code');
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          if (__DEV__) console.log('[Auth Diagnostics] Supabase exchangeCodeForSession error:', error.message);
          setStatus('error');
          setErrorMessage('Verification link has expired or is invalid. Please request a new verification email.');
        } else {
          if (__DEV__) console.log('[Auth Diagnostics] exchangeCodeForSession Success!');
          setStatus('success');
        }
        return;
      } 
      
      // FORMAT 3: Implicit Flow
      if (accessToken && refreshToken) {
        if (__DEV__) console.log('[Auth Diagnostics] Exchange type: Access/Refresh Tokens');
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          if (__DEV__) console.log('[Auth Diagnostics] Supabase setSession error:', error.message);
          setStatus('error');
          setErrorMessage('Verification link has expired or is invalid.');
        } else {
          if (__DEV__) console.log('[Auth Diagnostics] setSession Success!');
          setStatus('success');
        }
        return;
      }
      
    } catch {
      if (__DEV__) console.log('[Auth Diagnostics] Exception thrown during callback processing.');
      processedRef.current = true;
      setStatus('error');
      setErrorMessage('Verification link expired or invalid.');
    }
  }, []);

  useEffect(() => {
    // Attempt 1: Listen for incoming links natively
    const subscription = Linking.addEventListener('url', (event) => {
      safeLogUrl(event.url, 'addEventListener');
      handleUrl(event.url, params);
    });

    // Attempt 2: Initial URL on cold start natively
    Linking.getInitialURL().then((initialUrl) => {
      safeLogUrl(initialUrl, 'getInitialURL');
      
      // Merge with the absolute global backup from _layout
      const targetUrl = initialUrl || globalLatestAuthUrl;
      if (globalLatestAuthUrl) {
         safeLogUrl(globalLatestAuthUrl, 'globalLatestAuthUrl');
      }
      handleUrl(targetUrl, params);
    });

    return () => {
      subscription.remove();
    };
  }, [handleUrl, params]);

  // Attempt 3: useURL hook (Expo Router integration)
  useEffect(() => {
    safeLogUrl(url, 'useURL');
    const targetUrl = url || globalLatestAuthUrl;
    handleUrl(targetUrl, params);
  }, [url, params, handleUrl]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.icon}>💊</Text>
        
        {status === 'loading' ? (
          <>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.message}>Verifying your email...</Text>
          </>
        ) : status === 'success' ? (
          <>
            <Text style={styles.title}>✓ Email Confirmed</Text>
            <Text style={styles.message}>
              Your email has been successfully verified. You can now log in to your account.
            </Text>
            <View style={styles.buttonContainer}>
              <AppButton 
                title="Go to Login" 
                onPress={() => router.replace('/login')} 
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Text style={styles.message}>Please request a new verification email and try again.</Text>
            <View style={styles.buttonContainer}>
              <AppButton 
                title="Back to Login" 
                onPress={() => router.replace('/login')} 
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    color: Colors.light.primary,
    marginBottom: Spacing.xxl,
  },
  title: {
    ...Typography.h2,
    color: Colors.light.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    ...Typography.body1,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  errorText: {
    ...Typography.body1,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: Spacing.md,
  },
});
