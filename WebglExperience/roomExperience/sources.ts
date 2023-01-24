/**
 * THIS FILE CONTAINS ALL THE ASSESTS e.g textures, THAT WILL BE USED IN THE LOGIN PAGE EXPERIENCE
 */
import * as THREE from 'three'
import { Sources } from '../utils/types';

const groupNames = ['3dRoomNight', '3dRoomDay'] as const;

const sourcesDefault = [

    {
        name: '3dRoomModel',
        type: 'gltfModel',
        path: '/assets/webGL/bruno-3d-room.glb',
        useDraco: true,
        sourceType: {}
    },
    {
        name: 'bakedLightMap1',
        type: 'texture',
        path: '/assets/webGL/bakedLightMap1.jpg',
        useDraco: false,
        sourceType: THREE.Texture
    },
    {
        name: 'bakedLightMap2',
        type: 'texture',
        path: '/assets/webGL/bakedLightMap2.jpg',
        useDraco: false,
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

const sourcesDay = [
    {
        name: 'baked1Day',
        type: 'texture',
        path: '/assets/webGL/baked1Day.jpg',
        useDraco: false,
        groupName: '3dRoomDay',
        sourceType: THREE.Texture
    },
    {
        name: 'baked2Day',
        type: 'texture',
        path: '/assets/webGL/baked2Day.jpg',
        useDraco: false,
        groupName: '3dRoomDay',
        sourceType: THREE.Texture
    },
] as const

const sourcesNight = [
    {
        name: 'baked1Night',
        type: 'texture',
        path: '/assets/webGL/baked1Night.jpg',
        useDraco: false,
        groupName: '3dRoomNight',
        sourceType: THREE.Texture
    },
    {
        name: 'baked2Night',
        type: 'texture',
        path: '/assets/webGL/baked2Night.jpg',
        useDraco: false,
        groupName: '3dRoomNight',
        sourceType: THREE.Texture
    },
] as const

const sourcesDefaultClone = ([...sourcesDefault] as any) as Sources[];
const sourceDayClone = ([...sourcesDay] as any) as Sources[];
const sourceNightClone = ([...sourcesNight] as any) as Sources[];
const groupNamesClone = ([...groupNames] as any) as string[];

// // get the total number of sources in the same group
// groupNames.forEach((name) => {
//     const defaultMembers = sourcesDefaultClone.filter(source => source.groupName === name);
//     const dayMembers = sourceDayClone.filter(source => source.groupName === name);
//     const nightMembers = sourceNightClone.filter(source => source.groupName === name);

//     const totalGroopMembers = defaultMembers.length + dayMembers.length + nightMembers.length;
//     sourcesDefaultClone.forEach(source => {
//         source.totalGroupMember = defaultMembers.length
//     })
// })

type SourcesDefaultNames = typeof sourcesDefault[number]["name"]
type SourcesDayNames = typeof sourcesDay[number]["name"]
type SourcesNightNames = typeof sourcesNight[number]["name"]
export type GroupNamesType = typeof groupNames[number]


export type RoomSourceNames = SourcesDefaultNames | SourcesDayNames | SourcesNightNames


export {
    sourcesDefaultClone,
    sourceDayClone,
    sourceNightClone,
    groupNamesClone
}