import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trophy, Flame, Shield, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '@/contexts/GameContext';
import React from "react";

export default function Leaderboard() {
  const insets = useSafeAreaInsets();
  const { user, groups, habits } = useGame();

  const currentGroup = groups.find(g => g.id === user?.groupId);
  const groupMemberIds = currentGroup?.memberIds || [];

  const leaderboardData = groupMemberIds.map((memberId) => {
    const memberHabits = habits.filter(h => h.userId === memberId);
    const totalCoins = memberId === user?.id ? (user?.coins || 0) : 50;
    const bestStreak = Math.max(0, ...memberHabits.map(h => h.streak));
    const trustScore = memberId === user?.id ? (user?.trustScore || 1) : 0.95;

    return {
      id: memberId,
      name: memberId === user?.id ? (user?.name || 'You') : `Player ${memberId.slice(-4)}`,
      coins: totalCoins,
      streak: bestStreak,
      trustScore,
      isYou: memberId === user?.id,
    };
  }).sort((a, b) => b.coins - a.coins);

  const getRankColor = (index: number): [string, string] => {
    if (index === 0) return ['#F59E0B', '#D97706'];
    if (index === 1) return ['#8B5CF6', '#7C3AED'];
    if (index === 2) return ['#10B981', '#059669'];
    return ['#333', '#222'];
  };

  const getRankEmoji = (index: number): string => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerContent}>
          <Trophy color="#F59E0B" size={32} />
          <Text style={styles.title}>Leaderboard</Text>
        </View>
        <Text style={styles.subtitle}>
          {currentGroup?.name || 'No Group'}
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {leaderboardData.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>No players yet</Text>
            <Text style={styles.emptySubtext}>Invite friends to join your group</Text>
          </View>
        ) : (
          <View style={styles.leaderboardList}>
            {leaderboardData.map((player, index) => (
              <View 
                key={player.id}
                style={[
                  styles.playerCard,
                  player.isYou && styles.playerCardHighlight,
                ]}
              >
                <View style={styles.rankBadge}>
                  <LinearGradient
                    colors={getRankColor(index)}
                    style={styles.rankGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.rankText}>{getRankEmoji(index)}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.playerInfo}>
                  <Text style={[styles.playerName, player.isYou && styles.playerNameYou]}>
                    {player.name}
                    {player.isYou && ' (You)'}
                  </Text>
                  <View style={styles.playerStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statIcon}>🪙</Text>
                      <Text style={styles.statValue}>{player.coins}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Flame color="#EF4444" size={14} />
                      <Text style={styles.statValue}>{player.streak}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Shield color="#8B5CF6" size={14} />
                      <Text style={styles.statValue}>{Math.round(player.trustScore * 100)}%</Text>
                    </View>
                  </View>
                </View>

                {index === 0 && (
                  <View style={styles.crownContainer}>
                    <Text style={styles.crown}>👑</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <StatsItem 
              icon={<Trophy color="#F59E0B" size={24} />}
              label="Rank"
              value={`#${leaderboardData.findIndex(p => p.isYou) + 1 || '-'}`}
            />
            <StatsItem 
              icon={<TrendingUp color="#10B981" size={24} />}
              label="Total Coins"
              value={user?.coins.toString() || '0'}
            />
            <StatsItem 
              icon={<Flame color="#EF4444" size={24} />}
              label="Best Streak"
              value={Math.max(0, ...habits.filter(h => h.userId === user?.id).map(h => h.streak)).toString()}
            />
            <StatsItem 
              icon={<Shield color="#8B5CF6" size={24} />}
              label="Trust Score"
              value={`${Math.round((user?.trustScore || 1) * 100)}%`}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatsItem({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statsItem}>
      <View style={styles.statsIcon}>
        {icon}
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
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
    textAlign: 'center',
  },
  leaderboardList: {
    gap: 12,
    marginBottom: 24,
  },
  playerCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  playerCardHighlight: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF620',
  },
  rankBadge: {
    marginRight: 16,
  },
  rankGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFF',
    marginBottom: 8,
  },
  playerNameYou: {
    color: '#8B5CF6',
  },
  playerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#999',
  },
  crownContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  crown: {
    fontSize: 24,
  },
  statsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statsItem: {
    width: '47%',
    backgroundColor: '#0F0F0F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statsIcon: {
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
  },
});
