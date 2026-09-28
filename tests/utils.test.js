// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import "../js/utils.js";

const U = () => window.Utils;

describe("formatNumberPL", () => {
    it("omits decimals for integers", () => {
        expect(U().formatNumberPL(78)).toBe("78");
    });

    it("uses a comma as the decimal separator", () => {
        expect(U().formatNumberPL(78.5)).toBe("78,5");
    });

    it("handles invalid input", () => {
        expect(U().formatNumberPL()).toBe("0");
    });
});

describe("escapeHtml", () => {
    it("escapes special characters", () => {
        expect(U().escapeHtml(`<b>"x" & 'y'</b>`)).toBe(
            "&lt;b&gt;&quot;x&quot; &amp; &#039;y&#039;&lt;/b&gt;"
        );
    });
    it("handles empty input", () => {
        expect(U().escapeHtml()).toBe("");
    });
});

describe("estimate1RM", () => {
    it("uses the Epley-style formula", () => {
        expect(U().estimate1RM(100, 10)).toBeCloseTo(133.33, 1);
    });
    it("returns 0 without valid input", () => {
        expect(U().estimate1RM(0, 8)).toBe(0);
    });
});

describe("getCurrentSunday", () => {
    it("returns a Sunday at midnight", () => {
        const sunday = U().getCurrentSunday();
        expect(sunday.getDay()).toBe(0);
        expect(sunday.getHours()).toBe(0);
        expect(sunday.getMinutes()).toBe(0);
    });
});

describe("defaultRestSeconds", () => {
    it("returns a long rest for heavy compound rep ranges", () => {
        expect(U().defaultRestSeconds("5-8")).toBe(165);
        expect(U().defaultRestSeconds("6-8")).toBe(165);
        expect(U().defaultRestSeconds("6-10")).toBe(165);
    });

    it("returns a moderate rest for mid rep ranges", () => {
        expect(U().defaultRestSeconds("8-10")).toBe(105);
        expect(U().defaultRestSeconds("8-12")).toBe(105);
    });

    it("returns a short rest for high-rep isolation work", () => {
        expect(U().defaultRestSeconds("10-15")).toBe(75);
    });

    it("tolerates dashes used in the UI and single numbers", () => {
        expect(U().defaultRestSeconds("10–15")).toBe(75);
        expect(U().defaultRestSeconds("8")).toBe(105);
        expect(U().defaultRestSeconds("")).toBe(105);
    });
});

describe("reorderDayLogs", () => {
    it("moves history to target slots and drops removed slots", () => {
        const week = {
            d2_e0: [{ kg: 60, done: true }], // Hip Thrust -> removed
            d2_e1: [{ kg: 80, done: true }], // Hack -> stays
            d2_e2: [{ kg: 90, done: true }], // RDL -> new slot 0
            d2_e2_note: "pasek",
            d2_e3: [{ kg: 40, done: false }], // Seated Leg Curl -> stays
            day_2_ts: 987
        };
        const out = U().reorderDayLogs(week, 2, [2, 1, null, 3, 4, 5, 6, 7]);
        expect(out.d2_e0).toEqual([{ kg: 90, done: true }]); // RDL moved here
        expect(out.d2_e0_note).toBe("pasek");
        expect(out.d2_e1).toEqual([{ kg: 80, done: true }]); // Hack preserved
        expect(Object.prototype.hasOwnProperty.call(out, "d2_e2")).toBe(false); // Leg Extension - no stale history
        expect(out.d2_e3).toEqual([{ kg: 40, done: false }]);
        expect(out.day_2_ts).toBe(987);
    });

    it("clears all history when every slot is new", () => {
        const week = {
            d2_e0: [{ kg: 50, done: true }],
            d2_e1_note: "old",
            day_2_ts: 5
        };
        const out = U().reorderDayLogs(week, 2, [null, null, null]);
        expect(Object.keys(out)).toEqual(["day_2_ts"]);
        expect(Object.prototype.hasOwnProperty.call(out, "d2_e0")).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(out, "d2_e1_note")).toBe(false);
    });

    it("does not mutate the input week", () => {
        const week = { d2_e0: [{ kg: 60, done: true }], d2_e2: [{ kg: 90, done: true }] };
        const out = U().reorderDayLogs(week, 2, [2, null, 0]);
        expect(out.d2_e0).toEqual([{ kg: 90, done: true }]);
        expect(out.d2_e2).toEqual([{ kg: 60, done: true }]);
        expect(week.d2_e0[0].kg).toBe(60);
        expect(week.d2_e2[0].kg).toBe(90);
    });
});