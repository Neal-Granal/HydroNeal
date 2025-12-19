/**
 * script.js - Logique Principale
 */

// CONFIGURATION
const apiKey = "AIzaSyCMfqbhNp1vVVP6gNjNchr_veh7PjyFePI"; 
const TYPING_SPEED = 30;

// --- API GEMINI (Version FETCH Standard) ---
// Cette version n'utilise pas "import" pour éviter les erreurs de module sur certains navigateurs/serveurs simples.
async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erreur API:", errorData);
            throw new Error(`Erreur ${response.status}: ${errorData.error?.message || 'Inconnue'}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Erreur Appel Gemini:", error);
        return "Les esprits sont silencieux... (Erreur de connexion)";
    }
}

// --- EFFET MACHINE À ÉCRIRE ---
function typeWriter(text, elementId) {
    const target = document.getElementById(elementId);
    if (!target) return;
    
    target.innerHTML = ""; 
    let i = 0;
    // Nettoyage des caractères Markdown (*) et guillemets
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

// --- FONCTIONS BOUTONS ---
// Rumeurs
async function generateRumor(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    
    const output = document.getElementById('ai-rumor-zone');
    const loader = document.getElementById('rumor-loader');
    
    output.style.display = 'none'; 
    loader.style.display = 'block';
    loader.innerText = "... Invocation ...";

    const prompt = "Personnage fantasy ivre taverne. Rumeur courte drôle sur hydromel HydroNeal. Français.";
    const text = await callGemini(prompt);
    
    loader.style.display = 'none'; 
    output.style.display = 'block';
    
    typeWriter(text, 'ai-rumor-zone');
}

// Légendes (JSON)
async function generateLegend(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    
    const input = document.getElementById('ingredient-input').value;
    if (!input) return;
    
    const loader = document.getElementById('legend-loader');
    const output = document.getElementById('legend-output');
    
    loader.style.display = 'block'; 
    loader.innerText = "... Transmutation ...";
    output.innerHTML = '';
    
    const prompt = `Alchimiste médiéval. Ingrédient: "${input}". Nom hydromel épique + desc courte. JSON: {"nom": "...", "description": "..."}`;
    const text = await callGemini(prompt);
    
    loader.style.display = 'none';

    if (text.includes("{")) {
        try {
            const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonStr);
            output.innerHTML = `<h4 style="color:#8a0b0b; margin:0;">${data.nom}</h4><p id="gen-desc" style="font-size:1em;"></p>`;
            typeWriter(data.description, 'gen-desc');
        } catch (e) { 
            output.innerHTML = text; 
        }
    } else { 
        output.innerHTML = "Échec de la transmutation."; 
    }
}

// --- INITIALISATION DU SITE ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("HydroNeal v3.0 - Chargé");
    
    // 1. LIVRE (PageFlip)
    try {
        if (typeof St === 'undefined' || typeof St.PageFlip === 'undefined') {
            console.warn("PageFlip non chargé.");
            document.body.classList.add('fallback-mode');
        } else {
            const pageFlip = new St.PageFlip(document.getElementById('book'), {
                width: 480, height: 720,
                size: 'stretch',
                minWidth: 315, maxWidth: 650, minHeight: 450, maxHeight: 950,
                maxShadowOpacity: 0.5, showCover: true, mobileScrollSupport: false 
            });
            pageFlip.loadFromHTML(document.querySelectorAll('.page'));
            document.body.classList.remove('fallback-mode');
            
            // Patch Mobile
            document.querySelectorAll('input, button').forEach(el => {
                el.addEventListener('touchstart', (e) => e.stopPropagation());
                el.addEventListener('mousedown', (e) => e.stopPropagation());
            });
        }
    } catch(e) { console.error(e); }

    // 2. RUNES
    const runeInput = document.getElementById('rune-input');
    if(runeInput) {
        const runesMap = {'a':'ᚨ', 'b':'ᛒ', 'c':'ᚲ', 'd':'ᛞ', 'e':'ᛖ', 'f':'ᚠ', 'g':'ᚷ', 'h':'ᚺ', 'i':'ᛁ', 'j':'ᛃ', 'k':'ᚲ', 'l':'ᛚ', 'm':'ᛗ', 'n':'ᚾ', 'o':'ᛟ', 'p':'ᛈ', 'q':'ᚲ', 'r':'ᚱ', 's':'ᛊ', 't':'ᛏ', 'u':'ᚢ', 'v':'ᚢ', 'w':'ᚹ', 'x':'ᚲᛊ', 'y':'ᛃ', 'z':'ᛉ', ' ':' '};
        runeInput.addEventListener('input', function(e) {
            let res = ""; 
            for (let c of e.target.value.toLowerCase()) { res += runesMap[c] || c; }
            document.getElementById('rune-display').textContent = res;
        });
    }
});

// --- AUDIO ---
var widget;
function enterSite() {
    const s = document.getElementById('start-screen');
    s.style.opacity = '0';
    setTimeout(() => s.remove(), 1000);
    
    // Tentative lecture audio
    try {
        const iframe = document.querySelector('#sc-player');
        widget = SC.Widget(iframe);
        widget.setVolume(30);
        widget.play();
    } catch(e) { console.log("Audio auto-play bloqué"); }
}

function toggleAudio() {
    if (!widget) widget = SC.Widget(document.querySelector('#sc-player'));
    widget.toggle();
}

// Exposer les fonctions au HTML
window.generateRumor = generateRumor;
window.generateLegend = generateLegend;
window.enterSite = enterSite;
window.toggleAudio = toggleAudio;
