// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import "../js/stats.js";
import "../js/utils.js";

const S = () => window.StatsModule;

const DAYS = [
    {
        id: 0,
        weekday: 0,
        name: "Niedziela",
        label: "PUSH",
        icon: "🔥",
        color: "#ff3b30",
        exercises: [
            { name: "Bench Press", sets: 3, reps: "5-8", tag: "CHEST" },
            { name: "Cable Crunch", sets: 2, reps: "8-12", tag: "CORE" }
        ]
    }
];

const getExerciseKey = (dayId, ei) => `d${dayId}_e${ei}`;

const makeState = (weeks) => ({
    currentWeekIndex: weeks.length - 1,
    startSunday: 0,
    weeks,
    bodyWeight: []
});

describe("getWeekStreak", () => {
    it("counts consecutive active weeks ending at the last one", () => {
        const state = makeState([
            { d0_e0: [{ kg: 50, reps: 8, done: true }] },
            { d0_e0: [{ kg: 55, reps: 7, done: true }] },
            { d0_e0: [{ kg: 55, reps: 8, done: true }] }
        ]);
        expect(S().getWeekStreak(state, DAYS, getExerciseKey)).toBe(3);
    });

    it("stops at the first inactive week", () => {
        const state = makeState([
            { d0_e0: [{ kg: 50, reps: 8, done: true }] },
            {}
        ]);
        expect(S().getWeekStreak(state, DAYS, getExerciseKey)).toBe(0);
    });

    it("returns 0 for empty state", () => {
        expect(S().getWeekStreak(makeState([{}]), DAYS, getExerciseKey)).toBe(0);
    });
});

describe("getProgressPercent", () => {
    it("returns growth between first and last entry", () => {
        const history = [{ bestSet: { kg: 50, reps: 8 } }, { bestSet: { kg: 60, reps: 8 } }];
        expect(S().getProgressPercent(history)).toBe(20);
    });

    it("returns 0 with fewer than two entries", () => {
        expect(S().getProgressPercent([{ bestSet: { kg: 50 } }])).toBe(0);
        expect(S().getProgressPercent([])).toBe(0);
    });
});

describe("getWeekStats", () => {
    it("counts completed sets, active days and total reps", () => {
        const state = makeState([
            {
                d0_e0: [
                    { kg: 50, reps: 8, done: true },
                    { kg: 50, reps: 8, done: false }
                ],
                d0_e1: [{ kg: 0, reps: 0, done: false }]
            }
        ]);
        const stats = S().getWeekStats(state, DAYS, 0, getExerciseKey);
        expect(stats.completedSets).toBe(1);
        expect(stats.activeDays).toBe(1);
        expect(stats.totalReps).toBe(8);
    });
});

describe("getBodyWeightSeries", () => {
    it("sorts entries and computes last delta", () => {
        const now = Date.now();
        const state = {
            bodyWeight: [
                { ts: now - 7 * 86400000, kg: 78.2 },
                { ts: now, kg: 77.6 }
            ]
        };
        const bw = S().getBodyWeightSeries(state, 40);
        expect(bw.values).toEqual([78.2, 77.6]);
        expect(bw.last).toBe(77.6);
        expect(bw.delta).toBeCloseTo(-0.6);
    });
});