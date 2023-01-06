import GUI from 'lil-gui';
export default class DebugUI {
    isActive: boolean;
    ui!: GUI;
    debugFolder: object = {}
    constructor() {
        this.isActive = window.location.hash === '#debug'
        if (this.isActive) {
            this.ui = new GUI();
        }
    }

    destroy() {
        if (this.isActive) {
            this.ui.destroy();
        }

    }
}