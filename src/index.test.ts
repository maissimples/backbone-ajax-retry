import Backbone from 'backbone';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, it, expect } from 'vitest';
import './index';

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

    if (count % 3 === 0) {
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

beforeAll(() => server.listen());

it('retries when request returns status 429', async () => {
  const members = new Members();

  members.retries = 3;

  await members.fetch();

  expect(count).toBe(3);

  expect(members.at(0).toJSON()).toEqual({
    id: 3,
    name: 'Uchiha Itachi',
  });

  count = 0;
});

afterAll(() => server.close());
