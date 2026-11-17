// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from "vitest";

const BARTEK_ID = "user_u2x8glbug_1787607478584";

const set = (kg, reps, count) => Array.from({ length: count }, () => ({ kg, reps, done: true }));
const ex = (name, sets = 3, reps = "8-12", tag = "CORE") => ({ name, sets, reps, tag });

const oldPlan = () => [
    {
        id: 0,
        weekday: 0,
        name: "Niedziela",
        label: "PUSH",
        icon: "🔥",
        color: "#ff9500",
        exercises: [
            ex("Smith", 3, "6-10", "CHEST"),
            ex("Seated Dumbbell OHP", 3, "6-10", "SHOULDER"),
            ex("Machine Chest Press", 3, "8-10", "CHEST"),
            ex("Chest Dips", 2, "6-10", "CHEST"),
            ex("Dumbbell Lateral Raises", 3, "8-12", "SHOULDER"),
            ex("Ab Wheel", 3, "8-12", "CORE"),
            ex("Decline Oblique Crunches", 3, "8-12", "CORE"),
            ex("Nowe ćwiczenie", 3, "8-12", "CORE"),
        ],
    },
    {
        id: 1,
        weekday: 1,
        name: "Poniedziałek",
        label: "PULL",
        icon: "💪",
        color: "#00b4d8",
        exercises: [
            ex("Weighted Pull Ups", 3, "6-8", "BACK"),
            ex("Single-Arm Dumbbell Row", 3, "6-10", "BACK"),
            ex("Seated Cable Row", 3, "6-10", "BACK"),
            ex("Reverse Peck Deck", 2, "8-12", "REAR"),
            ex("Dumbbell Shrugs", 3, "8-12", "TRAPS"),
            ex("Ez-bar Reverse Curl", 3, "8-12", "FOREARMS"),
            ex("Barbell Wrist Curl", 3, "10-15", "FOREARMS"),
        ],
    },
    {
        id: 2,
        weekday: 3,
        name: "Środa",
        label: "LEGS + ARMS",
        icon: "🦵",
        color: "#2ec4b6",
        exercises: [
            ex("Hip Thrust", 4, "6-10", "GLUTES"),
            ex("Hack Squat / Leg Press", 3, "6-10", "QUADS"),
            ex("Powell raise", 3, "6-10", "SHOULDER"),
            ex("Seated Leg Curl", 3, "8-12", "HAM"),
            ex("Supination Curl [SS]", 3, "8-12", "BICEPS"),
            ex("Single-Arm Cable Pushdown [SS]", 3, "8-12", "TRICEPS"),
            ex("Cross-Body Hammer Curl [SS]", 3, "8-10", "BICEPS"),
            ex("Calf Raises [SS]", 4, "10-15", "CALVES"),
        ],
    },
    {
        id: 3,
        weekday: 5,
        name: "Piątek",
        label: "UPPER",
        icon: "⚡",
        color: "#9d4edd",
        exercises: [
            ex("Bench Press", 3, "5-8", "CHEST"),
            ex("Cable Flyes (Low to High)", 3, "8-12", "CHEST"),
            ex("Single-Arm Lat Pulldown", 3, "6-10", "BACK"),
            ex("Cable Lateral Raise", 3, "8-12", "SHOULDER"),
            ex("EZ-bar Preacher Curl", 3, "8-12", "BICEPS"),
            ex("Incline Skull Crushers", 3, "8-10", "TRICEPS"),
            ex("Cable Crunch", 3, "8-12", "CORE"),
        ],
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
    const startSunday = new Date(2026, 4, 10, 0, 0, 0, 0).getTime();
    const weeks = Array.from({ length: 29 }, () => ({}));

    // Poprzedni tydzień (8.11) zostaje na starym planie Bartka.
    weeks[26] = {
        d0_e0: set(60, 8, 3),
        d1_e0: set(20, 5, 3),
        d1_e5: set(30, 13, 3),
        d3_e1: set(7.5, 12, 3),
        d3_e5: set(16, 9, 3),
    };

    // Bieżący tydzień (15.11) ma już wpisane serie w starym układzie.
    weeks[27] = {
        d0_e0: set(65, 8, 3),
        d0_e0_note: "smith note",
        d0_e4: set(10, 11, 3),
        d0_e5: set(0, 12, 3),
        d0_e6: set(7.5, 12, 3),
        d0_e7: set(0, 0, 3),
        d1_e2: set(66, 7, 3),
        d1_e3: set(68, 9, 2),
        d1_e5: set(30, 12, 3),
        d1_e5_note: "ez note",
        d1_e6: set(7.25, 13, 3),
        d2_e1: set(80, 10, 3),
        d2_e3: set(72, 13, 3),
        d2_e5: set(13, 13, 3),
        d2_e7: set(70, 11, 4),
        d3_e0: set(90, 7, 3),
        d3_e2: set(30, 9, 3),
    };

    // Istniejący przyszły tydzień też ma dostać nowy plan.
    weeks[28] = {
        d0_e0: set(70, 6, 3),
        d1_e5: set(32, 10, 3),
    };

    const fixture = {
        currentWeekIndex: 27,
        startSunday,
        weeks,
        bodyWeight: [],
        migrations: {},
        customPlan: oldPlan().reduce((acc, day) => {
            acc[day.id] = day.exercises.map((exercise) => ({ ...exercise, rest: 105 }));
            return acc;
        }, {}),
        customPlanMeta: {
            0: { color: "#ff9500", icon: "🔥" },
        },
        weekSchedule: {},
        // Brak snapshotu 25 sprawdza, że uzupełniamy go starym planem.
        weekPlans: {
            26: oldPlan(),
            27: oldPlan(),
            28: oldPlan(),
        },
    };

    localStorage.setItem("selected_profile_id", BARTEK_ID);
    localStorage.setItem("user_id", BARTEK_ID);
    globalThis.__bartekFixture = fixture;

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
    const key = Object.keys(localStorage).find((k) => k.includes(BARTEK_ID));
    return JSON.parse(localStorage.getItem(key));
};

const names = (plan) => (plan || []).flatMap((day) => (day.exercises || []).map((exercise) => exercise.name));

describe("Bartek dostaje ćwiczenia Kuby od bieżącego tygodnia", () => {
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

        await new Promise((resolve) => setTimeout(resolve, 800));
        saved = readSavedState();
    });

    it("bieżący i przyszły tydzień mają plan Kuby", () => {
        const current = names(saved.weekPlans[27]);
        const future = names(saved.weekPlans[28]);

        for (const plan of [current, future]) {
            expect(plan).toContain("Incline Smith Machine Press");
            expect(plan).toContain("Dragon Flag (negatives)");
            expect(plan).toContain("Single-Arm Cable Row");
            expect(plan).toContain("Face Pull");
            expect(plan).toContain("Incline Hammer Curl");
            expect(plan).toContain("RDL");
            expect(plan).toContain("Leg Extension");
            expect(plan).toContain("Hyperextension [SS]");
            expect(plan).toContain("Lat Pulldown");
            expect(plan).not.toContain("Nowe ćwiczenie");
            expect(plan).not.toContain("Powell raise");
            expect(plan).not.toContain("Hip Thrust");
            expect(plan).not.toContain("Dumbbell Shrugs");
            expect(plan).not.toContain("Single-Arm Lat Pulldown");
        }
    });

    it("poprzednie tygodnie zostają na starym planie Bartka", () => {
        expect(names(saved.weekPlans[26])).toContain("Smith");
        expect(names(saved.weekPlans[26])).toContain("Powell raise");
        expect(names(saved.weekPlans[26])).not.toContain("Face Pull");
        expect(saved.weekPlans[26][0].exercises[0].name).toBe("Smith");
        expect(saved.weeks[26].d0_e0[0].kg).toBe(60);

        // Brakujący snapshot starego tygodnia dostał stary plan, nie plan Kuby.
        expect(names(saved.weekPlans[25])).toContain("Powell raise");
        expect(names(saved.weekPlans[25])).not.toContain("Face Pull");
    });

    it("przepina serie i notatki po nazwie, a usunięte ćwiczenia nie zostawiają danych", () => {
        expect(saved.weeks[27].d0_e0[0].kg).toBe(65);
        expect(saved.weeks[27].d0_e0_note).toBe("smith note");
        expect(saved.weeks[27].d0_e4[0].kg).toBe(10);
        expect(saved.weeks[27].d0_e5[0].reps).toBe(12);

        // Decline Oblique Crunches i Nowe ćwiczenie nie występują w planie Kuby.
        expect(saved.weeks[27].d0_e6).toBeUndefined();
        expect(saved.weeks[27].d0_e7).toBeUndefined();

        // EZ-bar przechodzi z e5 na e4, Wrist Curl zostaje na e6.
        expect(saved.weeks[27].d1_e4[0].kg).toBe(30);
        expect(saved.weeks[27].d1_e4_note).toBe("ez note");
        expect(saved.weeks[27].d1_e5).toBeUndefined();
        expect(saved.weeks[27].d1_e6[0].kg).toBe(7.25);

        // Reverse Peck Deck przechodzi z e3 na e2.
        expect(saved.weeks[27].d1_e2[0].kg).toBe(68);
        expect(saved.weeks[27].d1_e3).toBeUndefined();

        // Ćwiczenia, które zostały w planie, zachowują dane.
        expect(saved.weeks[27].d2_e1[0].kg).toBe(80);
        expect(saved.weeks[27].d2_e3[0].kg).toBe(72);
        expect(saved.weeks[27].d2_e5[0].kg).toBe(13);
        expect(saved.weeks[27].d2_e7[0].kg).toBe(70);
        expect(saved.weeks[27].d3_e0[0].kg).toBe(90);

        // Usunięte Hip Thrust i Single-Arm Lat Pulldown nie trafiają pod nowe sloty.
        expect(saved.weeks[27].d2_e0).toBeUndefined();
        expect(saved.weeks[27].d3_e2).toBeUndefined();

        // Przyszły tydzień również ma przepięte dane.
        expect(saved.weeks[28].d0_e0[0].kg).toBe(70);
        expect(saved.weeks[28].d1_e4[0].kg).toBe(32);
    });

    it("uzupełnia brakujące ciężary i powtórzenia z historii Bartka", () => {
        expect(saved.migrations.bartek_week_seed_v1).toBe(true);

        // Puste pola dostały wartości z ostatniego zapisanego treningu.
        expect(saved.weeks[27].d1_e0[0]).toMatchObject({ kg: 20, reps: 5, done: false });
        expect(saved.weeks[27].d3_e1[0]).toMatchObject({ kg: 7.5, reps: 12, done: false });
        expect(saved.weeks[27].d3_e5[0]).toMatchObject({ kg: 16, reps: 9, done: false });

        // Istniejący wpis z bieżącego tygodnia nie został nadpisany historią.
        expect(saved.weeks[27].d1_e4[0]).toMatchObject({ kg: 30, reps: 12, done: true });
    });

    it("czyści stare edycje planu, żeby nie przesłaniały planu Kuby", () => {
        expect(saved.migrations.bartek_kuba_plan_v1).toBe(true);
        expect(saved.customPlan).toEqual({});
        expect(saved.customPlanMeta[0].color).toBe("#ff9500");
    });
});
