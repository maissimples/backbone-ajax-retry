import type Backbone from 'backbone';
export type Backbone = typeof Backbone;
export type BackboneAjax = typeof Backbone.ajax;
export type BackboneSync = typeof Backbone.sync;
export type BackboneAjaxRetryDelay = (retry: number, jqXHR?: JQuery.jqXHR<any>) => number;
export type BackboneAjaxRetryCondition = (jqXHR: JQueryXHR, model?: Backbone.Model<any> | Backbone.Collection<any>, method?: string) => boolean;
export interface BackboneAjaxRetrySettings {
    /** @default linearDelay(1_000) */
    delay?: BackboneAjaxRetryDelay;
    /** @default 3 */
    retries?: number;
    condition?: BackboneAjaxRetryCondition;
}
//# sourceMappingURL=types.d.ts.map