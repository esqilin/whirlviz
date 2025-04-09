
import * as Log from './log.js';


const logTypeToClassMap = {
    [Log.Log.TYPES.Log]: 'log',
    [Log.Log.TYPES.Debug]: 'debug',
    [Log.Log.TYPES.Info]: 'info',
    [Log.Log.TYPES.Warning]: 'warning',
    [Log.Log.TYPES.Error]: 'error',
};

class LogRelay {

    constructor(logger, divContainer) {
        if (!logger || typeof logger.onChange !== 'function') {
            throw new Error("LogRelay requires a valid Log with an onChange method.");
        }
        if (!divContainer || !(divContainer instanceof HTMLElement)) {
            throw new Error("LogRelay requires a valid container DOM element.");
        }

        this.model = logger;
        this.viewDiv = divContainer;

        this._init();
    }

    _init() {
        this.renderAll();
        this.model.onChange(this._handleModelChange.bind(this));
    }

    _handleModelChange(payload) {
        if (null === payload) {
            this.clearView();
            return;
        }

        if (typeof payload === 'object' && payload.entry) {
            switch (payload.type) {
                case 'add':
                    this.appendEntryToView(payload.entry);
                    break;
                case 'shift_add':
                    this.removeFirstEntryFromView();
                    this.appendEntryToView(payload.entry);
                    break;
                default:
                    console.warn("LogRelay received unknown payload type:", payload.type);
                    break;
            }

            this.scrollToBottom();
            return;
        }

        console.warn("LogRelay received unknown payload:", payload);
    }

    _createEntryElement(entry) {
        const entryDiv = document.createElement('div');
        entryDiv.textContent = entry.text;
        const cssClass = logTypeToClassMap[entry.type] || 'log-default';
        entryDiv.classList.add(cssClass);
        entryDiv.classList.add('log-entry');

        return entryDiv;
    }

    appendEntryToView(entry) {
        const entryElement = this._createEntryElement(entry);
        this.viewDiv.appendChild(entryElement);
    }

    removeFirstEntryFromView() {
        const firstChild = this.viewDiv.firstChild;
        if (firstChild) {
            this.viewDiv.removeChild(firstChild);
        }
    }

    renderAll() {
        const fragment = document.createDocumentFragment();
        this.model.entries.forEach(entry => {
            fragment.appendChild(this._createEntryElement(entry));
        });
        this.clearView(); // Clear existing content
        this.viewDiv.appendChild(fragment);
        this.scrollToBottom(); // Scroll after initial render
    }

    clearView() {
        this.viewDiv.innerHTML = '';
    }

    scrollToBottom() {
        // Only scroll if the user isn't already scrolled up
        // Tolerance avoids issues with exact scroll position
        const scrollTolerance = 10;
        const isScrolledToBottom = this.viewDiv.scrollHeight - this.viewDiv.clientHeight <= this.viewDiv.scrollTop + scrollTolerance;
  
        if(isScrolledToBottom) {
             this.viewDiv.scrollTop = this.viewDiv.scrollHeight;
        }
    }
}

export { LogRelay };