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
             * An attribute that keeps track of the Backbone.js data.
             */
            backbone?: {
                model: Backbone.Model<any> | Backbone.Collection<any>;
                sync?: {
                    method: string;
                };
            };
        }
    }
    namespace Backbone {
        let retry: Required<BackboneAjaxRetrySettings>;
        interface Model {
            retries?: number;
            retryOnCreate?: boolean;
        }
        interface Collection {
            retries?: number;
            retryOnCreate?: boolean;
        }
    }
}
export type { BackboneAjaxRetryDelay, BackboneAjaxRetryCondition, BackboneAjaxRetrySettings, } from './types';
export { default as setupBackboneAjaxRetry } from './setupBackboneAjaxRetry';
export { default as linearDelay } from './linearDelay';
export { default as hasRetryableStatus } from './hasRetryableStatus';
//# sourceMappingURL=index.d.ts.map