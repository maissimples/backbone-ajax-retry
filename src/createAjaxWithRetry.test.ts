import Backbone from 'backbone';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import createAjaxWithRetry from './createAjaxWithRetry';
import type { BackboneAjax } from './types';
import hasRetryableStatus from './hasRetryableStatus';
import linearDelay from './linearDelay';

const BASE_URL = 'https://api.akatsuki.com';

const server = setupServer(
  http.get(`${BASE_URL}/bijuu/9`, async () => {
    return new HttpResponse(null, {
      status: 502,
      statusText: 'Bad Gateway',
    });
  }),
);

describe('createAjaxWithRetry', () => {
  let ajax: BackboneAjax;

  beforeAll(() => server.listen());

  beforeEach(() => {
    ajax = createAjaxWithRetry(Backbone);
  });

  it('supports abort within delay', async () => {
    Backbone.retry = {
      delay: linearDelay(200),
      retries: 1,
      condition: hasRetryableStatus,
    };

    const jqXHR = ajax({ url: `${BASE_URL}/bijuu/9`, tries: 1 });

    setTimeout(() => jqXHR.abort(), 100);

    await jqXHR.catch(
      // A regular function was used to preserve 'this' context.
      function (this: JQueryAjaxSettings, jqXHR, status, statusText) {
        expect(this.tries).toBe(2);

        expect(jqXHR.status).toBe(0);
        expect(jqXHR.statusText).toBe('abort');
        expect(jqXHR.readyState).toBe(0);
        expect(jqXHR.state()).toBe('rejected');

        expect(status).toBe('abort');
        expect(statusText).toBe('abort');
      },
    );
  });

  afterAll(() => server.close());
});
