
import { Node } from './node.js';

class WaveTerrainDistortion extends Node {
    
    constructor(ctx) {
        super(ctx);
    }

    async setup() {
        try {
            let ctx = this.context.audioContext;
            const workletUrl = new URL('wtd-worklet.js', import.meta.url);
            await ctx.audioWorklet.addModule(workletUrl.href);
            this.node = new AudioWorkletNode(ctx, 'wtd-processor', {
                numberOfInputs: 2,
                numberOfOutputs: 1,
                outputChannelCount: [1]
            });
             // Send the wave terrain data to the worklet:
            //worklet.port.postMessage({ waveTerrain: waveTerrain });
        } catch (error) {
            console.error('Error setting up WTD worklet:', error);
            return false;
        }

        return true;
    }
}

export { WaveTerrainDistortion };