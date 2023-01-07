import { Camera3dSpace } from './types'
import DefaultExperience from "./DefaultExperience";
import Sizes from './Sizes';
import * as THREE from 'three'
import DebugUI from './DebugUI';


export default class Camera {
    experience: DefaultExperience
    cameraInstance!: THREE.PerspectiveCamera;
    sizes: Sizes;
    scene: THREE.Scene;
    canvas: HTMLCanvasElement;
    camera3dSpace: Camera3dSpace;
    debugUI: DebugUI



    constructor(experience: DefaultExperience, camera3dSpace: Camera3dSpace) {
        // Initialize 
        this.experience = experience;
        this.sizes = experience.sizes;
        this.scene = experience.scene;
        this.canvas = experience.canvas;
        this.camera3dSpace = camera3dSpace;
        this.debugUI = experience.debugUI;


        // create camera instance
        this.setCameraInstance();

        this.addDebugUi();
    }

    private setCameraInstance(): void {
        // create camera instance with passed camera3DSpace details
        this.cameraInstance = new THREE.PerspectiveCamera(this.camera3dSpace.fov, this.sizes.width / this.sizes.height)
        this.cameraInstance.position.set(this.camera3dSpace.position.x, this.camera3dSpace.position.y, this.camera3dSpace.position.z)
        this.cameraInstance.rotation.set(this.camera3dSpace.rotation.x, this.camera3dSpace.rotation.y, this.camera3dSpace.rotation.z)
        this.cameraInstance.scale.set(this.camera3dSpace.scale.x, this.camera3dSpace.scale.y, this.camera3dSpace.scale.z)

        this.scene.add(this.cameraInstance)
    }

    private addDebugUi() {
        if (this.debugUI.isActive) {
            this.debugUI.ui.add(this.cameraInstance.position, 'x').min(-10).max(10).step(0.0001).name('cameraX')
            this.debugUI.ui.add(this.cameraInstance.position, 'y').min(-10).max(10).step(0.0001).name('cameraY')
            this.debugUI.ui.add(this.cameraInstance.position, 'z').min(-10).max(10).step(0.0001).name('cameraZ')
        }
    }
    resize(): void {
        // update camera on screen resize
        this.cameraInstance.aspect = this.sizes.width / this.sizes.height;
        this.cameraInstance.updateProjectionMatrix()
    }

    update() {

    }

    destroy() {

    }
}