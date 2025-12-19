/**
 * Gère les interactions avec l'API Google Gemini
 */

async function callGeminiAPI(prompt) {
    // URL de base standard
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/";
    
    // Modèle stable.
    let model = "gemini-1.5-flash"; 
    
    if (typeof CONFIG === 'undefined' || !CONFIG.API_KEY) {
        alert("ERREUR CRITIQUE : Fichier js/config.js manquant ou clé API vide.");
        return "Erreur config...";
    }

    let url = `${baseUrl}${model}:generateContent?key=${CONFIG.API_KEY}`;
    
    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        // Gestion explicite des erreurs pour t'aider à débugger
        if (!response.ok) {
            const errorData = await response.json();
            console.error("ERREUR GOOGLE:", errorData);
            
            // Si erreur 404, on tente le modèle Pro en secours
            if (response.status === 404) {
                console.warn("Flash indisponible, tentative Gemini Pro...");
                model = "gemini-1.5-pro";
                url = `${baseUrl}${model}:generateContent?key=${CONFIG.API_KEY}`;
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
            } else {
                // Autre erreur (ex: clé invalide)
                alert(`Erreur API (${response.status}): ${errorData.error?.message || "Erreur inconnue"}`);
                return "Les esprits sont en colère (Erreur API).";
            }
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Les esprits restent silencieux.";
        }

    } catch (error) {
        console.error("Erreur JS:", error);
        alert("Erreur de connexion. Vérifiez votre internet ou la console.");
        return "Erreur de connexion.";
    }
}

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
            setTimeout(type, 30); 
        } 
    }
    type();
}
