// Dnie treningowe
export const DAYS = [
    {
        id: 0,
        weekday: 0,
        name: "Niedziela",
        label: "PUSH",
        icon: "🔥",
        color: "#ff3b30",
        exercises: [
            { name: "Incline Dumbbell Press", sets: 4, reps: "6-10", tag: "CHEST" },
            { name: "Seated Dumbbell OHP", sets: 3, reps: "6-10", tag: "SHOULDER" },
            { name: "Machine Chest Press", sets: 3, reps: "6-10", tag: "CHEST" },
            { name: "Chest Dips", sets: 3, reps: "6-10", tag: "CHEST" },
            { name: "Dumbbell Lateral Raises", sets: 4, reps: "8-12", tag: "DELTS" },
            { name: "Ab Wheel", sets: 3, reps: "8-12", tag: "CORE" },
            { name: "Pallof Press", sets: 3, reps: "8-12", tag: "CORE" },
        ],
    },
    {
        id: 1,
        weekday: 1,
        name: "Poniedziałek",
        label: "PULL",
        icon: "💪",
        color: "#00b4d8",
        exercises: [
            { name: "Weighted Pull Ups", sets: 4, reps: "6-8", tag: "BACK" },
            { name: "Single-Arm Dumbbell Row", sets: 3, reps: "6-10", tag: "BACK" },
            { name: "Seated Cable Row", sets: 3, reps: "6-10", tag: "BACK" },
            { name: "Reverse Peck Deck", sets: 4, reps: "8-12", tag: "REAR" },
            { name: "Dumbbell Shrugs", sets: 3, reps: "8-12", tag: "TRAPS" },
            { name: "Ez-bar Reverse Curl", sets: 3, reps: "8-12", tag: "FOREARMS" },
            { name: "Barbell Wrist Curl", sets: 3, reps: "10-15", tag: "FOREARMS" },
        ],
    },
    {
        id: 2,
        weekday: 3,
        name: "Środa",
        label: "LEGS + ARMS",
        icon: "🦵",
        color: "#2ec4b6",
        exercises: [
            { name: "Hip Thrust", sets: 4, reps: "6-10", tag: "GLUTES" },
            { name: "Hack Squat / Leg Press", sets: 3, reps: "6-10", tag: "QUADS" },
            { name: "RDL", sets: 3, reps: "6-10", tag: "LEGS" },
            { name: "Seated Leg Curl", sets: 3, reps: "8-12", tag: "HAM" },
            { name: "Supination Curl [SS]", sets: 3, reps: "8-12", tag: "BICEPS" },
            { name: "Single-Arm Cable Pushdown [SS]", sets: 3, reps: "8-12", tag: "TRICEPS" },
            { name: "Cross-Body Hammer Curl [SS]", sets: 3, reps: "8-12", tag: "BICEPS" },
            { name: "Calf Raises [SS]", sets: 4, reps: "10-15", tag: "CALVES" },
        ],
    },
    {
        id: 3,
        weekday: 5,
        name: "Piątek",
        label: "UPPER",
        icon: "⚡",
        color: "#9d4edd",
        exercises: [
            { name: "Bench Press", sets: 3, reps: "5-8", tag: "CHEST" },
            { name: "Cable Flyes (Low to High)", sets: 3, reps: "8-12", tag: "CHEST" },
            { name: "Single-Arm Lat Pulldown", sets: 3, reps: "6-10", tag: "BACK" },
            { name: "Cable Lateral Raise", sets: 4, reps: "8-12", tag: "DELTS" },
            { name: "EZ-bar Preacher Curl", sets: 3, reps: "8-12", tag: "BICEPS" },
            { name: "Incline Skull Crushers", sets: 3, reps: "8-12", tag: "TRICEPS" },
            { name: "Cable Crunch", sets: 4, reps: "8-12", tag: "CORE" },
        ],
    },
];

// Domyślny stan
export const DEFAULT_STATE = {
    currentWeekIndex: 0,
    weeks: [{}],
    startSunday: 0,
};

// Storage keys
export const STORAGE_KEYS = {
    STATE: "gym_app_state",
    THEME: "gym_app_theme",
    PREFERENCES: "gym_app_preferences",
};

// Keyboard shortcuts
export const SHORTCUTS = {
    ESCAPE: "Escape",
    ENTER: "Enter",
};

// Animation durations (ms)
export const ANIMATIONS = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
};
