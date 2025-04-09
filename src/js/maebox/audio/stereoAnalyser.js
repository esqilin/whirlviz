
import { Node } from './node.js';


class Analyser extends Node {

    constructor(ctx) {
        super(ctx);

        const nFft = 2048;

        this.node = ctx.audioContext.createAnalyser();
        this.node.fftSize = nFft;

        this.data = new Float32Array(nFft);
    }

    fetch() {
        this.node.getFloatTimeDomainData(this.data);
    }

}


class StereoAnalyser extends Node {

    #splitter;
    #analysers;

    constructor(ctx) {
        super(ctx);

        const nFft = 2048;

        this.#splitter = ctx.audioContext.createChannelSplitter(2);

        this.#analysers = [
            ctx.audioContext.createAnalyser(),
            ctx.audioContext.createAnalyser()
        ];

        this.#analysers[0].fftSize = nFft;
        this.#analysers[1].fftSize = nFft;

        this.data = [
            new Float32Array(nFft),
            new Float32Array(nFft)
        ];

    }

    connectInput(inNode) {
        inNode.connect(this.#splitter);

        this.#splitter.connect(this.#analysers[0], 0, 0);
        this.#splitter.connect(this.#analysers[1], 1, 0);
    }

    fetchSamples() {
        this.#analysers[0].getFloatTimeDomainData(this.data[0]);
        this.#analysers[1].getFloatTimeDomainData(this.data[1]);
    }

}

export { StereoAnalyser, Analyser };