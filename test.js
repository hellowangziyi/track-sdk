function computedCallback () {
    const randomVal = Math.random() * 100;
    const data = []
    for (let i = 0; i < 100000; i++) {
        data.push(Math.random() * 1000)
    }
    return data.sort()
}


this.onmessage = function (event) {
    console.log(event.data);
    this.postMessage({
        value: computedCallback()
    })
}