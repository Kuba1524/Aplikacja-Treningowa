const STORAGE_KEY = "kuba_v11";

const getUserId = () => {
    let userId = localStorage.getItem("user_id");
    if (!userId) {
        userId = "user_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
        localStorage.setItem("user_id", userId);
    }
    return userId;
};

const USER_ID = getUserId();

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
let currentHomeTab = "plan";
let selectedStatsExercise = null;
let saveTimeout;
let noteSaveTimeout;
let isLoaded = false;

const getDayDateKey = (dayId) => `day_${dayId}_date`;
const getExerciseKey = (dayId, exerciseIndex) => `d${dayId}_e${exerciseIndex}`;
const getNoteKey = (dayId, exerciseIndex) => `d${dayId}_e${exerciseIndex}_note`;

const save = async () => {
    if (!isLoaded) return;

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        try {
            await db.collection("users").doc(USER_ID).set({
                state: state,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            console.log("✅ Zapisano do Firebase");
        } catch (error) {
            console.error("❌ Błąd zapisu Firebase:", error);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    }, 400);
};

const load = async () => {
    try {
        const doc = await db.collection("users").doc(USER_ID).get();

        if (doc.exists) {
            const data = doc.data();
            state = data.state || state;
            console.log("✅ Wczytano dane z Firebase");
        } else {
            const localData = localStorage.getItem(STORAGE_KEY);
            if (localData) {
                state = JSON.parse(localData);
                console.log("⚠️ Wczytano z localStorage - migracja do Firebase...");
                isLoaded = true;
                await save();
                return;
            }
        }

        isLoaded = true;
    } catch (error) {
        console.error("❌ Błąd wczytywania:", error);
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
            state = JSON.parse(localData);
        }
        isLoaded = true;
    }
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

const updateTimeline = () => {
    const now = new Date();
    const day = now.getDay();

    const currentSunday = new Date(now);
    currentSunday.setDate(now.getDate() - day);
    currentSunday.setHours(0, 0, 0, 0);

    const currentSundayTime = currentSunday.getTime();

    if (!state.startSunday) {
        state.startSunday = currentSundayTime;
        state.weeks = [normalizeWeek(state.weeks[0] || {})];
        state.currentWeekIndex = 0;
        save();
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
        save();
    }
};

const formatNumberPL = (value) => {
    const num = Number(value) || 0;
    if (Number.isInteger(num)) return String(num);
    return num.toFixed(1).replace(".", ",");
};

const escapeHtml = (str = "") => {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
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

const renderHome = () => {
    const weekTabs = document.getElementById("week-tabs");
    const dayCards = document.getElementById("day-cards");

    if (weekTabs) {
        weekTabs.innerHTML = state.weeks
            .map((_, w) => {
                const summary = getWeekCompletion(w);
                return `
                    <button class="week-btn ${state.currentWeekIndex === w ? "active" : ""}" onclick="setWeek(${w})">
                        TYDZIEŃ ${w + 1}
                        <span class="week-mini">${summary.pct}%</span>
                    </button>
                `;
            })
            .join("");
    }

    if (dayCards) {
        dayCards.innerHTML = DAYS
            .map((day) => {
                const progress = getDayProgress(day.id);
                return `
                    <div class="day-card" onclick="openDay(${day.id})">
                        <div>
                            <div class="day-title">${day.label}</div>
                            <div class="day-label">${day.name} • ${day.exercises.length} ćwiczeń</div>
                            <div class="day-progress-line">
                                <span>${progress.done}/${progress.total} serii</span>
                                <span>${progress.pct}%</span>
                            </div>
                        </div>
                        <div style="font-size:20px;">${day.icon}</div>
                    </div>
                `;
            })
            .join("");
    }

    if (currentHomeTab === "stats") {
        renderStatsDashboard();
    }
};

const setWeek = (w) => {
    state.currentWeekIndex = w;
    save();
    renderHome();

    if (currentDayId !== null) {
        renderWorkout();
        updateSummary();
    }
};

const ensureWorkoutDataExists = (dayId, exerciseIndex, setsCount) => {
    const weekData = state.weeks[state.currentWeekIndex];
    const key = getExerciseKey(dayId, exerciseIndex);

    if (!weekData[key]) {
        weekData[key] = Array.from({ length: setsCount }, () => ({
            kg: 0,
            reps: 0,
            done: false
        }));
        save();
    }
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
        save();
    }

    const titleEl = document.getElementById("wh-title");
    const dateEl = document.getElementById("wh-date");
    const homeEl = document.getElementById("screen-home");
    const workoutEl = document.getElementById("screen-workout");

    if (titleEl) titleEl.textContent = DAYS[id].label;
    if (dateEl) dateEl.textContent = weekData[dayKey];
    if (homeEl) homeEl.classList.add("hidden");
    if (workoutEl) workoutEl.classList.remove("hidden");

    renderWorkout();
    updateSummary();
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

const toggleNoteBox = (ei) => {
    const box = document.getElementById(`note-box-${ei}`);
    if (box) box.classList.toggle("hidden");
};

const updateNote = (ei, val) => {
    const weekData = state.weeks[state.currentWeekIndex];
    const noteKey = getNoteKey(currentDayId, ei);

    weekData[noteKey] = val;

    clearTimeout(noteSaveTimeout);
    noteSaveTimeout = setTimeout(() => {
        save();
    }, 250);

    const btn = document.getElementById(`note-toggle-${ei}`);
    if (btn) {
        btn.classList.toggle("active", !!val.trim());
        btn.textContent = val.trim() ? "💬 Edytuj notatkę" : "💬 Dodaj notatkę";
    }
};

const renderWorkout = () => {
    const day = DAYS[currentDayId];
    const weekData = state.weeks[state.currentWeekIndex];
    const prevWeekData = state.currentWeekIndex > 0 ? state.weeks[state.currentWeekIndex - 1] : null;
    const workoutScroll = document.getElementById("workout-scroll");

    if (!workoutScroll || !day) return;

    workoutScroll.innerHTML = day.exercises
        .map((ex, ei) => {
            const key = getExerciseKey(currentDayId, ei);
            const noteKey = getNoteKey(currentDayId, ei);

            ensureWorkoutDataExists(currentDayId, ei, ex.sets);

            const sets = weekData[key];
            const currentNote = weekData[noteKey] || "";
            const prevSets = prevWeekData ? prevWeekData[key] : null;
            const prevNote = prevWeekData ? (prevWeekData[noteKey] || "") : "";

            return `
                <div class="exercise-card">
                    <div class="exercise-header">
                        <div class="exercise-title-wrap">
                            <span class="tag-badge tag-${ex.tag}">${ex.tag}</span>
                            <div class="exercise-main">
                                <span class="ex-title">${ex.name}</span>
                                <div class="ex-reps-range">Zakres: ${ex.sets} serie × ${ex.reps} powtórzeń</div>
                            </div>
                        </div>
                        <div class="ex-circle">${sets.filter((s) => s.done).length}/${ex.sets}</div>
                    </div>

                    ${prevNote && prevNote.trim() ? `
                        <div class="history-note">
                            <div class="history-note-label">Notatka z poprzedniego tygodnia</div>
                            <div class="history-note-text">${escapeHtml(prevNote)}</div>
                        </div>
                    ` : ""}

                    <button id="note-toggle-${ei}" class="btn-note-toggle ${currentNote ? "active" : ""}" onclick="toggleNoteBox(${ei})">
                        ${currentNote ? "💬 Edytuj notatkę" : "💬 Dodaj notatkę"}
                    </button>

                    <div id="note-box-${ei}" class="note-box ${currentNote ? "" : "hidden"}">
                        <textarea
                            class="note-input"
                            rows="2"
                            placeholder="Dodaj komentarz do ćwiczenia..."
                            oninput="updateNote(${ei}, this.value)"
                        >${escapeHtml(currentNote)}</textarea>
                    </div>

                    <div class="sets-list">
                        ${sets.map((s, i) => {
                            const prev = prevSets && prevSets[i] ? prevSets[i] : null;
                            const prevTxt = prev && prev.done
                                ? `${formatNumberPL(prev.kg)} kg × ${formatNumberPL(prev.reps)}`
                                : "";

                            return `
                                <div class="set-row">
                                    <div class="set-top-row">
                                        <span class="set-pill">S${i + 1}</span>

                                        <div class="input-group">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value="${s.kg || ""}"
                                                placeholder="0"
                                                oninput="updateSet(${ei}, ${i}, 'kg', this.value)"
                                            >
                                            <span>KG</span>
                                        </div>

                                        <div class="input-group">
                                            <input
                                                type="number"
                                                step="1"
                                                value="${s.reps || ""}"
                                                placeholder="0"
                                                oninput="updateSet(${ei}, ${i}, 'reps', this.value)"
                                            >
                                            <span>POW</span>
                                        </div>

                                        <button class="btn-check ${s.done ? "done" : ""}" onclick="toggleSet(${ei}, ${i})">✓</button>
                                    </div>

                                    <div class="set-bottom-row">
                                        <span class="prev-label">${prevTxt}</span>
                                        <span class="trend-badge">${getTrendUI(s, prev)}</span>
                                    </div>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
            `;
        })
        .join("");
};

const updateSet = (ei, i, field, val) => {
    const key = getExerciseKey(currentDayId, ei);
    state.weeks[state.currentWeekIndex][key][i][field] = parseFloat(val) || 0;
    save();
};

const toggleSet = (ei, i) => {
    const key = getExerciseKey(currentDayId, ei);
    const set = state.weeks[state.currentWeekIndex][key][i];
    set.done = !set.done;
    save();
    updateSummary();
    renderWorkout();
    renderHome();
};

const updateSummary = () => {
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

const goHome = () => {
    const homeEl = document.getElementById("screen-home");
    const workoutEl = document.getElementById("screen-workout");

    if (homeEl) homeEl.classList.remove("hidden");
    if (workoutEl) workoutEl.classList.add("hidden");

    renderHome();
};

const resetWorkout = () => {
    const weekData = state.weeks[state.currentWeekIndex];
    if (!weekData) return;

    delete weekData[getDayDateKey(currentDayId)];

    Object.keys(weekData).forEach((key) => {
        if (key.startsWith(`d${currentDayId}_`)) {
            delete weekData[key];
        }
    });

    save();
    openDay(currentDayId);
};

/* =========================
   STATS V2
========================= */

const switchHomeTab = (tab) => {
    currentHomeTab = tab;

    const planBtn = document.getElementById("tab-plan");
    const statsBtn = document.getElementById("tab-stats");
    const planView = document.getElementById("home-plan-view");
    const statsView = document.getElementById("home-stats-view");

    if (planBtn) planBtn.classList.toggle("active", tab === "plan");
    if (statsBtn) statsBtn.classList.toggle("active", tab === "stats");
    if (planView) planView.classList.toggle("hidden", tab !== "plan");
    if (statsView) statsView.classList.toggle("hidden", tab !== "stats");

    if (tab === "stats") {
        renderStatsDashboard();
    }
};

const estimate1RM = (kg, reps) => {
    kg = Number(kg) || 0;
    reps = Number(reps) || 0;
    if (!kg || !reps) return 0;
    return kg * (1 + reps / 30);
};

const getWeekRangeLabel = (weekIndex) => {
    if (!state.startSunday) return `Tydzień ${weekIndex + 1}`;

    const start = new Date(state.startSunday + weekIndex * 7 * 24 * 60 * 60 * 1000);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const startTxt = start.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
    const endTxt = end.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });

    return `${startTxt} – ${endTxt}`;
};

const calculateWeekStats = (weekIndex) => {
    const weekData = state.weeks[weekIndex] || {};
    let tonnage = 0;
    let completedSets = 0;
    let activeDays = 0;
    let workoutsDone = 0;

    DAYS.forEach((day) => {
        let dayHasActivity = false;

        day.exercises.forEach((ex, ei) => {
            const key = getExerciseKey(day.id, ei);
            const sets = weekData[key] || [];

            sets.forEach((set) => {
                if (set.done) {
                    completedSets++;
                    dayHasActivity = true;

                    if (set.kg > 0 && set.reps > 0) {
                        tonnage += Number(set.kg) * Number(set.reps);
                    }
                }
            });
        });

        if (dayHasActivity) {
            activeDays++;
            workoutsDone++;
        }
    });

    return {
        tonnage: Math.round(tonnage),
        completedSets,
        activeDays,
        workoutsDone
    };
};

const getWeeklyChange = () => {
    const current = calculateWeekStats(state.currentWeekIndex);
    const previous = state.currentWeekIndex > 0
        ? calculateWeekStats(state.currentWeekIndex - 1)
        : { tonnage: 0, completedSets: 0, activeDays: 0, workoutsDone: 0 };

    const pct = (curr, prev) => {
        if (!prev && curr > 0) return 100;
        if (!prev) return 0;
        return Math.round(((curr - prev) / prev) * 100);
    };

    return {
        current,
        previous,
        tonnageDiff: pct(current.tonnage, previous.tonnage),
        setsDiff: pct(current.completedSets, previous.completedSets),
        daysDiff: pct(current.activeDays, previous.activeDays)
    };
};

const getMuscleGroupStats = (weekIndex) => {
    const weekData = state.weeks[weekIndex] || {};
    const groups = {};

    DAYS.forEach((day) => {
        day.exercises.forEach((ex, ei) => {
            const key = getExerciseKey(day.id, ei);
            const sets = weekData[key] || [];
            const doneSets = sets.filter((s) => s.done).length;

            if (!groups[ex.tag]) {
                groups[ex.tag] = 0;
            }

            groups[ex.tag] += doneSets;
        });
    });

    return Object.entries(groups)
        .map(([tag, sets]) => ({ tag, sets }))
        .filter((x) => x.sets > 0)
        .sort((a, b) => b.sets - a.sets)
        .slice(0, 6);
};

const getExerciseHistory = (exerciseName) => {
    const history = [];

    state.weeks.forEach((weekData, weekIndex) => {
        DAYS.forEach((day) => {
            day.exercises.forEach((ex, ei) => {
                if (ex.name !== exerciseName) return;

                const key = getExerciseKey(day.id, ei);
                const sets = weekData[key] || [];

                let best1RM = 0;
                let bestSet = null;
                let tonnage = 0;
                let doneSets = 0;

                sets.forEach((set) => {
                    if (set.done) {
                        doneSets++;
                        const est = estimate1RM(set.kg, set.reps);

                        if (est > best1RM) {
                            best1RM = est;
                            bestSet = { kg: set.kg, reps: set.reps };
                        }

                        if (set.kg > 0 && set.reps > 0) {
                            tonnage += Number(set.kg) * Number(set.reps);
                        }
                    }
                });

                if (best1RM > 0 || tonnage > 0 || doneSets > 0) {
                    history.push({
                        weekIndex,
                        date: getWeekRangeLabel(weekIndex),
                        best1RM,
                        tonnage: Math.round(tonnage),
                        bestSet,
                        doneSets
                    });
                }
            });
        });
    });

    history.sort((a, b) => a.weekIndex - b.weekIndex);
    return history;
};

const getPrimaryExercises = () => {
    const preferred = [
        "Bench Press",
        "Weighted Pull Ups",
        "Hip Thrust",
        "RDL",
        "Incline Dumbbell Press",
        "Hack Squat / Leg Press"
    ];

    return preferred
        .map((name) => ({
            name,
            history: getExerciseHistory(name)
        }))
        .filter((item) => item.history.length > 0)
        .slice(0, 4);
};

const getProgressPercent = (history) => {
    if (!history || history.length < 2) return 0;
    const first = history[0]?.best1RM || 0;
    const last = history[history.length - 1]?.best1RM || 0;
    if (!first || !last) return 0;
    return Math.round(((last - first) / first) * 100);
};

const getTopProgressExercises = () => {
    const exercisesMap = new Map();

    DAYS.forEach((day) => {
        day.exercises.forEach((ex) => {
            if (!exercisesMap.has(ex.name)) {
                const history = getExerciseHistory(ex.name);
                if (history.length >= 2) {
                    exercisesMap.set(ex.name, {
                        name: ex.name,
                        tag: ex.tag,
                        history,
                        gain: getProgressPercent(history)
                    });
                }
            }
        });
    });

    return [...exercisesMap.values()]
        .filter((x) => x.history.length >= 2)
        .sort((a, b) => b.gain - a.gain)
        .slice(0, 4);
};

const createSparklineSVG = (values, color = "#60a5fa") => {
    const width = 240;
    const height = 48;
    const padding = 4;

    if (!values.length) {
        return `<svg class="pr-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"></svg>`;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((v, i) => {
        const x = padding + (i * (width - padding * 2)) / Math.max(values.length - 1, 1);
        const y = height - padding - ((v - min) / range) * (height - padding * 2);
        return [x, y];
    });

    const line = points.map((p) => p.join(",")).join(" ");

    return `
        <svg class="pr-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <polyline
                fill="none"
                stroke="${color}"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                points="${line}"
            ></polyline>
            ${points.map((p, idx) => {
                const last = idx === points.length - 1;
                return `
                    <circle
                        cx="${p[0]}"
                        cy="${p[1]}"
                        r="${last ? 3.8 : 2.3}"
                        fill="${last ? color : "#94a3b8"}"
                    ></circle>
                `;
            }).join("")}
        </svg>
    `;
};

const createBigSparklineSVG = (values) => {
    const width = 340;
    const height = 110;
    const padding = 10;

    if (!values.length) {
        return `<svg class="sparkline-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"></svg>`;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((v, i) => {
        const x = padding + (i * (width - padding * 2)) / Math.max(values.length - 1, 1);
        const y = height - padding - ((v - min) / range) * (height - padding * 2);
        return [x, y];
    });

    const line = points.map((p) => p.join(",")).join(" ");
    const area = `${padding},${height - padding} ${points.map((p) => p.join(",")).join(" ")} ${width - padding},${height - padding}`;

    return `
        <svg class="sparkline-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
            <defs>
                <linearGradient id="bigSparkFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.28"></stop>
                    <stop offset="100%" stop-color="#60a5fa" stop-opacity="0"></stop>
                </linearGradient>
                <linearGradient id="bigSparkStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#22d3ee"></stop>
                    <stop offset="100%" stop-color="#3b82f6"></stop>
                </linearGradient>
            </defs>
            <polygon points="${area}" fill="url(#bigSparkFill)"></polygon>
            <polyline
                fill="none"
                stroke="url(#bigSparkStroke)"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
                points="${line}"
            ></polyline>
            ${points.map((p, idx) => {
                const last = idx === points.length - 1;
                return `
                    <circle
                        cx="${p[0]}"
                        cy="${p[1]}"
                        r="${last ? 5 : 3}"
                        fill="${last ? "#22d3ee" : "#93c5fd"}"
                    ></circle>
                `;
            }).join("")}
        </svg>
    `;
};

const renderExerciseInsight = (exerciseName) => {
    const history = getExerciseHistory(exerciseName);
    if (!history.length) return "";

    const values = history.map((x) => Number(x.best1RM.toFixed(1)));
    const latest = history[history.length - 1];
    const bestAll = history.reduce((acc, curr) => curr.best1RM > acc.best1RM ? curr : acc, history[0]);
    const firstTonnage = history[0]?.tonnage || 0;
    const latestTonnage = latest?.tonnage || 0;
    const tonnageGrowth = firstTonnage > 0
        ? Math.round(((latestTonnage - firstTonnage) / firstTonnage) * 100)
        : 0;
    const totalDoneSets = history.reduce((sum, item) => sum + (item.doneSets || 0), 0);

    return `
        <div class="exercise-insight-panel">
            <div class="exercise-insight-head">
                <div>
                    <div class="exercise-insight-title">${exerciseName}</div>
                    <div class="exercise-insight-sub">Historia szacowanego 1RM • ${history.length} wpisów</div>
                </div>
                <div class="rm-badge">
                    <div class="rm-badge-label">Aktualny 1RM</div>
                    <div class="rm-badge-value">${latest.best1RM.toFixed(1)} kg</div>
                </div>
            </div>

            <div class="sparkline-wrap">
                ${createBigSparklineSVG(values)}
            </div>

            <div class="insight-metrics">
                <div class="insight-metric">
                    <div class="insight-metric-label">Wzrost tonażu</div>
                    <div class="insight-metric-value">${tonnageGrowth >= 0 ? "+" : ""}${tonnageGrowth}%</div>
                    <div class="insight-metric-sub">vs początek historii</div>
                </div>

                <div class="insight-metric">
                    <div class="insight-metric-label">Best Set</div>
                    <div class="insight-metric-value">
                        ${bestAll.bestSet ? `${formatNumberPL(bestAll.bestSet.kg)} kg × ${formatNumberPL(bestAll.bestSet.reps)}` : "—"}
                    </div>
                    <div class="insight-metric-sub">${bestAll.date}</div>
                </div>

                <div class="insight-metric">
                    <div class="insight-metric-label">Wykonane serie</div>
                    <div class="insight-metric-value">${totalDoneSets}</div>
                    <div class="insight-metric-sub">w całej historii ćwiczenia</div>
                </div>

                <div class="insight-metric">
                    <div class="insight-metric-label">Ostatni tonaż</div>
                    <div class="insight-metric-value">${formatNumberPL(latest.tonnage)} kg</div>
                    <div class="insight-metric-sub">${latest.date}</div>
                </div>
            </div>
        </div>
    `;
};

const renderWeeklyCompareCard = () => {
    const change = getWeeklyChange();

    const badge = (value) => {
        if (value > 0) return `<span class="delta up">+${value}%</span>`;
        if (value < 0) return `<span class="delta down">${value}%</span>`;
        return `<span class="delta neutral">0%</span>`;
    };

    return `
        <div class="stats-panel">
            <div class="stats-panel-header">
                <div>
                    <div class="stats-panel-title">Porównanie tygodni</div>
                    <div class="stats-panel-subtitle">Obecny tydzień vs poprzedni</div>
                </div>
                <div class="panel-pill">TREND</div>
            </div>

            <div class="compare-grid">
                <div class="compare-row">
                    <span class="compare-name">Tonaż</span>
                    <span class="compare-values">${formatNumberPL(change.current.tonnage)} / ${formatNumberPL(change.previous.tonnage)} kg</span>
                    ${badge(change.tonnageDiff)}
                </div>

                <div class="compare-row">
                    <span class="compare-name">Serie</span>
                    <span class="compare-values">${change.current.completedSets} / ${change.previous.completedSets}</span>
                    ${badge(change.setsDiff)}
                </div>

                <div class="compare-row">
                    <span class="compare-name">Aktywne dni</span>
                    <span class="compare-values">${change.current.activeDays} / ${change.previous.activeDays}</span>
                    ${badge(change.daysDiff)}
                </div>
            </div>
        </div>
    `;
};

const renderMuscleGroupsCard = () => {
    const groups = getMuscleGroupStats(state.currentWeekIndex);
    const max = Math.max(...groups.map((g) => g.sets), 1);

    return `
        <div class="stats-panel">
            <div class="stats-panel-header">
                <div>
                    <div class="stats-panel-title">Partie mięśniowe</div>
                    <div class="stats-panel-subtitle">Najczęściej trenowane w tym tygodniu</div>
                </div>
                <div class="panel-pill">VOLUME</div>
            </div>

            <div class="muscle-list">
                ${groups.length ? groups.map((g) => `
                    <div class="muscle-row">
                        <div class="muscle-row-top">
                            <span class="muscle-name">${g.tag}</span>
                            <span class="muscle-val">${g.sets} serii</span>
                        </div>
                        <div class="muscle-bar-track">
                            <div class="muscle-bar-fill" style="width:${Math.max(10, Math.round((g.sets / max) * 100))}%"></div>
                        </div>
                    </div>
                `).join("") : `<div class="empty-stat">Brak danych z ukończonych serii w tym tygodniu.</div>`}
            </div>
        </div>
    `;
};

const renderTopProgressCard = () => {
    const top = getTopProgressExercises();

    return `
        <div class="stats-panel">
            <div class="stats-panel-header">
                <div>
                    <div class="stats-panel-title">Top progres</div>
                    <div class="stats-panel-subtitle">Ćwiczenia z najlepszym wzrostem</div>
                </div>
                <div class="panel-pill">PR</div>
            </div>

            <div class="top-progress-list">
                ${top.length ? top.map((item) => `
                    <div class="top-progress-item">
                        <div>
                            <div class="top-progress-title">${item.name}</div>
                            <div class="top-progress-sub">${item.tag}</div>
                        </div>
                        <div class="top-progress-gain">+${item.gain}%</div>
                    </div>
                `).join("") : `<div class="empty-stat">Za mało historii, aby policzyć progres.</div>`}
            </div>
        </div>
    `;
};

const renderStatsDashboard = () => {
    const container = document.getElementById("stats-dashboard");
    if (!container) return;

    const currentWeekStats = calculateWeekStats(state.currentWeekIndex);
    const prs = getPrimaryExercises();

    if (!selectedStatsExercise && prs.length) {
        selectedStatsExercise = prs[0].name;
    }

    container.innerHTML = `
        <div class="stats-grid-top">
            <div class="stats-card">
                <div class="stats-label">Tonaż tygodnia</div>
                <div class="stats-value">${formatNumberPL(currentWeekStats.tonnage)}</div>
                <div class="stats-sub">kg objętości</div>
            </div>

            <div class="stats-card">
                <div class="stats-label">Ukończone serie</div>
                <div class="stats-value">${currentWeekStats.completedSets}</div>
                <div class="stats-sub">w tym tygodniu</div>
            </div>

            <div class="stats-card">
                <div class="stats-label">Aktywność</div>
                <div class="stats-value">${currentWeekStats.activeDays}/4</div>
                <div class="streak-chip">🔥 Treningowe dni</div>
            </div>
        </div>

        <div class="stats-main-grid">
            <div class="stats-col">
                ${renderWeeklyCompareCard()}
                ${renderMuscleGroupsCard()}
            </div>

            <div class="stats-col">
                ${renderTopProgressCard()}

                <div class="stats-panel">
                    <div class="stats-panel-header">
                        <div>
                            <div class="stats-panel-title">Personal Records</div>
                            <div class="stats-panel-subtitle">Kluczowe ćwiczenia i progres 1RM</div>
                        </div>
                        <div class="panel-pill">TOP BOJE</div>
                    </div>

                    <div class="pr-list">
                        ${prs.length ? prs.map((item) => {
                            const history = item.history;
                            const gain = getProgressPercent(history);
                            const latest = history[history.length - 1];
                            const values = history.map((x) => Number(x.best1RM.toFixed(1)));
                            const safeName = item.name.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

                            return `
                                <div class="pr-item" onclick="selectStatsExercise('${safeName}')">
                                    <div class="pr-top">
                                        <div>
                                            <div class="pr-title">${item.name}</div>
                                            <div class="pr-sub">1RM: ${latest.best1RM.toFixed(1)} kg</div>
                                        </div>
                                        <div class="pr-gain">${gain >= 0 ? "+" : ""}${gain}%</div>
                                    </div>

                                    ${createSparklineSVG(values)}

                                    <div class="pr-bottom">
                                        <span>Best set: ${latest.bestSet ? `${formatNumberPL(latest.bestSet.kg)} kg × ${formatNumberPL(latest.bestSet.reps)}` : "—"}</span>
                                        <span>${latest.date}</span>
                                    </div>
                                </div>
                            `;
                        }).join("") : `<div class="empty-stat">Brak danych do sekcji Personal Records.</div>`}
                    </div>
                </div>
            </div>
        </div>

        ${selectedStatsExercise ? renderExerciseInsight(selectedStatsExercise) : ""}
    `;
};

const selectStatsExercise = (name) => {
    selectedStatsExercise = name;
    renderStatsDashboard();
};

(async () => {
    await load();
    ensureStateShape();
    updateTimeline();
    renderHome();
})();

window.setWeek = setWeek;
window.openDay = openDay;
window.toggleNoteBox = toggleNoteBox;
window.updateNote = updateNote;
window.updateSet = updateSet;
window.toggleSet = toggleSet;
window.goHome = goHome;
window.resetWorkout = resetWorkout;
window.switchHomeTab = switchHomeTab;
window.selectStatsExercise = selectStatsExercise;
