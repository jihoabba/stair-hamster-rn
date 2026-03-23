import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'stairHeroV2';

export const loadState = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveState = async (state) => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('저장 실패:', e);
  }
};
