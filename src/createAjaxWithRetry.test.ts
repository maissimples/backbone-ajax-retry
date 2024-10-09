import Backbone from 'backbone';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import createAjaxWithRetry from './createAjaxWithRetry';
import type { BackboneAjax } from './types';
import hasRetryableStatus from './hasRetryableStatus';
import linearDelay from './linearDelay';

const BASE_URL = 'https://api.akatsuki.com';

let count = 0;

const server = setupServer(
  http.get(`${BASE_URL}/bijuu/9`, () => {
    return new HttpResponse(null, {
      status: 502,
      statusText: 'Bad Gateway',
    });
  }),
  http.post(`${BASE_URL}/bijuu/1`, async () => {
    count += 1;

    if (count % 2 === 0) {
      return HttpResponse.json({
        id: 1,
        name: 'Shukaku',
      });
    }

    return new HttpResponse(null, {
      status: 502,
      statusText: 'Bad Gateway',
    });
  }),
);

class Bijuu extends Backbone.Model<{ id: number; name: string }> {
  override retries = 3;
  override retryOnCreate = false;

  override url = () => `${BASE_URL}/bijuu/${this.id}`;
}

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

  it("doesn't retry on create methods by default", async () => {
    Backbone.retry = {
      delay: linearDelay(200),
      retries: 2,
      condition: hasRetryableStatus,
    };

    const jqXHR = ajax({
      url: `${BASE_URL}/bijuu/1`,
      tries: 1,
      method: 'POST',
      backbone: {
        model: new Bijuu({ id: 1, name: 'Shukaku' }),
        sync: { method: 'create' },
      },
    });

    await jqXHR.catch(
      // A regular function was used to preserve 'this' context.
      function (this: JQueryAjaxSettings, jqXHR) {
        expect(this.tries).toBe(1); // It didn't tried again.

        expect(jqXHR.status).toBe(502);
        expect(jqXHR.statusText).toBe('Bad Gateway');
      },
    );

    expect(count).toBe(1);
  });

  afterAll(() => server.close());
});
