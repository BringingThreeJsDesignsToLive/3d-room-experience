import DebugUI from "../utils/DebugUI";
import Time from "../utils/Time";
import RoomExperience from ".";

export default class ChairTop {
    time: Time;
    debugUI: DebugUI;
    objectMesh: any;
    constructor(experience: RoomExperience) {
        this.time = experience.time;
        this.debugUI = experience.debugUI;
    }

    update() {
        if (this.objectMesh) {
            this.objectMesh.rotation.y = Math.sin(this.time.elaspedTime * 0.0005) * 0.5;
        }

    }
}