import type { BackboneRetryDelay } from './BackboneRetryDelay';

function linearDelay(delayFactor: number = 100): BackboneRetryDelay {
  return (retry: number): number => retry * delayFactor;
}

export default linearDelay;
