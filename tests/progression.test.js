// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import "../js/progression.js";

const P = () => window.Progression;

describe("parseRepRange", () => {
    it("parses 'min-max'", () => {
        expect(P().parseRepRange("6-10")).toEqual({ min: 6, max: 10 });
    });

    it("accepts en/em dashes", () => {
        expect(P().parseRepRange("8–12")).toEqual({ min: 8, max: 12 });
        expect(P().parseRepRange("8—12")).toEqual({ min: 8, max: 12 });
    });

    it("treats a single number as fixed range", () => {
        expect(P().parseRepRange("8")).toEqual({ min: 8, max: 8 });
    });

    it("falls back on garbage input", () => {
        expect(P().parseRepRange("")).toEqual({ min: 8, max: 12 });
        expect(P().parseRepRange("abc")).toEqual({ min: 8, max: 12 });
    });
});

describe("roundTo2_5", () => {
    it("rounds to nearest 2.5 kg", () => {
        expect(P().roundTo2_5(52.5)).toBe(52.5);
        expect(P().roundTo2_5(81.25)).toBe(82.5);
        expect(P().roundTo2_5(85)).toBe(85);
    });
});

describe("isDoneSet", () => {
    it("requires kg, reps and done flag", () => {
        expect(P().isDoneSet({ kg: 50, reps: 8, done: true })).toBe(true);
        expect(P().isDoneSet({ kg: 0, reps: 8, done: true })).toBe(false);
        expect(P().isDoneSet({ kg: 50, reps: 0, done: true })).toBe(false);
        expect(P().isDoneSet({ kg: 50, reps: 8, done: false })).toBe(false);
        expect(P().isDoneSet(null)).toBe(false);
    });
});

describe("workingWeight", () => {
    it("returns the heaviest completed set", () => {
        const sets = [
            { kg: 50, reps: 8, done: true },
            { kg: 52.5, reps: 7, done: true },
            { kg: 0, reps: 0, done: false }
        ];
        expect(P().workingWeight(sets)).toBe(52.5);
    });

    it("returns null when nothing is done", () => {
        expect(P().workingWeight([{ kg: 50, reps: 8, done: false }])).toBe(null);
        expect(P().workingWeight([])).toBe(null);
    });
});

describe("computeExercisePlan", () => {
    const ex = { name: "Bench Press", sets: 3, reps: "6-8" };

    it("returns 'first' when there is no previous data", () => {
        const plan = P().computeExercisePlan(ex, []);
        expect(plan.tier).toBe("first");
        expect(plan.workingKg).toBe(null);
        expect(plan.nextKg).toBe(null);
        expect(plan.targets).toEqual([6, 6, 6]);
    });

    it("returns 'increase' when every set hit the top of the range", () => {
        const prev = [
            { kg: 50, reps: 9, done: true },
            { kg: 50, reps: 8, done: true },
            { kg: 50, reps: 8, done: true }
        ];
        const plan = P().computeExercisePlan(ex, prev);
        expect(plan.tier).toBe("increase");
        expect(plan.workingKg).toBe(50);
        expect(plan.nextKg).toBe(52.5);
        expect(plan.targets).toEqual([6, 6, 6]);
    });

    it("returns 'catch-up' and bumps targets when sets are below the top", () => {
        const prev = [
            { kg: 50, reps: 8, done: true },
            { kg: 50, reps: 7, done: true }
        ];
        const plan = P().computeExercisePlan({ name: "x", sets: 2, reps: "8-12" }, prev);
        expect(plan.tier).toBe("catch-up");
        expect(plan.workingKg).toBe(50);
        expect(plan.nextKg).toBe(50);
        expect(plan.targets).toEqual([9, 8]);
    });

    it("keeps a set that is already at the top as 'hold' (null target)", () => {
        const exReps = { name: "x", sets: 2, reps: "8-10" };
        const prev = [
            { kg: 60, reps: 10, done: true },
            { kg: 60, reps: 6, done: true }
        ];
        const plan = P().computeExercisePlan(exReps, prev);
        expect(plan.tier).toBe("catch-up");
        expect(plan.targets[0]).toBe(null);
        expect(plan.targets[1]).toBe(8);
    });
});