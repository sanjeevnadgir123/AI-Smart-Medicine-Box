import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, SafeAreaView, AppState } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { DoseLog } from '../../src/models/dose';
import { generateTodaysDoses, getTodayDoses, markDoseTaken } from '../../src/services/doseService';
import { Ionicons } from '@expo/vector-icons';

export default function ScheduleScreen() {
  const [doses, setDoses] = useState<DoseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      setError(null);
      await generateTodaysDoses(); // generate if not exist
      const todayDoses = await getTodayDoses();
      
      // Sort chronologically
      todayDoses.sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());
      
      setDoses(todayDoses);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedule();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchSchedule();
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        fetchSchedule();
      }
    });
    return () => subscription.remove();
  }, []);

  const handleTakeMedicine = async (id: string) => {
    try {
      // Optimistic update
      setDoses(current => 
        current.map(d => d.id === id ? { ...d, status: 'taken', taken_at: new Date().toISOString() } : d)
      );
      await markDoseTaken(id);
    } catch (err: any) {
      // Revert on error
      fetchSchedule();
      alert(err.message || 'Failed to update dose');
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderDose = ({ item }: { item: DoseLog }) => {
    const isTaken = item.status === 'taken';
    const isMissed = item.status === 'missed';

    let statusColor = Colors.light.primary;
    if (isTaken) statusColor = '#4CAF50';
    if (isMissed) statusColor = '#F44336';

    return (
      <View style={[styles.doseCard, isTaken && styles.doseCardTaken]}>
        <View style={styles.doseHeader}>
          <Text style={styles.timeText}>{formatTime(item.scheduled_time)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.doseBody}>
          <Text style={styles.medicineName}>{item.medicine?.name || 'Unknown Medicine'}</Text>
          <Text style={styles.medicineDetails}>
            {item.medicine?.dose} • Compartment {item.compartment || item.medicine?.compartment}
          </Text>
          
          {isTaken && item.taken_at && (
            <Text style={styles.takenAtText}>
              Taken at {formatTime(item.taken_at)}
            </Text>
          )}
        </View>

        {item.status === 'pending' && (
          <TouchableOpacity 
            style={styles.takeButton} 
            onPress={() => handleTakeMedicine(item.id)}
          >
            <Text style={styles.takeButtonText}>TAKE MEDICINE</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchSchedule}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Schedule</Text>
      </View>
      
      <FlatList
        data={doses}
        keyExtractor={item => item.id}
        renderItem={renderDose}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.light.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={Colors.light.textMuted} />
            <Text style={styles.emptyTitle}>No medicines scheduled for today.</Text>
            <Text style={styles.emptySubtitle}>Your daily schedule will appear here.</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/(main)/add-medicine' as any)}
            >
              <Text style={styles.addButtonText}>Add Medicine</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: Spacing.lg,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.text,
  },
  listContainer: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  doseCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  doseCardTaken: {
    opacity: 0.7,
    backgroundColor: '#FAFAFA',
  },
  doseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  timeText: {
    ...Typography.h3,
    color: Colors.light.primary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: 'bold',
  },
  doseBody: {
    marginBottom: Spacing.md,
  },
  medicineName: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: 2,
  },
  medicineDetails: {
    ...Typography.body2,
    color: Colors.light.textMuted,
  },
  takenAtText: {
    ...Typography.caption,
    color: '#4CAF50',
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  takeButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  takeButtonText: {
    ...Typography.button,
    color: 'white',
  },
  errorText: {
    ...Typography.body1,
    color: Colors.light.error,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryText: {
    ...Typography.button,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.body2,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  addButtonText: {
    ...Typography.button,
    color: 'white',
  }
});
