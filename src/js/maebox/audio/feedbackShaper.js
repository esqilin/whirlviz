
import { Node } from './node.js';
import { Gain } from './gain.js';


export class FeedbackShaper extends Node {

    constructor(ctx) {
        super(ctx);

        this._gain = new Gain(ctx);
        this._waveshaper = ctx.audioContext.createWaveShaper();
        this._feedbackGain = new Gain(ctx);

        this._gain.gain = 1.0;

        this._waveshaper.curve = this._createWaveShaperCurve(0.5, 0.5);
        this._waveshaper.oversample = 'none';

        this._feedbackGain.gain = 0.5;

        this.node = this._feedbackGain.node;
    }

    _createWaveShaperCurve(foldAmount, morphAmount) {
        const curve = new Float32Array(4096);
        // const nMax = 1000;
        // const f = foldAmount * 10;
        // const m = morphAmount;

        // for (let i = 0; i < 4096; i++) {
        //     const x = (i / 2048) - 1;
        //     let sum = 0;
        //     for (let n = 1; n <= nMax; n++) {
        //         const harmonic = Math.sin(n * Math.PI * x);
        //         const foldTerm = Math.sin(f * n * Math.PI * x);
        //         const morphTerm = Math.pow(Math.abs(x), m);
        //         sum += harmonic * foldTerm * morphTerm;
        //     }
        //     curve[i] = sum * 0.1; // Scale down the output
        // }

        for (let i = 0; i < 4096; i++) {
            let x = i / 4096;
            x = x * x;
            x = x * 2 - 1;
            curve[i] = x;
        }

        return curve;
    }

    // this function should only be called once
    connectInput(src) {
        src.node.connect(this._gain.node);
        this._gain.node.connect(this._waveshaper);
        this._waveshaper.connect(this.node);
        this.node.connect(this._gain.node);
    }

    setParams(morph, fold, feedback) {
        this._waveshaper.curve = this._createWaveShaperCurve(fold, morph);
        this._feedbackGain.gain = feedback;
    }

}
