import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';

import { supabase } from '../lib/supabase';
import { AppTextInput } from '../src/components/common/AppTextInput';
import { AppButton } from '../src/components/common/AppButton';
import { Colors, Spacing, Typography } from '../src/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);

  const validate = () => {
    let isValid = true;
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    setAuthError('');
    setNeedsEmailVerification(false);
    if (validate()) {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMsg = 'An error occurred during login.';
        if (error.message.includes('Invalid login credentials')) {
          errorMsg = 'Incorrect email or password.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMsg = 'Please verify your email before logging in.';
          setNeedsEmailVerification(true);
        } else if (error.message.includes('Network')) {
          errorMsg = 'Unable to connect. Please check your internet connection.';
        } else {
           errorMsg = error.message;
        }
        setAuthError(errorMsg);
        setLoading(false);
      } else {
        router.replace('/(main)/dashboard');
      }
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setAuthError('');
    
    const redirectUrl = 'ai-smart-medicine-box://auth/callback';
    if (__DEV__) {
      console.log('[Auth] Generated redirect URL for resend:', redirectUrl);
    }
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      setAuthError('Failed to resend verification email. ' + error.message);
    } else {
      Alert.alert('Success', 'Verification email resent! Please check your inbox.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back 👋</Text>
            <Text style={styles.subtitle}>Sign in to continue managing your medicines.</Text>
          </View>

          <View style={styles.form}>
            <AppTextInput
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
                setNeedsEmailVerification(false);
              }}
              error={errors.email}
            />

            <AppTextInput
              label="Password"
              placeholder="Enter your password"
              isPassword
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
            />

            {authError ? <Text style={styles.authErrorText}>{authError}</Text> : null}

            <View style={styles.buttonContainer}>
              <AppButton title="LOGIN" onPress={handleLogin} loading={loading && !needsEmailVerification} />
              
              {needsEmailVerification && (
                <View style={{ marginTop: Spacing.md }}>
                  <AppButton 
                    title="Resend Verification Email" 
                    onPress={handleResend} 
                    loading={loading} 
                  />
                </View>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <Text
                style={styles.footerLink}
                onPress={() => router.push('/register')}
              >
                Create Account
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xxxl,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.light.textMuted,
  },
  form: {
    width: '100%',
  },
  authErrorText: {
    ...Typography.body2,
    color: Colors.light.error,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...Typography.body1,
    color: Colors.light.textMuted,
  },
  footerLink: {
    ...Typography.body1,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
