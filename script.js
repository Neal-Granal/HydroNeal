/**
 * script.js - Logique consolidée
 * Utilise maintenant un backend sécurisé pour l'IA.
 */

// --- CONFIGURATION ---
// IMPORTANT : Remplace cette URL par celle de ton backend une fois déployé (ex: https://mon-projet.onrender.com/generate)
const BACKEND_URL = "https://backend-hydroneal.onrender.com"; 
const TYPING_SPEED = 30;

// Note: On n'importe plus GoogleGenerativeAI ici car c'est le backend qui gère ça.

// --- 1. INITIALISATION ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("Site HydroNeal initialisé.");
    initBook();
    initAudioListener();
    
    // Runes
    const runeInput = document.getElementById('rune-input');
    if(runeInput) {
        runeInput.addEventListener('input', (e) => translateRunes(e.target.value));
    }
});

// --- 2. FONCTION APPEL BACKEND ---
async function callBackend(promptData) {
    // Si l'URL n'est pas encore configurée
    if (BACKEND_URL.includes("VOTRE-URL-BACKEND-ICI")) {
        console.error("URL Backend non configurée dans script.js");
        return "Le grimoire n'est pas encore relié aux esprits (Backend non configuré).";
    }

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptData })
        });

        if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
        
        const data = await response.json();
        // Le backend doit renvoyer un objet JSON avec une propriété "text" ou "reply"
        return data.text || data.reply || "Réponse vide des esprits.";

    } catch (error) {
        console.error("Erreur Backend:", error);
        return "Les esprits sont silencieux... (Erreur connexion serveur)";
    }
}

// --- 3. FONCTIONS UTILISATEURS (Rumeurs & Légendes) ---
window.generateRumor = async function(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    
    const ui = { out: document.getElementById('ai-rumor-zone'), loader: document.getElementById('rumor-loader') };
    ui.out.style.display = 'none'; ui.loader.style.display = 'block';
    
    // On envoie juste l'instruction au backend
    const text = await callBackend("Personnage fantasy ivre taverne. Rumeur courte drôle sur hydromel HydroNeal. En français.");
    
    ui.loader.style.display = 'none'; ui.out.style.display = 'block';
    typeWriter(text, 'ai-rumor-zone');
};

window.generateLegend = async function(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    const input = document.getElementById('ingredient-input').value;
    if(!input) return;
    
    const ui = { out: document.getElementById('legend-output'), loader: document.getElementById('legend-loader') };
    ui.loader.style.display = 'block'; ui.out.innerHTML = '';
    
    // Le prompt complet est envoyé au backend
    const prompt = `Alchimiste médiéval. Ingrédient: "${input}". Nom hydromel épique + desc courte. Format JSON: {"nom": "...", "description": "..."}`;
    const text = await callBackend(prompt);
    
    ui.loader.style.display = 'none';

    // Parsing du résultat (le backend renvoie du texte, parfois du JSON brut)
    if (text.includes("{")) {
        try {
            const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonStr);
            ui.out.innerHTML = `<h4 style="color:#8a0b0b; margin:0;">${data.nom}</h4><p id="gen-desc" style="font-size:1em;"></p>`;
            typeWriter(data.description, 'gen-desc');
        } catch(e) { ui.out.innerHTML = text; }
    } else { ui.out.innerHTML = text; }
};

// --- 4. UTILITAIRES (Machine à écrire, Audio, Livre...) ---
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
            setTimeout(type, TYPING_SPEED); 
        } 
    }
    type();
}

// Gestion Livre (PageFlip)
function initBook() {
    try {
        if (typeof St === 'undefined' || typeof St.PageFlip === 'undefined') {
            document.body.classList.add('fallback-mode'); return;
        }
        const pageFlip = new St.PageFlip(document.getElementById('book'), {
            width: 480, height: 720, size: 'stretch', minWidth: 315, maxWidth: 650, minHeight: 450, maxHeight: 950,
            maxShadowOpacity: 0.5, showCover: true, mobileScrollSupport: false 
        });
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        document.body.classList.remove('fallback-mode');
        document.querySelectorAll('input, button').forEach(el => {
            el.addEventListener('touchstart', (e) => e.stopPropagation());
            el.addEventListener('mousedown', (e) => e.stopPropagation());
        });
    } catch(e) { document.body.classList.add('fallback-mode'); }
}

// Audio
let scWidget;
function initAudioListener() {
    const startScreen = document.getElementById('start-screen');
    if(startScreen) {
        const btn = startScreen.querySelector('button');
        if(btn) btn.addEventListener('click', () => {
            startScreen.style.opacity = '0';
            setTimeout(() => { if(startScreen.parentNode) startScreen.parentNode.removeChild(startScreen); }, 1000);
            try {
                const iframe = document.querySelector('#sc-player');
                if(iframe && typeof SC !== 'undefined') { scWidget = SC.Widget(iframe); scWidget.setVolume(30); scWidget.play(); }
            } catch(e) {}
        });
    }
}
window.toggleAudio = function() {
    if (!scWidget && typeof SC !== 'undefined') scWidget = SC.Widget(document.querySelector('#sc-player'));
    if(scWidget) scWidget.toggle();
};
window.enterSite = function() { document.getElementById('start-screen').querySelector('button').click(); };

// Runes
function translateRunes(text) {
    const map = {'a':'ᚨ', 'b':'ᛒ', 'c':'ᚲ', 'd':'ᛞ', 'e':'ᛖ', 'f':'ᚠ', 'g':'ᚷ', 'h':'ᚺ', 'i':'ᛁ', 'j':'ᛃ', 'k':'ᚲ', 'l':'ᛚ', 'm':'ᛗ', 'n':'ᚾ', 'o':'ᛟ', 'p':'ᛈ', 'q':'ᚲ', 'r':'ᚱ', 's':'ᛊ', 't':'ᛏ', 'u':'ᚢ', 'v':'ᚢ', 'w':'ᚹ', 'x':'ᚲᛊ', 'y':'ᛃ', 'z':'ᛉ', ' ':' '};
    let res = ""; for (let c of text.toLowerCase()) { res += map[c] || c; }
    document.getElementById('rune-display').textContent = res;
}
