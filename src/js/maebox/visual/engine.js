
function hexToRgbFloat(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
            a: 1.0,
        }
        : null;
}

class Engine {

    #lastFrameTime;
    #frameCount;
    #ctx;
    #dataArray;
    #fps;
    #cw;
    #ch;
    #bgColor;
    #fgColor;

    constructor(canvas, bgColor, fgColor, logger) {
        //defaults
        const lineWidth = 1;

        this.#lastFrameTime = 0;
        this.#frameCount = 0;

        this.#ctx = canvas.getContext('webgl');
        if (!this.#ctx) {
            throw new Error('WebGL not supported');
        }

        // Set Canvas resolution
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;

        this.#cw = canvas.width;
        this.#ch = canvas.height;

        const vertexShaderSource = `
  attribute vec4 a_particleData; // x, y, age, lifetime

  uniform float u_time;
  varying float v_alpha;

  void main() {
    float age = a_particleData.z;
    float lifetime = a_particleData.w;
    vec2 pos = a_particleData.xy;

    if (age < lifetime) {
      gl_Position = vec4(pos, 0.0, 1.0);
      v_alpha = 1.0 - age / lifetime;
    } else {
      gl_Position = vec4(10000.0, 10000.0, 0.0, 1.0);
      v_alpha = 0.0;
    }
    gl_PointSize = 1.0;
  }
`;

        const fragmentShaderSource = `
  precision mediump float;

  varying float v_alpha;
  uniform vec4 u_color;

  void main() {
    gl_FragColor = vec4(u_color.xyz, v_alpha);
  }
`;

        const gl = this.#ctx;

        // Create shaders and program
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        // TODO: check gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        logger.debug(gl.getShaderInfoLog(vertexShader));

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        // TODO: check gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        logger.debug(gl.getShaderInfoLog(fragmentShader));

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        // Get attribute locations
        // const positionLocation = gl.getAttribLocation(program, "a_position");
        const particleDataLoc = gl.getAttribLocation(program, "a_particleData");
        this._timeLoc = gl.getUniformLocation(program, "u_time");
        this._colorLoc = gl.getUniformLocation(program, "u_color");

        this._particleDataBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._particleDataBuffer);

        gl.enableVertexAttribArray(particleDataLoc);
        gl.vertexAttribPointer(particleDataLoc, 4, gl.FLOAT, false, 0, 0);

        // setup colors
        this._bgColor = bgColor;
        this._fgColor = fgColor;
        this.#bgColor = hexToRgbFloat(bgColor);
        this.#fgColor = hexToRgbFloat(fgColor);

        // ### debug visualization

        // set canvas resolution
        const dCanvas = document.getElementById('debugCanvas');
        const dDpr = window.devicePixelRatio || 1;
        dCanvas.width = dCanvas.clientWidth * dDpr;
        dCanvas.height = dCanvas.clientHeight * dDpr;

        this._debug = {
            ctx: dCanvas.getContext('2d'),
            cw: dCanvas.width,
            ch: dCanvas.height
        };

        this.logger = logger;
    }

    start(audioBuf) {
        this.#dataArray = audioBuf;

        this._particleData = [];
        this._lifetime = 2.0;
        this._particleLimit = 10000;
        this._bufferNeedsUpdate = true;

        this.logger.info('Visuals engine has been started.');

        return true;
    }

    // must be called from outside to get started
    render(time) {
        const gl = this.#ctx;
        const xs = this.#dataArray[0];
        const ys = this.#dataArray[1];
        const bufferLength = xs.length;
        const lifetime = this._lifetime;
        const minDim = Math.min(this.#cw, this.#ch);
        const xScale = minDim / this.#cw;
        const yScale = minDim / this.#ch;

        let nParticles = this._particleData.length >> 2;
    
        this.#frameCount++;
        const deltaTime = time - this.#lastFrameTime;

        if (deltaTime > 1000) { // Update frequency every second
            this.#fps = this.#frameCount * 1000 / deltaTime;
            this.#frameCount = 0;
            this.#lastFrameTime = time;
            // TODO: signal someone that there is a new frequency value
        }

        // set viewport to canvas size
        gl.viewport(0, 0, this.#cw, this.#ch);

        // clear background
        gl.clearColor(this.#bgColor.r, this.#bgColor.g, this.#bgColor.b, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // TODO: rethink this. array should always be the same
        for (let i = 0; i < bufferLength; i++) {
            this._particleData.push(
                xs[i] * xScale,
                ys[i] * yScale,
                0,
                lifetime);
        }
        nParticles = this._particleData.length >> 2;
      
        // update instance data (age)
        let age;
        let j;
        for (let i = 0; i < nParticles; i++) {
            j = (i << 2) + 2;
            age = this._particleData[j];
            if (age < lifetime) {
                this._particleData[j] += 0.016; // TODO: assuming 60 fps
            }
        }

        while (nParticles > this._particleLimit) {
            this._particleData.splice(0, 4);
            nParticles--;
            this._bufferNeedsUpdate = true;
        }

        if (this._bufferNeedsUpdate) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._particleDataBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._particleData), gl.DYNAMIC_DRAW);
            this._bufferNeedsUpdate = false;
        }
      
        gl.uniform1f(this._timeLoc, time / 1000);
        gl.uniform4f(this._colorLoc, this.#fgColor.r, this.#fgColor.g, this.#fgColor.b, 1.0);

        gl.drawArrays(gl.POINTS, 0, nParticles);

        gl.disable(gl.BLEND);
    }

    debugRender(time) {
        const ctx = this._debug.ctx;
        const cw = this._debug.cw;
        const ch = this._debug.ch;
        const samples = this.#dataArray[2];

        ctx.clearRect(0, 0, cw, ch);
        ctx.fillStyle = this._bgColor;
        ctx.fillRect(0, 0, cw, ch);

        if (!samples || samples.length === 0) {
            return; // Nothing to draw
        }

        ctx.fillStyle = this._fgColor;

        const dataLength = samples.length;
        const sliceWidth = cw / dataLength;
        let x = 0;

        for (let i = 0; i < dataLength; i++) {
            const v = samples[i];
            const y = (1 - v) * ch / 2; // Scale to fit canvas
            ctx.fillRect(x, y, 1, 1);
            x += sliceWidth;
        }
    }

}

export { Engine };