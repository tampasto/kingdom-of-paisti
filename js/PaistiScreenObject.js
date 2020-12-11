'use strict';

class PaistiScreenObject { // 🐷
    _reIsVh = /\dvh$/;
    _reIsVw = /\dvw$/;

    constructor(id, sets) {
        this.id = id;
        this.visible = typeof sets.visible === 'boolean' ? sets.visible : true;
        this.text = sets.text;

        this.fontSize = sets.fontSize ? sets.fontSize : '12px';
        this.fontFamily = sets.fontFamily ? sets.fontFamily : 'Arial';
        this.fontStyle = sets.fontStyle ? sets.fontStyle : '';
        this.font = (this.fontStyle ? this.fontStyle + ' ' : '') + this.fontSize + ' ' + this.fontFamily;

        this.textAlign = sets.textAlign ? sets.textAlign : 'center';
        this.textBaseline = sets.textBaseline ? sets.textBaseline : 'middle';
        this.color = sets.color ? sets.color : '#FFF';
        this.glow = sets.glow ? sets.glow : false;
        this.floating = sets.floating ? sets.floating : null;
        this.roundMs = sets.roundMs ? sets.roundMs : null;
        this.left = sets.left;
        this.right = sets.right;
        this.top = sets.top;
        this.bottom = sets.bottom;
        this.depth = sets.depth ? sets.depth : null;
        if (!this.left && !this.right) this.left = '50vw';
        if (!this.top && !this.bottom) this.top = '50vh';
        this.onclick = typeof sets.onclick === 'function' ? sets.onclick : null;
        this.fadeOutSec = sets.fadeOutSec;

        this.x = NaN;
        this.y = NaN;
        this.birthtime = null;

        if ((this.glow || this.floating) && !this.roundMs) {
            paistiLog('Must define roundMs for PaistiScreenObject when using glow or floating.');
        }
    }

    draw(recalculate, pfNow, mouseX, mouseY) {
        let drawX, drawY, unitN, unitTxt, onclickFunc, pmMoveX, pmMoveY, rad;

        if (!this.visible) return;
        if (!this.birthtime) this.birthtime = pfNow;

        if (recalculate || isNaN(this.x)) {
            // Resolve x
            if (this.left) {
                unitTxt = this.left;
            }
            else if (this.right) {
                unitTxt = this.right;
            }
            unitN = parseFloat(unitTxt);
            if (this._reIsVh.test(unitTxt)) {
                unitN = paistiGame.vh(unitN);
            }
            else if (this._reIsVw.test(unitTxt)) {
                unitN = paistiGame.vw(unitN);
            }
            if (this.left) {
                this.x = paistiGame.px(unitN);
            }
            else if (this.right) {
                this.x = paistiCanvas.width - paistiGame.px(unitN);
            }

            // Resolve y
            if (!this.depth) {
                if (this.top) {
                    unitTxt = this.top;
                }
                else if (this.bottom) {
                    unitTxt = this.bottom;
                }
                unitN = parseFloat(unitTxt);
                if (this._reIsVh.test(unitTxt)) {
                    unitN = paistiGame.vh(unitN);
                }
                else if (this._reIsVw.test(unitTxt)) {
                    unitN = paistiGame.vw(unitN);
                }
                if (this.top) {
                    this.y = paistiGame.px(unitN);
                }
                else if (this.bottom) {
                    this.y = paistiCanvas.height - paistiGame.px(unitN);
                }
            }
        }

        if (this.glow) {
            ctx.globalAlpha = 0.5 + (1+Math.sin(2*Math.PI * (pfNow % this.roundMs) / this.roundMs))/4;
        }

        if (this.depth) {
            drawY = Math.round((pfNow - this.birthtime) / (this.depth/20));
            if (drawY > 1.2 * paistiCanvas.height) paistiGame.removeScreenObject(this);
        }
        else if (this.floating) {
            unitTxt = this.floating;
            unitN = parseFloat(unitTxt);
            if (this._reIsVh.test(unitTxt)) {
                unitN = paistiGame.vh(unitN);
            }
            else if (this._reIsVw.test(unitTxt)) {
                unitN = paistiGame.vw(unitN);
            }
            drawY = this.y + paistiGame.px(Math.sin(2*Math.PI * (pfNow % this.roundMs) / this.roundMs) * unitN);
        }
        else {
            drawY = this.y;
        }

        drawX = this.x;

        if (this.fadeOutSec && performance.now() - this.birthtime > 1000 * this.fadeOutSec) {
            if (performance.now() - this.birthtime >= 1000 * this.fadeOutSec + this.roundMs) {
                paistiGame.removeScreenObject(this.id);
                return null;
            }
            else {
                ctx.globalAlpha = ((1000 * this.fadeOutSec + this.roundMs) - (performance.now() - this.birthtime)) / this.roundMs;
            }
        }
        else {
            ctx.globalAlpha = 1;
        }

        if (this.text) {
            ctx.fillStyle = this.color;
            ctx.textAlign = this.textAlign;
            ctx.textBaseline = this.textBaseline;
            ctx.font = this.font;
            ctx.fillText(this.text, drawX, drawY);
        }
        ctx.globalAlpha = 1;

        onclickFunc = null;
        if (this.onclick) {
            if (Math.sqrt((mouseX - drawX)**2 + (mouseY - drawY)**2) < paistiGame.px(35)) {
                onclickFunc = this.onclick;
            }
        }

        if (this.id === 'partymeter') {
            ctx.lineWidth = paistiGame.px(15);
            ctx.lineCap = "butt";
            pmMoveX = ctx.measureText(this.text).width / 2;
            pmMoveY = paistiGame.px(25);
            
            ctx.strokeStyle = '#F00';
            ctx.beginPath();
            ctx.arc(drawX - pmMoveX, drawY - pmMoveY, paistiGame.px(50), Math.PI, 4 * Math.PI / 3);
            ctx.stroke();
            
            ctx.strokeStyle = '#FF0';
            ctx.beginPath();
            ctx.arc(drawX - pmMoveX, drawY - pmMoveY, paistiGame.px(50), 4 * Math.PI / 3, 5 * Math.PI / 3);
            ctx.stroke();
            
            ctx.strokeStyle = '#0F0';
            ctx.beginPath();
            ctx.arc(drawX - pmMoveX, drawY - pmMoveY, paistiGame.px(50), 5 * Math.PI / 3, 2 * Math.PI);
            ctx.stroke();
            
            ctx.lineWidth = paistiGame.px(8);
            ctx.lineCap = "round";
            ctx.strokeStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(drawX - pmMoveX, drawY - pmMoveY);
            rad = 3 * Math.PI / 2 - (paistiGame.partyPoints / paistiGame.partyPointsMax) * Math.PI;
            ctx.lineTo(drawX - pmMoveX + paistiGame.px(60) * Math.sin(rad),
                       drawY - pmMoveY + paistiGame.px(60) * Math.cos(rad));
            ctx.stroke();
        }

        return onclickFunc;
    }
}