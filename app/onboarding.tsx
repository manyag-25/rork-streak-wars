import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';

import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Users, Target, Zap } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';
import React from "react";

export default function Onboarding() {
  const router = useRouter();
  const { createUser, createGroup } = useGame();
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleCreateUser = async () => {
    if (!name.trim()) return;
    await createUser(name.trim());
    animateButton(() => setStep(2));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    await createGroup(groupName.trim());
    animateButton(() => setStep(3));
  };

  const handleAddHabits = () => {
    router.replace('/(tabs)' as any);
  };

  const animateButton = (callback: () => void) => {
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
    ]).start(callback);
  };

  return (
    <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  style={styles.gradientCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Flame color="#FFF" size={48} />
                </LinearGradient>
              </View>
              
              <Text style={styles.title}>Welcome to Streak Wars</Text>
              <Text style={styles.subtitle}>
                The social habit tracker where you build streaks, earn coins, and battle friends with sabotage
              </Text>

              <View style={styles.featureList}>
                <FeatureItem 
                  icon={<Target color="#8B5CF6" size={24} />}
                  text="Complete habits daily to earn coins"
                />
                <FeatureItem 
                  icon={<Flame color="#EF4444" size={24} />}
                  text="Build streaks for bonus multipliers"
                />
                <FeatureItem 
                  icon={<Zap color="#F59E0B" size={24} />}
                  text="Sabotage opponents to gain advantage"
                />
                <FeatureItem 
                  icon={<Users color="#10B981" size={24} />}
                  text="Compete with friends in groups"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>What's your name?</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#666"
                  autoCapitalize="words"
                />
              </View>

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.button, !name.trim() && styles.buttonDisabled]}
                  onPress={handleCreateUser}
                  disabled={!name.trim()}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={name.trim() ? ['#8B5CF6', '#7C3AED'] : ['#333', '#222']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.gradientCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Users color="#FFF" size={48} />
                </LinearGradient>
              </View>

              <Text style={styles.title}>Create Your Battle Group</Text>
              <Text style={styles.subtitle}>
                Groups are where the action happens. Create one to invite friends or join an existing group later.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Group Name</Text>
                <TextInput
                  style={styles.input}
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="e.g. Morning Warriors"
                  placeholderTextColor="#666"
                  autoCapitalize="words"
                />
              </View>

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.button, !groupName.trim() && styles.buttonDisabled]}
                  onPress={handleCreateGroup}
                  disabled={!groupName.trim()}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={groupName.trim() ? ['#10B981', '#059669'] : ['#333', '#222']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.buttonText}>Create Group</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
                  style={styles.gradientCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Target color="#FFF" size={48} />
                </LinearGradient>
              </View>

              <Text style={styles.title}>You're All Set!</Text>
              <Text style={styles.subtitle}>
                Time to add your habits and start your journey. Remember: consistency wins battles!
              </Text>

              <View style={styles.coinGift}>
                <Text style={styles.coinGiftAmount}>🪙 100</Text>
                <Text style={styles.coinGiftLabel}>Starting Coins</Text>
              </View>

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleAddHabits}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.buttonText}>Start Building Habits</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </ScrollView>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        {icon}
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  gradientCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  featureList: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#CCC',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 2,
    borderColor: '#333',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  coinGift: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  coinGiftAmount: {
    fontSize: 48,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  coinGiftLabel: {
    fontSize: 16,
    color: '#999',
  },
});
