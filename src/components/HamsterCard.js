import React, { useRef, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../styles/theme';
import { calcLevel, getNextThreshold, FINAL_MAX } from '../utils/gameLogic';

export function HamsterCard({ stage, totalStairs, streak }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: -5, duration: 1500, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0,  duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const level = calcLevel(totalStairs);
  const nextThreshold = getNextThreshold(totalStairs);
  const isMax = totalStairs >= FINAL_MAX;
  const range = nextThreshold - stage.minStairs;
  const pct = Math.min(100, (totalStairs - stage.minStairs) / range * 100);

  return (
    <View style={styles.card}>
      <View style={styles.charDisplay}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <Image source={stage.image} style={styles.charImage} resizeMode="contain" />
        </Animated.View>
        <View style={styles.stageLabel}>
          <Text style={styles.stageLabelText}>{stage.stageLabel}</Text>
        </View>
      </View>

      <View style={styles.charInfo}>
        <Text style={styles.charTitle}>{stage.title}</Text>
        <Text style={styles.charSubtitle}>{stage.subtitle}</Text>

        <View style={styles.levelRow}>
          <View style={styles.lvBadge}><Text style={styles.lvBadgeText}>LV</Text></View>
          <Text style={styles.lvNum}>{level}</Text>
        </View>

        <View style={styles.xpSection}>
          <View style={styles.xpLabelRow}>
            <Text style={styles.xpLabel}>NEXT STAGE</Text>
            <Text style={styles.xpLabel}>
              {totalStairs.toLocaleString()} / {isMax ? 'MAX' : nextThreshold.toLocaleString()}
            </Text>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${pct}%` }]} />
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statChip}>
            <Text style={styles.statChipText}>누적 <Text style={styles.statChipBold}>{totalStairs.toLocaleString()}</Text>계단</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statChipText}>연속 <Text style={styles.statChipBold}>{streak}</Text>일</Text>
          </View>
          {streak >= 3 && (
            <View style={styles.statChip}>
              <Text style={styles.statChipText}>🔥 <Text style={styles.statChipBold}>{streak >= 7 ? 'x2.0' : 'x1.5'}</Text></Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.paper,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.ink,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    shadowColor: theme.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  charDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 96,
  },
  charImage: {
    width: 90,
    height: 110,
  },
  stageLabel: {
    backgroundColor: theme.ink,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  stageLabelText: {
    color: theme.paper,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },
  charInfo: {
    flex: 1,
  },
  charTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.ink,
    marginBottom: 2,
  },
  charSubtitle: {
    fontSize: 11,
    color: theme.inkLight,
    marginBottom: 10,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  lvBadge: {
    backgroundColor: theme.accent,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  lvBadgeText: {
    color: theme.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  lvNum: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.ink,
  },
  xpSection: {
    marginBottom: 10,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  xpLabel: {
    fontSize: 9,
    color: theme.inkLight,
    letterSpacing: 1,
  },
  xpTrack: {
    height: 6,
    backgroundColor: theme.line,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: theme.accent,
    borderRadius: 3,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  statChip: {
    backgroundColor: theme.bg,
    borderWidth: 1.5,
    borderColor: theme.line,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statChipText: {
    fontSize: 10,
    color: theme.ink,
  },
  statChipBold: {
    fontWeight: '700',
  },
});
