
export function midiToFrequency(idx) {
    return 440 * Math.pow(2, (idx - 69) / 12);
}
