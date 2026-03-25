import { STAGES } from '../constants/stages';

const FINAL_MAX = 4200;

export function getCurrentStage(stairs) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (stairs >= STAGES[i].minStairs) return STAGES[i];
  }
  return STAGES[0];
}

export function getNextThreshold(stairs) {
  for (let i = 0; i < STAGES.length; i++) {
    if (stairs < STAGES[i].minStairs) return STAGES[i].minStairs;
  }
  return FINAL_MAX;
}

export function calcLevel(stairs) {
  return Math.min(99, Math.floor(stairs / 43) + 1);
}

export { FINAL_MAX };
