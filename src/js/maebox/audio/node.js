
class Node {

    get now() {
        return this.context.audioContext.currentTime;
    }

    constructor(context) {
        this.context = context;
        this.node = null;
    }

}

export { Node };