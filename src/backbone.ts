import type { BackboneRetry } from './BackboneRetry';

declare module 'backbone' {
  /** @default false */
  let retry: BackboneRetry | false;

  interface Model {
    retries?: number;
  }

  interface Collection {
    retries?: number;
  }
}

export { default } from 'backbone';
