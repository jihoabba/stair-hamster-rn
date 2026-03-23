import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export function WeekStreak({ weekLog }) {
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <View style={styles.panel}>
      <Text style={styles.sectionLabel}>이번 주 기록</Text>
      <View style={styles.row}>
        {DAYS.map((d, i) => {
          const isToday = i === todayIdx;
          const isActive = weekLog[i];
          return (
            <View
              key={i}
              style={[
                styles.day,
                isToday && styles.dayToday,
                !isToday && isActive && styles.dayActive,
              ]}
            >
              <Text style={[styles.dayText, (isToday || isActive) && styles.dayTextActive]}>
                {d}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.paper,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.ink,
    padding: 14,
    marginBottom: 12,
    shadowColor: theme.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    color: theme.inkLight,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  dayActive: {
    backgroundColor: theme.gold,
    borderColor: theme.gold,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.inkLight,
  },
  dayTextActive: {
    color: theme.white,
  },
});
