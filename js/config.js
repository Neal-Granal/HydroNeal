// CONFIGURATION GLOBALE
// Sépare les données sensibles et les paramètres du reste du code.

const CONFIG = {
    // ⚠️ Clé API : À ne pas exposer sur un dépôt public GitHub sans précaution.
    API_KEY: "AIzaSyCMfqbhNp1vVVP6gNjNchr_veh7PjyFePI", 
    
    // Réglages du livre interactif
    BOOK: {
        width: 480,
        height: 720,
        minWidth: 315,
        maxWidth: 650,
        minHeight: 450,
        maxHeight: 950
    },
    
    // Vitesse de l'effet "machine à écrire" (ms par lettre)
    TYPING_SPEED: 30
};
