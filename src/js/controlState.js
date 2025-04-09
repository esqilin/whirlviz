
class ControlState {

    constructor() {
        this.state = new Map();
    }

    _add(key, val = undefined) {
        let obj = { val: val, callbacks: [] };
        this.state.set(key, obj);

        return obj;
    }

    setValue(key, val) {
        if (!this.state.has(key)) {
            this._add(key, val);
            return;
        }

        const obj = this.state.get(key);
        obj.val = val;
        this._notify(key, obj);
    }

    listen(key, callback) {
        const obj = this.state.has(key) ? this.get(key) : this._add(key);
        obj.callbacks.push(callback);
    }

    _notify(key, obj) {
        const val = obj.val;
        for (let c of obj.callbacks) {
            c(val, key);
        }
    }
}

export { ControlState };