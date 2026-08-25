import { DAYS, DEFAULT_STATE, STORAGE_KEYS, ANIMATIONS } from "./constants.js";
import * as Utils from "./utils.js";
import * as Views from "./views.js";
import * as StatsModule from "./stats.js";
import * as StorageModule from "./storage.js";

/**
 * Główna klasa aplikacji treningowej
 */
export class TrainingApp {
    constructor() {
        this.state = { ...DEFAULT_STATE };
        this.currentDayId = null;
        this.currentView = "home";
        this.saveTimeout = null;
        this.noteSaveTimeout = null;
        this.isLoaded = false;
        this.listeners = new Map();
    }

    /**
     * Inicjalizuj aplikację
     */
    async init() {
        try {
            console.log("Initializing Training App...");
            const loaded = await StorageModule.load();
            this.state = loaded || { ...DEFAULT_STATE };
            this.ensureStateShape();
            this.isLoaded = true;
            this.updateTimeline();
            this.currentView = "home";
            this.render();
            this.setupEventListeners();
            console.log("App initialized successfully");
        } catch (error) {
            console.error("Failed to initialize app:", error);
            this.showError("Błąd podczas ładowania aplikacji");
        }
    }

    /**
     * Walidacja struktury stanu
     */
    ensureStateShape() {
        if (!this.state || typeof this.state !== "object") {
            this.state = { ...DEFAULT_STATE };
        }

        if (!Array.isArray(this.state.weeks) || this.state.weeks.length === 0) {
            this.state.weeks = [{}];
        }

        if (typeof this.state.currentWeekIndex !== "number") {
            this.state.currentWeekIndex = 0;
        }

        if (typeof this.state.startSunday !== "number") {
            this.state.startSunday = 0;
        }

        this.state.weeks = this.state.weeks.map((week) => this.normalizeWeek(week));
    }

    /**
     * Normalizacja danych tygodnia
     */
    normalizeWeek(week = {}) {
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
                    done: !!set?.done,
                }));
            }
        });

        return normalized;
    }

    /**
     * Klonowanie danych tygodnia
     */
    cloneWeekData(prevWeek = {}) {
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
                    done: false,
                }));
            }
        });

        return newWeek;
    }

    /**
     * Persist stanu do storage
     */
    persistState() {
        if (!this.isLoaded) return;

        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            StorageModule.save(this.state);
        }, ANIMATIONS.NORMAL);
    }

    /**
     * Update timeline jeśli nowy tydzień
     */
    updateTimeline() {
        const currentSunday = Utils.getCurrentSunday();
        const currentSundayTime = currentSunday.getTime();

        if (!this.state.startSunday) {
            this.state.startSunday = currentSundayTime;
            this.state.weeks = [this.normalizeWeek(this.state.weeks[0] || {})];
            this.state.currentWeekIndex = 0;
            this.persistState();
            return;
        }

        if (currentSundayTime >= this.state.startSunday) {
            const msPerWeek = 7 * 24 * 60 * 60 * 1000;
            const elapsedWeeks = Math.floor((currentSundayTime - this.state.startSunday) / msPerWeek);

            while (this.state.weeks.length <= elapsedWeeks) {
                const prevWeek = this.state.weeks[this.state.weeks.length - 1] || {};
                this.state.weeks.push(this.cloneWeekData(prevWeek));
            }

            this.state.currentWeekIndex = Math.min(elapsedWeeks, this.state.weeks.length - 1);
            this.persistState();
        }
    }

    /**
     * Nawigacja między ekranami
     */
    navigateTo(view) {
        if (!["home", "plan", "stats", "workout"].includes(view)) {
            console.warn(`Invalid view: ${view}`);
            return;
        }
        this.currentView = view;
        this.render();
        this.emit("view-changed", view);
    }

    /**
     * Otwarcie dnia treningu
     */
    openDay(dayId) {
        const day = DAYS.find((d) => d.id === dayId);
        if (!day) return;

        this.currentDayId = dayId;
        const weekData = this.state.weeks[this.state.currentWeekIndex];
        const dayKey = this.getDayDateKey(dayId);

        if (!weekData[dayKey]) {
            const now = new Date();
            weekData[dayKey] = now.toLocaleDateString("pl-PL", {
                day: "numeric",
                month: "long",
                weekday: "short",
            });
            weekData[this.getDayTimestampKey(dayId)] = now.getTime();
        }

        day.exercises.forEach((ex, ei) => {
            this.ensureWorkoutDataExists(dayId, ei, ex.sets);
        });

        this.persistState();
        this.currentView = "workout";
        this.render();
        this.emit("day-opened", dayId);
    }

    /**
     * Powrót z treningu
     */
    goBackFromWorkout() {
        this.currentView = "plan";
        this.render();
    }

    /**
     * Zmiana tygodnia
     */
    setWeek(weekIndex) {
        if (weekIndex < 0 || weekIndex >= this.state.weeks.length) {
            console.warn(`Invalid week index: ${weekIndex}`);
            return;
        }
        this.state.currentWeekIndex = weekIndex;
        this.persistState();
        this.render();
        this.emit("week-changed", weekIndex);
    }

    /**
     * Renderowanie widoku
     */
    render() {
        const ctx = {
            state: this.state,
            DAYS,
            currentWeekIndex: this.state.currentWeekIndex,
            currentDayId: this.currentDayId,
            getDayDateKey: this.getDayDateKey.bind(this),
            getDayTimestampKey: this.getDayTimestampKey.bind(this),
            getExerciseKey: this.getExerciseKey.bind(this),
            getNoteKey: this.getNoteKey.bind(this),
            getWeekCompletion: this.getWeekCompletion.bind(this),
            getDayProgress: this.getDayProgress.bind(this),
            getTodayPlan: this.getTodayPlan.bind(this),
            getWeekDaysUI: this.getWeekDaysUI.bind(this),
            ensureWorkoutDataExists: this.ensureWorkoutDataExists.bind(this),
            getTrendUI: this.getTrendUI.bind(this),
        };

        try {
            switch (this.currentView) {
                case "home":
                    Views.renderHome(ctx);
                    break;
                case "plan":
                    Views.renderPlan(ctx);
                    break;
                case "stats":
                    Views.renderStats(ctx);
                    break;
                case "workout":
                    Views.renderWorkout(ctx);
                    this.updateSummary();
                    break;
            }

            this.updateVisibleScreen();
            this.updateBottomNav();
        } catch (error) {
            console.error(`Render error: ${error}`);
            this.showError("Błąd podczas renderowania");
        }
    }

    /**
     * Aktualizacja widocznego ekranu
     */
    updateVisibleScreen() {
        const screens = {
            home: document.getElementById("screen-home"),
            plan: document.getElementById("screen-plan"),
            stats: document.getElementById("screen-stats"),
            workout: document.getElementById("screen-workout"),
        };

        Object.entries(screens).forEach(([key, el]) => {
            if (!el) return;
            el.classList.toggle("hidden", key !== this.currentView);
        });

        const bottomNav = document.getElementById("bottom-nav");
        if (bottomNav) {
            bottomNav.classList.toggle("hidden", this.currentView === "workout");
        }
    }

    /**
     * Aktualizacja bottom navigation
     */
    updateBottomNav() {
        document.querySelectorAll(".nav-btn").forEach((btn) => {
            const view = btn.dataset.view;
            btn.classList.remove("active");

            if (this.currentView === view) {
                btn.classList.add("active");
            }
        });
    }

    /**
     * Helper: Klucz dnia
     */
    getDayDateKey(dayId) {
        return `day_${dayId}_date`;
    }

    /**
     * Helper: Timestamp klucz
     */
    getDayTimestampKey(dayId) {
        return `day_${dayId}_ts`;
    }

    /**
     * Helper: Klucz ćwiczenia
     */
    getExerciseKey(dayId, exerciseIndex) {
        return `d${dayId}_e${exerciseIndex}`;
    }

    /**
     * Helper: Klucz notatki
     */
    getNoteKey(dayId, exerciseIndex) {
        return `d${dayId}_e${exerciseIndex}_note`;
    }

    /**
     * Pobierz plan dzisiaj
     */
    getTodayPlan() {
        const weekday = new Date().getDay();
        return DAYS.find((d) => d.weekday === weekday) || null;
    }

    /**
     * Pobierz UI dni tygodnia
     */
    getWeekDaysUI() {
        const now = new Date();
        const weekday = now.getDay();
        const sunday = Utils.getCurrentSunday();
        const labels = ["ND", "PN", "WT", "ŚR", "CZ", "PT", "SB"];

        return labels
            .map((lab, i) => {
                const date = new Date(sunday);
                date.setDate(sunday.getDate() + i);

                const linkedDay = DAYS.find((d) => d.weekday === i);
                const progress = linkedDay ? this.getDayProgress(linkedDay.id) : null;
                const active = i === weekday;
                const done = progress ? progress.done > 0 : false;

                return `
                    <div class="week-day ${active ? "active" : ""} ${done ? "done" : ""}">
                        <div class="week-day-lab">${lab}</div>
                        <div class="week-day-num">${date.getDate()}</div>
                        <div class="week-day-dot"></div>
                    </div>
                `;
            })
            .join("");
    }

    /**
     * Pobierz postęp dnia
     */
    getDayProgress(dayId) {
        const day = DAYS[dayId];
        const weekData = this.state.weeks[this.state.currentWeekIndex] || {};
        let total = 0;
        let done = 0;

        day.exercises.forEach((ex, ei) => {
            const key = this.getExerciseKey(dayId, ei);
            const sets = weekData[key] || [];
            total += ex.sets;
            done += sets.filter((s) => s.done).length;
        });

        return {
            total,
            done,
            pct: total ? Math.round((done / total) * 100) : 0,
        };
    }

    /**
     * Pobierz postęp tygodnia
     */
    getWeekCompletion(weekIndex) {
        const weekData = this.state.weeks[weekIndex] || {};
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
            pct: total ? Math.round((done / total) * 100) : 0,
        };
    }

    /**
     * Upewnianie się że istnieją dane treningu
     */
    ensureWorkoutDataExists(dayId, exerciseIndex, setsCount) {
        const weekData = this.state.weeks[this.state.currentWeekIndex];
        const key = this.getExerciseKey(dayId, exerciseIndex);

        if (!weekData[key]) {
            weekData[key] = Array.from({ length: setsCount }, () => ({
                kg: 0,
                reps: 0,
                done: false,
            }));
        }
    }

    /**
     * Pobierz trend UI
     */
    getTrendUI(curr, prev) {
        if (!prev || !prev.done || !curr.done) {
            return '<span class="t-empty"></span>';
        }

        const cKg = parseFloat(curr.kg) || 0;
        const pKg = parseFloat(prev.kg) || 0;
        const cR = parseFloat(curr.reps) || 0;
        const pR = parseFloat(prev.reps) || 0;

        if (cKg > pKg) return '<span class="t-up">▲ CIĘŹAR</span>';
        if (cKg < pKg) return '<span class="t-down">▼ CIĘŹAR</span>';
        if (cR > pR) return '<span class="t-up">▲ POWT.</span>';
        if (cR < pR) return '<span class="t-down">▼ POWT.</span>';

        return '<span class="t-base">= BAZA</span>';
    }

    /**
     * Zaktualizuj notatkę
     */
    updateNote(exerciseIndex, value) {
        if (this.currentDayId === null) return;

        const weekData = this.state.weeks[this.state.currentWeekIndex];
        const noteKey = this.getNoteKey(this.currentDayId, exerciseIndex);

        weekData[noteKey] = value;

        clearTimeout(this.noteSaveTimeout);
        this.noteSaveTimeout = setTimeout(() => {
            this.persistState();
        }, ANIMATIONS.FAST);

        const btn = document.getElementById(`note-toggle-${exerciseIndex}`);
        if (btn) {
            btn.classList.toggle("active", !!value.trim());
            btn.textContent = value.trim() ? "💬 Edytuj notatkę" : "💬 Dodaj notatkę";
        }
    }

    /**
     * Zaktualizuj seriję
     */
    updateSet(exerciseIndex, setIndex, field, value) {
        if (this.currentDayId === null) return;

        const key = this.getExerciseKey(this.currentDayId, exerciseIndex);
        if (!this.state.weeks[this.state.currentWeekIndex][key]) return;

        this.state.weeks[this.state.currentWeekIndex][key][setIndex][field] = parseFloat(value) || 0;
        this.persistState();
    }

    /**
     * Toggle seriję
     */
    toggleSet(exerciseIndex, setIndex) {
        if (this.currentDayId === null) return;

        const key = this.getExerciseKey(this.currentDayId, exerciseIndex);
        const set = this.state.weeks[this.state.currentWeekIndex][key][setIndex];
        set.done = !set.done;

        this.persistState();
        this.render();
    }

    /**
     * Aktualizuj podsumowanie
     */
    updateSummary() {
        if (this.currentDayId === null) return;

        const weekData = this.state.weeks[this.state.currentWeekIndex];
        let total = 0;
        let done = 0;

        Object.keys(weekData).forEach((key) => {
            if (
                key.startsWith(`d${this.currentDayId}_`) &&
                !key.endsWith("_note") &&
                Array.isArray(weekData[key])
            ) {
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
    }

    /**
     * Reset treningu
     */
    resetWorkout() {
        if (this.currentDayId === null) return;

        const weekData = this.state.weeks[this.state.currentWeekIndex];

        delete weekData[this.getDayDateKey(this.currentDayId)];
        delete weekData[this.getDayTimestampKey(this.currentDayId)];

        Object.keys(weekData).forEach((key) => {
            if (key.startsWith(`d${this.currentDayId}_`)) {
                delete weekData[key];
            }
        });

        this.persistState();
        this.openDay(this.currentDayId);
    }

    /**
     * Event system
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach((callback) => callback(data));
        }
    }

    /**
     * Ustaw event listenery
     */
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.currentView === "workout") {
                this.goBackFromWorkout();
            }
        });

        // Listen for storage changes (multi-tab sync)
        window.addEventListener("storage", (e) => {
            if (e.key === STORAGE_KEYS.STATE) {
                this.state = JSON.parse(e.newValue);
                this.render();
            }
        });
    }

    /**
     * Wyświetl błąd
     */
    showError(message) {
        console.error(message);
    }
}

// Eksportuj singleton instancję
export const app = new TrainingApp();

// Make it global for backward compatibility
window.app = app;

// Re-export key methods as global functions
window.navigateTo = (view) => app.navigateTo(view);
window.navigateToWorkoutFromNav = () => {
    const todayPlan = app.getTodayPlan();
    if (todayPlan) {
        app.openDay(todayPlan.id);
    } else if (app.currentDayId !== null) {
        app.openDay(app.currentDayId);
    } else if (DAYS.length) {
        app.openDay(DAYS[0].id);
    }
};
window.setWeek = (w) => app.setWeek(w);
window.openDay = (id) => app.openDay(id);
window.goBackFromWorkout = () => app.goBackFromWorkout();
window.toggleNoteBox = (ei) => {
    const box = document.getElementById(`note-box-${ei}`);
    if (box) box.classList.toggle("hidden");
};
window.updateNote = (ei, val) => app.updateNote(ei, val);
window.updateSet = (ei, i, field, val) => app.updateSet(ei, i, field, val);
window.toggleSet = (ei, i) => app.toggleSet(ei, i);
window.resetWorkout = () => app.resetWorkout();

export default app;
