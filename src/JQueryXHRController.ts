/* eslint @typescript-eslint/no-explicit-any: off */

type JQueryXHRAsPromise<TResolve = any> = JQuery.Promise3<
  // 1st argument on '.resolve', '.reject' and '.notify'.
  TResolve,
  JQuery.jqXHR<TResolve>,
  never,
  // 2nd argument on '.resolve', '.reject' and '.notify'.
  JQuery.Ajax.SuccessTextStatus,
  JQuery.Ajax.ErrorTextStatus,
  never,
  // 3rd argument on '.resolve', '.reject' and '.notify'.
  JQuery.jqXHR<TResolve>,
  string,
  never
>;

class JQueryXHRController<T = any> {
  private jqXHR: JQuery.jqXHR<T> | null = null;

  setJQueryXHR(jqXHR: JQuery.jqXHR<T>): this {
    this.jqXHR = jqXHR;
    return this;
  }

  interceptFailure(
    onFailure: (
      this: JQuery.AjaxSettings,
      jqXHR: JQuery.jqXHR<T>,
      status: JQuery.Ajax.ErrorTextStatus,
      statusText: string,
    ) => JQuery.Promise<any>,
  ): JQuery.jqXHR<T> {
    if (!this.jqXHR)
      throw new Error("Can't intercept jqXHR because there's none");

    return this.proxy(this.jqXHR.catch(onFailure) as JQueryXHRAsPromise<T>);
  }

  private proxy(promise: JQueryXHRAsPromise<T>): JQuery.jqXHR<T> {
    if (!this.jqXHR) throw new Error("Can't proxy jqXHR because there's none");

    const jqXHR = Object.assign(promise, {
      abort: (statusText?: string) => {
        this.jqXHR!.abort(statusText);
      },
      getAllResponseHeaders: (): string => {
        return this.jqXHR!.getAllResponseHeaders();
      },
      getResponseHeader: (name: string): string | null => {
        return this.jqXHR!.getResponseHeader(name);
      },
      overrideMimeType: (mime: string) => {
        this.jqXHR!.overrideMimeType(mime);
      },
      setRequestHeader: (name: string, value: string) => {
        this.jqXHR!.setRequestHeader(name, value);
      },
      statusCode: (map: JQuery.Ajax.StatusCodeCallbacks<any>) => {
        this.jqXHR!.statusCode(map);
      },
    }) as Partial<JQuery.jqXHR<T>>;

    Object.defineProperty(jqXHR, 'readyState', {
      get: () => this.jqXHR!.readyState,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(jqXHR, 'readyState', {
      get: () => this.jqXHR!.readyState,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(jqXHR, 'responseText', {
      get: () => this.jqXHR!.responseText,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(jqXHR, 'responseXML', {
      get: () => this.jqXHR!.responseXML,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(jqXHR, 'responseJSON', {
      get: () => this.jqXHR!.responseJSON,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(jqXHR, 'status', {
      get: () => this.jqXHR!.status,
      enumerable: true,
      configurable: true,
    });

    Object.defineProperty(jqXHR, 'statusText', {
      get: () => this.jqXHR!.statusText,
      enumerable: true,
      configurable: true,
    });

    return jqXHR as JQuery.jqXHR<T>;
  }
}

export default JQueryXHRController;
