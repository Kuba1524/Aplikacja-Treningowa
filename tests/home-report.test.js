// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import "../js/utils.js";
import "../js/stats.js";
import "../js/views.js";

const DAYS = [
    {
        id: 0,
        weekday: 0,
        name: "Niedziela",
        label: "PUSH",
        icon: "🔥",
        exercises: [
            { name: "Bench Press", sets: 3, reps: "5-8", tag: "CHEST" },
            { name: "Cable Crunch", sets: 2, reps: "8-12", tag: "CORE" }
        ]
    }
];

const DAYS_TWO = [
    ...DAYS,
    {
        id: 1,
        weekday: 1,
        name: "Poniedziałek",
        label: "PULL",
        icon: "💪",
        exercises: [
            { name: "Seated Cable Row", sets: 3, reps: "8-12", tag: "BACK" }
        ]
    }
];

const getExerciseKey = (dayId, ei) => `d${dayId}_e${ei}`;
const getDayTimestampKey = (dayId) => `day_${dayId}_ts`;
const getNoteKey = (dayId, ei) => `d${dayId}_e${ei}_note`;
const exerciseNameKey = (name) => String(name || "").trim().toLowerCase();

const makeWeek = (benchKg, crunchKg, ts) => ({
    d0_e0: [{ kg: benchKg, reps: 8, done: true }],
    d0_e1: [{ kg: crunchKg, reps: 10, done: true }],
    day_0_ts: ts
});

const makeState = (weeks) => ({
    currentWeekIndex: weeks.length - 1,
    startSunday: new Date(2026, 10, 1).getTime(),
    weeks
});

const makeCtx = (state, days = DAYS) => ({
    state,
    DAYS: days,
    currentWeekIndex: state.currentWeekIndex,
    getExerciseKey,
    getDayTimestampKey,
    getNoteKey,
    exerciseNameKey,
    getWeekPlan: () => days,
    getWeekCompletion: () => ({ total: 2, done: 2, pct: 100 }),
    getDayProgress: () => ({ total: 3, done: 3, pct: 100 }),
    getTodayPlan: () => null,
    getWeekDaysUI: () => ""
});

describe("renderHome weekly report", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="screen-home"></div>';
    });

    it("shows volume change, new PRs and the best exercise", () => {
        const state = makeState([
            makeWeek(50, 10, new Date(2026, 10, 2).getTime()),
            makeWeek(55, 12, new Date(2026, 10, 9).getTime())
        ]);

        window.Views.renderHome(makeCtx(state));

        const report = document.querySelector(".week-report");
        expect(report).not.toBeNull();
        expect(report.textContent).toContain("Raport tygodnia");
        expect(report.textContent).toContain("Tydzień 2 w skrócie");
        expect(report.querySelector(".week-report-score").textContent).toContain(
            "1/1"
        );
        expect(report.textContent).toContain("560 kg");
        expect(report.textContent).toContain("+12%");
        expect(report.textContent).toContain("Nowe PR-y");
        expect(report.textContent).toContain("Bench Press · Cable Crunch");
        expect(report.textContent).toContain("Najlepsze ćwiczenie");
        expect(report.textContent).toContain("440 kg");
        expect(report.textContent).toContain(
            "Tydzień domknięty — 2 nowe rekordy."
        );
    });

    it("does not count the first result as a PR", () => {
        const state = makeState([
            makeWeek(50, 10, new Date(2026, 10, 2).getTime())
        ]);

        window.Views.renderHome(makeCtx(state));

        const report = document.querySelector(".week-report");
        expect(report).not.toBeNull();
        expect(report.querySelector(".week-report-value").textContent).toBe(
            "500 kg"
        );
        expect(report.textContent).toContain("pierwszy tydzień");
        expect(report.textContent).toContain("Bez nowych rekordów");
        expect(report.textContent).toContain(
            "Tydzień domknięty — solidna robota."
        );
    });

    it("compares the same days while the week is in progress", () => {
        const state = makeState([
            makeWeek(50, 10, new Date(2026, 10, 2).getTime()),
            makeWeek(55, 12, new Date(2026, 10, 9).getTime())
        ]);

        window.Views.renderHome(makeCtx(state, DAYS_TWO));

        const report = document.querySelector(".week-report");
        expect(report).not.toBeNull();
        expect(report.querySelector(".week-report-score").textContent).toContain(
            "1/2"
        );
        expect(report.textContent).toContain("+12% vs poprz. (1 dzień)");
        expect(report.textContent).toContain(
            "Brakuje 1 treningu do domknięcia tygodnia."
        );
    });

    it("does not compare against a previous week that lacks those days", () => {
        const previousWeek = {
            d1_e0: [{ kg: 40, reps: 10, done: true }],
            day_1_ts: new Date(2026, 10, 2).getTime()
        };
        const currentWeek = makeWeek(55, 12, new Date(2026, 10, 9).getTime());
        const state = makeState([previousWeek, currentWeek]);

        window.Views.renderHome(makeCtx(state, DAYS_TWO));

        const report = document.querySelector(".week-report");
        expect(report).not.toBeNull();
        expect(report.textContent).toContain("560 kg");
        expect(report.textContent).toContain("brak porównania");
    });
});
