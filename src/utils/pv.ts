export const createHistoryEvent = <T extends keyof History>(type:T) => {
    const origin = history[type]
    return function (this:any) {
        const res = origin.apply(this, arguments)
        // 创建事件
        var e = new Event(type)
        // 派发事件
        window.dispatchEvent(e)
        return res
    }
}