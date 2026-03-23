import React from 'react';
import { Modal, View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export function LevelUpModal({ stage, onClose }) {
  if (!stage) return null;

  return (
    <Modal transparent animationType="fade" visible={!!stage}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.label}>— STAGE UP! —</Text>
          <Image source={stage.image} style={styles.image} resizeMode="contain" />
          <Text style={styles.title}>{stage.luTitle}</Text>
          <Text style={styles.desc}>{stage.luDesc}</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>계속하기 →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(46,18,24,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: theme.paper,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: theme.ink,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    shadowColor: theme.ink,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 4,
    color: theme.inkLight,
    marginBottom: 16,
  },
  image: {
    width: 110,
    height: 138,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.ink,
    marginBottom: 6,
    textAlign: 'center',
  },
  desc: {
    fontSize: 13,
    color: theme.inkLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: theme.accent,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.ink,
    paddingHorizontal: 28,
    paddingVertical: 12,
    shadowColor: theme.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  btnText: {
    color: theme.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
