import type { BackboneAjaxRetrySettings } from './types';
declare global {
    namespace JQuery {
        interface AjaxSettings {
            /**
             * @private
             * An attribute that keeps track of how many times an ajax request has
             * been tried before succeed/failed.
             */
            tries?: number;
            /**
             * @private
             * An attribute that keeps track of Backbone.sync method.
             */
            backboneSyncMethod?: string;
        }
    }
    namespace Backbone {
        let retry: Required<BackboneAjaxRetrySettings>;
        interface Model {
            retries?: number;
        }
        interface Collection {
            retries?: number;
        }
    }
}
export type { BackboneAjaxRetryDelay, BackboneAjaxRetryCondition, BackboneAjaxRetrySettings, } from './types';
export { default as setupBackboneAjaxRetry } from './setupBackboneAjaxRetry';
export { default as linearDelay } from './linearDelay';
export { default as hasRetryableStatus } from './hasRetryableStatus';
//# sourceMappingURL=index.d.ts.map