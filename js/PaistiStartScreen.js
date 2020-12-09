'use strict';

class PaistiStartScreen {
    constructor(startButtonFunc) {
        let languageListHTML, elButton;

        languageListHTML = '';
        langsAvailable.forEach((langCode, i) => {
            languageListHTML += `<label for="available_languages_${langCode}">` +
                `<input type="radio" name="available_languages" onchange="pTranslations.changeLanguage('${langCode}')" id="available_languages_${langCode}"${i===0 ? ' checked' : ''}>` +
                `&nbsp;<span class="lan_languages.${langCode}"></span></label>` +
                `${i===langsAvailable.length-1?'':'<br>'}`;
        });
        document.getElementById('availableLanguages').innerHTML = languageListHTML;
        document.getElementById('startForm').style.display = 'block';
        elButton = document.getElementById('startGameButton')
        elButton.addEventListener('click', startButtonFunc);
        elButton.focus();
    }

    get selectedLanguage() {
        let radioSelections, lang

        lang = '';
        radioSelections = document.getElementsByName('available_languages');
        radioSelections.forEach(radio => {
            if (radio.checked) lang = radio.id.substr(20);
        });
        return lang;
    }

    get selectedSoundsOn() {
        return document.getElementById('music_sounds_on').checked;
    }
}