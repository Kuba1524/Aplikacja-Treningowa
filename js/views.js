window.Views = (() => {
    const PL_MONTHS = [
        "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
        "lipca", "sierpnia", "września", "października", "listopada", "grudnia"
    ];

    const PL_MONTHS_LOCATIVE = [
        "styczniu", "lutym", "marcu", "kwietniu", "maju", "czerwcu",
        "lipcu", "sierpniu", "wrześniu", "październiku", "listopadzie", "grudniu"
    ];

    let libReady = false;
    let libError = false;
    let libQuery = "";
    let libCategory = "all";
    let libSelectedId = null;
    let libMediaPlaying = true;
    let libItemLimit = 40;

    const ICON_PATHS = {
        "🔥":
            '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />',
        "💪":
            '<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z" /><path d="m2.5 21.5 1.4-1.4" /><path d="m20.1 3.9 1.4-1.4" /><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z" /><path d="m9.6 14.4 4.8-4.8" />',
        "🦵":
            '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z" /><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z" /><path d="M16 17h4" /><path d="M4 13h4" />',
        "⚡":
            '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z" />'
    };

    const iconFor = (icon) => {
        const body = ICON_PATHS[icon] || ICON_PATHS["⚡"];
        return (
            '<svg class="dicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            body +
            "</svg>"
        );
    };

    const MISC_ICONS = {
        calendar:
            '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
        target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>',
        message:
            '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
        wifiOff:
            '<path d="M2 22 22 2"/><path d="M5.78 5.78A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.3-.19"/><path d="M21.53 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.01 7.01 0 0 0 10 5.07"/>'
    };

    const miscIcon = (name) => {
        const body = MISC_ICONS[name] || MISC_ICONS.search;
        return (
            '<svg class="dicon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            body +
            "</svg>"
        );
    };

    const renderHome = (ctx) => {
        const {
            state,
            DAYS,
            currentWeekIndex,
            getDayProgress,
            getTodayPlan,
            getWeekCompletion
        } = ctx;

        const screen = document.getElementById("screen-home");
        if (!screen) return;
        if (!window.StatsModule) {
            screen.innerHTML = '<div class="container"><p>Ładowanie…</p></div>';
            return;
        }
        const todayPlan = getTodayPlan();
        const weekSummary = getWeekCompletion(currentWeekIndex);
        const weekStats = window.StatsModule.getWeekStats(state, DAYS, currentWeekIndex, ctx.getExerciseKey);
        const streak = window.StatsModule.getWeekStreak(state, DAYS, ctx.getExerciseKey);

        screen.innerHTML = `
            <div class="container">
                <div class="header-block header-flex">
                    <div>
                        <div class="header-title">Kuba<span>Gym</span></div>
                        <div class="header-sub">${new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}</div>
                    </div>
                    <button type="button" class="logout-btn" onclick="logoutUser()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
                        <span>Wyloguj</span>
                    </button>
                </div>

                <div class="card week-strip">
                    <div class="week-strip-top">
                        <div class="week-strip-title">Ten tydzień</div>
                        <div class="section-sub">Tydzień ${currentWeekIndex + 1}</div>
                    </div>

                    <div class="week-days">
                        ${ctx.getWeekDaysUI()}
                    </div>

                    ${todayPlan ? `
                        <div class="today-card">
                            <div class="today-card-left">
                                <div class="today-icon">${iconFor(todayPlan.icon)}</div>
                                <div class="today-meta">
                                    <div class="today-kicker">DZISIAJ</div>
                                    <div class="today-title">${todayPlan.label}</div>
                                    <div class="today-sub">${todayPlan.name} · ${todayPlan.exercises.length} ćwiczeń</div>
                                </div>
                            </div>
                            <button class="btn-start" onclick="openDay(${todayPlan.id})">Start</button>
                        </div>
                    ` : `
                        <div class="today-card">
                            <div class="today-card-left">
                                <div class="today-icon today-icon-rest">✓</div>
                                <div class="today-meta">
                                    <div class="today-kicker">DZISIAJ</div>
                                    <div class="today-title">Rest Day</div>
                                    <div class="today-sub">Dziś nie ma zaplanowanego treningu</div>
                                </div>
                            </div>
                        </div>
                    `}
                </div>

                <div class="dashboard-grid">
                    <div class="stack">
                        <div class="card stat-card">
                            <div class="stat-card-top">
                                <div>
                                    <div class="stat-label">Postęp tygodnia</div>
                                    <div class="stat-value stat-fraction">${weekSummary.done}<span class="stat-den">/${weekSummary.total}</span></div>
                                </div>
                                <div class="stat-inline">${weekSummary.pct}%</div>
                            </div>
                            <div class="stat-note">Ukończone serie w aktualnym tygodniu</div>
                        </div>

                        <div class="mini-grid">
                            <div class="card-soft kpi-card">
                                <div class="kpi-label">Aktywne dni</div>
                                <div class="kpi-value">${weekStats.activeDays}/4</div>
                                <div class="kpi-sub">Treningi wykonane w tym tygodniu</div>
                            </div>

                            <div class="card-soft kpi-card">
                                <div class="kpi-label">Week streak</div>
                                <div class="kpi-value">${streak}</div>
                                <div class="kpi-sub">Tygodnie z rzędu z aktywnością</div>
                            </div>
                        </div>
                    </div>

                    <div class="stack">
                        <div class="card-soft stat-card">
                            <div class="section-title-row">
                                <div>
                                    <div class="section-title">Szybki podgląd</div>
                                    <div class="section-sub">Aktualny plan</div>
                                </div>
                            </div>

                            <div class="day-list">
                                ${DAYS.map((day) => {
                                    const progress = getDayProgress(day.id);
                                    const isToday = todayPlan && day.id === todayPlan.id;
                                    return `
                                        <div class="card day-plan-card ${isToday ? "day-today" : ""}" onclick="openDay(${day.id})">
                                            <div class="day-plan-left">
                                                <div class="day-plan-icon">${iconFor(day.icon)}</div>
                                                <div>
                                                    <div class="day-plan-title">${day.label}</div>
                                                    <div class="day-plan-sub">${day.name} · ${day.exercises.length} ćwiczeń</div>
                                                </div>
                                            </div>
                                            <div class="day-plan-right">
                                                ${isToday ? '<div class="day-plan-badge">Dziś</div>' : ""}
                                                <div class="day-plan-progress">${progress.done}/${progress.total} · ${progress.pct}%</div>
                                                <div class="day-plan-arrow">›</div>
                                            </div>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                            <button class="link-full-plan" onclick="openFullPlan()">Otwórz pełny plan</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const renderThemePicker = () => {
        const themes = window.getThemes ? window.getThemes() : [];
        const current = window.getCurrentTheme ? window.getCurrentTheme() : "blue";
        if (!themes.length) return "";

        return `
            <div class="theme-card">
                <div class="theme-top">
                    <div>
                        <div class="section-title">Motyw</div>
                        <div class="section-sub">Wybierz wygląd aplikacji</div>
                    </div>
                    <span class="theme-emoji" aria-hidden="true">${miscIcon("sun")}</span>
                </div>
                <div class="theme-grid">
                    ${themes
                        .map(
                            (t) => `
                            <button type="button" class="theme-opt ${current === t.id ? "active" : ""}" onclick="setTheme('${t.id}')">
                                <span class="theme-swatch" style="background:linear-gradient(160deg, ${t.swatch}, ${t.swatch}55);"></span>
                                <span class="theme-name">${window.Utils.escapeHtml(t.label)}</span>
                            </button>
                            `
                        )
                        .join("")}
                </div>
                <div class="theme-note">Zmiana motywu jest zapisywana na tym urządzeniu</div>
            </div>
        `;
    };

    const renderPlan = (ctx) => {
        const {
            state,
            currentWeekIndex,
            DAYS,
            getDayProgress,
            getExerciseKey
        } = ctx;
        const screen = document.getElementById("screen-plan");
        const isFullPlan = !ctx.planCompactMode;

        screen.innerHTML = `
            <div class="container">
                <div class="header-block">
                    <div class="header-title">Plan <span>Treningowy</span></div>
                    <div class="header-sub">${isFullPlan ? "Podgląd całego planu treningowego" : "Wybierz dzień i zapisuj progres"}</div>
                </div>

                <div class="tabs-row">
                    <div class="plan-mode-toggle">
                        <button class="seg-btn ${isFullPlan ? "active" : ""}" onclick="setPlanMode(true)">Pełny plan</button>
                        <button class="seg-btn ${!isFullPlan ? "active" : ""}" onclick="setPlanMode(false)">Wybierz dzień</button>
                    </div>
                    <div class="plan-week-tabs">
                        ${state.weeks.map((_, w) => {
                            const summary = ctx.getWeekCompletion(w);
                            return `
                                <button class="week-btn ${currentWeekIndex === w ? "active" : ""}" onclick="setWeek(${w})">
                                    TYDZIEŃ ${w + 1}
                                    <span class="week-mini">${summary.pct}%</span>
                                </button>
                            `;
                        }).join("")}
                    </div>
                </div>

                ${isFullPlan ? renderFullPlan(DAYS, getDayProgress, getExerciseKey, ctx) : renderCompactPlan(DAYS, getDayProgress)}
            </div>
        `;
    };

    const renderFullPlan = (DAYS, getDayProgress, getExerciseKey, ctx) => {
        const weekData = ctx.state.weeks[ctx.currentWeekIndex] || {};
        let totalExercises = 0;
        let totalSets = 0;
        let doneSets = 0;

        DAYS.forEach((day) => {
            totalExercises += day.exercises.length;
            day.exercises.forEach((ex, ei) => {
                totalSets += ex.sets;
                const key = getExerciseKey(day.id, ei);
                const sets = weekData[key] || [];
                doneSets += sets.filter((s) => s && s.done).length;
            });
        });

        const overallPct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;

        return `
            <div class="full-plan-overview">
                <div class="full-plan-summary">
                    <div class="full-plan-stat">
                        <div class="full-plan-stat-num">${DAYS.length}</div>
                        <div class="full-plan-stat-label">Dni treningowe</div>
                    </div>
                    <div class="full-plan-divider"></div>
                    <div class="full-plan-stat">
                        <div class="full-plan-stat-num">${totalExercises}</div>
                        <div class="full-plan-stat-label">Ćwiczenia</div>
                    </div>
                    <div class="full-plan-divider"></div>
                    <div class="full-plan-stat">
                        <div class="full-plan-stat-num">${totalSets}</div>
                        <div class="full-plan-stat-label">Serie tygodniowo</div>
                    </div>
                    <div class="full-plan-divider"></div>
                    <div class="full-plan-stat">
                        <div class="full-plan-stat-num">${overallPct}%</div>
                        <div class="full-plan-stat-label">Postęp</div>
                    </div>
                </div>

                <div class="full-plan-progress-track">
                    <div class="full-plan-progress-fill" style="width:${overallPct}%"></div>
                </div>
            </div>

            <div class="full-plan-days">
                ${DAYS.map((day) => {
                    const progress = getDayProgress(day.id);
                    return `
                        <div class="full-plan-day" onclick="openDay(${day.id})">
                            <div class="full-plan-day-header">
                                <div class="full-plan-day-left">
                                    <div class="full-plan-day-icon">${iconFor(day.icon)}</div>
                                    <div class="full-plan-day-info">
                                        <div class="full-plan-day-label">${day.label}</div>
                                        <div class="full-plan-day-name">${day.name}</div>
                                    </div>
                                </div>
                                <div class="full-plan-day-right">
                                    <div class="full-plan-day-progress">
                                        <div class="full-plan-day-pct">${progress.pct}%</div>
                                        <div class="full-plan-day-count">${progress.done}/${progress.total} serii</div>
                                    </div>
                                    <div class="full-plan-day-arrow">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                                    </div>
                                </div>
                            </div>

                            <div class="full-plan-progress-mini">
                                <div class="full-plan-progress-mini-fill" style="width:${progress.pct}%"></div>
                            </div>

                            <div class="full-plan-exercises">
                                ${day.exercises.map((ex, ei) => {
                                    const key = getExerciseKey(day.id, ei);
                                    const sets = weekData[key] || [];
                                    const exDone = sets.filter((s) => s && s.done).length;
                                    return `
                                        <div class="full-plan-exercise ${exDone === ex.sets ? "completed" : ""}">
                                            <span class="tag-badge tag-${ex.tag}">${ex.tag}</span>
                                            <div class="full-plan-ex-info">
                                                <div class="full-plan-ex-name">${ex.name}</div>
                                                <div class="full-plan-ex-meta">${ex.sets}×${ex.reps}</div>
                                            </div>
                                            <div class="full-plan-ex-status">
                                                ${exDone === ex.sets
                                                    ? '<span class="full-plan-check done">✓</span>'
                                                    : exDone > 0
                                                        ? `<span class="full-plan-check partial">${exDone}/${ex.sets}</span>`
                                                        : `<span class="full-plan-check pending">${exDone}/${ex.sets}</span>`
                                                }
                                            </div>
                                        </div>
                                    `;
                                }).join("")}
                            </div>

                            <div class="full-plan-day-action">
                                <span>Rozpocznij trening</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    };

    const renderCompactPlan = (DAYS, getDayProgress) => {
        return `
            <div class="day-list">
                ${DAYS.map((day) => {
                    const progress = getDayProgress(day.id);
                    return `
                        <div class="card day-plan-card" onclick="openDay(${day.id})">
                            <div class="day-plan-left">
                                <div class="day-plan-icon">${iconFor(day.icon)}</div>
                                <div>
                                    <div class="day-plan-title">${day.label}</div>
                                    <div class="day-plan-sub">${day.name} · ${day.exercises.length} ćwiczeń</div>
                                </div>
                            </div>
                            <div class="day-plan-right">
                                <div class="day-plan-progress">${progress.done}/${progress.total} · ${progress.pct}%</div>
                                <div class="day-plan-arrow">→</div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    };

    const renderStats = (ctx) => {
        const {
            state,
            DAYS,
            currentWeekIndex,
            statsMaxCols = 12
        } = ctx;
        const screen = document.getElementById("screen-stats");
        if (!screen || !window.StatsModule) return;

        const S = window.StatsModule;
        const U = window.Utils;

        const totalWorkouts = S.getTotalWorkouts(state, DAYS, ctx.getExerciseKey);
        const monthWorkouts = S.getCurrentMonthWorkouts(
            state,
            DAYS,
            ctx.getExerciseKey,
            ctx.getDayTimestampKey
        );
        const streak = S.getWeekStreak(state, DAYS, ctx.getExerciseKey);
        const weekStats = S.getWeekStats(state, DAYS, currentWeekIndex, ctx.getExerciseKey);
        const weekComp = ctx.getWeekCompletion
            ? ctx.getWeekCompletion(currentWeekIndex)
            : { total: 0, done: 0, pct: 0 };
        const prs = S.getPrimaryExercises(state, DAYS, ctx.getExerciseKey);

        const cal = S.getActivityCalendar
            ? S.getActivityCalendar(state, DAYS, ctx.getExerciseKey, ctx.getDayTimestampKey, statsMaxCols)
            : { labels: [], rows: [], cols: 0, monthHeaders: [], currentCol: 0, startIdx: 0 };

        const bw = S.getBodyWeightSeries
            ? S.getBodyWeightSeries(state, 60)
            : { values: [], last: null, delta: null, delta30: null, entries: [] };

        const now = new Date();
        const monthName = PL_MONTHS_LOCATIVE[now.getMonth()] || "";
        const monthPrefix = now.getMonth() === 8 ? "we" : "w";

        const colCount = Math.max(cal.cols, 1);
        const monthHeaderHtml = `
            <div class="cal-months" style="--cal-cols: ${colCount}">
                <div></div>
                ${(cal.monthHeaders || [])
                    .map((m) => `<div class="cal-month-lab">${m || ""}</div>`)
                    .join("")}
            </div>`;

        const calRowsHtml = (cal.labels || [])
            .map((lab, ri) => {
                const cells = (cal.rows[ri] || [])
                    .map((lvl, ci) => {
                        const todayCls = ci === cal.currentCol ? " is-today" : "";
                        const week = (cal.startIdx || 0) + ci + 1;
                        const tip = `${lab} · tydz. ${week}${lvl === 0 ? "" : " · " + lvl + "/4"}`;
                        return `<div class="cal-cell l${lvl}${todayCls}" title="${tip}"></div>`;
                    })
                    .join("");
                return `<div class="cal-lab">${lab}</div>${cells}`;
            })
            .join("");

        const rangeBtns = [4, 12, 28]
            .map((n) => {
                const label = n === 4 ? "4 tyg" : n === 12 ? "12 tyg" : "Historia";
                return `<button type="button" class="seg-btn ${statsMaxCols === n ? "active" : ""}" onclick="setStatsRange(${n})">${label}</button>`;
            })
            .join("");

        let bwSpark = "";
        if (bw.values && bw.values.length > 1 && S.createSparklineSVG) {
            bwSpark = S.createSparklineSVG(bw.values, "#22c55e")
                .replace('class="pr-sparkline"', 'class="bw-chart"');
        }

        const lastBwEntry = bw.entries && bw.entries.length
            ? bw.entries[bw.entries.length - 1]
            : null;
        const lastDate = lastBwEntry && lastBwEntry.ts
            ? new Date(lastBwEntry.ts).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })
            : null;

        let lastChip = "";
        if (typeof bw.delta === "number" && bw.delta !== 0) {
            const dir = bw.delta > 0 ? "up" : "down";
            const arrow = bw.delta > 0 ? "▲" : "▼";
            lastChip = `<span class="chip ${dir}">${arrow} ${U.formatNumberPL(Math.abs(bw.delta))} kg</span>`;
        } else if (bw.last != null) {
            lastChip = '<span class="chip flat">bez zmian</span>';
        }

        let d30Chip = "";
        if (typeof bw.delta30 === "number") {
            const cls = bw.delta30 <= 0 ? "down" : "up";
            const sign = bw.delta30 > 0 ? "+" : "";
            d30Chip = `<span class="chip ${cls}">${sign}${U.formatNumberPL(bw.delta30)} kg / 30d</span>`;
        }

        const weekDaysOverview = DAYS.map((day) => {
            const progress = ctx.getDayProgress ? ctx.getDayProgress(day.id) : { total: 0, done: 0, pct: 0 };
            const isDone = progress.total > 0 && progress.done === progress.total;
            const isPartial = progress.done > 0;
            return `
                <div class="wd-row">
                    <div class="wd-icon">${iconFor(day.icon)}</div>
                    <div class="wd-main">
                        <div class="wd-label">${day.label}</div>
                        <div class="wd-track"><div class="wd-fill" style="width:${progress.pct}%"></div></div>
                    </div>
                    <div class="wd-right">
                        <div class="wd-num">${progress.pct}%</div>
                        <div class="wd-status ${isDone ? "done" : isPartial ? "partial" : ""}">${isDone ? "Zrobione" : isPartial ? `${progress.done}/${progress.total} serii` : "Do zrobienia"}</div>
                    </div>
                </div>
            `;
        }).join("");

        const prHtml = (prs || [])
            .map((pr) => {
                const history = pr.history || [];
                const values = history.map((h) => h.topWeight || (h.bestSet && h.bestSet.kg) || 0);
                const first = values[0] || 0;
                const last = values[values.length - 1] || 0;

                let deltaPct = 0;
                if (first > 0 && values.length >= 2) deltaPct = ((last - first) / first) * 100;

                let badgeClass = "flat";
                let badgeLabel = "—";
                if (values.length >= 2) {
                    if (deltaPct > 0.05) {
                        badgeClass = "up";
                        badgeLabel = "+" + Math.round(deltaPct) + "%";
                    } else if (deltaPct < -0.05) {
                        badgeClass = "down";
                        badgeLabel = Math.round(deltaPct) + "%";
                    } else {
                        badgeLabel = "0%";
                    }
                }

                const best = history.reduce((acc, h) => {
                    const kg = (h.bestSet && h.bestSet.kg) || h.topWeight || 0;
                    const reps = (h.bestSet && h.bestSet.reps) || 0;
                    if (!acc || kg > acc.kg || (kg === acc.kg && reps > acc.reps)) {
                        return { kg, reps };
                    }
                    return acc;
                }, null);

                const spark = values.length > 1 && S.createSparklineSVG
                    ? S.createSparklineSVG(values, "#60a5fa")
                    : "";
                const bestTxt = best
                    ? `${U.formatNumberPL(best.kg)} kg × ${best.reps || "—"}`
                    : "—";
                const est1RM = best && best.kg && best.reps
                    ? Math.round(U.estimate1RM(best.kg, best.reps))
                    : null;
                const routeTxt =
                    first > 0 && last > 0 && first !== last
                        ? `${U.formatNumberPL(first)} → ${U.formatNumberPL(last)} kg`
                        : "";

                return `
                <div class="pr-card">
                    <div class="pr-card-top">
                        <div>
                            <div class="pr-name">${pr.name}</div>
                            <div class="pr-sub">${routeTxt || "Najlepszy wynik"}</div>
                        </div>
                        <div class="pr-badge ${badgeClass}">${badgeLabel}</div>
                    </div>
                    ${spark}
                    <div class="pr-foot">
                        <div class="pr-cell">
                            <span class="pr-cell-lab">Best set</span>
                            <span class="pr-cell-val">${bestTxt}</span>
                        </div>
                        <div class="pr-cell">
                            <span class="pr-cell-lab">1RM (est.)</span>
                            <span class="pr-cell-val">${est1RM ? est1RM + " kg" : "—"}</span>
                        </div>
                        <div class="pr-cell">
                            <span class="pr-cell-lab">Zapisów</span>
                            <span class="pr-cell-val">${history.length}</span>
                        </div>
                        <div class="pr-cell">
                            <span class="pr-cell-lab">Top kg</span>
                            <span class="pr-cell-val">${last ? U.formatNumberPL(last) : "—"}</span>
                        </div>
                    </div>
                </div>`;
            })
            .join("");

        screen.innerHTML = `
            <div class="container stats-page">
                <div class="header-block">
                    <div class="header-title">Statystyki</div>
                    <div class="header-sub">${now.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>

                <div class="stat-screen">

                    <div class="hero-card">
                        <div class="hero-top">
                            <div>
                                <div class="hero-kicker">Łączny postęp</div>
                                <div class="hero-num">${totalWorkouts}</div>
                                <div class="hero-cap">ukończonych treningów</div>
                            </div>
                            <div class="hero-ring" style="--streak-pct: ${Math.min((streak / 6) * 100, 100)}">
                                <div class="hero-ring-inner">
                                    <span class="hero-ring-num">${streak}</span>
                                    <span class="hero-ring-lab">tyg.<br/>z rzędu</span>
                                </div>
                            </div>
                        </div>
                        <div class="hero-metrics">
                            <div class="hero-metric">
                                <span class="hero-metric-ico">${miscIcon("calendar")}</span>
                                <div>
                                    <div class="hero-metric-num">${monthWorkouts}</div>
                                    <div class="hero-metric-lab">treningi<br/>${monthPrefix} ${monthName}</div>
                                </div>
                            </div>
                            <div class="hero-metric">
                                <span class="hero-metric-ico">${miscIcon("target")}</span>
                                <div>
                                    <div class="hero-metric-num">${weekStats.completedSets}</div>
                                    <div class="hero-metric-lab">serie<br/>w tym tygodniu</div>
                                </div>
                            </div>
                            <div class="hero-metric">
                                <span class="hero-metric-ico">${iconFor("🔥")}</span>
                                <div>
                                    <div class="hero-metric-num">${weekStats.activeDays}/${DAYS.length}</div>
                                    <div class="hero-metric-lab">aktywne<br/>dni treningowe</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section class="stats-section">
                        <div class="stats-section-head">
                            <div class="stats-section-title">Ten tydzień</div>
                            <div class="stats-section-sub">${U.formatNumberPL(weekComp.done)} z ${U.formatNumberPL(weekComp.total)} serii ukończonych</div>
                        </div>
                        <div class="week-progress">
                            <div class="week-progress-track">
                                <div class="week-progress-fill" style="width:${weekComp.pct}%"></div>
                            </div>
                            <div class="week-progress-num">${weekComp.pct}%</div>
                        </div>
                        <div class="wd-list">
                            ${weekDaysOverview}
                        </div>
                    </section>

                    <section class="stats-section">
                        <div class="stats-section-head stacked">
                            <div class="stats-section-title">Regularność</div>
                            <div class="stats-section-sub">Dni treningowe w kolejnych tygodniach</div>
                            <div class="seg-control seg-below">${rangeBtns}</div>
                        </div>
                        <div class="cal-wrap">
                            ${monthHeaderHtml}
                            <div class="cal-grid" style="--cal-cols: ${colCount}">
                                ${calRowsHtml || '<div class="cal-lab">—</div>'}
                            </div>
                        </div>
                        <div class="cal-legend">
                            <span>Mniej</span>
                            <div class="cal-cell"></div>
                            <div class="cal-cell l1"></div>
                            <div class="cal-cell l2"></div>
                            <div class="cal-cell l3"></div>
                            <div class="cal-cell l4"></div>
                            <span>Więcej</span>
                            <span class="cal-legend-note">${cal.cols} tygodni</span>
                        </div>
                    </section>

                    <section class="stats-section">
                        <div class="stats-section-head">
                            <div>
                                <div class="stats-section-title">Waga ciała</div>
                                <div class="stats-section-sub">${lastDate ? `Ostatni pomiar: ${lastDate}` : "Zapisz wagę, aby śledzić zmiany"}</div>
                            </div>
                            ${bw.last != null ? `
                                <div class="bw-big-sm">
                                    <span class="bw-num-sm">${U.formatNumberPL(bw.last)}</span>
                                    <span class="bw-unit">kg</span>
                                </div>
                            ` : ""}
                        </div>
                        <div class="bw-chips-mini">${lastChip}${d30Chip}</div>
                        ${bwSpark || '<div class="bw-empty">Zapisz kilka pomiarów, aby zobaczyć wykres.</div>'}
                        <div class="bw-log-row">
                            <button type="button" class="btn-secondary" onclick="document.getElementById('bw-form').classList.toggle('open');this.classList.toggle('open')">${bw.last != null ? "✎ Edytuj wagę" : "＋ Zapisz wagę"}</button>
                        </div>
                        <div id="bw-form" class="bw-form">
                            <input id="bw-input" class="bw-input" type="number" step="0.1" min="30" max="300" placeholder="np. 78,5" inputmode="decimal" />
                            <button type="button" class="bw-save" onclick="logBodyWeight(document.getElementById('bw-input').value)">Zapisz</button>
                        </div>
                    </section>

                    <section class="stats-section">
                        <div class="stats-section-head">
                            <div>
                                <div class="stats-section-title">Najlepsze wyniki</div>
                                <div class="stats-section-sub">Trend ciężaru w kluczowych ćwiczeniach</div>
                            </div>
                        </div>
                        ${prHtml
                            ? `<div class="pr-grid">${prHtml}</div>`
                            : `<div class="empty-state"><div class="empty-ico">${iconFor("💪")}</div><div class="empty-txt">Jeszcze brak danych.<br/>Ukończ pierwsze serie, a pojawią się tu wykresy postępu.</div></div>`}
                    </section>

                </div>
            </div>
        `;
    };

    const buildProgUI = (prog) => {
        if (!prog) return "";
        const fmt = (n) => window.Utils.formatNumberPL(n);
        let badge = "";
        let detail = prog.reason;
        if (prog.tier === "increase") {
            badge = `<span class="prog-badge up">+2.5 kg</span>`;
        } else if (prog.tier === "catch-up") {
            badge = `<span class="prog-badge steady">więcej powt.</span>`;
        } else {
            badge = `<span class="prog-badge new">dobierz ciężar</span>`;
        }
        const working =
            prog.workingKg != null ? `Ciężar roboczy: <b>${fmt(prog.workingKg)} kg</b>` : "Brak danych z poprzedniego tygodnia";
        return `<div class="prog-card">
                <div class="prog-top">
                    ${badge}
                    <span class="prog-working">${working}</span>
                </div>
                <div class="prog-detail">${detail}</div>
            </div>`;
    };

    const renderWorkout = (ctx) => {
        const {
            currentDayId,
            DAYS,
            state,
            currentWeekIndex
        } = ctx;
        const day = DAYS[currentDayId];
        const weekData = state.weeks[currentWeekIndex];
        const prevWeekData = currentWeekIndex > 0 ? state.weeks[currentWeekIndex - 1] : null;

        const screen = document.getElementById("screen-workout");
        if (!day) {
            screen.innerHTML = "";
            return;
        }

        const dayKey = ctx.getDayDateKey(currentDayId);
        const dayDateText = weekData[dayKey] || "";

        let totalSets = 0;
        let doneSets = 0;

        day.exercises.forEach((ex, ei) => {
            totalSets += ex.sets;
            const key = ctx.getExerciseKey(currentDayId, ei);
            const sets = weekData[key] || [];
            doneSets += sets.filter((s) => s.done).length;
        });

        const progressPct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;

        screen.innerHTML = `
            <div class="workout-shell">
                <div class="workout-top">
                    <button class="icon-btn" onclick="goBackFromWorkout()">←</button>

                    <div class="workout-head-center">
                        <div class="workout-title">${day.label}</div>
                        <div class="workout-sub">${dayDateText} • ${doneSets}/${totalSets} serii</div>
                    </div>

                    <button class="icon-btn" onclick="resetWorkout()">↺</button>
                </div>

                <div class="workout-progress-track">
                    <div class="workout-progress-fill" style="width:${progressPct}%;"></div>
                </div>

                ${day.exercises.map((ex, ei) => {
                    const key = ctx.getExerciseKey(currentDayId, ei);
                    const noteKey = ctx.getNoteKey(currentDayId, ei);

                    ctx.ensureWorkoutDataExists(currentDayId, ei, ex.sets);

                    const sets = weekData[key];
                    const currentNote = weekData[noteKey] || "";
                    const prevSets = prevWeekData ? prevWeekData[key] : null;
                    const prevNote = prevWeekData ? (prevWeekData[noteKey] || "") : "";

                    const exDone = sets.filter((s) => s.done).length;
                    const exPct = ex.sets ? Math.round((exDone / ex.sets) * 100) : 0;

                    const prog = window.Progression && window.Progression.computeExercisePlan
                        ? window.Progression.computeExercisePlan(ex, prevSets)
                        : null;
                    const progUI = buildProgUI(prog);

                    return `
                        <div class="exercise-card ${exDone === ex.sets ? "complete" : ""}">
                            <div class="exercise-header">
                                <div class="exercise-title-wrap">
                                    <span class="tag-badge tag-${ex.tag}">${ex.tag}</span>
                                    <div class="exercise-main">
                                        <span class="ex-title">${ex.name}</span>
                                        <div class="ex-reps-range">${ex.sets} serie × ${ex.reps} powtórzeń</div>
                                    </div>
                                </div>
                                <div class="ex-circle ${exDone === ex.sets ? "complete" : ""}">
                                    <span class="ex-circle-num">${exDone}/${ex.sets}</span>
                                    ${exPct > 0 ? `<span class="ex-circle-pct">${exPct}%</span>` : ""}
                                </div>
                            </div>

                            <div class="ex-progress-track">
                                <div class="ex-progress-fill" style="width:${exPct}%"></div>
                            </div>

                            ${progUI}

                            ${prevNote && prevNote.trim() ? `
                                <div class="history-note">
                                    <div class="history-note-label">Notatka z poprzedniego tygodnia</div>
                                    <div class="history-note-text">${window.Utils.escapeHtml(prevNote)}</div>
                                </div>
                            ` : ""}

                            <button id="note-toggle-${ei}" class="btn-note-toggle ${currentNote ? "active" : ""}" onclick="toggleNoteBox(${ei})">
                                ${window.renderNoteBtnLabel(!!currentNote)}
                            </button>

                            <div id="note-box-${ei}" class="note-box">
                                <textarea
                                    class="note-input"
                                    rows="2"
                                    placeholder="Notatka do ćwiczenia (ból, wyniki, tempo, uwagi)..."
                                    oninput="updateNote(${ei}, this.value)"
                                >${window.Utils.escapeHtml(currentNote || "")}</textarea>
                            </div>


                            <div class="sets-list">
                                ${sets.map((s, i) => {
                                    const prev = prevSets && prevSets[i] ? prevSets[i] : null;
                                    const prevTxt = prev && prev.done
                                        ? `${window.Utils.formatNumberPL(prev.kg)} kg × ${window.Utils.formatNumberPL(prev.reps)}`
                                        : "";
                                    const prevKg = prev && prev.done && prev.kg ? prev.kg : "";
                                    const prevReps = prev && prev.done && prev.reps ? prev.reps : "";

                                    const goalReps = prog && prog.targets && prog.targets[i] ? prog.targets[i] : "";
                                    const kgPh = prog && prog.tier === "increase" && prog.nextKg != null
                                        ? window.Utils.formatNumberPL(prog.nextKg)
                                        : (prevKg || "");
                                    const repsPh = prog && goalReps ? goalReps : (prevReps || "");

                                    if (s.done) {
                                        return `
                                            <div class="set-row done collapsed" onclick="toggleSet(${ei}, ${i})" title="Naciśnij, aby wrócić do edycji">
                                                <div class="set-summary">
                                                    <span class="set-pill done">S${i + 1}</span>
                                                    <span class="set-summary-val">${s.kg ? window.Utils.formatNumberPL(parseFloat(s.kg)) : "—"} kg × ${s.reps || "—"}</span>
                                                    <span class="trend-badge">${ctx.getTrendUI(s, prev)}</span>
                                                    <span class="set-summary-check">✓</span>
                                                </div>
                                                ${prevTxt ? `<div class="set-summary-sub">↺ ${prevTxt}</div>` : ""}
                                            </div>
                                        `;
                                    }

                                    return `
                                        <div class="set-row ">
                                            <div class="set-top-row">
                                                <span class="set-pill ">S${i + 1}</span>
                                                ${goalReps ? `<span class="set-goal" title="Cel na dziś: ${goalReps} powtórzeń w serii">→ ${goalReps}</span>` : ""}

                                                <div class="input-group">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value="${s.kg || ""}"
                                                        placeholder="${kgPh || "0"}"
                                                        oninput="updateSet(${ei}, ${i}, 'kg', this.value)"
                                                    >
                                                    <span>KG</span>
                                                </div>

                                                <div class="input-group">
                                                    <input
                                                        type="number"
                                                        step="1"
                                                        value="${s.reps || ""}"
                                                        placeholder="${repsPh || "0"}"
                                                        oninput="updateSet(${ei}, ${i}, 'reps', this.value)"
                                                    >
                                                    <span>POW</span>
                                                </div>

                                                <button class="btn-check " onclick="toggleSet(${ei}, ${i})">✓</button>
                                            </div>

                                            <div class="set-bottom-row">
                                                <span class="prev-label">${prevTxt ? "↺ " + prevTxt : ""}</span>
                                                <span class="trend-badge">${ctx.getTrendUI(s, prev)}</span>
                                            </div>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        </div>
                    `;
                }).join("")}

                <div class="workout-footer">
                    <div style="text-align:center">
                        <span id="s-done" class="stat-val">${doneSets}</span>
                        <span class="stat-lab">Ukończone serie</span>
                    </div>
                    <div style="text-align:center">
                        <span id="s-pct" class="stat-val">${progressPct}%</span>
                        <span class="stat-lab">Postęp treningu</span>
                    </div>
                </div>
            </div>
        `;
    };

    const renderLibrary = (ctx) => {
        const screen = document.getElementById("screen-library");
        if (!screen) return;
        if (!window.ExerciseLib) {
            screen.innerHTML = '<div class="container"><div class="card"><p>Brak modułu biblioteki.</p></div></div>';
            return;
        }

        const U = window.Utils;
        const hadFocus = document.activeElement && document.activeElement.id === "lib-search-input";
        const detail = libSelectedId != null ? window.ExerciseLib.findById(libSelectedId) : null;

        screen.innerHTML = `
            <div class="container lib-page">
                <div class="header-block">
                    <div class="header-title">Ćwiczenia</div>
                    <div class="header-sub">Biblioteka ćwiczeń z ilustracjami</div>
                </div>
                ${detail ? renderLibDetail(detail, ctx) : renderLibBrowse(ctx)}
            </div>
        `;

        if (hadFocus) {
            const input = document.getElementById("lib-search-input");
            if (input) {
                input.focus();
                input.setSelectionRange(input.value.length, input.value.length);
            }
        }
    };

    const renderLibBrowse = (ctx) => {
        const U = window.Utils;
        const L = window.ExerciseLib;
        const categories = L.getCategories();

        const resultsHtml = libReady
            ? renderLibResults(ctx)
            : renderLibLoading(ctx);

        return `
            <div class="lib-search-row">
                <div class="lib-search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                    <input
                        id="lib-search-input"
                        type="search"
                        placeholder="Szukaj ćwiczenia…"
                        value="${U.escapeHtml(libQuery)}"
                        oninput="window.setLibQuery && setLibQuery(this.value)"
                        autocomplete="off"
                    />
                </div>
            </div>

            <div class="lib-chips">
                <button class="chip-btn ${libCategory === "all" ? "active" : ""}" onclick="setLibCategory('all')">Wszystkie</button>
                ${categories
                    .map(
                        (c) =>
                            `<button class="chip-btn ${libCategory === c.id ? "active" : ""}" onclick="setLibCategory('${c.id}')">${c.label}</button>`
                    )
                    .join("")}
            </div>

            ${resultsHtml}
        `;
    };

    const renderLibLoading = () => {
        if (libError) {
            return `
                <div class="lib-empty">
                    <div class="empty-ico">${miscIcon("wifiOff")}</div>
                    <div class="empty-txt">Nie udało się pobrać biblioteki ćwiczeń.<br/>Sprawdź połączenie z internetem.</div>
                    <button type="button" class="btn-secondary lib-retry" onclick="retryLoadLibrary()">Spróbuj ponownie</button>
                </div>
            `;
        }
        return `
            <div class="lib-loading">
                <div class="lib-spinner"></div>
                <div class="lib-loading-txt">Pobieranie biblioteki ćwiczeń…<br/><span class="lib-loading-sub">Pierwsze ładowanie może potrwać chwilę</span></div>
            </div>
        `;
    };

    const renderLibResults = (ctx) => {
        const U = window.Utils;
        const L = window.ExerciseLib;
        const userList = L.getUserPlanExercises(DAYS);
        const items = L.searchExercises(libQuery, libCategory, 300);
        const visible = items.slice(0, libItemLimit);

        if (!items.length) {
            return `<div class="lib-empty"><div class="empty-ico">${miscIcon("search")}</div><div class="empty-txt">Brak ćwiczeń dla tego zapytania.</div></div>`;
        }

        const listHtml = visible
            .map((ex) => {
                const match = L.matchUserExercise(ex, userList);
                const mine = match
                    ? `<div class="lib-mine"><span style="color:${match.user.dayColor}">●</span> ${match.user.dayLabel}</div>`
                    : "";
                return `
                    <button type="button" class="lib-item" onclick="openLibraryExercise('${ex.id}')">
                        <span class="lib-thumb">
                            <img src="${L.imgSrc(ex)}" alt="" loading="lazy" decoding="async" />
                        </span>
                        <span class="lib-item-main">
                            <span class="lib-item-name">${U.escapeHtml(ex.n)}</span>
                            <span class="lib-item-sub">${L.labelFor(ex.bp)} · ${L.equipmentLabel(ex.eq)}</span>
                        </span>
                        ${mine}
                        <span class="lib-item-arrow">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                        </span>
                    </button>
                `;
            })
            .join("");

        const moreBtn =
            items.length > libItemLimit
                ? `<button type="button" class="lib-more-btn" onclick="showMoreLib()">Pokaż więcej (${items.length - libItemLimit})</button>`
                : "";

        return `
            <div class="lib-count">${items.length} ćwiczeń</div>
            <div class="lib-list">
                ${listHtml}
            </div>
            ${moreBtn}
            <div class="lib-credits">Dane ćwiczeń: hasaneyldrm/exercises-dataset (opensource) • Media © gymvisual.com</div>
        `;
    };

    const renderLibDetail = (ex, ctx) => {
        const U = window.Utils;
        const S = window.StatsModule;
        const L = window.ExerciseLib;

        const catLabel = L.labelFor(ex.bp);
        const eqLabel = L.equipmentLabel(ex.eq);
        const target = (ex.tg || "")
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

        const userList = L.getUserPlanExercises(DAYS);
        const match = L.matchUserExercise(ex, userList);

        let ownBlock = "";
        if (match && S && ctx.state) {
            const history = S.getExerciseHistory(ctx.state, DAYS, match.user.name, ctx.getExerciseKey);
            if (history.length) {
                const values = history.map(
                    (h) => h.topWeight || (h.bestSet && h.bestSet.kg) || 0
                );
                const best = history.reduce((acc, h) => {
                    const kg = (h.bestSet && h.bestSet.kg) || h.topWeight || 0;
                    const reps = (h.bestSet && h.bestSet.reps) || 0;
                    if (!acc || kg > acc.kg || (kg === acc.kg && reps > acc.reps)) {
                        return { kg, reps };
                    }
                    return acc;
                }, null);

                const first = values[0] || 0;
                const last = values[values.length - 1] || 0;
                let deltaPct = 0;
                if (first > 0 && values.length >= 2) deltaPct = ((last - first) / first) * 100;

                let badgeClass = "flat";
                let badgeLabel = "—";
                if (values.length >= 2) {
                    if (deltaPct > 0.05) {
                        badgeClass = "up";
                        badgeLabel = "+" + Math.round(deltaPct) + "%";
                    } else if (deltaPct < -0.05) {
                        badgeClass = "down";
                        badgeLabel = Math.round(deltaPct) + "%";
                    } else {
                        badgeLabel = "0%";
                    }
                }

                const spark =
                    values.length > 1 && S.createSparklineSVG
                        ? S.createSparklineSVG(values, "#60a5fa").replace('class="pr-sparkline"', 'class="bw-chart"')
                        : "";

                const bestTxt = best ? `${U.formatNumberPL(best.kg)} kg × ${best.reps || "—"}` : "—";
                const est1RM = best && best.kg && best.reps ? Math.round(U.estimate1RM(best.kg, best.reps)) : null;

                ownBlock = `
                    <div class="lib-own">
                        <div class="lib-own-head">
                            <div>
                                <div class="lib-own-title">Twoje wyniki</div>
                                <div class="lib-own-sub"><span style="color:${match.user.dayColor}">●</span> ${match.user.name} · plan ${match.user.dayLabel}</div>
                            </div>
                            <div class="pr-badge ${badgeClass}">${badgeLabel}</div>
                        </div>
                        ${spark}
                        <div class="pr-foot">
                            <div class="pr-cell">
                                <span class="pr-cell-lab">Best set</span>
                                <span class="pr-cell-val">${bestTxt}</span>
                            </div>
                            <div class="pr-cell">
                                <span class="pr-cell-lab">1RM (est.)</span>
                                <span class="pr-cell-val">${est1RM ? est1RM + " kg" : "—"}</span>
                            </div>
                            <div class="pr-cell">
                                <span class="pr-cell-lab">Zapisów</span>
                                <span class="pr-cell-val">${history.length}</span>
                            </div>
                            <div class="pr-cell">
                                <span class="pr-cell-lab">Top kg</span>
                                <span class="pr-cell-val">${last ? U.formatNumberPL(last) : "—"}</span>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                ownBlock = `
                    <div class="lib-own-empty">
                        To ćwiczenie jest w Twoim planie (<span style="color:${match.user.dayColor}">${match.user.dayLabel}</span>).<br/>
                        Ukończ pierwszą serię, aby zobaczyć swoje wyniki.
                    </div>
                `;
            }
        }

        const steps =
            Array.isArray(ex.st) && ex.st.length
                ? `<div class="lib-steps">
                        <div class="lib-steps-title">Jak wykonać</div>
                        <ol class="lib-steps-list">${ex.st
                            .map((s) => `<li>${U.escapeHtml(s)}</li>`)
                            .join("")}</ol>
                   </div>`
                : "";

        const secondary = Array.isArray(ex.sm) && ex.sm.length
            ? `<div class="lib-tags">${ex.sm.slice(0, 3).map((s) => `<span class="tag-badge tag-soft">${U.escapeHtml(s)}</span>`).join("")}</div>`
            : "";

        return `
            <div class="lib-back-row">
                <button type="button" class="icon-btn" onclick="closeLibraryExercise()">←</button>
                <span class="lib-back-title">Biblioteka ćwiczeń</span>
            </div>

            <div class="lib-detail">
                <div class="lib-media ${libMediaPlaying ? "playing" : "paused"}" onclick="toggleLibMedia()">
                    <img id="lib-media-img" src="${libMediaPlaying ? L.gifSrc(ex) : L.imgSrc(ex)}" alt="${U.escapeHtml(ex.n)}" loading="lazy" decoding="async" />
                    <div class="lib-media-hint">${libMediaPlaying ? "Dotknij, aby zatrzymać" : "Dotknij, aby odtworzyć"}</div>
                </div>

                <div class="lib-detail-body">
                    <div class="lib-detail-name">${U.escapeHtml(ex.n)}</div>
                    <div class="lib-tags">
                        <span class="tag-badge tag-cat">${catLabel}</span>
                        <span class="tag-badge tag-target">${target || "—"}</span>
                        <span class="tag-badge tag-eq">${eqLabel}</span>
                    </div>
                    ${secondary}
                    ${ownBlock}
                    ${steps}
                </div>
            </div>
        `;
    };

    const setLibQuery = (v) => {
        libQuery = v;
        libItemLimit = 40;
    };

    const setLibCategory = (c) => {
        libCategory = c;
        libSelectedId = null;
        libItemLimit = 40;
    };

    const showMoreLib = () => {
        libItemLimit += 40;
    };

    const openLibraryExercise = (id) => {
        libSelectedId = id;
        libMediaPlaying = true;
    };

    const closeLibraryExercise = () => {
        libSelectedId = null;
    };

    const toggleLibMedia = () => {
        libMediaPlaying = !libMediaPlaying;
    };

    const TAG_OPTIONS = [
        "CORE", "CHEST", "BACK", "SHOULDER", "DELTS", "BICEPS", "TRICEPS",
        "LEGS", "QUADS", "HAM", "GLUTES", "CALVES", "TRAPS", "REAR", "FOREARMS"
    ];

    const DAY_COLORS = ["#ff3b30", "#ff9500", "#f5c518", "#2ec4b6", "#00b4d8", "#3b82f6", "#5e5ce6", "#9d4edd", "#ee5d9c", "#a2845e"];
    const DAY_ICONS = ["🔥", "💪", "🦵", "⚡"];

    const renderManage = (ctx) => {
        const screen = document.getElementById("screen-manage");
        if (!screen) return;
        const plan = (ctx && ctx.getManagePlan ? ctx.getManagePlan() : null);
        if (!plan || !plan.length) {
            screen.innerHTML = "";
            return;
        }

        const U = window.Utils;
        const profileLabel = (ctx && ctx.currentProfileName) || "Użytkownik";
        const daysHtml = plan.map((day, di) => {
            const exRows = day.exercises
                .map((ex, ei) => {
                    const tagOptions = TAG_OPTIONS.map(
                        (t) =>
                            `<option value="${t}" ${t === ex.tag ? "selected" : ""}>${t}</option>`
                    ).join("");

                    return `
                        <div class="mg-ex-row">
                            <div class="mg-ex-main">
                                <input
                                    class="mg-input mg-name"
                                    type="text"
                                    value="${U.escapeHtml(ex.name)}"
                                    aria-label="Nazwa ćwiczenia"
                                    oninput="manageEditField(${di}, ${ei}, 'name', this.value)"
                                />
                                <div class="mg-ex-meta">
                                    <span class="mg-meta-block">
                                        <input
                                            class="mg-input mg-num"
                                            type="number"
                                            min="1"
                                            max="30"
                                            value="${ex.sets}"
                                            oninput="manageEditField(${di}, ${ei}, 'sets', this.value)"
                                        />
                                        <span class="mg-meta-lab">serie</span>
                                    </span>
                                    <span class="mg-meta-block">
                                        <input
                                            class="mg-input mg-num"
                                            type="text"
                                            value="${U.escapeHtml(ex.reps)}"
                                            placeholder="8-12"
                                            oninput="manageEditField(${di}, ${ei}, 'reps', this.value)"
                                        />
                                        <span class="mg-meta-lab">powt.</span>
                                    </span>
                                    <select
                                        class="mg-input mg-tag"
                                        onchange="manageEditField(${di}, ${ei}, 'tag', this.value)"
                                    >${tagOptions}</select>
                                </div>
                            </div>
                            <div class="mg-ex-actions">
                                <button type="button" class="mg-icon-btn" onclick="manageMoveExercise(${di}, ${ei}, -1)" title="W górę">↑</button>
                                <button type="button" class="mg-icon-btn" onclick="manageMoveExercise(${di}, ${ei}, 1)" title="W dół">↓</button>
                                <button type="button" class="mg-icon-btn danger" onclick="manageRemoveExercise(${di}, ${ei})" title="Usuń">✕</button>
                            </div>
                        </div>
                    `;
                })
                .join("");

            return `
                <div class="card mg-day-card">
                    <div class="mg-day-header" style="--day-color:${day.color}">
                        <span class="mg-day-icon">${day.icon}</span>
                        <span class="mg-day-title">${day.name} · ${day.label}</span>
                        <span class="mg-day-count">${day.exercises.length} ćw.</span>
                    </div>
                    <div class="mg-day-style">
                        <div class="mg-style-row">
                            <span class="mg-style-lab">Kolor</span>
                            <div class="mg-color-list">
                                ${DAY_COLORS.map((c) =>
                                    `<button type="button" class="mg-color-swatch ${c === day.color ? "active" : ""}" style="background:${c}" onclick="manageEditDay(${di}, 'color', '${c}')" aria-label="Kolor ${c}"></button>`
                                ).join("")}
                            </div>
                        </div>
                        <div class="mg-style-row">
                            <span class="mg-style-lab">Ikona</span>
                            <div class="mg-icon-list">
                                ${DAY_ICONS.map((ic) =>
                                    `<button type="button" class="mg-icon-chip ${ic === day.icon ? "active" : ""}" onclick="manageEditDay(${di}, 'icon', '${ic}')" aria-label="Ikona ${ic}">${ic}</button>`
                                ).join("")}
                            </div>
                        </div>
                    </div>
                    ${exRows}
                    <button type="button" class="mg-add-btn" onclick="manageAddExercise(${di})">＋ Dodaj ćwiczenie</button>
                </div>
            `;
        }).join("");

        screen.innerHTML = `
            <div class="container mg-page">
                <div class="header-block">
                    <div class="header-title">Zarządzaj ćwiczeniami</div>
                    <div class="header-sub">Edycja dotyczy Twojego profilu (${profileLabel})</div>
                </div>
                ${daysHtml}
                <div class="mg-actions">
                    <button type="button" class="mg-btn ghost" onclick="manageResetPlan()">Przywróć domyślny plan</button>
                    <button type="button" class="mg-btn ghost" onclick="manageCancel()">Anuluj</button>
                    <button type="button" class="mg-btn primary" onclick="manageSave()">Zapisz</button>
                </div>
            </div>
        `;
    };

    const setLibraryLoaded = (ready, error) => {
        libReady = ready;
        libError = !!error;
    };

    const retryLoadLibrary = () => {
        libError = false;
    };

    return {
        renderHome,
        renderPlan,
        renderStats,
        renderWorkout,
        renderLibrary,
        renderManage,
        themePickerHTML: renderThemePicker,
        setLibQuery,
        setLibCategory,
        showMoreLib,
        openLibraryExercise,
        closeLibraryExercise,
        toggleLibMedia,
        setLibraryLoaded,
        retryLoadLibrary
    };
})();

window.renderNoteBtnLabel = (hasNote) =>
    (hasNote ? "Edytuj" : "Dodaj") + " notatkę";
