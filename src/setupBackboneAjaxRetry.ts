import type { Backbone, BackboneAjaxRetrySettings } from './types';
import linearDelay from './linearDelay';
import hasRetryableStatus from './hasRetryableStatus';
import createAjaxWithRetry from './createAjaxWithRetry';
import createSyncWithRetry from './createSyncWithRetry';

function setupBackboneAjaxRetry(
  backbone: Backbone,
  settings?: BackboneAjaxRetrySettings,
): void {
  backbone.retry = {
    delay: settings?.delay ?? linearDelay(200),
    retries: settings?.retries ?? 3,
    condition: settings?.condition ?? hasRetryableStatus,
  };

  backbone.$.ajaxPrefilter((settings) => {
    // Assigns as the first try when it doesn't have 'tries' number.
    settings.tries ??= 1;
  });

  backbone.ajax = createAjaxWithRetry(backbone);

  backbone.sync = createSyncWithRetry(backbone);
}

export default setupBackboneAjaxRetry;
