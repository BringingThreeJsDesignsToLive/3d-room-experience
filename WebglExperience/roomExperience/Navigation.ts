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
        minXdrag: number,
        maxXdrag: number,
        minYdrag: number,
        maxYdrag: number,
    },
    zoom: {
        value: number,
        smoothed: number,
        smoothing: number,
        sensitivity: number,
        maxDistance: number,
        minDistance: number,
    },
    target: {
        value: THREE.Vector3,
        smoothed: THREE.Vector3,
        smoothing: number,
    },
    onMouseDown: (e: MouseEvent) => void,
    onMouseUp: (e: MouseEvent) => void,
    onMouseMove: (e: MouseEvent) => void,
    onMouseWheel: (e: WheelEvent) => void,
    onContextMenu: (e: MouseEvent) => void,
    onTouchStart: (e: TouchEvent) => void,
    onTouchEnd: (e: TouchEvent) => void,
    onTouchMove: (e: TouchEvent) => void,
    move: (x: number, y: number) => void,
    down: (x: number, y: number) => void,
    up: () => void,
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
                smoothing: 0.005,
            },
            drag: {
                delta: { x: 0, y: 0 },
                previous: { x: 0, y: 0 },
                sensitivity: 1,
                alternative: false,
                minXdrag: (-1 * Math.PI) / 2,
                maxXdrag: Math.PI / 12,
                minYdrag: Math.PI / 50,
                maxYdrag: Math.PI / 2.2
            },
            zoom: {
                value: zoomValue,
                smoothed: zoomValue,
                smoothing: 0.005,
                sensitivity: 0.001,
                maxDistance: 3.6,
                minDistance: 1
            },
            target: {
                value: targetValue.clone(),
                smoothed: targetValue.clone(),
                smoothing: 0.001
            },

            // Mouse Event callbacks
            onContextMenu: (e) => e.preventDefault(),
            onMouseDown: (e) => {
                this.view.drag.alternative = e.button === 2;
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
            up: () => { }
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
            const right = new THREE.Vector3(1, 0, 0);

            up.applyQuaternion(this.camera.quaternion);
            right.applyQuaternion(this.camera.quaternion);

            up.multiplyScalar(this.view.drag.delta.y * 0.001);
            right.multiplyScalar(this.view.drag.delta.x * -0.001);

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

        // Smoothing
        this.view.spherical.smoothed.phi += (this.view.spherical.value.phi - this.view.spherical.smoothed.phi) * this.view.spherical.smoothing * this.time.deltaTime
        this.view.spherical.smoothed.theta += (this.view.spherical.value.theta - this.view.spherical.smoothed.theta) * this.view.spherical.smoothing * this.time.deltaTime
        this.view.spherical.smoothed.radius += (this.view.spherical.value.radius - this.view.spherical.smoothed.radius) * this.view.zoom.smoothing * this.time.deltaTime

        // Clamp values
        if (Math.sign(this.view.spherical.smoothed.theta) === -1) {
            this.view.spherical.smoothed.theta = Math.max(this.view.drag.minXdrag, this.view.spherical.smoothed.theta);
            this.view.spherical.value.theta = Math.max(this.view.drag.minXdrag, this.view.spherical.value.theta);
        } else {
            this.view.spherical.smoothed.theta = Math.min(this.view.drag.maxXdrag, this.view.spherical.smoothed.theta);
            this.view.spherical.value.theta = Math.min(this.view.drag.maxXdrag, this.view.spherical.value.theta);
        }
        if (this.view.spherical.smoothed.phi <= this.view.drag.minYdrag) {
            this.view.spherical.smoothed.phi = Math.max(this.view.drag.minYdrag, this.view.spherical.smoothed.phi);
            this.view.spherical.value.phi = Math.max(this.view.drag.minYdrag, this.view.spherical.value.phi);
        } else {
            this.view.spherical.smoothed.phi = Math.min(this.view.drag.maxYdrag, this.view.spherical.smoothed.phi);
            this.view.spherical.value.phi = Math.min(this.view.drag.maxYdrag, this.view.spherical.value.phi);
        }
        if (this.view.spherical.smoothed.radius <= this.view.zoom.maxDistance) {
            this.view.spherical.smoothed.radius = Math.max(this.view.zoom.minDistance, this.view.spherical.smoothed.radius);
            this.view.spherical.value.radius = Math.max(this.view.zoom.minDistance, this.view.spherical.value.radius);
        } else {
            this.view.spherical.smoothed.radius = Math.min(this.view.zoom.maxDistance, this.view.spherical.smoothed.radius);
            this.view.spherical.value.radius = Math.min(this.view.zoom.maxDistance, this.view.spherical.value.radius);
        }


        const viewPosition = new THREE.Vector3();
        viewPosition.setFromSpherical(this.view.spherical.smoothed);
        viewPosition.add(this.view.target.value);

        this.camera.position.copy(viewPosition);
        this.camera.lookAt(this.view.target.value);
    }

    destroy() {
        window.removeEventListener('mousedown', this.view.onMouseDown);
        window.removeEventListener('wheel', this.view.onMouseWheel);
        window.removeEventListener('contextmenu', this.view.onContextMenu);
        window.removeEventListener('touchstart', this.view.onTouchStart)
    }
}