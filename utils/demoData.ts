import type { Habit, Activity } from '@/types';

export function generateDemoHabits(userId: string): Habit[] {
  return [
    {
      id: `habit-1-${userId}`,
      name: 'Morning Workout',
      icon: '💪',
      userId,
      isShared: true,
      streak: 5,
      multiplier: 1.2,
      lastCompleted: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      completedDates: [
        new Date(Date.now() - 86400000).toISOString().split('T')[0],
        new Date(Date.now() - 172800000).toISOString().split('T')[0],
        new Date(Date.now() - 259200000).toISOString().split('T')[0],
        new Date(Date.now() - 345600000).toISOString().split('T')[0],
        new Date(Date.now() - 432000000).toISOString().split('T')[0],
      ],
    },
    {
      id: `habit-2-${userId}`,
      name: 'Read 30 Minutes',
      icon: '📚',
      userId,
      isShared: false,
      streak: 3,
      multiplier: 1.2,
      lastCompleted: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      completedDates: [
        new Date(Date.now() - 86400000).toISOString().split('T')[0],
        new Date(Date.now() - 172800000).toISOString().split('T')[0],
        new Date(Date.now() - 259200000).toISOString().split('T')[0],
      ],
    },
    {
      id: `habit-3-${userId}`,
      name: 'Drink 8 Glasses Water',
      icon: '💧',
      userId,
      isShared: true,
      streak: 0,
      multiplier: 1.0,
      lastCompleted: null,
      completedDates: [],
    },
  ];
}

export function generateDemoActivities(userId: string, groupId: string): Activity[] {
  const now = Date.now();
  return [
    {
      id: `activity-1-${userId}`,
      type: 'completion',
      userId,
      groupId,
      timestamp: new Date(now - 1800000).toISOString(),
      data: {
        habitName: 'Morning Workout',
        coins: 12,
        streak: 5,
      },
    },
    {
      id: `activity-2-${userId}`,
      type: 'streak',
      userId,
      groupId,
      timestamp: new Date(now - 3600000).toISOString(),
      data: {
        streak: 5,
      },
    },
    {
      id: `activity-3-${userId}`,
      type: 'completion',
      userId,
      groupId,
      timestamp: new Date(now - 7200000).toISOString(),
      data: {
        habitName: 'Read 30 Minutes',
        coins: 12,
        streak: 3,
      },
    },
  ];
}
