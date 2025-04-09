
const TYPES = Object.freeze({
    Log: 0,
    Debug: 1,
    Info: 2,
    Warning: 3,
    Error: 4
});

class Log {

    static get TYPES() {
        return TYPES;
    }

    constructor(nLog = 100) {
        if (typeof nLog !== 'number' || nLog <= 0) {
            throw new Error('nLog must be a positive number.');
        }

        this.nLog = nLog;
        this.entries = [];
        this._listeners = [];
    }

    _push(type, msg) {
        let notificationType = 'add';
        if (this.entries.length >= this.nLog) {
            this.entries.shift();
            notificationType = 'shift_add';
        }

        let entry = { type: type, text: String(msg), timestamp: new Date() };
        this.entries.push(entry);

        this._notifyListeners({ type: notificationType, entry: entry });
    }

    _notifyListeners(entry) {
        this._listeners.forEach(callback => {
            try {
                callback(entry);
            } catch (err) {
                console.error("Error in log listener:", err);
            }
        });
    }

    log(msg) {
        this._push(TYPES.Log, msg);
    }

    debug(msg) {
        this._push(TYPES.Debug, msg);
    }

    info(msg) {
        this._push(TYPES.Info, msg);
    }

    warn(msg) {
        this._push(TYPES.Warn, msg);
    }

    error(msg) {
        this._push(TYPES.Error, msg);
    }

    clear() {
        this.entries.length = 0;
    }

    onChange(callback) {
        this._listeners.push(callback);
    }

}

export { Log };