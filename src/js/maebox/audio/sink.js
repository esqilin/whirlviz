
class Sink {

    static HIGH_GAIN = 0.8;
    static LOW_GAIN = 0.0;

    #ctx;
    #gainNode;
    #isMuted;

    set #gain(val) {
        let decay = this.#ctx.gainRampTime;
        let now = this.#ctx.now;

        this.#gainNode.gain.cancelScheduledValues(now);
        this.#gainNode.gain.setValueAtTime(this.#gainNode.gain.value, now);

        this.#gainNode.gain.linearRampToValueAtTime(val, now + decay);
    }

    get isMuted() {
        return this.#isMuted;
    }

    constructor(ctx, destination) {
        let audioCtx = ctx.audioContext;
        let dest = destination ? destination : audioCtx.destination;

        this.#ctx = ctx;
        this.#gainNode = audioCtx.createGain();
        this.#isMuted = true;

        this.#gainNode.connect(dest);

        // start in mode off
        this.#gainNode.gain.setValueAtTime(0.0, this.#ctx.now);
    }

    connectNode(node) {
        node.connect(this.#gainNode);
    }

    mute() {
        if (!this.#isMuted) {
            this.#gain = Sink.LOW_GAIN;
            this.#isMuted = true;
        }
    }

    unmute() {
        if (this.#isMuted) {
            this.#gain = Sink.HIGH_GAIN;
            this.#isMuted = false;
        }
    }

    toggleMuted() {
        this.#gain = this.#isMuted ? Sink.HIGH_GAIN : Sink.LOW_GAIN;
        this.#isMuted = !this.#isMuted;

        return this.#isMuted;
    }

}

export { Sink };