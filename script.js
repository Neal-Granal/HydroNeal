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
        
        // Stop propagation des clics
        document.querySelectorAll('input, button, a').forEach(el => {
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

// Fonction Typewriter améliorée qui cible un élément spécifique
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

// IA Rumeurs (Format Voyageur - JSON Strict)
async function generateRumor(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    
    const out = document.getElementById('ai-rumor-zone');
    const load = document.getElementById('rumor-loader');
    
    out.style.display = 'none'; 
    load.style.display = 'block';
    out.innerHTML = ''; // Nettoyer l'ancienne rumeur
    
    // Prompt demandant du JSON strict pour reproduire le format "Voyageur"
    const prompt = `Incarne un personnage de fantasy (Nain, Elfe, Voleur ou Sorcier) qui vient de goûter l'hydromel HydroNeal.
    Invente UNE SEULE rumeur courte (1 phrase) et drôle ou mystérieuse.
    Réponds UNIQUEMENT en JSON sous ce format :
    {
        "citation": "Le texte de la rumeur ici",
        "auteur": "- Nom du Personnage, Classe"
    }`;
    
    const text = await callBackend(prompt);
    
    load.style.display = 'none'; 
    out.style.display = 'block';

    try {
        // Nettoyage pour extraire le JSON (au cas où l'IA ajoute du texte autour)
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // Construction du HTML identique à l'exemple statique
        const container = document.createElement('div');
        // Style calqué sur l'exemple statique du "vieux voyageur"
        container.style.cssText = "background:rgba(138,11,11,0.05); padding:15px; border-left:4px solid #8a0b0b; margin-bottom:15px;";
        
        // Paragraphe pour la citation (vide pour l'instant, rempli par typeWriter)
        const pQuote = document.createElement('p');
        pQuote.id = "dynamic-quote-text"; // ID pour le typewriter
        pQuote.style.cssText = "margin:0; font-style:italic; font-size:1em;";
        
        // Signature
        const spanAuthor = document.createElement('span');
        spanAuthor.style.cssText = "display:block; text-align:right; font-family:'Cinzel'; color:#b8860b; font-size:0.85em; margin-top:5px;";
        spanAuthor.innerText = data.auteur;

        // Assemblage
        container.appendChild(pQuote);
        container.appendChild(spanAuthor);
        out.appendChild(container);

        // Lancement de l'effet d'écriture sur la citation seulement
        typeWriter(data.citation, "dynamic-quote-text");

    } catch (error) {
        console.error("Erreur parsing JSON Rumeur:", error);
        // Fallback propre
        out.innerHTML = `<p style="color:#5d0000; font-style:italic;">Les esprits murmurent... mais le message est brouillé.<br><small>${text}</small></p>`;
    }
}

// IA Légendes (Recette avec Ingrédients - JSON Strict)
async function generateLegend(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    
    const inp = document.getElementById('ingredient-input').value;
    if(!inp) return;
    
    const load = document.getElementById('legend-loader');
    const out = document.getElementById('legend-output');
    
    load.style.display = 'block'; out.innerHTML = '';
    
    const prompt = `Agis comme un vieil alchimiste. L'utilisateur te donne l'ingrédient principal : "${inp}".
    Crée une recette d'hydromel magique.
    1. Donne un Nom Épique pour la recette.
    2. Liste 3 à 6 ingrédients (mélange de fantastique et commun).
    3. Décris l'effet magique en 2-3 phrases.
    
    Réponds UNIQUEMENT en JSON sous ce format :
    {
        "nom": "Nom de la Recette",
        "ingredients": ["Ingrédient 1", "Ingrédient 2", "Ingrédient 3"],
        "description": "Description de l'effet."
    }`;
    
    const text = await callBackend(prompt);
    
    load.style.display = 'none';
    
    try {
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);
        
        // Construction de la liste HTML pour les ingrédients
        let ingredientsHtml = '<ul style="text-align:left; font-size:0.9em; margin: 15px 0 15px 20px; list-style:none;">';
        data.ingredients.forEach(ing => {
            ingredientsHtml += `<li style="margin-bottom:5px;">• ${ing}</li>`;
        });
        ingredientsHtml += '</ul>';

        out.innerHTML = `
            <h3 style="font-family:'Cinzel Decorative'; color:#8a0b0b; font-size:1.5em; margin-bottom:5px;">${data.nom}</h3>
            <div style="width:50px; height:2px; background:var(--gold); margin:0 auto 10px auto;"></div>
            
            ${ingredientsHtml}
            
            <p id="legend-desc" style="font-size:1em; font-style:italic; border-top:1px dashed #8a0b0b; padding-top:10px; margin-top:10px;"></p>
        `;
        
        // Effet écriture sur la description de l'effet uniquement
        typeWriter(data.description, 'legend-desc');

    } catch (e) {
        console.error("Erreur JSON Legend:", e);
        out.innerHTML = `<p style="color:#5d0000;">L'alchimie a échoué... <br><small>${text}</small></p>`;
    }
}

// --- GESTION AUDIO FIABLE ---
var widget;
function enterSite() {
    const s = document.getElementById('start-screen');
    // Animation de disparition
    s.style.opacity = '0'; 
    setTimeout(() => s.remove(), 1000);
    
    // Lancement du son après interaction utilisateur
    try { 
        widget = SC.Widget(document.querySelector('#sc-player')); 
        widget.setVolume(25); 
        widget.play(); 
    } catch(e){
        console.log("Erreur lecture audio:", e);
    }
}

function toggleAudio() { 
    if(widget) widget.toggle(); 
}

// Exposition Globale
window.generateRumor = generateRumor;
window.generateLegend = generateLegend;
window.enterSite = enterSite;
window.toggleAudio = toggleAudio;
