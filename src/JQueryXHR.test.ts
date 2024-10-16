/* eslint @typescript-eslint/no-explicit-any: "off" */

import Backbone from 'backbone';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, beforeAll, beforeEach, describe, it, expect } from 'vitest';
import JQueryXHR from './JQueryXHR';

const BASE_URL = 'https://api.akatsuki.com';

const server = setupServer(
  http.get(`${BASE_URL}/members/2`, async () => {
    return new HttpResponse(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }),

  http.get(`${BASE_URL}/members/3`, async () => {
    return HttpResponse.json({
      id: 3,
      name: 'Uchiha Itachi',
    });
  }),
);

describe('JQueryXHRController', () => {
  beforeAll(() => server.listen());

  describe('JQueryXHR.asProxy', () => {
    it('intercepts JQuery.jqXHR error', async () => {
      const context = {
        jqXHR: Backbone.$.ajax(`${BASE_URL}/members/2`),
      };

      const jqXHR = JQueryXHR.asProxy({
        context: context,
        onAbort: Backbone.$.noop,
        onError: function (
          this: JQuery.AjaxSettings,
          jqXHR: JQuery.jqXHR,
          status: JQuery.Ajax.ErrorTextStatus,
          statusText: string,
        ): JQuery.jqXHR {
          // The context is ajax' settings.
          expect(this).toEqual(
            expect.objectContaining({
              url: `${BASE_URL}/members/2`,
            }),
          );

          // The 1st argument is ajax' request.
          expect(jqXHR.status).toBe(404);
          expect(jqXHR.statusText).toBe('Not Found');

          // The 2nd argument is ajax' status.
          expect(status).toBe('error');

          // The 3rd argument is response status text.
          expect(statusText).toBe('Not Found');

          // @ts-expect-error because 'intercepted' property isn't defined.
          jqXHR.intercepted = true;

          return jqXHR;
        },
      });

      await jqXHR.catch((jqXHR) => {
        // @ts-expect-error because 'intercepted' property isn't defined.
        expect(jqXHR.intercepted).toBe(true);
      });
    });

    let handleError: (
      this: JQuery.AjaxSettings,
      jqXHR: JQuery.jqXHR,
      status: JQuery.Ajax.ErrorTextStatus,
      statusText: string,
    ) => JQuery.Deferred<any>;

    beforeEach(() => {
      handleError = function (...args) {
        const deferred = Backbone.$.Deferred<any>();
        return deferred.rejectWith(this, args);
      };
    });

    it("supports 'jqXHR.abort' method", async () => {
      let jqXHR = Backbone.$.ajax(`${BASE_URL}/members/2`);

      const context = { jqXHR };

      jqXHR = JQueryXHR.asProxy({
        context,
        onError: handleError,
        onAbort: (statusText) => context.jqXHR.abort(statusText),
      });

      jqXHR.abort();

      await jqXHR.catch((jqXHR) => {
        // 'jqXHR.abort' works fine.
        expect(jqXHR).toEqual(
          expect.objectContaining({
            status: 0,
            statusText: 'abort',
          }),
        );
      });
    });

    it("supports 'jqXHR.getAllResponseHeaders' method", async () => {
      let jqXHR = Backbone.$.ajax(`${BASE_URL}/members/3`);

      jqXHR = JQueryXHR.asProxy({
        context: { jqXHR },
        onError: handleError,
        onAbort: (statusText) => jqXHR.abort(statusText),
      });

      await jqXHR;

      // 'jqXHR.getAllResponseHeaders' works fine.
      expect(
        jqXHR.getAllResponseHeaders(),
        'content-length: 31\ncontent-type: application/json',
      );
    });

    it("supports 'jqXHR.done' method", async () => {
      let jqXHR = Backbone.$.ajax(`${BASE_URL}/members/3`);

      jqXHR = JQueryXHR.asProxy({
        context: { jqXHR },
        onError: handleError,
        onAbort: (statusText) => jqXHR.abort(statusText),
      });

      await jqXHR.done((response, status, jqXHR) => {
        expect(response).toEqual({
          id: 3,
          name: 'Uchiha Itachi',
        });

        expect(status).toBe('success');

        expect(jqXHR).toEqual(
          expect.objectContaining({
            status: 200,
            statusText: 'OK',
          }),
        );
      });
    });

    it("supports 'jqXHR.then' method", async () => {
      let jqXHR = Backbone.$.ajax(`${BASE_URL}/members/3`);

      jqXHR = JQueryXHR.asProxy({
        context: { jqXHR },
        onError: handleError,
        onAbort: (statusText) => jqXHR.abort(statusText),
      });

      await jqXHR.then((response, status, jqXHR) => {
        expect(response).toEqual({
          id: 3,
          name: 'Uchiha Itachi',
        });

        expect(status).toBe('success');

        expect(jqXHR).toEqual(
          expect.objectContaining({
            status: 200,
            statusText: 'OK',
          }),
        );
      });
    });

    it("supports 'jqXHR.fail' method", async () => {
      let jqXHR = Backbone.$.ajax(`${BASE_URL}/members/2`);

      jqXHR = JQueryXHR.asProxy({
        context: { jqXHR },
        onError: handleError,
        onAbort: (statusText) => jqXHR.abort(statusText),
      });

      await jqXHR
        .fail((jqXHR, status, reason) => {
          expect(jqXHR).toEqual(
            expect.objectContaining({
              status: 404,
              statusText: 'Not Found',
            }),
          );

          expect(status).toBe('error');

          expect(reason).toBe('Not Found');
        })

        .catch(Backbone.$.noop);
    });

    it("supports 'jqXHR.catch' method", async () => {
      let jqXHR = Backbone.$.ajax(`${BASE_URL}/members/2`);

      jqXHR = JQueryXHR.asProxy({
        context: { jqXHR },
        onError: handleError,
        onAbort: (statusText) => jqXHR.abort(statusText),
      });

      await jqXHR.catch((jqXHR, status, reason) => {
        expect(jqXHR).toEqual(
          expect.objectContaining({
            status: 404,
            statusText: 'Not Found',
          }),
        );

        expect(status).toBe('error');

        expect(reason).toBe('Not Found');
      });
    });

    it("supports 'jqXHR.always' method", async () => {
      let jqXHR = Backbone.$.ajax(`${BASE_URL}/members/3`);

      jqXHR = JQueryXHR.asProxy({
        context: { jqXHR },
        onError: handleError,
        onAbort: (statusText) => jqXHR.abort(statusText),
      });

      await jqXHR
        .done(Backbone.$.noop)
        .always((response, status, jqXHR) => {
          expect(response).toEqual({
            id: 3,
            name: 'Uchiha Itachi',
          });

          expect(status).toBe('success');

          expect(jqXHR).toEqual(
            expect.objectContaining({
              status: 200,
              statusText: 'OK',
            }),
          );
        })
        .then(Backbone.$.noop)
        // '.always' after '.then' will be called without arguments.
        .always((...args) => expect(args).toHaveLength(0));

      jqXHR = Backbone.$.ajax(`${BASE_URL}/members/2`);

      jqXHR = JQueryXHR.asProxy({
        context: { jqXHR },
        onError: handleError,
        onAbort: (statusText) => jqXHR.abort(statusText),
      });

      await jqXHR
        .fail(Backbone.$.noop)
        .always((jqXHR, status, reason): void => {
          expect(jqXHR).toEqual(
            expect.objectContaining({
              status: 404,
              statusText: 'Not Found',
            }),
          );

          expect(status).toBe('error');

          expect(reason).toBe('Not Found');
        })
        .catch(Backbone.$.noop)
        // '.always' after '.catch' will be called without arguments.
        .always((...args) => expect(args).toHaveLength(0));
    });
  });

  afterAll(() => server.close());
});
