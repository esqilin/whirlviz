
import * as Audio from "./maebox/audio/index.js";
import * as Visual from "./maebox/visual/index.js";


(function () {

    const audioEngine = new Audio.Engine();
    const canvas = document.getElementById('audioCanvas');
    const playButton = document.getElementById('playButton');
    const frequencySlider = document.getElementById('frequencySlider');
    const frequencyDisplay = document.getElementById('frequencyDisplay');
    const updateFrequencyDisplay = document.getElementById('updateFrequencyDisplay');

    frequencySlider.min = 0;
    frequencySlider.max = 127;
    frequencySlider.step = 1;
    frequencySlider.value = 69; // Start at A440

    // Basic Audio Processing
    const oscillator = audioEngine.newOscillator();
    const delay = audioEngine.newDelay(oscillator, 1, 0.95);
    const stereoMerger = audioEngine.newStereoMerger(oscillator, delay);
    const analyser = audioEngine.newStereoAnalyser(stereoMerger);
    audioEngine.addSource(stereoMerger);

    playButton.addEventListener('click', async () => {
        if (await audioEngine.start()) {
            oscillator.start();
        }

        let isMuted = audioEngine.toggleMuted();
        playButton.textContent = isMuted ? "Play" : "Stop";
    });

    // Update frequency on slider change (half-tone steps)
    frequencySlider.addEventListener('input', () => {
        let midiIndex = parseInt(frequencySlider.value);
        let freq = Audio.Utils.midiToFrequency(midiIndex);
        oscillator.frequency = freq;
        frequencyDisplay.textContent = `Oscillator Frequency: ${freq.toFixed(2)} Hz`;
    });

    var bodyStyles = window.getComputedStyle(document.body);
    var bgColor = bodyStyles.getPropertyValue('--dark-text');
    var fgColor = bodyStyles.getPropertyValue('--background-color');

    let visualEngine = new Visual.Engine(canvas, audioEngine.sampleRate, bgColor, fgColor);
    visualEngine.start(analyser.outSamples);

    requestAnimationFrame(function loop(time) {
        analyser.fetchSamples();

        visualEngine.render(time);

        requestAnimationFrame(loop);
    })

})();
