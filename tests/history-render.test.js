// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import "../js/utils.js";
import "../js/stats.js";
import "../js/views.js";

const getExerciseKey = (dayId, ei) => `d${dayId}_e${ei}`;
const getDayTimestampKey = (dayId) => `day_${dayId}_ts`;
const getNoteKey = (dayId, ei) => `d${dayId}_e${ei}_note`;
const exerciseNameKey = (name) => {
    const key = String(name || "").trim().toLowerCase();
    if (key === "smith") return "incline smith machine press";
    if (key === "rdl (sztanga)") return "rdl";
    return key;
};

const PLAN = [
    {
        id: 0,
        weekday: 0,
        name: "Niedziela",
        label: "PUSH",
        icon: "🔥",
        exercises: [
            { name: "Bench Press", sets: 3, reps: "5-8", tag: "CHEST" },
            { name: "Cable Crunch", sets: 2, reps: "8-12", tag: "CORE" }
        ]
    },
    {
        id: 1,
        weekday: 2,
        name: "Wtorek",
        label: "PULL",
        icon: "💪",
        exercises: [
            { name: "Weighted Pull Ups", sets: 3, reps: "6-8", tag: "BACK" },
            { name: "RDL", sets: 3, reps: "8-10", tag: "HAM" }
        ]
    }
];

const makeState = () => {
    const weeks = [
        {
            day_0_ts: new Date(2026, 10, 8, 18, 0).getTime(),
            day_0_sessionStart: 1000000,
            day_0_sessionEnd: 4600000,
            d0_e0: [
                { kg: 50, reps: 8, done: true },
                { kg: 50, reps: 8, done: true },
                { kg: 50, reps: 7, done: true }
            ],
            d0_e0_note: "Spokojne tempo",
            d0_e1: [
                { kg: 10, reps: 12, done: true },
                { kg: 10, reps: 12, done: true }
            ]
        },
        {
            day_0_ts: new Date(2026, 10, 15, 18, 0).getTime(),
            d0_e0: [
                { kg: 55, reps: 8, done: true },
                { kg: 55, reps: 7, done: true },
                { kg: 55, reps: 6, done: true }
            ],
            d0_e1: [
                { kg: 10, reps: 12, done: true },
                { kg: 10, reps: 12, done: true }
            ]
        },
        {
            day_1_ts: new Date(2026, 10, 17, 19, 0).getTime(),
            d1_e0: [
                { kg: 0, reps: 9, done: true },
                { kg: 0, reps: 0, done: false },
                { kg: 0, reps: 0, done: false }
            ],
            d1_e1: [
                { kg: 80, reps: 8, done: true },
                { kg: 80, reps: 8, done: true },
                { kg: 80, reps: 8, done: true }
            ]
        }
    ];

    return {
        currentWeekIndex: 2,
        startSunday: new Date(2026, 10, 8).getTime(),
        weeks,
        weekPlans: {
            0: PLAN,
            1: PLAN,
            2: PLAN
        },
        bodyWeight: []
    };
};

const makeCtx = (state) => ({
    state,
    DAYS: PLAN,
    getWeekPlan: (weekIndex) => state.weekPlans[weekIndex] || PLAN,
    getExerciseKey,
    getDayTimestampKey,
    getNoteKey,
    exerciseNameKey
});

const getHistory = (state) =>
    window.StatsModule.getWorkoutHistory(
        state,
        PLAN,
        (weekIndex) => state.weekPlans[weekIndex] || PLAN,
        getExerciseKey,
        getDayTimestampKey,
        getNoteKey,
        exerciseNameKey
    );

describe("getWorkoutHistory", () => {
    it("builds sessions from stored sets, snapshots and session times", () => {
        const state = makeState();
        const sessions = getHistory(state);

        expect(sessions).toHaveLength(3);
        expect(sessions[0].dayId).toBe(1);
        expect(sessions[2].dayId).toBe(0);
        expect(sessions[2].durationMs).toBe(3600000);
        expect(sessions[2].exercises[0].note).toBe("Spokojne tempo");
        expect(sessions[2].doneSets).toBe(5);
        expect(sessions[2].totalSets).toBe(5);
    });

    it("detects PRs only when a result beats previous weeks", () => {
        const sessions = getHistory(makeState());
        const week0 = sessions.find((s) => s.weekIndex === 0);
        const week1 = sessions.find((s) => s.weekIndex === 1);

        expect(week0.prs).toHaveLength(0);
        expect(week1.prs).toHaveLength(1);
        expect(week1.prs[0].name).toBe("Bench Press");
        expect(week1.prs[0].current).toEqual({ kg: 55, reps: 8 });
        expect(week1.prs[0].gain).toBe("+5 kg");
    });

    it("keeps partial sessions and bodyweight sets", () => {
        const latest = getHistory(makeState())[0];

        expect(latest.doneSets).toBeLessThan(latest.totalSets);
        expect(latest.exercises[0].sets).toEqual([{ kg: 0, reps: 9 }]);
    });

    it("marks the current week's unfinished session as active", () => {
        const state = makeState();
        state.weeks[2].day_1_sessionStart = Date.now() - 120000;

        const latest = getHistory(state)[0];

        expect(latest.isActive).toBe(true);
        expect(latest.durationMs).toBeGreaterThan(0);
    });

    it("falls back to the week date when a session has no timestamp", () => {
        const state = makeState();
        delete state.weeks[0].day_0_ts;

        const week0 = getHistory(state).find((session) => session.weekIndex === 0);

        expect(week0.ts).toBe(state.startSunday);
    });
});

describe("renderHistory", () => {
    beforeEach(() => {
        document.body.innerHTML = '<section id="screen-history"></section>';
        window.Views.setHistoryFilter("all");
    });

    it("renders a simple exercise picker and expandable session cards", () => {
        const state = makeState();
        window.Views.renderHistory(makeCtx(state));

        const screen = document.getElementById("screen-history");
        expect(screen.textContent).toContain("Historia");
        expect(screen.textContent).toContain("Bench Press");
        expect(screen.textContent).toContain("50 kg × 8");
        expect(screen.textContent).toContain("Spokojne tempo");
        expect(screen.textContent).not.toContain("Częściowy");
        expect(screen.textContent).not.toContain("1 390 kg");
        expect(screen.textContent).not.toContain("1390 kg");
        expect(screen.querySelector(".history-summary")).toBeNull();
        expect(screen.querySelectorAll("details.history-session")).toHaveLength(3);
        expect(screen.querySelectorAll("#history-exercise-select option")).toHaveLength(5);
    });

    it("filters sessions by exercise name and shows only that exercise", () => {
        const state = makeState();
        window.Views.setHistoryFilter("RDL");
        window.Views.renderHistory(makeCtx(state));

        const screen = document.getElementById("screen-history");
        const cards = Array.from(screen.querySelectorAll(".history-session"))
            .map((el) => el.textContent)
            .join(" ");

        expect(screen.querySelectorAll(".history-session")).toHaveLength(1);
        expect(cards).toContain("RDL");
        expect(cards).not.toContain("Bench Press");
        expect(cards).not.toContain("Weighted Pull Ups");
    });

    it("changes the filter from the exercise picker", () => {
        const state = makeState();
        window.Views.renderHistory(makeCtx(state));

        const screen = document.getElementById("screen-history");
        const select = screen.querySelector("#history-exercise-select");
        select.value = "RDL";
        select.dispatchEvent(new Event("change"));

        expect(screen.querySelectorAll(".history-session")).toHaveLength(1);
        expect(screen.querySelector(".history-session").textContent).toContain("RDL");
        expect(screen.querySelector(".history-session").textContent).not.toContain(
            "Weighted Pull Ups"
        );
    });

    it("merges exercise names that differ only by letter case", () => {
        const state = makeState();
        state.weekPlans[1] = PLAN.map((day) => ({
            ...day,
            exercises: day.exercises.map((exercise) => ({ ...exercise }))
        }));
        state.weekPlans[1][1].exercises[1].name = "rdl";
        state.weeks[1].d1_e1 = [
            { kg: 80, reps: 8, done: true },
            { kg: 80, reps: 8, done: true }
        ];
        window.Views.renderHistory(makeCtx(state));

        const screen = document.getElementById("screen-history");
        const select = screen.querySelector("#history-exercise-select");
        const rdlOptions = Array.from(select.options).filter((option) =>
            /^rdl/i.test(option.textContent)
        );

        expect(rdlOptions).toHaveLength(1);
        expect(rdlOptions[0].textContent).toContain("(2)");

        select.value = rdlOptions[0].value;
        select.dispatchEvent(new Event("change"));

        expect(screen.querySelectorAll(".history-session")).toHaveLength(2);
    });

    it("shows an empty state without sessions", () => {
        const state = makeState();
        state.weeks = [];
        window.Views.renderHistory(makeCtx(state));

        const screen = document.getElementById("screen-history");
        expect(screen.textContent).toContain("Brak zapisanych treningów");
        expect(screen.querySelectorAll(".history-session")).toHaveLength(0);
    });
});
