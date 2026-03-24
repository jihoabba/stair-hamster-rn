import { useState, useCallback } from 'react';
import AppleHealthKit from 'react-native-health';

const PERMISSIONS = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.FlightsClimbed,
      AppleHealthKit.Constants.Permissions.Steps,
    ],
    write: [],
  },
};

export function useHealthKit() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestAuthorization = useCallback(() => {
    return new Promise((resolve, reject) => {
      AppleHealthKit.initHealthKit(PERMISSIONS, (err) => {
        if (err) {
          setError('HealthKit 권한이 거부됐어요');
          reject(err);
        } else {
          setIsAuthorized(true);
          resolve();
        }
      });
    });
  }, []);

  const fetchTodayFlights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAuthorized) await requestAuthorization();
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
      const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
      return new Promise((resolve, reject) => {
        AppleHealthKit.getFlightsClimbed(
          { startDate: startOfDay, endDate: endOfDay, includeManuallyAdded: false },
          (err, results) => {
            setIsLoading(false);
            if (err) { setError('HealthKit 읽기 실패'); reject(err); return; }
            const total = results.reduce((sum, r) => sum + (r.value || 0), 0);
            resolve(Math.round(total));
          }
        );
      });
    } catch (e) {
      setIsLoading(false);
      setError(e.message);
      throw e;
    }
  }, [isAuthorized, requestAuthorization]);

  const fetchTodaySteps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAuthorized) await requestAuthorization();
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
      const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
      return new Promise((resolve, reject) => {
        AppleHealthKit.getStepCount(
          { startDate: startOfDay, endDate: endOfDay },
          (err, result) => {
            setIsLoading(false);
            if (err) { setError('HealthKit 읽기 실패'); reject(err); return; }
            const steps = result?.value ?? 0;
            // 1만보 = 10층 환산
            const floors = Math.round((steps / 10000) * 10);
            resolve({ steps: Math.round(steps), floors });
          }
        );
      });
    } catch (e) {
      setIsLoading(false);
      setError(e.message);
      throw e;
    }
  }, [isAuthorized, requestAuthorization]);

  return { isAuthorized, isLoading, error, fetchTodayFlights, fetchTodaySteps };
}
