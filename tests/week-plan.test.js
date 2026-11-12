// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from "vitest";

const KUBA_ID = "user_rt8zi8glg_1787597563228";

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
    // Tydzień zmiany planu na v3 (niedziela 8.11.2026) jest tygodniem nr 2.
    // Tygodnie 0 i 1 muszą dalej pokazywać stary plan Kuby, a tydzień 3
    // (od 15.11.2026) dostaje nowy plan v4.
    const startSunday = new Date(2026, 9, 25, 0, 0, 0, 0).getTime();
    const fixture = {
        currentWeekIndex: 2,
        startSunday,
        weeks: [
            {
                // Stan po wadliwej migracji v74: dane PULL w nowym układzie
                // (e2 = Reverse Peck Deck, e4 = EZ-bar, e5 = Wrist Curl),
                // a stare sloty e3/e6 puste.
                d1_e0: [{ kg: 50, reps: 8, done: true }],
                d1_e1: [{ kg: 32, reps: 8, done: true }],
                d1_e2: [{ kg: 59.1, reps: 9, done: true }],
                d1_e4: [{ kg: 15, reps: 12, done: true }],
                d1_e5: [{ kg: 12.5, reps: 10, done: true }]
            },
            {
                d1_e0: [{ kg: 55, reps: 8, done: true }],
                d1_e2: [{ kg: 60, reps: 9, done: true }],
                d1_e4: [{ kg: 16, reps: 12, done: true }],
                d1_e5: [{ kg: 13, reps: 10, done: true }]
            },
            { d1_e0: [{ kg: 60, reps: 8, done: false }] },
            {}
        ],
        bodyWeight: [],
        migrations: {},
        customPlan: {},
        customPlanMeta: {},
        weekSchedule: {}
    };

    localStorage.setItem("selected_profile_id", KUBA_ID);
    localStorage.setItem("user_id", KUBA_ID);

    globalThis.firebase = {
        firestore: {
            FieldValue: {
                serverTimestamp: () => 1
            }
        }
    };
    globalThis.db = {
        collection: () => ({
            doc: () => ({
                get: async () => ({ exists: true, data: () => ({ state: fixture }) }),
                set: async () => ({})
            })
        })
    };
};

describe("plan per tydzień", () => {
    beforeAll(async () => {
        setupDom();
        setupStorage();

        await import("../js/utils.js");
        await import("../js/storage.js");
        await import("../js/stats.js");
        await import("../js/progression.js");
        await import("../js/views.js");
        await import("../js/app.js");

        await new Promise((resolve) => setTimeout(resolve, 100));
    });

    it("stare tygodnie pokazują plan, który obowiązywał wtedy", () => {
        window.navigateTo("plan");
        window.setWeek(0);
        const html = document.getElementById("screen-plan").innerHTML;
        expect(html).toContain("Single-Arm Dumbbell Row");
        expect(html).toContain("Seated Cable Row");
        expect(html).not.toContain("Face Pull");
    });

    it("bieżący tydzień (8.11) pokazuje plan v3", () => {
        window.navigateTo("plan");
        window.setWeek(2);
        const html = document.getElementById("screen-plan").innerHTML;
        expect(html).toContain("Single-Arm Cable Row");
        expect(html).toContain("Face Pull");
        expect(html).not.toContain("Seated Cable Row");
        expect(html).toContain("Incline Hammer Curl [SS]");
        expect(html).not.toContain("Hyperextension");
    });

    it("nowy tydzień (15.11) pokazuje plan v4, nie nadpisując v3", () => {
        window.navigateTo("plan");
        window.setWeek(3);
        const html = document.getElementById("screen-plan").innerHTML;
        expect(html).toContain("Incline Hammer Curl");
        expect(html).not.toContain("Incline Hammer Curl [SS]");
        expect(html).toContain("Hyperextension [SS]");

        window.setWeek(2);
        const previous = document.getElementById("screen-plan").innerHTML;
        expect(previous).toContain("Incline Hammer Curl [SS]");
        expect(previous).not.toContain("Hyperextension");
    });

    it("naprawa przywraca właściwe dane w starych tygodniach", async () => {
        await new Promise((resolve) => setTimeout(resolve, 450));

        const key = Object.keys(localStorage).find((k) => k.includes(KUBA_ID));
        expect(key).toBeTruthy();

        const saved = JSON.parse(localStorage.getItem(key));
        const week = saved.weeks[0];

        // Reverse Peck Deck (e3), EZ-bar (e5) i Wrist Curl (e6) wracają
        // na swoje stare pozycje.
        expect(week.d1_e3[0].kg).toBe(59.1);
        expect(week.d1_e5[0].kg).toBe(15);
        expect(week.d1_e6[0].kg).toBe(12.5);

        // Usunięte z planu ćwiczenia nie mają już danych.
        expect(week.d1_e2).toBeUndefined();
        expect(week.d1_e4).toBeUndefined();

        expect(saved.migrations.kuba_plan_v3_repair).toBe(true);
    });
});
