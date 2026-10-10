import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../src/constants/theme';
import { MedicineCard } from '../../src/components/medicines/MedicineCard';
import { Medicine } from '../../src/models/medicine';
import { getMedicines, deleteMedicine } from '../../src/services/medicineService';
import { supabase } from '../../lib/supabase';

export default function MedicinesScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }
      
      const data = await getMedicines();
      setMedicines(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load your medicines. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Medicine',
      'Delete this medicine?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteMedicine(id);
              await loadMedicines();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Unable to delete this medicine. Please try again.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEdit = (id: string) => {
    router.push(`/(main)/edit-medicine?id=${id}` as any);
  };

  const renderMedicine = ({ item }: { item: Medicine }) => (
    <View style={styles.medicineItemWrapper}>
      <MedicineCard medicine={item} />
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleEdit(item.id)}
        >
          <Ionicons name="pencil-outline" size={20} color={Colors.light.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
          <Text style={[styles.actionText, { color: Colors.light.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading && medicines.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.light.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMedicines}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (medicines.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="medical-outline" size={64} color={Colors.light.border} />
          <Text style={styles.emptyText}>No medicines added yet.</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(main)/add-medicine' as any)}
          >
            <Text style={styles.addButtonText}>Add Medicine</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={medicines}
        keyExtractor={(item) => item.id}
        renderItem={renderMedicine}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Medicines</Text>
          {medicines.length > 0 && (
            <TouchableOpacity 
              style={styles.headerAddButton}
              onPress={() => router.push('/(main)/add-medicine' as any)}
            >
              <Ionicons name="add" size={24} color={Colors.light.surface} />
            </TouchableOpacity>
          )}
        </View>
        {renderContent()}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.primary,
  },
  headerAddButton: {
    backgroundColor: Colors.light.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.light.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  errorText: {
    ...Typography.body1,
    color: Colors.light.error,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  retryText: {
    ...Typography.button,
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    ...Typography.button,
    color: Colors.light.surface,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing.xxl,
  },
  medicineItemWrapper: {
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -Spacing.sm, // pull up slightly
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginLeft: Spacing.md,
  },
  deleteButton: {
  },
  actionText: {
    ...Typography.label,
    color: Colors.light.primary,
    marginLeft: 4,
  }
});
