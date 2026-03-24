import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, Image, ImageBackground,
  StyleSheet, ToastAndroid, Platform, Alert,
  TextInput, TouchableOpacity, ActivityIndicator,
  Animated, Dimensions, KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useGameState } from './src/hooks/useGameState';
import { useHealthKit } from './src/hooks/useHealthKit';
import { getCurrentStage, calcLevel, getNextThreshold, FINAL_MAX } from './src/utils/gameLogic';
import { WeekStreak } from './src/components/WeekStreak';
import { MilestoneList } from './src/components/MilestoneList';
import { LevelUpModal } from './src/components/LevelUpModal';
import { ItemSelector } from './src/components/ItemSelector';
import { ITEMS } from './src/constants/items';
import { theme } from './src/styles/theme';

const { height: SCREEN_H } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_H * 0.46;

export default function App() {
  const { totalStairs, streak, weekLog, equippedItems, addStairs, toggleItem, resetGame } = useGameState();
  const { isLoading, fetchTodayFlights } = useHealthKit();
  const [levelUpStage, setLevelUpStage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [inputValue, setInputValue] = useState('');

  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -7, duration: 1600, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0,  duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const stage = getCurrentStage(totalStairs);
  const level = calcLevel(totalStairs);
  const nextThreshold = getNextThreshold(totalStairs);
  const isMax = totalStairs >= FINAL_MAX;
  const range = nextThreshold - stage.minStairs;
  const pct = Math.min(100, (totalStairs - stage.minStairs) / range * 100);

  const triggerToast = (msg) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      setToastMsg(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  const handleSubmit = async () => {
    const val = parseInt(inputValue);
    if (!val || val <= 0) {
      Alert.alert('', '계단 수를 입력해!');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputValue('');
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

  const handleHealthKitFetch = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const flights = await fetchTodayFlights();
      if (flights === 0) {
        Alert.alert('HealthKit', '오늘 기록된 계단 데이터가 없어요.');
        return;
      }
      Alert.alert(
        'HealthKit 연동',
        `오늘 오른 계단: ${flights}층\n기록할까요?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '기록!',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              addStairs(flights);
            },
          },
        ]
      );
    } catch {
      Alert.alert('오류', 'HealthKit에 접근할 수 없어요.');
    }
  };

  const handleReset = () => {
    Alert.alert('처음부터?', '정말 리셋할까요?', [
      { text: '아니요', style: 'cancel' },
      { text: '네', style: 'destructive', onPress: resetGame },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <Text style={styles.appTitle}>🐹 햄찌의 계단일기</Text>
          <View style={styles.topStats}>
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeLabel}>LV</Text>
              <Text style={styles.topBadgeNum}>{level}</Text>
            </View>
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeLabel}>🔥</Text>
              <Text style={styles.topBadgeNum}>{streak}일</Text>
            </View>
          </View>
        </View>

        {/* ── Scrollable body ── */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero hamster section */}
          <ImageBackground
            source={stage.bgImage}
            style={[styles.hero, { height: HERO_HEIGHT }]}
            imageStyle={styles.heroBg}
            resizeMode="cover"
          >
            <Animated.View style={[styles.heroChar, { transform: [{ translateY }] }]}>
              <Image source={stage.image} style={styles.heroImage} resizeMode="contain" />
              {equippedItems.length > 0 && (
                <View style={styles.equippedRow}>
                  {ITEMS.filter(it => equippedItems.includes(it.id)).map(it => (
                    <Text key={it.id} style={styles.equippedEmoji}>{it.emoji}</Text>
                  ))}
                </View>
              )}
            </Animated.View>
            <View style={styles.heroInfo}>
              <View style={styles.stageTag}>
                <Text style={styles.stageTagText}>{stage.stageLabel}</Text>
              </View>
              <Text style={styles.heroTitle}>{stage.title}</Text>
              <Text style={styles.heroSub}>{stage.subtitle}</Text>
              <View style={styles.xpRow}>
                <Text style={styles.xpText}>
                  {totalStairs.toLocaleString()} / {isMax ? 'MAX' : nextThreshold.toLocaleString()} 계단
                </Text>
              </View>
              <View style={styles.xpTrack}>
                <View style={[styles.xpFill, { width: `${pct}%` }]} />
              </View>
            </View>
          </ImageBackground>

          {/* Scroll-down content */}
          <View style={styles.scrollHint}>
            <Text style={styles.scrollHintText}>▾ 스탯 보기</Text>
          </View>

          <ItemSelector totalStairs={totalStairs} equippedItems={equippedItems} onToggle={toggleItem} />
          <WeekStreak weekLog={weekLog} />
          <MilestoneList totalStairs={totalStairs} />

          <TouchableOpacity onPress={handleReset} style={styles.resetWrap}>
            <Text style={styles.resetText}>처음부터 다시</Text>
          </TouchableOpacity>
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* ── Fixed bottom input bar ── */}
        <View style={styles.bottomBar}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="계단 수 입력"
              placeholderTextColor={theme.line}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>기록</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.hkBtn}
            onPress={handleHealthKitFetch}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color={theme.white} size="small" />
              : <Text style={styles.hkBtnText}>🍎  HealthKit에서 오늘 계단 가져오기</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Toast */}
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
  safe: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  flex: {
    flex: 1,
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.line,
    backgroundColor: theme.paper,
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.ink,
    letterSpacing: 0.5,
  },
  topStats: {
    flexDirection: 'row',
    gap: 6,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.bg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: theme.line,
  },
  topBadgeLabel: {
    fontSize: 10,
    color: theme.inkLight,
    fontWeight: '700',
  },
  topBadgeNum: {
    fontSize: 13,
    fontWeight: '900',
    color: theme.ink,
  },

  /* Scroll */
  scroll: {
    paddingBottom: 8,
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: theme.paper,
    gap: 10,
    overflow: 'hidden',
  },
  heroBg: {
    resizeMode: 'cover',
    opacity: 0.9,
  },
  heroChar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  equippedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  equippedEmoji: {
    fontSize: 22,
  },
  heroImage: {
    width: SCREEN_H * 0.24,
    height: SCREEN_H * 0.24,
  },
  heroInfo: {
    alignItems: 'center',
    paddingBottom: 16,
    width: '100%',
  },
  stageTag: {
    backgroundColor: theme.accent,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  stageTagText: {
    color: theme.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.ink,
    marginBottom: 2,
  },
  heroSub: {
    fontSize: 12,
    color: theme.inkLight,
    marginBottom: 10,
  },
  xpRow: {
    marginBottom: 6,
  },
  xpText: {
    fontSize: 11,
    color: theme.inkLight,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  xpTrack: {
    height: 7,
    width: 200,
    backgroundColor: theme.line,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: theme.accent,
    borderRadius: 4,
  },

  /* Scroll hint */
  scrollHint: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: theme.bg,
  },
  scrollHintText: {
    fontSize: 10,
    color: theme.line,
    fontWeight: '600',
    letterSpacing: 2,
  },

  /* Bottom bar */
  bottomBar: {
    backgroundColor: theme.paper,
    borderTopWidth: 1.5,
    borderTopColor: theme.line,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.ink,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: theme.ink,
    backgroundColor: theme.bg,
  },
  submitBtn: {
    backgroundColor: theme.ink,
    borderRadius: 10,
    paddingHorizontal: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: theme.paper,
    fontSize: 15,
    fontWeight: '800',
  },
  hkBtn: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.ink,
  },
  hkBtnText: {
    color: theme.white,
    fontSize: 13,
    fontWeight: '700',
  },

  /* Reset */
  resetWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resetText: {
    fontSize: 11,
    color: theme.inkLight,
    textDecorationLine: 'underline',
  },

  /* Toast */
  toast: {
    position: 'absolute',
    bottom: 140,
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
