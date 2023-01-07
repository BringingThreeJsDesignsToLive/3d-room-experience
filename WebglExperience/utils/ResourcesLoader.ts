import { Sources } from "./types";
import * as THREE from 'three'
import { EventEmitter } from "./EventEmitter";
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

interface fileObj {
    name: string,
    type: 'texture' | 'cubeTexture' | 'gltfModel',
    [index: string]: any;
}

interface itemsTypes {
    [index: string]: THREE.Texture | THREE.CubeTexture | GLTF
}


export default class ResourcesLoader extends EventEmitter {
    sources: Sources[];
    items: itemsTypes;
    groupedItems: any;
    toLoad: number;
    loaded: number = 0;
    gltfLoader!: GLTFLoader;
    cubeTextureLoader!: THREE.CubeTextureLoader;
    textureLoader!: THREE.TextureLoader

    constructor(sources: Sources[]) {
        // Initialize
        super()
        this.sources = sources
        this.toLoad = sources.length
        this.items = {}
        this.groupedItems = {}

        // map and extract source groupName if its grouped 
        sources.forEach(source => {
            if (source.groupName) {
                this.groupedItems[source.groupName] = []
            }

        })
        this.loadSources();

    }

    loadSources() {
        // loop through and load each sources passed base on their source type
        this.sources.forEach((source) => {
            if (source.type === 'texture') {
                if (!this.textureLoader) this.textureLoader = new THREE.TextureLoader()
                this.textureLoader.load(<string>source.path, (texture) => {
                    texture.name = 'texture'
                    this.sourceLoaded(source, texture)
                })
            } else if (source.type === 'cubeTexture') {
                if (this.cubeTextureLoader) this.cubeTextureLoader = new THREE.CubeTextureLoader()
                this.cubeTextureLoader.load(<string[]>source.path, (cubeTexture) => {
                    cubeTexture.name = 'cubeTexture'
                    this.sourceLoaded(source, cubeTexture)
                })
            } else if (source.type === 'gltfModel') {
                if (!this.gltfLoader) this.gltfLoader = new GLTFLoader();
                if (source.useDraco) {
                    // Load and use Draco Loader
                    const dracoLoader = new DRACOLoader();
                    dracoLoader.setDecoderPath('libs/webGL/draco/');
                    this.gltfLoader.setDRACOLoader(dracoLoader);
                }
                this.gltfLoader.load(<string>source.path, (gltf) => {
                    this.sourceLoaded(source, gltf)
                })

            }
        })
    }
    sourceLoaded(source: Sources, file: any) {
        this.items[source.name] = file;
        this.loaded++

        // trigger listeners that are listing for individual resources that are ready
        this.trigger(`${source.name}Ready`);

        if (source.groupName) {
            this.groupedItems[source.groupName].push({ [source.name]: file, name: source.name, type: source.type })
            if (this.groupedItems[source.groupName].length === source.totalGroupMember) {
                // trigger listeners that are listing for group resources that are ready
                this.trigger(`${source.groupName}Ready`);
            }

        }

        if (this.loaded === this.toLoad) {
            // trigger when all resources are ready
            this.trigger('resouceReady')
        }
    }

    destroy() {// dispose all created textures and gltfModel

        // Loop through all grouped files and dispose items individually
        for (const key in this.groupedItems) {
            if (Object.prototype.hasOwnProperty.call(this.groupedItems, key)) {
                const textureArray = this.groupedItems[key];
                textureArray.forEach((fileObj: fileObj) => {
                    if (fileObj.type === 'texture' || fileObj.type === 'cubeTexture') {
                        const file = fileObj[fileObj.name];
                        if (typeof file.dispose === 'function') file.dispose();
                    } else if (fileObj.type === 'gltfModel') {
                        const file = fileObj[fileObj.name];
                        file.scene.traverse((child: any) => {
                            if (child instanceof THREE.Mesh) {
                                if (typeof child.geometry.dispose === 'function') child.geometry.dispose();
                                for (const key in child.material) {
                                    if (Object.prototype.hasOwnProperty.call(child.material, key)) {
                                        const item = child.material[key];
                                        if (item && typeof item.dispose === 'function') item.dispose();

                                    }
                                }
                            }
                        })
                    }


                })
                this.off(`${key}Ready`);
            }
        }

        // loop through all individual items and dipose them
        for (const key in this.items) {
            if (Object.prototype.hasOwnProperty.call(this.items, key)) {
                const file = this.items[key];

                if (file instanceof THREE.Texture || file instanceof THREE.CubeTexture) {
                    if (typeof file.dispose === 'function') file.dispose();
                } else { // treat it as a gltf model
                    file.scene.traverse((child: any) => {
                        if (child instanceof THREE.Mesh) {
                            if (typeof child.geometry.dispose === 'function') child.geometry.dispose();
                            for (const key in child.material) {
                                if (Object.prototype.hasOwnProperty.call(child.material, key)) {
                                    const item = child.material[key];
                                    if (item && typeof item.dispose === 'function') item.dispose();
                                }
                            }
                        }
                    })
                }
                this.off(`${key}Ready`);
            }
        }

    }
}