import type { Backbone, BackboneSync } from './types';

function createSyncWithRetry(backbone: Backbone): BackboneSync {
  const ORIGINAL_SYNC = backbone.sync;

  return function (this: Backbone, method, model, settings = {}) {
    return ORIGINAL_SYNC.call(this, method, model, {
      ...settings,
      backboneSyncMethod: method,
    });
  };
}

export default createSyncWithRetry;
