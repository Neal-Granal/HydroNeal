// URL Backend Render (NE PAS TOUCHER)
const BACKEND_URL = "https://backend-hydroneal.onrender.com/generate"; 
const TYPING_SPEED = 30;

let pageFlip;
document.addEventListener('DOMContentLoaded', function() {
    try {
        const bookEl = document.getElementById('book');
        if (typeof St === 'undefined') throw new Error("Lib Manquante");

        pageFlip = new St.PageFlip(bookEl, {
            width: 480, height: 720, size: 'stretch',
            minWidth: 315, maxWidth: 650, 
            minHeight: 450, maxHeight: 950,
            maxShadowOpacity: 0.5, showCover: true, mobileScrollSupport: false
        });

        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        document.body.classList.remove('fallback-mode');
        
        // Stop propagation des clics pour les inputs/boutons
        document.querySelectorAll('input, button').forEach(el => {
            el.addEventListener('touchstart', (e) => e.stopPropagation());
            el.addEventListener('mousedown', (e) => e.stopPropagation());
            el.addEventListener('click', (e) => e.stopPropagation());
        });

    } catch(e) { console.error("Mode Fallback:", e); }
    
    // Runes
    const runeInput = document.getElementById('rune-input');
    if(runeInput) {
        const runesMap = {'a':'ᚨ', 'b':'ᛒ', 'c':'ᚲ', 'd':'ᛞ', 'e':'ᛖ', 'f':'ᚠ', 'g':'ᚷ', 'h':'ᚺ', 'i':'ᛁ', 'j':'ᛃ', 'k':'ᚲ', 'l':'ᛚ', 'm':'ᛗ', 'n':'ᚾ', 'o':'ᛟ', 'p':'ᛈ', 'q':'ᚲ', 'r':'ᚱ', 's':'ᛊ', 't':'ᛏ', 'u':'ᚢ', 'v':'ᚢ', 'w':'ᚹ', 'x':'ᚲᛊ', 'y':'ᛃ', 'z':'ᛉ', ' ':' '};
        runeInput.addEventListener('input', e => {
            let res = ""; 
            for(let c of e.target.value.toLowerCase()) res += runesMap[c] || c;
            document.getElementById('rune-display').textContent = res;
        });
    }
});

// Fonction Appel Backend (RESTÉE INCHANGÉE)
async function callBackend(prompt) {
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
        return "Les esprits sont silencieux... (Le serveur dort peut-être)";
    }
}

function typeWriter(text, elementId) {
    const t = document.getElementById(elementId);
    if (!t) return;
    t.innerHTML = ""; 
    let i = 0; 
    const clean = text.replace(/^"|"$/g, '').replace(/\*\*/g, '');
    function type() { 
        if(i < clean.length) { 
            t.innerHTML += clean.charAt(i); 
            i++; 
            setTimeout(type, TYPING_SPEED); 
        } 
    }
    type();
}

// --- NOUVEAU PROMPT RUMEURS ---
async function generateRumor(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    
    const out = document.getElementById('ai-rumor-zone');
    const load = document.getElementById('rumor-loader');
    
    out.style.display = 'none'; load.style.display = 'block';
    
    // PROMPT MODIFIÉ SELON LA DEMANDE : "Commentaire avec un nom"
    const prompt = "Incarne un personnage de fantasy (Nain, Elfe, Voleur ou Sorcier) qui vient de goûter l'hydromel HydroNeal. Écris une critique courte (1 phrase) et drôle ou mystérieuse. Termine OBLIGATOIREMENT par : ' - [Nom du Personnage]'. Exemple: 'Par la barbe de mon grand-père, ça réchauffe les os ! - Gimli'.";
    
    const text = await callBackend(prompt);
    
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
    
    const prompt = `Agis comme un vieil alchimiste. L'utilisateur te donne l'ingrédient : "${inp}". Invente un nom d'hydromel épique utilisant cet ingrédient et une courte description (2 phrases max) de ses effets magiques.`;
    
    const text = await callBackend(prompt);
    
    load.style.display = 'none';
    out.innerText = text;
}

// Audio
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
