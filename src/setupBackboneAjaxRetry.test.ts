import Backbone from 'backbone';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, it, expect, describe } from 'vitest';
import linearDelay from './linearDelay';
import hasRetryableStatus from './hasRetryableStatus';
import setupBackboneAjaxRetry from './setupBackboneAjaxRetry';

let count = 0;

const server = setupServer(
  http.get('http://api.akatsuki.com/members/2', () => {
    return new HttpResponse(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }),

  http.get('http://api.akatsuki.com/members', () => {
    count++;

    if (count % 4 === 0) {
      return HttpResponse.json({
        id: 3,
        name: 'Uchiha Itachi',
      });
    }

    return new HttpResponse(null, {
      status: 429,
      statusText: 'Too Many Requests',
    });
  }),
);

interface MemberAttributes {
  id: number;
  name: string;
}

class Member extends Backbone.Model<MemberAttributes> {
  override url = () => `http://api.akatsuki.com/members/${this.id}`;
}

class Members extends Backbone.Collection<Member> {
  override url = () => 'http://api.akatsuki.com/members';
}

describe('setupBackboneAjaxRetry', () => {
  beforeAll(() => server.listen());

  it('retries when request returns status 429', async () => {
    setupBackboneAjaxRetry(Backbone, {
      retries: 3,
      delay: linearDelay(200),
    });

    const members = new Members();

    await members.fetch();

    expect(count).toBe(4);

    expect(members.at(0).toJSON()).toEqual({
      id: 3,
      name: 'Uchiha Itachi',
    });

    count = 0;
  });

  it('defines great settings as default', async () => {
    setupBackboneAjaxRetry(Backbone);

    expect(Backbone.retry.retries).toBe(3);
    expect(Backbone.retry.delay(1)).toBe(200);
    expect(Backbone.retry.delay(2)).toBe(400);
    expect(Backbone.retry.condition).toBe(hasRetryableStatus);

    // For me these were great.
  });

  afterAll(() => server.close());
});
