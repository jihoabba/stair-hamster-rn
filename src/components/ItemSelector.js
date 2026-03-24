import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ITEMS } from '../constants/items';
import { theme } from '../styles/theme';

export function ItemSelector({ totalStairs, equippedItems, onToggle }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.label}>🎒 아이템</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {ITEMS.map(item => {
          const unlocked = totalStairs >= item.unlockAt;
          const equipped = equippedItems.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, equipped && styles.itemEquipped, !unlocked && styles.itemLocked]}
              onPress={() => unlocked && onToggle(item.id)}
              activeOpacity={unlocked ? 0.7 : 1}
            >
              <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>{item.emoji}</Text>
              <Text style={[styles.name, !unlocked && styles.nameLocked]}>{item.name}</Text>
              {!unlocked && (
                <Text style={styles.lockLabel}>{item.unlockAt.toLocaleString()}계단</Text>
              )}
              {equipped && <View style={styles.equippedDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    color: theme.inkLight,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  row: {
    gap: 10,
    paddingRight: 4,
  },
  item: {
    alignItems: 'center',
    backgroundColor: theme.bg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.line,
    padding: 10,
    width: 68,
  },
  itemEquipped: {
    borderColor: theme.accent,
    backgroundColor: 'rgba(224,77,114,0.08)',
  },
  itemLocked: {
    opacity: 0.38,
  },
  emoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  emojiLocked: {
    opacity: 0.5,
  },
  name: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.ink,
    textAlign: 'center',
  },
  nameLocked: {
    color: theme.inkLight,
  },
  lockLabel: {
    fontSize: 8,
    color: theme.inkLight,
    marginTop: 2,
    textAlign: 'center',
  },
  equippedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.accent,
    marginTop: 4,
  },
});
