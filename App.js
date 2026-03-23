import React, { useState } from 'react';
import {
  SafeAreaView, ScrollView, View, Text,
  StyleSheet, ToastAndroid, Platform, Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGameState } from './src/hooks/useGameState';
import { getCurrentStage } from './src/utils/gameLogic';
import { HamsterCard } from './src/components/HamsterCard';
import { WeekStreak } from './src/components/WeekStreak';
import { MilestoneList } from './src/components/MilestoneList';
import { StairInput } from './src/components/StairInput';
import { LevelUpModal } from './src/components/LevelUpModal';
import { theme } from './src/styles/theme';

export default function App() {
  const { totalStairs, streak, weekLog, addStairs, resetGame } = useGameState();
  const [levelUpStage, setLevelUpStage] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const stage = getCurrentStage(totalStairs);

  const triggerToast = (msg) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      setToastMsg(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  const handleSubmit = async (val) => {
    const result = await addStairs(val);
    if (result.newStage.minStairs > result.prevStage.minStairs) {
      setTimeout(() => setLevelUpStage(result.newStage), 600);
    } else {
      const msg = result.bonus > 1
        ? `🔥 ${val}계단 + 보너스! 총 ${result.earned}계단`
        : `✓ ${val}계단 기록!`;
      triggerToast(msg);
    }
  };

  const handleReset = async () => {
    await resetGame();
    triggerToast('리셋 완료. 다시 볼살 햄찌로...');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.gameTitle}>🐹 햄찌의 계단일기</Text>
          <Text style={styles.gameSubtitle}>HAMZY STAIR LOG</Text>
        </View>

        <HamsterCard stage={stage} totalStairs={totalStairs} streak={streak} />
        <WeekStreak weekLog={weekLog} />
        <MilestoneList totalStairs={totalStairs} />
        <StairInput onSubmit={handleSubmit} onReset={handleReset} />
      </ScrollView>

      {showToast && (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      )}

      <LevelUpModal stage={levelUpStage} onClose={() => setLevelUpStage(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.ink,
    letterSpacing: 1,
  },
  gameSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.inkLight,
    letterSpacing: 4,
    marginTop: 2,
  },
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: theme.ink,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  toastText: {
    color: theme.paper,
    fontSize: 13,
    fontWeight: '600',
  },
});
