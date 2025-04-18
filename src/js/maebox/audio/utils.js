
export function midiToFrequency(idx) {
    return 440 * Math.pow(2, (idx - 69) / 12);
}

export class RingBuffer {
    constructor(capacity, floatsPerElement = 4) {
        if (!Number.isInteger(capacity) || capacity <= 0) {
            throw new Error('Capacity must be a positive integer');
        }
        if (!Number.isInteger(floatsPerElement) || floatsPerElement <= 0) {
            throw new Error('floatsPerElement must be a positive integer');
        }
        if (!this.isPowerOfTwo(capacity)) {
             throw new Error('Capacity must be a power of 2 for bitwise optimization');
        }
        this.capacity = capacity;
        this.floatsPerElement = floatsPerElement;
        // Use a Float32Array to store the data for maximum efficiency with floats
        this.buffer = new Float32Array(capacity * floatsPerElement);
        this.head = 0; // Index to write to (in element index, not byte)
        this.tail = 0; // Index to read from (in element index, not byte)
        this.count = 0; // Number of elements in the buffer
        this.capacityMask = this.capacity - 1; //mask
    }

    isPowerOfTwo(n) {
        return (n & (n - 1)) === 0;
    }

    /*
     * Adds an element (n floats) to the ring buffer.
     * Returns true if the element was added, false if the buffer was full.
     */
    push(...values) {
        if (this.isFull()) {
            return false; // Buffer is full
        }
        if (values.length !== this.floatsPerElement) {
            throw new Error(`push() expects ${this.floatsPerElement} values`);
        }
        const baseIndex = this.head * this.floatsPerElement; // Calculate the base index for the element
        for (let i = 0; i < this.floatsPerElement; i++) {
            this.buffer[baseIndex + i] = values[i];
        }
        this.head = (this.head + 1) & this.capacityMask; // Wrap around
        this.count++;
        return true;
    }

    /*
     * Retrieves and removes the oldest element from the ring buffer.
     * Returns an array of n floats if the buffer is not empty, undefined otherwise.
     */
    pop() {
        if (this.isEmpty()) {
            return undefined; // Buffer is empty
        }
        const baseIndex = this.tail * this.floatsPerElement;
        const element = [];
        for (let i = 0; i < this.floatsPerElement; i++) {
            element.push(this.buffer[baseIndex + i]);
        }
        this.tail = (this.tail + 1) & this.capacityMask; // Wrap around
        this.count--;
        return element;
    }

    /*
     * Retrieves the oldest element from the ring buffer without removing it.
     * Returns an array of n floats  if the buffer is not empty, undefined otherwise.
     */
    peek() {
        if (this.isEmpty()) {
            return undefined;
        }
        const baseIndex = this.tail * this.floatsPerElement;
        const element = [];
        for (let i = 0; i < this.floatsPerElement; i++) {
            element.push(this.buffer[baseIndex + i]);
        }
        return element;
    }

    /*
     * Checks if the buffer is empty.
     * Returns true if the buffer is empty, false otherwise.
     */
    isEmpty() {
        return this.count === 0;
    }

    /*
     * Checks if the buffer is full.
     * Returns true if the buffer is full, false otherwise.
     */
    isFull() {
        return this.count === this.capacity;
    }

    /*
     * Returns the number of elements currently in the buffer.
     */
    size() {
        return this.count;
    }

    /*
     * Clears the buffer, resetting head, tail, and count.
     */
    clear() {
        this.head = 0;
        this.tail = 0;
        this.count = 0;
        this.buffer.fill(0); // Clear the buffer content.  More efficient than creating a new array.
    }

    /*
     * Returns the current capacity of the ring buffer.
     */
    getCapacity() {
        return this.capacity;
    }

    /*
     * Provides an efficient way to iterate over the elements in the buffer.
     * Returns an iterator that yields an array of n floats for each element.
     */
    *iterate() {
        if (this.isEmpty()) {
            return;
        }
        let currentIndex = this.tail;
        for (let i = 0; i < this.count; i++) {
            const baseIndex = currentIndex * this.floatsPerElement;
            const element = [];
            for (let j = 0; j < this.floatsPerElement; j++) {
                element.push(this.buffer[baseIndex + j]);
            }
            yield element;
            currentIndex = (currentIndex + 1) & this.capacityMask;
        }
    }

    /**
     * Applies a callback function to each element in the buffer, modifying the buffer's values.
     *
     * @param {function} callback - A function that takes the current element (as an array of floats)
     * and returns a new array of floats (with the same length).
     *
     * @throws {Error} - If the callback doesn't return the correct number of values.
     */
    map(callback) {
        if (this.isEmpty()) {
            return; // Nothing to map
        }

        let currentIndex = this.tail;
        const currentElement = new Array(this.floatsPerElement); // Initialize once here
        for (let i = 0; i < this.count; i++) {
            const baseIndex = currentIndex * this.floatsPerElement;

            for (let j = 0; j < this.floatsPerElement; j++) {
                currentElement[j] = this.buffer[baseIndex + j]; // Replace values, don't re-allocate
            }
            const updatedElement = callback(currentElement);

            if (!Array.isArray(updatedElement) || updatedElement.length !== this.floatsPerElement) {
                throw new Error(`Callback must return an array of ${this.floatsPerElement} floats`);
            }

            for (let j = 0; j < this.floatsPerElement; j++) {
                this.buffer[baseIndex + j] = updatedElement[j];
            }
            currentIndex = (currentIndex + 1) & this.capacityMask;
        }
    }

}
