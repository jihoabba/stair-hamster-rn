import { STAGES } from '../constants/stages';

const FINAL_MAX = 25000;

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
  if (stairs < 100)   return Math.max(1, Math.floor(stairs / 20) + 1);
  if (stairs < 300)   return Math.floor(6  + (stairs - 100)  / 20);
  if (stairs < 700)   return Math.floor(16 + (stairs - 300)  / 40);
  if (stairs < 1500)  return Math.floor(26 + (stairs - 700)  / 80);
  if (stairs < 3000)  return Math.floor(36 + (stairs - 1500) / 150);
  if (stairs < 6000)  return Math.floor(46 + (stairs - 3000) / 300);
  if (stairs < 12000) return Math.floor(56 + (stairs - 6000) / 600);
  if (stairs < 25000) return Math.floor(66 + (stairs - 12000) / 1300);
  return 80;
}

export { FINAL_MAX };
