window.Utils = (() => {
    const formatNumberPL = (value) => {
        const num = Number(value) || 0;
        if (Number.isInteger(num)) return String(num);
        return num.toFixed(1).replace(".", ",");
    };

    const escapeHtml = (str = "") => {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    };

    const estimate1RM = (kg, reps) => {
        kg = Number(kg) || 0;
        reps = Number(reps) || 0;
        if (!kg || !reps) return 0;
        return kg * (1 + reps / 30);
    };

    const getTodayWeekday = () => new Date().getDay();

    const getCurrentSunday = () => {
        const now = new Date();
        const day = now.getDay();
        const sunday = new Date(now);
        sunday.setDate(now.getDate() - day);
        sunday.setHours(0, 0, 0, 0);
        return sunday;
    };

    const getWeekRangeLabel = (startSunday, weekIndex) => {
        if (!startSunday) return `Tydzień ${weekIndex + 1}`;

        const start = new Date(startSunday + weekIndex * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const startTxt = start.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
        const endTxt = end.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });

        return `${startTxt} – ${endTxt}`;
    };

    // Proponowany domyślny czas odpoczynku wg zakresu powtórzeń (dolna granica):
    // ciężkie złożone (5-8 powt.) -> 150-180s, umiarkowane (8-12) -> 90-120s,
    // małe partie / wysokie powt. (10-15+) -> 60-90s.
    const defaultRestSeconds = (reps = "") => {
        const txt = String(reps).trim().replace(/[–—]/g, "-");
        const parts = txt.split("-").map((x) => parseInt(x, 10));
        const nums = parts.filter((n) => Number.isFinite(n) && n > 0);
        const low = nums.length ? nums[0] : 8;
        if (low >= 10) return 75;
        if (low >= 8) return 105;
        return 165;
    };

    // Przepina serie i notatki jednego dnia pomiędzy pozycjami ćwiczeń (slotami),
    // tak aby historia podążała za ćwiczeniami po zmianie układu planu.
    // fromByNewIndex: dla każdej nowej pozycji podaje starą pozycję, z której
    // ma być wzięte ćwiczenie (null/niedefined = nowe ćwiczenie, bez historii).
    const reorderDayLogs = (week = {}, dayId, fromByNewIndex = []) => {
        const out = { ...week };
        const keyFor = (j) => `d${dayId}_e${j}`;
        const prefix = `d${dayId}_e`;

        const held = {};
        fromByNewIndex.forEach((from) => {
            if (from !== null && from !== undefined) {
                const k = keyFor(from);
                held[k] = out[k];
                held[k + "_note"] = out[k + "_note"];
            }
        });

        Object.keys(out).forEach((k) => {
            if (k.startsWith(prefix)) {
                delete out[k];
            }
        });

        fromByNewIndex.forEach((from, to) => {
            if (from === null || from === undefined) return;
            const fromKey = keyFor(from);
            const toKey = keyFor(to);
            if (held[fromKey] !== undefined) out[toKey] = held[fromKey];
            if (held[fromKey + "_note"] !== undefined) out[toKey + "_note"] = held[fromKey + "_note"];
        });

        return out;
    };

    return {
        formatNumberPL,
        escapeHtml,
        estimate1RM,
        getTodayWeekday,
        getCurrentSunday,
        getWeekRangeLabel,
        defaultRestSeconds,
        reorderDayLogs
    };
})();
