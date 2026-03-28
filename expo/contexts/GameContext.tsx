import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User, Habit, Group, HabitLog, Sabotage, Activity } from '@/types';

const STORAGE_KEYS = {
  USER: 'streak_wars_user',
  HABITS: 'streak_wars_habits',
  GROUPS: 'streak_wars_groups',
  LOGS: 'streak_wars_logs',
  SABOTAGES: 'streak_wars_sabotages',
  ACTIVITIES: 'streak_wars_activities',
};

export const [GameProvider, useGame] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [sabotages, setSabotages] = useState<Sabotage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, habitsData, groupsData, logsData, sabotagesData, activitiesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.HABITS),
        AsyncStorage.getItem(STORAGE_KEYS.GROUPS),
        AsyncStorage.getItem(STORAGE_KEYS.LOGS),
        AsyncStorage.getItem(STORAGE_KEYS.SABOTAGES),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES),
      ]);

      if (userData) setUser(JSON.parse(userData));
      if (habitsData) setHabits(JSON.parse(habitsData));
      if (groupsData) setGroups(JSON.parse(groupsData));
      if (logsData) setLogs(JSON.parse(logsData));
      if (sabotagesData) setSabotages(JSON.parse(sabotagesData));
      if (activitiesData) setActivities(JSON.parse(activitiesData));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = useCallback(async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  }, []);

  const createUser = useCallback(async (name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      coins: 100,
      trustScore: 1.0,
      groupId: null,
    };
    await saveUser(newUser);
    return newUser;
  }, [saveUser]);

  const createGroup = useCallback(async (groupName: string) => {
    if (!user) return null;

    const newGroup: Group = {
      id: Date.now().toString(),
      name: groupName,
      memberIds: [user.id],
      createdAt: new Date().toISOString(),
      challengeType: 'weekly',
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updatedGroups));

    const updatedUser = { ...user, groupId: newGroup.id };
    await saveUser(updatedUser);

    return newGroup;
  }, [user, groups, saveUser]);

  const joinGroup = useCallback(async (groupId: string) => {
    if (!user) return;

    const group = groups.find(g => g.id === groupId);
    if (!group || group.memberIds.includes(user.id)) return;

    const updatedGroup = {
      ...group,
      memberIds: [...group.memberIds, user.id],
    };

    const updatedGroups = groups.map(g => g.id === groupId ? updatedGroup : g);
    setGroups(updatedGroups);
    await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updatedGroups));

    const updatedUser = { ...user, groupId: groupId };
    await saveUser(updatedUser);
  }, [user, groups, saveUser]);

  const addHabit = useCallback(async (name: string, icon: string, isShared: boolean = false) => {
    if (!user) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      icon,
      userId: user.id,
      isShared,
      streak: 0,
      multiplier: 1.0,
      lastCompleted: null,
      completedDates: [],
    };

    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(updatedHabits));
  }, [user, habits]);

  const completeHabit = useCallback(async (habitId: string) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    if (!habit || habit.completedDates.includes(today)) return;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isConsecutive = habit.lastCompleted === yesterday;
    const newStreak = isConsecutive ? habit.streak + 1 : 1;
    const newMultiplier = newStreak >= 3 ? 1.2 : 1.0;

    const coinsEarned = Math.floor(10 * newMultiplier);

    const updatedHabit: Habit = {
      ...habit,
      streak: newStreak,
      multiplier: newMultiplier,
      lastCompleted: today,
      completedDates: [...habit.completedDates, today],
    };

    const updatedHabits = habits.map(h => h.id === habitId ? updatedHabit : h);
    setHabits(updatedHabits);
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(updatedHabits));

    const updatedUser = { ...user, coins: user.coins + coinsEarned };
    await saveUser(updatedUser);

    const newLog: HabitLog = {
      id: Date.now().toString(),
      habitId,
      userId: user.id,
      date: today,
      verified: true,
    };

    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));

    const activity: Activity = {
      id: Date.now().toString(),
      type: 'completion',
      userId: user.id,
      groupId: user.groupId || '',
      timestamp: new Date().toISOString(),
      data: {
        habitName: habit.name,
        coins: coinsEarned,
        streak: newStreak,
      },
    };

    const updatedActivities = [activity, ...activities];
    setActivities(updatedActivities);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
  }, [user, habits, logs, activities, saveUser]);

  const applySabotage = useCallback(async (type: 'delay' | 'proof' | 'jam', targetUserId: string) => {
    if (!user) return;

    const costs = { delay: 25, proof: 40, jam: 50 };
    const cost = costs[type];

    if (user.coins < cost) return;

    const sabotage: Sabotage = {
      id: Date.now().toString(),
      type,
      fromUserId: user.id,
      toUserId: targetUserId,
      groupId: user.groupId || '',
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      active: true,
    };

    const updatedSabotages = [...sabotages, sabotage];
    setSabotages(updatedSabotages);
    await AsyncStorage.setItem(STORAGE_KEYS.SABOTAGES, JSON.stringify(updatedSabotages));

    const updatedUser = { ...user, coins: user.coins - cost };
    await saveUser(updatedUser);

    const activity: Activity = {
      id: Date.now().toString(),
      type: 'sabotage',
      userId: user.id,
      targetUserId,
      groupId: user.groupId || '',
      timestamp: new Date().toISOString(),
      data: {
        sabotageType: type,
        coins: cost,
      },
    };

    const updatedActivities = [activity, ...activities];
    setActivities(updatedActivities);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
  }, [user, sabotages, activities, saveUser]);

  const getActiveSabotages = useCallback((userId: string) => {
    const now = Date.now();
    return sabotages.filter(s => 
      s.toUserId === userId && 
      s.active && 
      new Date(s.expiresAt).getTime() > now
    );
  }, [sabotages]);

  return useMemo(() => ({
    user,
    habits,
    groups,
    logs,
    sabotages,
    activities,
    isLoading,
    createUser,
    createGroup,
    joinGroup,
    addHabit,
    completeHabit,
    applySabotage,
    getActiveSabotages,
  }), [user, habits, groups, logs, sabotages, activities, isLoading, createUser, createGroup, joinGroup, addHabit, completeHabit, applySabotage, getActiveSabotages]);
});
