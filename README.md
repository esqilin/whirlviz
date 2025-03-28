
# Links

* https://transloadit.com/devtips/effortless-audio-encoding-in-the-browser-with-webassembly/#:~:text=The%20role%20of%20WebAssembly%20in%20audio%20processing&This%20is%20particularly%20useful%20for%20encoding%20tasks%20that%20require%20high%20performance.


# Plan

* stereo panner node to start working with stereo
* d3.js for visualization and control of INPUT parameters
* later on WebGL will provide better visuals with less artifacts (fragment shader?)
* wasm and Audio Worklets for future extensions
* Loquelic Iteritas and wavefolding
* add PurgeCSS to remove unused CSS
* add a module bundler (like webpack, rollup or parcel) for js modules
* add functionality to record the contents of the canvas and the according audio
* clicks in Firefox despite ramp of 12ms
* one main loop like in a Game Engine to synchronize canvas rendering, audio rendering, and user interaction
* pitch detection of single voice mic input -> use as frequency input for oscillator, only for visualization


# Potential continuations

* MIDI controller template script generator: webapp makes you use controller elements and assign them names/keys. Then it generates a JSON to use as a controller mapping template.
* e-learning courses to teach Web Audio, MIDI and use of MY libraries


# Summary from 22.03.25

**Current State:**

* **Project Foundation:**
    * We have a solid 11ty project setup.
    * Basic Web Audio API functionality is in place (oscillator, gain).
    * We have a functional, aspect-ratio-independent XY-oscilloscope visualization using Canvas.
    * We are aware of the visualization artifacts and have deferred addressing them with WebGL or other optimization techniques for later.
* **Controls:**
    * We have an HTML range slider to control oscillator frequency.
    * We've decided to stick with HTML range sliders or custom Canvas controls for real-time parameter adjustments.
* **Audio Generation:**
    * We've decided to focus on procedural audio and synthesis for this project, excluding field recordings for now.
* **d3.js:**
    * We have noted that d3.js could be used for input parameters, in the future.
* **Audio Worklets:**
    * We have noted that audio worklets will be explored for future optimization and complex audio processing.
* **Sound library:**
    * We have noted that the sound library will be implemented in the future.

**Next Steps (Prioritized):**

1.  **Expand Audio Generation:**
    * Implement more procedural audio techniques (granular synthesis, frequency modulation, additive synthesis, etc.).
    * Add more audio processing nodes (filters, delay, reverb, etc.).
2.  **Enhance User Interface:**
    * Implement more HTML range sliders or custom Canvas controls for various audio parameters.
    * Ensure a user-friendly and intuitive interface.
3.  **Modularize JavaScript:**
    * Structure the JavaScript code for better organization and maintainability.
    * Use functions and classes to encapsulate audio logic.
4.  **Audio Worklet Exploration:**
    * Begin experimenting with Audio Worklets for performance optimization and complex audio processing.
5.  **Future Considerations:**
    * Begin to plan and implement the structure for the sound library.
    * Keep d3.js in mind for potential future use in input parameter visualizations.
    * Keep WebGL in mind for future visualization enhancements.

**Key Considerations:**

* Maintain a modular and organized codebase.
* Prioritize functionality and usability.
* Test thoroughly after each implementation.
* Document progress and code.


# Summary from 21.03.25

**Project:** Ambient Sound Generator (Web Audio API)

**Progress:**

* Basic HTML structure set up.
* Web Audio API context initialized.
* Simple oscillator and gain node implemented.
* Basic waveform visualization working.

**Next Steps:**

* Experiment with different oscillator types and frequencies.
* Add more audio processing nodes (e.g., filters, delay).
* Implement a more sophisticated visualization.
* Explore procedural audio techniques for ambient sound generation.

**Important Notes:**

* We decided to use the Web Audio API directly instead of Pure Data prototyping.
* We're focusing on procedural audio for the initial ambient sound generation.
