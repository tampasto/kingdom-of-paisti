'use strict';

let paistiGame = (() => { // 🍖
    let exports = {};

    const mainIntervalMs = 0; // Debugging, other than zero will slow the main loop to this millisecond value
    const infoValueColWidthVh = 30; // Width of info box value column
    const fontSizeInfoBoxVh = 3;

    exports.room = null; // Reference to the current PaistiRoom object
    exports.screenObjectList = []; // Drawing list for screen objects, first objects are in background, last objects in foreground
    exports.screenObject = {}; // ID access object for screen objects
    exports.soundsOn = null;
    
    let preloadedRoom = null; // Reference to the already loaded PaistiRoom object
    let isDrawingInfo = false; // The green specs in top right corner, togglable via Ctrl key
    let infoCaptions, fpsTimes, frameNo; // Private variables related to info box
    let stopped = false; // Has the user paused the game?
    let cssWidthPx, cssHeightPx, pixelRatio, pixelRatioMediaQuery; // Canvas size in virtual pixels and conversion to actual pixels
    
    let px = exports.px = pixels => Math.round(pixelRatio * pixels); // Converts css pixels to real pixels on sceen
    let vh = exports.vh = vhPc => cssHeightPx * vhPc / 100; // Converts vh unit (viewport height) to pixels
    let vw = exports.vw = vwPc => cssWidthPx * vwPc / 100; // Converts vh unit (viewport width) to pixels

    exports.init = (soundOn) => {
        exports.soundsOn = soundOn;
        if (exports.soundsOn) pAudio.playLoadedTrack();

        pixelRatio = window.devicePixelRatio || 1;
        pixelRatioMediaQuery = window.matchMedia(`(resolution: ${pixelRatio}dppx)`);
        pixelRatioMediaQuery.addListener(pixelRatioChange);

        fpsTimes = [];
        canvasSizeChanged();
        exports.room = new PaistiRoom(exports.room.name);
        exports.room.initRoom(); // Initiate PaistiScreenObjects
        frameNo = 0
        requestAnimationFrame(main);
        paistiLog('Started game loop');
    };

    let addScreenObject = exports.addScreenObject = (id, options) => {
        let screenObject;

        if (exports.screenObject[id]) {
            paistiLog(`A screen object with id "${id}" already exists!`, loadTS, 'err');
            return;
        }
        screenObject = new PaistiScreenObject(id, options);
        exports.screenObject[id] = screenObject; // Access via ID
        exports.screenObjectList.push(screenObject); // Access via queue (especially while drawing)
    };

    let removeScreenObject = exports.removeScreenObject = idOrObj => {
        if (typeof idOrObj === 'string') {
            exports.screenObjectList.splice(exports.screenObjectList.indexOf(exports.screenObject[idOrObj]), 1);
            delete exports.screenObject[idOrObj];
        }
        else {
            exports.screenObjectList.splice(exports.screenObjectList.indexOf(idOrObj), 1);
            Object.keys(exports.screenObject).forEach(id => {
                if (exports.screenObject[id] === idOrObj) delete exports.screenObject[id];
            });
        }
    };

    let clearScreenObjects = exports.clearScreenObjects = id => {
        Object.keys(exports.screenObject).forEach(id => removeScreenObject(id));
    };

    let main = (pfNow) => {
        let recalculate;

        recalculate = false;
        if (cssWidthPx !== window.innerWidth || cssHeightPx !== window.innerHeight) {
            canvasSizeChanged();
            recalculate = true;
        }

        exports.room.drawBackground(recalculate, pfNow);
        exports.screenObjectList.forEach(sObj => sObj.draw(recalculate, pfNow));

        if (isDrawingInfo) drawInfo(pfNow);

        frameNo++;
        if (!stopped) {
            if (!mainIntervalMs) {
                requestAnimationFrame(main);
            }
            else {
                setTimeout(() => requestAnimationFrame(main), mainIntervalMs);
            }
        }
    };

    infoCaptions = ['FPS:', 'Frame no:', 'Screen objects:'];
    let drawInfo = pfNow => {
        let infoValues, rowHeight, framesPerSec;

        while (fpsTimes.length > 0 && fpsTimes[0] <= pfNow - 1000) fpsTimes.shift();
        fpsTimes.push(pfNow);
        framesPerSec = fpsTimes.length;

        infoValues = [`${framesPerSec}`, frameNo, exports.screenObjectList.length];

        rowHeight = px(vh(fontSizeInfoBoxVh));

        ctx.globalAlpha = 1;
        ctx.textBaseline = 'top';
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(px(cssWidthPx - 25 - vh(infoValueColWidthVh)), px(25), px(vh(infoValueColWidthVh) + 10), px(infoCaptions.length * rowHeight + 7));

        ctx.fillStyle = '#0F0';
        ctx.font = `${px(vh(fontSizeInfoBoxVh))}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        infoCaptions.forEach((infoCaption, i) => ctx.fillText(infoCaption, px(cssWidthPx - 20 - vh(infoValueColWidthVh)), px(30 + i * rowHeight)));
        ctx.textAlign = 'right';
        infoValues.forEach((infoValue, i) => ctx.fillText(infoValue, px(cssWidthPx - 20), px(30 + i * rowHeight)));
    };

    let canvasSizeChanged = () => {
        cssWidthPx = window.innerWidth;
        cssHeightPx = window.innerHeight;
        paistiCanvas.width = px(cssWidthPx);
        paistiCanvas.height = px(cssHeightPx);
    };

    let pixelRatioChange = ev => {
        pixelRatio = window.devicePixelRatio;
        paistiLog(`Pixel ratio has changed to ${pixelRatio}`, loadTS);
        canvasSizeChanged();
    };

    exports.loadRoomAsync = (roomName, lang) => {
        loadTS = performance.now();
        return new Promise((resolve, reject) => {
            let loadPromises
            preloadedRoom = new PaistiRoom(roomName);
            loadPromises = [];
            loadPromises.push(pTranslations.loadRoomAsync(lang, roomName));
            if (exports.soundsOn) loadPromises.push(pAudio.loadTrackAsync(rooms[roomName].trackURL));
            Promise.all(loadPromises).then(resolve, reject);
        });
    };

    let enterPreloadedRoom = () => {
        exports.room.exitRoom();
        exports.room = preloadedRoom;
        preloadedRoom = null;
        exports.room.initRoom();
        if (exports.soundsOn) pAudio.playLoadedTrack();
    }

    exports.keydown = ev => {
        switch(ev.key) {
            case 'Escape':
                if (paistiGame.room.name !== 'intro') {
                    exports.loadRoomAsync('intro').then(enterPreloadedRoom);
                }
                break;
            case 'Pause':
                stopped = !stopped; // Toggle stopped state
                if (stopped) {
                    addScreenObject('status_stopped', {
                        text: pTranslations.getTranslation('game_stopped'),
                        color: '#0F0',
                        font: `${px(fontSizeCaptionWh)}px Nova Slim`,
                    });
                }
                else {
                    removeScreenObject('status_stopped');
                    requestAnimationFrame(main);
                }
                break;
            case 'Control':
                isDrawingInfo = !isDrawingInfo;
                break;
            case ' ':
                if (paistiGame.room.name === 'intro') {
                    exports.loadRoomAsync('paistiRain').then(enterPreloadedRoom);
                }
                break;
        }
        //paistiLog(`ev.key = "${ev.key}"`);
    };

    return exports;
})();