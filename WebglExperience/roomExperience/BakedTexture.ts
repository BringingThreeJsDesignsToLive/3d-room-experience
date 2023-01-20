import DebugUI from "../utils/DebugUI";
import * as THREE from 'three'
import gsap from 'gsap';
import Time from "../utils/Time";
import { RoomSourceNames } from "./sources";
import RoomExperience from ".";
import vertexShader from './shaders/bakedTextures/vertex.glsl';
import fragmentShader from './shaders/bakedTextures/fragment.glsl';
import { sourceDayClone, sourceNightClone, GroupNamesType } from './sources'
import ResourcesLoader from "../utils/ResourcesLoader";
import { Sources } from "../utils/types";
import getIsDayTime from "../../utils/getIsDayTime";

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
    resourceLoader: ResourcesLoader;
    loadedResource: Record<RoomSourceNames, any>;
    debugUI: DebugUI;
    baked1Material!: THREE.ShaderMaterial;
    baked2Material!: THREE.ShaderMaterial;
    backLights: BackLights[];
    isReady: boolean;
    isDayTime: boolean;
    constructor(experience: RoomExperience) {
        this.experience = experience;
        this.time = experience.time
        this.resourceLoader = experience.resourcesLoader;
        this.loadedResource = experience.resourcesLoader?.items as Record<RoomSourceNames, any>
        this.debugUI = experience.debugUI;
        this.isReady = false;
        this.isDayTime = getIsDayTime();
        this.backLights = [
            {
                intensity: {
                    flow: 'Add',
                    max: 0.9,
                    min: 0.1,
                    value: 0.1,
                    offset: 0.00005,
                },
                color: new THREE.Color('#f5ff00'),
                name: 'uTvBackLight'
            },
            {
                intensity: {
                    flow: 'Add',
                    max: 1.5,
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



        let baked1Texture: THREE.Texture;
        let baked2Texture: THREE.Texture;

        if (this.isDayTime) {
            baked1Texture = this.loadedResource.baked1Day
            baked2Texture = this.loadedResource.baked2Day

            // Now Load Night Textures
            this.loadRemainingResource(false, sourceNightClone, "3dRoomNight" as GroupNamesType)

        } else {
            baked1Texture = this.loadedResource.baked1Night
            baked2Texture = this.loadedResource.baked2Night

            //  Now Load Day texture
            sourceDayClone.forEach(source => source.totalGroupMember = sourceNightClone.length);

        }

        // set up baked1 material
        baked1Texture.encoding = THREE.sRGBEncoding;
        baked1Texture.flipY = false;
        this.baked1Material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                ...uniformBackLight,
                uBakedDayTexture: { value: baked1Texture },
                uBakedNightTexture: { value: baked1Texture },
                uIsDayTime: { value: this.isDayTime ? 1.0 : 0.0 },
                uBakedLightMapTexture: { value: this.loadedResource.bakedLightMap1 },
            }
        });


        // set up baked2 material
        baked2Texture.encoding = THREE.sRGBEncoding;
        baked2Texture.flipY = false;
        this.baked2Material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                ...uniformBackLight,
                uBakedDayTexture: { value: baked2Texture },
                uBakedNightTexture: { value: baked2Texture },
                uIsDayTime: { value: this.isDayTime ? 1.0 : 0.0 },
                uBakedLightMapTexture: { value: this.loadedResource.bakedLightMap2 },
            }
        });

        this.isReady = true;
        this.addDebugUI();

    }


    loadRemainingResource(isDayTexture: boolean, sources: Sources[], groupName: GroupNamesType) {
        sources.forEach(source => source.totalGroupMember = sourceNightClone.length);
        this.resourceLoader.loadSources(sources);

        // update uniforms with correct textures
        this.resourceLoader.on(`${groupName}Ready`, () => {
            if (isDayTexture) {
                this.loadedResource.baked1Day.encoding = THREE.sRGBEncoding;
                this.loadedResource.baked1Day.flipY = false;
                this.loadedResource.baked2Day.encoding = THREE.sRGBEncoding;
                this.loadedResource.baked2Day.flipY = false;

                this.baked1Material.uniforms.uBakedDayTexture.value = this.loadedResource.baked1Day;
                this.baked2Material.uniforms.uBakedDayTexture.value = this.loadedResource.baked2Day;
            } else {
                this.loadedResource.baked1Night.encoding = THREE.sRGBEncoding;
                this.loadedResource.baked1Night.flipY = false;
                this.loadedResource.baked2Night.encoding = THREE.sRGBEncoding;
                this.loadedResource.baked2Night.flipY = false;

                this.baked1Material.uniforms.uBakedNightTexture.value = this.loadedResource.baked1Night;
                this.baked2Material.uniforms.uBakedNightTexture.value = this.loadedResource.baked2Night;
            }
        })
    }

    timeZoneChanged(isDayTime: boolean) {
        gsap.to(
            [
                this.baked1Material.uniforms.uIsDayTime,
                this.baked2Material.uniforms.uIsDayTime
            ],
            {
                value: isDayTime ? 1.0 : 0.0,
                duration: 4
            }
        )
    }

    private handleBackLightIntensity() {
        this.backLights.forEach((light) => {
            if (this.baked1Material.uniforms[`${light.name}Intensity`].value >= light.intensity.max) {
                this.baked1Material.uniforms[`${light.name}Intensity`].value = light.intensity.max;
                this.baked2Material.uniforms[`${light.name}Intensity`].value = light.intensity.max;
                light.intensity.flow = 'Subtract';
            }
            if (this.baked1Material.uniforms[`${light.name}Intensity`].value <= light.intensity.min) {
                this.baked1Material.uniforms[`${light.name}Intensity`].value = light.intensity.min;
                this.baked2Material.uniforms[`${light.name}Intensity`].value = light.intensity.min;
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