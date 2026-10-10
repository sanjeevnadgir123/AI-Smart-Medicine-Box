import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import * as IntentLauncher from 'expo-intent-launcher';

import { supabase } from '../lib/supabase';
import { AppTextInput } from '../src/components/common/AppTextInput';
import { AppButton } from '../src/components/common/AppButton';
import { Colors, Spacing, Typography } from '../src/constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    let isValid = true;
    const newErrors: typeof errors = {};

    if (!name) {
      newErrors.name = 'Full name is required';
      isValid = false;
    }

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
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    setAuthError('');
    if (validate()) {
      setLoading(true);
      
      const redirectUrl = 'ai-smart-medicine-box://auth/callback';
      if (__DEV__) {
        console.log('[Auth] Generated redirect URL for signup:', redirectUrl);
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) {
        let errorMsg = 'An error occurred during registration.';
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          errorMsg = 'An account with this email already exists.';
        } else if (error.message.includes('Password should be at least')) {
          errorMsg = 'Password must be at least 6 characters.';
        } else if (error.message.includes('Network')) {
          errorMsg = 'Unable to connect. Please check your internet connection.';
        } else {
           errorMsg = error.message;
        }
        setAuthError(errorMsg);
        setLoading(false);
        return;
      }

      if (data.session) {
        // If somehow they don't have email confirmation enabled
        router.replace('/(main)/dashboard');
      } else {
        // The expected flow: email confirmation is required
        setIsSuccess(true);
        setLoading(false);
      }
    }
  };


  const openEmailApp = async () => {
    try {
      if (Platform.OS === 'ios') {
        const canOpen = await Linking.canOpenURL('message://');
        if (canOpen) {
          await Linking.openURL('message://');
          return;
        }
      } else if (Platform.OS === 'android') {
        try {
          // Robust Android email intent using intent-launcher
          await IntentLauncher.startActivityAsync(
            'android.intent.action.MAIN',
            { category: 'android.intent.category.APP_EMAIL' }
          );
          return;
        } catch {
          // Fallback to mailto if intent launcher fails
        }
      }
      
      const canOpenMailto = await Linking.canOpenURL('mailto:');
      if (canOpenMailto) {
        await Linking.openURL('mailto:');
        return;
      }

      setAuthError('Please open your email application and confirm your email address.');
    } catch {
      setAuthError('Please open your email application and confirm your email address.');
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.successContainer]}>
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.title}>Account Created Successfully</Text>
          <Text style={styles.successMessage}>
            Your account has been created. Please check your email and confirm your email address before logging in.
          </Text>
          
          {authError ? <Text style={styles.authErrorText}>{authError}</Text> : null}
          
          <View style={styles.buttonContainer}>
             <AppButton title="Go to Email" onPress={openEmailApp} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>Let&apos;s get started with smarter medication management.</Text>
          </View>

          <View style={styles.form}>
            <AppTextInput
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              error={errors.name}
            />

            <AppTextInput
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
            />

            <AppTextInput
              label="Password"
              placeholder="Create a password"
              isPassword
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
            />

            <AppTextInput
              label="Confirm Password"
              placeholder="Confirm your password"
              isPassword
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
              }}
              error={errors.confirmPassword}
            />

            {authError ? <Text style={styles.authErrorText}>{authError}</Text> : null}

            <View style={styles.buttonContainer}>
              <AppButton title="CREATE ACCOUNT" onPress={handleRegister} loading={loading} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Text
                style={styles.footerLink}
                onPress={() => router.back()}
              >
                Login
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
  successContainer: {
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.light.textMuted,
  },
  successMessage: {
    ...Typography.body1,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
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
    width: '100%',
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
  icon: {
    fontSize: 64,
    color: Colors.light.primary,
    marginBottom: Spacing.xxl,
  },
});
