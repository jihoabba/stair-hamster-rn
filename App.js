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
import { usePushNotifications } from './src/hooks/usePushNotifications';
import { useInterstitialAd, BannerAd, BannerAdSize, BANNER_AD_ID } from './src/hooks/useAds';
import { getCurrentStage, calcLevel, getNextThreshold, FINAL_MAX } from './src/utils/gameLogic';
import { WeekStreak } from './src/components/WeekStreak';
import { LevelUpModal } from './src/components/LevelUpModal';
import { PaywallModal } from './src/components/PaywallModal';
import { OnboardingScreen } from './src/components/OnboardingScreen';
import { theme } from './src/styles/theme';
import {
  trackAppOpen, trackRecordStairs, trackStageUp,
  trackPaywallShown, trackRemoveAdsClicked,
} from './src/utils/analytics';

const { height: SCREEN_H } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_H * 0.46;

const SICK_IMAGES = {
  1: require('./assets/hamster_1.png'), // placeholder: hamster_sick_1
  2: require('./assets/hamster_1.png'), // placeholder: hamster_sick_2
  3: require('./assets/hamster_1.png'), // placeholder: hamster_sick_3
};
const SICK_LABELS = {
  1: { status: '😔 배고픔', sub: '밥을 못 먹었어...' },
  2: { status: '🤒 아픔', sub: '몸이 너무 힘들어...' },
  3: { status: '😵 쓰러짐', sub: '제발 빨리 와줘...' },
};

export default function App() {
  const {
    totalStairs, streak, weekLog, lastLogDate,
    isPremium, mode, penaltyStatus, isLoaded,
    addStairs, unlockPremium, completeOnboarding, resetGame,
  } = useGameState();
  const { isLoading, fetchTodayFlights, fetchTodaySteps } = useHealthKit();
  const [levelUpStage, setLevelUpStage] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const { showAd } = useInterstitialAd();

  // Only request push notifications after onboarding is complete
  usePushNotifications(mode !== null ? lastLogDate : undefined);

  // Track app open once after load
  useEffect(() => {
    if (isLoaded && mode !== null) trackAppOpen();
  }, [isLoaded]);

  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -7, duration: 1600, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0,  duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── not yet loaded ──
  if (!isLoaded) return null;

  // ── onboarding ──
  if (mode === null) {
    return <OnboardingScreen onSelect={completeOnboarding} />;
  }

  const stage = getCurrentStage(totalStairs);
  const isLocked = stage.locked && !isPremium;
  const displayStage = isLocked ? getCurrentStage(99) : stage;
  const isSick = penaltyStatus > 0;
  const heroImage = isSick ? SICK_IMAGES[Math.min(penaltyStatus, 3)] : displayStage.image;

  const level = calcLevel(totalStairs);
  const nextThreshold = getNextThreshold(totalStairs);
  const isMax = totalStairs >= FINAL_MAX;
  const range = Math.max(1, nextThreshold - displayStage.minStairs);
  const pct = Math.min(100, (totalStairs - displayStage.minStairs) / range * 100);

  // Steps mode: 1층 = 1000보 (1만보 = 10층)
  const isStepsMode = mode === 'steps';
  const displayTotal = isStepsMode ? (totalStairs * 1000).toLocaleString() : totalStairs.toLocaleString();
  const displayNext = isMax ? 'MAX' : isStepsMode ? (nextThreshold * 1000).toLocaleString() : nextThreshold.toLocaleString();
  const unit = isStepsMode ? '보' : '층';
  const inputPlaceholder = isStepsMode ? '오늘 걸음 수 입력' : '오늘 오른 층 수 입력';

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
      Alert.alert('', isStepsMode ? '걸음 수를 입력해!' : '층 수를 입력해!');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputValue('');
    // In steps mode, convert steps → floors before adding
    const floorsToAdd = isStepsMode ? Math.max(1, Math.round(val / 1000)) : val;
    const result = await addStairs(floorsToAdd);
    const isNewStageLocked = result.newStage.locked && !isPremium;
    trackRecordStairs({ value: floorsToAdd, bonus: result.bonus, mode, newTotal: result.newTotal });

    if (result.newStage.minStairs > result.prevStage.minStairs) {
      if (isNewStageLocked) {
        trackPaywallShown();
        setTimeout(() => setShowPaywall(true), 600);
      } else {
        if (!isPremium) showAd();
        trackStageUp({ stageLabel: result.newStage.stageLabel, stageIndex: result.newStage.id ?? result.newStage.minStairs });
        setTimeout(() => setLevelUpStage(result.newStage), 600);
      }
    } else {
      const displayVal = isStepsMode ? `${val.toLocaleString()}보` : `${val}층`;
      const displayEarned = isStepsMode ? `${(result.earned * 1000).toLocaleString()}보` : `${result.earned}층`;
      const msg = result.bonus > 1
        ? `🔥 ${displayVal} + 보너스! 총 ${displayEarned}`
        : `✓ ${displayVal} 기록!`;
      triggerToast(msg);
    }
  };

  const handleHealthKitFetch = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (mode === 'steps') {
        const { steps, floors } = await fetchTodaySteps();
        if (steps === 0) {
          Alert.alert('HealthKit', '오늘 기록된 걸음 데이터가 없어요.');
          return;
        }
        Alert.alert(
          'HealthKit 연동',
          `오늘 걸음 수: ${steps.toLocaleString()}보\n→ ${floors}층으로 환산\n기록할까요?`,
          [
            { text: '취소', style: 'cancel' },
            {
              text: '기록!',
              onPress: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                addStairs(floors);
              },
            },
          ]
        );
      } else {
        const flights = await fetchTodayFlights();
        if (flights === 0) {
          Alert.alert('HealthKit', '오늘 기록된 층 데이터가 없어요.');
          return;
        }
        Alert.alert(
          'HealthKit 연동',
          `오늘 오른 층 수: ${flights}층\n기록할까요?`,
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
      }
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

  const hkBtnLabel = mode === 'steps'
    ? '🍎  건강 앱에서 오늘 걸음 수 가져오기'
    : '🍎  건강 앱에서 오늘 층 수 가져오기';

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
          <Text style={styles.appTitle}>🐹 햄찌는 영차영차</Text>
          <View style={styles.topStats}>
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeLabel}>LV</Text>
              <Text style={styles.topBadgeNum}>{level}</Text>
            </View>
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeLabel}>🔥</Text>
              <Text style={styles.topBadgeNum}>{streak}일</Text>
            </View>
            {isSick && (
              <View style={[styles.topBadge, styles.topBadgeSick]}>
                <Text style={styles.topBadgeNum}>{SICK_LABELS[penaltyStatus].status}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Scrollable body ── */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero hamster section */}
          <ImageBackground
            source={displayStage.bgImage}
            style={[styles.hero, { height: HERO_HEIGHT }]}
            imageStyle={styles.heroBg}
            resizeMode="cover"
          >
            {isLocked && <View style={styles.lockOverlay} />}
            <Animated.View style={[
              styles.heroChar,
              { transform: [{ translateY }], opacity: isLocked ? 0.4 : 1 },
            ]}>
              <Image source={heroImage} style={styles.heroImage} resizeMode="contain" />
            </Animated.View>

            {isLocked ? (
              <TouchableOpacity style={styles.lockBanner} onPress={() => setShowPaywall(true)} activeOpacity={0.85}>
                <Text style={styles.lockBannerText}>🔒 잠긴 단계 — 탭해서 해금</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.heroInfo}>
                {isSick ? (
                  <>
                    <View style={[styles.stageTag, styles.stageTagSick]}>
                      <Text style={styles.stageTagText}>{SICK_LABELS[penaltyStatus].status}</Text>
                    </View>
                    <Text style={styles.heroTitle}>{SICK_LABELS[penaltyStatus].sub}</Text>
                    <Text style={styles.heroSub}>운동하면 회복돼요!</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.stageTag}>
                      <Text style={styles.stageTagText}>{displayStage.stageLabel}</Text>
                    </View>
                    <Text style={styles.heroTitle}>{displayStage.title}</Text>
                    <Text style={styles.heroSub}>{displayStage.subtitle}</Text>
                  </>
                )}
                <View style={styles.xpRow}>
                  <Text style={styles.xpText}>
                    누적 {displayTotal} / {displayNext} {unit}
                  </Text>
                </View>
                <View style={styles.xpTrack}>
                  <View style={[styles.xpFill, { width: `${pct}%` }]} />
                </View>
              </View>
            )}
          </ImageBackground>

          {/* Scroll-down content */}
          <View style={styles.scrollHint}>
            <Text style={styles.scrollHintText}>▾ 스탯 보기</Text>
          </View>

          <WeekStreak weekLog={weekLog} />

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
              placeholder={inputPlaceholder}
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
              : <Text style={styles.hkBtnText}>{hkBtnLabel}</Text>
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
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchase={() => {
          setShowPaywall(false);
          Alert.alert('준비 중', '결제 기능은 곧 추가될 예정이에요!');
        }}
      />

      {/* Banner ad + remove-ad button */}
      {!isPremium && (
        <View style={styles.adContainer}>
          <BannerAd
            unitId={BANNER_AD_ID}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: false }}
          />
          <TouchableOpacity
            style={styles.removeAdBtn}
            onPress={() => {
              trackRemoveAdsClicked();
              Alert.alert('광고 제거', '광고 없이 즐기시려면 프리미엄을 이용해보세요!\n(결제 기능은 곧 추가될 예정이에요 🐹)');
            }}
          >
            <Text style={styles.removeAdText}>광고 제거</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  flex: { flex: 1 },

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
  appTitle: { fontSize: 15, fontWeight: '900', color: theme.ink, letterSpacing: 0.5 },
  topStats: { flexDirection: 'row', gap: 6 },
  topBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: theme.bg, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1.5, borderColor: theme.line,
  },
  topBadgeSick: { borderColor: '#e07050', backgroundColor: '#fff0ec' },
  topBadgeLabel: { fontSize: 10, color: theme.inkLight, fontWeight: '700' },
  topBadgeNum: { fontSize: 13, fontWeight: '900', color: theme.ink },

  scroll: { paddingBottom: 8 },

  hero: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, backgroundColor: theme.paper,
    gap: 10, overflow: 'hidden',
  },
  heroBg: { resizeMode: 'cover', opacity: 0.9 },
  lockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.45)' },
  heroChar: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  heroImage: { width: SCREEN_H * 0.24, height: SCREEN_H * 0.24 },

  heroInfo: { alignItems: 'center', paddingBottom: 16, width: '100%' },
  lockBanner: {
    backgroundColor: theme.ink, borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 10, marginBottom: 20,
  },
  lockBannerText: { color: theme.paper, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },

  stageTag: {
    backgroundColor: theme.accent, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6,
  },
  stageTagSick: { backgroundColor: '#e07050' },
  stageTagText: { color: theme.white, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  heroTitle: { fontSize: 20, fontWeight: '900', color: theme.ink, marginBottom: 2 },
  heroSub: { fontSize: 12, color: theme.inkLight, marginBottom: 10 },
  xpRow: { marginBottom: 6 },
  xpText: { fontSize: 11, color: theme.inkLight, fontWeight: '600', letterSpacing: 0.5 },
  xpTrack: {
    height: 7, width: 200,
    backgroundColor: theme.line, borderRadius: 4, overflow: 'hidden',
  },
  xpFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 4 },

  scrollHint: { alignItems: 'center', paddingVertical: 8, backgroundColor: theme.bg },
  scrollHintText: { fontSize: 10, color: theme.line, fontWeight: '600', letterSpacing: 2 },

  modeBadge: {
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: theme.paper,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.line,
  },
  modeBadgeText: { fontSize: 12, color: theme.inkLight, fontWeight: '600' },

  bottomBar: {
    backgroundColor: theme.paper,
    borderTopWidth: 1.5, borderTopColor: theme.line,
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8, gap: 8,
  },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, borderWidth: 2, borderColor: theme.ink, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15,
    color: theme.ink, backgroundColor: theme.bg,
  },
  submitBtn: {
    backgroundColor: theme.ink, borderRadius: 10,
    paddingHorizontal: 22, justifyContent: 'center', alignItems: 'center',
  },
  submitBtnText: { color: theme.paper, fontSize: 15, fontWeight: '800' },
  hkBtn: {
    backgroundColor: theme.accent, borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
    borderWidth: 2, borderColor: theme.ink,
  },
  hkBtnText: { color: theme.white, fontSize: 13, fontWeight: '700' },

  resetWrap: { alignItems: 'center', paddingVertical: 12 },
  resetText: { fontSize: 11, color: theme.inkLight, textDecorationLine: 'underline' },

  toast: {
    position: 'absolute', bottom: 140, left: 24, right: 24,
    backgroundColor: theme.ink, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center',
  },
  toastText: { color: theme.paper, fontSize: 13, fontWeight: '600' },

  adContainer: {
    backgroundColor: theme.paper,
    borderTopWidth: 1, borderTopColor: theme.line,
    alignItems: 'center',
  },
  removeAdBtn: {
    paddingVertical: 5,
  },
  removeAdText: {
    fontSize: 10, color: theme.inkLight,
    textDecorationLine: 'underline',
  },
});
