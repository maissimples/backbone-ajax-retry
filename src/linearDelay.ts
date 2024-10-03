import type { BackboneAjaxRetryDelay } from './types';

function linearDelay(delayFactor: number = 100): BackboneAjaxRetryDelay {
  return (retry: number): number => retry * delayFactor;
}

export default linearDelay;
