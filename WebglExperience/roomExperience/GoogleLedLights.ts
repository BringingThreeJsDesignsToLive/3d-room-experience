import RoomExperience from ".";
import * as THREE from 'three'
import DebugUI from "../utils/DebugUI";


interface LedType {
    mesh: any
}

export default class GoogleLedLights {
    experience: RoomExperience;
    loadedResource: any;
    leds: LedType[];
    texture: THREE.Texture | undefined;
    debugUI: DebugUI;
    constructor(experience: RoomExperience) {
        this.experience = experience;
        this.debugUI = experience.debugUI
        this.loadedResource = experience.resourcesLoader?.items
        this.leds = []

        this.experience.resourcesLoader.on("googleLedLightTextureReady", () => {
            this.texture = this.loadedResource["googleLedLightTexture"];
            this.setUpLights();
        })
    }

    setUpLights() {
        if (this.texture && this.leds.length === 4) {
            this.leds.forEach(led => {
                const material = new THREE.MeshBasicMaterial({
                    color: 'white',
                    transparent: true,
                    alphaMap: this.texture
                })
                led.mesh.material = material
            })
            this.addDebugUI();
        }
    }

    addDebugUI() {
        if (this.debugUI.isActive) {
            const PARAMS = {
                Led0: '#ffffff',
                Led1: '#ffffff',
                Led2: '#ffffff',
                Led3: '#ffffff',
            }
            type ParamsKeyType = keyof typeof PARAMS

            this.leds.forEach((led, i) => {
                this.debugUI.ui.addInput(PARAMS, `Led${i}` as ParamsKeyType).on('change', () => {
                    led.mesh.material.color.set(PARAMS[`Led${i}` as ParamsKeyType]);
                })
            })
        }
    }
} 