// SCRIPT LIVRE
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (typeof St === 'undefined' || typeof St.PageFlip === 'undefined') throw new Error("Lib Manquante");

        const pageFlip = new St.PageFlip(document.getElementById('book'), {
            width: 480, height: 720,
            size: 'stretch',
            minWidth: 315, maxWidth: 650, minHeight: 450, maxHeight: 950,
            maxShadowOpacity: 0.5, showCover: true, mobileScrollSupport: false 
        });
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        document.body.classList.remove('fallback-mode');

        // Correction pour que les boutons soient cliquables sur mobile sans tourner la page
        const inputs = document.querySelectorAll('input, button');
        inputs.forEach(el => {
            el.addEventListener('touchstart', (e) => e.stopPropagation());
            el.addEventListener('mousedown', (e) => e.stopPropagation());
        });
    } catch(e) { console.log("Mode Fallback"); }
});

// WIDGET SOUNDCLOUD (AUDIO)
var widget;
function startAudioOnFirstClick() {
    var iframe = document.querySelector('#sc-player');
    widget = SC.Widget(iframe);
    widget.setVolume(30);
    widget.play(); 
}

function toggleAudio() {
    if (!widget) widget = SC.Widget(document.querySelector('#sc-player'));
    widget.toggle();
}

// TRADUCTEUR RUNIQUE
const runesMap = {'a':'ᚨ', 'b':'ᛒ', 'c':'ᚲ', 'd':'ᛞ', 'e':'ᛖ', 'f':'ᚠ', 'g':'ᚷ', 'h':'ᚺ', 'i':'ᛁ', 'j':'ᛃ', 'k':'ᚲ', 'l':'ᛚ', 'm':'ᛗ', 'n':'ᚾ', 'o':'ᛟ', 'p':'ᛈ', 'q':'ᚲ', 'r':'ᚱ', 's':'ᛊ', 't':'ᛏ', 'u':'ᚢ', 'v':'ᚢ', 'w':'ᚹ', 'x':'ᚲᛊ', 'y':'ᛃ', 'z':'ᛉ', ' ':' '};
function translateRunes(text) {
    let res = ""; for (let c of text.toLowerCase()) { res += runesMap[c] || c; }
    document.getElementById('rune-display').textContent = res;
}

// API GEMINI (CORRIGÉE & ROBUSTE)
// Clé API : AIzaSyCMfqbhNp1vVVP6gNjNchr_veh7PjyFePI
const apiKey = "AIzaSyCMfqbhNp1vVVP6gNjNchr_veh7PjyFePI"; 

async function callGemini(prompt) {
    // Essai 1 : Modèle standard
    let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        // Essai 2 : Fallback si erreur 404 (Modèle non trouvé)
        if (response.status === 404) {
            console.log("Tentative avec modèle de secours...");
            url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || "Erreur inconnue");
        }
        return data.candidates[0].content.parts[0].text;
    } catch (error) { 
        console.error("Erreur API:", error);
        return "Les esprits sont brouillés... (Erreur API)"; 
    }
}

function typeWriter(text, elementId, speed = 30) {
    let i = 0; const target = document.getElementById(elementId);
    target.innerHTML = ""; const cleanText = text.replace(/^"|"$/g, '').replace(/\*/g, '');
    function type() { if (i < cleanText.length) { target.innerHTML += cleanText.charAt(i); i++; setTimeout(type, speed); } }
    type();
}

async function generateRumor(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    const output = document.getElementById('ai-rumor-zone');
    const loader = document.getElementById('rumor-loader');
    output.style.display = 'none'; loader.style.display = 'block';
    const prompt = "Personnage fantasy ivre taverne. Rumeur courte drôle sur hydromel HydroNeal (salle faïence). Français.";
    const text = await callGemini(prompt);
    loader.style.display = 'none'; output.style.display = 'block';
    typeWriter(text, 'ai-rumor-zone');
}

async function generateLegend(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    const input = document.getElementById('ingredient-input').value;
    if (!input) return;
    const loader = document.getElementById('legend-loader');
    const output = document.getElementById('legend-output');
    loader.style.display = 'block'; output.innerHTML = '';
    const prompt = `Alchimiste médiéval. Ingrédient: "${input}". Nom hydromel épique + desc courte. JSON: {"nom": "...", "description": "..."}`;
    const text = await callGemini(prompt);
    loader.style.display = 'none';
    if (text && text.includes("{")) {
        try {
            // Nettoyage JSON agressif pour éviter les erreurs de format
            const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonStr);
            output.innerHTML = `<h4 style="color:#8a0b0b; border:none; margin:0;">${data.nom}</h4><div style="width:30px; height:2px; background:var(--gold); margin:5px auto;"></div><p id="gen-desc" style="font-size:1em;"></p>`;
            typeWriter(data.description, 'gen-desc', 30);
        } catch (e) { output.innerHTML = text; } // Si JSON rate, on affiche le texte brut
    } else { output.innerHTML = text || "Échec."; }
}
