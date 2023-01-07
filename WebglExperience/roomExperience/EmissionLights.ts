import RoomExperience from ".";
import * as THREE from 'three'
import DebugUI from "../utils/DebugUI";
import Time from "../utils/Time";
import { RoomSourceNames } from "./sources";

interface lightType {
    ps4ControllerLight?: any;
    ps4ControllerLightCover?: any;
    ringLight?: any;
    "scarletLight-green"?: any;
    "scarletLight-red"?: any
}

export type lightNames = keyof lightType
export class EmissionLights {
    lights: lightType;
    time: Time
    loadedResource: Record<RoomSourceNames, any>;
    debugUI: DebugUI;
    isMeshComplete: boolean;
    constructor(experience: RoomExperience) {
        this.lights = {};
        this.time = experience.time
        this.loadedResource = experience.resourcesLoader?.items as Record<RoomSourceNames, any>
        this.debugUI = experience.debugUI;
        this.isMeshComplete = false;
    }

    setupLights() {
        if (this.isMeshComplete) {
            const ps4ControllerEmissionLight = new THREE.MeshBasicMaterial({
                color: "#0A00FF",
                transparent: true,
            });
            const ps4ControllerCover = new THREE.MeshBasicMaterial({ color: "#837eff", });
            const ringEmissionLight = new THREE.MeshBasicMaterial({ color: "#FFFBF8" });
            const scarletGreenEmissionLight = new THREE.MeshBasicMaterial({ color: "#1AE700" });
            const scarletRedEmissionLight = new THREE.MeshBasicMaterial({ color: "#E70300" });

            this.lights.ps4ControllerLight.material = ps4ControllerEmissionLight;
            this.lights.ps4ControllerLightCover.material = ps4ControllerCover;
            this.lights.ringLight.material = ringEmissionLight
            this.lights["scarletLight-green"].material = scarletGreenEmissionLight;
            this.lights["scarletLight-red"].material = scarletRedEmissionLight
        }

    }

    update() {
        if (this.isMeshComplete) {
            this.lights.ps4ControllerLight.material.opacity = Math.sin(this.time.elaspedTime * 0.005)
        }
    }
}