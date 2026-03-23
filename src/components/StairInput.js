import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHealthKit } from '../hooks/useHealthKit';
import { theme } from '../styles/theme';

export function StairInput({ onSubmit, onReset }) {
  const [inputValue, setInputValue] = useState('');
  const { isLoading, fetchTodayFlights } = useHealthKit();

  const handleManualSubmit = () => {
    const val = parseInt(inputValue);
    if (!val || val <= 0) {
      Alert.alert('', '계단 수를 입력해!');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(val);
    setInputValue('');
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
              onSubmit(flights);
            },
          },
        ]
      );
    } catch {
      Alert.alert('오류', 'HealthKit에 접근할 수 없어요.\n설정 > 개인 정보 보호 > 건강에서 권한을 확인해주세요.');
    }
  };

  const handleReset = () => {
    Alert.alert('처음부터?', '정말 리셋할까요?', [
      { text: '아니요', style: 'cancel' },
      { text: '네', style: 'destructive', onPress: onReset },
    ]);
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.sectionLabel}>오늘의 계단 기록</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder="오늘 오른 계단 수"
          placeholderTextColor={theme.line}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleManualSubmit}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit}>
          <Text style={styles.submitBtnText}>기록</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.healthKitBtn}
        onPress={handleHealthKitFetch}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading
          ? <ActivityIndicator color={theme.white} size="small" />
          : <Text style={styles.healthKitBtnText}>🍎  HealthKit에서 오늘 계단 가져오기</Text>
        }
      </TouchableOpacity>

      <Text style={styles.hint}>
        🔥 3일 연속 x1.5배 / 7일 연속 x2.0배 보너스
      </Text>

      <TouchableOpacity onPress={handleReset}>
        <Text style={styles.resetText}>처음부터 다시</Text>
      </TouchableOpacity>
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
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.ink,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.ink,
    backgroundColor: theme.bg,
  },
  submitBtn: {
    backgroundColor: theme.ink,
    borderRadius: 8,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  submitBtnText: {
    color: theme.paper,
    fontSize: 14,
    fontWeight: '700',
  },
  healthKitBtn: {
    backgroundColor: theme.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: theme.ink,
    shadowColor: theme.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  healthKitBtnText: {
    color: theme.white,
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    fontSize: 11,
    color: theme.inkLight,
    marginBottom: 12,
    lineHeight: 18,
  },
  resetText: {
    fontSize: 11,
    color: theme.inkLight,
    textDecorationLine: 'underline',
    textAlign: 'right',
  },
});
