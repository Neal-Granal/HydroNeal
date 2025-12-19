// --- SCRIPT LIVRE ---
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (typeof St === 'undefined' || typeof St.PageFlip === 'undefined') throw new Error("Lib Manquante");
        const pageFlip = new St.PageFlip(document.getElementById('book'), {
            width: 400, height: 600, size: 'stretch',
            minWidth: 315, maxWidth: 600, minHeight: 450, maxHeight: 900,
            maxShadowOpacity: 0.5, showCover: true, mobileScrollSupport: false 
        });
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        document.body.classList.remove('fallback-mode');
        document.querySelectorAll('input, button').forEach(el => {
            el.addEventListener('touchstart', (e) => e.stopPropagation());
            el.addEventListener('mousedown', (e) => e.stopPropagation());
        });
    } catch(e) { console.log("Mode Fallback"); }
});

// --- SCRIPT IA (Direct avec clé API) ---
const apiKey = "AIzaSyBjU1MpF7fGQEvlkcqhRvUliiwzr9oUKsg"; 

// Utilisation du modèle gemini-2.5-flash comme demandé
async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        // Fallback si 2.5-flash ne marche pas
        if (response.status === 404) {
            console.log("Fallback Gemini 1.5 Flash");
            const url2 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const res2 = await fetch(url2, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data2 = await res2.json();
            return data2.candidates[0].content.parts[0].text;
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error(error);
        return "Les esprits sont brouillés... (Erreur API)";
    }
}

function typeWriter(text, elementId) {
    const t = document.getElementById(elementId); t.innerHTML = "";
    let i = 0; const clean = text.replace(/\*/g, '');
    function type() { if(i<clean.length) { t.innerHTML += clean.charAt(i); i++; setTimeout(type, 30); } }
    type();
}

async function generateRumor(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    const out = document.getElementById('ai-rumor-zone');
    const load = document.getElementById('rumor-loader');
    out.style.display = 'none'; load.style.display = 'block';
    const txt = await callGemini("Rumeur drôle courte taverne fantasy sur hydromel HydroNeal. Français.");
    load.style.display = 'none'; out.style.display = 'block';
    typeWriter(txt, 'ai-rumor-zone');
}

async function generateLegend(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    const inp = document.getElementById('ingredient-input').value;
    if(!inp) return;
    const load = document.getElementById('legend-loader');
    const out = document.getElementById('legend-output');
    load.style.display = 'block'; out.innerHTML = '';
    const txt = await callGemini(`Alchimiste. Ingrédient: "${inp}". Nom hydromel épique + desc courte.`);
    load.style.display = 'none';
    out.innerText = txt;
}

// --- AUDIO ---
var widget;
function enterSite() {
    const s = document.getElementById('start-screen');
    s.style.opacity = '0';
    setTimeout(() => s.remove(), 1000);
    try {
        const iframe = document.querySelector('#sc-player');
        widget = SC.Widget(iframe);
        widget.setVolume(30);
        widget.play();
    } catch(e) {}
}
function toggleAudio() {
    if (!widget) widget = SC.Widget(document.querySelector('#sc-player'));
    widget.toggle();
}

// Exposer globalement pour le HTML
window.generateRumor = generateRumor;
window.generateLegend = generateLegend;
window.enterSite = enterSite;
window.toggleAudio = toggleAudio;
