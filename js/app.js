const PLAN_BARTEK = [
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
            { name: "Dumbbell Lateral Raises", sets: 4, reps: "8-12", tag: "DELTS" },
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

const PLAN_KUBA = PLAN_BARTEK.map((day) => ({
    ...day,
    exercises: day.exercises.map((ex) => ({ ...ex }))
}));
const kubaIncline = PLAN_KUBA[0].exercises[0];
kubaIncline.name = "Incline Smith Machine Press";
kubaIncline.sets = 3;
kubaIncline.reps = "6-8";

let DAYS = PLAN_BARTEK;

const getPlanByKey = (planKey) =>
    planKey === "kuba" ? PLAN_KUBA : PLAN_BARTEK;

const copyPlan = (plan) =>
    (plan || []).map((day) => ({
        ...day,
        exercises: (day.exercises || []).map((ex) => ({ ...ex }))
    }));

const applyCustomPlan = () => {
    const overrides = state && state.customPlan;
    if (overrides && typeof overrides === "object") {
        DAYS.forEach((day) => {
            const custom = overrides[day.id];
            if (!Array.isArray(custom)) return;
            const cleaned = custom
                .map((ex) => ({
                    name: String(ex && ex.name || "").trim(),
                    sets: Math.max(1, Math.min(30, Number(ex && ex.sets) || 1)),
                    reps: String(ex && ex.reps || "").trim(),
                    tag: String(ex && ex.tag || "CORE").trim().toUpperCase() || "CORE"
                }))
                .filter((ex) => ex.name);
            if (cleaned.length) {
                day.exercises = cleaned;
            }
        });
    }

    const meta = state && state.customPlanMeta;
    if (meta && typeof meta === "object") {
        DAYS.forEach((day) => {
            const m = meta[day.id];
            if (!m || typeof m !== "object") return;
            if (typeof m.color === "string" && /^#[0-9a-fA-F]{6}$/.test(m.color)) day.color = m.color;
            if (typeof m.icon === "string" && m.icon) day.icon = m.icon;
        });
    }
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
let statsMaxCols = 12;
let planCompactMode = false;

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

const planSetLimits = () => {
    const limits = {};
    DAYS.forEach((day) => {
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
        persistState();
        return;
    }

    if (currentSundayTime >= state.startSunday) {
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const elapsedWeeks = Math.floor((currentSundayTime - state.startSunday) / msPerWeek);

        while (state.weeks.length <= elapsedWeeks) {
            const prevWeek = state.weeks[state.weeks.length - 1] || {};
            const newWeek = trimWeekToPlan(cloneWeekData(prevWeek), planSetLimits());
            state.weeks.push(newWeek);
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
        total += ex.sets || sets.length || 0;
        done += sets.filter((s) => s && s.done).length;
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
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return labels.map((lab, i) => {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);

        const linkedDay = DAYS.find((d) => d.weekday === i);
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
        ensureWorkoutDataExists,
        logBodyWeight,
        getTrendUI,
        currentProfileName,
        getManagePlan: () => managePlan
    };

    try {
        if (currentView === "home") window.Views.renderHome(ctx);
        if (currentView === "plan") window.Views.renderPlan(ctx);
        if (currentView === "stats") window.Views.renderStats(ctx);
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

    updateVisibleScreen();
    updateBottomNav();
};

const updateVisibleScreen = () => {
    const screens = {
        home: document.getElementById("screen-home"),
        plan: document.getElementById("screen-plan"),
        stats: document.getElementById("screen-stats"),
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
        if (currentView === "plan" && view === "plan") btn.classList.add("active");
        if (currentView === "stats" && view === "stats") btn.classList.add("active");
    });
};

const navigateTo = (view) => {
    currentView = view;
    closeMoreSheet();
    renderCurrentView();
};

const navigateToWorkoutFromNav = () => {
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
};

const setPlanMode = (fullPlan) => {
    planCompactMode = !fullPlan;
    renderCurrentView();
};

const openFullPlan = () => {
    planCompactMode = false;
    navigateTo("plan");
};

const openDay = (id) => {
    const day = DAYS.find((d) => d.id === id);
    if (!day) return;

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

    persistState();
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
const restTimer = { duration: 0, remaining: 0, interval: null, bar: null };

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

const startRestTimer = (seconds) => {
    const bar = getRestTimerBar();
    if (!bar) return;
    restTimer.duration = seconds;
    restTimer.remaining = seconds;
    if (restTimer.interval) { clearInterval(restTimer.interval); restTimer.interval = null; }
    bar.classList.add("open");
    updateRestTimerUI();
    restTimer.interval = setInterval(() => {
        restTimer.remaining--;
        updateRestTimerUI();
        if (restTimer.remaining <= 0) stopRestTimer(true);
    }, 1000);
};

const addRestRestTime = (sec) => {
    restTimer.remaining += sec;
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
    const bar = getRestTimerBar();
    if (bar) {
        bar.classList.remove("open");
        const time = bar.querySelector(".rest-timer-time");
        if (time) time.classList.remove("done");
    }
};

const toggleSet = (ei, i) => {
    if (currentDayId === null) return;

    const key = getExerciseKey(currentDayId, ei);
    const set = state.weeks[state.currentWeekIndex][key][i];
    set.done = !set.done;

    if (set.done) {
        const settings = state.settings || {};
        if (settings.restEnabled !== false) {
            const seconds = Number(settings.restSeconds) > 0 ? Number(settings.restSeconds) : 90;
            startRestTimer(seconds);
        }
    }

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

    delete weekData[getDayDateKey(currentDayId)];
    delete weekData[getDayTimestampKey(currentDayId)];

    Object.keys(weekData).forEach((key) => {
        if (key.startsWith(`d${currentDayId}_`)) {
            delete weekData[key];
        }
    });

    persistState();
    openDay(currentDayId);
};

const showAuthGate = () => {
    const gate = document.getElementById("profile-gate");
    if (gate) gate.classList.remove("hidden");
};

let authRegisterMode = false;

const setAuthMode = (registerMode) => {
    authRegisterMode = registerMode;
    const subtitle = document.getElementById("auth-subtitle");
    const submit = document.getElementById("auth-submit");
    const toggle = document.getElementById("auth-toggle");
    const nameWrap = document.getElementById("auth-register-name-wrap");
    const password = document.getElementById("auth-password");
    const error = document.getElementById("auth-error");
    if (subtitle) subtitle.textContent = registerMode ? "Zarejestruj nowe konto" : "Zaloguj się na swoje konto";
    if (submit) submit.textContent = registerMode ? "Zarejestruj się" : "Zaloguj się";
    if (toggle) toggle.textContent = registerMode ? "Masz już konto? Zaloguj się" : "Nie masz konta? Zarejestruj się";
    if (nameWrap) nameWrap.classList.toggle("hidden", !registerMode);
    if (password) password.autocomplete = registerMode ? "new-password" : "current-password";
    if (error) error.classList.add("hidden");
};

const toggleAuthMode = () => {
    const newMode = !authRegisterMode;
    setAuthMode(newMode);
    const username = document.getElementById("auth-username");
    if (username) username.focus();
};

const togglePasswordVisibility = () => {
    const input = document.getElementById("auth-password");
    const btn = document.getElementById("auth-pass-toggle");
    if (!input || !btn) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.setAttribute("aria-pressed", String(show));
    btn.setAttribute("aria-label", show ? "Ukryj hasło" : "Pokaż hasło");
    btn.innerHTML = show
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><path d="M4 4l16 16"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
};

const authSubmit = async () => {
    const username = document.getElementById("auth-username").value.trim();
    const password = document.getElementById("auth-password").value;
    const errorEl = document.getElementById("auth-error");
    const submitBtn = document.getElementById("auth-submit");

    const showError = (msg) => {
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.classList.remove("hidden");
        }
    };

    if (!username || !password) {
        showError("Podaj nazwę użytkownika i hasło");
        return;
    }

    const registerName = authRegisterMode
        ? (document.getElementById("auth-register-name").value.trim() || "")
        : "";

    if (authRegisterMode && !registerName) {
        showError("Podaj, jak się do Ciebie zwracać (np. Kuba)");
        const nameInput = document.getElementById("auth-register-name");
        if (nameInput) nameInput.focus();
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = authRegisterMode ? "Rejestracja…" : "Logowanie…";
        }

        const user = authRegisterMode
            ? await window.AuthModule.register(username, password)
            : await window.AuthModule.login(username, password);

        const profileName = authRegisterMode ? registerName : "";

        await completeLogin(user, username, profileName);
    } catch (err) {
        const msg =
            (err && err.message) ||
            "Nie udało się zalogować. Sprawdź dane i połączenie z internetem.";
        showError(msg);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            const mode = authRegisterMode ? "Zarejestruj się" : "Zaloguj się";
            submitBtn.textContent = mode;
        }
    }
};

const completeLogin = async (firebaseUser, username, profileName) => {
    const fallbackId = firebaseUser ? firebaseUser.uid : username;
    const resolved = window.StorageModule.resolveUser(username, fallbackId);

    window.StorageModule.setSelectedProfileId(resolved.id);

    const gate = document.getElementById("profile-gate");
    if (gate) gate.classList.add("hidden");

    await bootWithUser(resolved.id, resolved.plan, profileName || resolved.name);
};

const bootWithUser = async (storageKey, planKey = "bartek", profileName = "") => {
    currentUserId = storageKey;
    currentProfileName = profileName || "Użytkownik";
    DAYS = copyPlan(getPlanByKey(planKey));

    const empty = { currentWeekIndex: 0, weeks: [{}], startSunday: 0 };
    const loaded = await window.StorageModule.load(storageKey, empty);
    state = loaded || empty;

    ensureStateShape();
    if (!state.customPlan || typeof state.customPlan !== "object") {
        state.customPlan = {};
    }
    applyCustomPlan();
    isLoaded = true;
    updateTimeline();
    trimWeekToPlan(state.weeks[state.currentWeekIndex] || {}, planSetLimits());
    persistState();

    currentView = "home";
    currentDayId = null;
    renderCurrentView();
};

const logoutUser = async () => {
    try {
        await window.AuthModule.logout();
    } catch (e) {
        /* ignore */
    }
    window.StorageModule.clearSelectedProfile();
    closeMoreSheet();
    managePlan = null;
    currentUserId = null;
    currentProfileName = "Użytkownik";
    currentView = "home";
    isLoaded = false;
    state = { currentWeekIndex: 0, weeks: [{}], startSunday: 0 };
    showAuthGate();
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

const openMoreSheet = () => {
    const sheet = document.getElementById("more-sheet");
    const backdrop = document.getElementById("more-backdrop");
    const btn = document.getElementById("more-nav-btn");
    if (sheet) sheet.classList.add("open");
    if (backdrop) backdrop.classList.remove("hidden");
    if (btn) btn.classList.add("active");
    populateThemeSection();
};

const closeMoreSheet = () => {
    const sheet = document.getElementById("more-sheet");
    const backdrop = document.getElementById("more-backdrop");
    const btn = document.getElementById("more-nav-btn");
    if (sheet) sheet.classList.remove("open");
    if (backdrop) backdrop.classList.add("hidden");
    if (btn) btn.classList.remove("active");
};

const toggleMoreSheet = () => {
    const sheet = document.getElementById("more-sheet");
    if (sheet && sheet.classList.contains("open")) {
        closeMoreSheet();
    } else {
        openMoreSheet();
    }
};

const showToast = (msg) => {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
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
    if (Array.isArray(incoming && incoming.bodyWeight)) clean.bodyWeight = incoming.bodyWeight;
    return clean;
};

const downloadBackup = () => {
    if (!state || !Array.isArray(state.weeks)) return;
    const payload = {
        app: "kuba-gym",
        version: 3,
        exportedAt: new Date().toISOString(),
        state: {
            currentWeekIndex: state.currentWeekIndex,
            weeks: state.weeks,
            startSunday: state.startSunday,
            customPlan: state.customPlan || {},
            customPlanMeta: state.customPlanMeta || {},
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
            applyCustomPlan();
            persistState();
            if (input) input.value = "";
            closeMoreSheet();
            navigateTo("plan");
            showToast("Kopia przywrócona");
        } catch (e) {
            showToast("Nie udało się odczytać pliku");
        }
    };
    reader.readAsText(file);
};

let managePlan = null;

const openManage = () => {
    closeMoreSheet();
    managePlan = DAYS.map((day) => ({
        dayId: day.id,
        name: day.name,
        label: day.label,
        icon: day.icon,
        color: day.color,
        exercises: day.exercises.map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            tag: ex.tag
        }))
    }));
    currentView = "manage";
    renderCurrentView();
};

const manageEditField = (dayIdx, ei, field, value) => {
    if (!managePlan || !managePlan[dayIdx] || !managePlan[dayIdx].exercises[ei]) return;
    const ex = managePlan[dayIdx].exercises[ei];
    if (field === "sets") {
        ex.sets = Math.max(1, Math.min(30, parseInt(value, 10) || 1));
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
        tag: "CORE"
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
                tag: String(ex.tag || "CORE").trim().toUpperCase() || "CORE"
            }))
            .filter((ex) => ex.name);
        if (cleaned.length) customPlan[day.dayId] = cleaned;
        customPlanMeta[day.dayId] = { color: day.color || "#3b82f6", icon: day.icon || "🔥" };
    });
    state.customPlan = customPlan;
    state.customPlanMeta = customPlanMeta;
    applyCustomPlan();
    persistState();
    managePlan = null;
    navigateTo("plan");
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
    applyCustomPlan();
    persistState();
    managePlan = DAYS.map((day) => ({
        dayId: day.id,
        name: day.name,
        label: day.label,
        icon: day.icon,
        color: day.color,
        exercises: day.exercises.map((ex) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            tag: ex.tag
        }))
    }));
    renderCurrentView();
    showToast("Przywrócono domyślny plan");
};

const manageCancel = () => {
    managePlan = null;
    navigateTo("plan");
};

const initApp = async () => {
    try {
        const user = await window.AuthModule.onReady();
        if (!user) {
            showAuthGate();
            return;
        }
        const username = (user.email || "").split("@")[0];
        await completeLogin(user, username, "");
    } catch (e) {
        console.error("initApp error:", e);
        showAuthGate();
    }
};

const logBodyWeight = (rawKg) => {
    const kg = parseFloat(String(rawKg).replace(",", "."));
    if (!kg || kg < 30 || kg > 300) {
        alert("Podaj wagę w kg (np. 78.5)");
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
    window.Views.openLibraryExercise(id);
    renderCurrentView();
};
window.closeLibraryExercise = () => {
    window.Views.closeLibraryExercise();
    renderCurrentView();
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
window.resetWorkout = resetWorkout;
window.authSubmit = authSubmit;
window.toggleAuthMode = toggleAuthMode;
window.togglePasswordVisibility = togglePasswordVisibility;
window.logoutUser = logoutUser;
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

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("auth-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            authSubmit();
        });
    }
});

initTheme();
initApp();

window.addRestTime = addRestRestTime;
window.startRestTimer = startRestTimer;
window.stopRestTimer = stopRestTimer;
