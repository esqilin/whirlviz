
const EVENTTYPES = Object.freeze({
    NoteOff: 0,
    NoteOn: 1,
    Control: 2,
    Unknown: 3
});


class MidiController {

    static get EVENTTYPES() {
        return EVENTTYPES;
    }

    constructor(logger) {
        this.logger = logger;
    }

    static _triggerMessage(detail) {
        const customEvent = new CustomEvent('midiMessage', { detail: detail });
        window.dispatchEvent(customEvent);
    }

    static triggerNoteOff(note, channel = 0) {
        MidiController._triggerMessage({
            type: EVENTTYPES.NoteOff,
            channel: channel,
            note: note,
            velocity: 0
        });
    }

    static triggerNoteOn(note, velocity, channel = 0) {
        MidiController._triggerMessage({
            type: EVENTTYPES.NoteOn,
            channel: channel,
            note: note,
            velocity: velocity
        });
    }

    static triggerControl(controller, value, channel = 0) {
        MidiController._triggerMessage({
            type: EVENTTYPES.Control,
            channel: channel,
            controller: controller,
            value: value
        });
    }

    onMessage(message) {
        const data = message.data;
        const status = data[0] >> 4; // Get the status (e.g., 8, 9, 11)
        const channel = data[0] & 0x0F; // Get the channel (0-15)
        const note = data[1];
        const velocity = data[2];

        switch (status) {
            case 0x08: // Note Off
                MidiController.triggerNoteOff(note, channel);
                break;
            case 0x09: // Note On
                MidiController.triggerNoteOn(note, velocity, channel);
                break;
            case 0x0B: // Control Change
                MidiController.triggerControl(note, velocity, channel);
                break;
            default:
                MidiController._triggerMessage({ type: 'unknown', data: data });
        }
    }

    onSuccess(access) {
        const inputs = access.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = this.onMessage;
            this.logger.debug(`Input device: ${input.value.name}`, input.value);
        }

        // Listen for new devices connecting
        access.onstatechange = (event) => {
            if (event.port.type === 'input') {
                if (event.port.state === 'connected') {
                    event.port.onmidimessage = this.onMessage.bind(this);
                    this.logger.debug(`Input device connected: ${event.port.name}`);
                    this.logger.info('MIDI input ready!');
                } else if (event.port.state === 'disconnected') {
                    this.logger.debug(`Input device disconnected: ${event.port.name}`);
                    this.logger.info('No MIDI input detected.');
                } else {
                    this.logger.warn(`Unknown input device status: ${event.port.state} (${event.port.name})`);
                }
            } else {
                this.logger.debug(`MIDI device state change: ${event} (do nothing)`);
            }
        };
    }

    onError(error) {
        this.logger.error(error);
    }

    setup() {
        if (!navigator.requestMIDIAccess) {
            throw new Error('Web MIDI is not supported in this browser.');
        }

        navigator.requestMIDIAccess({
            sysex: true, // Request system exclusive access (optional, for more advanced messages)
        }).then(this.onSuccess.bind(this), this.onError.bind(this));
    }

    addHandler(f) {
        window.addEventListener('midiMessage', (event) => {
            let midiEvent = event.detail;
            f(midiEvent);
        });
    }

}

export { MidiController };