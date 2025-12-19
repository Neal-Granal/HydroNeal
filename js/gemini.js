/**
 * Gère les interactions avec l'API Google Gemini
 */

async function callGeminiAPI(prompt) {
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/";
    
    // 1. TENTATIVE PRINCIPALE : gemini-2.5-flash (Comme demandé)
    let model = "gemini-2.5-flash"; 
    
    if (typeof CONFIG === 'undefined' || !CONFIG.API_KEY) {
        alert("ERREUR CRITIQUE : Fichier js/config.js manquant ou clé API vide.");
        return "Erreur config...";
    }

    let url = `${baseUrl}${model}:generateContent?key=${CONFIG.API_KEY}`;
    
    try {
        console.log(`Tentative appel API avec : ${model}`);
        
        let response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        // GESTION DES ERREURS & FALLBACKS (Secours)
        if (!response.ok) {
            console.warn(`Échec de ${model} (${response.status}). Bascule sur les modèles de secours...`);
            
            // 2. PREMIER SECOURS : gemini-1.5-flash (Le standard rapide)
            model = "gemini-1.5-flash";
            url = `${baseUrl}${model}:generateContent?key=${CONFIG.API_KEY}`;
            console.log(`Tentative de secours avec : ${model}`);
            
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            // 3. DERNIER SECOURS : gemini-1.5-pro (Le plus robuste)
            if (!response.ok) {
                console.warn(`Échec de ${model}. Dernière tentative avec gemini-1.5-pro...`);
                model = "gemini-1.5-pro";
                url = `${baseUrl}${model}:generateContent?key=${CONFIG.API_KEY}`;
                
                response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
            }

            // Si tout a échoué
            if (!response.ok) {
                const errorData = await response.json();
                console.error("ERREUR FATALE API:", errorData);
                return `Les esprits refusent de répondre. (Erreur ${response.status}: ${errorData.error?.message})`;
            }
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.warn("Réponse vide reçue de l'IA.");
            return "Les esprits restent silencieux (Réponse vide).";
        }

    } catch (error) {
        console.error("Erreur JS / Réseau:", error);
        return "Une force invisible bloque la connexion (Erreur Réseau).";
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
    // Nettoyage des caractères Markdown basiques
    const cleanText = text.replace(/^"|"$/g, '').replace(/\*/g, '');
    
    function type() { 
        if (i < cleanText.length) { 
            target.innerHTML += cleanText.charAt(i); 
            i++; 
            // Vitesse définie dans config.js ou par défaut ici
            const speed = (typeof CONFIG !== 'undefined' && CONFIG.TYPING_SPEED) ? CONFIG.TYPING_SPEED : 30;
            setTimeout(type, speed); 
        } 
    }
    type();
}
