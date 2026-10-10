import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export function AppTextInput({
  label,
  error,
  isPassword,
  containerStyle,
  ...props
}: AppTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.light.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconContainer}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color={Colors.light.icon}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.label,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.surface,
    height: 56,
  },
  inputFocused: {
    borderColor: Colors.light.primary,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    ...Typography.body1,
    color: Colors.light.text,
    height: '100%',
  },
  iconContainer: {
    paddingHorizontal: Spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
});
