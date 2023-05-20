interface DefaultOptions {
    uuid: string | undefined;
    requestUrl: string | undefined;
    historyTracker: boolean;
    hashTracker: boolean;
    domTracker: boolean;
    sdkVersion: string | number;
    extra: Record<string, any> | undefined;
    jsError: boolean;
}
interface Options extends Partial<DefaultOptions> {
    requestUrl: string;
}

declare class Tracker {
    data: Options;
    constructor(options: Options);
    private initDef;
    private captureEvent;
    sendTracker<T>(data: T): void;
    private installTracker;
    private reportTracker;
    setUuid<T extends DefaultOptions['uuid']>(val: T): void;
    setExtra<T extends DefaultOptions['extra']>(val: T): void;
    private targetKeyReport;
    private jsErrorReport;
    private promiseErrorReport;
    private errorReport;
}

export { Tracker as default };
