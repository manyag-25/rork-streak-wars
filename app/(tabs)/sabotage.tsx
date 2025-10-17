import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Zap, Clock, Camera, TrendingDown, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '@/contexts/GameContext';

const SABOTAGES = [
  {
    type: 'delay' as const,
    name: 'Time Delay',
    description: 'Target cannot log habits until 9 PM',
    cost: 25,
    icon: <Clock color="#F59E0B" size={32} />,
    color: ['#F59E0B', '#D97706'] as [string, string],
  },
  {
    type: 'proof' as const,
    name: 'Proof Challenge',
    description: 'Target must upload photo proof',
    cost: 40,
    icon: <Camera color="#8B5CF6" size={32} />,
    color: ['#8B5CF6', '#7C3AED'] as [string, string],
  },
  {
    type: 'jam' as const,
    name: 'Multiplier Jam',
    description: 'Halves target streak bonus for 24h',
    cost: 50,
    icon: <TrendingDown color="#EF4444" size={32} />,
    color: ['#EF4444', '#DC2626'] as [string, string],
  },
];

export default function Sabotage() {
  const insets = useSafeAreaInsets();
  const { user, groups, applySabotage } = useGame();
  const [selectedSabotage, setSelectedSabotage] = useState<typeof SABOTAGES[0] | null>(null);

  const currentGroup = groups.find(g => g.id === user?.groupId);
  const groupMembers = currentGroup?.memberIds.filter(id => id !== user?.id) || [];

  const handleApplySabotage = async (targetUserId: string) => {
    if (!selectedSabotage || !user) return;
    
    if (user.coins < selectedSabotage.cost) {
      return;
    }

    await applySabotage(selectedSabotage.type, targetUserId);
    setSelectedSabotage(null);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Sabotage Shop</Text>
            <Text style={styles.subtitle}>Mess with your opponents</Text>
          </View>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {user?.coins || 0}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sabotageList}>
          {SABOTAGES.map((sabotage) => (
            <TouchableOpacity
              key={sabotage.type}
              style={styles.sabotageCard}
              onPress={() => setSelectedSabotage(sabotage)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[...sabotage.color.map(c => c + '20')] as [string, string]}
                style={styles.sabotageGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.sabotageIcon}>
                  {sabotage.icon}
                </View>
                <View style={styles.sabotageInfo}>
                  <Text style={styles.sabotageName}>{sabotage.name}</Text>
                  <Text style={styles.sabotageDescription}>{sabotage.description}</Text>
                </View>
                <View style={styles.sabotagePrice}>
                  <Text style={styles.sabotageCoins}>🪙 {sabotage.cost}</Text>
                  <Zap color="#F59E0B" size={16} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
          <Text style={styles.tipText}>• Sabotages last 24 hours</Text>
          <Text style={styles.tipText}>• Failed challenges refund 50% coins</Text>
          <Text style={styles.tipText}>• Use wisely to maximize damage</Text>
        </View>
      </ScrollView>

      <Modal
        visible={selectedSabotage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSabotage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedSabotage(null)}
            >
              <X color="#999" size={24} />
            </TouchableOpacity>

            {selectedSabotage && (
              <>
                <View style={styles.modalIcon}>
                  {selectedSabotage.icon}
                </View>
                <Text style={styles.modalTitle}>{selectedSabotage.name}</Text>
                <Text style={styles.modalDescription}>{selectedSabotage.description}</Text>
                <Text style={styles.modalCost}>Cost: 🪙 {selectedSabotage.cost}</Text>

                <Text style={styles.targetLabel}>Select Target</Text>
                
                {groupMembers.length === 0 ? (
                  <View style={styles.noTargets}>
                    <Text style={styles.noTargetsText}>No other players in your group yet</Text>
                  </View>
                ) : (
                  <View style={styles.targetList}>
                    {groupMembers.map((memberId) => (
                      <TouchableOpacity
                        key={memberId}
                        style={styles.targetButton}
                        onPress={() => handleApplySabotage(memberId)}
                        disabled={(user?.coins || 0) < selectedSabotage.cost}
                      >
                        <LinearGradient
                          colors={selectedSabotage.color}
                          style={styles.targetGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Text style={styles.targetText}>Player {memberId.slice(-4)}</Text>
                          <Zap color="#FFF" size={16} />
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  coinBadge: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  coinText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sabotageList: {
    gap: 16,
    marginBottom: 32,
  },
  sabotageCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
  },
  sabotageGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sabotageIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sabotageInfo: {
    flex: 1,
  },
  sabotageName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  sabotageDescription: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  sabotagePrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sabotageCoins: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#F59E0B',
  },
  tips: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#333',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalCost: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 24,
  },
  targetLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
    marginBottom: 12,
  },
  targetList: {
    gap: 12,
  },
  targetButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  targetGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  noTargets: {
    padding: 24,
    alignItems: 'center',
  },
  noTargetsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
