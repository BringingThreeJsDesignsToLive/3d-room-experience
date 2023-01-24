import * as THREE from 'three'
import RoomExperience from '.';
import DebugUI from '../utils/DebugUI';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Navigation from './Navigation';
import GoogleLedLights from './GoogleLedLights';
import { GroupNamesType, RoomSourceNames } from './sources';
import Time from '../utils/Time';
import { EmissionLights, lightNames } from './EmissionLights';
import CoffeSteam from './CoffeSteam';
import ChairTop from './ChairTop';
import ScreenAnimation, { ScreenMeshType } from './ScreenAnimation';
import TimeZone from './TimeZone';
import BakedTextures from './BakedTexture';
// import IdentifyModel from './IdentifyModel';
import Loading from './Loading';



export default class World {
    experience: RoomExperience;
    loadedResource: Record<RoomSourceNames, any>;
    debugUI: DebugUI;
    time: Time
    orbitControls!: OrbitControls;
    navigation: Navigation;
    googleLedLights: GoogleLedLights
    emissionLights: EmissionLights;
    coffeeSteam: CoffeSteam;
    chairTop: ChairTop;
    // identifyModel: IdentifyModel;
    loading: Loading;
    screenAnimation: ScreenAnimation;
    timeZone: TimeZone;
    bakedTextures: BakedTextures

    constructor(experience: RoomExperience) {
        // Initialize
        this.experience = experience
        this.loadedResource = experience.resourcesLoader?.items as Record<RoomSourceNames, any>
        this.debugUI = experience.debugUI;
        this.time = experience.time;

        this.loading = new Loading(experience);
        this.bakedTextures = new BakedTextures(experience);
        this.timeZone = new TimeZone(experience, this.bakedTextures, this.loading);
        this.navigation = new Navigation(experience);
        this.googleLedLights = new GoogleLedLights(experience);
        this.emissionLights = new EmissionLights(experience);
        this.coffeeSteam = new CoffeSteam(experience);
        this.chairTop = new ChairTop(experience);
        this.screenAnimation = new ScreenAnimation(experience);
        // this.identifyModel = new IdentifyModel(experience);



        if (this.timeZone.isDayTime) {
            this.setUp3dRoom('3dRoomDay' as GroupNamesType);
        } else {
            this.setUp3dRoom('3dRoomNight' as GroupNamesType);
        }


    }


    setUp3dRoom(groupName: GroupNamesType) {
        this.experience.resourcesLoader.on(`${groupName}Ready`, () => {
            this.bakedTextures.setUp();



            // loop through scene children and add material to the appropriate model
            this.loadedResource['3dRoomModel'].scene.traverse((child: any) => {
                if (child.parent?.name === "baked1") child.material = this.bakedTextures.baked1Material;
                if (child.parent?.name === "baked2") child.material = this.bakedTextures.baked2Material;

                // extract emission lights
                if (new RegExp('light', 'i').test(child.name)) {
                    this.emissionLights.lights[child.name as lightNames] = child
                }

                // extract coffeSteam object
                if (child.name === "coffeSteam") {
                    this.coffeeSteam.steamMesh = child;
                }

                // extract screen objects
                if (new RegExp('screen', 'i').test(child.name)) {
                    this.screenAnimation.screensMesh[child.name as keyof ScreenMeshType].mesh = child;
                }

                //get chair object
                if (child.name === "chairTop") {
                    this.chairTop.objectMesh = child;
                }

                // extract googlelight object
                if (child.name.includes("googleHomeLed")) {
                    // get the last char of the name which should be a number
                    child.name.trim();
                    const ledIndex = Number(child.name.charAt(child.name.length - 1))
                    this.googleLedLights.leds[ledIndex].mesh = child;
                }
            })
            this.googleLedLights.isMeshComplete = true;
            this.googleLedLights.setUpLights();

            this.emissionLights.isMeshComplete = true;
            this.emissionLights.setupLights();

            this.screenAnimation.isMeshComplete = true;
            this.screenAnimation.setUpScreens();

            this.coffeeSteam.setUpSteam();

            this.experience.scene.add(this.loadedResource['3dRoomModel'].scene);
        })
    }


    update = () => {
        // update on each tick
        if (this.orbitControls) this.orbitControls.update()
        this.navigation.update();
        this.googleLedLights.update();
        this.emissionLights.update();
        this.coffeeSteam.update();
        this.chairTop.update();
        this.screenAnimation.update();
        this.timeZone.update();
        this.bakedTextures.update();
        // this.identifyModel.update();


    }

    destroy = () => {
        this.navigation.destroy();
    }
}