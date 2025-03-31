
import { Node } from './node.js';


const WAVEFORMS = {
    Sine: 'sine',
    Square: 'square',
    Triangle: 'triangle',
    Sawtooth: 'sawtooth'
}


class Oscillator extends Node {

    static get WAVEFORMS() {
        return WAVEFORMS;
    }

    #ctx;
    #osc;

    get frequency() {
        return this.#osc.frequency.value;
    }

    /**
     * @param {number} val
     */
    set frequency(val) {
        this.#osc.frequency.exponentialRampToValueAtTime(val, this.#ctx.now + this.#ctx.freqRampTime);
    }

    constructor(ctx, type = WAVEFORMS.Sine, frequency = 440.0) {
        super();

        this.#ctx = ctx;
        this.#osc = ctx.audioContext.createOscillator();
        this.#osc.type = type;
        this.#osc.frequency.value = frequency;
    }

    connect(dest) {
        this.#osc.connect(dest);
    }

    start() {
        this.#osc.start();
    }

}

export { Oscillator };
