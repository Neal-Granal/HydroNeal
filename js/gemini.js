/**
 * Gère les interactions avec l'API Google Gemini
 * Utilise 'fetch' pour être compatible avec tous les navigateurs sans installation.
 */

async function callGeminiAPI(prompt) {
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/";
    
    // UTILISATION DU MODÈLE STABLE (1.5 Flash)
    // Ne pas utiliser 'gemini-2.5-flash' ou 'latest' qui peuvent ne pas exister.
    let model = "gemini-1.5-flash"; 
    
    if (typeof CONFIG === 'undefined' || !CONFIG.API_KEY) {
        console.error("ERREUR : Fichier js/config.js manquant ou clé API vide.");
        return "L'Alchimiste a perdu sa clé...";
    }

    let url = `${baseUrl}${model}:generateContent?key=${CONFIG.API_KEY}`;
    
    try {
        console.log(`Appel API vers : ${model}`);
        
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        // FALLBACK : Si le modèle Flash échoue, on tente Gemini Pro (le classique)
        if (!response.ok) {
            console.warn(`Echec ${model} (Code ${response.status}), tentative avec Gemini 1.5 Pro...`);
            model = "gemini-1.5-pro";
            url = `${baseUrl}${model}:generateContent?key=${CONFIG.API_KEY}`;
            
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
        }

        const data = await response.json();
        
        // Gestion détaillée des erreurs renvoyées par Google
        if (!response.ok) {
            console.error("Détail Erreur Google:", data);
            let msg = data.error?.message || "Erreur inconnue";
            throw new Error(msg);
        }
        
        // Vérification que la réponse contient bien du texte
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.warn("Réponse vide ou bloquée par sécurité", data);
            return "Les esprits refusent de répondre (Contenu bloqué).";
        }

    } catch (error) {
        console.error("Erreur Critique JS:", error);
        return `Erreur de communication : ${error.message}`;
    }
}

/**
 * Effet visuel "Machine à écrire"
 */
function typeWriter(text, elementId) {
    let i = 0; 
    const target = document.getElementById(elementId);
    if (!target) return;
    
    target.innerHTML = ""; 
    const cleanText = text.replace(/^"|"$/g, '').replace(/\*/g, ''); // Nettoyage simple
    
    function type() { 
        if (i < cleanText.length) { 
            target.innerHTML += cleanText.charAt(i); 
            i++; 
            setTimeout(type, CONFIG.TYPING_SPEED); 
        } 
    }
    type();
}
