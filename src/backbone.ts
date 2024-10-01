declare module 'backbone' {
  interface Model {
    retries?: number;
  }

  interface Collection {
    retries?: number;
  }
}

export { default } from 'backbone';
