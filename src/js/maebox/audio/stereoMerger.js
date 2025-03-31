
import { Node } from './node.js';


class StereoMerger extends Node {

    constructor(ctx) {
        super();

        const aCtx = ctx.audioContext;
        this.node = aCtx.createChannelMerger(2, { numberOfOutputs: 2 });
    }

    connectInputs(lNode, rNode) {
        lNode.connect(this.node, 0, 0);
        rNode.connect(this.node, 0, 1);
    }

}

export { StereoMerger };