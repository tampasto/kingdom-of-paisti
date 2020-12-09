'use strict';

class PaistiTranslations { // 💬
    constructor() {
        this.lang = null;
    }

    init(langCode, introRoomName) {
        this.lang = langCode;
        return new Promise((resolve, reject) => {
            let langLoadPromises;

            langLoadPromises = [];
            langLoadPromises.push(this.loadCommonAllLangsAsync());
            langLoadPromises.push(this.loadCommonAsync('en'));
            langLoadPromises.push(this.loadRoomAsync('en', introRoomName));
            if (this.lang !== 'en') {
                langLoadPromises.push(this.loadCommonAsync(this.lang));
                langLoadPromises.push(this.loadRoomAsync(this.lang, introRoomName));
            }
            Promise.all(langLoadPromises)
                .then(resolve)
                .catch(ev => {
                    paistiLog(`Could not load translation script files.${ev.stack ? '\n' + ev.stack : ' ' + ev.message}`, loadTS, 'err');
                    reject(ev);
                });
        });
    }

    translateStartForm() {
        let elcWithClass;

        elcWithClass = document.querySelectorAll('#startForm *[class]');
        if (elcWithClass) {
            elcWithClass.forEach(el => {
                let cList, lanI;

                cList = [...el.classList];
                lanI = cList.findIndex(clName => clName.substr(0, 4) === 'lan_');
                if (lanI !== -1) {
                    el.innerText = this.getTranslation(cList[lanI].substr(4));
                }
            }, this);
        }
    }

    getTranslation(trlCode, lang, replaceArgs, noLog) {
        let trlStr, params;
        if (!lang) lang = this.lang;

        // Read code preferring most specific: room > common in language > common all languages
        trlStr = this._getTranslationInScope(lan?.[lang]?.room, trlCode);
        if (!trlStr) {
            trlStr = this._getTranslationInScope(lan?.[lang]?.common, trlCode);
            if (!trlStr) {
                trlStr = this._getTranslationInScope(lan?.common, trlCode);
            }
        }

        if (!trlStr) {
            if (noLog !== true) {
                paistiLog(`Translation for code "${trlCode}" not found for language "${lang}".`, loadTS, 'warn');
            }
        }

        if (replaceArgs) {
            params = Object.keys(replaceArgs);
            params.forEach(param => {
                let reParam = new RegExp('\\\{' + param.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\\}', 'g');
                trlStr = trlStr.replace(reParam, mt => replaceArgs[param]);
            });
        }

        if (!trlStr) {
            if (lang === 'en') {
                trlStr = `[${trlCode}]`;
            }
            else {
                trlStr = `[en] ${this.getTranslation(trlCode, 'en', null, true)}`;
            }
        }
        return trlStr;
    }

    _getTranslationInScope(lanObjRef, trlCode) {
        let trlParts;

        if (!lanObjRef) return '';

        trlParts = trlCode.split('.');
        if (trlParts.length === 1) {
            return lanObjRef[trlCode];
        }
        else if (trlParts.length === 2) {
            return lanObjRef[trlParts[0]]?.[trlParts[1]];
        }
        else if (trlParts.length === 3) {
            return lanObjRef[trlParts[0]]?.[trlParts[1]]?.[trlParts[2]];
        }
    }

    loadCommonAllLangsAsync() {
        return loadScriptAsync(`lan/common.js`)
            .then(() => this.langFileLoaded('common', 'commonAllLangs'))
            .catch(err => this.langFileLoadError('common', 'commonAllLangs', err));
    }
    
    loadCommonAsync(lang) {
        if (!lan[lang]) lan[lang] = {};
        return loadScriptAsync(`lan/${lang}.js`, `script_lan_${lang}`)
            .then(() => this.langFileLoaded(lang, 'common'))
            .catch(err => this.langFileLoadError(lang, 'common', err));
    }

    loadRoomAsync(lang, roomname) {
        if (!lang) lang = this.lang;
        return loadScriptAsync(`lan/${roomname}/${lang}.js`, `script_lan_${lang}_${roomname}`)
            .then(() => this.langFileLoaded(lang, 'room'))
            .catch(err => this.langFileLoadError(lang, 'room', err));
    }

    langFileLoaded(lang, scope) {
        let msgBeginning, hasError

        hasError = false;
        switch (scope) {
            case 'commonAllLangs':
                msgBeginning = 'Common strings';
                if (!lan.common) hasError = true;
                break;
            case 'common':
                msgBeginning = `Common translations for language "${lang}"`;
                if (!lan[lang].common) hasError = true;
                break;
            case 'room':
                msgBeginning = `Room translations for language "${lang}"`;
                if (!lan[lang].room) hasError = true;
        }

        if (hasError) {
            paistiLog(`${msgBeginning} loaded but object not created.`, loadTS, 'err');
        }
        else {
            paistiLog(`${msgBeginning} loaded successfully.`);
        }
    }

    langFileLoadError(lang, scope, err) {
        let msgStr
        
        switch (scope) {
            case 'commonAllLangs':
                msgStr = 'common strings';
                break;
            case 'common':
                msgStr = `common translations for language "${lang}"`;
                break;
            case 'room':
                msgStr = `room translations for language "${lang}"`;
        }
        paistiLog(`Failed loading ${msgStr}.${err.message ? ' ' + err.message : ''}`, loadTS, 'err');
    }

    changeLanguage(langCode, roomName) {
        let trlLoadPromises, elcPrevLanScripts, changeTranslations;

        if (!roomName) roomName = introRoom;

        // Delete old language if not English
        if (this.lang !== 'en') {
            elcPrevLanScripts = document.querySelectorAll(`*[id^="script_lan_${this.lang}"]`);
            if (elcPrevLanScripts) {
                elcPrevLanScripts.forEach(el => {
                    el.parentElement.removeChild(el);
                });
            }
        }

        changeTranslations = () => {
            this.lang = langCode;
            this.translateStartForm();
        };
        if (langCode !== 'en') {
            trlLoadPromises = [];
            trlLoadPromises.push(this.loadCommonAsync(langCode));
            trlLoadPromises.push(this.loadRoomAsync(langCode, roomName));
            Promise.all(trlLoadPromises).then(changeTranslations);
        }
        else {
            changeTranslations();
        }
    }
}