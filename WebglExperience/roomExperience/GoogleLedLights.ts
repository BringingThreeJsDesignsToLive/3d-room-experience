import RoomExperience from ".";
import * as THREE from 'three'
import DebugUI from "../utils/DebugUI";
import Time from "../utils/Time";


interface LedType {
    mesh: any,
    color?: string
}

export default class GoogleLedLights {
    experience: RoomExperience;
    loadedResource: any;
    time: Time;
    leds: LedType[];
    texture: THREE.Texture | undefined;
    debugUI: DebugUI;
    isMeshComplete: boolean
    constructor(experience: RoomExperience) {
        this.experience = experience;
        this.debugUI = experience.debugUI
        this.time = experience.time
        this.loadedResource = experience.resourcesLoader?.items
        this.isMeshComplete = false;
        this.leds = new Array(4).fill(null).map(() => ({ mesh: null, color: '' }));

        this.experience.resourcesLoader.on("googleLedLightTextureReady", () => {
            this.texture = this.loadedResource["googleLedLightTexture"];
            this.setUpLights();
        })
    }

    setUpLights() {

        if (this.texture && this.isMeshComplete) {
            const colors = ["#000ce5", "#f50909", "#dde50b", "#29e806"];
            this.leds.forEach((led, i) => {
                const material = new THREE.MeshBasicMaterial({
                    color: colors[i],
                    transparent: true,
                    alphaMap: this.texture
                })
                led.mesh.material = material;
                led.color = colors[i];
            })
            this.addDebugUI();
        }
    }

    addDebugUI() {
        if (this.debugUI.isActive) {
            const PARAMS = {
                Led0: '',
                Led1: '',
                Led2: '',
                Led3: '',
            }
            type ParamsKeyType = keyof typeof PARAMS

            this.leds.forEach((led, i) => {
                PARAMS[`Led${i}` as ParamsKeyType] = led?.color as string
                this.debugUI.ui.addInput(PARAMS, `Led${i}` as ParamsKeyType).on('change', () => {
                    led.mesh.material.color.set(PARAMS[`Led${i}` as ParamsKeyType]);
                })
            })
        }
    }

    update() {
        if (this.isMeshComplete && this.texture) {
            this.leds.forEach((led, i) => {
                led.mesh.material.opacity = Math.sin(this.time.elaspedTime * 0.005 - i) * 0.5 + 0.5;
            })
        }

    }
} 