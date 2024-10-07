export type JQueryXHRAsProxyOptions<T = any> = {
    context: {
        jqXHR: JQuery.jqXHR<T>;
    };
    onAbort: (statusText?: string) => void;
    onError: (this: JQuery.AjaxSettings, jqXHR: JQuery.jqXHR<T>, status: JQuery.Ajax.ErrorTextStatus, statusText: string) => JQuery.Promise<any>;
};
declare class JQueryXHR {
    static asProxy<T>(options: JQueryXHRAsProxyOptions<T>): JQuery.jqXHR<T>;
    static asAborted<T>(settings: JQueryAjaxSettings): JQuery.jqXHR<T>;
}
export default JQueryXHR;
//# sourceMappingURL=JQueryXHR.d.ts.map