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