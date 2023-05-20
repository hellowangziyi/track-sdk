/*
@requsetUrl 接口地址
@historyTracker history上报
@hashTracker hash上报
@domTracker 携带tracker-key点击事件上报
@sdkVersion 版本
@extra 透传字段
@jsError js和promise报错异常上报
*/
// 版本号
var TrackConfig;
(function (TrackConfig) {
    TrackConfig["version"] = "1.0.0";
})(TrackConfig || (TrackConfig = {}));

const createHistoryEvent = (type) => {
    const origin = history[type];
    return function () {
        const res = origin.apply(this, arguments);
        // 创建事件
        var e = new Event(type);
        // 派发事件
        window.dispatchEvent(e);
        return res;
    };
};

const MouseEventList = ["click", "dblclick", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "wheel", "contextmenu"];
class Tracker {
    constructor(options) {
        this.data = Object.assign(this.initDef(), options);
        this.installTracker();
    }
    // 初始化参数
    initDef() {
        // history模式下pushState和replaceState无法监听到，需要重写方法
        window.history['pushState'] = createHistoryEvent('pushState');
        window.history['replaceState'] = createHistoryEvent('replaceState');
        return {
            sdkVersion: TrackConfig.version,
            historyTracker: false,
            hashTracker: false,
            domTracker: false,
            jsError: false,
        };
    }
    // 自动上报
    captureEvent(MouseEventList, targetKey, data) {
        MouseEventList.forEach(event => {
            window.addEventListener(event, () => {
                console.log('监听');
                this.reportTracker({ event, targetKey, data });
            });
        });
    }
    // 手动上报
    sendTracker(data) {
        this.reportTracker(data);
    }
    installTracker() {
        if (this.data.historyTracker) {
            // targetKey自行定义
            this.captureEvent(['pushState', 'replaceState', 'popState'], 'history-pv');
        }
        if (this.data.hashTracker) {
            this.captureEvent(['hashchange'], 'hash-pv');
        }
        if (this.data.domTracker) {
            this.targetKeyReport();
        }
        if (this.data.jsError) {
            this.errorReport();
        }
    }
    reportTracker(data) {
        const params = Object.assign(this.data, data, { time: new Date().getTime() });
        const headers = {
            type: 'application/x-www-form-urlencoded',
        };
        const blob = new Blob([JSON.stringify(params)], headers);
        navigator.sendBeacon(this.data.requestUrl, blob);
    }
    setUuid(val) {
        this.data.uuid = val;
    }
    setExtra(val) {
        this.data.extra = val;
    }
    // dom上报
    targetKeyReport() {
        MouseEventList.forEach(event => {
            document.addEventListener(event, e => {
                const target = e.target;
                const targetKey = target.getAttribute('track-key');
                if (targetKey) {
                    this.reportTracker({ event, targetKey });
                }
            });
        });
    }
    // js error上报
    jsErrorReport() {
        window.addEventListener('error', e => {
            this.reportTracker({ event: 'error', targetKey: 'error', message: e.message });
        });
    }
    // promise错误上报
    promiseErrorReport() {
        window.addEventListener('unhandledrejection', event => {
            event.promise.catch(error => {
                this.reportTracker({ event: 'promise', targetKey: 'unhandledrejection', message: error });
            });
        });
    }
    errorReport() {
        this.jsErrorReport();
        this.promiseErrorReport();
    }
}

export { Tracker as default };
