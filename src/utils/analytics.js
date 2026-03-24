import { Platform } from 'react-native';

let analytics = null;

async function getAnalytics() {
  if (analytics) return analytics;
  try {
    const mod = await import('@react-native-firebase/analytics');
    analytics = mod.default();
    return analytics;
  } catch {
    return null;
  }
}

async function logEvent(name, params = {}) {
  try {
    const a = await getAnalytics();
    if (!a) return;
    await a.logEvent(name, params);
  } catch {
    // silently fail — GoogleService-Info.plist not yet configured
  }
}

// ── App start ──
export async function trackAppOpen() {
  await logEvent('app_open', { platform: Platform.OS });
}

// ── 층수 기록 ──
export async function trackRecordStairs({ value, bonus, mode, newTotal }) {
  await logEvent('record_stairs', {
    value,
    bonus: String(bonus),
    mode,
    new_total: newTotal,
  });
}

// ── 스테이지업 ──
export async function trackStageUp({ stageLabel, stageIndex }) {
  await logEvent('stage_up', {
    stage_label: stageLabel,
    stage_index: stageIndex,
  });
}

// ── 방치 패널티 ──
export async function trackNeglectPenalty({ daysMissed, penalty, status }) {
  await logEvent('neglect_penalty', {
    days_missed: daysMissed,
    penalty,
    status,
  });
}

// ── 페이월 노출 ──
export async function trackPaywallShown() {
  await logEvent('paywall_shown');
}

// ── 광고 제거 버튼 클릭 ──
export async function trackRemoveAdsClicked() {
  await logEvent('remove_ads_clicked');
}
