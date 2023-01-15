/**
 * THIS FILE CONTAINS ALL THE ASSESTS e.g textures, THAT WILL BE USED IN THE LOGIN PAGE EXPERIENCE
 */
import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Sources } from '../utils/types';

const groupNames = ['3dRoom'];
const sources = [

    {
        name: '3dRoomModel',
        type: 'gltfModel',
        path: '/assets/webGL/bruno-3d-room.glb',
        useDraco: true,
        groupName: '3dRoom',
        sourceType: {}
    },
    {
        name: 'baked1',
        type: 'texture',
        path: '/assets/webGL/baked1.jpg',
        useDraco: false,
        groupName: '3dRoom',
        sourceType: THREE.Texture
    },
    {
        name: 'baked2',
        type: 'texture',
        path: '/assets/webGL/baked2.jpg',
        useDraco: false,
        groupName: '3dRoom',
        sourceType: THREE.Texture
    },
    {
        name: 'bakedLightMap1',
        type: 'texture',
        path: '/assets/webGL/bakedLightMap1.jpg',
        useDraco: false,
        groupName: '3dRoom',
        sourceType: THREE.Texture
    },
    {
        name: 'bakedLightMap2',
        type: 'texture',
        path: '/assets/webGL/bakedLightMap2.jpg',
        useDraco: false,
        groupName: '3dRoom',
        sourceType: THREE.Texture
    },
    {
        name: 'googleLedLightTexture',
        type: 'texture',
        path: '/assets/webGL/googleHomeLightMaskTexture.png',
        useDraco: false,
        sourceType: THREE.Texture
    }
] as const

const sourceClone = ([...sources] as any) as Sources[]

// get the totle number of sources in the same group
groupNames.forEach((name) => {
    const members = sourceClone.filter(source => source.groupName === name);
    sourceClone.forEach(source => {
        source.totalGroupMember = members.length
    })
})


export type RoomSourceNames = typeof sources[number]["name"]


export default sourceClone