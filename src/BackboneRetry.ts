import type { BackboneRetryDelay } from './BackboneRetryDelay';

export type BackboneRetry = {
  /** @default linearDelay(1_000) */
  delay?: BackboneRetryDelay;

  /** @default 3 */
  retries?: number;

  condition?: (method: string, jqXHR: JQueryXHR) => boolean;
};
