/**
 * Views module - Handle screen rendering
 */

import { DAYS } from "./constants.js";
import * as Utils from "./utils.js";

/**
 * Render home screen
 */
export function renderHome(ctx) {
    const { getTodayPlan, getWeekCompletion, state } = ctx;
    const todayPlan = getTodayPlan();
    const weekCompletion = getWeekCompletion(state.currentWeekIndex);

    const homeContent = `
        <div class="home-hero text-center mb-3xl">
            <h1 class="text-5xl weight-900 mb-lg">💪 KubaGym</h1>
            <p class="text-lg text-dim mb-md">Śledzenie treningów, który zwycięża</p>
            <div class="flex justify-center gap-lg mt-2xl">
                <button class="btn" onclick="navigateTo('plan')">📋 Mój Plan</button>
                ${todayPlan ? `<button class="btn btn-secondary" onclick="openDay(${todayPlan.id})">💪 Dzisiaj</button>` : ""}
            </div>
        </div>

        <div class="grid grid-2 gap-lg mb-2xl">
            <div class="card">
                <div class="text-center">
                    <div class="text-4xl mb-md">📊</div>
                    <h3 class="text-xl weight-600 mb-sm">Ten Tydzień</h3>
                    <div class="text-3xl weight-700 mb-md text-accent">${weekCompletion.pct}%</div>
                    <p class="text-sm text-dim">${weekCompletion.done} / ${weekCompletion.total} serii</p>
                </div>
            </div>
            <div class="card">
                <div class="text-center">
                    <div class="text-4xl mb-md">🔥</div>
                    <h3 class="text-xl weight-600 mb-sm">Dzisiaj</h3>
                    <p class="text-lg text-dim">${todayPlan ? todayPlan.name : "Dzień wolny"}</p>
                    ${todayPlan ? `<button class="btn btn-secondary w-full mt-lg" onclick="openDay(${todayPlan.id})">Rozpocznij</button>` : ""}
                </div>
            </div>
        </div>

        <div class="card">
            <h2 class="text-2xl weight-700 mb-lg">Szybkie Linki</h2>
            <div class="grid grid-2 gap-md">
                <button class="btn btn-secondary w-full" onclick="navigateTo('plan')">📋 Plan Treningowy</button>
                <button class="btn btn-secondary w-full" onclick="navigateTo('stats')">📈 Statystyki</button>
            </div>
        </div>
    `;

    document.getElementById("home-content").innerHTML = homeContent;
}

/**
 * Render plan screen
 */
export function renderPlan(ctx) {
    const {
        state,
        DAYS,
        getDayProgress,
        getWeekRangeLabel,
        getWeekCompletion,
        setWeek,
    } = ctx;

    const currentWeek = state.weeks[state.currentWeekIndex] || {};
    const weekCompletion = getWeekCompletion(state.currentWeekIndex);
    const weekLabel = getWeekRangeLabel(state.startSunday, state.currentWeekIndex);

    let daysHtml = DAYS.map((day) => {
        const progress = getDayProgress(day.id);
        const progressClass = progress.pct === 100 ? "done" : progress.pct > 0 ? "in-progress" : "";

        return `
            <div class="card ${progressClass} cursor-pointer" onclick="openDay(${day.id})">
                <div class="flex justify-between align-center mb-md">
                    <h3 class="text-lg weight-600">${day.name}</h3>
                    <span class="badge badge-success">${progress.pct}%</span>
                </div>
                <div class="flex flex-col gap-sm">
                    ${day.exercises
                        .map((ex) => `<div class="text-sm text-dim">• ${ex.name}</div>`)
                        .join("")}
                </div>
                <div class="mt-lg">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.pct}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    const planContent = `
        <div class="mb-2xl">
            <div class="flex justify-between align-center mb-lg">
                <div>
                    <h2 class="text-2xl weight-700">${weekLabel}</h2>
                    <p class="text-sm text-dim mt-sm">Tydzień ${state.currentWeekIndex + 1}</p>
                </div>
                <div class="flex gap-sm">
                    <button class="btn btn-secondary" onclick="setWeek(${Math.max(0, state.currentWeekIndex - 1)})" ${state.currentWeekIndex === 0 ? "disabled" : ""}>← Wstecz</button>
                    <button class="btn btn-secondary" onclick="setWeek(${Math.min(state.weeks.length - 1, state.currentWeekIndex + 1)})" ${state.currentWeekIndex === state.weeks.length - 1 ? "disabled" : ""}>Dalej →</button>
                </div>
            </div>

            <div class="card mb-lg">
                <div class="text-center">
                    <p class="text-sm text-dim mb-sm">Postęp tygodnia</p>
                    <div class="text-4xl weight-900 text-accent">${weekCompletion.pct}%</div>
                    <div class="text-sm text-dim mt-sm">${weekCompletion.done} / ${weekCompletion.total} serii ukończonych</div>
                </div>
            </div>
        </div>

        <div class="grid gap-lg">
            ${daysHtml}
        </div>
    `;

    document.getElementById("plan-content").innerHTML = planContent;
}

/**
 * Render stats screen
 */
export function renderStats(ctx) {
    const { state, DAYS, getDayProgress, getWeekCompletion } = ctx;

    let weeksStatsHtml = state.weeks
        .map((week, idx) => {
            const completion = getWeekCompletion(idx);
            return `
                <div class="card-soft">
                    <div class="flex justify-between align-center">
                        <span class="weight-600">Tydzień ${idx + 1}</span>
                        <span class="badge badge-success">${completion.pct}%</span>
                    </div>
                    <div class="progress-bar mt-md">
                        <div class="progress-fill" style="width: ${completion.pct}%"></div>
                    </div>
                </div>
            `;
        })
        .join("");

    let exerciseStatsHtml = DAYS.map((day) => {
        const progress = getDayProgress(day.id);
        return `
            <div class="card-soft">
                <div class="text-sm weight-600 mb-md">${day.name}</div>
                <div class="flex justify-between text-sm">
                    <span class="text-dim">${progress.done} / ${progress.total} serii</span>
                    <span class="badge badge-success">${progress.pct}%</span>
                </div>
            </div>
        `;
    }).join("");

    const statsContent = `
        <div class="grid grid-2 gap-lg mb-2xl">
            <div class="card text-center">
                <div class="text-4xl mb-md">📊</div>
                <p class="text-sm text-dim mb-md">Wszystkie Tygodnie</p>
                <div class="text-3xl weight-700 text-accent">
                    ${Math.round(
                        (state.weeks.reduce((sum, w) => sum + getWeekCompletion(state.weeks.indexOf(w)).done, 0) /
                            Math.max(1, state.weeks.reduce((sum, w) => sum + getWeekCompletion(state.weeks.indexOf(w)).total, 0))) *
                            100
                    )}%
                </div>
            </div>
            <div class="card text-center">
                <div class="text-4xl mb-md">🔥</div>
                <p class="text-sm text-dim mb-md">Całkowite Serie</p>
                <div class="text-3xl weight-700 text-accent">
                    ${state.weeks.reduce((sum, w) => sum + getWeekCompletion(state.weeks.indexOf(w)).total, 0)}
                </div>
            </div>
        </div>

        <div class="mb-2xl">
            <h2 class="text-2xl weight-700 mb-lg">Postęp Tygodniowy</h2>
            <div class="grid gap-md">
                ${weeksStatsHtml}
            </div>
        </div>

        <div>
            <h2 class="text-2xl weight-700 mb-lg">Ćwiczenia</h2>
            <div class="grid gap-md">
                ${exerciseStatsHtml}
            </div>
        </div>
    `;

    document.getElementById("stats-content").innerHTML = statsContent;
}

/**
 * Render workout screen
 */
export function renderWorkout(ctx) {
    const {
        state,
        currentDayId,
        DAYS,
        getExerciseKey,
        getNoteKey,
        getDayDateKey,
        getTrendUI,
        ensureWorkoutDataExists,
    } = ctx;

    if (currentDayId === null) {
        document.getElementById("workout-content").innerHTML =
            '<div class="card text-center"><p class="text-dim">Brak wybranego dnia</p></div>';
        return;
    }

    const day = DAYS.find((d) => d.id === currentDayId);
    if (!day) return;

    const weekData = state.weeks[state.currentWeekIndex];
    const prevWeekData = state.currentWeekIndex > 0 ? state.weeks[state.currentWeekIndex - 1] : null;
    const dayDate = weekData[getDayDateKey(currentDayId)];

    let exercisesHtml = day.exercises
        .map((exercise, exerciseIdx) => {
            const key = getExerciseKey(currentDayId, exerciseIdx);
            const noteKey = getNoteKey(currentDayId, exerciseIdx);
            const sets = weekData[key] || [];
            const prevSets = prevWeekData ? prevWeekData[key] : null;
            const note = weekData[noteKey] || "";

            ensureWorkoutDataExists(currentDayId, exerciseIdx, exercise.sets);

            let setsHtml = (weekData[key] || [])
                .map((set, setIdx) => {
                    const prevSet = prevSets && prevSets[setIdx] ? prevSets[setIdx] : null;
                    const trendUI = getTrendUI(set, prevSet);

                    return `
                        <div class="card-soft">
                            <div class="flex gap-md align-center">
                                <input
                                    type="checkbox"
                                    class="set-checkbox"
                                    ${set.done ? "checked" : ""}
                                    onchange="toggleSet(${exerciseIdx}, ${setIdx})"
                                />
                                <div class="flex gap-sm flex-1">
                                    <input
                                        type="number"
                                        placeholder="kg"
                                        value="${set.kg}"
                                        class="input-small"
                                        step="0.5"
                                        onchange="updateSet(${exerciseIdx}, ${setIdx}, 'kg', this.value)"
                                    />
                                    <span class="text-dim">×</span>
                                    <input
                                        type="number"
                                        placeholder="reps"
                                        value="${set.reps}"
                                        class="input-small"
                                        step="1"
                                        onchange="updateSet(${exerciseIdx}, ${setIdx}, 'reps', this.value)"
                                    />
                                </div>
                                <div class="trend-indicator">${trendUI}</div>
                            </div>
                        </div>
                    `;
                })
                .join("");

            return `
                <div class="card">
                    <div class="flex justify-between align-center mb-lg">
                        <h3 class="text-lg weight-600">${exercise.name}</h3>
                        <button id="note-toggle-${exerciseIdx}" class="btn btn-ghost ${note ? "active" : ""}" onclick="toggleNoteBox(${exerciseIdx})">
                            📝 ${note ? "Edytuj" : "Dodaj"}
                        </button>
                    </div>

                    <div class="grid gap-md mb-lg">
                        ${setsHtml}
                    </div>

                    <div id="note-box-${exerciseIdx}" class="hidden">
                        <textarea
                            class="w-full"
                            placeholder="Dodaj notatkę..."
                            rows="3"
                            onchange="updateNote(${exerciseIdx}, this.value)"
                        >${note}</textarea>
                    </div>
                </div>
            `;
        })
        .join("");

    const workoutContent = `
        <div class="mb-2xl">
            <div class="card">
                <h2 class="text-2xl weight-700 mb-md">${day.name}</h2>
                <p class="text-sm text-dim mb-lg">${dayDate || "Nowy trening"}</p>
                <div class="flex gap-md">
                    <div class="flex-1">
                        <p class="text-xs text-dim mb-sm">Postęp</p>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                        </div>
                        <p class="text-sm mt-sm"><span id="s-done">0</span> serii • <span id="s-pct">0%</span></p>
                    </div>
                    <button class="btn btn-danger" onclick="if(confirm('Resetuj ten trening?')) resetWorkout()">🔄 Reset</button>
                </div>
            </div>
        </div>

        <div class="grid gap-lg">
            ${exercisesHtml}
        </div>
    `;

    document.getElementById("workout-content").innerHTML = workoutContent;
}

// Add CSS for workout components
const workoutStyles = `
<style>
    .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--card-bg);
        border-radius: 999px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--success), var(--accent));
        transition: width 300ms ease;
    }

    .input-small {
        width: 60px;
        padding: var(--space-sm) var(--space-md);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--card-inner);
        color: var(--text-main);
        text-align: center;
        font-size: var(--text-sm);
    }

    .set-checkbox {
        width: 20px;
        height: 20px;
        cursor: pointer;
        accent-color: var(--success);
    }

    .trend-indicator {
        font-size: var(--text-xs);
        font-weight: var(--weight-600);
        min-width: 60px;
        text-align: right;
    }

    .t-up {
        color: var(--success);
    }

    .t-down {
        color: var(--danger);
    }

    .t-base {
        color: var(--warning);
    }

    .t-empty {
        color: var(--text-dim);
    }

    .card.done {
        opacity: 0.7;
        border-color: var(--success);
    }

    .card.in-progress {
        border-color: var(--accent);
    }

    .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: var(--nav-h);
        background: var(--bg);
        border-top: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }

    .nav-btn {
        flex: 1;
        padding: var(--space-lg);
        border: none;
        background: transparent;
        color: var(--text-dim);
        font-size: var(--text-sm);
        cursor: pointer;
        transition: all var(--transition-fast);
        text-align: center;
    }

    .nav-btn:hover {
        color: var(--text-main);
        background: var(--card-bg);
    }

    .nav-btn.active {
        color: var(--accent);
    }
</style>
`;

if (!document.querySelector('style[data-views-styles]')) {
    const style = document.createElement('style');
    style.setAttribute('data-views-styles', 'true');
    style.textContent = workoutStyles.replace(/<\/?style>/g, '');
    document.head.appendChild(style);
}
