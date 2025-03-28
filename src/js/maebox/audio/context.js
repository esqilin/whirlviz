
class Context {

    #ctx;
    #gainRampTime;
    #freqRampTime;

    get sampleRate() {
        return this.#ctx.sampleRate;
    }

    get audioContext() {
        return this.#ctx;
    }

    get now() {
        return this.#ctx.currentTime;
    }

    get gainRampTime() {
        return this.#gainRampTime;
    }

    get freqRampTime() {
        return this.#freqRampTime;
    }

    constructor(latencyHint, gainRampTime, freqRampTime) {
        let ctxOptions = { latencyHint: latencyHint };

        this.#ctx = new (window.AudioContext || window.webkitAudioContext)(ctxOptions);
        this.#gainRampTime = gainRampTime;
        this.#freqRampTime = freqRampTime;
    }

}

export { Context };