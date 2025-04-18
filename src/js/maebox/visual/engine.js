
import { ParticleCloud } from './particleCloud.js';


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

export class Engine {

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
        const particleLifetime = 2.0;
        const log2nParticles = 14;

        this.#lastFrameTime = 0;
        // this.#frameCount = 0;
        this._particles = new ParticleCloud(log2nParticles, particleLifetime);
        this._particleAgeStep = 1.0 / 60.0; // TODO: compute fps and update accordingly

        this.#ctx = canvas.getContext('webgl');
        if (!this.#ctx) {
            throw new Error('WebGL not supported');
        }

        // setup colors
        this._bgColor = bgColor;
        this._fgColor = fgColor;
        this.#bgColor = hexToRgbFloat(bgColor);
        this.#fgColor = hexToRgbFloat(fgColor); // TODO: doesn't need to be an object property

        // Set Canvas resolution
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;

        this.#cw = canvas.width;
        this.#ch = canvas.height;

        const vertexShaderSource = `
attribute vec4 a_particleData; // x, y, ttl

uniform float u_time;
uniform float u_lifetime;
varying float v_alpha;

void main() {
    float ttl = a_particleData.z;

    if (ttl > 0.0) {
        vec2 basePos = a_particleData.xy;
        vec2 pos = basePos;
        v_alpha = ttl / u_lifetime;
        pos = pos + (1.0 - v_alpha);
        gl_Position = vec4(pos, 0.0, 1.0);
    } else {
        gl_Position = vec4(10000.0, 10000.0, 0.0, 1.0);
        v_alpha = 0.0;
    }
    gl_PointSize = 1.0;
}`;

        const fragmentShaderSource = `
  precision mediump float;

  uniform vec4 u_color;
  varying float v_alpha;

  void main() {
    gl_FragColor = vec4(u_color.xyz, v_alpha);
  }
`;

        const gl = this.#ctx;

        // Create shaders and program
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            const err = gl.getShaderInfoLog(vertexShader);
            logger.debug(`Error compiling vertex shader: ${err}`);
        }

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            const err = gl.getShaderInfoLog(fragmentShader);
            logger.debug(`Error compiling fragment shader: ${err}`);
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        // Get attribute locations
        const xSampleLoc = gl.getAttribLocation(program, "a_xs");
        const ySampleLoc = gl.getAttribLocation(program, "a_ys");
        const particleDataLoc = gl.getAttribLocation(program, "a_particleData");
        this._timeLoc = gl.getUniformLocation(program, "u_time");
        const colorLoc = gl.getUniformLocation(program, "u_color");
        const lifetimeLoc = gl.getUniformLocation(program, "u_lifetime");

        this._particleDataBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._particleDataBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._particles.data, gl.DYNAMIC_DRAW);

        // gl.enableVertexAttribArray(xSampleLoc);
        // gl.vertexAttribPointer(xSampleLoc, 1, gl.FLOAT, false, 0, 0);
        // gl.enableVertexAttribArray(xSampleLoc);
        // gl.vertexAttribPointer(ySampleLoc, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(particleDataLoc);
        gl.vertexAttribPointer(particleDataLoc, this._particles.nFeatures, gl.FLOAT, false, 0, 0);

        gl.uniform4f(colorLoc, this.#fgColor.r, this.#fgColor.g, this.#fgColor.b, 1.0);
        gl.uniform1f(lifetimeLoc, this._particles.lifetime);

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

        this.logger.info('Visuals engine has been started.');

        return true;
    }

    // must be called from outside to get started
    render(time) {
        const gl = this.#ctx;
        const xs = this.#dataArray[0];
        const ys = this.#dataArray[1];
        const bufferLength = xs.length;
        const minDim = Math.min(this.#cw, this.#ch);
        const xScale = minDim / this.#cw;
        const yScale = minDim / this.#ch;
    
        // this.#frameCount++;
        const deltaTime = time - this.#lastFrameTime;
        this.#lastFrameTime = time;

        // if (deltaTime > 1000) { // Update frequency every second
        //     this.#fps = this.#frameCount * 1000 / deltaTime;
        //     this.#frameCount = 0;
        //     this.#lastFrameTime = time;
        //     // TODO: signal someone that there is a new frequency value
        // }

        // set viewport to canvas size
        gl.viewport(0, 0, this.#cw, this.#ch);

        // clear background
        gl.clearColor(this.#bgColor.r, this.#bgColor.g, this.#bgColor.b, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        for (let i = 0; i < bufferLength; i++) {
            this._particles.placeAt(xs[i] * xScale, ys[i] * yScale);
        }
      
        // update instance data (age)
        this._particles.age(this._particleAgeStep);

        gl.uniform1f(this._timeLoc, deltaTime / 1000);

        // bufferSubData is more efficient!
        gl.bufferData(gl.ARRAY_BUFFER, this._particles.data, gl.DYNAMIC_DRAW);

        gl.drawArrays(gl.POINTS, 0, this._particles.size);

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