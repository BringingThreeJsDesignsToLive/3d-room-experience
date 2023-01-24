import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import AudioSvg from './AudioComponent'
import { PlayCircleOutline, PauseCircleOutline } from '@mui/icons-material';
import RoomExperience from '../WebglExperience/roomExperience';

function MusicPlayIcons({ togglePlay }: { togglePlay: any }) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);



  useEffect(() => {
    const musicPlayWrapper = document.querySelector(".musicPlayWrapper")!;
    const togglePlayState = () => {
      setIsMusicPlaying(!isMusicPlaying);
      togglePlay(!isMusicPlaying)

    }

    musicPlayWrapper.addEventListener('click', togglePlayState);

    return () => musicPlayWrapper.removeEventListener('click', togglePlayState);

  }, [isMusicPlaying, togglePlay])


  return (
    <div title='Pause Music' className='musicPlayWrapper'>
      <AudioSvg
        height="50"
        width="50"
        color="#FFFFFF"
        visible={true}
        animate={isMusicPlaying}
      />
      <div className='musicPlayControlIcons'>
        {
          isMusicPlaying ? <PauseCircleOutline
            style={{ color: 'white' }}
            className='pause'
          />
            : <PlayCircleOutline style={{ color: 'white' }} className='play' />
        }
      </div>
    </div>
  )
}

export default MusicPlayIcons