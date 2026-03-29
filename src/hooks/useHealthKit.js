import { useState, useCallback, useEffect } from 'react';
import {
  requestAuthorization,
  queryStatisticsForQuantity,
} from '@kingstinct/react-native-healthkit';

const READ_TYPES = [
  'HKQuantityTypeIdentifierFlightsClimbed',
  'HKQuantityTypeIdentifierStepCount',
];

export function useHealthKit() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestAuth = useCallback(async () => {
    try {
      await requestAuthorization({ toRead: READ_TYPES, toShare: [] });
      setIsAuthorized(true);
    } catch (err) {
      console.log('[HealthKit] requestAuthorization error:', JSON.stringify(err));
      setError('HealthKit 권한이 거부됐어요');
      throw err;
    }
  }, []);

  useEffect(() => {
    requestAuth().catch((err) => {
      console.log('[HealthKit] 자동 권한 요청 실패:', JSON.stringify(err));
    });
  }, [requestAuth]);

  const fetchTodayFlights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAuthorized) await requestAuth();
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const result = await queryStatisticsForQuantity(
        'HKQuantityTypeIdentifierFlightsClimbed',
        ['cumulativeSum'],
        { filter: { date: { startDate, endDate } } },
      );
      setIsLoading(false);
      return Math.round(result?.sumQuantity?.quantity ?? 0);
    } catch (e) {
      setIsLoading(false);
      setError('HealthKit 읽기 실패');
      throw e;
    }
  }, [isAuthorized, requestAuth]);

  const fetchTodaySteps = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isAuthorized) await requestAuth();
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const result = await queryStatisticsForQuantity(
        'HKQuantityTypeIdentifierStepCount',
        ['cumulativeSum'],
        { filter: { date: { startDate, endDate } } },
      );
      setIsLoading(false);
      const steps = Math.round(result?.sumQuantity?.quantity ?? 0);
      // 1층 = 50보 환산
      const floors = Math.max(1, Math.round(steps / 50));
      return { steps, floors };
    } catch (e) {
      setIsLoading(false);
      setError('HealthKit 읽기 실패');
      throw e;
    }
  }, [isAuthorized, requestAuth]);

  return { isAuthorized, isLoading, error, fetchTodayFlights, fetchTodaySteps };
}
