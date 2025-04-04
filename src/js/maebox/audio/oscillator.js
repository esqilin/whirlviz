
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

    get frequency() {
        return this.node.frequency.value;
    }

    /**
     * @param {number} val
     */
    set frequency(val) {
        this.node.frequency.exponentialRampToValueAtTime(val, this.now + this.context.freqRampTime);
    }

    constructor(ctx, type = WAVEFORMS.Sine, frequency = 440.0) {
        super(ctx);

        this.node = ctx.audioContext.createOscillator();
        this.node.type = type;
        this.node.frequency.value = frequency;
    }

}

export { Oscillator };
