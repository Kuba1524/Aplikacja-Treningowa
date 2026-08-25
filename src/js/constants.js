/**
 * Application constants - Training plan data
 */

// Days of the week with exercises
export const DAYS = [
    {
        id: 0,
        name: "Poniedziałek - Klatka",
        exercises: [
            {
                name: "Wyciskanie sztangi leżąc",
                sets: 4,
            },
            {
                name: "Rozpiętki hantlami",
                sets: 3,
            },
            {
                name: "Naciąg liny w dół",
                sets: 3,
            },
        ],
    },
    {
        id: 1,
        name: "Wtorek - Plecy",
        exercises: [
            {
                name: "Wiosłowanie sztangą",
                sets: 4,
            },
            {
                name: "Ściąganie łąka",
                sets: 3,
            },
            {
                name: "Wiosłowanie hantlem",
                sets: 3,
            },
        ],
    },
    {
        id: 2,
        name: "Środa - Nogi",
        exercises: [
            {
                name: "Przysiad sztangą",
                sets: 4,
            },
            {
                name: "Martwy ciąg",
                sets: 3,
            },
            {
                name: "Leg press",
                sets: 3,
            },
        ],
    },
    {
        id: 3,
        name: "Czwartek - Ramiona",
        exercises: [
            {
                name: "Wyciskanie hantli",
                sets: 4,
            },
            {
                name: "Podciąg sztangi",
                sets: 3,
            },
            {
                name: "Unosy bokiem",
                sets: 3,
            },
        ],
    },
    {
        id: 4,
        name: "Piątek - Biceps/Triceps",
        exercises: [
            {
                name: "Uginanie hantli",
                sets: 4,
            },
            {
                name: "Wyciskanie w dół",
                sets: 3,
            },
            {
                name: "Uginanie sztangi",
                sets: 3,
            },
        ],
    },
    {
        id: 5,
        name: "Sobota - Kardio",
        exercises: [
            {
                name: "Bieganie",
                sets: 1,
            },
        ],
    },
    {
        id: 6,
        name: "Niedziela - Odpoczynek",
        exercises: [
            {
                name: "Rozciąganie",
                sets: 1,
            },
        ],
    },
];

// Initialize weeks (8 weeks of training)
export const WEEKS = Array(8)
    .fill(null)
    .map(() => ({}));

// App settings
export const APP_CONFIG = {
    version: "1.0.0",
    appName: "KubaGym",
    storageKey: "appState",
    weeksCount: 8,
};
