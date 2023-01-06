/**
 * THIS FILE CONTAINS ALL THE ASSESTS e.g textures, THAT WILL BE USED IN THE LOGIN PAGE EXPERIENCE
 */

import { Sources } from '../utils/types'

const sources: Sources[] = [

    {
        name: '3dRoomModel',
        type: 'gltfModel',
        path: '/assets/webGL/bruno-3d-room.glb',
        useDraco: true,
        groupName: '3dRoom',
        totalGroupMember: 3,
    },
    {
        name: 'baked1',
        type: 'texture',
        path: '/assets/webGL/baked1.jpg',
        useDraco: false,
        groupName: '3dRoom',
        totalGroupMember: 3,
    },
    {
        name: 'baked2',
        type: 'texture',
        path: '/assets/webGL/baked2.jpg',
        useDraco: false,
        groupName: '3dRoom',
        totalGroupMember: 3,
    },
]


export default sources