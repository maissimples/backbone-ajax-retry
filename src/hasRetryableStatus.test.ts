import Backbone from 'backbone';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import hasRetryableStatus from './hasRetryableStatus';

const BASE_URL = 'https://api.akatsuki.com';

const server = setupServer(
  http.get(`${BASE_URL}/bijuu/9`, async () => {
    return new HttpResponse(null, {
      status: 502,
      statusText: 'Bad Gateway',
    });
  }),

  http.get(`${BASE_URL}/bijuu/8`, async () => {
    return new HttpResponse(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }),
);

describe('hasRetryableStatus', () => {
  beforeAll(() => server.listen());

  it('checks if jqXHR has retryable status code', async () => {
    await Backbone.ajax({ url: BASE_URL.concat('/bijuu/9') }).catch((jqXHR) => {
      expect(hasRetryableStatus(jqXHR)).toBe(true);
    });

    await Backbone.ajax({ url: BASE_URL.concat('/bijuu/8') }).catch((jqXHR) => {
      expect(hasRetryableStatus(jqXHR)).toBe(false);
    });
  });

  afterAll(() => server.close());
});
