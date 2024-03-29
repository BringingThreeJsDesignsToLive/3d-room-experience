import * as THREE from 'three';
import DefaultExperience from '../utils/DefaultExperience';
import { Camera3dSpace, DefaultExperienceConfig } from '../utils/types';
import World from './World';

const camera3dSpace: Camera3dSpace = {
    position: new THREE.Vector3(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1),
    rotation: new THREE.Vector3(0, 0, 0),
    fov: 65
}
// const camera3dSpace: Camera3dSpace = {
//     position: new THREE.Vector3(-2, 1.1, 1.7),
//     scale: new THREE.Vector3(1, 1, 1),
//     rotation: new THREE.Vector3(0, 0, 0),
//     fov: 75
// }

const defaultExperienceConfig: DefaultExperienceConfig = {
    useWindowSizeOnResize: true,
    showPerformance: true
}

export default class RoomExperience extends DefaultExperience {
    private static _instance: RoomExperience | null;
    world!: World;

    constructor(canvas: HTMLCanvasElement) {
        if (RoomExperience._instance instanceof RoomExperience) {
            return RoomExperience._instance
        }
        super(canvas, camera3dSpace, defaultExperienceConfig)

        this.world = new World(this)

        // Create Singleton
        RoomExperience._instance = this;

        //Time tick event
        this.time.on('tick', this.updateWithTick.bind(this))
    }

    private updateWithTick() {
        this.world.update()
        this.camera.update()
        this.renderer.update()
    }

    destroyExperience() {
        RoomExperience._instance = null;
        this.destroyDefaultExperience();
        this.world.destroy();
    }
}