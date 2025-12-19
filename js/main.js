/**
 * js/main.js - Logique principale de l'interface
 * Gère le livre (PageFlip), l'audio, et les Runes.
 * Les fonctions IA sont dans gemini.js
 */

document.addEventListener('DOMContentLoaded', function() {
    initBook();
    initAudioListener();
    
    // Initialisation Runes (si besoin au chargement)
    const runeInput = document.getElementById('rune-input');
    if(runeInput && runeInput.value && window.translateRunes) {
        window.translateRunes(runeInput.value);
    }
});

// --- 1. GESTION DU LIVRE ---
function initBook() {
    try {
        // Vérifie si la librairie PageFlip est chargée
        if (typeof St === 'undefined' || typeof St.PageFlip === 'undefined') {
            console.warn("Bibliothèque PageFlip manquante ou pas encore chargée.");
            // On laisse le CSS gérer le mode fallback
            return;
        }

        const pageFlip = new St.PageFlip(document.getElementById('book'), {
            size: 'stretch',
            width: 480, height: 720,
            minWidth: 315, maxWidth: 650,
            minHeight: 450, maxHeight: 950,
            maxShadowOpacity: 0.5, 
            showCover: true, 
            mobileScrollSupport: false 
        });
        
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        
        // Si tout va bien, on retire la classe fallback
        document.body.classList.remove('fallback-mode');

        // Patch Mobile : empêche de tourner la page quand on clique sur un input/bouton
        document.querySelectorAll('input, button').forEach(el => {
            el.addEventListener('touchstart', (e) => e.stopPropagation());
            el.addEventListener('mousedown', (e) => e.stopPropagation());
        });

    } catch(e) { 
        console.log("Mode Fallback activé (Livre statique):", e); 
        document.body.classList.add('fallback-mode');
    }
}

// --- 2. AUDIO & AMBIANCE ---
let scWidget;

function initAudioListener() {
    const startScreen = document.getElementById('start-screen');
    
    if(startScreen) {
        // Le bouton pour entrer
        const btn = startScreen.querySelector('button');
        if(btn) {
            btn.addEventListener('click', () => {
                // Animation de disparition
                startScreen.style.transition = 'opacity 1s';
                startScreen.style.opacity = '0';
                
                setTimeout(() => {
                    if (startScreen && startScreen.parentNode) {
                        startScreen.parentNode.removeChild(startScreen);
                    }
                }, 1000);
                
                // Démarrage Audio
                try {
                    const iframe = document.querySelector('#sc-player');
                    if(iframe && typeof SC !== 'undefined') {
                        scWidget = SC.Widget(iframe);
                        scWidget.setVolume(30);
                        scWidget.play();
                    }
                } catch(e) {
                    console.warn("Impossible de lancer l'audio auto :", e);
                }
            });
        }
    }
}

// Fonction globale accessible via onclick="" dans le HTML
window.toggleAudio = function() {
    if (!scWidget && typeof SC !== 'undefined') {
        scWidget = SC.Widget(document.querySelector('#sc-player'));
    }
    if(scWidget) scWidget.toggle();
};

// --- 3. RUNES ---
window.translateRunes = function(text) {
    const runesMap = {'a':'ᚨ', 'b':'ᛒ', 'c':'ᚲ', 'd':'ᛞ', 'e':'ᛖ', 'f':'ᚠ', 'g':'ᚷ', 'h':'ᚺ', 'i':'ᛁ', 'j':'ᛃ', 'k':'ᚲ', 'l':'ᛚ', 'm':'ᛗ', 'n':'ᚾ', 'o':'ᛟ', 'p':'ᛈ', 'q':'ᚲ', 'r':'ᚱ', 's':'ᛊ', 't':'ᛏ', 'u':'ᚢ', 'v':'ᚢ', 'w':'ᚹ', 'x':'ᚲᛊ', 'y':'ᛃ', 'z':'ᛉ', ' ':' '};
    let res = ""; 
    for (let c of text.toLowerCase()) { res += runesMap[c] || c; }
    const display = document.getElementById('rune-display');
    if(display) display.textContent = res;
};
