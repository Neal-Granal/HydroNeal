// On importe la librairie officielle Google
import { GoogleGenerativeAI } from "@google/generative-ai";

// Fonction d'initialisation de l'IA
function getGenAI() {
    if (typeof CONFIG === 'undefined' || !CONFIG.API_KEY) {
        alert("ERREUR CRITIQUE : Clé API manquante dans js/config.js");
        return null;
    }
    return new GoogleGenerativeAI(CONFIG.API_KEY);
}

// Fonction générique pour appeler Gemini
async function callGeminiSDK(prompt) {
    const genAI = getGenAI();
    if (!genAI) return "Erreur Configuration";

    try {
        // On utilise le modèle Pro par défaut via le SDK, c'est souvent plus simple
        // Le SDK gère lui-même les URLs et les versions
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return text;
    } catch (error) {
        console.error("Erreur Gemini SDK:", error);
        return "Les esprits sont brouillés... (Erreur connexion)";
    }
}

// Effet Machine à écrire
function typeWriter(text, elementId) {
    let i = 0; 
    const target = document.getElementById(elementId);
    if (!target) return;
    
    target.innerHTML = ""; 
    const cleanText = text.replace(/^"|"$/g, '').replace(/\*/g, '');
    
    function type() { 
        if (i < cleanText.length) { 
            target.innerHTML += cleanText.charAt(i); 
            i++; 
            const speed = (typeof CONFIG !== 'undefined' && CONFIG.TYPING_SPEED) ? CONFIG.TYPING_SPEED : 30;
            setTimeout(type, speed); 
        } 
    }
    type();
}

// --- FONCTIONS EXPOSÉES AU HTML (window) ---

window.generateRumor = async function(e) {
    if(e) { e.stopPropagation(); e.preventDefault(); }
    
    const ui = {
        output: document.getElementById('ai-rumor-zone'),
        loader: document.getElementById('rumor-loader')
    };

    ui.output.style.display = 'none'; 
    ui.loader.style.display = 'block';

    const prompt = "Personnage fantasy ivre taverne. Rumeur courte drôle sur hydromel HydroNeal. Français.";
    const text = await callGeminiSDK(prompt); 

    ui.loader.style.display = 'none'; 
    ui.output.style.display = 'block';
    
    typeWriter(text, 'ai-rumor-zone');
};

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
    const rawText = await callGeminiSDK(prompt);

    ui.loader.style.display = 'none';

    if (rawText && rawText.includes("{")) {
        try {
            const jsonStr = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonStr);
            
            ui.output.innerHTML = `<h4 style="color:#8a0b0b; margin:0;">${data.nom}</h4><p id="gen-desc" style="font-size:1em;"></p>`;
            typeWriter(data.description, 'gen-desc');
        } catch (e) { 
            console.error("Erreur parsing JSON", e);
            ui.output.innerHTML = rawText; 
        }
    } else { 
        ui.output.innerHTML = "La transmutation a échoué."; 
    }
};
