'use strict';

class PaistiAudio { // 🔊
    constructor() {
        this._currentTrack = null;
        this._loadingTrack = null;
        this._currentSounds = null;
        this._loadingSounds = null;
        this._playSoundIndex = null;
    }

    loadTrackAsync(trackURL) {
        return new Promise((resolve, reject) => {
            let track = new Audio();
            track.loop = true;
            track.autoplay = false;
            track.addEventListener("canplaythrough", () => {
                paistiLog(`Loaded track from "${trackURL}".`);
                resolve();
            });
            track.addEventListener("error", () => reject(`Could not load track from "${trackURL}".`));
            track.src = trackURL;
            this._loadingTrack = track;
        });
    }

    playLoadedTrack() {
        let trackVolume;

        trackVolume = rooms[introRoom].trackVolume ? rooms[introRoom].trackVolume : 1;
        if (this._currentTrack) {
            this._currentTrack.pause();
        }
        this._currentTrack = this._loadingTrack;
        this._currentTrack.volume = trackVolume;
        this._currentTrack.play();
        this._loadingTrack = null;
    }

    stopTrack() {
        this._currentTrack.pause();
    }

    loadSoundsAsync(roomName) {
        let soundPromises
        
        this._loadingSounds = {};
        soundPromises = [];
        if (rooms[roomName].sounds) {
            Object.keys(rooms[roomName].sounds).forEach(soundID => {
                let elI, len;

                this._loadingSounds[soundID] = [];
                len = rooms[roomName].sounds[soundID][0];
                paistiLog(`Loading sound ID "${soundID}" from "${rooms[roomName].sounds[soundID][1]}".`);
                for (elI = 0; elI < len; elI++) {
                    soundPromises.push(new Promise((resolve, reject) => {
                        let sound, cptEvent;

                        sound = new Audio();
                        sound.loop = false;
                        sound.autoplay = false;
                        cptEvent = ev => {
                            paistiLog(`Loaded sound ID "${soundID}".`);
                            ev.currentTarget.removeEventListener("canplaythrough", cptEvent)
                            resolve();
                        };
                        sound.addEventListener("canplaythrough", cptEvent);
                        sound.addEventListener("error", () => reject(new Error(`Could not load sound "${soundID}" from "${rooms[roomName].sounds[soundID][1]}".`)));
                        sound.src = rooms[roomName].sounds[soundID][1];
                        this._loadingSounds[soundID].push(sound);
                    }));
                }
            });
        }
        return Promise.all(soundPromises);
    }

    takeNewSoundsToUse() {
        if (this._currentSounds !== null) {
            Object.values(this._currentSounds).forEach(soundArr => {
                soundArr.forEach(soundEl => soundEl.pause());
            });
        }
        this._currentSounds = this._loadingSounds;
        this._loadingSounds = null;
        this._playSoundIndex = {};
        Object.keys(this._currentSounds).forEach(soundID => {
            this._playSoundIndex[soundID] = 0;
        });
    }

    playSound(soundID) {
        let soundEl;

        if (!this._currentSounds[soundID]) {
            paistiLog(`The sound "${soundID}" has not been loaded in this room!`, loadTS, 'err');
            return;
        }
        this._playSoundIndex[soundID]++;
        if (this._playSoundIndex[soundID] === this._currentSounds[soundID].length) this._playSoundIndex[soundID] = 0;
        
        soundEl = this._currentSounds[soundID][this._playSoundIndex[soundID]];
        soundEl.pause();
        soundEl.currentTime = 0;
        soundEl.play();
    }
}