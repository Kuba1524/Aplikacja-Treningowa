const DAYS = [
    { 
        id: 0, weekday: 0, name: "Niedziela", label: "PUSH", icon: "🔥", color: "#ff3b30", 
        exercises: [
            { name: "Incline Dumbbell Press", sets: 4, tag: "CHEST" },
            { name: "Seated Dumbbell OHP", sets: 3, tag: "SHOULDER" },
            { name: "Machine Chest Press", sets: 3, tag: "CHEST" },
            { name: "Chest Dips", sets: 3, tag: "CHEST" },
            { name: "Dumbbell Lateral Raises", sets: 4, tag: "DELTS" },
            { name: "Ab Wheel", sets: 3, tag: "CORE" },
            { name: "Pallof Press", sets: 3, tag: "CORE" }
        ]
    },
    { 
        id: 1, weekday: 1, name: "Poniedziałek", label: "PULL", icon: "💪", color: "#00b4d8", 
        exercises: [
            { name: "Weighted Pull Ups", sets: 4, tag: "BACK" },
            { name: "Single-Arm Dumbell Row", sets: 3, tag: "BACK" },
            { name: "Seated Cable Row", sets: 3, tag: "BACK" },
            { name: "Reverse Peck Deck", sets: 4, tag: "REAR" },
            { name: "Dumbbell Shrugs", sets: 3, tag: "TRAPS" },
            { name: "Ez-bar Reverse Curl", sets: 3, tag: "FOREARMS" },
            { name: "Barbell Wrist Curl", sets: 3, tag: "FOREARMS" }
        ]
    },
    { 
        id: 2, weekday: 3, name: "Środa", label: "LEGS + ARMS", icon: "🦵", color: "#2ec4b6", 
        exercises: [
            { name: "Hip Thrust", sets: 4, tag: "GLUTES" },
            { name: "Hack Squat / Leg Press", sets: 3, tag: "QUADS" },
            { name: "RDL", sets: 3, tag: "LEGS" },
            { name: "Seated Leg Curl", sets: 3, tag: "HAM" },
            { name: "Supination Curl [SS]", sets: 3, tag: "BICEPS" },
            { name: "Single-Arm Cable Pushdown [SS]", sets: 3, tag: "TRICEPS" },
            { name: "Cross-Body Hammer Curl [SS]", sets: 3, tag: "BICEPS" },
            { name: "Calf Raises [SS]", sets: 4, tag: "CALVES" }
        ]
    },
    { 
        id: 3, weekday: 5, name: "Piątek", label: "UPPER", icon: "⚡", color: "#9d4edd", 
        exercises: [
            { name: "Bench Press", sets: 3, tag: "CHEST" },
            { name: "Cable Flyes (Low to High)", sets: 3, tag: "CHEST" },
            { name: "Single-Arm Lat Pulldown", sets: 3, tag: "BACK" },
            { name: "Cable Lateral Raise", sets: 4, tag: "DELTS" },
            { name: "EZ-bar Preacher Curl", sets: 3, tag: "BICEPS" },
            { name: "Incline Skull Crushers", sets: 3, tag: "TRICEPS" },
            { name: "Cable Crunch", sets: 4, tag: "CORE" }
        ]
    }
];

let state = JSON.parse(
    localStorage.getItem("kuba_v11") ||
    '{"currentWeekIndex":0,"weeks":[{}],"startSunday":0}'
);

let currentDayId = null;

const save = () => {
    localStorage.setItem("kuba_v11", JSON.stringify(state));
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
        state.weeks = [{}];
        state.currentWeekIndex = 0;
        save();
        return;
    }

    if (currentSundayTime >= state.startSunday) {
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const elapsedWeeks = Math.floor((currentSundayTime - state.startSunday) / msPerWeek);

        const oldLength = state.weeks.length;

        while (state.weeks.length <= elapsedWeeks) {
            state.weeks.push({});
        }

        if (state.weeks.length > oldLength) {
            state.currentWeekIndex = state.weeks.length - 1;
        }

        save();
    }
};

const renderHome = () => {
    document.getElementById("week-tabs").innerHTML = state.weeks
        .map((_, w) => `
            <button class="week-btn ${state.currentWeekIndex === w ? "active" : ""}" onclick="setWeek(${w})">
                TYDZIEŃ ${w + 1}
            </button>
        `)
        .join("");

    document.getElementById("day-cards").innerHTML = DAYS
        .map((day) => `
            <div class="day-card" onclick="openDay(${day.id})">
                <div>
                    <div class="day-title">${day.label}</div>
                    <div class="day-label">${day.name} • ${day.exercises.length} ćwiczeń</div>
                </div>
                <div style="font-size:20px;">${day.icon}</div>
            </div>
        `)
        .join("");
};

const setWeek = (w) => {
    state.currentWeekIndex = w;
    save();
    renderHome();
};

const openDay = (id) => {
    currentDayId = id;
    const weekData = state.weeks[state.currentWeekIndex];
    const dayKey = `day_${id}_date`;

    if (!weekData[dayKey]) {
        const now = new Date();
        weekData[dayKey] = now.toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
            weekday: "short"
        });
        save();
    }

    document.getElementById("wh-title").textContent = DAYS[id].label;
    document.getElementById("wh-date").textContent = weekData[dayKey];
    document.getElementById("screen-home").classList.add("hidden");
    document.getElementById("screen-workout").classList.remove("hidden");

    renderWorkout();
    updateSummary();
};

const getTrendUI = (curr, prev) => {
    if (!prev || !prev.done || !curr.done) {
        return '<span class="t-eq">──</span>';
    }

    const cKg = parseFloat(curr.kg) || 0;
    const pKg = parseFloat(prev.kg) || 0;
    const cR = parseFloat(curr.reps) || 0;
    const pR = parseFloat(prev.reps) || 0;

    if (cKg > pKg) return '<span class="t-up">▲ CIĘŻAR</span>';
    if (cKg < pKg) return '<span class="t-down">▼ CIĘŻAR</span>';
    if (cR > pR) return '<span class="t-up">▲ POWT.</span>';
    if (cR < pR) return '<span class="t-down">▼ POWT.</span>';

    return '<span class="t-eq">〓</span>';
};

const toggleNoteBox = (ei) => {
    const box = document.getElementById(`note-box-${ei}`);
    box.classList.toggle("hidden");
};

const updateNote = (ei, val) => {
    const weekData = state.weeks[state.currentWeekIndex];
    const noteKey = `d${currentDayId}_e${ei}_note`;

    weekData[noteKey] = val;
    save();
};

const renderWorkout = () => {
    const day = DAYS[currentDayId];
    const weekData = state.weeks[state.currentWeekIndex];
    const prevWeekData = state.currentWeekIndex > 0
        ? state.weeks[state.currentWeekIndex - 1]
        : null;

    document.getElementById("workout-scroll").innerHTML = day.exercises
        .map((ex, ei) => {
            const key = `d${currentDayId}_e${ei}`;
            const noteKey = `d${currentDayId}_e${ei}_note`;

            if (!weekData[key]) {
                weekData[key] = Array.from(
                    { length: ex.sets },
                    () => ({ kg: 0, reps: 0, done: false })
                );
            }

            const sets = weekData[key];
            const currentNote = weekData[noteKey] || "";
            const prevSets = prevWeekData ? prevWeekData[key] : null;

            return `
                <div class="exercise-card">
                    <div class="exercise-header">
                        <div style="display:flex; align-items:center;">
                            <span class="tag-badge tag-${ex.tag}">${ex.tag}</span>
                            <span class="ex-title">${ex.name}</span>
                        </div>
                        <div class="ex-circle">${sets.filter((s) => s.done).length}/${ex.sets}</div>
                    </div>

                    <button class="btn-note-toggle ${currentNote ? "active" : ""}" onclick="toggleNoteBox(${ei})">
                        💬 ${currentNote ? "Edytuj notatkę" : "Dodaj notatkę..."}
                    </button>

                    <div id="note-box-${ei}" class="note-box ${currentNote ? "" : "hidden"}">
                        <textarea class="note-input" rows="2" placeholder="Best in the world?..." oninput="updateNote(${ei}, this.value)">${currentNote}</textarea>
                    </div>

                    <div>
                        ${sets.map((s, i) => {
                            const prev = prevSets && prevSets[i] ? prevSets[i] : null;
                            const prevTxt = prev ? `<b>${prev.kg}kg × ${prev.reps}</b>` : "—";

                            return `
                                <div class="set-row">
                                    <span style="font-size:12px; color:var(--text-dim); font-weight:800">S${i + 1}</span>
                                    <div class="input-group">
                                        <input type="number" value="${s.kg || ""}" placeholder="0" oninput="updateSet(${ei}, ${i}, 'kg', this.value)">
                                        <span>KG</span>
                                    </div>
                                    <div class="input-group">
                                        <input type="number" value="${s.reps || ""}" placeholder="0" oninput="updateSet(${ei}, ${i}, 'reps', this.value)">
                                        <span>POW</span>
                                    </div>
                                    <button class="btn-check ${s.done ? "done" : ""}" onclick="toggleSet(${ei}, ${i})">✓</button>
                                    <div class="set-info-bar">
                                        <span class="prev-label">Poprzednio: ${prevTxt}</span>
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
    state.weeks[state.currentWeekIndex][`d${currentDayId}_e${ei}`][i][field] = parseFloat(val) || 0;
    save();
};

const toggleSet = (ei, i) => {
    const set = state.weeks[state.currentWeekIndex][`d${currentDayId}_e${ei}`][i];
    set.done = !set.done;
    save();
    updateSummary();
    renderWorkout();
};

const updateSummary = () => {
    const weekData = state.weeks[state.currentWeekIndex];
    let total = 0;
    let done = 0;

    Object.keys(weekData).forEach((key) => {
        if (key.startsWith(`d${currentDayId}_`) && !key.endsWith("_note")) {
            weekData[key].forEach((s) => {
                total++;
                if (s.done) done++;
            });
        }
    });

    document.getElementById("s-done").textContent = done;
    document.getElementById("s-pct").textContent = total
        ? `${Math.round((done / total) * 100)}%`
        : "0%";
};

const goHome = () => {
    document.getElementById("screen-home").classList.remove("hidden");
    document.getElementById("screen-workout").classList.add("hidden");
    renderHome();
};

const resetWorkout = () => {
    const weekData = state.weeks[state.currentWeekIndex];
    if (!weekData) return;

    delete weekData[`day_${currentDayId}_date`];

    Object.keys(weekData).forEach((key) => {
        if (key.startsWith(`d${currentDayId}_`)) {
            delete weekData[key];
        }
    });

    save();
    openDay(currentDayId);
};

updateTimeline();
renderHome();

window.setWeek = setWeek;
window.openDay = openDay;
window.toggleNoteBox = toggleNoteBox;
window.updateNote = updateNote;
window.updateSet = updateSet;
window.toggleSet = toggleSet;
window.goHome = goHome;
window.resetWorkout = resetWorkout;
