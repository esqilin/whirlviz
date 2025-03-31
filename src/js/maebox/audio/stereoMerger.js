
import { Node } from './node.js';


class StereoMerger extends Node {

    #merger;

    constructor(ctx, lNode, rNode) {
        super();

        const aCtx = ctx.audioContext;
        this.#merger = aCtx.createChannelMerger(2, { numberOfOutputs: 2 });

        lNode.connect(this.#merger, 0, 0);
        rNode.connect(this.#merger, 0, 1);
    }

    connect(dest) {
        this.#merger.connect(dest);
    }

}

export { StereoMerger };