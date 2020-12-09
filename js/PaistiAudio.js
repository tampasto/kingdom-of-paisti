'use strict';

class PaistiAudio { // 🔊
    constructor() {
        this._currentTrack = null;
        this._loadingTrack = null;
    }

    loadTrackAsync(trackURL) {
        return new Promise((resolve, reject) => {
            let track = new Audio();
            track.loop = true;
            track.autoplay = false;
            track.addEventListener("canplaythrough", () => {
                paistiLog(`Loaded track "${trackURL}".`);
                resolve();
            });
            track.addEventListener("error", reject);
            track.src = trackURL;
            this._loadingTrack = track;
        });
    }

    playLoadedTrack() {
        if (this._currentTrack) {
            this._currentTrack.pause();
        }
        this._currentTrack = this._loadingTrack;
        this._currentTrack.play();
    }
}