import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '@/contexts/GameContext';

export default function Index() {
  const router = useRouter();
  const { user, isLoading } = useGame();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isLoading, user, router]);

  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#8B5CF6" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
