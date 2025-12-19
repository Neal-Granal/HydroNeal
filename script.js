// URL Backend Render
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
            maxShadowOpacity: 0.5, 
            showCover: true, 
            mobileScrollSupport: false
        });

        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
        document.body.classList.remove('fallback-mode');
        
        // Stop propagation des clics pour les inputs, boutons ET IMAGES (Zoom)
        // Cela empêche de tourner la page quand on clique sur ces éléments
        document.querySelectorAll('input, button, a, .label-img, .beast-img').forEach(el => {
            el.addEventListener('touchstart', (e) => {
                e.stopPropagation(); 
                // Important : on ne met pas preventDefault() pour que le 'click' fonctionne
            });
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

// --- ZOOM FUNCTION ---
function zoomImage(src, captionText) {
    const modal = document.getElementById('zoom-modal');
    const modalImg = document.getElementById('img-in-modal');
    const caption = document.getElementById('caption');
    
    modal.style.display = "flex"; // Utilisation de flex pour centrer
    modalImg.src = src;
    caption.innerHTML = captionText || "";
}

function closeZoom() {
    document.getElementById('zoom-modal').style.display = "none";
}

// Appel Backend
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
    const clean = text.replace(/^"|"$/g, '').replace(/\*/g, '');
    
    function type() { 
        if(i < clean.length) { 
            t.innerHTML += clean.charAt(i); 
            i++; 
            setTimeout(type, TYPING_SPEED); 
        } 
    }
    type();
}

async function generateRumor(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    const out = document.getElementById('ai-rumor-zone');
    const load = document.getElementById('rumor-loader');
    out.style.display = 'none'; load.style.display = 'block';
    out.innerHTML = ''; 
    const prompt = `Incarne un personnage de fantasy (Nain, Elfe, Voleur ou Sorcier) qui vient de goûter l'hydromel HydroNeal. Invente UNE SEULE rumeur courte (1 phrase) et drôle ou mystérieuse. Réponds UNIQUEMENT en JSON sous ce format : { "citation": "Le texte de la rumeur ici", "auteur": "- Nom du Personnage, Classe" }`;
    const text = await callBackend(prompt);
    load.style.display = 'none'; out.style.display = 'block';
    try {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);
        const container = document.createElement('div');
        container.style.cssText = "background:rgba(138,11,11,0.05); padding:15px; border-left:4px solid #8a0b0b; margin-bottom:15px;";
        const pQuote = document.createElement('p');
        pQuote.id = "dynamic-quote-text"; pQuote.style.cssText = "margin:0; font-style:italic; font-size:1em;";
        const spanAuthor = document.createElement('span');
        spanAuthor.style.cssText = "display:block; text-align:right; font-family:'Cinzel'; color:#b8860b; font-size:0.85em; margin-top:5px;";
        spanAuthor.innerText = data.auteur;
        container.appendChild(pQuote);
        container.appendChild(spanAuthor);
        out.appendChild(container);
        typeWriter(data.citation, "dynamic-quote-text");
    } catch (error) {
        out.innerHTML = `<p style="color:#5d0000; font-style:italic;">Les esprits murmurent... mais le message est brouillé.<br><small>${text}</small></p>`;
    }
}

async function generateLegend(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    const inp = document.getElementById('ingredient-input').value;
    if(!inp) return;
    const load = document.getElementById('legend-loader');
    const out = document.getElementById('legend-output');
    load.style.display = 'block'; out.innerHTML = '';
    const prompt = `Agis comme un vieil alchimiste. L'utilisateur te donne l'ingrédient principal : "${inp}". Crée une recette d'hydromel magique. 1. Donne un Nom Épique pour la recette. 2. Liste 3 à 6 ingrédients (mélange de fantastique et commun). 3. Décris l'effet magique en une phrase courte. Réponds UNIQUEMENT en JSON sous ce format : { "nom": "Nom de la Recette", "ingredients": ["Ingrédient 1", "Ingrédient 2", "Ingrédient 3"], "description": "Description de l'effet." }`;
    const text = await callBackend(prompt);
    load.style.display = 'none';
    try {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);
        let ingredientsHtml = '<ul style="text-align:left; font-size:0.9em; margin: 15px 0 15px 20px; list-style:none;">';
        data.ingredients.forEach(ing => { ingredientsHtml += `<li style="margin-bottom:5px;">• ${ing}</li>`; });
        ingredientsHtml += '</ul>';
        out.innerHTML = `<h3 style="font-family:'Cinzel Decorative'; color:#8a0b0b; font-size:1.5em; margin-bottom:5px;">${data.nom}</h3><div style="width:50px; height:2px; background:var(--gold); margin:0 auto 10px auto;"></div>${ingredientsHtml}<p id="legend-desc" style="font-size:1em; font-style:italic; border-top:1px dashed #8a0b0b; padding-top:10px; margin-top:10px;"></p>`;
        typeWriter(data.description, 'legend-desc');
    } catch (e) {
        out.innerHTML = `<p style="color:#5d0000;">L'alchimie a échoué... <br><small>${text}</small></p>`;
    }
}

var widget;
function enterSite() {
    const s = document.getElementById('start-screen');
    s.style.opacity = '0'; setTimeout(() => s.remove(), 1000);
    try { widget = SC.Widget(document.querySelector('#sc-player')); widget.setVolume(20); widget.play(); } catch(e){}
}
function toggleAudio() { if(widget) widget.toggle(); }

window.generateRumor = generateRumor;
window.generateLegend = generateLegend;
window.enterSite = enterSite;
window.toggleAudio = toggleAudio;
window.zoomImage = zoomImage;
window.closeZoom = closeZoom;
