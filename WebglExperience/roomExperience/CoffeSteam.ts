import * as THREE from 'three'
import DebugUI from "../utils/DebugUI";
import Time from "../utils/Time";
import { RoomSourceNames } from "./sources";
import RoomExperience from ".";
import coffeeSteamVertexShader from './shaders/coffeSteam/vertex.glsl'
import coffeeSteamFragmentShader from './shaders/coffeSteam/fragment.glsl'



export default class CoffeSteam {
    time: Time;
    loadedResource: Record<RoomSourceNames, any>;
    debugUI: DebugUI;
    steamMesh: any;
    steamMaterial!: THREE.ShaderMaterial;
    constructor(experience: RoomExperience) {
        this.time = experience.time
        this.loadedResource = experience.resourcesLoader?.items as Record<RoomSourceNames, any>
        this.debugUI = experience.debugUI;
    }

    setUpSteam() {
        this.steamMaterial = new THREE.ShaderMaterial({
            vertexShader: coffeeSteamVertexShader,
            fragmentShader: coffeeSteamFragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uTimeFrequency: { value: 0.0006 },
                uUvFrequency: { value: new THREE.Vector2(-2.62, 1.47) }
            } as any
        });
        this.steamMesh.material = this.steamMaterial;
        this.addDebugUI();

    }

    addDebugUI() {
        if (this.debugUI.isActive) {
            const coffeeSteamFolder = this.debugUI.ui.addFolder({
                title: "Coffee Steam",
                expanded: false,
            })
            const PARAMS = {
                position: { x: this.steamMesh.position.x, y: this.steamMesh.position.y, z: this.steamMesh.position.z },
                uUvFrequency: this.steamMaterial.uniforms.uUvFrequency.value,
                uTimeFrequency: this.steamMaterial.uniforms.uTimeFrequency.value,
            }

            coffeeSteamFolder.addInput(PARAMS, 'uUvFrequency');
            coffeeSteamFolder.addInput(PARAMS, 'uTimeFrequency', { min: 0.0001, max: 0.01, step: 0.0001 }).on('change', () => {
                this.steamMaterial.uniforms.uTimeFrequency.value = PARAMS.uTimeFrequency;
            });
            coffeeSteamFolder.addInput(PARAMS, 'position').on("change", () => {
                const { x, y, z } = PARAMS.position;
                this.steamMesh.position.set(x, y, z);
            })

        }

    }


    update() {
        if (this.steamMaterial) {
            this.steamMaterial.uniforms.uTime.value = this.time.elaspedTime;
        }

    }
}