
async function callGeminiAPI(prompt) {
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/";
    // Correction: utilisation de 'latest' pour v1beta
    let model = "gemini-1.5-flash-latest"; 
    
    // Construction de l'URL initiale
    let url = `${baseUrl}${model}:generateContent?key=${CONFIG.API_KEY}`;
    
    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        // FALLBACK : Si le modèle Flash échoue (ex: 404), on tente le modèle Pro standard
        if (response.status === 404 || !response.ok) {
            console.warn(`Echec ${model} (${response.status}), tentative avec Gemini Pro...`);
            model = "gemini-pro";
            url = `${baseUrl}${model}:generateContent?key=${CONFIG.API_KEY}`;
            
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || "Erreur API inconnue");
        }
        
        // Extraction du texte
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Erreur Critique Gemini:", error);
        return null;
    }
}

/**
 * Effet visuel "Machine à écrire"
 * @param {string} text - Le texte à afficher
 * @param {string} elementId - L'ID de l'élément HTML cible
 */
function typeWriter(text, elementId) {
    let i = 0; 
    const target = document.getElementById(elementId);
    if (!target) return;
    
    target.innerHTML = ""; 
    // Nettoyage des guillemets et astérisques Markdown
    const cleanText = text.replace(/^"|"$/g, '').replace(/\*/g, ''); 
    
    function type() { 
        if (i < cleanText.length) { 
            target.innerHTML += cleanText.charAt(i); 
            i++; 
            setTimeout(type, CONFIG.TYPING_SPEED); 
        } 
    }
    type();
}
