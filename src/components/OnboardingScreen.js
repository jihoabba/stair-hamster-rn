import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView } from 'react-native';
import { theme } from '../styles/theme';

export function OnboardingScreen({ onSelect }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Image
          source={require('../../assets/hamster_7.png')}
          style={styles.hamster}
          resizeMode="contain"
        />
        <Text style={styles.title}>햄찌와 함께{'\n'}운동할 방법을 선택해줘!</Text>
        <Text style={styles.sub}>언제든지 설정에서 바꿀 수 있어요</Text>

        <TouchableOpacity style={styles.card} onPress={() => onSelect('stairs')} activeOpacity={0.82}>
          <Text style={styles.cardEmoji}>🪜</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>계단 층수</Text>
            <Text style={styles.cardDesc}>오늘 오른 층 수를 직접 입력하거나{'\n'}건강 앱에서 자동으로 가져와요</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => onSelect('steps')} activeOpacity={0.82}>
          <Text style={styles.cardEmoji}>🦶</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>걸음 수</Text>
            <Text style={styles.cardDesc}>하루 1만보 목표{'\n'}1만보 = 10층으로 환산돼요</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  hamster: { width: 110, height: 110, marginBottom: 4 },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.ink,
    textAlign: 'center',
    lineHeight: 30,
  },
  sub: {
    fontSize: 12,
    color: theme.inkLight,
    marginTop: -8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.paper,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: theme.ink,
    padding: 18,
    width: '100%',
    gap: 16,
    shadowColor: theme.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardEmoji: { fontSize: 34 },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.ink,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: theme.inkLight,
    lineHeight: 18,
  },
});
