import Sizes from ".//Sizes";
import Time from "./Time";
import * as THREE from 'three'
import Camera from "./Camera";
import { Camera3dSpace, DefaultExperienceConfig, Sources } from './types'
import Renderer from "./Renderer";
import DebugUI from "./DebugUI";
import ResourcesLoader from "./ResourcesLoader";
import PerformanceStats from "./Stats";



export default class DefaultExperience {
    canvas: HTMLCanvasElement;
    sizes: Sizes;
    time: Time;
    scene: THREE.Scene;
    camera: Camera;
    renderer: Renderer;
    resourcesLoader!: ResourcesLoader;
    debugUI: DebugUI;
    performanceStats: PerformanceStats;


    constructor(canvas: HTMLCanvasElement, camera3dSpace: Camera3dSpace, config: DefaultExperienceConfig, sources?: Sources[]) {
        // set up
        this.debugUI = new DebugUI();
        this.canvas = canvas;
        this.sizes = new Sizes(canvas, config);
        this.time = new Time();
        this.scene = new THREE.Scene();
        this.camera = new Camera(this, camera3dSpace);
        this.renderer = new Renderer(this);
        this.performanceStats = new PerformanceStats(config)
        this.resourcesLoader = new ResourcesLoader(sources);



        // window resize
        this.sizes.on('resize', this.resize.bind(this))

    }

    resize(): void {
        this.camera.resize();
        this.renderer.resize();
    }

    destroyDefaultExperience() {
        this.renderer.destroy();
        this.debugUI.destroy();
        this.camera.destroy();
        this.sizes.destroy();
        this.time.destroy();
        this.performanceStats.destroy();
        if (this.resourcesLoader) this.resourcesLoader.destroy();

        this.scene.traverse((child: any) => {
            if (typeof child.dispose === 'function') child.dispose();
            if (child instanceof THREE.Mesh) {
                if (typeof child.geometry.dispose === 'function') child.geometry.dispose();
                for (const key in child.material) {
                    if (Object.hasOwn(child.material, key)) {
                        const item = child.material[key];
                        if (item && typeof item.dispose === 'function') item.dispose();
                    }
                }
            }
        })
    }

}

