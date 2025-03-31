
import { Sink } from './sink.js';
import { Oscillator } from './oscillator.js';
import { Delay } from './delay.js';
import { Gain } from './gain.js';
import { StereoMerger } from './stereoMerger.js'
import { StereoAnalyser } from './stereoAnalyser.js';
import { Context } from './context.js';


class Engine {

    #ctx;
    #osc;
    #gain;
    #analyser;
    #isMuted;
    #volume; // TODO

    /**
     * @param {number} val
     */
    set freq(val) {
        this.#osc.frequency = val;
    }

    /**
     * @param {number} val
     */
    set vol(val) {
        this.#volume.gain = val;
    }

    get sampleRate() {
        return this.#ctx.sampleRate;
    }

    get outSamples() {
        return this.#analyser.data;
    }

    constructor() {
        //defaults
        let latencyHint = 'playback';
        let gainRampTime = 0.012;
        let freqRampTime = 0.007;
        let delayTime = 0.012; // should be more than 0.01

        this.#ctx = new Context(latencyHint, gainRampTime, freqRampTime);

        // setup audio nodes
        this.#osc = new Oscillator(this.#ctx);
        const delay = new Delay(this.#ctx, Math.ceil(delayTime), delayTime);
        const merger = new StereoMerger(this.#ctx, this.#osc, delay);
        this.#gain = new Gain(this.#ctx);
        this.#volume = new Gain(this.#ctx);
        this.#analyser = new StereoAnalyser(this.#ctx);

        // make connections
        this.#osc.node.connect(delay.node);
        merger.connectInputs(this.#osc.node, delay.node);
        merger.node.connect(this.#gain.node);
        this.#gain.node.connect(this.#volume.node);
        this.#volume.node.connect(this.#ctx.audioContext.destination)
        // this.#gain.node.connect(this.#ctx.audioContext.destination)
        // analysis
        this.#analyser.connectInput(this.#gain.node);

        this.#isMuted = true;
    }

    // call must be triggered by user action
    async start() {
        let ctx = this.#ctx.audioContext;

        if (ctx.state === 'suspended') {
            this.#osc.node.start();
            await ctx.resume();
            this.vol = 0.5;
        }
    }

    toggleMuted() {
        this.#isMuted = !this.#isMuted;
        this.#gain.gain = this.#isMuted ? 0.0 : 1.0;

        return this.#isMuted;
    }

    analyse() {
        this.#analyser.fetchSamples();
    }

}

export { Engine };