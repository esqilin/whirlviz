
import { Node } from './node.js';


class Delay extends Node {

    set delay(val) {
        //TODO: ease
        this.delay.delayTime.value = val;
    }

    constructor(ctx, maxDelay, delay) {
        super();

        this.node = ctx.audioContext.createDelay(maxDelay);
        this.node.delayTime.value = delay;
    }

}

export { Delay };
