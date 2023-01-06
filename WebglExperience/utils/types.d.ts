import Sizes from "./Sizes";
import Time from "./Time";
import Camera from "./Camera";

export interface DefaultExperienceOptions {
    useWindowSizeOnResize: boolean
}


export interface Camera3dSpace {
    position: THREE.Vector3;
    scale: THREE.Vector3;
    rotation: THREE.Vector3;
    fov: number;
}

export interface Sources {
    name: string;
    type: 'gltfModel' | 'texture' | 'cubeTexture';
    useDraco: boolean;
    path: string | string[];
    groupName?: string,
    totalGroupMember?: number
}

export interface MouseCursorPosition {
    x: number;
    y: number;
}