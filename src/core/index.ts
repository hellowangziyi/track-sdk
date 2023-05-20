import { DefaultOptions, Options,TrackConfig } from "../type";
import { createHistoryEvent } from "../utils/pv";

const MouseEventList:string[] = ["click", "dblclick", "mousedown", "mousemove", "mouseout","mouseover", "mouseup", "wheel", "contextmenu"];

export default class Tracker {
    public data: Options;
    constructor(options: Options) {
        this.data = (<any>Object).assign(this.initDef(), options)
        this.installTracker()
    }

    // 初始化参数
    private initDef(): DefaultOptions{
        // history模式下pushState和replaceState无法监听到，需要重写方法
        window.history['pushState'] = createHistoryEvent('pushState')
        window.history['replaceState'] = createHistoryEvent('replaceState')
        return <DefaultOptions>{
            sdkVersion: TrackConfig.version,
            historyTracker: false,
            hashTracker: false,
            domTracker: false,
            jsError: false,
        }
    }

    // 自动上报
    private captureEvent<T>(MouseEventList: string[], targetKey: string, data?: T) {
            MouseEventList.forEach(event => {
                window.addEventListener(event, () => {
                    console.log('监听')
                    this.reportTracker({event,targetKey,data})
                })
            })
        
    }
    // 手动上报
    public sendTracker<T>(data: T) {
        this.reportTracker(data)
    }

    private installTracker() {
        if (this.data.historyTracker) {
            // targetKey自行定义
            this.captureEvent(['pushState', 'replaceState','popState'], 'history-pv')
        }
        if (this.data.hashTracker) {
            this.captureEvent(['hashchange'],'hash-pv')
        }
        if (this.data.domTracker) {
            this.targetKeyReport()
        }
        if (this.data.jsError) { 
            this.errorReport()
        }
    }

    private reportTracker<T>(data:T) {
        const params = (<any>Object).assign(this.data, data, { time: new Date().getTime() })
        const headers = {
            type:'application/x-www-form-urlencoded',
        }

        const blob = new Blob([JSON.stringify(params)], headers)
        navigator.sendBeacon(this.data.requestUrl,blob)
    }

    public setUuid<T extends DefaultOptions['uuid']>(val: T) {
        this.data.uuid = val
    }

    public setExtra<T extends DefaultOptions['extra']>(val: T) {
        this.data.extra = val
    }

    // dom上报
    private targetKeyReport() {
        MouseEventList.forEach(event => {
            document.addEventListener(event, e => {
                const target = e.target as HTMLElement
                const targetKey = target.getAttribute('track-key')
                if (targetKey) {
                    this.reportTracker({event,targetKey})
                }
            })
        })
    }

    // js error上报
    private jsErrorReport() {
        window.addEventListener('error', e => { 
            this.reportTracker({ event: 'error', targetKey: 'error', message: e.message })
        })
    }
    
    // promise错误上报
    private promiseErrorReport() {
        window.addEventListener('unhandledrejection', event => { 
            event.promise.catch(error => {
                this.reportTracker({ event: 'promise', targetKey: 'unhandledrejection', message: error })
            })
           
        })
    }

    private errorReport() { 
        this.jsErrorReport()
        this.promiseErrorReport()
    }
}

