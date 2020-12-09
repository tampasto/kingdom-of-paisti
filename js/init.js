'use strict';

const langsAvailable = ['en', 'fi'];
const customFonts = ['Cinzel Decorative', 'bold Cinzel Decorative', 'Cinzel Decorative Black', 'Nova Slim', 'Pirata One'];
const skipSettings = false; // For development purposes, open canvas directly
const skipSettingsSoundsOn = true;
const introRoom = 'intro';

let lan = {}, rooms = {}; // Data files (folder lan and file rooms.js)

let pTranslations, pAudio, pStartScreen; // Instances of module classes
let ctx; // Canvas context

let initTS, loadTS; // Timestamps (numbers based on performance.now())
let customFontsIndex; // Based on constant customFonts
let promStartScreenScriptLoaded, promTranslationsLoaded, promGameScripts, activateFontsResolve; // Promises
let paistiCanvas; // Canvas HTML element reference

window.addEventListener('load', init); // Attach hoisted init


function init() { // 🔥
    let gScriptPromises;

    console.log('Window onload triggered, timer starts');

    initTS = performance.now();
    loadTS = initTS;

    if (!skipSettings) {
        promStartScreenScriptLoaded = loadScriptAsync('PaistiStartScreen') // .then(whenTrlDataLoaded), waiting PaistiTranslations
            .catch(ev => paistiLog(`Could not load PaistiStartScreen.${ev.stack ? '\n' + ev.stack : ' ' + ev.message}`, null, 'err'));
    }

    loadScriptAsync('PaistiTranslations').then(whenTrlScriptLoaded);

    /* Load all game scripts and execute whenGameScriptsLoaded() after it
       Game scripts will continue loading when user sees the start screen. */
    gScriptPromises = []
    gScriptPromises.push(loadScriptAsync('paistiGame')); // 🍖
    gScriptPromises.push(loadScriptAsync('PaistiRoom')); // 🖼️
    gScriptPromises.push(loadScriptAsync('rooms'));
    gScriptPromises.push(loadScriptAsync('PaistiAudio')); // 🔊
    gScriptPromises.push(loadScriptAsync('PaistiScreenObject')); // 🐷
    promGameScripts = Promise.all(gScriptPromises)
        .catch(ev => paistiLog(`Could not load runtime scripts.${ev.stack ? '\n' + ev.stack : ' ' + ev.message}`, null, 'err'));
}

function whenTrlScriptLoaded() {
    let trlContinuePromises;
    pTranslations = new PaistiTranslations(); // 💬

    promTranslationsLoaded = pTranslations.init(langsAvailable[0], introRoom)

    trlContinuePromises = [];
    trlContinuePromises.push(promTranslationsLoaded);
    if (!skipSettings) trlContinuePromises.push(promStartScreenScriptLoaded);
    Promise.all(trlContinuePromises).then(whenTrlDataLoaded)
        .catch(ev => paistiLog(`Could not load translation scripts.${ev.stack ? '\n' + ev.stack : ' ' + ev.message}`, null, 'err'));
    
    paistiLog('Translations script loaded, loading translations data');
}

function whenTrlDataLoaded() {
    if (!skipSettings) {
        pStartScreen = new PaistiStartScreen(startGame);
        pTranslations.translateStartForm();
    }
    promGameScripts.then(whenGameScriptsLoaded);
}

function whenGameScriptsLoaded() {
    let mediaLoadPromises, promMedia

    paistiLog('Game scripts are loaded');

    paistiGame.room = new PaistiRoom(introRoom); // 🖼️
    pAudio = new PaistiAudio(); // 🔊

    mediaLoadPromises = [];
    mediaLoadPromises.push(activateFonts);
    mediaLoadPromises.push(pAudio.loadTrackAsync(rooms[introRoom].trackURL));
    promMedia = Promise.all(mediaLoadPromises)
        .catch(ev => paistiLog(`Could not load data files required to run the game. File "${ev.filename}". ${ev.message}`, null, 'err'));

    Promise.all([promTranslationsLoaded, promMedia]).then(whenGameDataLoaded);

    paistiLog('Starting to load media');
}

function activateFonts() {
    return new Promise(resolve => {
        customFontsIndex = 0;
        activateFontInDOM();
        activateFontsResolve = resolve;
    });
}

function activateFontInDOM() {
    let fontSpan, fontString

    fontString = customFonts[customFontsIndex];
    fontSpan = document.createElement('span');
    fontSpan.innerText = '\u00A0'; // Non-breaking space
    fontSpan.style.font = '15px ' + fontString;
    fontSpan.addEventListener('load', whenFontLoaded);
    document.body.appendChild(fontSpan);
}

function whenFontLoaded(ev) {
    ev.currentTarget.parentNode.removeChild(ev.currentTarget);
    customFontsIndex++;
    if (customFontsIndex === customFonts.length) activateFontsResolve();
}

function whenGameDataLoaded() {
    paistiLog('Media and translations loaded');
    if (skipSettings) startGame();
}

function startGame() {
    paistiCanvas = document.getElementById('paistiCanvas');
    document.getElementById('startForm').style.display = 'none';
    paistiCanvas.style.display = 'block';

    ctx = paistiCanvas.getContext('2d');
    window.addEventListener('keydown', paistiGame.keydown);
    paistiGame.init(pStartScreen ? pStartScreen.selectedSoundsOn : skipSettingsSoundsOn);
}

function loadScriptAsync(src, idStr) {
    return new Promise((resolve, reject) => {
        let scriptElement, isLanScript;

        if (document.getElementById(idStr)) {
            reject(new Error(`Script #${idStr} already exists.`));
        }
        isLanScript = src.substr(0, 4) === 'lan/'
        scriptElement = document.createElement('script');
        if (!(/\.js$/).test(src)) src += '.js'
        if (!(/^js\//).test(src) && !isLanScript) src = 'js/' + src
        scriptElement.src = src;
        if (idStr) scriptElement.id = idStr;
        scriptElement.addEventListener('load', () => {
            let moduleName, mType, rejected;

            rejected = false;
            if (!isLanScript) {
                moduleName = src.replace(/^([^\/\\]+[\/\\])*|\.js$/g, '');
                mType = typeof eval(moduleName);
                if (!['function', 'object'].includes(mType)) {
                    reject(new Error(`Module "${moduleName}" loaded from file but did not reserve its name.`));
                    rejected = true;
                }
            }

            if (!rejected) {
                paistiLog(`Loaded script "${src}"`);
                resolve();
            }
        });
        scriptElement.addEventListener('error', reject);
        try {
            document.body.appendChild(scriptElement);
        }
        catch (err) {
            paistiLog(`Could not load script "${src}". ${err.message}`, null, 'err');
            reject(err);
        }
    });
}

// Logging function showing milliseconds since window.onload (or other timestamp such as loadTS)
function paistiLog(logText, timestamp, severity) {
    let txt;

    if (!timestamp) timestamp = initTS;
    txt = `[${Math.round(performance.now()-timestamp)} ms] ${logText}`;
    if (!severity) {
        console.log(txt);
    }
    else if (severity === 'warn') {
        console.warn(txt);
    }
    else if (severity === 'err') {
        console.error(txt);
    }
    else {
        console.error(`paistiLog: Severity "${severity}" not understood`)
    }
}