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
        color: "#ff3b30",
        exercises: [
            { name: "Bench Press", sets: 3, reps: "5-8", tag: "CHEST" },
            { name: "Cable Crunch", sets: 2, reps: "8-12", tag: "CORE" },
            { name: "Chest Dips", sets: 3, reps: "6-10", tag: "CHEST" }
        ]
    }
];

const makeState = () => {
    const weeks = [0, 1, 2, 3, 4].map((i) => ({
        d0_e0: [{ kg: 55, reps: 8, done: true }],
        d0_e1: [{ kg: 10, reps: 10 + i, done: true }],
        d0_e2: [{ kg: 0, reps: 9, done: true }]
    }));
    const start = Date.now() - 30 * 86400000;
    const bodyWeight = [0, 1, 2, 3, 4, 5, 6, 7].map(
        (i) => ({ ts: start + i * 86400000, kg: 80 + (i % 3) * 0.2 })
    );
    return {
        currentWeekIndex: weeks.length - 1,
        startSunday: start,
        weeks,
        bodyWeight
    };
};

const makeCtx = (state) => ({
    state,
    DAYS,
    currentWeekIndex: state.currentWeekIndex,
    statsMaxCols: 12,
    getExerciseKey: (dayId, ei) => `d${dayId}_e${ei}`,
    getDayTimestampKey: () => "day_0_ts",
    getWeekCompletion: () => ({ total: 0, done: 0, pct: 0 }),
    getDayProgress: () => ({ total: 0, done: 0, pct: 0 })
});

describe("renderStats", () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="screen-stats"></div>';
    });

    it("renders the stagnation section with the stale exercise", () => {
        window.Views.renderStats(makeCtx(makeState()));
        const html = document.getElementById("screen-stats").innerHTML;
        expect(html).toContain("Wymaga uwagi");
        expect(html).toContain("⚠");
        expect(html).toContain("Bench Press");
        expect(html).not.toContain("Cable Crunch");
        expect(html).toContain("bez zmian od 5 sesji");
        expect(html).toContain("55 kg");
    });

    it("shows bodyweight exercises with reps and 'masa własna' instead of 0 kg", () => {
        window.Views.renderStats(makeCtx(makeState()));
        const html = document.getElementById("screen-stats").innerHTML;
        expect(html).toContain("Chest Dips");
        expect(html).toContain("masa własna");
        expect(html).toContain("9 powt.");
        expect(html).not.toMatch(/stale-kg">\s*0 kg/);
    });

    it("limits the stale list to 5 and offers 'pokaż wszystkie'", () => {
        const bwEx = [
            "Chest Dips", "Decline Oblique Crunches", "Ab Wheel",
            "Plank", "Crunch", "Leg Raises", "Mountain Climbers"
        ];
        const DAYS7 = [
            {
                id: 0,
                weekday: 0,
                name: "Niedziela",
                label: "CORE+",
                icon: "🔥",
                color: "#ff3b30",
                exercises: bwEx.map((name, ei) => ({ name, sets: 3, reps: "8-12", tag: "CORE" }))
            }
        ];
        const weeks = [0, 1, 2, 3, 4].map(() => {
            const empty = {};
            bwEx.forEach((_, ei) => {
                empty[`d0_e${ei}`] = [{ kg: 0, reps: 10, done: true }];
            });
            return empty;
        });
        const state = {
            currentWeekIndex: weeks.length - 1,
            startSunday: Date.now() - 30 * 86400000,
            weeks,
            bodyWeight: []
        };
        const ctx = {
            ...makeCtx(state),
            DAYS: DAYS7
        };
        window.Views.renderStats(ctx);
        const html = document.getElementById("screen-stats").innerHTML;
        const rows = (html.match(/class="stale-row"/g) || []).length;
        expect(rows).toBe(7);
        expect(html).toContain("Pokaż wszystkie (7)");
        expect(html).toContain("Mountain Climbers");
    });

    it("renders weekly volume per muscle group sorted descending", () => {
        window.Views.renderStats(makeCtx(makeState()));
        const html = document.getElementById("screen-stats").innerHTML;
        expect(html).toContain("Objętość tygodniowa wg partii");
        expect(html).toContain('class="tag-badge tag-CHEST"');
        expect(html).toContain('class="tag-badge tag-CORE"');
        const chest = html.indexOf("tag-CHEST");
        const core = html.indexOf("tag-CORE");
        expect(chest).toBeGreaterThan(-1);
        expect(core).toBeGreaterThan(chest);
    });

    it("replaces TOP KG with Sesji + Ostatni PR in PR cards", () => {
        window.Views.renderStats(makeCtx(makeState()));
        const html = document.getElementById("screen-stats").innerHTML;
        expect(html).toContain("Sesji");
        expect(html).toContain("Ostatni PR");
        expect(html).not.toMatch(/>Top kg</);
        expect(html).not.toMatch(/>Top kg:/);
    });

    it("draws the rolling-average legend on the weight chart", () => {
        window.Views.renderStats(makeCtx(makeState()));
        const html = document.getElementById("screen-stats").innerHTML;
        expect(html).toContain("bw-legend");
        expect(html).toContain("Pomiar dzienny");
        expect(html).toContain("Średnia 7-dniowa");
        expect(html).toContain('class="bw-line-avg"');
        expect(html).toContain('class="bw-line-raw"');
    });
});