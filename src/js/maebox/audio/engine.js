
import { Oscillator } from './oscillator.js';
import { Delay } from './delay.js';
import { Gain } from './gain.js';
import { Analyser } from './stereoAnalyser.js';
import { WaveTerrainDistortion } from './waveTerrainDistortion.js';
import { GeneratorPool } from './generatorPool.js';
import { Context } from './context.js';


class Engine {

    #generatorPool;
    #gain;
    #wtd;
    #isMuted;
    #volume;
    #gainVal;

    /**
     * @param {number} val
     */
    set gain(val) {
        this.#gainVal = val;
        this.#gain.gain = this.#gainVal * this.#gainVal;
    }

    /**
     * @param {number} val
     */
    set volume(val) {
        this.#volume.gain = val;
    }

    get sampleRate() {
        return this._ctx.sampleRate;
    }

    constructor(logger) {
        //defaults
        let latencyHint = 'playback';
        let gainRampTime = 0.012;
        let freqRampTime = 0.007;
        let initialGain = 0.5;

        this.logger = logger;

        this._ctx = new Context(latencyHint, gainRampTime, freqRampTime);
        this._ctx.audioContext.addEventListener('statechange', (ev) => {
            logger.debug(`New audio context state: \`${ev.currentTarget.state}\``);
        });

        this.#isMuted = true;
        this.#gainVal = initialGain;
    }

    async setup() {
        const nPolyphony = 5;
        const delayTime = 0.032; // should be more than 0.01
        
        // setup audio nodes
        this.#wtd = new WaveTerrainDistortion(this._ctx);
        const isWtdSetup = await this.#wtd.setup();
        if (!isWtdSetup) {
            this.logger.warn('Audio engine was not setup due to a previous error.');
            return false;
        }

        this.#generatorPool = new GeneratorPool(this._ctx, nPolyphony);
        const delay = new Delay(this._ctx, Math.ceil(delayTime), delayTime);
        this.#gain = new Gain(this._ctx);
        this.#volume = new Gain(this._ctx);
        this.analysers = new Array(3);
        this.outSamples = new Array(3);
        for (let i = 0; i < this.analysers.length; i++) {
            this.analysers[i] = new Analyser(this._ctx);
            this.outSamples[i] = this.analysers[i].data;
        }

        // make connections
        this.#generatorPool.node.connect(this.#gain.node);
        this.#gain.node.connect(this.#wtd.node, 0, 0);
        this.#wtd.node.connect(delay.node, 0);
        delay.node.connect(this.#wtd.node, 0, 1);
        delay.node.connect(this.#volume.node);
        this.#volume.node.connect(this._ctx.audioContext.destination)
        // analysis
        this.#gain.node.connect(this.analysers[0].node);
        delay.node.connect(this.analysers[1].node);
        this.#generatorPool.node.connect(this.analysers[2].node);

        this.logger.info('Audio engine is properly setup.');

        return true;
    }

    // call must be triggered by user action
    async start() {
        let ctx = this._ctx.audioContext;
        if (ctx.state !== 'suspended') {
            this.logger.info('start() was called on the running audio engine.');
            if (!!this.#wtd) { // are we setup?
                return true;
            }
        }

        let isSetup = await this.setup();
        if (!isSetup) {
            return false;
        }

        if (!this.#generatorPool.isRunning) {
            this.#generatorPool.start();
        }

        if (ctx.state === 'suspended') {
            await ctx.resume();

            this.logger.info('Audio engine has been started.');
        }

        return true;
    }

    noteOn(midiIndex, velocity) {
        this.#generatorPool.noteOn(midiIndex, velocity);
    }

    noteOff(midiIndex) {
        this.#generatorPool.noteOff(midiIndex);
    }

    toggleMuted() {
        this.#isMuted = !this.#isMuted;
        this.#gain.gain = this.#isMuted ? 0.0 : this.#gainVal;

        return this.#isMuted;
    }

    analyse() {
        for (let i = 0; i < this.analysers.length; i++) {
            this.analysers[i].fetch();
        }
    }

}

export { Engine };