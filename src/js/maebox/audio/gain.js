
import { Node } from './node.js';


class Gain extends Node {

    /**
     * @param {number} val
     */
    set gain(val) {
        let rampTime = this.context.gainRampTime;

        // // start from where we actually are
        this.node.gain.cancelScheduledValues(this.now);
        this.node.gain.setValueAtTime(this.node.gain.value, this.now);

        this.node.gain.linearRampToValueAtTime(val, this.now + rampTime);
    }

    constructor(ctx) {
        super(ctx);

        this.node = ctx.audioContext.createGain();
        // ramp from 0 to 1
        this.node.gain.setValueAtTime(0.0, this.now);
        this.gain = 1.0;
    }

}

export { Gain };