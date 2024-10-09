/* eslint @typescript-eslint/no-explicit-any: 'off' */

import JQueryXHR from './JQueryXHR';
import type { Backbone, BackboneAjax } from './types';

type TimeoutId = ReturnType<typeof setTimeout>;

type Context<T = any> = {
  delay?: {
    timeoutId: TimeoutId;
    deferred: JQuery.Deferred<any>;
  };
  jqXHR: JQuery.jqXHR<T>;
  settings: JQueryAjaxSettings;
};

function createAjaxWithRetry(backbone: Backbone): BackboneAjax {
  const ORIGINAL_AJAX = backbone.ajax;

  return (settings = {}) => {
    const context: Context = {
      jqXHR: ORIGINAL_AJAX.call(backbone, settings),
      settings,
    };

    function handleError(
      this: JQuery.AjaxSettings,
      jqXHR: JQuery.jqXHR,
      status: JQuery.Ajax.ErrorTextStatus,
      statusText: string,
    ): JQuery.jqXHR | JQuery.Deferred<any> {
      // We ensure 'tries' are defined using an '$.ajaxFilter' in the setup.
      const tries = this.tries!;
      const retries = settings.retries ?? backbone.retry.retries;
      const skipRetryOnCreate = !this.backbone?.model?.retryOnCreate;
      const methodIsCreate = this.backbone?.sync?.method === 'create';

      const skipRetry =
        tries > retries ||
        (skipRetryOnCreate && methodIsCreate) ||
        !backbone.retry.condition(
          jqXHR,
          this.backbone?.model,
          this.backbone?.sync?.method,
        );

      const deferred = backbone.$.Deferred();

      if (skipRetry)
        return deferred.rejectWith(this, [jqXHR, status, statusText]);

      const timeoutId = setTimeout(
        () => {
          delete context.delay;
          context.jqXHR = ORIGINAL_AJAX.call(backbone, this);
          deferred.resolve(
            JQueryXHR.asProxy<any>({
              context,
              onAbort: handleAbort,
              onError: handleError,
            }),
          );
        },
        backbone.retry.delay(tries, jqXHR),
      );

      context.settings = this;
      context.delay = { deferred, timeoutId };

      this.tries = tries + 1;

      return deferred;
    }

    function handleAbort(statusText?: string) {
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

    return JQueryXHR.asProxy<any>({
      context,
      onError: handleError,
      onAbort: handleAbort,
    });
  };
}

export default createAjaxWithRetry;
