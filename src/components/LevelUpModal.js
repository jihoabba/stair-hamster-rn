import React, { useEffect, useRef } from 'react';
import { Modal, View, Image, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { theme } from '../styles/theme';

const { width: SW, height: SH } = Dimensions.get('window');

const SPARKS = Array.from({ length: 20 }, (_, i) => i);

function Sparkle({ delay }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(0)).current;
  const tx     = useRef(new Animated.Value(0)).current;
  const ty     = useRef(new Animated.Value(0)).current;

  const x = Math.random() * SW;
  const y = Math.random() * SH;
  const tx2 = (Math.random() - 0.5) * 100;
  const ty2 = (Math.random() - 0.5) * 100;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(tx,      { toValue: tx2, duration: 800, useNativeDriver: true }),
          Animated.timing(ty,      { toValue: ty2, duration: 800, useNativeDriver: true }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const emojis = ['✨', '⭐', '🌟', '💫', '🎉'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: 18 + Math.random() * 14,
        opacity,
        transform: [{ scale }, { translateX: tx }, { translateY: ty }],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

export function LevelUpModal({ stage, onClose }) {
  const boxScale = useRef(new Animated.Value(0.7)).current;
  const boxOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!stage) return;
    boxScale.setValue(0.7);
    boxOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(boxScale,  { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(boxOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [stage]);

  if (!stage) return null;

  return (
    <Modal transparent animationType="none" visible={!!stage}>
      <View style={styles.overlay}>
        {/* Sparkles */}
        {SPARKS.map(i => <Sparkle key={i} delay={i * 80} />)}

        {/* Modal box */}
        <Animated.View style={[styles.box, { opacity: boxOpacity, transform: [{ scale: boxScale }] }]}>
          <Text style={styles.label}>— STAGE UP! —</Text>
          <Text style={styles.stageTag}>{stage.stageLabel}</Text>
          <Image source={stage.image} style={styles.image} resizeMode="contain" />
          <Text style={styles.title}>{stage.luTitle}</Text>
          <Text style={styles.desc}>{stage.luDesc}</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>계속하기 →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(46,18,24,0.82)',
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
    marginBottom: 6,
  },
  stageTag: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    color: theme.white,
    backgroundColor: theme.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 14,
    overflow: 'hidden',
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
