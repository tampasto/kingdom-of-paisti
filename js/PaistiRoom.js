'use strict';

class PaistiRoom { // 🖼️
    // General room properties
    gradient = null;
    gradientX = null;
    gradientY = null;

    // Paisti rain
    paistiCount = 0; // Counter for paisti IDs
    paistiTimeout = null; // The ID number returned by setTimeout for new paisti loop

    constructor(roomName) {
        this.name = roomName;
        if (!rooms[this.name]) {
            paistiLog(`The room "${this.name}" has not been defined basic settings in rooms.js.`, loadTS, 'warn');
        }
        else {
            this.bgType = rooms[this.name].bgType;
            switch (this.bgType) {
                case 'color':
                    this.bgColor = rooms[this.name].bgColor;
                    break;
                
                case 'radialgradient':
                    this.gradientColors = rooms[this.name].gradientColors;
                    break;
            }
            this.initScreenObjects = rooms[this.name].initScreenObjects ? rooms[this.name].initScreenObjects : {};
        }
    }

    drawBackground(recalculate, pfNow) {
        switch (this.bgType) {
            case 'color':
                ctx.fillStyle = this.bgColor;
                ctx.fillRect(0, 0, paistiCanvas.width, paistiCanvas.height);
                break;
            
            case 'radialgradient':
                if (recalculate || !this.gradient) {
                    this.gradientX = Math.round(paistiCanvas.width / 2);
                    this.gradientY = Math.round(paistiCanvas.height / 2);
                    this.gradient = ctx.createRadialGradient(this.gradientX, this.gradientY, 0, this.gradientX, this.gradientY, paistiCanvas.width);
                    for (let pos in this.gradientColors) {
                        this.gradient.addColorStop(parseFloat(pos), this.gradientColors[pos]);
                    }
                }
                ctx.fillStyle = this.gradient;
                ctx.fillRect(0, 0, paistiCanvas.width, paistiCanvas.height);
                break;
        }
    }

    initRoom() {
        // Create screen objects in rooms[<room>].initScreenObjects
        Object.keys(this.initScreenObjects).forEach(idStr => {
            let scrObjects

            scrObjects = JSON.parse(JSON.stringify(this.initScreenObjects[idStr])); // Deep copy
            scrObjects.text = scrObjects.text.replace(/\[[^\]]+\]/g, mt => pTranslations.getTranslation(mt.slice(1, -1)));
            paistiGame.addScreenObject(idStr, scrObjects);
        });

        if (this.name === 'paistiRain') {
            this.paistiCount = 0;
            this.dropNewPaisti(this);
        }
    }

    exitRoom() {
        if (this.name === 'paistiRain') clearTimeout(this.paistiTimeout);
        paistiGame.clearScreenObjects();
    }

    dropNewPaisti(thisArg) {
        let depth, timeUntilNewPaisti, depthMin, depthMax, defaultSize, minMs, maxMs, paistiEmojis

        // Retrieve from rooms.js object
        depthMin =      rooms[thisArg.name].paistiRain.dropPaistiDepthMin;
        depthMax =      rooms[thisArg.name].paistiRain.dropPaistiDepthMax;
        defaultSize =   rooms[thisArg.name].paistiRain.paistiSizePaistiRainVh;
        minMs =         rooms[thisArg.name].paistiRain.dropPaistiMinMs;
        maxMs =         rooms[thisArg.name].paistiRain.dropPaistiMaxMs;
        paistiEmojis =  rooms[thisArg.name].paistiRain.paistiEmojis;

        depth = Math.round(depthMin + Math.random() * (depthMax - depthMin + 1) - 0.5)
        paistiGame.addScreenObject(`paisti${++thisArg.paistiCount}`, {
            text: paistiEmojis[Math.floor(Math.random() * paistiEmojis.length)],
            fontSize: ((100-depth)/100 * defaultSize) + 'vh',
            depth: depth,
            left: (Math.random() * 100).toFixed(3) + 'vw',
        });

        timeUntilNewPaisti = minMs + Math.random() * (maxMs - minMs + 1) - 0.5;
        thisArg.paistiTimeout = setTimeout(thisArg.dropNewPaisti, Math.round(timeUntilNewPaisti), thisArg);
    }
}