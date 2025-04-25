
export class ParticleCloud {

    constructor(log2n, lifetime) {
        this.nFeatures = 3; //x,y,age
        this.size = 1 << log2n;
        this.lifetime = lifetime;

        this.data = new Float32Array(this.size * this.nFeatures);
        this._cursor = 0;
    }

    age(bySeconds) {
        const n = this.data.length;
        const step = this.nFeatures;
        let ttl;

        for (let i = 2; i < n; i += step) {
            ttl = this.data[i];
            if (ttl > 0.0) {
                this.data[i] = ttl - bySeconds;
            }
        }
    }

    placeAt(x, y) {
        const i = this._cursor;
        const j = i + this.nFeatures;

        this.data[i] = x;
        this.data[i+1] = y;
        this.data[i+2] = this.lifetime;

        this._cursor = j >= this.size ? 0 : j;
    }

}