import * as FileSystem from 'expo-file-system/legacy';

const FILE_URI = FileSystem.documentDirectory + 'stairHeroV2.json';

export const loadState = async () => {
  try {
    const info = await FileSystem.getInfoAsync(FILE_URI);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(FILE_URI);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveState = async (state) => {
  try {
    await FileSystem.writeAsStringAsync(FILE_URI, JSON.stringify(state));
  } catch (e) {
    console.warn('저장 실패:', e);
  }
};
