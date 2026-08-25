/**
 * Main application module - Initialize and manage app state
 */

import { DAYS, WEEKS } from "./constants.js";
import * as Utils from "./utils.js";
import * as Views from "./views.js";

// Global app context
let appContext = {
    state: {
        weeks: WEEKS,
        currentWeekIndex: 0,
        startSunday: new Date(2024, 0, 7), // Jan 7, 2024 is a Sunday
    },
    currentDayId: null,
    DAYS: DAYS,
};

/**
 * Initialize application
 */
export function initApp() {
    loadState();
    attachGlobalFunctions();
    navigateTo("home");
    console.log("✅ App initialized");
}

/**
 * Load state from localStorage
 */
function loadState() {
    const saved = localStorage.getItem("appState");
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            appContext.state = { ...appContext.state, ...loaded };
            console.log("📦 State loaded from localStorage");
        } catch (e) {
            console.error("Failed to load state:", e);
        }
    }
}

/**
 * Save state to localStorage
 */
function saveState() {
    localStorage.setItem("appState", JSON.stringify(appContext.state));
}

/**
 * Get today's plan
 */
function getTodayPlan() {
    const today = new Date();
    const startDate = new Date(appContext.state.startSunday);
    const daysFromStart = Math.floor(
        (today - startDate) / (1000 * 60 * 60 * 24)
    );
    const weekIndex = Math.floor(daysFromStart / 7);
    const dayOfWeek = daysFromStart % 7;

    if (weekIndex !== appContext.state.currentWeekIndex) {
        return null;
    }

    return DAYS[dayOfWeek] || null;
}

/**
 * Get day progress
 */
function getDayProgress(dayId) {
    const dayData = appContext.state.weeks[appContext.state.currentWeekIndex];
    if (!dayData) return { done: 0, total: 0, pct: 0 };

    const day = DAYS.find((d) => d.id === dayId);
    if (!day) return { done: 0, total: 0, pct: 0 };

    let totalSets = 0;
    let doneSets = 0;

    day.exercises.forEach((exercise, exerciseIdx) => {
        const key = `${dayId}_${exerciseIdx}`;
        const sets = dayData[key] || [];
        totalSets += sets.length;
        doneSets += sets.filter((s) => s.done).length;
    });

    const pct = totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100);
    return { done: doneSets, total: totalSets, pct };
}

/**
 * Get week completion
 */
function getWeekCompletion(weekIndex) {
    if (!appContext.state.weeks[weekIndex])
        return { done: 0, total: 0, pct: 0 };

    let totalSets = 0;
    let doneSets = 0;

    DAYS.forEach((day) => {
        const progress = getDayProgress(day.id);
        totalSets += progress.total;
        doneSets += progress.done;
    });

    const pct = totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100);
    return { done: doneSets, total: totalSets, pct };
}

/**
 * Get week range label
 */
function getWeekRangeLabel(startDate, weekIndex) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + weekIndex * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const options = { month: "short", day: "numeric" };
    return `${weekStart.toLocaleDateString("pl-PL", options)} - ${weekEnd.toLocaleDateString(
        "pl-PL",
        options
    )}`;
}

/**
 * Set current week
 */
function setWeek(weekIndex) {
    if (weekIndex >= 0 && weekIndex < appContext.state.weeks.length) {
        appContext.state.currentWeekIndex = weekIndex;
        saveState();
        navigateTo("plan");
    }
}

/**
 * Get exercise key
 */
function getExerciseKey(dayId, exerciseIdx) {
    return `${dayId}_${exerciseIdx}`;
}

/**
 * Get note key
 */
function getNoteKey(dayId, exerciseIdx) {
    return `${dayId}_${exerciseIdx}_note`;
}

/**
 * Get day date key
 */
function getDayDateKey(dayId) {
    return `${dayId}_date`;
}

/**
 * Get trend UI
 */
function getTrendUI(currentSet, prevSet) {
    if (!currentSet || !currentSet.kg || !currentSet.reps) return '<span class="t-empty">-</span>';
    if (!prevSet || !prevSet.kg || !prevSet.reps) return '<span class="t-base">✓ Nowe</span>';

    const currentWeight = parseFloat(currentSet.kg);
    const currentReps = parseInt(currentSet.reps);
    const prevWeight = parseFloat(prevSet.kg);
    const prevReps = parseInt(prevSet.reps);

    if (currentWeight > prevWeight || (currentWeight === prevWeight && currentReps > prevReps)) {
        return '<span class="t-up">📈 PR!</span>';
    } else if (currentWeight < prevWeight || (currentWeight === prevWeight && currentReps < prevReps)) {
        return '<span class="t-down">📉</span>';
    }
    return '<span class="t-base">➡️ Rowno</span>';
}

/**
 * Ensure workout data exists
 */
function ensureWorkoutDataExists(dayId, exerciseIdx, numSets) {
    const key = getExerciseKey(dayId, exerciseIdx);
    const weekData = appContext.state.weeks[appContext.state.currentWeekIndex];

    if (!weekData[key]) {
        weekData[key] = Array(numSets)
            .fill(null)
            .map(() => ({ kg: 0, reps: 0, done: false }));
        saveState();
    }
}

/**
 * Update set data
 */
function updateSet(exerciseIdx, setIdx, field, value) {
    const key = getExerciseKey(appContext.currentDayId, exerciseIdx);
    const weekData = appContext.state.weeks[appContext.state.currentWeekIndex];

    if (!weekData[key]) weekData[key] = [];
    if (!weekData[key][setIdx]) weekData[key][setIdx] = {};

    weekData[key][setIdx][field] = field === "done" ? Boolean(value) : parseFloat(value);
    saveState();
    updateProgress();
}

/**
 * Toggle set completion
 */
function toggleSet(exerciseIdx, setIdx) {
    const key = getExerciseKey(appContext.currentDayId, exerciseIdx);
    const weekData = appContext.state.weeks[appContext.state.currentWeekIndex];

    if (weekData[key] && weekData[key][setIdx]) {
        weekData[key][setIdx].done = !weekData[key][setIdx].done;
        saveState();
        updateProgress();
    }
}

/**
 * Update note
 */
function updateNote(exerciseIdx, noteText) {
    const key = getNoteKey(appContext.currentDayId, exerciseIdx);
    const weekData = appContext.state.weeks[appContext.state.currentWeekIndex];
    weekData[key] = noteText;
    saveState();
}

/**
 * Toggle note box
 */
function toggleNoteBox(exerciseIdx) {
    const noteBox = document.getElementById(`note-box-${exerciseIdx}`);
    const toggle = document.getElementById(`note-toggle-${exerciseIdx}`);
    if (noteBox) {
        noteBox.classList.toggle("hidden");
        toggle.classList.toggle("active");
    }
}

/**
 * Reset workout
 */
function resetWorkout() {
    const key = getExerciseKey(appContext.currentDayId, 0);
    const weekData = appContext.state.weeks[appContext.state.currentWeekIndex];

    DAYS.find((d) => d.id === appContext.currentDayId)?.exercises.forEach((ex, idx) => {
        const exKey = getExerciseKey(appContext.currentDayId, idx);
        weekData[exKey] = ex.sets.map(() => ({ kg: 0, reps: 0, done: false }));
    });

    saveState();
    navigateTo("workout");
}

/**
 * Update progress display
 */
function updateProgress() {
    const day = DAYS.find((d) => d.id === appContext.currentDayId);
    if (!day) return;

    const progress = getDayProgress(appContext.currentDayId);
    const fill = document.getElementById("progress-fill");
    const sDone = document.getElementById("s-done");
    const sPct = document.getElementById("s-pct");

    if (fill) fill.style.width = progress.pct + "%";
    if (sDone) sDone.textContent = progress.done;
    if (sPct) sPct.textContent = progress.pct + "%";
}

/**
 * Navigate between screens
 */
function navigateTo(view) {
    // Hide all screens
    document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));

    // Show selected screen
    switch (view) {
        case "home":
            document.getElementById("screen-home").classList.remove("hidden");
            document.querySelector('[data-view="home"]').classList.add("active");
            Views.renderHome({ getTodayPlan, getWeekCompletion, state: appContext.state });
            break;
        case "plan":
            document.getElementById("screen-plan").classList.remove("hidden");
            document.querySelector('[data-view="plan"]').classList.add("active");
            Views.renderPlan({
                state: appContext.state,
                DAYS,
                getDayProgress,
                getWeekRangeLabel,
                getWeekCompletion,
                setWeek,
            });
            break;
        case "stats":
            document.getElementById("screen-stats").classList.remove("hidden");
            document.querySelector('[data-view="stats"]').classList.add("active");
            Views.renderStats({
                state: appContext.state,
                DAYS,
                getDayProgress,
                getWeekCompletion,
            });
            break;
        case "workout":
            document.getElementById("screen-workout").classList.remove("hidden");
            document.querySelector('[data-view="workout"]').classList.add("active");
            Views.renderWorkout({
                state: appContext.state,
                currentDayId: appContext.currentDayId,
                DAYS,
                getExerciseKey,
                getNoteKey,
                getDayDateKey,
                getTrendUI,
                ensureWorkoutDataExists,
            });
            setTimeout(updateProgress, 100);
            break;
    }
}

/**
 * Open specific day for workout
 */
function openDay(dayId) {
    appContext.currentDayId = dayId;
    const weekData = appContext.state.weeks[appContext.state.currentWeekIndex];

    // Ensure all exercises have data
    const day = DAYS.find((d) => d.id === dayId);
    day?.exercises.forEach((ex, idx) => {
        ensureWorkoutDataExists(dayId, idx, ex.sets);
    });

    // Set date if not already set
    const dateKey = getDayDateKey(dayId);
    if (!weekData[dateKey]) {
        const today = new Date();
        weekData[dateKey] = today.toLocaleDateString("pl-PL");
        saveState();
    }

    navigateTo("workout");
}

/**
 * Navigate to workout from nav
 */
function navigateToWorkoutFromNav() {
    if (appContext.currentDayId === null) {
        openDay(DAYS[0].id);
    } else {
        navigateTo("workout");
    }
}

/**
 * Go back from workout
 */
function goBackFromWorkout() {
    navigateTo("plan");
}

/**
 * Attach functions to window for HTML onclick handlers
 */
function attachGlobalFunctions() {
    window.navigateTo = navigateTo;
    window.openDay = openDay;
    window.navigateToWorkoutFromNav = navigateToWorkoutFromNav;
    window.goBackFromWorkout = goBackFromWorkout;
    window.setWeek = setWeek;
    window.updateSet = updateSet;
    window.toggleSet = toggleSet;
    window.updateNote = updateNote;
    window.toggleNoteBox = toggleNoteBox;
    window.resetWorkout = resetWorkout;
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
