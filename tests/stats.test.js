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
            { name: "Cable Crunch", sets: 2, reps: "8-12", tag: "CORE" },
            { name: "Chest Dips", sets: 3, reps: "6-10", tag: "CHEST" }
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

describe("getWeeklyVolume", () => {
    it("sums sets per muscle tag across all days", () => {
        const vol = S().getWeeklyVolume(DAYS);
        expect(vol).toEqual([
            { tag: "CHEST", sets: 6 },
            { tag: "CORE", sets: 2 }
        ]);
    });

    it("returns an empty list for an empty plan", () => {
        expect(S().getWeeklyVolume([])).toEqual([]);
    });
});

describe("getStagnantExercises", () => {
    const plank = (kg, reps) => ({ kg, reps, done: true });
    const week = (bench, crunches) => ({ d0_e0: bench, d0_e1: crunches });
    const progCrunches = (n) =>
        Array.from({ length: n }, (_, i) => plank(10, 10 + i));

    it("lists exercises whose weight and reps are flat for 2+ sessions", () => {
        const state = makeState([
            week([plank(52.5, 8)], progCrunches(1)),
            week([plank(52.5, 8)], progCrunches(2)),
            week([plank(52.5, 8)], progCrunches(3)),
            week([plank(52.5, 8)], progCrunches(4))
        ]);
        const stale = S().getStagnantExercises(state, DAYS, getExerciseKey, 2);
        expect(stale).toHaveLength(1);
        expect(stale[0].name).toBe("Bench Press");
        expect(stale[0].streak).toBe(4);
        expect(stale[0].kg).toBe(52.5);
    });

    it("ignores exercises that improved in the last session", () => {
        const state = makeState([
            week([plank(50, 8)], progCrunches(1)),
            week([plank(50, 8)], progCrunches(2)),
            week([plank(52.5, 8)], progCrunches(3))
        ]);
        const stale = S().getStagnantExercises(state, DAYS, getExerciseKey, 2);
        expect(stale).toHaveLength(0);
    });

    it("counts reps increases at the same weight as progress", () => {
        const state = makeState([
            week([plank(52.5, 7)], progCrunches(1)),
            week([plank(52.5, 7)], progCrunches(2)),
            week([plank(52.5, 8)], progCrunches(3))
        ]);
        const stale = S().getStagnantExercises(state, DAYS, getExerciseKey, 2);
        expect(stale).toHaveLength(0);
    });

    it("flags bodyweight exercises by reps alone and marks them", () => {
        const dips = (reps) => [plank(0, reps)];
        const state = makeState([
            { d0_e0: [plank(52.5, 8)], d0_e1: progCrunches(1), d0_e2: dips(9) },
            { d0_e0: [plank(52.5, 8)], d0_e1: progCrunches(2), d0_e2: dips(9) },
            { d0_e0: [plank(52.5, 8)], d0_e1: progCrunches(3), d0_e2: dips(9) },
            { d0_e0: [plank(52.5, 8)], d0_e1: progCrunches(4), d0_e2: dips(9) }
        ]);
        const stale = S().getStagnantExercises(state, DAYS, getExerciseKey, 2);
        expect(stale).toHaveLength(2);
        const dipsInfo = stale.find((s) => s.name === "Chest Dips");
        expect(dipsInfo).toBeDefined();
        expect(dipsInfo.bodyweight).toBe(true);
        expect(dipsInfo.kg).toBe(0);
        expect(dipsInfo.reps).toBe(9);
        expect(dipsInfo.streak).toBe(4);
    });

    it("treats bodyweight reps increases as progress", () => {
        const dips = (reps) => [plank(0, reps)];
        const state = makeState([
            { d0_e0: [plank(52.5, 8)], d0_e1: progCrunches(1), d0_e2: dips(9) },
            { d0_e0: [plank(52.5, 8)], d0_e1: progCrunches(2), d0_e2: dips(9) },
            { d0_e0: [plank(52.5, 8)], d0_e1: progCrunches(3), d0_e2: dips(9) },
            { d0_e0: [plank(50, 8)], d0_e1: progCrunches(4), d0_e2: dips(10) }
        ]);
        const stale = S().getStagnantExercises(state, DAYS, getExerciseKey, 2);
        expect(stale.find((s) => s.name === "Chest Dips")).toBeUndefined();
    });

    it("resets stagnation on total-reps progress across non-best sets", () => {
        // 8,7,6 → 8,8,6 → 8,8,7 → 8,8,8: każda sesja ma progres w którejś serii,
        // więc mimo stałego ciężaru (masa własna) ćwiczenie NIE jest stagnujące.
        const dipsSeq = (...reps) => reps.map((r) => plank(0, r));
        const state = makeState([
            { d0_e0: [plank(50, 8)], d0_e1: progCrunches(1), d0_e2: dipsSeq(8, 7, 6) },
            { d0_e0: [plank(50, 8)], d0_e1: progCrunches(2), d0_e2: dipsSeq(8, 8, 6) },
            { d0_e0: [plank(52.5, 8)], d0_e1: progCrunches(3), d0_e2: dipsSeq(8, 8, 7) },
            { d0_e0: [plank(52.5, 8)], d0_e1: progCrunches(4), d0_e2: dipsSeq(8, 8, 8) }
        ]);
        const stale = S().getStagnantExercises(state, DAYS, getExerciseKey);
        expect(stale.find((s) => s.name === "Chest Dips")).toBeUndefined();
    });

    it("flags a fully flat bodyweight run of 4 sessions", () => {
        // 8,7,6 × 4 sesje: zero progresu ani w ciężarze, ani w powtórzeniach.
        const dipsSeq = (...reps) => reps.map((r) => plank(0, r));
        const state = makeState([
            { d0_e0: [plank(50, 8)], d0_e1: progCrunches(1), d0_e2: dipsSeq(8, 7, 6) },
            { d0_e0: [plank(52.5, 8)], d0_e1: progCrunches(2), d0_e2: dipsSeq(8, 7, 6) },
            { d0_e0: [plank(55, 8)], d0_e1: progCrunches(3), d0_e2: dipsSeq(8, 7, 6) },
            { d0_e0: [plank(57.5, 8)], d0_e1: progCrunches(4), d0_e2: dipsSeq(8, 7, 6) }
        ]);
        const stale = S().getStagnantExercises(state, DAYS, getExerciseKey);
        expect(stale).toHaveLength(1);
        expect(stale[0].name).toBe("Chest Dips");
        expect(stale[0].bodyweight).toBe(true);
        expect(stale[0].streak).toBe(4);
    });

    it("does not flag short plateaus with the default threshold", () => {
        const state = makeState([
            week([plank(52.5, 8)], progCrunches(1)),
            week([plank(52.5, 8)], progCrunches(2)),
            week([plank(52.5, 8)], progCrunches(3))
        ]);
        expect(S().getStagnantExercises(state, DAYS, getExerciseKey)).toHaveLength(0);
    });

    it("flags plateaus of 4+ sessions with the default threshold", () => {
        const state = makeState([
            week([plank(52.5, 8)], progCrunches(1)),
            week([plank(52.5, 8)], progCrunches(2)),
            week([plank(52.5, 8)], progCrunches(3)),
            week([plank(52.5, 8)], progCrunches(4)),
            week([plank(52.5, 8)], progCrunches(5))
        ]);
        const stale = S().getStagnantExercises(state, DAYS, getExerciseKey);
        expect(stale).toHaveLength(1);
        expect(stale[0].name).toBe("Bench Press");
        expect(stale[0].streak).toBe(5);
    });
});

describe("getLastPR", () => {
    it("returns the most recent all-time best and its timestamp", () => {
        const history = [
            { bestSet: { kg: 50, reps: 8 }, ts: 100 },
            { bestSet: { kg: 52.5, reps: 7 }, ts: 200 },
            { bestSet: { kg: 52.5, reps: 8 }, ts: 300 },
            { bestSet: { kg: 50, reps: 8 }, ts: 400 }
        ];
        const pr = S().getLastPR(history);
        expect(pr.kg).toBe(52.5);
        expect(pr.reps).toBe(8);
        expect(pr.ts).toBe(300);
        expect(pr.sessionsAgo).toBe(1);
    });

    it("returns null for empty history", () => {
        expect(S().getLastPR([])).toBeNull();
    });
});