
import * as maebox from './maebox/index.js';
import * as whirlwiz from './controlState.js';
import { MidiController } from './maebox/midi/midiController.js';


(function () {

    const logger = new maebox.Log.Log(200);
    const consoleDiv = document.getElementById('log');
    const logRelay = new maebox.Log.LogRelay(logger, consoleDiv);
    const audioEngine = new maebox.Audio.Engine(logger);
    const canvas = document.getElementById('audio-canvas');
    const playButton = document.getElementById('playButton');
    // const frequencySlider = document.getElementById('frequencySlider');
    const gainSlider = document.getElementById('gainSlider');
    const volumeSlider = document.getElementById('volumeSlider');
    const midiController = new maebox.Midi.MidiController(logger);
    const keyController = new maebox.Keyboard.KeyController();
    const controlState = new whirlwiz.ControlState();
    const midiMapper = new maebox.Midi.MidiMapper();

    let isAllSetup = false;

    gainSlider.min = 0;
    gainSlider.max = 100;
    gainSlider.step = 1;
    gainSlider.value = 50; // 0.5 gain

    volumeSlider.min = 0;
    volumeSlider.max = 100;
    volumeSlider.step = 1;
    volumeSlider.value = 50; // 0.5 volume

    function setupKeyboardControls() {
        keyController.setup();

        keyController.addHandler({
            onKeyDown: (key) => {
                    const note = midiMapper.map(key);
                    if (note) {
                        MidiController.triggerNoteOn(note, 64);
                    }
                },
            onKeyUp: (key) => {
                    const note = midiMapper.map(key);
                    if (note) {
                        MidiController.triggerNoteOff(note);
                    }
                }
        });

        return true;
    }

    function setupMidi() {
        try {
            midiController.setup();
        } catch (error) {
            logger.error(error);
            return false;
        }

        let noteOn = function (ch, note, vel) {
            if (0 == ch) {
                audioEngine.noteOn(note, vel);
            } else {
                logger.debug(`NoteOn (ch ${ch}, note ${note}, vel ${vel})`);
            }
        }

        let noteOff = function (ch, note) {
            if (0 == ch) {
                audioEngine.noteOff(note);
            } else {
                logger.debug(`NoteOff (ch ${ch}, note ${note})`);
            }
        }

        let control = function (ch, controller, val) {
            switch (controller) {
                case 27:
                    controlState.setValue('audio.gain', val / 127.0);
                    break;
                case 28:
                    controlState.setValue('audio.volume', val / 127.0);
                    break;
                default:
                    logger.debug(`Control Change: Channel ${ch}, Controller ${controller}, Value ${val}`);
            }
        }

        const eType = MidiController.EVENTTYPES;
        midiController.addHandler((event) => {
            switch (event.type) {
                case eType.NoteOn:
                    noteOn(event.channel, event.note, event.velocity);
                    break;
                case eType.NoteOff:
                    noteOff(event.channel, event.note);
                    break;
                case eType.Control:
                    control(event.channel, event.controller, event.value);
                    break;
                default:
                    logger.warn(`Unknown: ${Array.from(event.data).join(', ')}`);
            }

        });

        return true;
    }

    function setupVisuals() {
        let bodyStyles = window.getComputedStyle(document.body);
        let bgColor = bodyStyles.getPropertyValue('--dark-background');
        let fgColor = bodyStyles.getPropertyValue('--primary-color');
    
        let visualEngine = null;
        try {
            visualEngine = new maebox.Visual.Engine(canvas, bgColor, fgColor, logger);
        } catch (error) {
            logger.error(error);
            return false;
        }
        let ret = visualEngine.start(audioEngine.outSamples);
    
        requestAnimationFrame(function loop(time) {
            audioEngine.analyse();
    
            visualEngine.render(time);
            visualEngine.debugRender(time);
    
            requestAnimationFrame(loop);
        });

        return ret;
    }

    function setupStateCallbacks() {
        function onVolumeChange(val) {
            audioEngine.volume = val;
            volumeSlider.value = Math.round(val * 100);
        }    
        function onGainChange(val) {
            audioEngine.gain = val;
            gainSlider.value = Math.round(val * 100);
        }

        controlState.listen('audio.gain', onGainChange);
        controlState.listen('audio.volume', onVolumeChange);

        return true;
    }

    playButton.addEventListener('click', async () => {
        if (!isAllSetup) {
            isAllSetup = await audioEngine.start();
            if (!isAllSetup) {
                console.error('Something went wrong during audio engine setup.');
                return;
            }

            isAllSetup = isAllSetup && setupVisuals() && setupMidi()
                && setupStateCallbacks() && setupKeyboardControls();
        }

        gainSlider.dispatchEvent(new Event('input'));
        volumeSlider.dispatchEvent(new Event('input'));

        let isMuted = audioEngine.toggleMuted();
        playButton.textContent = isMuted ? "Play" : "Stop";
    });

    // Update gain on slider change
    gainSlider.addEventListener('input', () => {
        let gain = parseInt(gainSlider.value);
        controlState.setValue('audio.gain', gain * 0.01);
    });

    // Update volume on slider change
    volumeSlider.addEventListener('input', () => {
        let vol = parseInt(volumeSlider.value);
        controlState.setValue('audio.volume', vol * 0.01);
    });

})();
