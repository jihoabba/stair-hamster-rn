import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MILESTONES } from '../constants/milestones';
import { theme } from '../styles/theme';

export function MilestoneList({ totalStairs }) {
  const sorted = [...MILESTONES].sort((a, b) => a.stairs - b.stairs);
  const nextMilestone = sorted.find(m => totalStairs < m.stairs);

  return (
    <View style={styles.panel}>
      <Text style={styles.sectionLabel}>높이 달성 기록</Text>
      {sorted.map((m, i) => {
        const done = totalStairs >= m.stairs;
        const isCurrent = m === nextMilestone;
        return (
          <View key={i} style={styles.row}>
            <View style={[
              styles.dot,
              done && styles.dotDone,
              !done && isCurrent && styles.dotCurrent,
            ]} />
            <Text style={styles.name}>{m.icon} {m.name}</Text>
            <Text style={styles.meters}>{m.floors.toLocaleString()}층</Text>
            {done && <Text style={styles.doneTag}>✓ 달성</Text>}
          </View>
        );
      })}
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
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.line,
  },
  dotDone: {
    backgroundColor: theme.accent,
  },
  dotCurrent: {
    backgroundColor: theme.gold,
  },
  name: {
    flex: 1,
    fontSize: 12,
    color: theme.ink,
  },
  meters: {
    fontSize: 12,
    color: theme.inkLight,
    fontWeight: '600',
    marginRight: 4,
  },
  doneTag: {
    fontSize: 10,
    color: theme.accent,
    fontWeight: '700',
  },
});
