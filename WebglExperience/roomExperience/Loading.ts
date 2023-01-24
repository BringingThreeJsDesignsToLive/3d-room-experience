import * as THREE from 'three'
import gsap from 'gsap'
import RoomExperience from ".";

export default class Loading {
    loadingManager: THREE.LoadingManager
    countDownEl: HTMLElement;
    constructor(experience: RoomExperience) {
        this.loadingManager = new THREE.LoadingManager();
        this.countDownEl = document.querySelector("#loadingCountDown")!;

        this.loadingManager.onStart = this.onStart.bind(this);
        this.loadingManager.onProgress = this.onProgress.bind(this);
        this.loadingManager.onLoad = this.onLoad.bind(this);
        this.loadingManager.onError = this.onError.bind(this);
    }


    private onStart() {
        const loadingFadeIn = document.querySelector("#loadingFadeIn") as HTMLElement;
        loadingFadeIn.style.display = 'flex';
        Array.from(loadingFadeIn.children).forEach((child) => {
            ((child as any) as HTMLElement).style.transform = `translateY(${loadingFadeIn.clientHeight}px)`;
            ((child as any) as HTMLElement).style.opacity = `0`;
        })

    }

    private onProgress(url: string, itemsLoaded: number, itemsTotal: number) {
        this.countDownEl.innerText = `${Math.floor((itemsLoaded / itemsTotal) * 100)}%`
        // console.log({ total: itemsTotal, loaded: itemsLoaded, url })
        // console.log((itemsLoaded / itemsTotal) * 100);
    }

    private onLoad() {
        const loadingComponent = document.querySelector(".loadingState") as HTMLElement;
        const loadingWrapper = document.querySelector(".loading-wrapper") as HTMLElement;
        const loadingFadeIn = document.querySelector("#loadingFadeIn") as HTMLElement;
        const countDownWrapper = document.querySelector("#loadingCountDownWrapper") as HTMLElement;
        const tl = gsap.timeline({});

        tl.to(
            loadingFadeIn.children,
            {
                translateY: `0px`,
                opacity: 1,
                duration: 1,
                ease: "power3.in",
                stagger: {
                    each: 0.1,
                    from: "start",
                }
            })
            .to(
                countDownWrapper,
                {
                    opacity: 0,
                    duration: 0
                }
            )
            .to(
                loadingFadeIn.children,
                {
                    translateY: `-${loadingFadeIn.clientHeight}px`,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.Out",
                    onComplete: () => { loadingComponent.style.display = 'none'; },
                    stagger: {
                        each: 0.2,
                        from: "end",
                    }
                },
            )
            .to(
                loadingWrapper,
                {
                    opacity: 0,
                },
                "<"
            )
    }

    private onError(url: string) {

    }
}