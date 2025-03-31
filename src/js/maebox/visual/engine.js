
class Engine {

    #lastFrameTime;
    #frameCount;
    #ctx;
    #dataArray;
    #fps;
    #cw;
    #ch;
    
    constructor(canvas, audioSampleRate, bgColor, fgColor) {
        //defaults
        const lineWidth = 1;

        this.#lastFrameTime = 0;
        this.#frameCount = 0;

        this.#ctx = canvas.getContext('2d');

        // Set Canvas resolution
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        this.#ctx.scale(dpr, dpr);

        this.#cw = canvas.width;
        this.#ch = canvas.height;

        // setup colors
        this.#ctx.fillStyle = bgColor;
        this.#ctx.strokeStyle = fgColor;
        this.#ctx.lineWidth = lineWidth;

        //this.render = this.render.bind(this); // make 'this' available in callback
    }

    start(audioBuf) {
        this.#dataArray = audioBuf;
    }

    // must be called from outside to get started
    render(time) {
        this.#frameCount++;
        const deltaTime = time - this.#lastFrameTime;
    
        if (deltaTime > 1000) { // Update frequency every second
            this.#fps = this.#frameCount * 1000 / deltaTime;
            //updateFrequencyDisplay.textContent = `Update Frequency: ${fps.toFixed(2)} Hz`;
            this.#frameCount = 0;
            this.#lastFrameTime = time;
            // TODO: signal someone that there is a new frequency value
        }

        // Canvas Background Color
        this.#ctx.fillRect(0, 0, this.#cw, this.#ch);
    
        this.#ctx.beginPath();

        // Calculate smaller dimension
        const minDim = this.#cw < this.#ch ? this.#cw : this.#ch;

        for (let i = 0; i < this.#dataArray[0].length; i++) {
            // Centering and Scaling
            let lAmplitude = this.#dataArray[0][i] * minDim * 0.5;
            let rAmplitude = this.#dataArray[1][i] * minDim * 0.5;

            // Draw point
            this.#ctx.lineTo(lAmplitude + this.#cw / 2, rAmplitude + this.#ch / 2);
        }

        this.#ctx.stroke();
    }
}

export { Engine };