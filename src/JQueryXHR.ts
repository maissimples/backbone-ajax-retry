/* eslint @typescript-eslint/no-explicit-any: off */

import $ from 'jquery';

type JQueryXHRStatic<T> = Omit<JQuery.jqXHR<T>, keyof JQuery.Promise<any>>;

function createGetterDescriptor<T>(get: () => T): PropertyDescriptor {
  return {
    get,
    enumerable: true,
    configurable: true,
  };
}

export type JQueryXHRAsProxyOptions<T = any> = {
  context: {
    jqXHR: JQuery.jqXHR<T>;
  };
  onAbort: (statusText?: string) => void;
  onError: (
    this: JQuery.AjaxSettings,
    jqXHR: JQuery.jqXHR<T>,
    status: JQuery.Ajax.ErrorTextStatus,
    statusText: string,
  ) => JQuery.Promise<any>;
};

class JQueryXHR {
  static asProxy<T>(options: JQueryXHRAsProxyOptions<T>): JQuery.jqXHR<T> {
    const { context, onAbort, onError } = options;

    const jqXHR = Object.assign(context.jqXHR.catch(onError), {
      abort: onAbort,
      getAllResponseHeaders: (): string => {
        return context.jqXHR.getAllResponseHeaders() ?? '';
      },
      getResponseHeader: (name: string): string | null => {
        return context.jqXHR.getResponseHeader(name) ?? null;
      },
      overrideMimeType: (mime: string) => {
        context.jqXHR.overrideMimeType(mime);
      },
      setRequestHeader: (name: string, value: string) => {
        context.jqXHR.setRequestHeader(name, value);
      },
      statusCode: (map: JQuery.Ajax.StatusCodeCallbacks<any>) => {
        context.jqXHR.statusCode(map);
      },
    }) as Partial<JQuery.jqXHR<T>>;

    Object.defineProperties(jqXHR, {
      readyState: createGetterDescriptor(() => context.jqXHR.readyState),
      responseText: createGetterDescriptor(() => context.jqXHR.responseText),
      responseXML: createGetterDescriptor(() => context.jqXHR.responseXML),
      responseJSON: createGetterDescriptor(() => context.jqXHR.responseJSON),
      status: createGetterDescriptor(() => context.jqXHR.status),
      statusText: createGetterDescriptor(() => context.jqXHR.statusText),
    });

    return jqXHR as JQuery.jqXHR<T>;
  }

  static asAborted<T>(settings: JQueryAjaxSettings): JQuery.jqXHR<T> {
    const deferred = $.Deferred<any>();

    const jqXHR = deferred.promise<JQueryXHRStatic<T>>({
      status: 0,
      statusText: 'abort',
      abort: $.noop,
      statusCode: $.noop,
      getResponseHeader: () => null,
      getAllResponseHeaders: () => '',
      readyState: 4,
      responseText: '',
      overrideMimeType: $.noop,
      setRequestHeader: $.noop,
    });

    deferred.rejectWith(settings, [jqXHR, 'canceled', 'abort']);

    return jqXHR as JQuery.jqXHR<T>;
  }
}

export default JQueryXHR;
