/**
 * script.js - TOUTE LA LOGIQUE DU SITE
 * Contient : Config, Gemini AI, Livre (PageFlip), Audio, Runes.
 */

// 1. CONFIGURATION
const CONFIG = {
    API_KEY: "AIzaSyCMfqbhNp1vVVP6gNjNchr_veh7PjyFePI", 
    TYPING_SPEED: 30
};

// On importe la librairie Gemini depuis le CDN (nécessite type="module" dans le HTML)
import { GoogleGenerativeAI } from "@google/generative-ai";

// 2. INITIALISATION AU CHARGEMENT
document.addEventListener('DOMContentLoaded', function() {
    console.log("Démarrage du site...");
    initBook();
    initAudioListener();
    
    // Runes
    const runeInput = document.getElementById('rune-input');
    if(runeInput) {
        runeInput.addEventListener('input', (e) => translateRunes(e.target.value));
    }
});

// 3. GESTION DU LIVRE (PageFlip)
function initBook() {
    try {
        if (typeof St === 'undefined' || typeof St.PageFlip === 'undefined') {
            console.warn("PageFlip non chargé. Mode fallback.");
            document.body.classList.add('fallback-mode');
            return;
        }

        const pageFlip = new St.PageFlip(document.getElementById('book'), {
            width: 480, height: 720,
            size: 'stretch',
            minWidth: 315, maxWidth: 650,
            minHeight: 450, maxHeight: 950,
            maxShadowOpacity: 0.5, showCover: true, mobileScrollSupport: false 
        });
        
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        document.body.classList.remove('fallback-mode');

        // Patch Mobile
        document.querySelectorAll('input, button').forEach(el => {
            el.addEventListener('touchstart', (e) => e.stopPropagation());
            el.addEventListener('mousedown', (e) => e.stopPropagation());
        });

    } catch(e) { 
        console.error("Erreur Livre:", e);
        document.body.classList.add('fallback-mode');
    }
}

// 4. AUDIO
let scWidget;
function initAudioListener() {
    const startScreen = document.getElementById('start-screen');
    if(startScreen) {
        const btn = startScreen.querySelector('button');
        if(btn) btn.addEventListener('click', () => {
            startScreen.style.opacity = '0';
            setTimeout(() => startScreen.remove(), 1000);
            try {
                const iframe = document.querySelector('#sc-player');
                if(iframe && typeof SC !== 'undefined') {
                    scWidget = SC.Widget(iframe);
                    scWidget.setVolume(30);
                    scWidget.play();
                }
            } catch(e) { console.warn("Audio error", e); }
        });
    }
}

window.toggleAudio = function() {
    if (!scWidget && typeof SC !== 'undefined') scWidget = SC.Widget(document.querySelector('#sc-player'));
    if(scWidget) scWidget.toggle();
};

// 5. FONCTIONS IA (Gemini)
async function callGemini(prompt) {
    if (!CONFIG.API_KEY) return "Clé API manquante.";
    try {
        const genAI = new GoogleGenerativeAI(CONFIG.API_KEY);
        // Utilisation du modèle 1.5 Flash (Standard actuel)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Erreur Gemini:", error);
        return "Les esprits sont silencieux... (Erreur connexion)";
    }
}

function typeWriter(text, elementId) {
    const target = document.getElementById(elementId);
    if (!target) return;
    target.innerHTML = ""; 
    let i = 0;
    const cleanText = text.replace(/^"|"$/g, '').replace(/\*/g, '');
    function type() { 
        if (i < cleanText.length) { 
            target.innerHTML += cleanText.charAt(i); 
            i++; 
            setTimeout(type, CONFIG.TYPING_SPEED); 
        } 
    }
    type();
}

// Exposé globalement pour les onclick HTML
window.generateRumor = async function(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    const ui = { out: document.getElementById('ai-rumor-zone'), load: document.getElementById('rumor-loader') };
    ui.out.style.display = 'none'; ui.load.style.display = 'block';
    
    const text = await callGemini("Rumeur drôle courte taverne fantasy sur hydromel HydroNeal.");
    
    ui.load.style.display = 'none'; ui.out.style.display = 'block';
    typeWriter(text, 'ai-rumor-zone');
};

window.generateLegend = async function(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    const input = document.getElementById('ingredient-input').value;
    if(!input) return;
    
    const ui = { out: document.getElementById('legend-output'), load: document.getElementById('legend-loader') };
    ui.load.style.display = 'block'; ui.out.innerHTML = '';
    
    const text = await callGemini(`Alchimiste. Ingrédient: "${input}". Nom hydromel épique + desc courte. JSON: {"nom": "...", "description": "..."}`);
    ui.load.style.display = 'none';

    if (text.includes("{")) {
        try {
            const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
            ui.out.innerHTML = `<h4 style="color:#8a0b0b; margin:0;">${json.nom}</h4><p id="gen-desc"></p>`;
            typeWriter(json.description, 'gen-desc');
        } catch(e) { ui.out.innerHTML = text; }
    } else { ui.out.innerHTML = "Échec transmutation."; }
};

// 6. RUNES
window.translateRunes = function(text) {
    const map = {'a':'ᚨ', 'b':'ᛒ', 'c':'ᚲ', 'd':'ᛞ', 'e':'ᛖ', 'f':'ᚠ', 'g':'ᚷ', 'h':'ᚺ', 'i':'ᛁ', 'j':'ᛃ', 'k':'ᚲ', 'l':'ᛚ', 'm':'ᛗ', 'n':'ᚾ', 'o':'ᛟ', 'p':'ᛈ', 'q':'ᚲ', 'r':'ᚱ', 's':'ᛊ', 't':'ᛏ', 'u':'ᚢ', 'v':'ᚢ', 'w':'ᚹ', 'x':'ᚲᛊ', 'y':'ᛃ', 'z':'ᛉ', ' ':' '};
    let res = ""; 
    for (let c of text.toLowerCase()) { res += map[c] || c; }
    const disp = document.getElementById('rune-display');
    if(disp) disp.textContent = res;
};
