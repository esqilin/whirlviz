
export class KeyController {
    
    constructor() {
        this._keymap = new Map();
        this._handlers = [];

        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

    setup() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    onKeyDown(event) {
        const key = event.key;
        if (this._keymap.has(key)) {
            this._keymap.set(key, this._keymap.get(key) + 1);
        } else {
            this._keymap.set(key, 0);
            for (let i = 0; i < this._handlers.length; i++) {
                this._handlers[i].onKeyDown(key);
            }
        }
    }

    onKeyUp(event) {
        const key = event.key;
        if (this._keymap.has(key)) {
            for (let i = 0; i < this._handlers.length; i++) {
                this._handlers[i].onKeyUp(key);
            }
            this._keymap.delete(key);
        }
    }

    addHandler(handler) {
        this._handlers.push(handler);
    }

}
