/*!
 * backbone-retry-requests v0.0.0
 * (c) Vitor Luiz Cavalcanti
 * Released under the MIT License.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
  typeof define === 'function' && define.amd ? define(['exports', 'jquery'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.BackboneRetryRequests = {}, global.$));
})(this, (function (exports, $) { 'use strict';

  function linearDelay(delayFactor = 100) {
      return (retry) => retry * delayFactor;
  }

  /** Both `Too Many Requests` and `Request Timeout` statuses are retryable. */
  const RETRYABLE_STATUSES = [408, 429];
  /** Checks if jQuery ajax returns a response with a retryable status. */
  function hasRetryableStatus(jqXHR) {
      return (RETRYABLE_STATUSES.includes(jqXHR.status) ||
          (jqXHR.status >= 500 && jqXHR.status <= 599));
  }

  /* eslint @typescript-eslint/no-explicit-any: off */
  function createGetterDescriptor(get) {
      return {
          get,
          enumerable: true,
          configurable: true,
      };
  }
  class JQueryXHR {
      static asProxy(options) {
          const { context, onAbort, onError } = options;
          const jqXHR = Object.assign(context.jqXHR.catch(onError), {
              abort: onAbort,
              getAllResponseHeaders: () => {
                  var _a;
                  return (_a = context.jqXHR.getAllResponseHeaders()) !== null && _a !== void 0 ? _a : '';
              },
              getResponseHeader: (name) => {
                  var _a;
                  return (_a = context.jqXHR.getResponseHeader(name)) !== null && _a !== void 0 ? _a : null;
              },
              overrideMimeType: (mime) => {
                  context.jqXHR.overrideMimeType(mime);
              },
              setRequestHeader: (name, value) => {
                  context.jqXHR.setRequestHeader(name, value);
              },
              statusCode: (map) => {
                  context.jqXHR.statusCode(map);
              },
          });
          Object.defineProperties(jqXHR, {
              readyState: createGetterDescriptor(() => context.jqXHR.readyState),
              responseText: createGetterDescriptor(() => context.jqXHR.responseText),
              responseXML: createGetterDescriptor(() => context.jqXHR.responseXML),
              responseJSON: createGetterDescriptor(() => context.jqXHR.responseJSON),
              status: createGetterDescriptor(() => context.jqXHR.status),
              statusText: createGetterDescriptor(() => context.jqXHR.statusText),
          });
          return jqXHR;
      }
      static asAborted(settings) {
          const deferred = $.Deferred();
          const jqXHR = deferred.promise({
              status: 0,
              statusText: 'abort',
              abort: $.noop,
              statusCode: $.noop,
              getResponseHeader: () => null,
              getAllResponseHeaders: () => '',
              readyState: 0,
              responseText: '',
              overrideMimeType: $.noop,
              setRequestHeader: $.noop,
          });
          deferred.rejectWith(settings, [jqXHR, 'abort', 'abort']);
          return jqXHR;
      }
  }

  /* eslint @typescript-eslint/no-explicit-any: 'off' */
  function createAjaxWithRetry(backbone) {
      const ORIGINAL_AJAX = backbone.ajax;
      return function ajaxWithRetry(settings = {}) {
          const context = {
              jqXHR: ORIGINAL_AJAX.call(backbone, settings),
              settings,
          };
          function handleError(jqXHR, status, statusText) {
              // We ensure 'tries' are defined using an '$.ajaxFilter' in the setup.
              const tries = this.tries;
              const skipRetry = tries > backbone.retry.retries ||
                  !backbone.retry.condition(jqXHR, this.backboneSyncMethod);
              const deferred = backbone.$.Deferred();
              if (skipRetry)
                  return deferred.rejectWith(this, [jqXHR, status, statusText]);
              const timeoutId = setTimeout(() => {
                  delete context.delay;
                  context.jqXHR = ORIGINAL_AJAX.call(backbone, this);
                  deferred.resolve(JQueryXHR.asProxy({
                      context,
                      onAbort: handleAbort,
                      onError: handleError,
                  }));
              }, backbone.retry.delay(tries, jqXHR));
              context.settings = this;
              context.delay = { deferred, timeoutId };
              this.tries = tries + 1;
              return deferred;
          }
          function handleAbort(statusText) {
              if (!context.delay) {
                  context.jqXHR.abort(statusText);
                  return;
              }
              const { deferred, timeoutId } = context.delay;
              delete context.delay;
              clearTimeout(timeoutId);
              deferred.rejectWith(context.settings, [
                  JQueryXHR.asAborted(context.settings),
                  'abort',
                  'abort',
              ]);
          }
          return JQueryXHR.asProxy({
              context,
              onError: handleError,
              onAbort: handleAbort,
          });
      };
  }

  function createSyncWithRetry(backbone) {
      const ORIGINAL_SYNC = backbone.sync;
      return function (method, model, settings = {}) {
          return ORIGINAL_SYNC.call(this, method, model, Object.assign(Object.assign({}, settings), { backboneSyncMethod: method }));
      };
  }

  function setupBackboneAjaxRetry(backbone, settings) {
      var _a, _b, _c;
      backbone.retry = {
          delay: (_a = settings === null || settings === void 0 ? void 0 : settings.delay) !== null && _a !== void 0 ? _a : linearDelay(200),
          retries: (_b = settings === null || settings === void 0 ? void 0 : settings.retries) !== null && _b !== void 0 ? _b : 3,
          condition: (_c = settings === null || settings === void 0 ? void 0 : settings.condition) !== null && _c !== void 0 ? _c : hasRetryableStatus,
      };
      backbone.$.ajaxPrefilter((settings) => {
          var _a;
          // Assigns as the first try when it doesn't have 'tries' number.
          (_a = settings.tries) !== null && _a !== void 0 ? _a : (settings.tries = 1);
      });
      backbone.ajax = createAjaxWithRetry(backbone);
      backbone.sync = createSyncWithRetry(backbone);
  }

  exports.hasRetryableStatus = hasRetryableStatus;
  exports.linearDelay = linearDelay;
  exports.setupBackboneAjaxRetry = setupBackboneAjaxRetry;

}));
//# sourceMappingURL=index.umd.js.map
