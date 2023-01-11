import DebugUI from "../utils/DebugUI";
import Time from "../utils/Time";
import RoomExperience from ".";
import * as THREE from 'three'

export interface ScreenMeshType {
    macScreen: {
        mesh: any;
        element: HTMLVideoElement,
        texture?: THREE.VideoTexture
    },
    tvScreen: {
        mesh: any;
        element: HTMLVideoElement
        texture?: THREE.VideoTexture
    },
    monitorScreen: {
        mesh: any;
        element: HTMLVideoElement
        texture?: THREE.VideoTexture
    }
}

export default class ScreenAnimation {
    time: Time;
    debugUI: DebugUI;
    screensMesh: ScreenMeshType;
    isMeshComplete: boolean;
    constructor(experience: RoomExperience) {
        this.time = experience.time;
        this.debugUI = experience.debugUI;
        this.isMeshComplete = false;

        this.screensMesh = {
            macScreen: {
                mesh: null,
                element: document.createElement('video')
            },
            monitorScreen: {
                mesh: null,
                element: document.createElement('video')
            },
            tvScreen: {
                mesh: null,
                element: document.createElement('video')
            },
        }
    }

    setUpScreens() {
        this.setUpMonitorScreen();
        this.setUpTvScreen();
        this.setUpMacScreen();
    }

    private setUpTvScreen() {
        this.screensMesh.tvScreen.element.muted = true;
        this.screensMesh.tvScreen.element.autoplay = true;
        this.screensMesh.tvScreen.element.loop = true;
        this.screensMesh.tvScreen.element.controls = true
        this.screensMesh.tvScreen.element.playsInline = true;
        this.screensMesh.tvScreen.element.src = '/assets/webGL/tv-video.mp4'

        this.screensMesh.tvScreen.element.style.position = 'fixed';
        this.screensMesh.tvScreen.element.style.top = '0';
        this.screensMesh.tvScreen.element.style.left = '0';
        this.screensMesh.tvScreen.element.style.zIndex = '1';
        this.screensMesh.tvScreen.element.style.width = '100px';
        this.screensMesh.tvScreen.element.style.opacity = '0';
        this.screensMesh.tvScreen.element.style.pointerEvents = 'none';

        document.body.append(this.screensMesh.tvScreen.element);


        //Texture
        this.screensMesh.tvScreen.texture = new THREE.VideoTexture(this.screensMesh.tvScreen.element);
        this.screensMesh.tvScreen.texture.encoding = THREE.sRGBEncoding;
        // this.screensMesh.tvScreen.texture.flipY = true

        //Material
        this.screensMesh.tvScreen.mesh.material = new THREE.MeshBasicMaterial({
            map: this.screensMesh.tvScreen.texture
        })
    }

    private setUpMacScreen() {
        this.screensMesh.macScreen.element.muted = true;
        this.screensMesh.macScreen.element.autoplay = true;
        this.screensMesh.macScreen.element.loop = true;
        this.screensMesh.macScreen.element.playsInline = true;
        this.screensMesh.macScreen.element.src = '/assets/webGL/mac-video.mp4'

        this.screensMesh.macScreen.element.style.position = 'fixed';
        this.screensMesh.macScreen.element.style.top = '0';
        this.screensMesh.macScreen.element.style.left = '0';
        this.screensMesh.macScreen.element.style.zIndex = '1';
        this.screensMesh.macScreen.element.style.width = '100px';
        this.screensMesh.macScreen.element.style.opacity = '0';
        this.screensMesh.macScreen.element.style.pointerEvents = 'none';

        document.body.append(this.screensMesh.macScreen.element);


        //Texture
        this.screensMesh.macScreen.texture = new THREE.VideoTexture(this.screensMesh.macScreen.element);
        this.screensMesh.macScreen.texture.encoding = THREE.sRGBEncoding;
        // this.screensMesh.macScreen.texture.flipY = true

        //Material
        this.screensMesh.macScreen.mesh.material = new THREE.MeshBasicMaterial({
            map: this.screensMesh.macScreen.texture
        })

    }


    private setUpMonitorScreen() {
        this.screensMesh.monitorScreen.element.muted = true;
        this.screensMesh.monitorScreen.element.autoplay = true;
        this.screensMesh.monitorScreen.element.loop = true;
        this.screensMesh.monitorScreen.element.playsInline = true;
        this.screensMesh.monitorScreen.element.src = '/assets/webGL/monitor-video.mp4'

        this.screensMesh.monitorScreen.element.style.position = 'fixed';
        this.screensMesh.monitorScreen.element.style.top = '0';
        this.screensMesh.monitorScreen.element.style.left = '0';
        this.screensMesh.monitorScreen.element.style.zIndex = '1';
        this.screensMesh.monitorScreen.element.style.width = '100px';
        this.screensMesh.monitorScreen.element.style.opacity = '0';
        this.screensMesh.monitorScreen.element.style.pointerEvents = 'none';

        document.body.append(this.screensMesh.monitorScreen.element);



        //Texture
        this.screensMesh.monitorScreen.texture = new THREE.VideoTexture(this.screensMesh.monitorScreen.element);
        this.screensMesh.monitorScreen.texture.encoding = THREE.sRGBEncoding;
        // this.screensMesh.monitorScreen.texture.flipY = true

        //Material
        this.screensMesh.monitorScreen.mesh.material = new THREE.MeshBasicMaterial({
            map: this.screensMesh.monitorScreen.texture
        })

    }

    addDebugUI() {
        if (this.debugUI.isActive) {
            const googleLedColors = this.debugUI.ui.addFolder({
                title: "Tv Screen",
                expanded: true
            })
            const PARAMS = {}

        }
    }

    update() {

    }
}