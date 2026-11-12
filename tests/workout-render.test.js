// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import "../js/utils.js";
import "../js/progression.js";
import "../js/views.js";

const makeCtx = ({ allDone = false } = {}) => {
    const set = (kg, reps, done) => ({ kg, reps, done });
    const currentWeekSets = allDone
        ? [set(50, 10, true), set(50, 9, true), set(50, 9, true)]
        : [set(50, 9, true), set(0, 0, false), set(0, 0, false)];
    const prevWeekSets = [set(50, 8, true), set(50, 8, true), set(50, 8, true)];

    return {
        state: {
            currentWeekIndex: 1,
            weeks: [
                { "_d1": "", "d1": prevWeekSets, "d1_note": "" },
                { "_d1": "", "d1": currentWeekSets, "d1_note": "" }
            ]
        },
        currentWeekIndex: 1,
        currentDayId: 1,
        DAYS: [{
            id: 1,
            label: "Poniedziałek",
            icon: "🔥",
            exercises: [{ name: "Wyciskanie", sets: 3, reps: "8-10", tag: "CHEST" }]
        }],
        getDayDateKey: () => "_d1",
        getExerciseKey: () => "d1",
        getNoteKey: () => "d1_note",
        ensureWorkoutDataExists: () => {},
        getTrend: (s, prev) => (prev && prev.done && s && s.done ? "r-up" : null)
    };
};

describe("renderWorkout", () => {
    beforeEach(() => {
        window.Views.clearExpanded();
    });

    it("renders aggregate badge in the header when all series share the same trend", () => {
        window.Views.toggleExExpand(1, 0);
        document.body.innerHTML = '<div id="screen-workout"></div>';
        window.Views.renderWorkout(makeCtx({ allDone: true }));
        const html = document.getElementById("screen-workout").innerHTML;
        expect(html).toContain('class="ex-trend t-up"');
        expect(html).toContain("▲ POWT.");
        expect(html).toContain('class="prog-card completed"');
        expect(html).not.toContain('class="trend-badge t-up"');
    });

    it("keeps per-series trend badges only when statuses differ", () => {
        const ctx = makeCtx({ allDone: true });
        ctx.getTrend = (s) => (Number(s.reps) >= 10 ? "r-up" : "base");
        window.Views.toggleExExpand(1, 0);
        document.body.innerHTML = '<div id="screen-workout"></div>';
        window.Views.renderWorkout(ctx);
        const html = document.getElementById("screen-workout").innerHTML;
        expect(html).toContain('class="trend-badge t-up"');
        expect(html).toMatch(/trend-badge t-base/g);
        expect(html).not.toContain('class="ex-trend');
    });

    it("collapses a completed exercise to a labeled expand button, expandable via toggleExerciseExpand", () => {
        document.body.innerHTML = '<div id="screen-workout"></div>';
        window.Views.renderWorkout(makeCtx({ allDone: true }));
        const html = document.getElementById("screen-workout").innerHTML;
        expect(html).toContain('class="ex-expand-btn"');
        expect(html).toContain("Pokaż serie");
        expect(html).toContain('aria-expanded="false"');
        expect(html).not.toContain("prog-card completed");
        expect(html).not.toContain("sets-list");

        window.Views.toggleExExpand(1, 0);
        window.Views.renderWorkout(makeCtx({ allDone: true }));
        const html2 = document.getElementById("screen-workout").innerHTML;
        expect(html2).toContain('aria-expanded="true"');
        expect(html2).toContain("Zwiń szczegóły");
        expect(html2).toContain("sets-list");
        expect(html2).toContain("prog-card completed");
    });

    it("matches previous week sets by exercise name when the plan changed", () => {
        const set = (kg, reps) => ({ kg, reps, done: true });
        const ctx = {
            state: {
                currentWeekIndex: 1,
                weeks: [
                    {
                        d1_e0: [set(40, 8)],
                        d1_e0_note: "stara notatka",
                        d1_e1: [set(99, 5)],
                        d1_e1_note: "inna notatka",
                    },
                    { d1_e0: [], d1_e1: [] },
                ],
                weekPlans: {
                    0: [
                        {
                            id: 1,
                            exercises: [{ name: "Stare Ćwiczenie" }, { name: "Inne Ćwiczenie" }],
                        },
                    ],
                    1: [
                        {
                            id: 1,
                            exercises: [{ name: "Nowe Ćwiczenie" }, { name: "Stare Ćwiczenie" }],
                        },
                    ],
                },
            },
            currentWeekIndex: 1,
            currentDayId: 1,
            DAYS: [
                {
                    id: 1,
                    label: "Poniedziałek",
                    icon: "🔥",
                    exercises: [
                        { name: "Nowe Ćwiczenie", sets: 1, reps: "8-10", tag: "CHEST" },
                        { name: "Stare Ćwiczenie", sets: 1, reps: "8-10", tag: "CHEST" },
                    ],
                },
            ],
            getDayDateKey: () => "_d1",
            getExerciseKey: (dayId, ei) => `d${dayId}_e${ei}`,
            getNoteKey: (dayId, ei) => `d${dayId}_e${ei}_note`,
            ensureWorkoutDataExists: () => {},
            getTrend: () => null,
        };

        window.Views.toggleExExpand(1, 1);
        document.body.innerHTML = '<div id="screen-workout"></div>';
        window.Views.renderWorkout(ctx);
        const html = document.getElementById("screen-workout").innerHTML;

        // Stare Ćwiczenie było w poprzednim tygodniu na e0, a teraz jest na e1.
        expect(html).toContain("40 kg");
        expect(html).toContain("stara notatka");
        // Nie może dziedziczyć danych z e1 tylko dlatego, że ten sam indeks.
        expect(html).not.toContain("99 kg");
        expect(html).not.toContain("inna notatka");
    });

    it("keeps the full card (with inputs) for an incomplete workout", () => {
        document.body.innerHTML = '<div id="screen-workout"></div>';
        window.Views.renderWorkout(makeCtx());
        const html = document.getElementById("screen-workout").innerHTML;
        expect(html).toContain("input-group");
        expect(html).toContain('type="number"');
        expect(html).not.toContain("ex-expand-btn");
    });
});