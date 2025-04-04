
import { Sink } from './sink.js';
import { Oscillator } from './oscillator.js';
import { Delay } from './delay.js';
import { Gain } from './gain.js';
import { StereoMerger } from './stereoMerger.js'
import { StereoAnalyser } from './stereoAnalyser.js';
import { WaveTerrainDistortion } from './waveTerrainDistortion.js';
import { Context } from './context.js';


class Engine {

    #ctx;
    #osc;
    #gain;
    #wtd;
    #analyser;
    #isMuted;
    #volume;
    #gainVal;

    /**
     * @param {number} val
     */
    set freq(val) {
        this.#osc.frequency = val;
    }

    /**
     * @param {number} val
     */
    set gain(val) {
        this.#gainVal = val;
        this.#gain.gain = this.#gainVal;
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
        let initialGain = 0.5;

        this.#ctx = new Context(latencyHint, gainRampTime, freqRampTime);

        this.#isMuted = true;
        this.#gainVal = initialGain;
    }

    async setup() {
        const delayTime = 0.032; // should be more than 0.01
        
        // setup audio nodes
        this.#wtd = new WaveTerrainDistortion(this.#ctx);
        const isWtdSetup = await this.#wtd.setup();
        if (!isWtdSetup) {
            return false;
        }

        this.#osc = new Oscillator(this.#ctx);
        const delay = new Delay(this.#ctx, Math.ceil(delayTime), delayTime);
        const merger = new StereoMerger(this.#ctx, this.#osc, delay);
        const splitter = this.#ctx.audioContext.createChannelSplitter(2);
        this.#gain = new Gain(this.#ctx);
        this.#volume = new Gain(this.#ctx);
        this.#analyser = new StereoAnalyser(this.#ctx);

        // make connections
        this.#osc.node.connect(this.#gain.node);
        this.#gain.node.connect(this.#wtd.node, 0, 0);
        this.#wtd.node.connect(delay.node, 0);
        delay.node.connect(this.#wtd.node, 0, 1);
        delay.node.connect(this.#volume.node);
        this.#volume.node.connect(this.#ctx.audioContext.destination)
        // analysis
        merger.connectInputs(this.#gain.node, delay.node);
        this.#analyser.connectInput(merger.node);

        return true;
    }

    // call must be triggered by user action
    async start() {
        let ctx = this.#ctx.audioContext;
        if (ctx.state !== 'suspended') {
            return true;
        }

        let isSetup = await this.setup();
        if (!isSetup) {
            return false;
        }

        if (ctx.state === 'suspended') {
            this.#osc.node.start();
            await ctx.resume();
        }

        return true;
    }

    toggleMuted() {
        this.#isMuted = !this.#isMuted;
        this.#gain.gain = this.#isMuted ? 0.0 : this.#gainVal;

        return this.#isMuted;
    }

    analyse() {
        this.#analyser.fetchSamples();
    }

}

export { Engine };