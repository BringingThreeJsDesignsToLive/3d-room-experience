import * as THREE from 'three'
// import RoomExperience from '.'
import { MouseCursorPosition } from "../utils/types";
import gsap from 'gsap'
import RoomExperience from '.';
import DebugUI from '../utils/DebugUI';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Navigation from './Navigation';


export default class World {
    experience: RoomExperience;
    loadedResource: any;
    debugUI: DebugUI;
    orbitControls!: OrbitControls;
    navigation: Navigation

    constructor(experience: RoomExperience) {
        // Initialize
        this.experience = experience
        this.loadedResource = experience.resourcesLoader?.items
        this.debugUI = experience.debugUI;
        this.navigation = new Navigation(experience);

        this.setUp3dRoom();

    }

    initiateOrbitControls() {
        this.orbitControls = new OrbitControls(this.experience.camera.cameraInstance, this.experience.canvas);
        this.orbitControls.enableDamping = true;

        // control zoom
        this.orbitControls.zoomSpeed = 0.1
        this.orbitControls.maxDistance = 5.0
        this.orbitControls.minDistance = 1.0

        // control horizontal orbit
        this.orbitControls.minAzimuthAngle = (-1 * Math.PI) / 2;
        this.orbitControls.maxAzimuthAngle = Math.PI / 12;

        // controls vertical orbit
        this.orbitControls.maxPolarAngle = Math.PI / 2.2
    }


    setUp3dRoom() {
        this.experience.resourcesLoader.on("3dRoomReady", () => {
            // set up baked1 material
            const baked1Material = new THREE.MeshBasicMaterial({ color: 'grey' });
            this.loadedResource['baked1'].encoding = THREE.sRGBEncoding
            this.experience.renderer.rendererInstance.outputEncoding = THREE.sRGBEncoding
            this.loadedResource['baked1'].flipY = false;
            baked1Material.map = this.loadedResource['baked1']

            // set up baked2 material
            const baked2Material = new THREE.MeshBasicMaterial({ color: 'grey' });
            this.loadedResource['baked2'].encoding = THREE.sRGBEncoding
            this.experience.renderer.rendererInstance.outputEncoding = THREE.sRGBEncoding
            this.loadedResource['baked2'].flipY = false;
            baked2Material.map = this.loadedResource['baked2'];

            // Emission Light materials
            const ps4ControllerEmissionLight = new THREE.MeshBasicMaterial({ color: "#0A00FF" });
            const ringEmissionLight = new THREE.MeshBasicMaterial({ color: "#FFFBF8" });
            const scarletGreenEmissionLight = new THREE.MeshBasicMaterial({ color: "#1AE700" });
            const scarletRedEmissionLight = new THREE.MeshBasicMaterial({ color: "#E70300" });



            // loop through scene children and add material to the appropriate model
            this.loadedResource['3dRoomModel'].scene.traverse((child: any) => {
                if (child.parent?.name === "baked1") child.material = baked1Material;
                if (child.parent?.name === "baked2") child.material = baked2Material;
                if (child.name === "ps4ControllerLight") child.material = ps4ControllerEmissionLight;
                if (child.name === "ringLight") child.material = ringEmissionLight;
                if (child.name === "scarletLight-green") child.material = scarletGreenEmissionLight;
                if (child.name === "scarletLight-red") child.material = scarletRedEmissionLight;
            })

            this.experience.scene.add(this.loadedResource['3dRoomModel'].scene);
            // this.initiateOrbitControls();
            // this.orbitControls.target = this.loadedResource['3dRoomModel'].scene.position
        })
    }


    update = () => {
        // update on each tick
        if (this.orbitControls) this.orbitControls.update()
        this.navigation.update();
    }

    destroy = () => {
    }
}