import RoomExperience from "."
import * as THREE from 'three'
import Sizes from "../utils/Sizes";
import Time from "../utils/Time";
import normalizeWheel from 'normalize-wheel';

interface viewType {
    spherical: {
        value: THREE.Spherical,
        smoothed: THREE.Spherical,
        smoothing: number,
    },
    drag: {
        delta: { x: number, y: number },
        previous: { x: number, y: number },
        sensitivity: number,
        alternative: boolean, // right click event
        minXdrag: number, // minimum horizontal orbit
        maxXdrag: number, // maximum horizontal orbit
        minYdrag: number, // minimum vertical orbit
        maxYdrag: number, // maximum vertical orbit
    },
    zoom: {
        value: number,
        smoothed: number,
        smoothing: number,
        sensitivity: number,
        maxDistance: number, // maximum zoom out value
        minDistance: number, // maximum zoom in value
    },
    target: {
        value: THREE.Vector3,
        smoothed: THREE.Vector3,
        smoothing: number,
        limits: {
            x: { min: number, max: number },
            y: { min: number, max: number },
            z: { min: number, max: number }
        }
    },
    onMouseDown: (e: MouseEvent) => void,
    onMouseUp: (e: MouseEvent) => void,
    onMouseMove: (e: MouseEvent) => void,
    onMouseWheel: (e: WheelEvent) => void,
    onContextMenu: (e: MouseEvent) => void,
    onTouchStart: (e: TouchEvent) => void,
    onTouchEnd: (e: TouchEvent) => void,
    onTouchMove: (e: TouchEvent) => void,
    move: (x: number, y: number) => void, //called by onMouseMove and onTouchMove
    down: (x: number, y: number) => void, //called by onMouseDown and onTouchStart
    up: () => void, //called by onMouseUp and onTouchEnd
    zoomIn: (delta: number) => void

}

export default class Navigation {
    experience: RoomExperience
    camera: THREE.PerspectiveCamera;
    sizes: Sizes
    view!: viewType;
    time: Time
    constructor(experience: RoomExperience) {
        this.experience = experience;
        this.camera = experience.camera.cameraInstance;
        this.sizes = experience.sizes;
        this.time = experience.time
        this.setView();
    }

    setView(): void {
        const sphericalCoords = new THREE.Spherical(2.8, Math.PI * 0.35, Math.PI * -0.27);
        const zoomValue = 0;
        const targetValue = new THREE.Vector3(0, 0.2, 0)
        this.view = {
            spherical: {
                value: sphericalCoords.clone(),
                smoothed: sphericalCoords.clone(),
                smoothing: 0.002,
            },
            drag: {
                delta: { x: 0, y: 0 },
                previous: { x: 0, y: 0 },
                sensitivity: 1,
                alternative: false,
                minXdrag: Math.PI / -2,
                maxXdrag: Math.PI / 23,
                minYdrag: Math.PI / 50,
                maxYdrag: Math.PI / 2.2
            },
            zoom: {
                value: zoomValue,
                smoothed: zoomValue,
                smoothing: 0.002,
                sensitivity: 0.001,
                // maxDistance: 3.6,
                // minDistance: 1
                maxDistance: 3.6,
                minDistance: -5
            },
            target: {
                value: targetValue.clone(),
                smoothed: targetValue.clone(),
                smoothing: 0.002,
                limits: {
                    x: { min: Math.PI / -5, max: Math.PI / 10 },
                    y: { min: Math.PI / 30, max: Math.PI / 3 },
                    z: { min: Math.PI / -5, max: Math.PI / 10 },
                }
            },

            // Mouse Event callbacks
            onContextMenu: (e) => e.preventDefault(),
            onMouseDown: (e) => {
                // right click event
                this.view.drag.alternative = e.button === 2 || e.ctrlKey || e.shiftKey;

                this.view.down(e.clientX, e.clientY);

                window.addEventListener('mouseup', this.view.onMouseUp);
                window.addEventListener('mousemove', this.view.onMouseMove);
            },
            onMouseUp: (e) => {
                this.view.up();
                window.removeEventListener('mouseup', this.view.onMouseUp);
                window.removeEventListener('mousemove', this.view.onMouseMove);
            },
            onMouseMove: (e) => {
                this.view.move(e.clientX, e.clientY);
            },
            onMouseWheel: (e) => {
                const normalized = normalizeWheel(e);
                this.view.zoomIn(normalized.pixelY)
            },
            // Finger Touches Event callbacks
            onTouchStart: (e) => {
                this.view.down(e.touches[0].clientX, e.touches[0].clientY);

                window.addEventListener('touchend', this.view.onTouchEnd);
                window.addEventListener('touchmove', this.view.onTouchMove);
            },
            onTouchEnd: (e) => {
                this.view.up();
                window.removeEventListener('touchend', this.view.onTouchEnd);
                window.removeEventListener('touchmove', this.view.onTouchMove);
            },
            onTouchMove: (e) => {
                this.view.move(e.touches[0].clientX, e.touches[0].clientY);
            },
            // Methods
            move: (x, y) => {
                this.view.drag.delta.x += x - this.view.drag.previous.x;
                this.view.drag.delta.y += y - this.view.drag.previous.y;


                this.view.drag.previous.x = x;
                this.view.drag.previous.y = y;
            },
            down: (x, y) => {
                this.view.drag.previous.x = x;
                this.view.drag.previous.y = y;
            },
            zoomIn: (delta) => {
                this.view.zoom.value = delta * this.view.zoom.sensitivity;
            },
            up: () => { this.view.drag.alternative = false }
        }

        window.addEventListener("mousedown", this.view.onMouseDown);
        window.addEventListener('wheel', this.view.onMouseWheel);
        window.addEventListener('contextmenu', this.view.onContextMenu);
        window.addEventListener('touchstart', this.view.onTouchStart);


    }

    update() {
        /**
         * View
         */

        if (this.view.drag.alternative) {
            const target = new THREE.Vector3();
            const up = new THREE.Vector3(0, 1, 0);
            const right = new THREE.Vector3(-1, 0, 0);

            // get where camera is looking at
            up.applyQuaternion(this.camera.quaternion);
            right.applyQuaternion(this.camera.quaternion);

            // reduce value base on the current drag 
            up.multiplyScalar(this.view.drag.delta.y * 0.001);
            right.multiplyScalar(this.view.drag.delta.x * 0.001);

            // offset target value with where camera is looking at
            this.view.target.value.add(up);
            this.view.target.value.add(right);
        } else {
            // wheel Zoom In
            this.view.spherical.value.radius += this.view.zoom.value;

            // Drag
            this.view.spherical.value.theta -= this.view.drag.delta.x * (this.view.drag.sensitivity / this.sizes.smallestSide);
            this.view.spherical.value.phi -= this.view.drag.delta.y * (this.view.drag.sensitivity / this.sizes.smallestSide);
        }



        // reset drag and zoom values
        this.view.drag.delta.x = 0;
        this.view.drag.delta.y = 0;
        this.view.zoom.value = 0;

        // Clamp values
        this.view.spherical.value.theta = Math.min(Math.max(this.view.drag.minXdrag, this.view.spherical.value.theta), this.view.drag.maxXdrag);
        this.view.spherical.value.phi = Math.min(Math.max(this.view.drag.minYdrag, this.view.spherical.value.phi), this.view.drag.maxYdrag);
        this.view.spherical.value.radius = Math.min(Math.max(this.view.zoom.minDistance, this.view.spherical.value.radius), this.view.zoom.maxDistance);

        this.view.target.value.x = Math.min(Math.max(this.view.target.limits.x.min, this.view.target.value.x), this.view.target.limits.x.max)
        this.view.target.value.y = Math.min(Math.max(this.view.target.limits.y.min, this.view.target.value.y), this.view.target.limits.y.max)
        this.view.target.value.z = Math.min(Math.max(this.view.target.limits.z.min, this.view.target.value.z), this.view.target.limits.z.max)


        // Smoothing 
        this.view.spherical.smoothed.phi += (this.view.spherical.value.phi - this.view.spherical.smoothed.phi) * this.view.spherical.smoothing * this.time.deltaTime
        this.view.spherical.smoothed.theta += (this.view.spherical.value.theta - this.view.spherical.smoothed.theta) * this.view.spherical.smoothing * this.time.deltaTime
        this.view.spherical.smoothed.radius += (this.view.spherical.value.radius - this.view.spherical.smoothed.radius) * this.view.zoom.smoothing * this.time.deltaTime

        this.view.target.smoothed.x += (this.view.target.value.x - this.view.target.smoothed.x) * this.view.target.smoothing * this.time.deltaTime
        this.view.target.smoothed.y += (this.view.target.value.y - this.view.target.smoothed.y) * this.view.target.smoothing * this.time.deltaTime
        this.view.target.smoothed.z += (this.view.target.value.z - this.view.target.smoothed.z) * this.view.target.smoothing * this.time.deltaTime





        // create viewposition (camera position)
        const viewPosition = new THREE.Vector3();
        viewPosition.setFromSpherical(this.view.spherical.smoothed);

        // offset viewposition with current target value
        viewPosition.add(this.view.target.smoothed);

        this.camera.position.copy(viewPosition);
        this.camera.lookAt(this.view.target.smoothed);
    }

    destroy() {
        window.removeEventListener('mousedown', this.view.onMouseDown);
        window.removeEventListener('wheel', this.view.onMouseWheel);
        window.removeEventListener('contextmenu', this.view.onContextMenu);
        window.removeEventListener('touchstart', this.view.onTouchStart)
    }
}