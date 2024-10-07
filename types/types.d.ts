import type Backbone from 'backbone';
export type Backbone = typeof Backbone;
export type BackboneAjax = typeof Backbone.ajax;
export type BackboneSync = typeof Backbone.sync;
export interface BackboneAjaxRetryDelay {
    (retry: number, jqXHR?: JQueryXHR): number;
}
export interface BackboneAjaxRetryCondition {
    (jqXHR: JQueryXHR, method?: string): boolean;
}
export interface BackboneAjaxRetrySettings {
    /** @default linearDelay(1_000) */
    delay?: BackboneAjaxRetryDelay;
    /** @default 3 */
    retries?: number;
    condition?: BackboneAjaxRetryCondition;
}
//# sourceMappingURL=types.d.ts.map