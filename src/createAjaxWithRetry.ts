/* eslint @typescript-eslint/no-explicit-any: 'off' */

import JQueryXHRController from './JQueryXHRController';
import type { Backbone, BackboneAjax } from './types';

function createAjaxWithRetry(backbone: Backbone): BackboneAjax {
  const ORIGINAL_AJAX = backbone.ajax;

  return function ajaxWithRetry(this: Backbone, settings) {
    const controller = new JQueryXHRController();

    function handleError(
      this: JQuery.AjaxSettings,
      jqXHR: JQuery.jqXHR,
      status: JQuery.Ajax.ErrorTextStatus,
      statusText: string,
    ): JQuery.jqXHR | JQuery.Deferred<any> {
      // We ensure 'tries' are defined using an '$.ajaxFilter' in the setup.
      const tries = this.tries!;

      const skipRetry =
        tries > backbone.retry.retries ||
        !backbone.retry.condition(jqXHR, this.backboneSyncMethod);

      if (skipRetry) {
        const deferred = backbone.$.Deferred();
        return deferred.rejectWith(this, [jqXHR, status, statusText]);
      }

      this.tries = tries + 1;

      return controller
        .setJQueryXHR(backbone.ajax(this))
        .interceptFailure(handleError);
    }

    return controller
      .setJQueryXHR(ORIGINAL_AJAX.call(this, settings))
      .interceptFailure(handleError);
  };
}

export default createAjaxWithRetry;
