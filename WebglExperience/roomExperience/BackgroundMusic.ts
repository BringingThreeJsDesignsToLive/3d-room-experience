export default class BackgroundMusic {
    audioEl!: HTMLAudioElement;
    constructor() {

    }

    setUp() {
        const musicPlayWrapper = document.querySelector('.musicPlayWrapper') as HTMLElement;
        this.audioEl = document.createElement('audio');
        musicPlayWrapper.append(this.audioEl);
        this.audioEl.loop = true;
        this.audioEl.muted = true;
        this.audioEl.autoplay = false;
        this.audioEl.src = '/assets/webGL/backgroundMusic.mp3'


        this.audioEl.addEventListener('canplaythrough', () => {
            document.addEventListener('click', userInteracted)
            document.addEventListener('touchend', userInteracted)
        })

        const userInteracted = () => {
            this.audioEl.play();
            this.audioEl.muted = false;
            musicPlayWrapper.style.display = 'initial';
            document.removeEventListener('click', userInteracted);
            document.removeEventListener('touchend', userInteracted);
        }




    }

    onToggleState(shouldPlay: boolean) {
        if (shouldPlay) {
            this.audioEl.play()
        } else {
            this.audioEl.pause()
        }
    }
}