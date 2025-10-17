import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flame, Zap, Target, TrendingUp, Shield } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';
import type { Activity } from '@/types';

export default function Feed() {
  const insets = useSafeAreaInsets();
  const { activities, user } = useGame();

  const groupActivities = activities.filter(a => a.groupId === user?.groupId);

  const renderActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case 'completion':
        return <Target color="#10B981" size={20} />;
      case 'sabotage':
        return <Zap color="#F59E0B" size={20} />;
      case 'streak':
        return <Flame color="#EF4444" size={20} />;
      case 'audit':
        return <Shield color="#8B5CF6" size={20} />;
      default:
        return <TrendingUp color="#666" size={20} />;
    }
  };

  const getActivityText = (activity: Activity): string => {
    const isYou = activity.userId === user?.id;
    const userName = isYou ? 'You' : 'Someone';

    switch (activity.type) {
      case 'completion':
        return `${userName} completed ${activity.data.habitName} (+${activity.data.coins} 🪙)`;
      case 'sabotage':
        return `${userName} used ${activity.data.sabotageType} sabotage (-${activity.data.coins} 🪙)`;
      case 'streak':
        return `${userName} reached a ${activity.data.streak}-day streak! 🔥`;
      case 'audit':
        return `${userName} ${activity.data.auditResult === 'success' ? 'passed' : 'failed'} an audit`;
      default:
        return `${userName} performed an action`;
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Activity Feed</Text>
        <Text style={styles.subtitle}>See what your group is up to</Text>
      </View>

      {groupActivities.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📱</Text>
          <Text style={styles.emptyText}>No activity yet</Text>
          <Text style={styles.emptySubtext}>Complete habits or sabotage opponents to see activity</Text>
        </View>
      ) : (
        <FlatList
          data={groupActivities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.activityCard}>
              <View style={styles.activityIcon}>
                {renderActivityIcon(item)}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{getActivityText(item)}</Text>
                <Text style={styles.activityTime}>{getTimeAgo(item.timestamp)}</Text>
              </View>
            </View>
          )}
        />
      )}
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
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    color: '#FFF',
    marginBottom: 4,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
});
