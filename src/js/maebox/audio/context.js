
class Context {

    #ctx;
    #gainRampTime;
    #freqRampTime;
    #portamentoTime;

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

    get portamentoTime() {
        return this.#portamentoTime;
    }

    constructor(latencyHint, gainRampTime, freqRampTime, portamentoTime) {
        let ctxOptions = { latencyHint: latencyHint };

        this.#ctx = new (window.AudioContext || window.webkitAudioContext)(ctxOptions);
        this.#gainRampTime = gainRampTime;
        this.#freqRampTime = freqRampTime;
        this.#portamentoTime = portamentoTime;
    }

}

export { Context };