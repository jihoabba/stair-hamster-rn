import { useState, useEffect, useCallback } from 'react';
import { loadState, saveState } from '../utils/storage';
import { getCurrentStage } from '../utils/gameLogic';

export function useGameState() {
  const [totalStairs, setTotalStairs] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weekLog, setWeekLog] = useState(Array(7).fill(false));
  const [lastLogDate, setLastLogDate] = useState(null);
  const [equippedItems, setEquippedItems] = useState([]);

  useEffect(() => {
    loadState().then(s => {
      if (!s) return;
      setTotalStairs(s.totalStairs ?? 0);
      setStreak(s.streak ?? 0);
      setWeekLog(s.weekLog ?? Array(7).fill(false));
      setLastLogDate(s.lastLogDate ?? null);
      setEquippedItems(s.equippedItems ?? []);
    });
  }, []);

  const addStairs = useCallback(async (val) => {
    const prevStage = getCurrentStage(totalStairs);
    const bonus = streak >= 7 ? 2 : streak >= 3 ? 1.5 : 1;
    const earned = Math.floor(val * bonus);
    const newTotal = totalStairs + earned;

    const today = new Date().toDateString();
    const todayIdx = (new Date().getDay() + 6) % 7;
    let newStreak = streak;
    let newWeekLog = [...weekLog];
    let newLastLogDate = lastLogDate;

    if (lastLogDate !== today) {
      newWeekLog[todayIdx] = true;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      newStreak = lastLogDate === yesterday ? streak + 1 : 1;
      newLastLogDate = today;
    }

    const newState = { totalStairs: newTotal, streak: newStreak, weekLog: newWeekLog, lastLogDate: newLastLogDate, equippedItems };
    setTotalStairs(newTotal);
    setStreak(newStreak);
    setWeekLog(newWeekLog);
    setLastLogDate(newLastLogDate);
    await saveState(newState);

    return { earned, bonus, newTotal, newStage: getCurrentStage(newTotal), prevStage };
  }, [totalStairs, streak, weekLog, lastLogDate]);

  const toggleItem = useCallback(async (itemId) => {
    const next = equippedItems.includes(itemId)
      ? equippedItems.filter(id => id !== itemId)
      : [...equippedItems, itemId];
    setEquippedItems(next);
    await saveState({ totalStairs, streak, weekLog, lastLogDate, equippedItems: next });
  }, [equippedItems, totalStairs, streak, weekLog, lastLogDate]);

  const resetGame = useCallback(async () => {
    const init = { totalStairs: 0, streak: 0, weekLog: Array(7).fill(false), lastLogDate: null, equippedItems: [] };
    setTotalStairs(0);
    setStreak(0);
    setWeekLog(Array(7).fill(false));
    setLastLogDate(null);
    setEquippedItems([]);
    await saveState(init);
  }, []);

  return { totalStairs, streak, weekLog, lastLogDate, equippedItems, addStairs, toggleItem, resetGame };
}
