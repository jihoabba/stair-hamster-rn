import { useState, useEffect, useCallback } from 'react';
import { loadState, saveState } from '../utils/storage';
import { getCurrentStage } from '../utils/gameLogic';
import { trackNeglectPenalty } from '../utils/analytics';

function daysBetween(dateStrA, dateStrB) {
  if (!dateStrA || !dateStrB) return 0;
  const a = new Date(dateStrA);
  const b = new Date(dateStrB);
  return Math.floor((b - a) / 86400000);
}

export function useGameState() {
  const [totalStairs, setTotalStairs] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weekLog, setWeekLog] = useState(Array(7).fill(false));
  const [lastLogDate, setLastLogDate] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [mode, setMode] = useState('steps'); // 'stairs' | 'steps' | null (null = not onboarded)
  const [penaltyStatus, setPenaltyStatus] = useState(0); // 0=ok, 1=hungry, 2=sick, 3=down
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadState().then(s => {
      if (!s) { setIsLoaded(true); return; }
      const savedTotal = s.totalStairs ?? 0;
      const savedLastLog = s.lastLogDate ?? null;

      // Apply neglect penalty on load
      const today = new Date().toDateString();
      const days = daysBetween(savedLastLog, today);
      let penalty = 0;
      let status = 0;
      if (days >= 3) { penalty = 10; status = 3; }
      else if (days === 2) { penalty = 5; status = 2; }
      else if (days === 1) { penalty = 2; status = 1; }

      // Only apply if penalty not already applied today
      const lastPenaltyDate = s.lastPenaltyDate ?? null;
      let newTotal = savedTotal;
      let newLastPenaltyDate = lastPenaltyDate;
      if (penalty > 0 && lastPenaltyDate !== today) {
        newTotal = Math.max(0, savedTotal - penalty);
        newLastPenaltyDate = today;
      } else if (penalty === 0) {
        status = 0;
      }

      setTotalStairs(newTotal);
      setStreak(s.streak ?? 0);
      setWeekLog(s.weekLog ?? Array(7).fill(false));
      setLastLogDate(savedLastLog);
      setIsPremium(s.isPremium ?? false);
      setMode(s.mode ?? null);
      setPenaltyStatus(status);

      if (newTotal !== savedTotal) {
        saveState({ ...s, totalStairs: newTotal, lastPenaltyDate: newLastPenaltyDate });
        trackNeglectPenalty({ daysMissed: days, penalty, status });
      }
      setIsLoaded(true);
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

    setPenaltyStatus(0); // reset sick state on activity
    setTotalStairs(newTotal);
    setStreak(newStreak);
    setWeekLog(newWeekLog);
    setLastLogDate(newLastLogDate);
    await saveState({ totalStairs: newTotal, streak: newStreak, weekLog: newWeekLog, lastLogDate: newLastLogDate, isPremium, mode });

    return { earned, bonus, newTotal, newStage: getCurrentStage(newTotal), prevStage };
  }, [totalStairs, streak, weekLog, lastLogDate, isPremium, mode]);

  const unlockPremium = useCallback(async () => {
    setIsPremium(true);
    await saveState({ totalStairs, streak, weekLog, lastLogDate, isPremium: true, mode });
  }, [totalStairs, streak, weekLog, lastLogDate, mode]);

  const completeOnboarding = useCallback(async (selectedMode) => {
    setMode(selectedMode);
    await saveState({ totalStairs, streak, weekLog, lastLogDate, isPremium, mode: selectedMode });
  }, [totalStairs, streak, weekLog, lastLogDate, isPremium]);

  const resetGame = useCallback(async () => {
    setTotalStairs(0);
    setStreak(0);
    setWeekLog(Array(7).fill(false));
    setLastLogDate(null);
    setPenaltyStatus(0);
    await saveState({ totalStairs: 0, streak: 0, weekLog: Array(7).fill(false), lastLogDate: null, isPremium, mode });
  }, [isPremium, mode]);

  return {
    totalStairs, streak, weekLog, lastLogDate,
    isPremium, mode, penaltyStatus, isLoaded,
    addStairs, unlockPremium, completeOnboarding, resetGame,
  };
}
