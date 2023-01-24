import React from 'react'
import { Watch } from 'react-loader-spinner'

function LoadingOverlay() {
    return (
        <div className='loadingState'>
            <div className='loading-wrapper'>
                <div id='loadingCountDownWrapper'>
                    <h1 id='loadingCountDown'>0%</h1>
                    <small>
                        <Watch
                            height="25"
                            width="25"
                            radius="48"
                            color="#FFFFFF"
                            ariaLabel="watch-loading"
                            visible={true}
                        />
                    </small>
                </div>

            </div>
            <div id='loadingFadeIn'>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>

    )
}

export default LoadingOverlay