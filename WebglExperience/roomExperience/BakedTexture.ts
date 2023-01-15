import DebugUI from "../utils/DebugUI";
import * as THREE from 'three'
import Time from "../utils/Time";
import { RoomSourceNames } from "./sources";
import RoomExperience from ".";
import vertexShader from './shaders/bakedTextures/vertex.glsl';
import fragmentShader from './shaders/bakedTextures/fragment.glsl';
import TimeZone from "./TimeZone";

interface BackLights {
    intensity: {
        flow: 'Add' | 'Subtract',
        max: number,
        min: number,
        value: number,
        offset: number
    },
    color: THREE.Color;
    name: string,
}

export default class BakedTextures {
    experience: RoomExperience;
    time: Time;
    loadedResource: Record<RoomSourceNames, any>;
    debugUI: DebugUI;
    timeZone: TimeZone
    baked1Material!: THREE.ShaderMaterial;
    baked2Material!: THREE.ShaderMaterial;
    backLights: BackLights[];
    isReady: boolean;
    constructor(experience: RoomExperience, timeZone: TimeZone) {
        this.experience = experience;
        this.time = experience.time
        this.loadedResource = experience.resourcesLoader?.items as Record<RoomSourceNames, any>
        this.debugUI = experience.debugUI;
        this.timeZone = timeZone;
        this.isReady = false;
        this.backLights = [
            {
                intensity: {
                    flow: 'Add',
                    max: 0.9,
                    min: 0.1,
                    value: 0.1,
                    offset: 0.00001,
                },
                color: new THREE.Color('#f5ff00'),
                name: 'uTvBackLight'
            },
            {
                intensity: {
                    flow: 'Add',
                    max: 0.9,
                    min: 0.1,
                    value: 0.1,
                    offset: 0.0005,
                },
                color: new THREE.Color('#fd1111'),
                name: 'uDeskBackLight'
            },
            {
                intensity: {
                    flow: 'Add',
                    max: 0.9,
                    min: 0.1,
                    value: 0.1,
                    offset: 0.0001,
                },
                color: new THREE.Color('#ff8302'),
                name: 'uMonitorBackLight'
            },
        ];
    }

    setUp() {
        this.experience.renderer.rendererInstance.outputEncoding = THREE.sRGBEncoding



        //set up bakedLightMap1
        this.loadedResource.bakedLightMap1.encoding = THREE.sRGBEncoding
        this.loadedResource.bakedLightMap1.flipY = false;

        //set up bakedLightMap2
        this.loadedResource.bakedLightMap2.encoding = THREE.sRGBEncoding
        this.loadedResource.bakedLightMap2.flipY = false;

        // set up Uniform values for backlight
        const uniformBackLight = {} as any
        this.backLights.forEach((light => {
            uniformBackLight[`${light.name}Intensity`] = { value: light.intensity.value }
            uniformBackLight[`${light.name}Color`] = { value: light.color }
        }))


        // set up baked1 material
        this.loadedResource.baked1.encoding = THREE.sRGBEncoding
        this.loadedResource.baked1.flipY = false;
        this.baked1Material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                ...uniformBackLight,
                uBakedTexture: { value: this.loadedResource.baked1 },
                uBakedLightMapTexture: { value: this.loadedResource.bakedLightMap1 },
            }
        });


        // set up baked2 material
        this.loadedResource.baked2.encoding = THREE.sRGBEncoding
        this.loadedResource.baked2.flipY = false;
        this.baked2Material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                ...uniformBackLight,
                uBakedTexture: { value: this.loadedResource.baked2 },
                uBakedLightMapTexture: { value: this.loadedResource.bakedLightMap2 },
            }
        });

        this.isReady = true;
        this.addDebugUI();

    }

    private handleBackLightIntensity() {
        this.backLights.forEach((light) => {
            if (this.baked1Material.uniforms[`${light.name}Intensity`].value >= 0.9) {
                light.intensity.flow = 'Subtract';
            }
            if (this.baked1Material.uniforms[`${light.name}Intensity`].value <= 0.1) {
                light.intensity.flow = 'Add';
            }

            if (light.intensity.flow === 'Add') {
                this.baked1Material.uniforms[`${light.name}Intensity`].value += this.time.deltaTime * light.intensity.offset;

                this.baked2Material.uniforms[`${light.name}Intensity`].value += this.time.deltaTime * light.intensity.offset;
            } else {
                this.baked1Material.uniforms[`${light.name}Intensity`].value -= this.time.deltaTime * light.intensity.offset;

                this.baked2Material.uniforms[`${light.name}Intensity`].value -= this.time.deltaTime * light.intensity.offset;
            }
        })

    }

    addDebugUI() {
        if (this.debugUI.isActive) {
            const backLightFolder = this.debugUI.ui.addFolder({
                title: 'Back Light Color',
                expanded: true
            })

            const PARAMS = {
                tvBackLight: '#f5ff00',
                monitorBackLight: '#ff8302',
                deskBackLight: '#fd1111'
            }

            backLightFolder.addInput(PARAMS, 'tvBackLight').on('change', () => {
                this.baked1Material.uniforms.uTvBackLightColor.value = new THREE.Color(PARAMS.tvBackLight);
                this.baked2Material.uniforms.uTvBackLightColor.value = new THREE.Color(PARAMS.tvBackLight);
            });
            backLightFolder.addInput(PARAMS, 'monitorBackLight').on('change', () => {
                this.baked1Material.uniforms.uMonitorBackLightColor.value = new THREE.Color(PARAMS.monitorBackLight);
                this.baked2Material.uniforms.uMonitorBackLightColor.value = new THREE.Color(PARAMS.monitorBackLight);
            });
            backLightFolder.addInput(PARAMS, 'deskBackLight').on('change', () => {
                this.baked1Material.uniforms.uDeskBackLightColor.value = new THREE.Color(PARAMS.deskBackLight);
                this.baked2Material.uniforms.uDeskBackLightColor.value = new THREE.Color(PARAMS.deskBackLight);
            });

        }
    }


    update() {
        if (this.isReady) {
            this.handleBackLightIntensity();
        }

    }
}