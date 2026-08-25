window.Views = (() => {
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
                <div class="header-block">
                    <div class="header-title">Kuba<span>Gym</span></div>
                    <div class="header-sub">${new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}</div>
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
                                <div class="today-icon">${todayPlan.icon}</div>
                                <div class="today-meta">
                                    <div class="today-kicker">Dzisiaj</div>
                                    <div class="today-title">${todayPlan.label}</div>
                                    <div class="today-sub">${todayPlan.name} • ${todayPlan.exercises.length} ćwiczeń</div>
                                </div>
                            </div>
                            <button class="btn-start" onclick="openDay(${todayPlan.id})">Start</button>
                        </div>
                    ` : `
                        <div class="today-card">
                            <div class="today-card-left">
                                <div class="today-icon">✓</div>
                                <div class="today-meta">
                                    <div class="today-kicker">Dzisiaj</div>
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
                                    <div class="stat-value">${weekSummary.pct}%</div>
                                </div>
                                <div class="stat-inline">${weekSummary.done}/${weekSummary.total}</div>
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
                                    return `
                                        <div class="day-plan-card" onclick="openDay(${day.id})">
                                            <div class="day-plan-left">
                                                <div class="day-plan-icon">${day.icon}</div>
                                                <div>
                                                    <div class="day-plan-title">${day.label}</div>
                                                    <div class="day-plan-sub">${day.name} • ${day.exercises.length} ćwiczeń</div>
                                                </div>
                                            </div>
                                            <div class="day-plan-right">
                                                <div class="day-plan-progress">${progress.done}/${progress.total}</div>
                                                <div class="day-plan-arrow">→</div>
                                            </div>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    const renderPlan = (ctx) => {
        const {
            state,
            currentWeekIndex,
            DAYS,
            getDayProgress
        } = ctx;
        const screen = document.getElementById("screen-plan");

        screen.innerHTML = `
            <div class="container">
                <div class="header-block">
                    <div class="header-title">Plan <span>Treningowy</span></div>
                    <div class="header-sub">Wybierz dzień i zapisuj progres</div>
                </div>

                <div class="tabs-row">
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

                <div class="day-list">
                    ${DAYS.map((day) => {
                        const progress = getDayProgress(day.id);
                        return `
                            <div class="card day-plan-card" onclick="openDay(${day.id})">
                                <div class="day-plan-left">
                                    <div class="day-plan-icon">${day.icon}</div>
                                    <div>
                                        <div class="day-plan-title">${day.label}</div>
                                        <div class="day-plan-sub">${day.name} • ${day.exercises.length} ćwiczeń</div>
                                    </div>
                                </div>
                                <div class="day-plan-right">
                                    <div class="day-plan-progress">${progress.done}/${progress.total} • ${progress.pct}%</div>
                                    <div class="day-plan-arrow">→</div>
                                </div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    };

    const renderStats = (ctx) => {
        const {
            state,
            DAYS,
            currentWeekIndex
        } = ctx;
        const screen = document.getElementById("screen-stats");
        if (!screen || !window.StatsModule) return;

        const totalWorkouts = window.StatsModule.getTotalWorkouts(state, DAYS, ctx.getExerciseKey);
        const monthWorkouts = window.StatsModule.getCurrentMonthWorkouts(
            state,
            DAYS,
            ctx.getExerciseKey,
            ctx.getDayTimestampKey
        );
        const streak = window.StatsModule.getWeekStreak(state, DAYS, ctx.getExerciseKey);
        const weekStats = window.StatsModule.getWeekStats(state, DAYS, currentWeekIndex, ctx.getExerciseKey);
        const prs = window.StatsModule.getPrimaryExercises(state, DAYS, ctx.getExerciseKey);

        const cal = window.StatsModule.getActivityCalendar ?
            window.StatsModule.getActivityCalendar(
                state,
                DAYS,
                ctx.getExerciseKey,
                ctx.getDayTimestampKey
            ) :
            {
                labels: [],
                rows: [],
                cols: 0,
                monthHeaders: [],
                currentCol: 0
            };

        const bw = window.StatsModule.getBodyWeightSeries ?
            window.StatsModule.getBodyWeightSeries(state, 48) :
            {
                values: [],
                last: null,
                delta: null,
                delta30: null
            };

        const monthHeadHtml = `
            <div class="cal-months" style="--cal-cols: ${Math.max(cal.cols, 1)}">
                <div></div>
                ${(cal.monthHeaders || [])
                    .map((m) => `<div class="cal-month-lab">${m || ""}</div>`)
                    .join("")}
            </div>`;

        const calRowsHtml = (cal.labels || [])
            .map((lab, ri) => {
                const cells = (cal.rows[ri] || [])
                    .map((lvl, ci) => {
                        const t = ci === cal.currentCol ? " today" : "";
                        return `<div class="cal-cell l${lvl}${t}" title="${lab} · tydz. ${ci + 1}"></div>`;
                    })
                    .join("");
                return `<div class="cal-lab">${lab}</div>${cells}`;
            })
            .join("");

        let bwSpark = "";
        if (bw.values && bw.values.length > 1 && window.StatsModule.createSparklineSVG) {
            bwSpark = window.StatsModule.createSparklineSVG(bw.values, "#22c55e");
            bwSpark = bwSpark.replace('class="pr-sparkline"', 'class="bw-chart"');
        }

        const delta = bw.delta;
        let deltaCls = "flat";
        let deltaTxt = "";
        if (typeof delta === "number") {
            if (delta > 0) {
                deltaCls = "up";
                deltaTxt = "↑ " + delta;
            } else if (delta < 0) {
                deltaCls = "down";
                deltaTxt = "↓ " + Math.abs(delta);
            } else {
                deltaTxt = "0";
            }
        }

        const d30 = bw.delta30;
        const d30Txt =
            typeof d30 === "number" ?
            `<span style="color:${d30 <= 0 ? "var(--success)" : "var(--danger)"}">${d30 > 0 ? "+" : ""}${d30} kg / 30d</span>` :
            "";

        const prHtml = (prs || [])
            .map((pr) => {
                const history = pr.history || [];
                const values = history.map((h) => h.topWeight || (h.bestSet && h.bestSet.kg) || 0);
                const first = values[0] || 0;
                const last = values[values.length - 1] || 0;
                let deltaPct = 0;
                if (first > 0 && values.length >= 2) {
                    deltaPct = ((last - first) / first) * 100;
                }

                let deltaClass = "flat";
                let deltaLabel = "—";
                if (values.length >= 2) {
                    if (deltaPct > 0) {
                        deltaClass = "";
                        deltaLabel = "+" + Math.round(deltaPct) + "%";
                    } else if (deltaPct < 0) {
                        deltaClass = "down";
                        deltaLabel = Math.round(deltaPct) + "%";
                    } else {
                        deltaLabel = "0%";
                    }
                }

                const best = history.reduce((acc, h) => {
                    const kg = (h.bestSet && h.bestSet.kg) || h.topWeight || 0;
                    const reps = (h.bestSet && h.bestSet.reps) || 0;
                    if (!acc || kg > acc.kg || (kg === acc.kg && reps > acc.reps)) {
                        return {
                            kg,
                            reps
                        };
                    }
                    return acc;
                }, null);

                const spark =
                    values.length > 1 && window.StatsModule.createSparklineSVG ?
                    window.StatsModule.createSparklineSVG(values, "#60a5fa") :
                    "";

                const bestTxt = best ?
                    best.kg + " kg × " + (best.reps || "—") :
                    "—";

                return `
                <div class="pr-card">
                    <div class="pr-card-top">
                        <div>
                            <div class="pr-name">${pr.name}</div>
                            <div class="pr-topw">Top weight: ${last || "—"} kg</div>
                        </div>
                        <div class="pr-delta ${deltaClass}">${deltaLabel}</div>
                    </div>
                    ${spark}
                    <div class="pr-foot">
                        <span>Best set: ${bestTxt}</span>
                        <span>${history.length} wpisów</span>
                    </div>
                </div>`;
            })
            .join("");

        screen.innerHTML = `
            <div class="container">
                <div class="header-block">
                    <div class="header-title">Stats</div>
                    <div class="header-sub">Progress & history</div>
                </div>

                <div class="stats-kpi-row">
                    <div class="stats-kpi">
                        <div class="stats-kpi-label">Workouts</div>
                        <div class="stats-kpi-value">${totalWorkouts}</div>
                        <div class="stats-kpi-sub">Łącznie ukończonych treningów</div>
                    </div>
                    <div class="stats-kpi">
                        <div class="stats-kpi-label">This month</div>
                        <div class="stats-kpi-value">${monthWorkouts}</div>
                        <div class="stats-kpi-sub">Treningi w tym miesiącu</div>
                    </div>
                    <div class="stats-kpi">
                        <div class="stats-kpi-label">Week streak</div>
                        <div class="stats-kpi-value">${streak}</div>
                        <div class="stats-kpi-sub">Tygodnie z aktywnością</div>
                    </div>
                    <div class="stats-kpi">
                        <div class="stats-kpi-label">Completed sets</div>
                        <div class="stats-kpi-value accent">${weekStats.completedSets}</div>
                        <div class="stats-kpi-sub">Serie w aktualnym tygodniu</div>
                    </div>
                </div>

                <div class="bw-card">
                    <div class="bw-top">
                        <div class="bw-title">Body weight</div>
                        <button type="button" class="bw-log-btn" onclick="document.getElementById('bw-form').classList.toggle('open')">+ Log</button>
                    </div>
                    <div class="bw-main">
                        <div class="bw-value">${bw.last != null ? bw.last : "—"}</div>
                        <div class="bw-unit">kg</div>
                        ${deltaTxt ? `<div class="bw-delta ${deltaCls}">${deltaTxt}</div>` : ""}
                    </div>
                    <div style="font-size:12px;color:var(--text-dim);margin-bottom:4px">${d30Txt}</div>
                    ${bwSpark || ""}
                    <div id="bw-form" class="bw-form">
                        <input id="bw-input" class="bw-input" type="number" step="0.1" min="30" max="300" placeholder="np. 78.5" inputmode="decimal" />
                        <button type="button" class="bw-save" onclick="logBodyWeight(document.getElementById('bw-input').value)">Zapisz</button>
                    </div>
                </div>

                <div class="stats-section">
                    <div class="stats-section-head">
                        <div class="stats-section-title">Activity</div>
                        <div class="stats-section-sub">Dni treningowe · kolumny = tygodnie · jaśniejszy niebieski = więcej serii</div>
                    </div>
                    <div class="cal-wrap">
                        ${monthHeadHtml}
                        <div class="cal-grid" style="--cal-cols: ${Math.max(cal.cols, 1)}">
                            ${calRowsHtml || '<div class="cal-lab">—</div>'}
                        </div>
                    </div>
                    <div class="cal-legend">
                        <span>Less</span>
                        <div class="cal-cell"></div>
                        <div class="cal-cell l1"></div>
                        <div class="cal-cell l2"></div>
                        <div class="cal-cell l3"></div>
                        <div class="cal-cell l4"></div>
                        <span>More</span>
                    </div>
                </div>

                <div class="stats-section">
                    <div class="stats-section-head">
                        <div class="stats-section-title">Best Performance</div>
                        <div class="stats-section-sub">Kluczowe ćwiczenia i trend wyniku</div>
                    </div>
                    <div class="pr-grid">
                        ${prHtml || '<div class="pr-card"><div class="pr-name">Brak danych</div></div>'}
                    </div>
                </div>
            </div>
        `;
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

                    return `
                        <div class="exercise-card">
                            <div class="exercise-header">
                                <div class="exercise-title-wrap">
                                    <span class="tag-badge tag-${ex.tag}">${ex.tag}</span>
                                    <div class="exercise-main">
                                        <span class="ex-title">${ex.name}</span>
                                        <div class="ex-reps-range">Zakres: ${ex.sets} serie × ${ex.reps} powtórzeń</div>
                                    </div>
                                </div>
                                <div class="ex-circle">${sets.filter((s) => s.done).length}/${ex.sets}</div>
                            </div>

                            ${prevNote && prevNote.trim() ? `
                                <div class="history-note">
                                    <div class="history-note-label">Notatka z poprzedniego tygodnia</div>
                                    <div class="history-note-text">${window.Utils.escapeHtml(prevNote)}</div>
                                </div>
                            ` : ""}

                            <button id="note-toggle-${ei}" class="btn-note-toggle ${currentNote ? "active" : ""}" onclick="toggleNoteBox(${ei})">
                                ${currentNote ? "💬 Edytuj notatkę" : "💬 Dodaj notatkę"}
                            </button>

                            <div id="note-box-${ei}" class="note-box ${currentNote ? "" : "hidden"}">
                                <textarea
                                    class="note-input"
                                    rows="2"
                                    placeholder="Dodaj komentarz do ćwiczenia..."
                                    oninput="updateNote(${ei}, this.value)"
                                >${window.Utils.escapeHtml(currentNote)}</textarea>
                            </div>

                            <div class="sets-list">
                                ${sets.map((s, i) => {
                                    const prev = prevSets && prevSets[i] ? prevSets[i] : null;
                                    const prevTxt = prev && prev.done
                                        ? `${window.Utils.formatNumberPL(prev.kg)} kg × ${window.Utils.formatNumberPL(prev.reps)}`
                                        : "";

                                    return `
                                        <div class="set-row">
                                            <div class="set-top-row">
                                                <span class="set-pill">S${i + 1}</span>

                                                <div class="input-group">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value="${s.kg || ""}"
                                                        placeholder="0"
                                                        oninput="updateSet(${ei}, ${i}, 'kg', this.value)"
                                                    >
                                                    <span>KG</span>
                                                </div>

                                                <div class="input-group">
                                                    <input
                                                        type="number"
                                                        step="1"
                                                        value="${s.reps || ""}"
                                                        placeholder="0"
                                                        oninput="updateSet(${ei}, ${i}, 'reps', this.value)"
                                                    >
                                                    <span>POW</span>
                                                </div>

                                                <button class="btn-check ${s.done ? "done" : ""}" onclick="toggleSet(${ei}, ${i})">✓</button>
                                            </div>

                                            <div class="set-bottom-row">
                                                <span class="prev-label">${prevTxt}</span>
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

    return {
        renderHome,
        renderPlan,
        renderStats,
        renderWorkout
    };
})();
