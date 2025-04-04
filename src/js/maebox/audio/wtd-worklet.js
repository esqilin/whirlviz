
class WtdProcessor extends AudioWorkletProcessor {
    
    constructor() {
        super();

        const dim = 32;
        this.terrain = new Float32Array(dim * dim);
    }

    lookupTerrain(x, y) {
        return -x * Math.sin(Math.sqrt(Math.abs(x))) - y * Math.sin(Math.sqrt(Math.abs(y)));
    }

    process(inputs, outputs, params) {
        if (inputs.length < 2 || outputs.length < 1) {
            return true; // keep alive
        }

        const inputX = inputs[0];
        const inputY = inputs[1];
        const output = outputs[0];

        if (!inputX || !inputY || !output || inputX.length === 0
            || inputY.length === 0 || output.length === 0)
        {
            return true; // keep alive
        }

        // assign mono channel from all connections
        const x = inputX[0];
        const y = inputY[0];
        const z = output[0];

        if (!x || !y || !z) {
            return true;
        }

        for (let k = 0; k < x.length; k++) {
            // const i = Math.floor(((x[k] + 1) / 2) * (this.waveTerrain.length - 1));
            // const j = Math.floor(((y[k] + 1) / 2) * (this.waveTerrain.length - 1));
            z[k] = this.lookupTerrain(x[k], y[k]); // TODO: lookup(i,j)
        }

        return true;
    }

}


registerProcessor("wtd-processor", WtdProcessor);