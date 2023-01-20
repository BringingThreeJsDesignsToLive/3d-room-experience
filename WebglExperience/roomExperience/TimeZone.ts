import * as THREE from 'three'
import DebugUI from "../utils/DebugUI";
import Time from "../utils/Time";
import RoomExperience from ".";
import vertexShader from './shaders/timeZone/vertex.glsl';
import fragmentShader from './shaders/timeZone/fragment.glsl';
import gsap from 'gsap'
import { sourcesDefaultClone, sourceDayClone, sourceNightClone, GroupNamesType } from './sources'
import getIsDayTime from '../../utils/getIsDayTime';
import ResourcesLoader from '../utils/ResourcesLoader';
import { Sources } from '../utils/types';
import BakedTextures from './BakedTexture';

export default class TimeZone {
    time: Time;
    debugUI: DebugUI;
    scene: THREE.Scene;
    resourceLoader: ResourcesLoader;
    bakedTextures: BakedTextures;
    sunlight!: THREE.Mesh;
    sunLightMaterial!: THREE.ShaderMaterial;
    moonlight!: THREE.Mesh;
    moonLightMaterial!: THREE.ShaderMaterial;
    isDayTime!: boolean;
    constructor(experience: RoomExperience, bakedTextures: BakedTextures) {
        this.time = experience.time;
        this.debugUI = experience.debugUI;
        this.scene = experience.scene;
        this.resourceLoader = experience.resourcesLoader;
        this.bakedTextures = bakedTextures

        this.setUp();
        this.addDebugUI();

    }

    setUp() {
        this.isDayTime = getIsDayTime();
        this.isDayTime = getIsDayTime();
        const currentTimeSwitch = document.getElementById('currentTime') as HTMLInputElement;

        // Get sources based on if its day or night
        let sources = [] as Sources[];
        if (this.isDayTime) {
            sources = [...sourcesDefaultClone, ...sourceDayClone];
            sources.forEach(source => {
                source.groupName = '3dRoomDay' as GroupNamesType
                source.totalGroupMember = sources.length;
            })
        } else {
            sources = [...sourcesDefaultClone, ...sourceNightClone];
            sources.forEach(source => {
                source.groupName = '3dRoomNight' as GroupNamesType
                source.totalGroupMember = sources.length;
            })
        }

        this.resourceLoader.loadSources(sources);


        const geometry = new THREE.PlaneGeometry(1.5, 1.5, 1, 1);
        this.setUpSunLight(geometry);
        this.setUpMoonLight(geometry);

        currentTimeSwitch.addEventListener('change', this.onCurrentTimeChange.bind(this))


    }

    private setUpSunLight(geometry: THREE.PlaneGeometry) {
        this.sunLightMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            uniforms: {
                uColor: { value: new THREE.Color("#ffeec6") }
            },
            side: THREE.DoubleSide
        });
        this.sunlight = new THREE.Mesh(geometry, this.sunLightMaterial);
        this.sunlight.position.x = -1.51;
        this.sunlight.position.y = this.isDayTime ? 1.92 : -9.0;
        this.sunlight.position.z = -1.52;
        this.scene.add(this.sunlight);

    }

    private setUpMoonLight(geometry: THREE.PlaneGeometry) {
        this.moonLightMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            uniforms: {
                uColor: { value: new THREE.Color("#5273f8") }
            },
            side: THREE.DoubleSide
        });
        this.moonlight = new THREE.Mesh(geometry, this.moonLightMaterial);
        this.moonlight.position.x = -1.51;
        this.moonlight.position.y = !this.isDayTime ? 1.92 : 5.0;
        this.moonlight.position.z = -1.52;
        this.scene.add(this.moonlight);
    }

    private onCurrentTimeChange() {
        const currentTimeSwitch = document.getElementById('currentTime') as HTMLInputElement;
        if (currentTimeSwitch.value === 'true') {
            this.isDayTime = true;
        } else {
            this.isDayTime = false;
        }

        this.animate();
        this.bakedTextures.timeZoneChanged(this.isDayTime);
    }


    private animate() {
        const currentTimeSwitch = document.getElementById('currentTime') as HTMLInputElement;
        const currentTimeSwitchWrapper = document.querySelector('.MuiButtonBase-root') as HTMLDivElement
        currentTimeSwitchWrapper.classList.add('Mui-disabled');

        if (this.isDayTime) {
            // show sunlight 
            const tl = gsap.timeline({
                defaults: { duration: 1, ease: 'Power0.easeInOut' }
            })

            tl
                .to(
                    this.moonlight.position,
                    {
                        y: 5.0,
                        onComplete: () => {
                            this.moonlight.visible = false;
                            this.sunlight.visible = true;
                        }
                    })
                .to(this.sunlight.position, {
                    y: 1.92,
                    onComplete: () => {
                        currentTimeSwitch.dataset.disabled = 'false'
                        currentTimeSwitchWrapper.classList.remove('Mui-disabled')
                    }
                })
        } else {
            // show moonlight
            const tl = gsap.timeline({
                defaults: { duration: 1 }
            })

            tl
                .to(
                    this.sunlight.position,
                    {
                        y: -9.0,
                        onComplete: () => {
                            this.sunlight.visible = false;
                            this.moonlight.visible = true;
                        }
                    })
                .to(this.moonlight.position, {
                    y: 1.92,
                    onComplete: () => {
                        currentTimeSwitch.dataset.disabled = 'false';
                        currentTimeSwitchWrapper.classList.remove('Mui-disabled')
                    }
                })
        }
    }

    addDebugUI() {
        if (this.debugUI.isActive) {
            const timeZoneFolder = this.debugUI.ui.addFolder({
                title: "TimeZone",
                expanded: true
            })

            if (this.isDayTime) {
                const PARAMS = {
                    position: { x: this.sunlight.position.x, y: this.sunlight.position.y, z: this.sunlight.position.z },
                    color: "#FDB813"
                }

                timeZoneFolder.addInput(PARAMS, 'position').on('change', () => {
                    this.sunlight.position.set(PARAMS.position.x, PARAMS.position.y, PARAMS.position.z)
                })

                timeZoneFolder.addInput(PARAMS, 'color').on('change', () => {
                    this.sunLightMaterial.uniforms.uColor.value = new THREE.Color(PARAMS.color);
                })
            } else {
                const PARAMS = {
                    position: { x: this.moonlight.position.x, y: this.moonlight.position.y, z: this.moonlight.position.z },
                    color: "#5273f8"
                }

                timeZoneFolder.addInput(PARAMS, 'position').on('change', () => {
                    this.moonlight.position.set(PARAMS.position.x, PARAMS.position.y, PARAMS.position.z)
                })

                timeZoneFolder.addInput(PARAMS, 'color').on('change', () => {
                    this.moonLightMaterial.uniforms.uColor.value = new THREE.Color(PARAMS.color);
                })
            }


        }
    }

    update() {

    }

    destroy() {
        const currentTimeSwitch = document.getElementById('currentTime') as HTMLInputElement;
        currentTimeSwitch.removeEventListener('change', this.onCurrentTimeChange);
    }
}