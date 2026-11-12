// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from "vitest";

const KUBA_ID = "user_rt8zi8glg_1787597563228";

const set = (kg, reps, count) => Array.from({ length: count }, () => ({ kg, reps, done: true }));

const setupDom = () => {
    document.body.innerHTML = `
        <div id="screen-home"></div>
        <div id="screen-plan"></div>
        <div id="screen-stats"></div>
        <div id="screen-workout"></div>
        <div id="screen-library"></div>
        <div id="screen-manage"></div>
        <div id="bottom-nav"></div>
        <div id="rest-timer-bar"></div>
    `;
};

const setupStorage = () => {
    // Start w niedzielę 10.05.2026 — tydzień 26 (8.11.2026) to już nowy plan.
    const startSunday = new Date(2026, 4, 10, 0, 0, 0, 0).getTime();
    const weeks = Array.from({ length: 27 }, () => ({}));

    // Tydzień 1: stary plan z Incline Dumbbell Press (4 serie) i wiosłowaniami
    // po 4 serie, dane PULL jeszcze w nowym układzie po migracji v74.
    weeks[0] = {
        d0_e0: set(24, 7, 4),
        d1_e0: set(7.5, 6, 4),
        d1_e1: set(32, 8, 4),
        d1_e2: set(59.1, 9, 4),
    };

    // Tydzień 20: Incline Smith Machine Press (3 serie), WPU nadal 4 serie.
    weeks[19] = {
        d0_e0: set(40, 7, 3),
        d1_e0: set(10, 6, 4),
        d1_e1: set(30, 8, 3),
        d1_e2: set(59.1, 11, 4),
    };

    // Tydzień 21: WPU już po 3 serie.
    weeks[20] = {
        d0_e0: set(45, 7, 3),
        d1_e0: set(10, 6, 3),
        d1_e1: set(30, 9, 3),
        d1_e2: set(59.1, 11, 4),
    };

    // Tydzień 27: nowy plan.
    weeks[26] = {
        d1_e0: set(10, 6, 3),
        d1_e3: set(15, 12, 3),
    };

    const fixture = {
        currentWeekIndex: 26,
        startSunday,
        weeks,
        bodyWeight: [],
        migrations: {},
        customPlan: {},
        customPlanMeta: {},
        weekSchedule: {},
    };

    localStorage.setItem("selected_profile_id", KUBA_ID);
    localStorage.setItem("user_id", KUBA_ID);

    globalThis.firebase = {
        firestore: {
            FieldValue: {
                serverTimestamp: () => 1,
            },
        },
    };
    globalThis.db = {
        collection: () => ({
            doc: () => ({
                get: async () => ({ exists: true, data: () => ({ state: fixture }) }),
                set: async () => ({}),
            }),
        }),
    };
};

const readSavedState = () => {
    const key = Object.keys(localStorage).find((k) => k.includes(KUBA_ID));
    return JSON.parse(localStorage.getItem(key));
};

describe("historyczny plan Kuby per tydzień", () => {
    let saved;

    beforeAll(async () => {
        setupDom();
        setupStorage();

        await import("../js/utils.js");
        await import("../js/storage.js");
        await import("../js/stats.js");
        await import("../js/progression.js");
        await import("../js/views.js");
        await import("../js/app.js");

        await new Promise((resolve) => setTimeout(resolve, 600));
        saved = readSavedState();
    });

    it("tydzień 1 ma Incline Dumbbell Press i 4 serie wiosłowań", () => {
        const plan = saved.weekPlans[0];
        expect(plan[0].exercises[0].name).toBe("Incline Dumbbell Press");
        expect(plan[0].exercises[0].sets).toBe(4);
        expect(plan[1].exercises[0].sets).toBe(4); // Weighted Pull Ups
        expect(plan[1].exercises[1].sets).toBe(4); // Single-Arm Dumbbell Row
        expect(plan[1].exercises[2].sets).toBe(4); // Seated Cable Row
    });

    it("od 15. tygodnia wiosłowania mają 3 serie", () => {
        expect(saved.weekPlans[13][1].exercises[1].sets).toBe(4);
        expect(saved.weekPlans[14][1].exercises[1].sets).toBe(3);
        expect(saved.weekPlans[14][1].exercises[2].sets).toBe(3);
    });

    it("Incline Smith wchodzi od 20. tygodnia, WPU 3 serie od 21.", () => {
        expect(saved.weekPlans[18][0].exercises[0].name).toBe("Incline Dumbbell Press");
        expect(saved.weekPlans[18][0].exercises[0].sets).toBe(4);

        expect(saved.weekPlans[19][0].exercises[0].name).toBe("Incline Smith Machine Press");
        expect(saved.weekPlans[19][0].exercises[0].sets).toBe(3);
        expect(saved.weekPlans[19][1].exercises[0].sets).toBe(4); // WPU

        expect(saved.weekPlans[20][1].exercises[0].sets).toBe(3); // WPU
    });

    it("bieżący tydzień ma nowy plan (Face Pull), a stare tygodnie nie", () => {
        const names = (week) => week.flatMap((d) => d.exercises.map((ex) => ex.name));
        expect(names(saved.weekPlans[26])).toContain("Face Pull");
        expect(names(saved.weekPlans[25])).not.toContain("Face Pull");
    });

    it("nigdzie nie ma więcej ukończonych serii niż plan", () => {
        for (let w = 0; w < 26; w++) {
            saved.weekPlans[w].forEach((day) => {
                day.exercises.forEach((ex, ei) => {
                    const sets = saved.weeks[w][`d${day.id}_e${ei}`] || [];
                    const done = sets.filter((s) => s && s.done).length;
                    expect(done).toBeLessThanOrEqual(ex.sets);
                });
            });
        }
    });

    it("statystyki rozdzielają Incline Dumbbell Press i Smith", () => {
        const S = window.StatsModule;
        const key = (dayId, ei) => `d${dayId}_e${ei}`;

        const db = S.getExerciseHistory(saved, saved.weekPlans[26], "Incline Dumbbell Press", key);
        const smith = S.getExerciseHistory(
            saved,
            saved.weekPlans[26],
            "Incline Smith Machine Press",
            key
        );

        expect(db.length).toBe(1);
        expect(db[0].bestSet.kg).toBe(24);
        expect(smith.length).toBe(2);
        expect(smith[0].bestSet.kg).toBe(40);
    });
});
