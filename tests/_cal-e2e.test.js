// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import "../js/utils.js";

const appPath = join(dirname(fileURLToPath(import.meta.url)), "..", "js", "app.js");
const hook = `
window.__test = {
    get state() { return state; },
    set state(v) { state = v; },
    get DAYS() { return DAYS; },
    set DAYS(v) { DAYS = v; },
    bootWithUser, applyCustomPlan, renderCalGrid, openCalPicker, pickCalOption,
    setCalMode, clearWeekOverrides, hideCalPicker, setPermAssignment,
    getPermDayForWeekday, getPlannedDayForWeekday, toggleCalendarSection
};`;
let saved = {};

const clone = (v) => JSON.parse(JSON.stringify(v));

beforeEach(() => {
    saved = {};
    window.AuthModule = { onReady: () => Promise.resolve(null), logout: async () => {} };
    window.Views = {
        renderHome() {}, renderPlan() {}, renderStats() {}, renderLibrary() {},
        setLibraryLoaded() {}, setLibQuery() {}, setLibCategory() {}, showMoreLib() {},
        openLibraryExercise() {}, closeLibraryExercise() {}, openExerciseInLib() {},
        getLibraryFilterState() { return {}; }, themePickerHTML() { return ""; }
    };
    window.ExerciseLib = { isReady: () => true, getError: () => null, loadLibrary: async () => {} };
    window.StorageModule = {
        resolveUser: (_, id) => ({ id, plan: "kuba", name: "Kuba" }),
        setSelectedProfileId() {}, clearSelectedProfile() {},
        load: async (key, empty) => (saved[key] ? clone(saved[key]) : clone(empty)),
        save: async (key, state) => { saved[key] = clone(state); }
    };
    document.body.innerHTML = `
        <div id="profile-gate"></div>
        <div id="more-sheet"></div>
        <div id="more-backdrop"></div>
        <div id="more-nav-btn"></div>
        <div id="more-cal-section" class="hidden">
            <div class="cal-mode-row">
                <button id="cal-mode-perm" class="cal-mode active">Na stałe</button>
                <button id="cal-mode-week" class="cal-mode">Tylko ten tydzień</button>
            </div>
            <div id="cal-days" class="cal-days"></div>
            <button id="cal-week-reset" class="cal-reset hidden">Resetuj</button>
        </div>
        <div id="toast"></div>`;
    window.eval(readFileSync(appPath, "utf8") + hook);
});

const boot = () => new Promise((resolve, reject) => {
    window.__test.bootWithUser("kuba-id", "kuba", "Kuba").catch(reject).then(resolve);
});

const rowsHTML = () => document.getElementById("cal-days").innerHTML;
const chipLabels = () => Array.from(document.querySelectorAll(".cal-row-chip .cal-row-name")).map((el) => el.textContent.trim().replace(/^[^\s]+\s+/, "").trim());
const waitSave = () => new Promise((r) => setTimeout(r, 420));

const KUBA_LABELS = ["PUSH", "PULL", "LEGS + ARMS", "UPPER"];

describe("kalendarz end-to-end", () => {
    describe("TRYB NA STAŁE", () => {
        it("boot: perm grid shows 4 trainings on correct weekdays, 3 free days", async () => {
            document.body.innerHTML += '<div id="screen-home"></div>';
            await boot(); window.__test.toggleCalendarSection();
            const html = rowsHTML();
            expect(html).toContain("— dzień wolny");
            expect(chipLabels().sort()).toEqual(KUBA_LABELS.slice().sort());
            const g = (id) => window.__test.getPlannedDayForWeekday(0, id);
            expect(g(0).id).toBe(0); expect(g(1).id).toBe(1); expect(g(2)).toBeNull();
            expect(g(3).id).toBe(2); expect(g(4)).toBeNull(); expect(g(5).id).toBe(3); expect(g(6)).toBeNull();
        });

        it("perm picker on free day: 5 enabled options incl. Dzień wolny; move PUSH WT → ND free", async () => {
            await boot(); window.__test.toggleCalendarSection();
            window.__test.openCalPicker(2);
            const opts = Array.from(document.querySelectorAll("button.cal-pick-opt"));
            expect(opts.length).toBe(5);
            expect(opts.every((o) => !o.disabled)).toBe(true);
            expect(opts[opts.length - 1].textContent).toContain("Dzień wolny");
            window.__test.pickCalOption(2, 0);
            expect(window.__test.getPermDayForWeekday(2).label).toBe("PUSH");
            expect(window.__test.getPermDayForWeekday(0)).toBeNull();
            expect(chipLabels().filter((l) => l === "PUSH").length).toBe(1);
        });

        it("perm: picking onto occupied day displaces occupant; displaced training becomes free", async () => {
            await boot(); window.__test.toggleCalendarSection();
            window.__test.pickCalOption(0, 2);
            expect(window.__test.getPermDayForWeekday(0).label).toBe("LEGS + ARMS");
            expect(window.__test.getPermDayForWeekday(3)).toBeNull();
            expect(chipLabels()).not.toContain("PUSH");
            expect(chipLabels().filter((l) => l === "LEGS + ARMS").length).toBe(1);
            const labels = window.__test.DAYS.map((d) => d.label);
            expect(new Set(labels).size).toBe(4);
        });

        it("perm: Dzień wolny clears permanently (weekday null) and survives save+reload", async () => {
            await boot(); window.__test.toggleCalendarSection();
            window.__test.pickCalOption(1, null);
            expect(window.__test.state.customPlanMeta[1].weekday).toBeNull();
            expect(window.__test.getPermDayForWeekday(1)).toBeNull();
            expect(rowsHTML()).toContain("— dzień wolny");
            await waitSave();
            expect(saved["kuba-id"].customPlanMeta[1].weekday).toBeNull();
            window.__test.DAYS = window.__test.DAYS; // reboot simulation below
            window.__test.state = clone(saved["kuba-id"]);
            window.__test.applyCustomPlan();
            expect(window.__test.getPermDayForWeekday(1)).toBeNull();
            expect(window.__test.getPermDayForWeekday(3).id).toBe(2);
        });

        it("perm: assignment persists through save+reload (PUSH→WT, ND free)", async () => {
            await boot(); window.__test.toggleCalendarSection();
            window.__test.pickCalOption(2, 0);
            await waitSave();
            const st = clone(saved["kuba-id"]);
            expect(st.customPlanMeta[0].weekday).toBe(2);
            expect(st.customPlanMeta[1].weekday).toBe(1);
            expect(st.customPlanMeta[2].weekday).toBe(3);
            expect(st.customPlanMeta[3].weekday).toBe(5);
        });
    });

    describe("TRYB TYLKO TEN TYDZIEŃ", () => {
        it("week picker: trainings used this week are blocked; free day first, then pick works, no duplicates", async () => {
            await boot(); window.__test.toggleCalendarSection();
            window.__test.setCalMode("week");
            window.__test.openCalPicker(2);
            const opts = Array.from(document.querySelectorAll("button.cal-pick-opt"));
            expect(opts.length).toBe(5);
            const used = opts.filter((o) => o.classList.contains("used") && o.disabled);
            expect(used.length).toBe(4);
            expect(opts[opts.length - 1].textContent).toContain("Dzień wolny");
            window.__test.hideCalPicker();
            window.__test.pickCalOption(0, null);
            expect(window.__test.getPlannedDayForWeekday(0, 0)).toBeNull();
            window.__test.pickCalOption(2, 0);
            expect(window.__test.state.weekSchedule[0]).toEqual({ 0: null, 2: 0 });
            expect(window.__test.getPlannedDayForWeekday(0, 2).label).toBe("PUSH");
            expect(rowsHTML()).toContain("cal-row-tag");
            expect(chipLabels().filter((l) => l === "PUSH").length).toBe(1);
        });

        it("week: override + reset works and perm plan untouched; persisted", async () => {
            await boot(); window.__test.toggleCalendarSection();
            window.__test.setCalMode("week");
            window.__test.pickCalOption(2, 0);
            window.__test.pickCalOption(4, null);
            expect(window.__test.state.weekSchedule[0]).toEqual({ 2: 0, 4: null });
            const perm = window.__test.DAYS.map((d) => d.weekday);
            window.__test.clearWeekOverrides();
            expect(window.__test.state.weekSchedule[0]).toBeUndefined();
            expect(rowsHTML()).not.toContain("cal-row-tag");
            expect(window.__test.DAYS.map((d) => d.weekday)).toEqual(perm);
            applyPermPersist();
        });

        async function applyPermPersist() {
            window.__test.pickCalOption(2, 0);
            window.__test.pickCalOption(4, null);
            await waitSave();
            expect(saved["kuba-id"].weekSchedule[0]).toEqual({ 2: 0, 4: null });
            window.__test.state = clone(saved["kuba-id"]);
            window.__test.applyCustomPlan();
            window.__test.renderCalGrid();
        }
    });
});