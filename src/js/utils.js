/**
 * Utility functions - Professional version
 */

/**
 * Formatuj liczbę wg polskich standardów
 * @param {number} value - Liczba do sformatowania
 * @returns {string} Sformatowana liczba
 */
export const formatNumberPL = (value) => {
    const num = Number(value) || 0;
    if (Number.isInteger(num)) return String(num);
    return num.toFixed(1).replace(".", ",");
};

/**
 * Bezpieczne escapowanie HTML
 * @param {string} str - String do escapowania
 * @returns {string} Escaped string
 */
export const escapeHtml = (str = "") => {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
};

/**
 * Szacuj 1RM (One Rep Max) używając Epley formula
 * @param {number} kg - Waga
 * @param {number} reps - Liczba powtórzeń
 * @returns {number} Szacunkowy 1RM
 */
export const estimate1RM = (kg, reps) => {
    kg = Number(kg) || 0;
    reps = Number(reps) || 0;
    if (!kg || !reps) return 0;
    return kg * (1 + reps / 30);
};

/**
 * Pobranie dzisiejszego dnia tygodnia
 * @returns {number} 0-6 (0=niedziela)
 */
export const getTodayWeekday = () => new Date().getDay();

/**
 * Pobranie najbliższej poprzedniej niedzieli
 * @returns {Date} Data niedzieli
 */
export const getCurrentSunday = () => {
    const now = new Date();
    const day = now.getDay();
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - day);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
};

/**
 * Format zakresu dat tygodnia
 * @param {number} startSunday - Timestamp początku
 * @param {number} weekIndex - Index tygodnia
 * @returns {string} Sformatowany zakres
 */
export const getWeekRangeLabel = (startSunday, weekIndex) => {
    if (!startSunday) return `Tydzień ${weekIndex + 1}`;

    const start = new Date(startSunday + weekIndex * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startTxt = start.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
    const endTxt = end.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });

    return `${startTxt} – ${endTxt}`;
};

/**
 * Debounce funkcja
 * @param {Function} func - Funkcja do debounce'owania
 * @param {number} delay - Opóźnienie w ms
 * @returns {Function} Debounced funkcja
 */
export const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * Throttle funkcja
 * @param {Function} func - Funkcja do throttle'owania
 * @param {number} delay - Opóźnienie w ms
 * @returns {Function} Throttled funkcja
 */
export const throttle = (func, delay = 300) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            func(...args);
            lastCall = now;
        }
    };
};

/**
 * Deep clone obiektu
 * @param {any} obj - Obiekt do sklonowania
 * @returns {any} Sklonowany obiekt
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Sprawdzenie czy device jest mobilny
 * @returns {boolean}
 */
export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
};

/**
 * Sprawdzenie obsługi PWA
 * @returns {boolean}
 */
export const isPWASupported = () => {
    return "serviceWorker" in navigator && "caches" in window;
};

/**
 * LocalStorage z fallbackem
 */
export const SafeStorage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Storage error: ${e}`);
            return false;
        }
    },
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Storage error: ${e}`);
            return defaultValue;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Storage error: ${e}`);
            return false;
        }
    },
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error(`Storage error: ${e}`);
            return false;
        }
    },
};

// Export wszystkiego
export default {
    formatNumberPL,
    escapeHtml,
    estimate1RM,
    getTodayWeekday,
    getCurrentSunday,
    getWeekRangeLabel,
    debounce,
    throttle,
    deepClone,
    isMobileDevice,
    isPWASupported,
    SafeStorage,
};
