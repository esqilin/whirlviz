
import { Oscillator } from "./oscillator.js";
import { Gain } from "./gain.js";
import { Utils } from "./index.js";


class Generator {

    constructor(ctx) {
        this.src = new Oscillator(ctx);
        this.gain = new Gain(ctx);

        this.src.node.connect(this.gain.node);

        this.isOn = false;
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

}

export { Generator };