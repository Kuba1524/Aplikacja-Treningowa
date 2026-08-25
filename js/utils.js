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

    return {
        formatNumberPL,
        escapeHtml,
        estimate1RM,
        getTodayWeekday,
        getCurrentSunday,
        getWeekRangeLabel
    };
})();
