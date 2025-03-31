
import { Node } from './node.js';


class StereoAnalyser extends Node {

    #data;
    #analysers;

    get outSamples() {
        return this.#data;
    }

    constructor(ctx, inNode) {
        super();

        const nFft = 2048;

        const splitter = ctx.audioContext.createChannelSplitter(2);

        this.#analysers = [
            ctx.audioContext.createAnalyser(),
            ctx.audioContext.createAnalyser()
        ];

        this.#analysers[0].fftSize = nFft;
        this.#analysers[1].fftSize = nFft;

        this.#data = [
            new Float32Array(nFft),
            new Float32Array(nFft)
        ];

        inNode.connect(splitter, 0, 0);
        inNode.connect(splitter, 0, 1);

        splitter.connect(this.#analysers[0], 0, 0);
        splitter.connect(this.#analysers[1], 1, 0);
    }

    fetchSamples() {
        this.#analysers[0].getFloatTimeDomainData(this.#data[0]);
        this.#analysers[1].getFloatTimeDomainData(this.#data[1]);
    }

}

export { StereoAnalyser };