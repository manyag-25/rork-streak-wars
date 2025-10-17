export type User = {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  trustScore: number;
  groupId: string | null;
};

export type Habit = {
  id: string;
  name: string;
  icon: string;
  userId: string;
  isShared: boolean;
  streak: number;
  multiplier: number;
  lastCompleted: string | null;
  completedDates: string[];
};

export type HabitLog = {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  verified: boolean;
  proofUrl?: string;
  challengedBy?: string;
  challengeResult?: 'pending' | 'success' | 'failed';
};

export type Group = {
  id: string;
  name: string;
  memberIds: string[];
  createdAt: string;
  challengeType: 'weekly' | 'monthly';
};

export type Sabotage = {
  id: string;
  type: 'delay' | 'proof' | 'jam';
  fromUserId: string;
  toUserId: string;
  groupId: string;
  timestamp: string;
  expiresAt: string;
  active: boolean;
};

export type Activity = {
  id: string;
  type: 'completion' | 'sabotage' | 'audit' | 'streak' | 'blackout';
  userId: string;
  targetUserId?: string;
  groupId: string;
  timestamp: string;
  data: {
    habitName?: string;
    coins?: number;
    sabotageType?: string;
    streak?: number;
    auditResult?: 'success' | 'failed';
  };
};

export type ActiveSabotage = {
  type: 'delay' | 'proof' | 'jam';
  expiresAt: string;
  fromUserName: string;
};
