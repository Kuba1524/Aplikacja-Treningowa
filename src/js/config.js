// Załaduj zmienne z .env
export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const appConfig = {
    name: import.meta.env.VITE_APP_NAME || "KubaGym",
    version: import.meta.env.VITE_APP_VERSION || "1.0.0",
    debug: import.meta.env.DEV,
};

// Walidacja konfiguracji
export const validateConfig = () => {
    const requiredKeys = [
        "apiKey",
        "authDomain",
        "projectId",
        "storageBucket",
        "messagingSenderId",
        "appId",
    ];

    for (const key of requiredKeys) {
        if (!firebaseConfig[key]) {
            console.error(`Missing Firebase config: ${key}`);
            throw new Error(`Firebase configuration incomplete: ${key} is missing`);
        }
    }

    return true;
};
