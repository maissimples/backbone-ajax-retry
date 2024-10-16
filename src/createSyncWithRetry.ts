import type { Backbone, BackboneSync } from './types';

function createSyncWithRetry(backbone: Backbone): BackboneSync {
  const ORIGINAL_SYNC = backbone.sync;

  return function (this: Backbone, method, model, settings = {}) {
    settings.retries = settings.retries ?? model.retries;

    settings.backbone = {
      model,
      sync: { method },
    };

    return ORIGINAL_SYNC.call(this, method, model, settings);
  };
}

export default createSyncWithRetry;
