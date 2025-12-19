/**
 * script.js - Frontend sécurisé
 */

// --- CONFIGURATION ---
// Une fois déployé sur Render, collez l'URL ici !
// Exemple : const BACKEND_URL = "https://hydroneal-backend-xyz.onrender.com/generate";
const BACKEND_URL = "https://backend-hydroneal.onrender.com"; 
const TYPING_SPEED = 30;

// --- FONCTIONS IA (Via Backend) ---
async function callBackend(prompt) {
    if (BACKEND_URL.includes("VOTRE_URL_RENDER_ICI")) {
        alert("Erreur: L'URL du backend n'est pas configurée dans script.js !");
        return "Backend non relié.";
    }

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const data = await response.json();
        return data.text || "Réponse vide.";

    } catch (error) {
        console.error("Erreur Backend:", error);
        return "Les esprits sont silencieux... (Erreur Serveur)";
    }
}

// --- UTILITAIRES ---
function typeWriter(text, elementId) {
    const t = document.getElementById(elementId);
    if (!t) return;
    t.innerHTML = ""; 
    let i = 0; const clean = text.replace(/^"|"$/g, '').replace(/\*/g, '');
    function type() { if(i < clean.length) { t.innerHTML += clean.charAt(i); i++; setTimeout(type, TYPING_SPEED); } }
    type();
}

async function generateRumor(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    const out = document.getElementById('ai-rumor-zone');
    const load = document.getElementById('rumor-loader');
    out.style.display = 'none'; load.style.display = 'block';
    
    const text = await callBackend("Rumeur drôle et courte sur l'hydromel HydroNeal.");
    
    load.style.display = 'none'; out.style.display = 'block';
    typeWriter(text, 'ai-rumor-zone');
}

async function generateLegend(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    const inp = document.getElementById('ingredient-input').value;
    if(!inp) return;
    
    const load = document.getElementById('legend-loader');
    const out = document.getElementById('legend-output');
    load.style.display = 'block'; out.innerHTML = '';
    
    const text = await callBackend(`Alchimiste. Ingrédient: "${inp}". Nom hydromel épique + desc.`);
    
    load.style.display = 'none';
    out.innerText = text;
}

// --- INIT LIVRE & AUDIO ---
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (typeof St === 'undefined') throw new Error("Lib Manquante");
        const pageFlip = new St.PageFlip(document.getElementById('book'), {
            width: 480, height: 720, size: 'stretch',
            minWidth: 315, maxWidth: 650, minHeight: 450, maxHeight: 950,
            maxShadowOpacity: 0.5, showCover: true, mobileScrollSupport: false 
        });
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        document.body.classList.remove('fallback-mode');
        document.querySelectorAll('input, button').forEach(el => {
            el.addEventListener('touchstart', (e) => e.stopPropagation());
            el.addEventListener('mousedown', (e) => e.stopPropagation());
        });
    } catch(e) { console.log("Mode Fallback"); }
    
    // Runes
    const runeInput = document.getElementById('rune-input');
    if(runeInput) {
        const runesMap = {'a':'ᚨ', 'b':'ᛒ', 'c':'ᚲ', 'd':'ᛞ', 'e':'ᛖ', 'f':'ᚠ', 'g':'ᚷ', 'h':'ᚺ', 'i':'ᛁ', 'j':'ᛃ', 'k':'ᚲ', 'l':'ᛚ', 'm':'ᛗ', 'n':'ᚾ', 'o':'ᛟ', 'p':'ᛈ', 'q':'ᚲ', 'r':'ᚱ', 's':'ᛊ', 't':'ᛏ', 'u':'ᚢ', 'v':'ᚢ', 'w':'ᚹ', 'x':'ᚲᛊ', 'y':'ᛃ', 'z':'ᛉ', ' ':' '};
        runeInput.addEventListener('input', e => {
            let res = ""; for(let c of e.target.value.toLowerCase()) res += runesMap[c] || c;
            document.getElementById('rune-display').textContent = res;
        });
    }
});

var widget;
function enterSite() {
    const s = document.getElementById('start-screen');
    s.style.opacity = '0'; setTimeout(() => s.remove(), 1000);
    try { widget = SC.Widget(document.querySelector('#sc-player')); widget.setVolume(30); widget.play(); } catch(e){}
}
function toggleAudio() { if(widget) widget.toggle(); }

window.generateRumor = generateRumor;
window.generateLegend = generateLegend;
window.enterSite = enterSite;
window.toggleAudio = toggleAudio;
