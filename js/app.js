const PLAN_BARTEK_V1 = [
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
            { name: "Machine Chest Press", sets: 3, reps: "8-10", tag: "CHEST" },
            { name: "Chest Dips", sets: 3, reps: "6-10", tag: "CHEST" },
            { name: "Dumbbell Lateral Raises", sets: 4, reps: "8-12", tag: "SHOULDER" },
            { name: "Ab Wheel", sets: 3, reps: "8-12", tag: "CORE" },
            { name: "Decline Oblique Crunches", sets: 3, reps: "8-12", tag: "CORE" }
        ]
    },
    {
        id: 1,
        weekday: 1,
        name: "Poniedziałek",
        label: "PULL",
        icon: "💪",
        color: "#00b4d8",
        exercises: [
            { name: "Weighted Pull Ups", sets: 3, reps: "6-8", tag: "BACK" },
            { name: "Single-Arm Dumbbell Row", sets: 3, reps: "6-10", tag: "BACK" },
            { name: "Seated Cable Row", sets: 3, reps: "6-10", tag: "BACK" },
            { name: "Reverse Peck Deck", sets: 4, reps: "8-12", tag: "REAR" },
            { name: "Dumbbell Shrugs", sets: 3, reps: "8-12", tag: "TRAPS" },
            { name: "Ez-bar Reverse Curl", sets: 3, reps: "8-12", tag: "FOREARMS" },
            { name: "Barbell Wrist Curl", sets: 3, reps: "10-15", tag: "FOREARMS" }
        ]
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
            { name: "Cross-Body Hammer Curl [SS]", sets: 3, reps: "8-10", tag: "BICEPS" },
            { name: "Calf Raises [SS]", sets: 4, reps: "10-15", tag: "CALVES" }
        ]
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
            { name: "Cable Lateral Raise", sets: 4, reps: "8-12", tag: "SHOULDER" },
            { name: "EZ-bar Preacher Curl", sets: 3, reps: "8-12", tag: "BICEPS" },
            { name: "Incline Skull Crushers", sets: 3, reps: "8-10", tag: "TRICEPS" },
            { name: "Cable Crunch", sets: 4, reps: "8-12", tag: "CORE" }
        ]
    }
];

const makePlan = (baseDays, days) =>
    baseDays.map((day, idx) => ({
        ...day,
        exercises: (days[idx] || []).map((ex) => ({ ...ex }))
    }));

const makeKubaPlan = (days) => makePlan(PLAN_BARTEK_V1, days);

// PUSH i UPPER z planu v3 zostają bez zmian również w v5.
const KUBA_PUSH_V3 = [
    { name: "Incline Smith Machine Press", sets: 3, reps: "6-8", tag: "CHEST" },
    { name: "Seated Dumbbell OHP", sets: 3, reps: "6-10", tag: "SHOULDER" },
    { name: "Machine Chest Press", sets: 3, reps: "8-10", tag: "CHEST" },
    { name: "Chest Dips", sets: 2, reps: "6-10", tag: "CHEST" },
    { name: "Dumbbell Lateral Raises", sets: 3, reps: "8-12", tag: "SHOULDER" },
    { name: "Ab Wheel", sets: 3, reps: "8-12", tag: "CORE" },
    { name: "Dragon Flag (negatives)", sets: 2, reps: "8-12", tag: "CORE" }
];
const KUBA_UPPER_V3 = [
    { name: "Bench Press", sets: 3, reps: "5-8", tag: "CHEST" },
    { name: "Cable Flyes (Low to High)", sets: 3, reps: "8-12", tag: "CHEST" },
    { name: "Lat Pulldown", sets: 3, reps: "8-12", tag: "BACK" },
    { name: "Cable Lateral Raise", sets: 3, reps: "8-10", tag: "SHOULDER" },
    { name: "EZ-bar Preacher Curl", sets: 3, reps: "8-12", tag: "BICEPS" },
    { name: "Incline Skull Crushers", sets: 3, reps: "8-10", tag: "TRICEPS" },
    { name: "Cable Crunch", sets: 3, reps: "8-12", tag: "CORE" }
];

// Plan Kuby v5 (poprawka v4) — obowiązuje od niedzieli 8.11.2026.
// PUSH i UPPER zostają bez zmian; Incline Hammer Curl jest w PULL zaraz po
// EZ-bar Reverse Curl, a w nogach zamiast niego jest Hyperextension.
const KUBA_PUSH = KUBA_PUSH_V3.map((ex) => ({ ...ex }));
const KUBA_PULL = [
    { name: "Weighted Pull Ups", sets: 3, reps: "6-8", tag: "BACK" },
    { name: "Single-Arm Cable Row", sets: 3, reps: "8-10", tag: "BACK" },
    { name: "Reverse Peck Deck", sets: 2, reps: "8-12", tag: "REAR" },
    { name: "Face Pull", sets: 3, reps: "12-15", tag: "REAR" },
    { name: "EZ-bar Reverse Curl", sets: 3, reps: "8-12", tag: "FOREARMS" },
    { name: "Incline Hammer Curl", sets: 3, reps: "8-12", tag: "BICEPS" },
    { name: "Barbell Wrist Curl", sets: 3, reps: "10-15", tag: "FOREARMS" }
];
const KUBA_LEGS = [
    { name: "RDL", sets: 3, reps: "6-10", tag: "HAM" },
    { name: "Hack Squat / Leg Press", sets: 3, reps: "6-10", tag: "QUADS" },
    { name: "Leg Extension", sets: 3, reps: "10-12", tag: "QUADS" },
    { name: "Seated Leg Curl", sets: 3, reps: "8-12", tag: "HAM" },
    { name: "Incline Dumbbell Curl [SS]", sets: 3, reps: "8-12", tag: "BICEPS" },
    { name: "Single-Arm Cable Pushdown [SS]", sets: 3, reps: "8-12", tag: "TRICEPS" },
    { name: "Hyperextension [SS]", sets: 2, reps: "10-12", tag: "HAM" },
    { name: "Calf Raises [SS]", sets: 4, reps: "10-12", tag: "CALVES" }
];
const KUBA_UPPER = KUBA_UPPER_V3.map((ex) => ({ ...ex }));

const PLAN_KUBA = makeKubaPlan([KUBA_PUSH, KUBA_PULL, KUBA_LEGS, KUBA_UPPER]);

// Od 15.11.2026 Bartek ma dokładnie te same ćwiczenia co Kuba. Wcześniejsze
// tygodnie zostają na jego starym planie dzięki zamrożonym snapshotom.
const PLAN_BARTEK = makePlan(PLAN_BARTEK_V1, [KUBA_PUSH, KUBA_PULL, KUBA_LEGS, KUBA_UPPER]);
PLAN_BARTEK.forEach((day) => {
    day.exercises = day.exercises.map((ex) => ({
        ...ex,
        rest: Number(ex.rest) > 0
            ? Number(ex.rest)
            : window.Utils.defaultRestSeconds(ex.reps)
    }));
});

// Plan Kuby sprzed zmiany (obowiązywał do tygodnia z 8.11.2026).
// Trzymamy go zamrożonego, żeby stare tygodnie dalej pokazywały swoje ćwiczenia.
const KUBA_LEGS_V1 = [
    { name: "RDL", sets: 3, reps: "6-10", tag: "HAM" },
    { name: "Hack Squat / Leg Press", sets: 3, reps: "6-10", tag: "QUADS" },
    { name: "Leg Extension", sets: 3, reps: "10-12", tag: "QUADS" },
    { name: "Seated Leg Curl", sets: 3, reps: "8-12", tag: "HAM" },
    { name: "Incline Dumbbell Curl [SS]", sets: 3, reps: "8-12", tag: "BICEPS" },
    { name: "Single-Arm Cable Pushdown [SS]", sets: 3, reps: "8-12", tag: "TRICEPS" },
    { name: "Incline Hammer Curl [SS]", sets: 3, reps: "8-10", tag: "BICEPS" },
    { name: "Calf Raises [SS]", sets: 4, reps: "10-15", tag: "CALVES" }
];
// Tydzień, od którego obowiązuje plan Kuby v5 (niedziela 8.11.2026).
// Starsze tygodnie nadal dostają plan historyczny.
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const KUBA_PLAN_V3_START = new Date(2026, 10, 8, 0, 0, 0, 0).getTime();
const KUBA_PLAN_V5_START = KUBA_PLAN_V3_START;
// Od tego tygodnia Bartek ćwiczy to samo co Kuba. Wcześniejsze tygodnie
// pozostają bez zmian, a bieżący i kolejne dostają nowy plan od razu.
const BARTEK_PLAN_V2_START = new Date(2026, 10, 15, 0, 0, 0, 0).getTime();

// Granice wcześniejszych zmian planu Kuby (odtworzone z historii i z danych):
// - do 12.07.2026 obowiązywał pierwszy plan (polskie nazwy, inne ćwiczenia),
// - od 14.07.2026 plan został przetłumaczony i zmieniono część ćwiczeń,
// - od 17.08.2026 wrócił Bench Press i Pallof Press,
// - od 20.09.2026 Incline Dumbbell Press zastąpił Incline Smith Machine Press,
// - od 27.09.2026 obowiązuje nowy układ nóg i Weighted Pull Ups mają 3 serie.
const KUBA_PLAN_INITIAL_UNTIL = new Date(2026, 6, 12, 0, 0, 0, 0).getTime();
const KUBA_UPPER_FLYES_FROM = new Date(2026, 5, 14, 0, 0, 0, 0).getTime();
const KUBA_PLAN_AUG_FROM = new Date(2026, 7, 16, 0, 0, 0, 0).getTime();
const KUBA_SMITH_FROM = new Date(2026, 8, 20, 0, 0, 0, 0).getTime();
const KUBA_PLAN_LEGS_V2_FROM = new Date(2026, 8, 27, 0, 0, 0, 0).getTime();
const KUBA_WPU3_FROM = KUBA_PLAN_LEGS_V2_FROM;

// Data początku tygodnia liczona po dniach kalendarzowych (bez dryfu DST).
const kubaWeekStart = (startSunday, weekIndex) => {
    if (!startSunday) return null;
    const d = new Date(startSunday);
    d.setDate(d.getDate() + weekIndex * 7);
    return d.getTime();
};

const buildHistoricalPush = (weekStart) => {
    if (weekStart < KUBA_PLAN_INITIAL_UNTIL) {
        return [
            { name: "Incline Dumbbell Press", sets: 4, reps: "6-10", tag: "CHEST" },
            { name: "Seated Dumbbell OHP", sets: 3, reps: "6-10", tag: "SHOULDER" },
            { name: "Machine Chest Press", sets: 3, reps: "6-10", tag: "CHEST" },
            { name: "Rozpiętki", sets: 3, reps: "8-12", tag: "CHEST" },
            { name: "Dumbbell Lateral Raises", sets: 4, reps: "8-12", tag: "DELTS" },
            { name: "Ab Wheel", sets: 3, reps: "8-12", tag: "CORE" }
        ];
    }

    if (weekStart < KUBA_PLAN_AUG_FROM) {
        return [
            { name: "Incline Dumbbell Press", sets: 4, reps: "6-10", tag: "CHEST" },
            { name: "Seated Dumbbell OHP", sets: 3, reps: "6-10", tag: "SHOULDER" },
            { name: "Machine Chest Press", sets: 3, reps: "6-10", tag: "CHEST" },
            { name: "Chest Dips", sets: 3, reps: "6-10", tag: "CHEST" },
            { name: "Dumbbell Lateral Raises", sets: 4, reps: "8-12", tag: "DELTS" },
            { name: "Ab Wheel", sets: 3, reps: "8-12", tag: "CORE" },
            { name: "Dumbbell Side Bend", sets: 3, reps: "8-12", tag: "CORE" }
        ];
    }

    if (weekStart < KUBA_SMITH_FROM) {
        return [
            { name: "Incline Dumbbell Press", sets: 4, reps: "6-10", tag: "CHEST" },
            { name: "Seated Dumbbell OHP", sets: 3, reps: "6-10", tag: "SHOULDER" },
            { name: "Machine Chest Press", sets: 3, reps: "6-10", tag: "CHEST" },
            { name: "Chest Dips", sets: 3, reps: "6-10", tag: "CHEST" },
            { name: "Dumbbell Lateral Raises", sets: 4, reps: "8-12", tag: "DELTS" },
            { name: "Ab Wheel", sets: 3, reps: "8-12", tag: "CORE" },
            { name: "Pallof Press", sets: 3, reps: "8-12", tag: "CORE" }
        ];
    }

    return [
        { name: "Incline Smith Machine Press", sets: 3, reps: "6-8", tag: "CHEST" },
        { name: "Seated Dumbbell OHP", sets: 3, reps: "6-10", tag: "SHOULDER" },
        { name: "Machine Chest Press", sets: 3, reps: "8-10", tag: "CHEST" },
        { name: "Chest Dips", sets: 3, reps: "6-10", tag: "CHEST" },
        { name: "Dumbbell Lateral Raises", sets: 4, reps: "8-12", tag: "SHOULDER" },
        { name: "Ab Wheel", sets: 3, reps: "8-12", tag: "CORE" },
        { name: "Decline Oblique Crunches", sets: 3, reps: "8-12", tag: "CORE" }
    ];
};

const buildHistoricalPull = (weekStart) => {
    const rows4 = weekStart < KUBA_PLAN_AUG_FROM;
    const late = weekStart >= KUBA_WPU3_FROM;

    return [
        { name: "Weighted Pull Ups", sets: late ? 3 : 4, reps: "6-8", tag: "BACK" },
        { name: "Single-Arm Dumbbell Row", sets: rows4 ? 4 : 3, reps: "6-10", tag: "BACK" },
        { name: "Seated Cable Row", sets: rows4 ? 4 : 3, reps: "6-10", tag: "BACK" },
        { name: "Reverse Peck Deck", sets: 4, reps: "8-12", tag: "REAR" },
        { name: "Dumbbell Shrugs", sets: 3, reps: "8-12", tag: "TRAPS" },
        { name: "Ez-bar Reverse Curl", sets: 3, reps: "8-12", tag: "FOREARMS" },
        { name: "Barbell Wrist Curl", sets: 3, reps: "10-15", tag: "FOREARMS" }
    ];
};

const buildHistoricalLegs = (weekStart) => {
    if (weekStart >= KUBA_PLAN_LEGS_V2_FROM) {
        return KUBA_LEGS_V1.map((ex) => ({ ...ex }));
    }

    const initial = weekStart < KUBA_PLAN_INITIAL_UNTIL;

    // Po migracji z 28.09.2026 dane nóg są w nowym układzie. W starych
    // tygodniach slot 0 zawiera więc ćwiczenie, które wtedy było na slocie 2:
    // Bulgarian Split (pierwszy plan) albo RDL (od 14.07.2026).
    return [
        {
            name: initial ? "Bulgarian Split" : "RDL",
            sets: 3,
            reps: "6-10",
            tag: initial ? "LEGS" : "HAM"
        },
        { name: "Hack Squat / Leg Press", sets: 3, reps: "6-10", tag: "QUADS" },
        { name: "Leg Extension", sets: 3, reps: "10-12", tag: "QUADS" },
        { name: "Seated Leg Curl", sets: 3, reps: "8-12", tag: "HAM" },
        { name: "Supination Curl", sets: 3, reps: "8-12", tag: "BICEPS" },
        {
            name: initial ? "Katana Extension" : "Single-Arm Cable Pushdown [SS]",
            sets: 3,
            reps: "8-12",
            tag: "TRICEPS"
        },
        {
            name: initial ? "Hammer Curl" : "Cross-Body Hammer Curl [SS]",
            sets: 3,
            reps: "8-12",
            tag: "BICEPS"
        },
        { name: "Calf Raises [SS]", sets: 4, reps: "10-15", tag: "CALVES" }
    ];
};

const buildHistoricalUpper = (weekStart) => {
    const initial = weekStart < KUBA_PLAN_INITIAL_UNTIL;
    const flyes = weekStart >= KUBA_UPPER_FLYES_FROM;
    const late = weekStart >= KUBA_WPU3_FROM;

    return [
        { name: "Bench Press", sets: 3, reps: "5-8", tag: "CHEST" },
        {
            name: flyes ? "Cable Flyes (Low to High)" : "Incline Machine Press",
            sets: 3,
            reps: "8-12",
            tag: "CHEST"
        },
        { name: "Single-Arm Lat Pulldown", sets: 3, reps: "6-10", tag: "BACK" },
        {
            name: "Cable Lateral Raise",
            sets: 4,
            reps: "8-12",
            tag: late ? "SHOULDER" : "DELTS"
        },
        {
            name: initial ? "Incline Dumbbell Curl" : "EZ-bar Preacher Curl",
            sets: 3,
            reps: "8-12",
            tag: "BICEPS"
        },
        {
            name: initial ? "Tricep Pushdown" : "Incline Skull Crushers",
            sets: 3,
            reps: initial ? "8-12" : "8-10",
            tag: "TRICEPS"
        },
        { name: "Cable Crunch", sets: 4, reps: "8-12", tag: "CORE" }
    ];
};

// Plan Kuby obowiązujący w danym tygodniu (przed nowym planem z 8.11.2026).
// Odtwarzamy właściwą erę planu, bo nazwy ćwiczeń zmieniały się 14.07,
// 17.08, 20.09 i 27.09.2026. Dzięki temu stare serie nie dostają nazw
// ćwiczeń, których wtedy jeszcze nie było.
const buildKubaHistoricalPlan = (weekStart, weekData = {}) => {
    const plan = [
        { ...PLAN_BARTEK_V1[0], exercises: buildHistoricalPush(weekStart) },
        { ...PLAN_BARTEK_V1[1], exercises: buildHistoricalPull(weekStart) },
        { ...PLAN_BARTEK_V1[2], exercises: buildHistoricalLegs(weekStart) },
        { ...PLAN_BARTEK_V1[3], exercises: buildHistoricalUpper(weekStart) }
    ];

    // Nie pozwól, żeby plan miał mniej serii niż dane zapisane w tygodniu —
    // inaczej otwarcie treningu obcięłoby starsze serie (i pokazywało 4/3).
    plan.forEach((day, dayIdx) => {
        day.exercises = day.exercises.map((ex, exIdx) => {
            const stored = weekData[`d${dayIdx}_e${exIdx}`];
            const storedCount = Array.isArray(stored) ? stored.length : 0;
            return { ...ex, sets: Math.min(10, Math.max(ex.sets, storedCount)) };
        });
    });

    return plan;
};

let DAYS = PLAN_BARTEK;
let CURRENT_PLAN = PLAN_BARTEK;
const APP_VERSION = "v106";

const getPlanByKey = (planKey) =>
    planKey === "kuba" ? PLAN_KUBA : PLAN_BARTEK;

const copyPlan = (plan) =>
    (plan || []).map((day) => ({
        ...day,
        exercises: (day.exercises || []).map((ex) => ({ ...ex }))
    }));

// Plan na dany tydzień zależy od daty jego rozpoczęcia:
// - przed 8.11.2026: plan odtworzony historycznie,
// - od 8.11.2026: najnowszy plan v5 (z ewentualnymi edycjami użytkownika).
const fitPlanSetsToWeek = (plan, weekData = {}) => {
    (plan || []).forEach((day) => {
        day.exercises = (day.exercises || []).map((ex, exIdx) => {
            const stored = weekData[`d${day.id}_e${exIdx}`];
            const storedCount = Array.isArray(stored) ? stored.length : 0;
            return { ...ex, sets: Math.min(10, Math.max(ex.sets, storedCount)) };
        });
    });
    return plan;
};

const getPlanForWeekIndex = (weekIndex, weekData = {}, planKey = currentPlanKey) => {
    if (!state || !state.startSunday) return copyPlan(CURRENT_PLAN);

    const weekStart = kubaWeekStart(state.startSunday, weekIndex);
    if (weekStart === null) return copyPlan(CURRENT_PLAN);

    if (planKey === "bartek") {
        if (weekStart < BARTEK_PLAN_V2_START) {
            return copyPlan(PLAN_BARTEK_V1);
        }
        return copyPlan(CURRENT_PLAN);
    }

    if (planKey !== "kuba") return copyPlan(CURRENT_PLAN);

    if (weekStart < KUBA_PLAN_V3_START) {
        return buildKubaHistoricalPlan(weekStart, weekData);
    }
    return copyPlan(CURRENT_PLAN);
};

const canonicalTag = (tag) => {
    const t = String(tag || "CORE").trim().toUpperCase();
    if (t === "DELTS") return "SHOULDER";
    return t;
};

const applyCustomPlanTo = (plan) => {
    const overrides = state && state.customPlan;
    if (overrides && typeof overrides === "object") {
        (plan || []).forEach((day) => {
            const custom = overrides[day.id];
            if (!Array.isArray(custom)) return;
            const cleaned = custom
                .map((ex) => ({
                    name: String(ex && ex.name || "").trim(),
                    sets: Math.max(1, Math.min(30, Number(ex && ex.sets) || 1)),
                    reps: String(ex && ex.reps || "").trim(),
                    tag: canonicalTag(ex && ex.tag) || "CORE",
                    rest: Math.max(0, Math.min(600, Number(ex && ex.rest) || 0))
                }))
                .filter((ex) => ex.name);
            if (cleaned.length) {
                day.exercises = cleaned;
            }
        });
    }

    const meta = state && state.customPlanMeta;
    if (meta && typeof meta === "object") {
        (plan || []).forEach((day) => {
            const m = meta[day.id];
            if (!m || typeof m !== "object") return;
            if (typeof m.color === "string" && /^#[0-9a-fA-F]{6}$/.test(m.color)) day.color = m.color;
            if (typeof m.icon === "string" && m.icon) day.icon = m.icon;
        });
    }
};

// Aktualny (najnowszy) plan profilu — z uwzględnieniem ręcznych edycji.
const buildCurrentPlan = () => {
    const plan = copyPlan(getPlanByKey(currentPlanKey));
    applyCustomPlanTo(plan);
    return plan;
};

let state = {
    currentWeekIndex: 0,
    weeks: [{}],
    startSunday: 0
};

let currentDayId = null;
let currentView = "home";
let saveTimeout = null;
let noteSaveTimeout = null;
let isLoaded = false;
let currentUserId = null;
let currentProfileName = "Użytkownik";
let currentPlanKey = "bartek";
let statsMaxCols = 12;
let planCompactMode = false;
let fullPlanReturnView = "plan";

const getDayDateKey = (dayId) => `day_${dayId}_date`;
const getDayTimestampKey = (dayId) => `day_${dayId}_ts`;
const getExerciseKey = (dayId, exerciseIndex) => `d${dayId}_e${exerciseIndex}`;
const getNoteKey = (dayId, exerciseIndex) => `d${dayId}_e${exerciseIndex}_note`;

// Nazwy, które w starym planie Bartka znaczyły to samo ćwiczenie co w planie Kuby.
const exerciseNameKey = (name) => {
    const key = String(name || "").trim().toLowerCase();
    if (key === "smith") return "incline smith machine press";
    if (key === "rdl (sztanga)") return "rdl";
    if (key === "dragon flag (negatywy)") return "dragon flag (negatives)";
    return key;
};

// Przepina serie i notatki z dotychczasowego planu tygodnia na nowy plan,
// dopasowując ćwiczenia po nazwie. Ćwiczenia usunięte z planu nie zostawiają
// danych pod nowymi indeksami.
const remapWeekToPlan = (weekData = {}, oldPlan = [], newPlan = []) => {
    const out = { ...weekData };

    (newPlan || []).forEach((newDay) => {
        const prefix = `d${newDay.id}_e`;
        const oldDay = (oldPlan || []).find((day) => day && day.id === newDay.id);
        const oldLogs = {};

        if (oldDay) {
            (oldDay.exercises || []).forEach((oldEx, oldIdx) => {
                const fromKey = getExerciseKey(newDay.id, oldIdx);
                oldLogs[oldIdx] = {
                    sets: weekData[fromKey],
                    note: weekData[fromKey + "_note"]
                };
            });
        }

        Object.keys(out).forEach((key) => {
            if (key.startsWith(prefix)) delete out[key];
        });

        (newDay.exercises || []).forEach((newEx, newIdx) => {
            const oldIdx = (oldDay ? oldDay.exercises || [] : []).findIndex((oldEx) =>
                exerciseNameKey(oldEx && oldEx.name) === exerciseNameKey(newEx && newEx.name)
            );
            if (oldIdx < 0) return;

            const oldEntry = oldLogs[oldIdx];
            if (!oldEntry) return;

            const toKey = getExerciseKey(newDay.id, newIdx);
            if (oldEntry.sets !== undefined) out[toKey] = oldEntry.sets;
            if (oldEntry.note !== undefined) out[toKey + "_note"] = oldEntry.note;
        });
    });

    return out;
};

const normalizeWeek = (week = {}) => {
    const normalized = {};

    Object.keys(week).forEach((key) => {
        const value = week[key];

        if (key.endsWith("_note") || key.startsWith("day_")) {
            normalized[key] = value;
            return;
        }

        if (key.startsWith("d") && Array.isArray(value)) {
            normalized[key] = value.map((set) => ({
                kg: Number(set?.kg) || 0,
                reps: Number(set?.reps) || 0,
                done: !!set?.done
            }));
        }
    });

    return normalized;
};

const ensureStateShape = () => {
    if (!Array.isArray(state.bodyWeight)) {
        state.bodyWeight = [];
    }
    
    if (!state || typeof state !== "object") {
        state = { currentWeekIndex: 0, weeks: [{}], startSunday: 0 };
    }

    if (!Array.isArray(state.weeks) || state.weeks.length === 0) {
        state.weeks = [{}];
    }

    state.weeks = state.weeks.map((week) => {
        if (!week || typeof week !== "object") return {};
        return normalizeWeek(week);
    });

    if (typeof state.currentWeekIndex !== "number" || state.currentWeekIndex < 0) {
        state.currentWeekIndex = 0;
    }
    if (state.currentWeekIndex >= state.weeks.length) {
        state.currentWeekIndex = state.weeks.length - 1;
    }

    if (typeof state.startSunday !== "number") {
        state.startSunday = 0;
    }

    if (!state.weekSchedule || typeof state.weekSchedule !== "object") {
        state.weekSchedule = {};
    }
    if (!state.migrations || typeof state.migrations !== "object") {
        state.migrations = {};
    }
    if (!state.weekPlans || typeof state.weekPlans !== "object" || Array.isArray(state.weekPlans)) {
        state.weekPlans = {};
    }
};

// Wypełnia nowy tydzień wartościami z poprzedniego treningu, dopasowując
// ćwiczenia po nazwie. Dzięki temu zmiana planu nie kasuje podpowiedzi
// ciężaru i powtórzeń. Istniejących wpisów nie nadpisuje.
const seedWeekFromPrevious = (prevWeek = {}, prevPlan = [], newPlan = [], currentWeek = {}) => {
    const out = { ...currentWeek };

    (newPlan || []).forEach((day) => {
        const prevDay = (prevPlan || []).find((d) => d && d.id === day.id);
        if (!prevDay) return;

        (day.exercises || []).forEach((ex, ei) => {
            const prevIdx = (prevDay.exercises || []).findIndex(
                (prevEx) => prevEx && prevEx.name === ex.name
            );
            if (prevIdx < 0) return;

            const fromKey = getExerciseKey(prevDay.id, prevIdx);
            const toKey = getExerciseKey(day.id, ei);
            const currentSets = currentWeek[toKey];
            const hasCurrent = Array.isArray(currentSets) && currentSets.some(
                (set) => set && (Number(set.kg) > 0 || Number(set.reps) > 0 || set.done)
            );
            const prevSets = prevWeek[fromKey];

            if (!hasCurrent && Array.isArray(prevSets) && prevSets.length) {
                out[toKey] = prevSets.map((set) => ({
                    kg: Number(set?.kg) || 0,
                    reps: Number(set?.reps) || 0,
                    done: false
                }));
            }

            const currentNote = currentWeek[toKey + "_note"];
            const prevNote = prevWeek[fromKey + "_note"];
            if (!currentNote && prevNote) out[toKey + "_note"] = prevNote;
        });
    });

    return out;
};

const collectWeekHistory = (idx) => {
    const history = [];
    for (let wi = idx - 1; wi >= 0; wi -= 1) {
        const weekPlan = state.weekPlans && state.weekPlans[wi];
        if (!Array.isArray(weekPlan) || !weekPlan.length) continue;
        history.push({
            weekPlan,
            week: state.weeks[wi] || {}
        });
    }
    return history;
};

const findExerciseHistory = (day, ex, history) => {
    const nameKey = exerciseNameKey(ex.name);
    const matches = [];

    history.forEach(({ weekPlan, week }) => {
        const oldDay = (weekPlan || []).find((d) => d && d.id === day.id);
        if (!oldDay) return;

        const oldIdx = (oldDay.exercises || []).findIndex(
            (oldEx) => exerciseNameKey(oldEx && oldEx.name) === nameKey
        );
        if (oldIdx < 0) return;

        const fromKey = getExerciseKey(day.id, oldIdx);
        const sets = week[fromKey];
        if (Array.isArray(sets)) {
            matches.push({
                sets,
                note: week[fromKey + "_note"]
            });
        }
    });

    return matches;
};

// Wybieramy jeden spójny trening: najpierw taki, w którym wszystkie serie
// mają zapisane powtórzenia. Dzięki temu nie mieszamy ciężaru z jednego
// tygodnia z powtórzeniami z innego.
const pickHistorySource = (matches, setCount) => {
    if (!matches.length) return null;

    const count = Math.max(1, Number(setCount) || 0);
    const complete = matches.find((entry) => (
        Array.from({ length: count }, (_, si) => entry.sets[si])
            .every((set) => set && Number(set.reps) > 0)
    ));
    if (complete) return complete;

    let best = null;
    let bestScore = -1;
    matches.forEach((entry) => {
        let score = 0;
        for (let si = 0; si < count; si += 1) {
            if (entry.sets[si] && Number(entry.sets[si].reps) > 0) score += 1;
        }
        if (score > bestScore) {
            bestScore = score;
            best = entry;
        }
    });
    return best;
};

const legacyHistoryValue = (matches, si) => {
    for (const entry of matches) {
        const candidate = entry.sets[si];
        if (candidate && Number(candidate.reps) > 0) return candidate;
    }
    for (const entry of matches) {
        const candidate = entry.sets[si];
        if (candidate && Number(candidate.kg) > 0) return candidate;
    }
    return null;
};

// Poprawia wartości wpisane przez pierwszą wersję uzupełniania (v90), która
// mogła wziąć ciężar i powtórzenia z różnych tygodni. Naprawiamy tylko serie
// nietknięte przez użytkownika i tylko wtedy, gdy nadal mają wartości z v90.
const repairBartekSeededV1 = () => {
    const idx = state.currentWeekIndex;
    if (idx <= 0 || !state.weeks || !state.weeks[idx]) return;

    const currentWeek = state.weeks[idx] || {};
    const plan = getWeekPlan(idx);
    const history = collectWeekHistory(idx);
    if (!history.length) return;

    const out = { ...currentWeek };

    (plan || []).forEach((day) => {
        (day.exercises || []).forEach((ex, ei) => {
            const toKey = getExerciseKey(day.id, ei);
            const currentSets = out[toKey];
            if (!Array.isArray(currentSets) || !currentSets.length) return;
            if (currentSets.some((set) => set && set.done)) return;

            const matches = findExerciseHistory(day, ex, history);
            if (!matches.length) return;

            const source = pickHistorySource(matches, Number(ex.sets) || currentSets.length);
            if (!source) return;

            const setCount = Math.max(currentSets.length, Number(ex.sets) || 0);
            const legacy = Array.from(
                { length: setCount },
                (_, si) => legacyHistoryValue(matches, si) || {}
            );
            const matchesLegacy = currentSets.every((set, si) => {
                const cur = set || {};
                return (Number(cur.kg) || 0) === (Number(legacy[si].kg) || 0)
                    && (Number(cur.reps) || 0) === (Number(legacy[si].reps) || 0);
            });
            if (!matchesLegacy) return;

            let changed = false;
            const repaired = currentSets.map((set, si) => {
                const cur = set || { kg: 0, reps: 0, done: false };
                const old = legacy[si] || {};
                const next = source.sets[si] || {};
                const curKg = Number(cur.kg) || 0;
                const curReps = Number(cur.reps) || 0;
                const oldKg = Number(old.kg) || 0;
                const oldReps = Number(old.reps) || 0;
                const nextKg = Number(next.kg) || 0;
                const nextReps = Number(next.reps) || 0;
                const kg = curKg === oldKg ? nextKg : curKg;
                const reps = curReps === oldReps ? nextReps : curReps;

                if (kg !== curKg || reps !== curReps) changed = true;
                return { ...cur, kg, reps };
            });

            if (changed) out[toKey] = repaired;
        });
    });

    state.weeks[idx] = out;
};

// Jednorazowe dopełnienie bieżącego tygodnia Bartka. Szukamy ostatnich
// zapisanych serii tego samego ćwiczenia w jego historii, ale tylko uzupełniamy
// brakujące kilogramy/powtórzenia. Istniejących wpisów nie nadpisujemy.
const seedCurrentWeekFromHistory = () => {
    const idx = state.currentWeekIndex;
    if (idx <= 0 || !state.weeks || !state.weeks[idx]) return;

    const currentWeek = state.weeks[idx] || {};
    const plan = getWeekPlan(idx);
    const history = collectWeekHistory(idx);
    if (!history.length) return;

    const out = { ...currentWeek };

    (plan || []).forEach((day) => {
        (day.exercises || []).forEach((ex, ei) => {
            const toKey = getExerciseKey(day.id, ei);
            const currentSets = Array.isArray(out[toKey]) ? out[toKey] : [];
            const matches = findExerciseHistory(day, ex, history);
            if (!matches.length) return;

            const source = pickHistorySource(
                matches,
                Number(ex.sets) || currentSets.length || 1
            );
            if (!source) return;

            const targetCount = Math.max(
                Number(ex.sets) || 0,
                currentSets.length,
                source.sets.length
            );

            let changed = false;
            const merged = Array.from({ length: targetCount }, (_, si) => {
                const cur = currentSets[si] || { kg: 0, reps: 0, done: false };
                const src = source.sets[si] || {};
                const curKg = Number(cur.kg) || 0;
                const curReps = Number(cur.reps) || 0;
                const kg = curKg > 0 ? curKg : Number(src.kg) || 0;
                const reps = curReps > 0 ? curReps : Number(src.reps) || 0;
                const done = !!cur.done;

                if (kg !== curKg || reps !== curReps) changed = true;
                return { kg, reps, done };
            });

            if (changed) out[toKey] = merged;

            if (!currentWeek[toKey + "_note"] && source.note) {
                out[toKey + "_note"] = source.note;
            }
        });
    });

    state.weeks[idx] = out;
};

const planSetLimits = (plan = CURRENT_PLAN) => {
    const limits = {};
    (plan || []).forEach((day) => {
        day.exercises.forEach((ex, ei) => {
            limits[getExerciseKey(day.id, ei)] = ex.sets;
        });
    });
    return limits;
};

const trimWeekToPlan = (week, limits) => {
    Object.keys(week).forEach((key) => {
        const limit = limits[key];
        if (limit && Array.isArray(week[key]) && week[key].length > limit) {
            week[key] = week[key].slice(0, limit);
        }
    });
    return week;
};

const persistState = () => {
    if (!isLoaded || !currentUserId) return;

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        await window.StorageModule.save(currentUserId, state);
    }, 350);
};

const updateTimeline = () => {
    const currentSunday = window.Utils.getCurrentSunday();
    const currentSundayTime = currentSunday.getTime();

    if (!state.startSunday) {
        state.startSunday = currentSundayTime;
        state.weeks = [normalizeWeek(state.weeks[0] || {})];
        state.currentWeekIndex = 0;
        if (!state.weekPlans) state.weekPlans = {};
        state.weekPlans[0] = getPlanForWeekIndex(0, state.weeks[0] || {}, currentPlanKey);
        persistState();
        return;
    }

    if (currentSundayTime >= state.startSunday) {
        const elapsedWeeks = Math.floor((currentSundayTime - state.startSunday) / WEEK_MS);

        while (state.weeks.length <= elapsedWeeks) {
            const newIdx = state.weeks.length;
            const prevWeek = state.weeks[newIdx - 1] || {};
            const prevPlan = getWeekPlan(newIdx - 1);
            const newPlan = getPlanForWeekIndex(newIdx, {}, currentPlanKey);
            const newWeek = trimWeekToPlan(
                seedWeekFromPrevious(prevWeek, prevPlan, newPlan),
                planSetLimits(newPlan)
            );
            state.weeks.push(newWeek);
            if (!state.weekPlans) state.weekPlans = {};
            state.weekPlans[newIdx] = copyPlan(newPlan);
        }

        state.currentWeekIndex = Math.min(elapsedWeeks, state.weeks.length - 1);
        persistState();
    }
};

// Jednorazowe dopełnienie bieżącego tygodnia po zmianie planu. Tydzień mógł
// powstać wcześniej jako pusty, więc kopiujemy tylko brakujące ćwiczenia
// z poprzedniego tygodnia (po nazwie). Reszta zostaje bez zmian.
const seedCurrentWeekFromPrevious = () => {
    if (!state.migrations) return;

    if (currentPlanKey === "bartek") {
        if (state.migrations["bartek_week_seed_v2"]) return;
        if (state.migrations["bartek_week_seed_v1"]) repairBartekSeededV1();
        state.migrations["bartek_week_seed_v2"] = true;
        seedCurrentWeekFromHistory();
        return;
    }

    if (state.migrations["kuba_week_seed_v1"]) return;
    state.migrations["kuba_week_seed_v1"] = true;
    if (currentPlanKey !== "kuba") return;

    const idx = state.currentWeekIndex;
    if (idx <= 0 || !state.weeks || !state.weeks[idx]) return;

    const currentWeek = state.weeks[idx] || {};
    const prevWeek = state.weeks[idx - 1] || {};
    state.weeks[idx] = seedWeekFromPrevious(
        prevWeek,
        getWeekPlan(idx - 1),
        getWeekPlan(idx),
        currentWeek
    );
};

const getWeekCompletion = (weekIndex) => {
    const weekData = state.weeks[weekIndex] || {};
    const plan = getWeekPlan(weekIndex);
    let total = 0;
    let done = 0;

    (plan || []).forEach((day) => {
        (day.exercises || []).forEach((ex, ei) => {
            const planned = Math.max(0, Number(ex.sets) || 0);
            const sets = weekData[getExerciseKey(day.id, ei)] || [];
            const completed = sets.filter((s) => s && s.done).length;
            total += planned;
            done += Math.min(completed, planned);
        });
    });

    return {
        total,
        done,
        pct: total ? Math.round((done / total) * 100) : 0
    };
};

const getDayProgress = (dayId) => {
    const day = DAYS.find((d) => d.id === dayId) || DAYS[dayId];
    if (!day || !day.exercises) {
        return { total: 0, done: 0, pct: 0 };
    }

    const weekData = state.weeks[state.currentWeekIndex] || {};
    let total = 0;
    let done = 0;

    day.exercises.forEach((ex, ei) => {
        const key = getExerciseKey(dayId, ei);
        const sets = weekData[key] || [];
        const planned = Math.max(0, Number(ex.sets) || sets.length || 0);
        total += planned;
        done += Math.min(sets.filter((s) => s && s.done).length, planned);
    });

    return {
        total,
        done,
        pct: total ? Math.round((done / total) * 100) : 0
    };
};

const getPlannedDayForWeekday = (weekIndex, weekday) =>
    DAYS.find((d) => d && d.weekday === weekday) || null;

const getTodayPlan = () => {
    const weekday = new Date().getDay();
    return getPlannedDayForWeekday(state.currentWeekIndex, weekday);
};

const getWeekDaysUI = () => {
    const now = new Date();
    const weekday = now.getDay();
    const sunday = window.Utils.getCurrentSunday();
    const labels = ["ND", "PN", "WT", "ŚR", "CZ", "PT", "SB"];
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return labels.map((lab, i) => {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);

        const linkedDay = getPlannedDayForWeekday(state.currentWeekIndex, i);
        const progress = linkedDay ? getDayProgress(linkedDay.id) : null;
        const active = i === weekday;
        const done = progress ? progress.done > 0 : false;
        const isPast = date.getTime() < todayStart.getTime();
        const stateClass = !linkedDay ? "" : done ? " done" : isPast ? " skip" : " empty";
        const stateTitle = !linkedDay
            ? "Dzień bez treningu"
            : done
                ? "Trening zrobiony"
                : isPast
                    ? "Trening pominięty"
                    : "Zaplanowany trening";

        return `
            <div class="week-day ${active ? "active" : ""}${stateClass}" title="${stateTitle}">
                <div class="week-day-lab">${lab}</div>
                <div class="week-day-num">${date.getDate()}</div>
                <div class="week-day-dot"></div>
            </div>
        `;
    }).join("");
};

const ensureWorkoutDataExists = (dayId, exerciseIndex, setsCount) => {
    const weekData = state.weeks[state.currentWeekIndex];
    const key = getExerciseKey(dayId, exerciseIndex);

    if (!weekData[key]) weekData[key] = [];
    const arr = weekData[key];
    while (arr.length < setsCount) {
        arr.push({ kg: 0, reps: 0, done: false });
    }
    if (arr.length > setsCount) {
        arr.length = setsCount;
    }
};

// Porównanie serii z poprzednim tygodniem -> klucz statusu (null gdy brak danych).
const getTrend = (curr, prev) => {
    if (!curr || !curr.done || !prev || !prev.done) return null;
    const cKg = parseFloat(curr.kg) || 0;
    const pKg = parseFloat(prev.kg) || 0;
    const cR = parseFloat(curr.reps) || 0;
    const pR = parseFloat(prev.reps) || 0;
    if (cKg > pKg) return "w-up";
    if (cKg < pKg) return "w-down";
    if (cR > pR) return "r-up";
    if (cR < pR) return "r-down";
    return "base";
};

const renderCurrentView = () => {
    // Statystyki i zarządzanie planem zawsze patrzą na najnowszy plan.
    // Plan/trening/home pokazują plan przypisany do wybranego tygodnia.
    const usesLatestPlan =
        currentView === "stats" || currentView === "manage" || currentView === "library";
    DAYS = usesLatestPlan ? CURRENT_PLAN : getWeekPlan(state.currentWeekIndex);

    const ctx = {
        state,
        DAYS,
        currentWeekIndex: state.currentWeekIndex,
        currentDayId,
        statsMaxCols,
        planCompactMode,
        getDayDateKey,
        getDayTimestampKey,
        getExerciseKey,
        getNoteKey,
        getWeekCompletion,
        getDayProgress,
        getTodayPlan,
        getWeekDaysUI,
        getWeekPlan,
        exerciseNameKey,
        ensureWorkoutDataExists,
        logBodyWeight,
        getTrend,
        currentProfileName,
        getWorkoutSessionSummary,
        isSessionSummaryOpen,
        startWorkoutSession,
        openWorkoutSummary,
        dismissWorkoutSummary,
        finishWorkout,
        getManagePlan: () => managePlan
    };

    try {
        if (currentView === "home") window.Views.renderHome(ctx);
        if (currentView === "plan") window.Views.renderPlan(ctx);
        if (currentView === "fullplan") window.Views.renderFullPlanPage(ctx);
        if (currentView === "stats") window.Views.renderStats(ctx);
        if (currentView === "history") window.Views.renderHistory(ctx);
        if (currentView === "library") {
            window.Views.renderLibrary(ctx);
            if (!window.ExerciseLib.isReady() && !window.ExerciseLib.getError()) {
                window.ExerciseLib.loadLibrary()
                    .then(() => {
                        window.Views.setLibraryLoaded(true, false);
                        if (currentView === "library") renderCurrentView();
                    })
                    .catch(() => {
                        window.Views.setLibraryLoaded(false, true);
                        if (currentView === "library") renderCurrentView();
                    });
            }
        }
        if (currentView === "workout") {
            window.Views.renderWorkout(ctx);
            updateSummary();
        }
        if (currentView === "manage") {
            window.Views.renderManage(ctx);
        }
    } catch (err) {
        console.error("Błąd renderowania widoku:", currentView, err);
        const screen = document.getElementById("screen-" + currentView);
        if (screen) {
            screen.innerHTML =
                '<div class="container" style="padding:24px"><div class="card"><p>Błąd ekranu. Kliknij Plan albo Home jeszcze raz.</p></div></div>';
        }
    }

    if (currentView === "workout") startSessionTicker();
    else stopSessionTicker();

    updateVisibleScreen();
    if (currentView === "plan" || currentView === "fullplan") {
        window.Views?.refreshWeekTabs?.();
    }
    updateBottomNav();
};

const updateVisibleScreen = () => {
    const screens = {
        home: document.getElementById("screen-home"),
        plan: document.getElementById("screen-plan"),
        fullplan: document.getElementById("screen-fullplan"),
        stats: document.getElementById("screen-stats"),
        history: document.getElementById("screen-history"),
        workout: document.getElementById("screen-workout"),
        library: document.getElementById("screen-library"),
        manage: document.getElementById("screen-manage")
    };

    Object.entries(screens).forEach(([key, el]) => {
        if (!el) return;
        el.classList.toggle("hidden", key !== currentView);
    });

    const bottomNav = document.getElementById("bottom-nav");
    if (bottomNav) bottomNav.classList.toggle("hidden", currentView === "workout");
};

const updateBottomNav = () => {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
        const view = btn.dataset.view;
        btn.classList.remove("active");

        if (currentView === "home" && view === "home") btn.classList.add("active");
        if ((currentView === "plan" || currentView === "fullplan") && view === "plan")
            btn.classList.add("active");
        if ((currentView === "stats" || currentView === "history") && view === "stats")
            btn.classList.add("active");
    });
};

/* ---- Historia przeglądarki = wstecz w aplikacji ---- */
// Dzięki wpisom w history.pushState gest/klawisz wstecz na Androidzie i iOS
// cofa ekran w aplikacji, zamiast od razu zamykać PWA.
let navHistoryReady = false;
let navApplyingHistory = false;

const getLibrarySelectedId = () =>
    window.Views && typeof window.Views.getLibrarySelectedId === "function"
        ? window.Views.getLibrarySelectedId()
        : null;

const isMoreSheetOpen = () => {
    const sheet = document.getElementById("more-sheet");
    return !!(sheet && sheet.classList.contains("open"));
};

const currentNavState = () => ({
    kubaNav: true,
    view: currentView,
    dayId: currentDayId,
    libId: getLibrarySelectedId(),
    sheet: isMoreSheetOpen(),
    week: state.currentWeekIndex,
    fullPlanReturnView
});

const writeNavState = (mode = "push") => {
    if (!window.history || navApplyingHistory) return;
    const prev = window.history.state;
    const prevDepth =
        prev && prev.kubaNav && typeof prev.depth === "number" ? prev.depth : 0;
    const next = currentNavState();

    if (mode === "reset") next.depth = 0;
    else if (mode === "replace") next.depth = prevDepth;
    else next.depth = prevDepth + 1;

    const method = mode === "push" ? "pushState" : "replaceState";
    window.history[method](next, "", window.location.href);
    navHistoryReady = true;
};

const resetNavHistory = () => {
    if (!window.history) return;
    const next = currentNavState();
    next.depth = 0;
    window.history.replaceState(next, "", window.location.href);
    navHistoryReady = true;
};

const syncNavHistory = () => {
    if (!navHistoryReady || !window.history || navApplyingHistory) return;
    const prev = window.history.state;
    const next = currentNavState();
    next.depth = prev && typeof prev.depth === "number" ? prev.depth : 0;
    window.history.replaceState(next, "", window.location.href);
};

const canGoBackInApp = () => {
    const st = window.history && window.history.state;
    return !!(st && st.kubaNav && typeof st.depth === "number" && st.depth > 0);
};

const goBackInApp = (fallback) => {
    if (navHistoryReady && canGoBackInApp()) {
        window.history.back();
        return true;
    }
    if (typeof fallback === "function") fallback();
    return false;
};

const applyNavState = (st) => {
    if (!st || !st.kubaNav) return false;
    navApplyingHistory = true;
    try {
        if (window.Views && typeof window.Views.setLibrarySelectedId === "function") {
            window.Views.setLibrarySelectedId(st.view === "library" ? st.libId || null : null);
        }
        if (typeof st.fullPlanReturnView === "string") {
            fullPlanReturnView = st.fullPlanReturnView;
        }
        if (Number.isInteger(st.week) && st.week >= 0 && st.week < state.weeks.length) {
            if (state.currentWeekIndex !== st.week) {
                state.currentWeekIndex = st.week;
                persistState();
            }
        }
        currentDayId = typeof st.dayId === "number" ? st.dayId : null;
        currentView = st.view || "home";
        if (st.sheet) openMoreSheet({ skipHistory: true });
        else closeMoreSheet({ skipHistory: true });
        renderCurrentView();
    } finally {
        navApplyingHistory = false;
    }
    return true;
};

const navigateTo = (view) => {
    const fromSheet = isMoreSheetOpen();
    const sameView = currentView === view && !fromSheet;
    currentView = view;
    if (view !== "library" && window.Views && window.Views.setLibrarySelectedId) {
        window.Views.setLibrarySelectedId(null);
    }
    closeMoreSheet({ skipHistory: true });
    renderCurrentView();
    if (sameView) syncNavHistory();
    else writeNavState(fromSheet ? "replace" : "push");
};

const navigateToWorkoutFromNav = () => {
    DAYS = getWeekPlan(state.currentWeekIndex);
    const todayPlan = getTodayPlan();

    if (todayPlan) {
        openDay(todayPlan.id);
        return;
    }

    if (currentDayId !== null) {
        openDay(currentDayId);
        return;
    }

    if (DAYS.length) {
        openDay(DAYS[0].id);
    }
};

const setWeek = (w) => {
    state.currentWeekIndex = w;
    persistState();
    renderCurrentView();
    syncNavHistory();
};

const setPlanMode = (fullPlan) => {
    planCompactMode = !fullPlan;
    renderCurrentView();
};

const openFullPlan = () => {
    if (currentView !== "fullplan") {
        fullPlanReturnView = currentView || "plan";
    }
    navigateTo("fullplan");
};

const closeFullPlan = () => {
    goBackInApp(() => {
        currentView = fullPlanReturnView || "plan";
        renderCurrentView();
        writeNavState("replace");
    });
};

const goBackFromHistory = () => {
    goBackInApp(() => {
        currentView = "stats";
        renderCurrentView();
        writeNavState("replace");
    });
};

const openDay = (id) => {
    const day = DAYS.find((d) => d.id === id);
    if (!day) return;

    const sameWorkout = currentView === "workout" && currentDayId === id;
    currentDayId = id;
    const weekData = state.weeks[state.currentWeekIndex];
    const dayKey = getDayDateKey(id);

    if (!weekData[dayKey]) {
        const now = new Date();
        weekData[dayKey] = now.toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
            weekday: "short"
        });
        weekData[getDayTimestampKey(id)] = now.getTime();
    }

    day.exercises.forEach((ex, ei) => {
        ensureWorkoutDataExists(id, ei, ex.sets);
    });
    prepareWorkoutSession(id);

    persistState();
    currentView = "workout";
    renderCurrentView();
    if (sameWorkout) syncNavHistory();
    else writeNavState("push");
};

const goBackFromWorkout = () => {
    goBackInApp(() => {
        currentView = "plan";
        renderCurrentView();
        writeNavState("replace");
    });
};

const toggleNoteBox = (ei) => {
    const box = document.getElementById(`note-box-${ei}`);
    if (box) box.classList.toggle("hidden");
};

const updateNote = (ei, val) => {
    if (currentDayId === null) return;

    const weekData = state.weeks[state.currentWeekIndex];
    const noteKey = getNoteKey(currentDayId, ei);

    weekData[noteKey] = val;

    clearTimeout(noteSaveTimeout);
    noteSaveTimeout = setTimeout(() => {
        persistState();
    }, 250);

    const btn = document.getElementById(`note-toggle-${ei}`);
    if (btn) {
        btn.classList.toggle("active", !!val.trim());
        btn.textContent = window.renderNoteBtnLabel(!!val.trim());
    }
};

const updateSet = (ei, i, field, val) => {
    if (currentDayId === null) return;

    const key = getExerciseKey(currentDayId, ei);
    if (!state.weeks[state.currentWeekIndex][key]) return;

    state.weeks[state.currentWeekIndex][key][i][field] = parseFloat(val) || 0;
    persistState();
};

/* ---- Timer odpoczynku między seriami ---- */
const restTimer = { duration: 0, remaining: 0, deadline: 0, interval: null, bar: null };
const REST_DEADLINE_KEY = "kubagym_restTimerDeadline";

const formatRestTime = (s) => {
    const sec = Math.max(0, Math.ceil(s));
    const m = Math.floor(sec / 60);
    const r = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

const getRestTimerBar = () => {
    if (restTimer.bar) return restTimer.bar;
    restTimer.bar = document.getElementById("rest-timer-bar");
    return restTimer.bar || null;
};

// Licznik działa na bazie chwili docelowej (Date.now()), więc działa też,
// gdy przeglądarka wstrzymuje setTimeout/setInterval (gasi ekran telefonu
// albo zwija kartę). Po obudzeniu wartości poprawiają się do realnego czasu.
const tickRestTimer = () => {
    const remaining = (restTimer.deadline - Date.now()) / 1000;
    restTimer.remaining = remaining;
    if (remaining <= 0) {
        stopRestTimer(true);
        return;
    }
    updateRestTimerUI();
};

const startRestTimer = (seconds) => {
    const bar = getRestTimerBar();
    if (!bar) return;
    restTimer.duration = seconds;
    restTimer.deadline = Date.now() + Math.max(0, seconds) * 1000;
    restTimer.remaining = seconds;
    if (restTimer.interval) { clearInterval(restTimer.interval); restTimer.interval = null; }
    bar.classList.add("open");
    updateRestTimerUI();
    try { localStorage.setItem(REST_DEADLINE_KEY, String(restTimer.deadline)); } catch (e) { /* ignore */ }
    restTimer.interval = setInterval(tickRestTimer, 250);
};

const addRestTime = (sec) => {
    const bar = getRestTimerBar();
    if (!bar || !bar.classList.contains("open")) return;
    restTimer.deadline += sec * 1000;
    restTimer.remaining = (restTimer.deadline - Date.now()) / 1000;
    try { localStorage.setItem(REST_DEADLINE_KEY, String(restTimer.deadline)); } catch (e) { /* ignore */ }
    updateRestTimerUI();
};

const updateRestTimerUI = () => {
    const bar = getRestTimerBar();
    if (!bar) return;
    const time = bar.querySelector(".rest-timer-time");
    if (!time) return;
    time.textContent = formatRestTime(restTimer.remaining);
    time.classList.toggle("done", restTimer.remaining <= 0);
};

const stopRestTimer = (_finished) => {
    if (restTimer.interval) {
        clearInterval(restTimer.interval);
        restTimer.interval = null;
    }
    restTimer.duration = 0;
    restTimer.deadline = 0;
    restTimer.remaining = 0;
    try { localStorage.removeItem(REST_DEADLINE_KEY); } catch (e) { /* ignore */ }
    const bar = getRestTimerBar();
    if (bar) {
        bar.classList.remove("open");
        const time = bar.querySelector(".rest-timer-time");
        if (time) time.classList.remove("done");
    }
};

// Wznawia licznik po ponownym otwarciu aplikacji, jeśli telefon uśpił
// stronę w trakcie odpoczynku (deadline zapisany w localStorage).
const restoreRestTimer = () => {
    let deadline = 0;
    try { deadline = Number(localStorage.getItem(REST_DEADLINE_KEY)) || 0; } catch (e) { /* ignore */ }
    if (!(deadline > 0)) return;
    const seconds = (deadline - Date.now()) / 1000;
    if (seconds > 0) {
        const bar = getRestTimerBar();
        if (!bar) return;
        restTimer.duration = seconds;
        restTimer.deadline = deadline;
        restTimer.remaining = seconds;
        if (restTimer.interval) { clearInterval(restTimer.interval); restTimer.interval = null; }
        bar.classList.add("open");
        updateRestTimerUI();
        restTimer.interval = setInterval(tickRestTimer, 250);
    } else {
        try { localStorage.removeItem(REST_DEADLINE_KEY); } catch (e) { /* ignore */ }
    }
};

const attachTimerWakeHandler = () => {
    const onWake = () => {
        if (restTimer.deadline > 0) {
            if (restTimer.deadline - Date.now() <= 0) stopRestTimer(true);
            else updateRestTimerUI();
        }
    };
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) onWake();
    });
    window.addEventListener("pageshow", onWake);
};
attachTimerWakeHandler();

/* ---- Sesja treningowa: czas, rekordy i podsumowanie ---- */
const getSessionStartKey = (dayId) => `day_${dayId}_sessionStart`;
const getSessionEndKey = (dayId) => `day_${dayId}_sessionEnd`;

let sessionSummaryKey = null;
let sessionTickerId = null;
const prAnnounced = new Set();

const isLiveWeek = () => {
    if (!state || !state.startSunday) return false;
    const weekStart = kubaWeekStart(state.startSunday, state.currentWeekIndex);
    return weekStart !== null && weekStart === window.Utils.getCurrentSunday().getTime();
};

const getBestDoneSet = (sets = []) => {
    let best = null;
    (sets || []).forEach((set) => {
        if (!set || !set.done) return;
        const kg = Number(set.kg) || 0;
        const reps = Number(set.reps) || 0;
        if (kg <= 0 && reps <= 0) return;
        if (!best || kg > best.kg || (kg === best.kg && reps > best.reps)) {
            best = { kg, reps };
        }
    });
    return best;
};

const isBetterSet = (current, previous) => {
    if (!current || !previous) return false;
    return current.kg > previous.kg || (current.kg === previous.kg && current.reps > previous.reps);
};

const getPreviousExerciseBest = (exerciseName, beforeWeekIndex) => {
    const nameKey = exerciseNameKey(exerciseName);
    let best = null;

    for (let wi = 0; wi < beforeWeekIndex; wi += 1) {
        const weekData = state.weeks[wi] || {};
        const plan =
            state.weekPlans && Array.isArray(state.weekPlans[wi]) && state.weekPlans[wi].length
                ? state.weekPlans[wi]
                : getPlanForWeekIndex(wi, weekData);

        (plan || []).forEach((day) => {
            (day.exercises || []).forEach((ex, ei) => {
                if (exerciseNameKey(ex && ex.name) !== nameKey) return;
                const candidate = getBestDoneSet(weekData[getExerciseKey(day.id, ei)] || []);
                if (candidate && (!best || isBetterSet(candidate, best))) best = candidate;
            });
        });
    }

    return best;
};

const formatSessionSet = (set) =>
    set && set.kg > 0
        ? `${window.Utils.formatNumberPL(set.kg)} kg × ${set.reps}`
        : set
            ? `${set.reps} powt.`
            : "—";

const describeSetGain = (current, previous) => {
    if (!current || !previous) return "";
    if (current.kg > previous.kg) {
        return `+${window.Utils.formatNumberPL(current.kg - previous.kg)} kg`;
    }
    if (current.reps > previous.reps) {
        return `+${current.reps - previous.reps} powt.`;
    }
    return "";
};

const getWorkoutSessionSummary = (dayId) => {
    const day = DAYS.find((d) => d && d.id === dayId) || null;
    const weekData = state.weeks[state.currentWeekIndex] || {};
    if (!day) return null;

    const startedAt = Number(weekData[getSessionStartKey(dayId)]) || 0;
    const endedAt = Number(weekData[getSessionEndKey(dayId)]) || 0;
    const durationMs = startedAt ? Math.max(0, (endedAt || Date.now()) - startedAt) : 0;

    let totalSets = 0;
    let doneSets = 0;
    const totalExercises = day.exercises.length;
    let completedExercises = 0;
    let volume = 0;
    const prs = [];

    day.exercises.forEach((ex, ei) => {
        const planned = Math.max(0, Number(ex.sets) || 0);
        const sets = weekData[getExerciseKey(dayId, ei)] || [];
        const done = Math.min(sets.filter((s) => s && s.done).length, planned);
        totalSets += planned;
        doneSets += done;
        if (planned > 0 && done >= planned) completedExercises += 1;

        sets.forEach((set) => {
            if (!set || !set.done) return;
            volume += (Number(set.kg) || 0) * (Number(set.reps) || 0);
        });

        const currentBest = getBestDoneSet(sets);
        const previousBest = getPreviousExerciseBest(ex.name, state.currentWeekIndex);
        if (currentBest && isBetterSet(currentBest, previousBest)) {
            prs.push({
                name: window.Utils.stripSupersetTag(ex.name),
                current: currentBest,
                previous: previousBest,
                gain: describeSetGain(currentBest, previousBest)
            });
        }
    });

    return {
        isLive: isLiveWeek(),
        startedAt,
        endedAt,
        durationMs,
        doneSets,
        totalSets,
        totalExercises,
        completedExercises,
        volume,
        prs
    };
};

// Sesję uruchamia użytkownik przyciskiem "Rozpocznij trening". Przy wejściu
// usuwamy tylko porzucony pusty start z poprzedniego dnia.
const prepareWorkoutSession = (dayId) => {
    if (!isLiveWeek()) return;
    const weekData = state.weeks[state.currentWeekIndex] || {};
    const startKey = getSessionStartKey(dayId);
    const endKey = getSessionEndKey(dayId);
    const day = DAYS.find((d) => d && d.id === dayId) || null;
    if (!day || !weekData[startKey]) return;

    const hasDone = day.exercises.some((ex, ei) => {
        const sets = weekData[getExerciseKey(dayId, ei)] || [];
        return sets.some((set) => set && set.done);
    });
    if (hasDone) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if ((Number(weekData[startKey]) || 0) < todayStart.getTime()) {
        delete weekData[startKey];
        delete weekData[endKey];
        if (isSessionSummaryOpen(dayId)) sessionSummaryKey = null;
    }
};

const startWorkoutSession = () => {
    if (currentDayId === null || !isLiveWeek()) return;
    const weekData = state.weeks[state.currentWeekIndex] || {};
    const startKey = getSessionStartKey(currentDayId);
    const endKey = getSessionEndKey(currentDayId);

    if (weekData[startKey]) {
        if (isSessionSummaryOpen(currentDayId)) {
            sessionSummaryKey = null;
            renderCurrentView();
        }
        return;
    }

    weekData[startKey] = Date.now();
    delete weekData[endKey];
    sessionSummaryKey = null;
    persistState();
    renderCurrentView();
};

const sessionKeyFor = (dayId) => `${state.currentWeekIndex}|${dayId}`;

const isSessionSummaryOpen = (dayId) => sessionSummaryKey === sessionKeyFor(dayId);

const openWorkoutSummary = (dayId = currentDayId) => {
    if (dayId === null || dayId === undefined) return;
    sessionSummaryKey = sessionKeyFor(dayId);
    renderCurrentView();
};

const dismissWorkoutSummary = () => {
    sessionSummaryKey = null;
    renderCurrentView();
};

const finishWorkout = () => {
    if (currentDayId === null) return;
    const weekData = state.weeks[state.currentWeekIndex] || {};
    const startKey = getSessionStartKey(currentDayId);
    const endKey = getSessionEndKey(currentDayId);

    if (!weekData[startKey]) weekData[startKey] = Date.now();
    if (!weekData[endKey]) weekData[endKey] = Date.now();
    sessionSummaryKey = sessionKeyFor(currentDayId);

    stopRestTimer(true);
    persistState();
    launchConfetti(110);
    renderCurrentView();
};

// Automatyczne zakończenie sesji, gdy ostatnia zaplanowana seria jest gotowa.
const checkSessionCompletion = (showCompletionToast = true) => {
    if (currentDayId === null || !isLiveWeek()) return false;
    const day = DAYS.find((d) => d && d.id === currentDayId) || null;
    if (!day) return false;

    const weekData = state.weeks[state.currentWeekIndex] || {};
    const allDone = day.exercises.every((ex, ei) => {
        const planned = Math.max(0, Number(ex.sets) || 0);
        const sets = weekData[getExerciseKey(currentDayId, ei)] || [];
        return sets.filter((set) => set && set.done).length >= planned;
    });
    if (!allDone) return false;

    const startKey = getSessionStartKey(currentDayId);
    const endKey = getSessionEndKey(currentDayId);
    if (!weekData[startKey]) weekData[startKey] = Date.now();
    if (weekData[endKey]) return false;

    weekData[endKey] = Date.now();
    sessionSummaryKey = sessionKeyFor(currentDayId);
    launchConfetti(130);
    if (showCompletionToast) {
        showToast("Trening ukończony!", {
            type: "success",
            icon: "✅",
            sub: "Wszystkie serie zaliczone — zobacz podsumowanie",
            duration: 3600
        });
    }
    return true;
};

const updateSessionTimerUI = () => {
    const timeEl = document.getElementById("workout-session-time");
    const timerEl = document.getElementById("workout-session-timer");
    if (!timeEl || currentDayId === null) return;

    const weekData = state.weeks[state.currentWeekIndex] || {};
    const startedAt = Number(weekData[getSessionStartKey(currentDayId)]) || 0;
    const endedAt = Number(weekData[getSessionEndKey(currentDayId)]) || 0;

    if (!startedAt) {
        timeEl.textContent = "00:00";
        if (timerEl) timerEl.classList.remove("running", "done");
        return;
    }

    const end = endedAt || Date.now();
    timeEl.textContent = window.Utils.formatDuration(end - startedAt);
    if (timerEl) {
        timerEl.classList.toggle("running", !endedAt);
        timerEl.classList.toggle("done", !!endedAt);
    }
};

const stopSessionTicker = () => {
    if (sessionTickerId) {
        clearInterval(sessionTickerId);
        sessionTickerId = null;
    }
};

const startSessionTicker = () => {
    stopSessionTicker();
    updateSessionTimerUI();
    if (currentView !== "workout" || currentDayId === null) return;

    const weekData = state.weeks[state.currentWeekIndex] || {};
    const startedAt = Number(weekData[getSessionStartKey(currentDayId)]) || 0;
    const endedAt = Number(weekData[getSessionEndKey(currentDayId)]) || 0;
    if (startedAt && !endedAt) {
        sessionTickerId = setInterval(updateSessionTimerUI, 1000);
    }
};

/* ---- Konfetti (bez dźwięku) ---- */
let confettiRaf = null;
const launchConfetti = (count = 120) => {
    if (
        typeof document === "undefined" ||
        (typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
        return;
    }

    let canvas = document.getElementById("confetti-canvas");
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = "confetti-canvas";
        canvas.className = "confetti-canvas";
        canvas.setAttribute("aria-hidden", "true");
        document.body.appendChild(canvas);
    }

    if (confettiRaf) {
        cancelAnimationFrame(confettiRaf);
        confettiRaf = null;
    }

    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) {
        canvas.remove();
        return;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const colors = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#22d3ee", "#f0abfc"];
    const particles = Array.from({ length: count }, () => {
        const angle = (-110 + Math.random() * 40) * (Math.PI / 180);
        const speed = 8 + Math.random() * 10;
        return {
            x: width * (0.18 + Math.random() * 0.64),
            y: height * (0.62 + Math.random() * 0.18),
            vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
            vy: Math.sin(angle) * speed - Math.random() * 5,
            w: 5 + Math.random() * 6,
            h: 8 + Math.random() * 8,
            rot: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 0.32,
            color: colors[Math.floor(Math.random() * colors.length)],
            wobble: Math.random() * Math.PI * 2
        };
    });

    const started = performance.now();
    const tick = (now) => {
        const elapsed = now - started;
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p) => {
            p.vy += 0.24;
            p.vx *= 0.992;
            p.x += p.vx + Math.sin((now - started) / 180 + p.wobble) * 0.35;
            p.y += p.vy;
            p.rot += p.spin;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.globalAlpha = Math.max(0, 1 - elapsed / 3200);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        if (elapsed < 3200) {
            confettiRaf = requestAnimationFrame(tick);
        } else {
            confettiRaf = null;
            ctx.clearRect(0, 0, width, height);
            canvas.remove();
        }
    };
    confettiRaf = requestAnimationFrame(tick);
};

const toggleSet = (ei, i) => {
    if (currentDayId === null) return;

    const weekData = state.weeks[state.currentWeekIndex];
    const key = getExerciseKey(currentDayId, ei);
    const set = weekData[key][i];
    set.done = !set.done;

    const day = DAYS.find((d) => d && d.id === currentDayId) || null;
    const ex = day ? day.exercises[ei] : null;

    if (isLiveWeek()) {
        delete weekData[getSessionEndKey(currentDayId)];
        if (isSessionSummaryOpen(currentDayId)) sessionSummaryKey = null;

        if (!weekData[getSessionStartKey(currentDayId)]) {
            weekData[getSessionStartKey(currentDayId)] = Date.now();
        }
    }

    let supersetPending = null;
    let newPR = null;

    if (set.done && ex) {
        if (day) {
            const info = window.Utils.getSupersetInfo(day.exercises, ei);
            if (info && info.partnerIndex !== null) {
                const partnerKey = getExerciseKey(currentDayId, info.partnerIndex);
                const partnerSet = (weekData[partnerKey] || [])[i];
                if (partnerSet && !partnerSet.done) {
                    supersetPending = {
                        name: window.Utils.stripSupersetTag(day.exercises[info.partnerIndex].name),
                        setIndex: i
                    };
                }
            }
        }

        if (isLiveWeek()) {
            const currentBest = getBestDoneSet([set]);
            const previousBest = getPreviousExerciseBest(ex.name, state.currentWeekIndex);
            const prKey = `${state.currentWeekIndex}|${currentDayId}|${exerciseNameKey(ex.name)}`;
            if (isBetterSet(currentBest, previousBest) && !prAnnounced.has(prKey)) {
                prAnnounced.add(prKey);
                newPR = { current: currentBest, previous: previousBest };
            }
        }
    }

    if (set.done) {
        if (!supersetPending) {
            const settings = state.settings || {};
            if (settings.restEnabled !== false) {
                let seconds = window.Utils.defaultRestSeconds(ex && ex.reps);
                if (ex && Number(ex.rest) > 0) seconds = Number(ex.rest);
                if (!(seconds > 0)) seconds = Number(settings.restSeconds) > 0 ? Number(settings.restSeconds) : 90;
                startRestTimer(seconds);
            }
        }

        if (newPR && ex) {
            showToast("Nowy rekord!", {
                type: "pr",
                icon: "🏆",
                sub: `${window.Utils.stripSupersetTag(ex.name)} · ${formatSessionSet(newPR.current)}${newPR && describeSetGain(newPR.current, newPR.previous) ? ` · ${describeSetGain(newPR.current, newPR.previous)}` : ""}`,
                duration: 4300
            });
            launchConfetti(120);
        } else if (supersetPending) {
            showToast(`Superset · teraz ${supersetPending.name}`, {
                type: "ss",
                icon: "⇄",
                sub: `Seria ${supersetPending.setIndex + 1}`,
                duration: 2400
            });
        }
    }

    const completedNow = checkSessionCompletion(!newPR);
    if (completedNow) stopRestTimer(true);
    persistState();
    renderCurrentView();

    if (isSessionSummaryOpen(currentDayId)) {
        document.querySelector(".session-summary-card")?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
            block: "start"
        });
    }
};

const toggleExerciseExpand = (ei) => {
    if (currentDayId === null) return;
    if (window.Views.toggleExExpand) window.Views.toggleExExpand(currentDayId, ei);
    renderCurrentView();
};

const updateSummary = () => {
    if (currentDayId === null) return;

    const weekData = state.weeks[state.currentWeekIndex];
    let total = 0;
    let done = 0;

    Object.keys(weekData).forEach((key) => {
        if (key.startsWith(`d${currentDayId}_`) && !key.endsWith("_note") && Array.isArray(weekData[key])) {
            weekData[key].forEach((s) => {
                total++;
                if (s.done) done++;
            });
        }
    });

    const doneEl = document.getElementById("s-done");
    const pctEl = document.getElementById("s-pct");

    if (doneEl) doneEl.textContent = done;
    if (pctEl) pctEl.textContent = total ? `${Math.round((done / total) * 100)}%` : "0%";
};

const resetWorkoutSession = () => {
    if (currentDayId === null) return;

    const weekData = state.weeks[state.currentWeekIndex] || {};

    // Reset dotyczy tylko sesji (timera), nie wywala zaliczonych serii,
    // notatek ani ciezarow. Dzieki temu mozna zaczac sesje od nowa.
    delete weekData[getSessionStartKey(currentDayId)];
    delete weekData[getSessionEndKey(currentDayId)];

    sessionSummaryKey = null;
    if (state.currentWeekIndex >= 0) {
        const prefix = `${state.currentWeekIndex}|${currentDayId}|`;
        Array.from(prAnnounced).forEach((key) => {
            if (key.startsWith(prefix)) prAnnounced.delete(key);
        });
    }

    stopRestTimer(true);
    persistState();
    renderCurrentView();
    showToast("Sesja zresetowana", {
        icon: "↺",
        sub: "Serie i notatki zostały zachowane",
        duration: 2200
    });
};

const showProfileGate = () => {
    const gate = document.getElementById("profile-gate");
    if (gate) gate.classList.remove("hidden");
    resetNavHistory();
};

const hideProfileGate = () => {
    const gate = document.getElementById("profile-gate");
    if (gate) gate.classList.add("hidden");
};

const chooseProfile = async (profileId) => {
    const meta = window.StorageModule.profileMeta(profileId);
    if (!meta || !meta.id) return;
    window.StorageModule.setSelectedProfileId(meta.id);
    hideProfileGate();
    await bootWithUser(meta.id, meta.plan, meta.name);
};

/* ---- Migracje planu (odpalenie raz, per profil) ---- */
const KUBA_LEGS_V2_DAY = 2;
const KUBA_LEGS_V2_MAP = [2, 1, null, 3, 4, 5, 6, 7];

const runPlanMigrations = (planKey) => {
    const hadLegs = state.migrations && state.migrations["kuba_legs_v2"];
    const hadPlanV3 = state.migrations && state.migrations["kuba_plan_v3"];
    const hadPlanV4 = state.migrations && state.migrations["kuba_plan_v4"];
    const hadPlanV5 = state.migrations && state.migrations["kuba_plan_v5"];
    const hadPlanV5Now = state.migrations && state.migrations["kuba_plan_v5_now"];
    const hadRepair = state.migrations && state.migrations["kuba_plan_v3_repair"];
    const hadHistory = state.migrations && state.migrations["kuba_plan_history_v1"];
    const hadHistoryV2 = state.migrations && state.migrations["kuba_plan_history_v2"];
    const hadHistoryV3 = state.migrations && state.migrations["kuba_plan_history_v3"];
    const hadRdlHam = state.migrations && state.migrations["kuba_rdl_ham_v1"];
    const hadBartekPlan = state.migrations && state.migrations["bartek_kuba_plan_v1"];

    if (planKey === "kuba" && !hadLegs) {
        state.weeks = (state.weeks || []).map((week) =>
            window.Utils.reorderDayLogs(week || {}, KUBA_LEGS_V2_DAY, KUBA_LEGS_V2_MAP)
        );

        if (state.customPlan && Array.isArray(state.customPlan[KUBA_LEGS_V2_DAY])) {
            state.customPlan[KUBA_LEGS_V2_DAY] = KUBA_LEGS.map((ex) => ({ ...ex }));
        }

        state.migrations["kuba_legs_v2"] = true;
    }

    // Plan Kuby v3: nowe ćwiczenia od BIEŻĄCEGO tygodnia.
    // Starszych tygodni nie ruszamy — historia sprzed zmiany zostaje bez zmian.
    if (planKey === "kuba" && state.migrations && !state.migrations["kuba_plan_v3"]) {
        const REORDER = {
            0: [0, 1, 2, 3, 4, 5, null], // PUSH — ostatni slot to nowe ćwiczenie
            1: [0, 1, 3, null, 5, 6], // PULL — Reverse Peck Deck wyżej, Face Pull nowy
        };
        const lastIdx = (state.weeks || []).length - 1;
        if (lastIdx >= 0) {
            let out = state.weeks[lastIdx] || {};
            Object.keys(REORDER).forEach((dayId) => {
                out = window.Utils.reorderDayLogs(out, Number(dayId), REORDER[dayId]);
            });
            state.weeks[lastIdx] = out;
        }

        // Jeśli profil ma własne edycje planu, nadpisz je nowym planem Kuby,
        // inaczej stare customPlan przesłoniłoby nowe ćwiczenia.
        if (state.customPlan && Object.keys(state.customPlan).length) {
            getPlanByKey("kuba").forEach((day) => {
                state.customPlan[day.id] = day.exercises.map((ex) => ({ ...ex }));
            });
        }

        state.migrations["kuba_plan_v3"] = true;
    }

    // Plan Kuby v4 (od 15.11.2026): Incline Hammer Curl przechodzi do PULL,
    // a w nogach pojawia się Hyperextension. Nie ruszamy zapisanych tygodni —
    // plan v3 zostaje w tygodniach 8–14.11.2026, a v4 powstaje dopiero w
    // nowym tygodniu. Nadpisujemy tylko customPlan, żeby stare edycje nie
    // przesłoniły nowego planu. Późniejsza migracja v5 poprawia kolejność
    // i zakres powtórzeń Incline Hammer Curl.
    if (planKey === "kuba" && state.migrations && !hadPlanV4) {
        if (state.customPlan && Object.keys(state.customPlan).length) {
            getPlanByKey("kuba").forEach((day) => {
                state.customPlan[day.id] = day.exercises.map((ex) => ({ ...ex }));
            });
        }

        state.migrations["kuba_plan_v4"] = true;
    }

    // Naprawa po v74: tamta migracja przestawiła dane we WSZYSTKICH tygodniach
    // na nowy układ PULL. Przywracamy stary układ w tygodniach sprzed zmiany,
    // żeby nazwy z zamrożonego planu trafiały na właściwe wpisy. Ćwiczenia
    // usunięte z planu (Seated Cable Row, Dumbbell Shrugs) były już wtedy
    // skasowane — ich sloty zostają puste, reszta wraca na swoje miejsce.
    if (planKey === "kuba" && state.startSunday && state.migrations && !hadRepair) {
        const boundary = Math.floor((KUBA_PLAN_V3_START - state.startSunday) / WEEK_MS);

        const hasLoad = (arr) =>
            Array.isArray(arr) &&
            arr.some((s) => s && (Number(s.kg) > 0 || Number(s.reps) > 0 || s.done));

        const looksShifted = (week) => {
            if (!week) return false;
            const hasPull = Object.keys(week).some(
                (k) => k.startsWith("d1_e") && !k.endsWith("_note")
            );
            if (!hasPull) return false;
            // Po przestawieniu Reverse Peck Deck (e3) i Wrist Curl (e6) są puste.
            return !hasLoad(week["d1_e3"]) && !hasLoad(week["d1_e6"]);
        };

        state.weeks = (state.weeks || []).map((week, idx) => {
            if (idx >= boundary || !looksShifted(week)) return week;
            return window.Utils.reorderDayLogs(week, 1, [0, 1, null, 2, null, 4, 5]);
        });

        state.migrations["kuba_plan_v3_repair"] = true;
    }

    // Odtworzenie właściwego planu dla każdego starego tygodnia. Jeden
    // zamrożony plan nie wystarczał, bo Kuba zmieniał plan kilka razy
    // (Incline Dumbbell Press, liczba serii wiosłowań, Weighted Pull Ups).
    if (planKey === "kuba" && state.startSunday && state.migrations && !hadHistory) {
        if (!state.weekPlans || typeof state.weekPlans !== "object" || Array.isArray(state.weekPlans)) {
            state.weekPlans = {};
        }

        const boundary = Math.max(
            0,
            Math.floor((KUBA_PLAN_V3_START - state.startSunday) / WEEK_MS)
        );

        (state.weeks || []).forEach((week, idx) => {
            if (idx >= boundary) return;
            const weekStart = kubaWeekStart(state.startSunday, idx);
            if (weekStart === null) return;
            state.weekPlans[idx] = buildKubaHistoricalPlan(weekStart, week || {});
        });

        state.migrations["kuba_plan_history_v1"] = true;
    }

    // v78 zapisywało flagę kuba_plan_history_v1, ale u części profili snapshoty
    // zdążyły już powstać z nowego planu (Smith) i migracja ich nie naprawiła.
    // v79 wymusza ponowne odtworzenie planów wszystkich tygodni sprzed zmiany.
    if (planKey === "kuba" && state.startSunday && state.migrations && !hadHistoryV2) {
        if (!state.weekPlans || typeof state.weekPlans !== "object" || Array.isArray(state.weekPlans)) {
            state.weekPlans = {};
        }

        const boundary = Math.max(
            0,
            Math.floor((KUBA_PLAN_V3_START - state.startSunday) / WEEK_MS)
        );

        (state.weeks || []).forEach((week, idx) => {
            if (idx >= boundary) return;
            const weekStart = kubaWeekStart(state.startSunday, idx);
            if (weekStart === null) return;
            state.weekPlans[idx] = buildKubaHistoricalPlan(weekStart, week || {});
        });

        state.migrations["kuba_plan_history_v2"] = true;
    }

    // v98: poprzednie migracje odtwarzały jeden zamrożony plan dla wszystkich
    // starych tygodni. Przez to serie z pierwszego planu dostawały późniejsze
    // nazwy (np. Bulgarian Split jako RDL, Rozpiętki jako Chest Dips).
    // Odtwarzamy plany z właściwej ery, nie ruszając snapshotów od 8.11.2026.
    if (planKey === "kuba" && state.startSunday && state.migrations && !hadHistoryV3) {
        if (!state.weekPlans || typeof state.weekPlans !== "object" || Array.isArray(state.weekPlans)) {
            state.weekPlans = {};
        }

        const boundary = Math.max(
            0,
            Math.floor((KUBA_PLAN_V3_START - state.startSunday) / WEEK_MS)
        );

        (state.weeks || []).forEach((week, idx) => {
            if (idx >= boundary) return;
            const weekStart = kubaWeekStart(state.startSunday, idx);
            if (weekStart === null) return;
            state.weekPlans[idx] = buildKubaHistoricalPlan(weekStart, week || {});
        });

        state.migrations["kuba_plan_history_v3"] = true;
    }

    if (state.migrations && !state.migrations["reps_sets_v3"]) {
        if (state.customPlan && typeof state.customPlan === "object") {
            Object.keys(state.customPlan).forEach((dayKey) => {
                const list = state.customPlan[dayKey];
                if (!Array.isArray(list)) return;
                list.forEach((ex) => {
                    if (!ex || !ex.name) return;
                    if (/Hammer Curl/.test(ex.name)) ex.reps = "8-10";
                    if (/Skull Crushers/.test(ex.name)) ex.reps = "8-10";
                    if (/Weighted Pull Ups/.test(ex.name)) ex.sets = 3;
                });
            });
        }
        state.migrations["reps_sets_v3"] = true;
    }

    // Plan Kuby v5 (poprawka v4): Incline Hammer Curl trafia do PULL zaraz po
    // EZ-bar Reverse Curl (3 x 8-12), a w nogach zostaje Hyperextension [SS]
    // (2 x 10-12). Nadpisujemy tylko customPlan — tygodnie i ich zapisane serie
    // przepina osobna migracja poniżej.
    if (planKey === "kuba" && state.migrations && !hadPlanV5) {
        if (state.customPlan && Object.keys(state.customPlan).length) {
            getPlanByKey("kuba").forEach((day) => {
                state.customPlan[day.id] = day.exercises.map((ex) => ({ ...ex }));
            });
        }

        state.migrations["kuba_plan_v5"] = true;
    }

    // Plan Kuby v5 obowiązuje już od bieżącego tygodnia (8.11.2026).
    // Poprzednia migracja mogła zostawić ten tydzień na v3, dlatego tutaj
    // podmieniamy plan tygodnia i przepinamy zapisane serie na nowe indeksy.
    // PULL v3: [.., EZ-bar, Wrist Curl] -> v5: [.., EZ-bar, Incline Hammer, Wrist Curl]
    // PULL v4: [.., Incline Hammer, EZ-bar, Wrist] -> v5: [.., EZ-bar, Incline Hammer, Wrist]
    // LEGS v3: [.., Incline Hammer [SS], Calf] -> v5: [.., Hyperextension, Calf]
    if (planKey === "kuba" && state.migrations && !hadPlanV5Now) {
        const v5Plan = buildCurrentPlan();
        const startIdx = state.startSunday
            ? Math.max(0, Math.floor((KUBA_PLAN_V5_START - state.startSunday) / WEEK_MS))
            : 0;

        for (let idx = startIdx; idx < (state.weeks || []).length; idx++) {
            const weekStart = kubaWeekStart(state.startSunday, idx);
            if (weekStart === null || weekStart < KUBA_PLAN_V5_START) continue;

            let weekData = state.weeks[idx] || {};
            const oldPlan = state.weekPlans ? state.weekPlans[idx] : null;
            const oldPull = oldPlan && oldPlan[1] ? oldPlan[1].exercises : null;
            const oldLegs = oldPlan && oldPlan[2] ? oldPlan[2].exercises : null;

            if (Array.isArray(oldPull) && oldPull.length) {
                if (oldPull[5] && oldPull[5].name === "Barbell Wrist Curl") {
                    // v3 -> v5
                    weekData = window.Utils.reorderDayLogs(weekData, 1, [0, 1, 2, 3, 4, null, 5]);
                } else if (oldPull[4] && oldPull[4].name === "Incline Hammer Curl") {
                    // v4 -> v5
                    weekData = window.Utils.reorderDayLogs(weekData, 1, [0, 1, 2, 3, 5, 4, 6]);
                }
            }

            if (
                Array.isArray(oldLegs) &&
                oldLegs[6] &&
                oldLegs[6].name === "Incline Hammer Curl [SS]"
            ) {
                // v3 -> v5. Hyperextension to nowe ćwiczenie, więc nie dziedziczy
                // danych po usuniętym Incline Hammer Curl [SS].
                weekData = window.Utils.reorderDayLogs(
                    weekData,
                    2,
                    [0, 1, 2, 3, 4, 5, null, 7]
                );
            }

            state.weeks[idx] = weekData;
            state.weekPlans[idx] = fitPlanSetsToWeek(copyPlan(v5Plan), weekData);
        }

        state.migrations["kuba_plan_v5_now"] = true;
    }

    // v87: RDL to ćwiczenie dwugłowych, a nie osobna partia "LEGS".
    // Usuwamy sztuczną kategorię z objętości i ze starych snapshotów planu.
    if (planKey === "kuba" && state.migrations && !hadRdlHam) {
        const isRdlWithLegsTag = (ex) => {
            if (!ex || typeof ex.name !== "string") return false;
            if (!/^RDL(\s|\(|$)/i.test(ex.name.trim())) return false;
            return String(ex.tag || "").trim().toUpperCase() === "LEGS";
        };

        if (state.customPlan && typeof state.customPlan === "object") {
            Object.keys(state.customPlan).forEach((dayKey) => {
                const list = state.customPlan[dayKey];
                if (!Array.isArray(list)) return;
                state.customPlan[dayKey] = list.map((ex) =>
                    isRdlWithLegsTag(ex) ? { ...ex, tag: "HAM" } : ex
                );
            });
        }

        Object.keys(state.weekPlans || {}).forEach((weekKey) => {
            const plan = state.weekPlans[weekKey];
            if (!Array.isArray(plan)) return;
            plan.forEach((day) => {
                if (!day || !Array.isArray(day.exercises)) return;
                day.exercises = day.exercises.map((ex) =>
                    isRdlWithLegsTag(ex) ? { ...ex, tag: "HAM" } : ex
                );
            });
        });

        state.migrations["kuba_rdl_ham_v1"] = true;
    }

    // Bartek od 15.11.2026 ma te same ćwiczenia co Kuba. Zmiana wchodzi od
    // razu w bieżącym tygodniu i obowiązuje w kolejnych, ale nie przepisuje
    // snapshotów starszych tygodni. Serie i notatki przepinamy po nazwie.
    if (planKey === "bartek" && state.migrations && !hadBartekPlan) {
        if (!state.weekPlans || typeof state.weekPlans !== "object" || Array.isArray(state.weekPlans)) {
            state.weekPlans = {};
        }

        const oldPlan = copyPlan(PLAN_BARTEK_V1);
        applyCustomPlanTo(oldPlan);
        const newPlan = copyPlan(PLAN_BARTEK);
        const startIdx = state.startSunday
            ? Math.max(0, Math.floor((BARTEK_PLAN_V2_START - state.startSunday) / WEEK_MS))
            : Math.max(0, state.currentWeekIndex || 0);

        (state.weeks || []).forEach((week, idx) => {
            const weekData = week || {};

            if (idx < startIdx) {
                // Brakujący snapshot starego tygodnia uzupełniamy starym
                // planem, żeby ensureWeekPlans nie wstawiło tam planu Kuby.
                if (!Array.isArray(state.weekPlans[idx]) || !state.weekPlans[idx].length) {
                    state.weekPlans[idx] = fitPlanSetsToWeek(copyPlan(oldPlan), weekData);
                }
                return;
            }

            const oldWeekPlan =
                Array.isArray(state.weekPlans[idx]) && state.weekPlans[idx].length
                    ? state.weekPlans[idx]
                    : oldPlan;
            const remapped = remapWeekToPlan(weekData, oldWeekPlan, newPlan);

            state.weeks[idx] = remapped;
            state.weekPlans[idx] = fitPlanSetsToWeek(copyPlan(newPlan), remapped);
        });

        // Stare ręczne edycje planu Bartka nie mogą przesłonić planu Kuby.
        state.customPlan = {};
        state.migrations["bartek_kuba_plan_v1"] = true;
    }

    if (
        state.migrations &&
        (!hadLegs ||
            !hadPlanV3 ||
            !hadPlanV4 ||
            !hadPlanV5 ||
            !hadPlanV5Now ||
            !hadRepair ||
            !hadHistory ||
            !hadHistoryV2 ||
            !hadHistoryV3 ||
            !hadRdlHam ||
            !hadBartekPlan ||
            !state.migrations["reps_sets_v3"])
    ) {
        persistState();
    }
};

// Każdy tydzień ma zamrożoną kopię planu, który obowiązywał wtedy.
// Dzięki temu zmiana planu nie przepisuje wyglądu starszych tygodni.
const getWeekPlan = (weekIndex) => {
    const snap = state && state.weekPlans ? state.weekPlans[weekIndex] : null;
    if (Array.isArray(snap) && snap.length) return copyPlan(snap);
    return copyPlan(CURRENT_PLAN);
};

const ensureWeekPlans = (planKey) => {
    if (!state.weekPlans || typeof state.weekPlans !== "object" || Array.isArray(state.weekPlans)) {
        state.weekPlans = {};
    }

    state.weeks.forEach((week, idx) => {
        const existing = state.weekPlans[idx];
        if (Array.isArray(existing) && existing.length) return;
        state.weekPlans[idx] = getPlanForWeekIndex(idx, week || {}, planKey);
    });

    if (state.migrations) state.migrations["week_plans_v1"] = true;
};

const bootWithUser = async (storageKey, planKey = "bartek", profileName = "") => {
    currentUserId = storageKey;
    currentProfileName = profileName || "Użytkownik";
    currentPlanKey = planKey;

    const empty = { currentWeekIndex: 0, weeks: [{}], startSunday: 0 };
    const loaded = await window.StorageModule.load(storageKey, empty);
    state = loaded || empty;

    ensureStateShape();
    if (!state.customPlan || typeof state.customPlan !== "object") {
        state.customPlan = {};
    }
    CURRENT_PLAN = buildCurrentPlan();
    runPlanMigrations(planKey);
    CURRENT_PLAN = buildCurrentPlan();
    ensureWeekPlans(planKey);
    isLoaded = true;
    updateTimeline();
    seedCurrentWeekFromPrevious();
    trimWeekToPlan(
        state.weeks[state.currentWeekIndex] || {},
        planSetLimits(getWeekPlan(state.currentWeekIndex))
    );
    persistState();
    restoreRestTimer();

    currentView = "home";
    currentDayId = null;
    const requestedView = new URLSearchParams(window.location.search).get("view");
    if (
        requestedView === "plan" ||
        requestedView === "stats" ||
        requestedView === "history"
    ) {
        currentView = requestedView;
    }
    renderCurrentView();
    resetNavHistory();
};

const switchProfile = () => {
    stopRestTimer(true);
    stopSessionTicker();
    window.Views.clearExpanded();
    closeMoreSheet({ skipHistory: true });
    managePlan = null;
    currentUserId = null;
    currentProfileName = "Użytkownik";
    currentView = "home";
    sessionSummaryKey = null;
    prAnnounced.clear();
    isLoaded = false;
    state = { currentWeekIndex: 0, weeks: [{}], startSunday: 0 };
    showProfileGate();
};

const populateThemeSection = () => {
    const box = document.getElementById("more-theme-section");
    if (!box || !window.Views || !window.Views.themePickerHTML) return;
    box.innerHTML = window.Views.themePickerHTML();
};

const toggleThemeSection = () => {
    const box = document.getElementById("more-theme-section");
    const item = document.getElementById("more-theme-item");
    if (!box) return;
    if (box.classList.contains("hidden")) {
        populateThemeSection();
        box.classList.remove("hidden");
        if (item) item.classList.add("active");
    } else {
        box.classList.add("hidden");
        if (item) item.classList.remove("active");
    }
};

const openMoreSheet = (options = {}) => {
    const wasOpen = isMoreSheetOpen();
    const sheet = document.getElementById("more-sheet");
    const backdrop = document.getElementById("more-backdrop");
    const btn = document.getElementById("more-nav-btn");
    if (sheet) sheet.classList.add("open");
    if (backdrop) backdrop.classList.remove("hidden");
    if (btn) btn.classList.add("active");
    populateThemeSection();
    if (!wasOpen && !options.skipHistory) writeNavState("push");
};

const closeMoreSheet = (options = {}) => {
    const wasOpen = isMoreSheetOpen();
    const sheet = document.getElementById("more-sheet");
    const backdrop = document.getElementById("more-backdrop");
    const btn = document.getElementById("more-nav-btn");
    if (sheet) sheet.classList.remove("open");
    if (backdrop) backdrop.classList.add("hidden");
    if (btn) btn.classList.remove("active");

    if (
        wasOpen &&
        !options.skipHistory &&
        navHistoryReady &&
        canGoBackInApp() &&
        window.history.state &&
        window.history.state.sheet
    ) {
        window.history.back();
    }
};

const toggleMoreSheet = () => {
    const sheet = document.getElementById("more-sheet");
    if (sheet && sheet.classList.contains("open")) {
        closeMoreSheet();
    } else {
        openMoreSheet();
    }
};

const showToast = (msg, options = {}) => {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
    }

    const type = options.type ? ` toast-${options.type}` : "";
    toast.className = `toast${type}`;
    toast.textContent = "";

    if (options.icon || options.sub) {
        if (options.icon) {
            const icon = document.createElement("span");
            icon.className = "toast-ico";
            icon.textContent = options.icon;
            toast.appendChild(icon);
        }
        const body = document.createElement("span");
        body.className = "toast-body";
        const title = document.createElement("span");
        title.className = "toast-title";
        title.textContent = msg;
        body.appendChild(title);
        if (options.sub) {
            const sub = document.createElement("span");
            sub.className = "toast-sub";
            sub.textContent = options.sub;
            body.appendChild(sub);
        }
        toast.appendChild(body);
    } else {
        toast.textContent = msg;
    }

    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(
        () => toast.classList.remove("show"),
        Number(options.duration) > 0 ? Number(options.duration) : 2200
    );
};

const toggleBackupSection = () => {
    const box = document.getElementById("more-backup-section");
    const item = document.getElementById("more-backup-item");
    if (!box) return;
    if (box.classList.contains("hidden")) {
        box.classList.remove("hidden");
        if (item) item.classList.add("active");
    } else {
        box.classList.add("hidden");
        if (item) item.classList.remove("active");
    }
};



const sanitizeBackupState = (incoming) => {
    const clean = { currentWeekIndex: 0, weeks: [{}], startSunday: 0 };
    if (incoming && Array.isArray(incoming.weeks) && incoming.weeks.length) {
        clean.weeks = incoming.weeks.map((w) => (w && typeof w === "object" ? w : {}));
        clean.currentWeekIndex = Math.max(0, Math.min(clean.weeks.length - 1, Number(incoming.currentWeekIndex) || 0));
    }
    if (incoming && typeof incoming.startSunday === "number") clean.startSunday = incoming.startSunday;
    if (incoming && typeof incoming.customPlan === "object") clean.customPlan = incoming.customPlan;
    if (incoming && typeof incoming.customPlanMeta === "object") clean.customPlanMeta = incoming.customPlanMeta;
    if (incoming && typeof incoming.weekSchedule === "object") clean.weekSchedule = incoming.weekSchedule;
    if (incoming && typeof incoming.migrations === "object") clean.migrations = incoming.migrations;
    if (incoming && typeof incoming.weekPlans === "object") clean.weekPlans = incoming.weekPlans;
    if (Array.isArray(incoming && incoming.bodyWeight)) clean.bodyWeight = incoming.bodyWeight;
    return clean;
};

const downloadBackup = () => {
    if (!state || !Array.isArray(state.weeks)) return;
    const payload = {
        app: "kuba-gym",
        version: 4,
        exportedAt: new Date().toISOString(),
        state: {
            currentWeekIndex: state.currentWeekIndex,
            weeks: state.weeks,
            startSunday: state.startSunday,
            customPlan: state.customPlan || {},
            customPlanMeta: state.customPlanMeta || {},
            weekSchedule: state.weekSchedule || {},
            migrations: state.migrations || {},
            weekPlans: state.weekPlans || {},
            bodyWeight: Array.isArray(state.bodyWeight) ? state.bodyWeight : []
        }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date();
    const stamp = date.toISOString().slice(0, 10);
    a.href = url;
    a.download = `kuba-gym-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    closeMoreSheet();
    showToast("Kopia zapasowa pobrana");
};

const handleBackupImport = () => {
    const input = document.getElementById("backup-file");
    const file = input && input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(String(reader.result));
            if (data.app !== "kuba-gym" || !data.state || !Array.isArray(data.state.weeks)) {
                showToast("Niepoprawny plik kopii");
                return;
            }
            state = sanitizeBackupState(data.state);
            ensureStateShape();
            if (!state.customPlan || typeof state.customPlan !== "object") {
                state.customPlan = {};
            }
            CURRENT_PLAN = buildCurrentPlan();
            runPlanMigrations(currentPlanKey);
            CURRENT_PLAN = buildCurrentPlan();
            ensureWeekPlans(currentPlanKey);
            persistState();
            if (input) input.value = "";
            navigateTo("plan");
            showToast("Kopia przywrócona");
        } catch (e) {
            showToast("Nie udało się odczytać pliku");
        }
    };
    reader.readAsText(file);
};

let managePlan = null;

const managePlanFromDays = () =>
    DAYS.map((day) => ({
        dayId: day.id,
        name: day.name,
        label: day.label,
        icon: day.icon,
        color: day.color,
        exercises: day.exercises.map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            tag: ex.tag,
            rest: Number(ex.rest) > 0 ? Number(ex.rest) : window.Utils.defaultRestSeconds(ex.reps)
        }))
    }));

const openManage = () => {
    const fromSheet = isMoreSheetOpen();
    closeMoreSheet({ skipHistory: true });
    // Edycja zawsze dotyczy najnowszego planu, nie planu historycznego tygodnia.
    DAYS = CURRENT_PLAN;
    managePlan = managePlanFromDays();
    currentView = "manage";
    renderCurrentView();
    writeNavState(fromSheet ? "replace" : "push");
};

const manageEditField = (dayIdx, ei, field, value) => {
    if (!managePlan || !managePlan[dayIdx] || !managePlan[dayIdx].exercises[ei]) return;
    const ex = managePlan[dayIdx].exercises[ei];
    if (field === "sets") {
        ex.sets = Math.max(1, Math.min(30, parseInt(value, 10) || 1));
    } else if (field === "rest") {
        ex.rest = Math.max(0, Math.min(600, parseInt(value, 10) || 0));
    } else {
        ex[field] = value;
    }
};

const manageAddExercise = (dayIdx) => {
    if (!managePlan || !managePlan[dayIdx]) return;
    managePlan[dayIdx].exercises.push({
        name: "Nowe ćwiczenie",
        sets: 3,
        reps: "8-12",
        tag: "CORE",
        rest: window.Utils.defaultRestSeconds("8-12")
    });
    renderCurrentView();
    const inputs = document.querySelectorAll("#screen-manage .mg-ex-row input.mg-name");
    const last = inputs[inputs.length - 1];
    if (last) {
        setTimeout(() => {
            last.focus();
            last.select();
            last.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 60);
    }
};

const leaveManageView = () => {
    managePlan = null;
    goBackInApp(() => {
        currentView = "plan";
        renderCurrentView();
        writeNavState("replace");
    });
};

const manageRemoveExercise = (dayIdx, ei) => {
    if (!managePlan || !managePlan[dayIdx]) return;
    managePlan[dayIdx].exercises.splice(ei, 1);
    renderCurrentView();
};

const manageMoveExercise = (dayIdx, ei, direction) => {
    if (!managePlan || !managePlan[dayIdx]) return;
    const list = managePlan[dayIdx].exercises;
    const target = ei + direction;
    if (target < 0 || target >= list.length) return;
    const tmp = list[ei];
    list[ei] = list[target];
    list[target] = tmp;
    renderCurrentView();
};

const manageSave = () => {
    if (!managePlan) return;
    const customPlan = {};
    const customPlanMeta = {};
    managePlan.forEach((day) => {
        const cleaned = day.exercises
            .map((ex) => ({
                name: String(ex.name || "").trim(),
                sets: ex.sets,
                reps: String(ex.reps || "").trim(),
                tag: canonicalTag(ex.tag) || "CORE",
                rest: Math.max(0, Math.min(600, Number(ex.rest) || 0))
            }))
            .filter((ex) => ex.name);
        if (cleaned.length) customPlan[day.dayId] = cleaned;
        const prevMeta = (state.customPlanMeta && state.customPlanMeta[day.dayId]) || {};
        const entry = { color: day.color || "#3b82f6", icon: day.icon || "🔥" };
        if (prevMeta.weekday === null || typeof prevMeta.weekday === "number") {
            entry.weekday = prevMeta.weekday;
        }
        customPlanMeta[day.dayId] = entry;
    });
    state.customPlan = customPlan;
    state.customPlanMeta = customPlanMeta;
    CURRENT_PLAN = buildCurrentPlan();
    // Edycja planu obowiązuje od bieżącego (ostatniego) tygodnia w przód.
    // Wcześniejsze tygodnie zachowują swój zapisany plan.
    const lastIdx = state.weeks.length - 1;
    if (lastIdx >= 0 && state.weekPlans) {
        state.weekPlans[lastIdx] = copyPlan(CURRENT_PLAN);
    }
    persistState();
    leaveManageView();
    showToast("Plan zapisany");
};

const manageEditDay = (dayIdx, field, value) => {
    if (!managePlan || !managePlan[dayIdx]) return;
    managePlan[dayIdx][field] = value;
    renderCurrentView();
};

const manageResetPlan = () => {
    state.customPlan = {};
    state.customPlanMeta = {};
    CURRENT_PLAN = buildCurrentPlan();
    const lastIdx = state.weeks.length - 1;
    if (lastIdx >= 0 && state.weekPlans) {
        state.weekPlans[lastIdx] = copyPlan(CURRENT_PLAN);
    }
    DAYS = CURRENT_PLAN;
    persistState();
    managePlan = managePlanFromDays();
    renderCurrentView();
    showToast("Przywrócono domyślny plan");
};

const manageCancel = () => {
    leaveManageView();
};

const initApp = async () => {
    const bootProfile = (meta) => bootWithUser(meta.id, meta.plan, meta.name);
    try {
        const savedId = window.StorageModule.getSelectedProfileId() || "";
        const meta = window.StorageModule.profileMeta(savedId);
        if (meta && meta.id) {
            await bootProfile(meta);
        } else {
            showProfileGate();
        }
    } catch (e) {
        console.error("initApp error:", e);
        try {
            const savedId = window.StorageModule.getSelectedProfileId() || "";
            const meta = window.StorageModule.profileMeta(savedId);
            if (meta && meta.id) {
                await bootProfile(meta);
            } else {
                showProfileGate();
            }
        } catch (e2) {
            console.error("initApp fallback error:", e2);
            showProfileGate();
        }
    }
};

const logBodyWeight = (rawKg) => {
    const kg = parseFloat(String(rawKg).replace(",", "."));
    if (!kg || kg < 30 || kg > 300) {
        showToast("Podaj wagę w kg (np. 78,5)");
        return;
    }
    if (!Array.isArray(state.bodyWeight)) state.bodyWeight = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ts = today.getTime();

    const idx = state.bodyWeight.findIndex((x) => {
        const d = new Date(x.ts);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === ts;
    });

    const entry = { ts, kg: Math.round(kg * 10) / 10 };
    if (idx >= 0) state.bodyWeight[idx] = entry;
    else state.bodyWeight.push(entry);

    persistState();
    if (currentView === "stats") renderCurrentView();
};

const THEME_KEY = "app_theme";

const THEMES = [
    { id: "blue", label: "Klasyczny", swatch: "#3b82f6", meta: "#0b0e14" },
    { id: "proton", label: "Proton", swatch: "#6D4AFF", meta: "#120E2E" },
    { id: "aurora", label: "Aurora", swatch: "#14b8a6", meta: "#031318" },
    { id: "sunset", label: "Zachód", swatch: "#fb923c", meta: "#170910" },
    { id: "graphite", label: "Grafit", swatch: "#22d3ee", meta: "#0a0d11" },
    { id: "light", label: "Jasny", swatch: "#f2f5f9", meta: "#f2f5f9" }
];

const applyTheme = (theme) => {
    const valid = THEMES.some((t) => t.id === theme) ? theme : "blue";

    if (valid === "blue") {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.setAttribute("data-theme", valid);
    }

    const t = THEMES.find((x) => x.id === valid);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t.meta);
    localStorage.setItem(THEME_KEY, valid);
};

const initTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    applyTheme(THEMES.some((t) => t.id === saved) ? saved : "blue");
};

const setTheme = (theme) => {
    applyTheme(theme);
    renderCurrentView();
};

const toggleTheme = () => {
    const current = localStorage.getItem(THEME_KEY) || "blue";
    const idx = THEMES.findIndex((t) => t.id === current);
    const next = THEMES[(idx + 1) % THEMES.length].id;
    applyTheme(next);
    renderCurrentView();
};

window.getThemes = () => THEMES.map((t) => ({ ...t }));
window.getCurrentTheme = () => localStorage.getItem(THEME_KEY) || "blue";

window.logBodyWeight = logBodyWeight;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.setStatsRange = (cols) => {
    statsMaxCols = Math.max(4, Math.min(28, Number(cols) || 12));
    renderCurrentView();
};

window.navigateTo = navigateTo;
window.navigateToWorkoutFromNav = navigateToWorkoutFromNav;
window.setWeek = setWeek;
window.setPlanMode = setPlanMode;
window.openFullPlan = openFullPlan;
window.closeFullPlan = closeFullPlan;
window.goBackFromHistory = goBackFromHistory;
window.openDay = openDay;
window.goBackFromWorkout = goBackFromWorkout;
window.setLibQuery = (v) => {
    window.Views.setLibQuery(v);
    renderCurrentView();
};
window.setLibCategory = (c) => {
    window.Views.setLibCategory(c);
    renderCurrentView();
};
window.showMoreLib = () => {
    window.Views.showMoreLib();
    renderCurrentView();
};
window.openLibraryExercise = (id) => {
    const same = getLibrarySelectedId() === id;
    window.Views.openLibraryExercise(id);
    renderCurrentView();
    if (same) syncNavHistory();
    else writeNavState("push");
};
window.closeLibraryExercise = () => {
    goBackInApp(() => {
        window.Views.closeLibraryExercise();
        renderCurrentView();
        writeNavState("replace");
    });
};
window.toggleLibMedia = () => {
    window.Views.toggleLibMedia();
    renderCurrentView();
};
window.retryLoadLibrary = () => {
    window.Views.retryLoadLibrary();
    renderCurrentView();
    window.ExerciseLib.loadLibrary()
        .then(() => {
            window.Views.setLibraryLoaded(true, false);
            if (currentView === "library") renderCurrentView();
        })
        .catch(() => {
            window.Views.setLibraryLoaded(false, true);
            if (currentView === "library") renderCurrentView();
        });
};
window.toggleNoteBox = toggleNoteBox;
window.updateNote = updateNote;
window.updateSet = updateSet;
window.toggleSet = toggleSet;
window.toggleExerciseExpand = toggleExerciseExpand;
window.startWorkoutSession = startWorkoutSession;
window.openWorkoutSummary = openWorkoutSummary;
window.dismissWorkoutSummary = dismissWorkoutSummary;
window.finishWorkout = finishWorkout;
window.resetWorkoutSession = resetWorkoutSession;
window.chooseProfile = chooseProfile;
window.switchProfile = switchProfile;
window.openMoreSheet = openMoreSheet;
window.closeMoreSheet = closeMoreSheet;
window.toggleMoreSheet = toggleMoreSheet;
window.toggleThemeSection = toggleThemeSection;
window.toggleBackupSection = toggleBackupSection;
window.downloadBackup = downloadBackup;
window.handleBackupImport = handleBackupImport;
window.showToast = showToast;
window.openManage = openManage;
window.manageEditDay = manageEditDay;
window.manageEditField = manageEditField;
window.manageAddExercise = manageAddExercise;
window.manageRemoveExercise = manageRemoveExercise;
window.manageMoveExercise = manageMoveExercise;
window.manageSave = manageSave;
window.manageResetPlan = manageResetPlan;
window.manageCancel = manageCancel;

window.addEventListener("popstate", (event) => {
    if (!navHistoryReady) return;
    if (event.state && event.state.kubaNav) {
        applyNavState(event.state);
        return;
    }

    currentView = "home";
    currentDayId = null;
    if (window.Views && window.Views.setLibrarySelectedId) {
        window.Views.setLibrarySelectedId(null);
    }
    closeMoreSheet({ skipHistory: true });
    renderCurrentView();
});

// iOS w trybie PWA nie zawsze ma systemowy gest wstecz. Dodajemy własny
// gest przeciągnięcia od lewej krawędzi, który cofa ekran w aplikacji.
const installIosSwipeBack = () => {
    const ua = navigator.userAgent || "";
    const isIOS =
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isStandalone =
        window.navigator.standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches;

    if (!isIOS || !isStandalone) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;
    const edge = 32;
    const minDistance = 70;

    document.addEventListener(
        "touchstart",
        (e) => {
            if (e.touches.length !== 1) return;
            const t = e.touches[0];
            if (t.clientX > edge) return;
            startX = t.clientX;
            startY = t.clientY;
            tracking = true;
        },
        { passive: true }
    );

    document.addEventListener(
        "touchmove",
        (e) => {
            if (!tracking) return;
            const t = e.touches[0];
            if (!t || Math.abs(t.clientY - startY) > 45) tracking = false;
        },
        { passive: true }
    );

    document.addEventListener(
        "touchend",
        (e) => {
            if (!tracking) return;
            tracking = false;
            const t = e.changedTouches[0];
            if (!t) return;
            const dx = t.clientX - startX;
            const dy = Math.abs(t.clientY - startY);
            if (dx >= minDistance && dy < 60) {
                goBackInApp();
            }
        },
        { passive: true }
    );

    document.addEventListener("touchcancel", () => {
        tracking = false;
    });
};

installIosSwipeBack();

initTheme();
initApp();

const versionEl = document.getElementById("app-version");
if (versionEl) versionEl.textContent = `Wersja: ${APP_VERSION}`;
window.APP_VERSION = APP_VERSION;

window.addRestTime = addRestTime;
window.startRestTimer = startRestTimer;
window.stopRestTimer = stopRestTimer;
