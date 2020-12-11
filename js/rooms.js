/* See for example the following site to get free music tracks:
   https://blog.felgo.com/game-resources/free-music-for-games#_digccMixter */

/* Current tracks originate from the following websites:
    * https://www.bensound.com/
    * https://www.freesfx.co.uk/ */

rooms.intro = {
    trackURL: "music/freesfx-ability-to-dance.mp3",
    trackVolume: 0.8,
    bgType: "radialgradient",
    gradientColors: { // 0 is center, 1 is perifery
        "0": "#007",
        "1": "#000",
    },
    bgColor: "#000",
    initScreenObjects: { // Translation IDs are written in square brackets
        // see PaistiScreenObject.js for available settings (sets.<setting>)
        "game_name_text": {
            text: "[game_name]",
            fontFamily: "Cinzel Decorative",
            fontStyle: "bold",
            fontSize: "12vh",
            top: "24vh",
        },
        "crown_emoji": {
            text: "👑",
            top: "10vh",
            right: "30vw",
            fontSize: "18vh",
        },
        "paisti_emoji": {
            text: "🍖",
            fontSize: "25vh",
            floating: "2vh",
            roundMs: 969,
        },
        "welcome_text": {
            text: "[welcome]",
            fontFamily: "Nova Slim",
            fontSize: "5vh",
            bottom: "25vh",
        },
        "press_key_text": {
            text: "[press_key]",
            fontFamily: "Nova Slim",
            fontSize: "3vh",
            bottom: "12vh",
            glow: true,
            roundMs: 1938,
        },
    },
}

rooms.paistiRain = {
    trackURL: "music/bensound-psychedelic.mp3",
    trackVolume: 0.5,
    sounds: {
        "bell_tone": [3, "sounds/freesfx-bell-tone-or-idea-accent-performed-on-xylophone.mp3"],
        "organ": [1, "sounds/freesfx-circus-organ-or-organ-grinder.mp3"],
    },
    bgType: "radialgradient",
    gradientColors: { // 0 is center, 1 is perifery
        "0": "#007",
        "1": "#640",
    },
    paistiRain: {
        paistiEmojis: ['🍖', '🥩', '🍗'], // Should be in array, string operations get mad with emojis
        paistiSizePaistiRainVh: 5, // Initial size for a falling paisti
        dropPaistiMaxMs: 300, // Maximum time to wait until a new paisti is dropped
        dropPaistiMinMs: 30, // Minimum time to wait -''-
        dropPaistiDepthMin: 6, // Min depth for a new paisti (small number: not deep)
        dropPaistiDepthMax: 100, // Max depth
    },
    initScreenObjects: {
        "collect_paisti_text": {
            text: "[collect_paisti]",
            fontFamily: "Nova Slim",
            fontSize: "5vh",
            fadeOutSec: 3,
            roundMs: 1000,
        },
        "partymeter": {
            text: "[partymeter]",
            textAlign: "right",
            fontFamily: "Nova Slim",
            fontSize: "3vh",
            top: "24vh",
            right: "3vw",
        },
    },
    partyPointEatIntervalMs: 700,
}