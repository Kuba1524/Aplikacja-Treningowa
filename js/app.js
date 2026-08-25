const DAYS = [
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
            { name: "Pallof Press", sets: 3, reps: "8-12", tag: "CORE" }
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
            { name: "Weighted Pull Ups", sets: 4, reps: "6-8", tag: "BACK" },
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
            { name: "Cross-Body Hammer Curl [SS]", sets: 3, reps: "8-12", tag: "BICEPS" },
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
            { name: "Cable Lateral Raise", sets: 4, reps: "8-12", tag: "DELTS" },
            { name: "EZ-bar Preacher Curl", sets: 3, reps: "8-12", tag: "BICEPS" },
            { name: "Incline Skull Crushers", sets: 3, reps: "8-12", tag: "TRICEPS" },
            { name: "Cable Crunch", sets: 4, reps: "8-12", tag: "CORE" }
        ]
    }
];

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

const getDayDateKey = (dayId) => `day_${dayId}_date`;
const getDayTimestampKey = (dayId) => `day_${dayId}_ts`;
const getExerciseKey = (dayId, exerciseIndex) => `d${dayId}_e${exerciseIndex}`;
const getNoteKey = (dayId, exerciseIndex) => `d${dayId}_e${exerciseIndex}_note`;

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
    if (!state || typeof state !== "object") {
        state = { currentWeekIndex: 0, weeks: [{}], startSunday: 0 };
    }

    if (!Array.isArray(state.weeks) || state.weeks.length === 0) {
        state.weeks = [{}];
    }

    if (typeof state.currentWeekIndex !== "number") {
        state.currentWeekIndex = 0;
    }

    if (typeof state.startSunday !== "number") {
        state.startSunday = 0;
    }

    state.weeks = state.weeks.map((week) => normalizeWeek(week));
};

const cloneWeekData = (prevWeek = {}) => {
    const newWeek = {};

    Object.keys(prevWeek).forEach((key) => {
        const value = prevWeek[key];

        if (key.endsWith("_note")) {
            newWeek[key] = value || "";
            return;
        }

        if (key.startsWith("d") && Array.isArray(value)) {
            newWeek[key] = value.map((set) => ({
                kg: Number(set?.kg) || 0,
                reps: Number(set?.reps) || 0,
                done: false
            }));
        }
    });

    return newWeek;
};

const persistState = () => {
    if (!isLoaded) return;

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        await window.StorageModule.save(state);
    }, 350);
};

const updateTimeline = () => {
    const currentSunday = window.Utils.getCurrentSunday();
    const currentSundayTime = currentSunday.getTime();

    if (!state.startSunday) {
        state.startSunday = currentSundayTime;
        state.weeks = [normalizeWeek(state.weeks[0] || {})];
        state.currentWeekIndex = 0;
        persistState();
        return;
    }

    if (currentSundayTime >= state.startSunday) {
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const elapsedWeeks = Math.floor((currentSundayTime - state.startSunday) / msPerWeek);

        while (state.weeks.length <= elapsedWeeks) {
            const prevWeek = state.weeks[state.weeks.length - 1] || {};
            state.weeks.push(cloneWeekData(prevWeek));
        }

        state.currentWeekIndex = Math.min(elapsedWeeks, state.weeks.length - 1);
        persistState();
    }
};

const getWeekCompletion = (weekIndex) => {
    const weekData = state.weeks[weekIndex] || {};
    let total = 0;
    let done = 0;

    Object.keys(weekData).forEach((key) => {
        if (key.startsWith("d") && !key.endsWith("_note") && Array.isArray(weekData[key])) {
            weekData[key].forEach((set) => {
                total++;
                if (set.done) done++;
            });
        }
    });

    return {
        total,
        done,
        pct: total ? Math.round((done / total) * 100) : 0
    };
};

const getDayProgress = (dayId) => {
    const day = DAYS[dayId];
    const weekData = state.weeks[state.currentWeekIndex] || {};
    let total = 0;
    let done = 0;

    day.exercises.forEach((ex, ei) => {
        const key = getExerciseKey(dayId, ei);
        const sets = weekData[key] || [];
        total += ex.sets;
        done += sets.filter((s) => s.done).length;
    });

    return {
        total,
        done,
        pct: total ? Math.round((done / total) * 100) : 0
    };
};

const getTodayPlan = () => {
    const weekday = new Date().getDay();
    return DAYS.find((d) => d.weekday === weekday) || null;
};

const getWeekDaysUI = () => {
    const now = new Date();
    const weekday = now.getDay();
    const sunday = window.Utils.getCurrentSunday();

    const labels = ["ND", "PN", "WT", "ŚR", "CZ", "PT", "SB"];

    return labels.map((lab, i) => {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);

        const linkedDay = DAYS.find((d) => d.weekday === i);
        const progress = linkedDay ? getDayProgress(linkedDay.id) : null;
        const active = i === weekday;
        const done = progress ? progress.done > 0 : false;

        return `
            <div class="week-day ${active ? "active" : ""} ${done ? "done" : ""}">
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

    if (!weekData[dayKey]) {
        const now = new Date();
        weekData[dayKey] = now.toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
            weekday: "short"
    });
    weekData[getDayTimestampKey(id)] = now.getTime();
    persistState();
}
};

const getTrendUI = (curr, prev) => {
    if (!prev || !prev.done || !curr.done) {
        return '<span class="t-empty"></span>';
    }

    const cKg = parseFloat(curr.kg) || 0;
    const pKg = parseFloat(prev.kg) || 0;
    const cR = parseFloat(curr.reps) || 0;
    const pR = parseFloat(prev.reps) || 0;

    if (cKg > pKg) return '<span class="t-up">▲ CIĘŻAR</span>';
    if (cKg < pKg) return '<span class="t-down">▼ CIĘŻAR</span>';
    if (cR > pR) return '<span class="t-up">▲ POWT.</span>';
    if (cR < pR) return '<span class="t-down">▼ POWT.</span>';

    return '<span class="t-base">= BAZA</span>';
};

const renderCurrentView = () => {
    const ctx = {
        state,
        DAYS,
        currentWeekIndex: state.currentWeekIndex,
        currentDayId,
        getDayDateKey,
        getExerciseKey,
        getNoteKey,
        getWeekCompletion,
        getDayProgress,
        getTodayPlan,
        getWeekDaysUI,
        ensureWorkoutDataExists,
        getTrendUI
    };

    if (currentView === "home") {
        window.Views.renderHome(ctx);
    }

    if (currentView === "plan") {
        window.Views.renderPlan(ctx);
    }

    if (currentView === "stats") {
        window.Views.renderStats(ctx);
    }

    if (currentView === "workout") {
        window.Views.renderWorkout(ctx);
        updateSummary();
    }

    updateVisibleScreen();
    updateBottomNav();
};

const updateVisibleScreen = () => {
    const screens = {
        home: document.getElementById("screen-home"),
        plan: document.getElementById("screen-plan"),
        stats: document.getElementById("screen-stats"),
        workout: document.getElementById("screen-workout")
    };

    Object.entries(screens).forEach(([key, el]) => {
        if (!el) return;
        el.classList.toggle("hidden", key !== currentView);
    });

    const bottomNav = document.getElementById("bottom-nav");
    if (bottomNav) {
        bottomNav.classList.toggle("hidden", currentView === "workout");
    }
};

const updateBottomNav = () => {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
        const view = btn.dataset.view;
        const active = view === currentView || (view === "more" && currentView === "plan");
        btn.classList.toggle("active", active && view !== "workout");
    });
};

const navigateTo = (view) => {
    currentView = view;
    renderCurrentView();
};

const navigateToWorkoutFromNav = () => {
    const todayPlan = getTodayPlan();

    if (todayPlan) {
        openDay(todayPlan.id);
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
};

const openDay = (id) => {
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
        persistState();
    }

    currentView = "workout";
    renderCurrentView();
};

const goBackFromWorkout = () => {
    currentView = "plan";
    renderCurrentView();
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
        btn.textContent = val.trim() ? "💬 Edytuj notatkę" : "💬 Dodaj notatkę";
    }
};

const updateSet = (ei, i, field, val) => {
    if (currentDayId === null) return;

    const key = getExerciseKey(currentDayId, ei);

    if (!state.weeks[state.currentWeekIndex][key]) return;

    state.weeks[state.currentWeekIndex][key][i][field] = parseFloat(val) || 0;
    persistState();
};

const toggleSet = (ei, i) => {
    if (currentDayId === null) return;

    const key = getExerciseKey(currentDayId, ei);
    const set = state.weeks[state.currentWeekIndex][key][i];
    set.done = !set.done;

    persistState();
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

const resetWorkout = () => {
    if (currentDayId === null) return;

    const weekData = state.weeks[state.currentWeekIndex];
    if (!weekData) return;

    delete weekData[getDayDateKey(currentDayId)];

    Object.keys(weekData).forEach((key) => {
        if (key.startsWith(`d${currentDayId}_`)) {
            delete weekData[key];
        }
    });

    persistState();
    openDay(currentDayId);
};

const initApp = async () => {
    const loaded = await window.StorageModule.load(state);
    state = loaded || state;

    ensureStateShape();
    isLoaded = true;
    updateTimeline();

    currentView = "home";
    renderCurrentView();
};

window.navigateTo = navigateTo;
window.navigateToWorkoutFromNav = navigateToWorkoutFromNav;
window.setWeek = setWeek;
window.openDay = openDay;
window.goBackFromWorkout = goBackFromWorkout;
window.toggleNoteBox = toggleNoteBox;
window.updateNote = updateNote;
window.updateSet = updateSet;
window.toggleSet = toggleSet;
window.resetWorkout = resetWorkout;

initApp();
