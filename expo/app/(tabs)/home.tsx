import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, TextInput, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { Plus, Target, Flame, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '@/contexts/GameContext';
import type { Habit } from '@/types';
import React from "react";

const HABIT_ICONS = ['💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '🎯', '📝', '🎨'];

export default function Home() {
  const { user, habits, completeHabit, addHabit } = useGame();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newHabitName, setNewHabitName] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>(HABIT_ICONS[0]);

  const today = new Date().toISOString().split('T')[0];
  const userHabits = habits.filter(h => h.userId === user?.id);

  const handleComplete = useCallback(async (habitId: string) => {
    await completeHabit(habitId);
  }, [completeHabit]);

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    await addHabit(newHabitName.trim(), selectedIcon);
    setNewHabitName('');
    setSelectedIcon(HABIT_ICONS[0]);
    setShowAddModal(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: false,
      }} />
      
      <View style={[styles.header, { paddingTop: 60 }]}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name ?? 'User'}!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.coinContainer}>
          <Text style={styles.coinAmount}>🪙 {user?.coins || 0}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <StatCard 
            icon={<Target color="#8B5CF6" size={20} />}
            label="Active"
            value={userHabits.length.toString()}
            gradient={['#8B5CF620', '#8B5CF610']}
          />
          <StatCard 
            icon={<Flame color="#EF4444" size={20} />}
            label="Best Streak"
            value={Math.max(0, ...userHabits.map(h => h.streak)).toString()}
            gradient={['#EF444420', '#EF444410']}
          />
          <StatCard 
            icon={<TrendingUp color="#10B981" size={20} />}
            label="Trust"
            value={`${Math.round((user?.trustScore || 1) * 100)}%`}
            gradient={['#10B98120', '#10B98110']}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus color="#8B5CF6" size={20} />
            </TouchableOpacity>
          </View>

          {userHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyText}>No habits yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first habit</Text>
            </View>
          ) : (
            <View style={styles.habitList}>
              {userHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={habit.completedDates.includes(today)}
                  onComplete={() => handleComplete(habit.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Habit</Text>
            
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && styles.iconButtonSelected,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={styles.iconEmoji}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              value={newHabitName}
              onChangeText={setNewHabitName}
              placeholder="Habit name"
              placeholderTextColor="#666"
              autoCapitalize="words"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddHabit}
                disabled={!newHabitName.trim()}
              >
                <LinearGradient
                  colors={newHabitName.trim() ? ['#8B5CF6', '#7C3AED'] : ['#333', '#222']}
                  style={styles.modalButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.modalButtonText}>Add Habit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatCard({ icon, label, value, gradient }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  gradient: [string, string];
}) {
  return (
    <LinearGradient
      colors={gradient}
      style={styles.statCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.statIcon}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );
}

function HabitCard({ habit, isCompleted, onComplete }: { 
  habit: Habit; 
  isCompleted: boolean; 
  onComplete: () => void;
}) {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePress = () => {
    if (isCompleted) return;
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    onComplete();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.habitCard, isCompleted && styles.habitCardCompleted]}
        onPress={handlePress}
        disabled={isCompleted}
        activeOpacity={0.8}
      >
        <View style={styles.habitLeft}>
          <Text style={styles.habitIcon}>{habit.icon}</Text>
          <View style={styles.habitInfo}>
            <Text style={[styles.habitName, isCompleted && styles.habitNameCompleted]}>
              {habit.name}
            </Text>
            <View style={styles.habitMeta}>
              {habit.streak > 0 && (
                <View style={styles.streakBadge}>
                  <Flame color="#EF4444" size={12} />
                  <Text style={styles.streakText}>{habit.streak}</Text>
                </View>
              )}
              <Text style={styles.habitCoins}>+{Math.floor(10 * habit.multiplier)} 🪙</Text>
            </View>
          </View>
        </View>
        <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  coinContainer: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  coinAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  habitList: {
    gap: 12,
  },
  habitCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  habitCardCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#10B98110',
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  habitNameCompleted: {
    color: '#10B981',
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444420',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  habitCoins: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600' as const,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'center',
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  iconButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF620',
  },
  iconEmoji: {
    fontSize: 28,
  },
  modalInput: {
    backgroundColor: '#0F0F0F',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 2,
    borderColor: '#333',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonPrimary: {
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#666',
    paddingVertical: 16,
    textAlign: 'center',
  },
});
