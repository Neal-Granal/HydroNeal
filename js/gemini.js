/**
 * Appelle l'API Gemini avec une gestion d'erreur et un fallback
 */
async function callGeminiAPI(prompt) {
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/";
    let model = "gemini-1.5-flash"; // Modèle rapide par défaut
    
    try {
        let response = await fetch(`${baseUrl}${model}:generateContent?key=${CONFIG.API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        // Fallback : Si erreur 404 ou autre, on tente le modèle Pro
        if (!response.ok) {
            console.warn(`Echec ${model}, tentative avec Gemini Pro...`);
            model = "gemini-pro";
            response = await fetch(`${baseUrl}${model}:generateContent?key=${CONFIG.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Erreur inconnue");
        
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Erreur Gemini:", error);
        return null;
    }
}

/**
 * Effet machine à écrire pour le texte généré
 */
function typeWriter(text, elementId) {
    let i = 0; 
    const target = document.getElementById(elementId);
    target.innerHTML = ""; 
    const cleanText = text.replace(/^"|"$/g, '').replace(/\*/g, ''); // Nettoyage
    
    function type() { 
        if (i < cleanText.length) { 
            target.innerHTML += cleanText.charAt(i); 
            i++; 
            setTimeout(type, CONFIG.TYPING_SPEED); 
        } 
    }
    type();
}
