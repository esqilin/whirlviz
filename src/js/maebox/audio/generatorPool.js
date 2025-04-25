
import { Generator } from "./generator.js";
import { Node } from "./node.js"


// This class provides a pool of oscillators that can be on or off
// and that have a certain frequency
class GeneratorPool extends Node {

    constructor(ctx, n, hasPortamento = false) {
        super(ctx);

        this.pool = new Array(n);
        this.node = ctx.audioContext.createGain(); // dummy to collect outputs
        for (let i = 0; i < n; i++) {
            this.pool[i] = new Generator(ctx);
            this.pool[i].gain.node.connect(this.node);
        }

        this.allNotes = new Array(128);
        for (let i = 0; i < this.allNotes.length; i++) {
            this.allNotes[i] = null;
        }

        this._hasPortamento = hasPortamento;
        this._lastGenerator = null;

        this.isRunning = false;
    }

    start() {
        for (let i = 0; i < this.pool.length; i++) {
            this.pool[i].src.node.start();
        }
    }

    noteOn(midiIndex, velocity) {
        let gen;

        if (this.pool.length === 0) {
            if (!this._hasPortamento) {
                return false; // no more generators available, do nothing
            }

            gen = this.allNotes[this._lastGenerator];
            this.allNotes[this._lastGenerator] = null;
            gen.portamento(midiIndex, velocity);
        } else {
            gen = this.pool.pop();
            gen.on(midiIndex, velocity);
        }

        this.allNotes[midiIndex] = gen;
        this._lastGenerator = midiIndex;

        return true;
    }

    noteOff(midiIndex) {
        let gen = this.allNotes[midiIndex];
        if (!gen) {
            return false; // note was not on, do nothing
        }

        gen.off();
        this.allNotes[midiIndex] = null;
        this.pool.push(gen);
    }

    // turn all notes off
    reset() {
        let gen;
        for (let i = 0; i < this.allNotes.length; i++) {
            gen = this.allNotes[i];
            if (gen) {
                gen.off();
                this.allNotes[i] = null;
                this.pool.push(gen);
            }
        }
    }

}

export { GeneratorPool };