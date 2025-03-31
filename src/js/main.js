
import * as maebox from "./maebox/index.js";


(function () {

    const audioEngine = new maebox.Audio.Engine();
    const canvas = document.getElementById('audioCanvas');
    const playButton = document.getElementById('playButton');
    const frequencySlider = document.getElementById('frequencySlider');
    const gainSlider = document.getElementById('gainSlider');
    const volumeSlider = document.getElementById('volumeSlider');
    const frequencyDisplay = document.getElementById('frequencyDisplay');
    const updateFrequencyDisplay = document.getElementById('updateFrequencyDisplay');

    frequencySlider.min = 0;
    frequencySlider.max = 127;
    frequencySlider.step = 1;
    frequencySlider.value = 69; // Start at A440

    gainSlider.min = 0;
    gainSlider.max = 100;
    gainSlider.step = 1;
    gainSlider.value = 100; // 0.5 volume

    volumeSlider.min = 0;
    volumeSlider.max = 100;
    volumeSlider.step = 1;
    volumeSlider.value = 50; // 0.5 volume

    playButton.addEventListener('click', async () => {
        await audioEngine.start();

        let isMuted = audioEngine.toggleMuted();
        playButton.textContent = isMuted ? "Play" : "Stop";
    });

    // Update frequency on slider change (half-tone steps)
    frequencySlider.addEventListener('input', () => {
        let midiIndex = parseInt(frequencySlider.value);
        let freq = maebox.Audio.Utils.midiToFrequency(midiIndex);
        audioEngine.freq = freq;
        frequencyDisplay.textContent = `Oscillator Frequency: ${freq.toFixed(2)} Hz`;
    });

    // Update gain on slider change
    gainSlider.addEventListener('input', () => {
        let gain = parseInt(gainSlider.value);
        audioEngine.gain = gain * 0.01;
        //gainDisplay.textContent = `Oscillator Frequency: ${gain.toFixed(2)} Hz`;
    });

    // Update volume on slider change
    volumeSlider.addEventListener('input', () => {
        let vol = parseInt(volumeSlider.value);
        audioEngine.vol = vol * 0.01;
        //volumeDisplay.textContent = `Oscillator Frequency: ${vol.toFixed(2)} Hz`;
    });

    var bodyStyles = window.getComputedStyle(document.body);
    var bgColor = bodyStyles.getPropertyValue('--dark-text');
    var fgColor = bodyStyles.getPropertyValue('--background-color');

    let visualEngine = new maebox.Visual.Engine(canvas, audioEngine.sampleRate, bgColor, fgColor);
    visualEngine.start(audioEngine.outSamples);

    requestAnimationFrame(function loop(time) {
        audioEngine.analyse();

        visualEngine.render(time);

        requestAnimationFrame(loop);
    });

})();
