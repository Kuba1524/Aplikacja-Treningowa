// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from "vitest";

const KUBA_ID = "user_rt8zi8glg_1787597563228";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const exercise = (name) => ({ name, sets: 3, reps: "8-12", tag: "BACK" });

const planWith = (pullExercises) => [
    {
        id: 0,
        weekday: 0,
        name: "Niedziela",
        label: "PUSH",
        icon: "🔥",
        color: "#ff3b30",
        exercises: [exercise("Bench Press")],
    },
    {
        id: 1,
        weekday: 1,
        name: "Poniedziałek",
        label: "PULL",
        icon: "💪",
        color: "#00b4d8",
        exercises: pullExercises.map(exercise),
    },
    {
        id: 2,
        weekday: 3,
        name: "Środa",
        label: "LEGS + ARMS",
        icon: "🦵",
        color: "#2ec4b6",
        exercises: [exercise("RDL (sztanga)")],
    },
    {
        id: 3,
        weekday: 5,
        name: "Piątek",
        label: "UPPER",
        icon: "⚡",
        color: "#9d4edd",
        exercises: [exercise("Incline Skull Crushers")],
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
    const currentSunday = new Date();
    currentSunday.setDate(currentSunday.getDate() - currentSunday.getDay());
    currentSunday.setHours(0, 0, 0, 0);

    const startSunday = currentSunday.getTime() - WEEK_MS;
    const prevPlan = planWith(["Weighted Pull Ups", "Single-Arm Cable Row"]);
    const currentPlan = planWith(["Single-Arm Cable Row", "Weighted Pull Ups"]);

    const fixture = {
        currentWeekIndex: 1,
        startSunday,
        weeks: [
            {
                d0_e0: [{ kg: 80, reps: 8, done: true }],
                d1_e0: [{ kg: 10, reps: 6, done: true }],
                d1_e0_note: "WPU note",
                d1_e1: [{ kg: 30, reps: 8, done: true }],
                d1_e1_note: "Row note",
            },
            {},
        ],
        bodyWeight: [],
        migrations: {
            kuba_legs_v2: true,
            kuba_plan_v3: true,
            kuba_plan_v3_repair: true,
            kuba_plan_v4: true,
            kuba_plan_v5: true,
            kuba_plan_v5_now: true,
            kuba_plan_history_v1: true,
            kuba_plan_history_v2: true,
            reps_sets_v3: true,
            week_plans_v1: true,
        },
        customPlan: {},
        customPlanMeta: {},
        weekSchedule: {},
        weekPlans: {
            0: prevPlan,
            1: currentPlan,
        },
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

describe("uzupełnianie nowego tygodnia z poprzedniego treningu", () => {
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

    it("kopiuje serie po nazwie ćwiczenia, a nie po starym indeksie", () => {
        expect(saved.weeks[1].d1_e0[0].kg).toBe(30);
        expect(saved.weeks[1].d1_e1[0].kg).toBe(10);
        expect(saved.weeks[1].d1_e0[0].done).toBe(false);
        expect(saved.weeks[1].d1_e1[0].done).toBe(false);
    });

    it("przenosi notatki razem z ćwiczeniem", () => {
        expect(saved.weeks[1].d1_e0_note).toBe("Row note");
        expect(saved.weeks[1].d1_e1_note).toBe("WPU note");
    });

    it("dopełnia tylko brakujące ćwiczenia i nie rusza poprzedniego tygodnia", () => {
        expect(saved.weeks[1].d0_e0[0].kg).toBe(80);
        expect(saved.weeks[0].d1_e0[0].kg).toBe(10);
        expect(saved.weeks[0].d1_e1[0].kg).toBe(30);
        expect(saved.migrations.kuba_week_seed_v1).toBe(true);
    });
});
