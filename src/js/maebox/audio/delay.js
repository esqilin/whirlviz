
import { Node } from './node.js';


class Delay extends Node {

    #delay;

    set delay(val) {
        //TODO: ease
        this.delay.delayTime.value = val;
    }

    constructor(ctx, src, maxDelay, delay) {
        super();

        this.#delay = ctx.audioContext.createDelay(maxDelay);
        this.#delay.delayTime.value = delay;

        src.connect(this.#delay);
    }

    connect(dest) {
        this.#delay.connect(dest);
    }

}

export { Delay };
