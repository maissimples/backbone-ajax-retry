/* eslint @typescript-eslint/no-explicit-any: "off" */

import Backbone from './backbone';
import JQueryXHRController from './JQueryXHRController';

declare global {
  /* eslint @typescript-eslint/no-namespace: "off" */

  namespace JQuery {
    interface AjaxSettingsRetry {
      /**
       * The limit of ajax requests' retries.
       * @default 3
       */
      limit?: number;
    }

    interface AjaxSettings {
      /**
       * @private
       * An attribute that keeps track of how many times an ajax request has
       * been tried before succeed/failed.
       */
      tries?: number;

      /** @default false */
      retry?: false | AjaxSettingsRetry;
    }
  }
}

Backbone.$.ajaxPrefilter((settings) => {
  settings.tries = 1;
  settings.retry ??= false;

  if (settings.retry) {
    settings.retry.limit ??= 3;
  }
});

function ajaxWithRetry(settings?: JQuery.AjaxSettings): JQuery.jqXHR {
  const controller = new JQueryXHRController();

  function handleError(
    this: JQuery.AjaxSettings,
    jqXHR: JQuery.jqXHR,
    status: JQuery.Ajax.ErrorTextStatus,
    statusText: string,
  ): JQuery.jqXHR<any> | JQuery.Deferred<any> {
    const tries = this.tries!;
    const limit = this.retry ? (this.retry.limit ?? 3) : 0;

    if (jqXHR.status !== 429 || tries > limit) {
      const deferred = Backbone.$.Deferred();
      return deferred.rejectWith(this, [jqXHR, status, statusText]);
    }

    this.tries = tries + 1;

    return controller
      .setJQueryXHR(Backbone.$.ajax(this))
      .interceptFailure(handleError);
  }

  return controller
    .setJQueryXHR(Backbone.$.ajax(settings))
    .interceptFailure(handleError);
}

Backbone.ajax = ajaxWithRetry;
