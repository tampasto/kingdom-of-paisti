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
        this.left = sets.left;
        this.right = sets.right;
        this.top = sets.top;
        this.bottom = sets.bottom;
        this.depth = sets.depth ? sets.depth : null;
        if (!this.left && !this.right) this.left = '50vw';
        if (!this.top && !this.bottom) this.top = '50vh';

        this.x = NaN;
        this.y = NaN;
        this.birthtime = null;
    }

    draw(recalculate, pfNow) {
        let x, y, unitN, unitTxt

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
            ctx.globalAlpha = 0.5 + (1+Math.sin(2*Math.PI * (pfNow % 969) / 969))/4;
        }

        if (this.depth) {
            this.y = Math.round((pfNow - this.birthtime) / (this.depth/20));
            if (this.y > 1.2 * paistiCanvas.height) paistiGame.removeScreenObject(this);
        }

        if (this.text) {
            ctx.fillStyle = this.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = this.font;
            ctx.fillText(this.text, this.x, this.y);
        }
        ctx.globalAlpha = 1;
    }
}