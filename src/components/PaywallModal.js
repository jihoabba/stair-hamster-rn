import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { theme } from '../styles/theme';
import { STAGES } from '../constants/stages';

export function PaywallModal({ visible, onClose, onPurchase }) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.85);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  const stage6 = STAGES[5]; // 헤드밴드 햄찌

  return (
    <Modal transparent animationType="none" visible={visible}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.box, { opacity, transform: [{ scale }] }]}>
          <Text style={styles.lock}>🔒</Text>
          <Text style={styles.title}>햄찌의 여정을{'\n'}계속하려면?</Text>
          <View style={styles.previewWrap}>
            <Image source={stage6.image} style={styles.previewImg} resizeMode="contain" blurRadius={4} />
            <View style={styles.previewDim} />
            <Text style={styles.previewLabel}>STAGE 6–10 잠금됨</Text>
          </View>
          <Text style={styles.desc}>전체 해금 시 10단계까지{'\n'}모든 햄찌와 아이템 해금!</Text>

          <TouchableOpacity style={styles.buyBtn} onPress={onPurchase} activeOpacity={0.85}>
            <Text style={styles.buyBtnText}>990원으로 전체 해금</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.laterBtn}>
            <Text style={styles.laterText}>나중에</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(46,18,24,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
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
  lock: {
    fontSize: 36,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.ink,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  previewWrap: {
    width: 100,
    height: 100,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImg: {
    width: 100,
    height: 100,
    opacity: 0.35,
  },
  previewDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
  },
  previewLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '800',
    color: theme.ink,
    letterSpacing: 1,
    textAlign: 'center',
  },
  desc: {
    fontSize: 13,
    color: theme.inkLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buyBtn: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.ink,
    paddingHorizontal: 32,
    paddingVertical: 13,
    width: '100%',
    alignItems: 'center',
    shadowColor: theme.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 12,
  },
  buyBtnText: {
    color: theme.white,
    fontSize: 15,
    fontWeight: '800',
  },
  laterBtn: {
    paddingVertical: 6,
  },
  laterText: {
    fontSize: 12,
    color: theme.inkLight,
    textDecorationLine: 'underline',
  },
});
