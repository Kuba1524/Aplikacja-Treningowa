// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from "vitest";

const KUBA_ID = "user_rt8zi8glg_1787597563228";

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
    // Tydzień zmiany planu (niedziela 8.11.2026) jest tygodniem nr 2.
    // Tygodnie 0 i 1 muszą dalej pokazywać stary plan Kuby.
    const startSunday = new Date(2026, 9, 25, 0, 0, 0, 0).getTime();
    const fixture = {
        currentWeekIndex: 2,
        startSunday,
        weeks: [
            { d1_e0: [{ kg: 50, reps: 8, done: true }] },
            { d1_e0: [{ kg: 55, reps: 8, done: true }] },
            { d1_e0: [{ kg: 60, reps: 8, done: false }] }
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

    it("bieżący tydzień pokazuje nowy plan", () => {
        window.navigateTo("plan");
        window.setWeek(2);
        const html = document.getElementById("screen-plan").innerHTML;
        expect(html).toContain("Single-Arm Cable Row");
        expect(html).toContain("Face Pull");
        expect(html).not.toContain("Seated Cable Row");
    });
});
