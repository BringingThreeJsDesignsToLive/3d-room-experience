import * as THREE from 'three'
import RoomExperience from '.';
import DebugUI from '../utils/DebugUI';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Navigation from './Navigation';
import GoogleLedLights from './GoogleLedLights';
import { RoomSourceNames } from './sources';
import Time from '../utils/Time';
import { EmissionLights, lightNames } from './EmissionLights';
import CoffeSteam from './CoffeSteam';



export default class World {
    experience: RoomExperience;
    loadedResource: Record<RoomSourceNames, any>;
    debugUI: DebugUI;
    time: Time
    orbitControls!: OrbitControls;
    navigation: Navigation;
    googleLedLights: GoogleLedLights
    emissionLights: EmissionLights;
    coffeeSteam: CoffeSteam;

    constructor(experience: RoomExperience) {
        // Initialize
        this.experience = experience
        this.loadedResource = experience.resourcesLoader?.items as Record<RoomSourceNames, any>
        this.debugUI = experience.debugUI;
        this.time = experience.time;
        this.navigation = new Navigation(experience);
        this.googleLedLights = new GoogleLedLights(experience);
        this.emissionLights = new EmissionLights(experience);
        this.coffeeSteam = new CoffeSteam(experience);


        this.setUp3dRoom();

    }


    setUp3dRoom() {
        this.experience.resourcesLoader.on("3dRoomReady", () => {
            // set up baked1 material
            const baked1Material = new THREE.MeshBasicMaterial({ color: 'grey' });
            this.loadedResource.baked1.encoding = THREE.sRGBEncoding
            this.experience.renderer.rendererInstance.outputEncoding = THREE.sRGBEncoding
            this.loadedResource.baked1.flipY = false;
            baked1Material.map = this.loadedResource.baked1

            // set up baked2 material
            const baked2Material = new THREE.MeshBasicMaterial({ color: 'grey' });
            this.loadedResource.baked2.encoding = THREE.sRGBEncoding
            this.loadedResource.baked2.flipY = false;
            baked2Material.map = this.loadedResource.baked2;


            // loop through scene children and add material to the appropriate model
            this.loadedResource['3dRoomModel'].scene.traverse((child: any) => {
                if (child.parent?.name === "baked1") child.material = baked1Material;
                if (child.parent?.name === "baked2") child.material = baked2Material;

                // extract emission lights
                if (new RegExp('light', 'i').test(child.name)) {
                    this.emissionLights.lights[child.name as lightNames] = child
                }

                // extract coffeSteam object
                if (child.name === "coffeSteam") {
                    this.coffeeSteam.steamMesh = child;
                }

                // extract googlelight object
                if (child.name.includes("googleHomeLed")) {
                    // get the last char of the name which should be a number
                    child.name.trim();
                    const ledIndex = Number(child.name.charAt(child.name.length - 1))
                    this.googleLedLights.leds[ledIndex].mesh = child;
                }
            })
            this.googleLedLights.isMeshComplete = true;
            this.googleLedLights.setUpLights();

            this.emissionLights.isMeshComplete = true;
            this.emissionLights.setupLights();

            this.coffeeSteam.setUpSteam();

            this.experience.scene.add(this.loadedResource['3dRoomModel'].scene);
        })
    }


    update = () => {
        // update on each tick
        if (this.orbitControls) this.orbitControls.update()
        this.navigation.update();
        this.googleLedLights.update();
        this.emissionLights.update();
        this.coffeeSteam.update();


    }

    destroy = () => {
    }
}