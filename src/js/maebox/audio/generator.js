
import { Oscillator } from "./oscillator.js";
import { Gain } from "./gain.js";
import { Utils } from "./index.js";
import { MidiController } from "../midi/midiController.js";


class Generator {

    constructor(ctx, shape = Oscillator.WAVEFORMS.Sine) {
        this.src = new Oscillator(ctx, shape);
        this.gain = new Gain(ctx);

        this.off();

        this.src.node.connect(this.gain.node);
    }

    start() {
        this.src.start();
    }

    on(midiIndex, velocity) {
        if (0 === velocity) {
            return;
        }

        // TODO: error handling
        let freq = Utils.midiToFrequency(midiIndex);
        this.src.frequency = freq;
        this.gain.gain = velocity / 127;

        this.isOn = true;
    }

    off() {
        this.gain.gain = 0.0;
        this.isOn = false;
    }

    portamento(midiIndex, velocity) {
        if (!this.isOn) {
            this.on(midiIndex, velocity);
            return;
        }

        let freq = Utils.midiToFrequency(midiIndex);
        this.src.portamento(freq);
        this.gain.gain = velocity / 127;
    }

}

export { Generator };