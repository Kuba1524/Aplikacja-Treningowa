// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from "vitest";

const KUBA_ID = "user_rt8zi8glg_1787597563228";

const set = (kg, reps, count) => Array.from({ length: count }, () => ({ kg, reps, done: true }));

// Zamrożony plan v3 z tygodnia 8–14.11.2026. Migracja v5_now musi rozpoznać
// ten układ po nazwach ćwiczeń i przepiąć zapisane serie na nowe indeksy.
const kubaV3Snapshot = () => [
    {
        id: 0,
        weekday: 0,
        name: "Niedziela",
        label: "PUSH",
        icon: "🔥",
        color: "#ff3b30",
        exercises: [],
    },
    {
        id: 1,
        weekday: 1,
        name: "Poniedziałek",
        label: "PULL",
        icon: "💪",
        color: "#00b4d8",
        exercises: [
            "Weighted Pull Ups",
            "Single-Arm Cable Row",
            "Reverse Peck Deck",
            "Face Pull",
            "EZ-bar Reverse Curl",
            "Barbell Wrist Curl",
        ].map((name) => ({ name, sets: 3, reps: "8-12", tag: "BACK" })),
    },
    {
        id: 2,
        weekday: 3,
        name: "Środa",
        label: "LEGS + ARMS",
        icon: "🦵",
        color: "#2ec4b6",
        exercises: [
            "RDL (sztanga)",
            "Hack Squat / Leg Press",
            "Leg Extension",
            "Seated Leg Curl",
            "Incline Dumbbell Curl [SS]",
            "Single-Arm Cable Pushdown [SS]",
            "Incline Hammer Curl [SS]",
            "Calf Raises [SS]",
        ].map((name) => ({ name, sets: 3, reps: "8-12", tag: "LEGS" })),
    },
    {
        id: 3,
        weekday: 5,
        name: "Piątek",
        label: "UPPER",
        icon: "⚡",
        color: "#9d4edd",
        exercises: [],
    },
];

const setupDom = () => {
    document.body.innerHTML = `
        <div id="screen-home"></div>
        <div id="screen-plan"></div>
        <div id="screen-fullplan"></div>
        <div id="screen-stats"></div>
        <div id="screen-workout"></div>
        <div id="screen-library"></div>
        <div id="screen-manage"></div>
        <div id="bottom-nav"></div>
        <div id="rest-timer-bar"></div>
    `;
};

const setupStorage = () => {
    // Start w niedzielę 10.05.2026 — od tygodnia 26 (8.11.2026) obowiązuje
    // plan v5. Tydzień 26 ma jeszcze zapisany plan v3, więc migracja musi
    // przepiąć jego dane, a tydzień 27 (15.11.2026) jest już pusty i dostaje v5.
    const startSunday = new Date(2026, 4, 10, 0, 0, 0, 0).getTime();
    const weeks = Array.from({ length: 28 }, () => ({}));

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

    // Tydzień 27 (8.11.2026): plan v5 od bieżącego tygodnia. Dane PULL/LEGS
    // są jeszcze w starym układzie v3, więc migracja musi je przepiąć.
    weeks[26] = {
        d1_e0: set(10, 6, 3),
        d1_e3: set(15, 12, 3),
        d1_e5: set(30, 12, 3),
        d1_e5_note: "wrist curl",
        d2_e6: set(14, 9, 3),
        d2_e6_note: "stary hammer curl",
        d2_e7: set(65, 9, 4),
    };

    // Tydzień 28 (15.11.2026): plan v5 — pusty, bo dopiero się zaczyna.
    weeks[27] = {};

    const fixture = {
        currentWeekIndex: 26,
        startSunday,
        weeks,
        bodyWeight: [],
        migrations: {},
        customPlan: {},
        customPlanMeta: {},
        weekSchedule: {},
        weekPlans: { 26: kubaV3Snapshot() },
    };

    localStorage.setItem("selected_profile_id", KUBA_ID);
    localStorage.setItem("user_id", KUBA_ID);
    globalThis.__kubaFixture = fixture;

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

    it("od 8.11 obowiązuje plan v5 i przepina dane bieżącego tygodnia", () => {
        const names = (week) => week.flatMap((d) => d.exercises.map((ex) => ex.name));
        const current = names(saved.weekPlans[26]);
        const next = names(saved.weekPlans[27]);

        expect(current).toContain("Incline Hammer Curl");
        expect(current).toContain("Hyperextension [SS]");
        expect(current).not.toContain("Incline Hammer Curl [SS]");
        expect(next).toContain("Incline Hammer Curl");
        expect(next).toContain("Hyperextension [SS]");
        expect(next).not.toContain("Incline Hammer Curl [SS]");

        expect(saved.weekPlans[26][1].exercises[4].name).toBe("EZ-bar Reverse Curl");
        expect(saved.weekPlans[26][1].exercises[5].name).toBe("Incline Hammer Curl");
        expect(saved.weekPlans[26][1].exercises[5].reps).toBe("8-12");
        expect(saved.weekPlans[26][1].exercises[6].name).toBe("Barbell Wrist Curl");
        expect(saved.weekPlans[26][2].exercises[6].name).toBe("Hyperextension [SS]");
        expect(saved.weekPlans[27][1].exercises[4].name).toBe("EZ-bar Reverse Curl");
        expect(saved.weekPlans[27][1].exercises[5].name).toBe("Incline Hammer Curl");
        expect(saved.weekPlans[27][1].exercises[5].reps).toBe("8-12");
        expect(saved.weekPlans[27][2].exercises[6].name).toBe("Hyperextension [SS]");

        // Barbell Wrist Curl przenosi się z PULL e5 na e6, a nowy Incline
        // Hammer Curl na e5 nie dziedziczy po nim danych.
        expect(saved.weeks[26].d1_e5).toBeUndefined();
        expect(saved.weeks[26].d1_e5_note).toBeUndefined();
        expect(saved.weeks[26].d1_e6[0].kg).toBe(30);
        expect(saved.weeks[26].d1_e6).toHaveLength(3);
        // Usunięty Incline Hammer Curl [SS] nie zostawia danych pod
        // Hyperextension [SS], ale Calf Raises zostaje na swoim miejscu.
        expect(saved.weeks[26].d2_e6).toBeUndefined();
        expect(saved.weeks[26].d2_e6_note).toBeUndefined();
        expect(saved.weeks[26].d2_e7[0].kg).toBe(65);

        const sets = (plan) =>
            plan.reduce((sum, day) => sum + day.exercises.reduce((s, ex) => s + ex.sets, 0), 0);
        expect(sets(saved.weekPlans[26])).toBe(84);
        expect(sets(saved.weekPlans[27])).toBe(84);
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

    it("Zobacz plan otwiera osobną podstronę z pełną listą ćwiczeń", () => {
        window.setWeek(0);
        window.openFullPlan();

        const full = document.getElementById("screen-fullplan");
        const plan = document.getElementById("screen-plan");

        expect(full.classList.contains("hidden")).toBe(false);
        expect(plan.classList.contains("hidden")).toBe(true);
        expect(full.innerHTML).toContain("Incline Dumbbell Press");
        expect(full.innerHTML).toContain("Single-Arm Dumbbell Row");
        expect(full.innerHTML).toContain("Seated Cable Row");
        expect(full.innerHTML).not.toContain("Face Pull");
    });

    it("v79 naprawia stare tygodnie mimo ustawionej flagi z v78", async () => {
        const fixture = globalThis.__kubaFixture;
        const newPlan = JSON.parse(JSON.stringify(fixture.weekPlans[26]));

        for (let i = 0; i < 26; i++) {
            fixture.weekPlans[i] = JSON.parse(JSON.stringify(newPlan));
        }
        fixture.migrations = {
            kuba_legs_v2: true,
            kuba_plan_v3: true,
            kuba_plan_v3_repair: true,
            kuba_plan_history_v1: true,
            reps_sets_v3: true,
            week_plans_v1: true,
        };

        await window.chooseProfile(KUBA_ID);
        await new Promise((resolve) => setTimeout(resolve, 100));
        saved = readSavedState();

        expect(saved.migrations.kuba_plan_history_v2).toBe(true);
        expect(saved.weekPlans[0][0].exercises[0].name).toBe("Incline Dumbbell Press");
        expect(saved.weekPlans[0][0].exercises[0].sets).toBe(4);
        expect(saved.weekPlans[14][1].exercises[1].sets).toBe(3);
        expect(saved.weekPlans[19][0].exercises[0].name).toBe("Incline Smith Machine Press");
    });

    it("v5_now przenosi plan na bieżący tydzień i przepina dane v3 oraz v4", async () => {
        const fixture = globalThis.__kubaFixture;
        const v5Plan = JSON.parse(JSON.stringify(saved.weekPlans[27]));
        const v5Pull = v5Plan[1].exercises;
        const oldV4Plan = JSON.parse(JSON.stringify(v5Plan));

        // v4 PULL: Incline Hammer Curl był przed EZ-bar Reverse Curl.
        oldV4Plan[1] = {
            ...v5Plan[1],
            exercises: [v5Pull[0], v5Pull[1], v5Pull[2], v5Pull[3], v5Pull[5], v5Pull[4], v5Pull[6]],
        };

        fixture.customPlan = {
            1: oldV4Plan[1].exercises,
            2: oldV4Plan[2].exercises,
        };
        fixture.weekPlans = {
            26: kubaV3Snapshot(),
            27: oldV4Plan,
        };
        fixture.weeks[26] = {
            d1_e4: set(25, 12, 3),
            d1_e5: set(30, 12, 3),
            d2_e6: set(14, 9, 3),
            d2_e7: set(65, 9, 4),
        };
        fixture.weeks[27] = {
            d1_e4: set(12, 10, 3),
            d1_e5: set(30, 12, 3),
            d1_e6: set(20, 15, 3),
        };
        fixture.migrations = {
            kuba_legs_v2: true,
            kuba_plan_v3: true,
            kuba_plan_v3_repair: true,
            kuba_plan_v4: true,
            kuba_plan_history_v1: true,
            kuba_plan_history_v2: true,
            reps_sets_v3: true,
            week_plans_v1: true,
        };

        await window.chooseProfile(KUBA_ID);
        await new Promise((resolve) => setTimeout(resolve, 500));
        saved = readSavedState();

        expect(saved.migrations.kuba_plan_v5).toBe(true);
        expect(saved.migrations.kuba_plan_v5_now).toBe(true);
        expect(saved.customPlan[1][4].name).toBe("EZ-bar Reverse Curl");
        expect(saved.customPlan[1][5].name).toBe("Incline Hammer Curl");
        expect(saved.customPlan[1][5].reps).toBe("8-12");
        expect(saved.customPlan[2].map((ex) => ex.name)).toContain("Hyperextension [SS]");
        expect(saved.customPlan[2].map((ex) => ex.name)).not.toContain("Incline Hammer Curl [SS]");

        expect(saved.weekPlans[26][1].exercises[5].name).toBe("Incline Hammer Curl");
        expect(saved.weekPlans[26][2].exercises[6].name).toBe("Hyperextension [SS]");
        expect(saved.weekPlans[27][1].exercises[4].name).toBe("EZ-bar Reverse Curl");
        expect(saved.weekPlans[27][1].exercises[5].name).toBe("Incline Hammer Curl");
        expect(saved.weekPlans[27][2].exercises[6].name).toBe("Hyperextension [SS]");

        // v3 -> v5: Wrist Curl z e5 trafia na e6, a stary Incline Hammer [SS]
        // z LEGS nie dziedziczy danych po Hyperextension.
        expect(saved.weeks[26].d1_e4[0].kg).toBe(25);
        expect(saved.weeks[26].d1_e5).toBeUndefined();
        expect(saved.weeks[26].d1_e6[0].kg).toBe(30);
        expect(saved.weeks[26].d2_e6).toBeUndefined();
        expect(saved.weeks[26].d2_e7[0].kg).toBe(65);

        // v4 -> v5: EZ-bar i Incline Hammer zamieniają się miejscami.
        expect(saved.weeks[27].d1_e4[0].kg).toBe(30);
        expect(saved.weeks[27].d1_e5[0].kg).toBe(12);
        expect(saved.weeks[27].d1_e6[0].kg).toBe(20);
        expect(saved.weekPlans[27][1].exercises[5].reps).toBe("8-12");
    });
});
