
import { Sink } from './sink.js';
import { Oscillator } from './oscillator.js';
import { Delay } from './delay.js';
import { StereoMerger } from './stereoMerger.js'
import { StereoAnalyser } from './stereoAnalyser.js';
import { Context } from './context.js';


class Engine {

    #ctx;
    #sink;

    get sampleRate() {
        return this.#ctx.sampleRate;
    }

    get outSamples() {
        return this.#sink.outSamples;
    }

    constructor() {
        //defaults
        let latencyHint = 'playback';
        let gainRampTime = 0.012;
        let freqRampTime = 0.007;

        this.#ctx = new Context(latencyHint, gainRampTime, freqRampTime);
        this.#sink = new Sink(this.#ctx);
    }

    newOscillator(...args) {
        return new Oscillator(this.#ctx, ...args);
    }

    newDelay(...args) {
        return new Delay(this.#ctx, ...args);
    }

    newStereoMerger(...args) {
        return new StereoMerger(this.#ctx, ...args);
    }

    newStereoAnalyser(...args) {
        return new StereoAnalyser(this.#ctx, ...args);
    }

    addSource(node) {
        this.#sink.connectNode(node);
    }

    // call must be triggered by user action
    async start() {
        let ctx = this.#ctx.audioContext;

        if (ctx.state == 'suspended') {
            await ctx.resume();

            return true;
        }

        return false;
    }

    toggleMuted() {
        return this.#sink.toggleMuted();
    }

    fetchSamples() {
        this.#sink.fetchSamples();
    }

}

export { Engine };