document.addEventListener('DOMContentLoaded', function() {
    initBook();
    initAudioListener();
    initRunes();
});

// --- 1. GESTION DU LIVRE ---
function initBook() {
    try {
        if (typeof St === 'undefined' || typeof St.PageFlip === 'undefined') throw new Error("PageFlip manquant");

        const pageFlip = new St.PageFlip(document.getElementById('book'), {
            size: 'stretch',
            width: CONFIG.BOOK.width, height: CONFIG.BOOK.height,
            minWidth: CONFIG.BOOK.minWidth, maxWidth: CONFIG.BOOK.maxWidth,
            minHeight: CONFIG.BOOK.minHeight, maxHeight: CONFIG.BOOK.maxHeight,
            maxShadowOpacity: 0.5, showCover: true, mobileScrollSupport: false 
        });
        
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        document.body.classList.remove('fallback-mode');

        // Patch pour rendre les inputs cliquables
        document.querySelectorAll('input, button').forEach(el => {
            el.addEventListener('touchstart', (e) => e.stopPropagation());
            el.addEventListener('mousedown', (e) => e.stopPropagation());
        });

    } catch(e) { 
        console.log("Mode Fallback (Livre statique) activé:", e); 
        document.body.classList.add('fallback-mode');
    }
}

// --- 2. AUDIO & AMBIANCE ---
let scWidget;

function initAudioListener() {
    // Le bouton d'accueil lance le son
    const startScreen = document.getElementById('start-screen');
    if(startScreen) {
        startScreen.addEventListener('click', () => {
            startScreen.style.opacity = '0';
            setTimeout(() => startScreen.remove(), 1000);
            
            // Démarrage Audio
            const iframe = document.querySelector('#sc-player');
            scWidget = SC.Widget(iframe);
            scWidget.setVolume(30);
            scWidget.play();
        });
    }
}

// Fonction globale pour le bouton Volume
window.toggleAudio = function() {
    if (!scWidget) scWidget = SC.Widget(document.querySelector('#sc-player'));
    scWidget.toggle();
};

// --- 3. INTERACTION IA (Pont vers gemini.js) ---

// Générateur de Rumeurs
window.generateRumor = async function(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    
    const ui = {
        output: document.getElementById('ai-rumor-zone'),
        loader: document.getElementById('rumor-loader')
    };

    ui.output.style.display = 'none'; 
    ui.loader.style.display = 'block';

    const prompt = "Personnage fantasy ivre taverne. Rumeur courte drôle sur hydromel HydroNeal. Français.";
    const text = await callGeminiAPI(prompt); // Appel à gemini.js

    ui.loader.style.display = 'none'; 
    ui.output.style.display = 'block';
    
    if(text) typeWriter(text, 'ai-rumor-zone');
    else ui.output.innerHTML = "Les esprits sont silencieux...";
};

// Générateur de Légendes (Objets)
window.generateLegend = async function(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    
    const input = document.getElementById('ingredient-input').value;
    if (!input) return;

    const ui = {
        output: document.getElementById('legend-output'),
        loader: document.getElementById('legend-loader')
    };

    ui.loader.style.display = 'block'; 
    ui.output.innerHTML = '';

    const prompt = `Alchimiste. Ingrédient: "${input}". Nom hydromel épique + desc courte. JSON: {"nom": "...", "description": "..."}`;
    const rawText = await callGeminiAPI(prompt);

    ui.loader.style.display = 'none';

    if (rawText && rawText.includes("{")) {
        try {
            const jsonStr = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonStr);
            ui.output.innerHTML = `<h4 style="color:#8a0b0b; margin:0;">${data.nom}</h4><p id="gen-desc" style="font-size:1em;"></p>`;
            typeWriter(data.description, 'gen-desc');
        } catch (e) { 
            ui.output.innerHTML = rawText; // Fallback texte brut
        }
    } else { 
        ui.output.innerHTML = "La transmutation a échoué."; 
    }
};

// --- 4. RUNES ---
window.translateRunes = function(text) {
    const runesMap = {'a':'ᚨ', 'b':'ᛒ', 'c':'ᚲ', 'd':'ᛞ', 'e':'ᛖ', 'f':'ᚠ', 'g':'ᚷ', 'h':'ᚺ', 'i':'ᛁ', 'j':'ᛃ', 'k':'ᚲ', 'l':'ᛚ', 'm':'ᛗ', 'n':'ᚾ', 'o':'ᛟ', 'p':'ᛈ', 'q':'ᚲ', 'r':'ᚱ', 's':'ᛊ', 't':'ᛏ', 'u':'ᚢ', 'v':'ᚢ', 'w':'ᚹ', 'x':'ᚲᛊ', 'y':'ᛃ', 'z':'ᛉ', ' ':' '};
    let res = ""; 
    for (let c of text.toLowerCase()) { res += runesMap[c] || c; }
    document.getElementById('rune-display').textContent = res;
};
