window.StatsModule = (() => {
    const getWeekStats = (state, DAYS, weekIndex, getExerciseKey) => {
        const weekData = state.weeks[weekIndex] || {};
        let completedSets = 0;
        let activeDays = 0;
        let totalReps = 0;

        DAYS.forEach((day) => {
            let dayHasActivity = false;

            day.exercises.forEach((ex, ei) => {
                const key = getExerciseKey(day.id, ei);
                const sets = weekData[key] || [];

                sets.forEach((set) => {
                    if (set.done) {
                        completedSets++;
                        totalReps += Number(set.reps) || 0;
                        dayHasActivity = true;
                    }
                });
            });

            if (dayHasActivity) activeDays++;
        });

        return {
            completedSets,
            activeDays,
            totalReps
        };
    };

    const getTotalWorkouts = (state, DAYS, getExerciseKey) => {
        let total = 0;

        state.weeks.forEach((weekData) => {
            DAYS.forEach((day) => {
                let has = false;

                day.exercises.forEach((ex, ei) => {
                    const key = getExerciseKey(day.id, ei);
                    const sets = weekData[key] || [];
                    if (sets.some((s) => s.done)) has = true;
                });

                if (has) total++;
            });
        });

        return total;
    };

    const getCurrentMonthWorkouts = (state, DAYS, getExerciseKey, getDayTimestampKey) => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        let total = 0;

        state.weeks.forEach((weekData, weekIndex) => {
            DAYS.forEach((day) => {
                let has = false;

                day.exercises.forEach((ex, ei) => {
                    const key = getExerciseKey(day.id, ei);
                    const sets = weekData[key] || [];
                    if (sets.some((s) => s.done)) has = true;
                });

                if (!has) return;

                let date = null;
                const ts = weekData[getDayTimestampKey(day.id)];

                if (ts) {
                    const parsed = new Date(ts);
                    if (!Number.isNaN(parsed.getTime())) {
                        date = parsed;
                    }
                }

                if (!date && state.startSunday) {
                    const base = new Date(state.startSunday + weekIndex * 7 * 24 * 60 * 60 * 1000);
                    base.setDate(base.getDate() + day.weekday);
                    date = base;
                }

                if (!date) return;

                if (date.getMonth() === month && date.getFullYear() === year) {
                    total++;
                }
            });
        });

        return total;
    };

    const getWeekStreak = (state, DAYS, getExerciseKey) => {
        let streak = 0;
        if (!state || !Array.isArray(state.weeks)) return 0;
    
        for (let i = state.weeks.length - 1; i >= 0; i--) {
            const weekData = state.weeks[i];
            if (!weekData || typeof weekData !== "object") break;
    
            let hasWeekActivity = false;
    
            DAYS.forEach((day) => {
                (day.exercises || []).forEach((ex, ei) => {
                    const key = getExerciseKey(day.id, ei);
                    const sets = weekData[key] || [];
                    if (sets.some((s) => s && s.done)) {
                        hasWeekActivity = true;
                    }
                });
            });
    
            if (hasWeekActivity) streak++;
            else break;
    }

    return streak;
};

    const getExerciseHistory = (state, DAYS, exerciseName, getExerciseKey, getDayTimestampKey) => {
        const history = [];

        state.weeks.forEach((weekData, weekIndex) => {
            DAYS.forEach((day) => {
                day.exercises.forEach((ex, ei) => {
                    if (ex.name !== exerciseName) return;

                    const key = getExerciseKey(day.id, ei);
                    const sets = weekData[key] || [];

                    let bestSet = null;
                    let topWeight = 0;
                    let totalReps = 0;
                    let doneSets = 0;

                    sets.forEach((set) => {
                        if (!set.done) return;

                        doneSets++;
                        totalReps += Number(set.reps) || 0;

                        const kg = Number(set.kg) || 0;
                        const reps = Number(set.reps) || 0;

                        if (
                            !bestSet ||
                            kg > bestSet.kg ||
                            (kg === bestSet.kg && reps > bestSet.reps)
                        ) {
                            bestSet = { kg, reps };
                        }

                        if (kg > topWeight) {
                            topWeight = kg;
                        }
                    });

                    if (doneSets > 0) {
                        let ts = null;
                        if (getDayTimestampKey) {
                            const raw = weekData[getDayTimestampKey(day.id)];
                            const parsed = raw ? new Date(raw) : null;
                            if (parsed && !Number.isNaN(parsed.getTime())) ts = parsed.getTime();
                        }
                        if (!ts && state.startSunday) {
                            ts = state.startSunday + weekIndex * 7 * 24 * 60 * 60 * 1000 + (day.weekday || 0) * 24 * 60 * 60 * 1000;
                        }

                        history.push({
                            weekIndex,
                            bestSet,
                            topWeight,
                            totalReps,
                            doneSets,
                            ts
                        });
                    }
                });
            });
        });

        return history.sort((a, b) => a.weekIndex - b.weekIndex);
    };

    const getPrimaryExercises = (state, DAYS, getExerciseKey, getDayTimestampKey) => {
        const preferred = [
            "Bench Press",
            "Weighted Pull Ups",
            "Hip Thrust",
            "RDL",
            "Incline Dumbbell Press",
            "Incline Smith Machine Press",
            "Hack Squat / Leg Press"
        ];

        return preferred
            .map((name) => ({
                name,
                history: getExerciseHistory(state, DAYS, name, getExerciseKey, getDayTimestampKey)
            }))
            .filter((item) => item.history.length > 0)
            .slice(0, 4);
    };

    // Ćwiczenia, w których nie nastąpił postęp sesja-do-sesji przez `minStreak`
    // lub więcej kolejnych wykonanych sesji. Sesja jest "bez zmian", gdy ciężar
    // roboczy jest TAKI SAM jak w poprzedniej sesji ORAZ suma powtórzeń nie
    // wzrosła (żadna seria nie zrobiła więcej powtórzeń). Wzrost ciężaru lub
    // suma powtórzeń = progres i resetuje licznik. Dla ćwiczeń z masą własną
    // (ciężar zawsze 0) liczy się wyłącznie suma powtórzeń.
    const getStagnantExercises = (state, DAYS, getExerciseKey, minStreak = 4) => {
        const isBodyweight = (history) =>
            history.length > 0 &&
            history.every((h) => !(h.bestSet && h.bestSet.kg > 0) && !(h.topWeight > 0));

        // Zwraca true, jeśli sesja `cur` nie zrobiła postępu względem `prev`.
        const stagnant = (prev, cur) => {
            if (!prev || !cur) return true;
            const prevW = (prev.topWeight && prev.topWeight > 0) ? prev.topWeight : 0;
            const curW = (cur.topWeight && cur.topWeight > 0) ? cur.topWeight : 0;
            // Zmiana ciężaru (w górę lub w dół) = nie jest to "brak zmian".
            if (curW !== prevW) return false;
            // Ten sam ciężar: stagnuje tylko, gdy suma powtórzeń nie wzrosła.
            return (prev.totalReps || 0) >= (cur.totalReps || 0);
        };

        const seen = new Set();
        const result = [];

        (DAYS || []).forEach((day) => {
            (day.exercises || []).forEach((ex) => {
                if (seen.has(ex.name)) return;
                seen.add(ex.name);

                const history = getExerciseHistory(state, DAYS, ex.name, getExerciseKey);
                const bodyweight = isBodyweight(history);
                if (history.length < minStreak) return;

                let transitions = 0;
                for (let i = history.length - 1; i >= 1; i--) {
                    if (stagnant(history[i - 1], history[i])) transitions++;
                    else break;
                }
                if (!transitions) return;
                const streak = transitions + 1;
                if (streak < minStreak) return;

                const last = history[history.length - 1];
                result.push({
                    name: ex.name,
                    tag: ex.tag,
                    streak,
                    kg: (last.bestSet && last.bestSet.kg) || last.topWeight || 0,
                    reps: (last.bestSet && last.bestSet.reps) || 0,
                    bodyweight,
                    sessions: history.length
                });
            });
        });

        return result.sort((a, b) => b.streak - a.streak || a.name.localeCompare(b.name));
    };

    // Tygodniowa objętość (liczba serii) wg partii mięśniowej z aktualnego planu.
    const getWeeklyVolume = (DAYS) => {
        const map = {};
        (DAYS || []).forEach((day) => {
            (day.exercises || []).forEach((ex) => {
                const tag = String(ex.tag || "OTHER").trim().toUpperCase() || "OTHER";
                map[tag] = (map[tag] || 0) + (Number(ex.sets) || 0);
            });
        });
        return Object.keys(map)
            .map((tag) => ({ tag, sets: map[tag] }))
            .sort((a, b) => b.sets - a.sets || a.tag.localeCompare(b.tag));
    };

    // Ostatni rekord (najwyższy kg, przy równości — powtórzenia) + data jego ustanowienia.
    const getLastPR = (history) => {
        if (!Array.isArray(history) || !history.length) return null;
        let kg = 0;
        let reps = 0;
        let ts = null;
        let idx = 0;
        history.forEach((h, i) => {
            const hkg = (h.bestSet && h.bestSet.kg) || 0;
            const hr = (h.bestSet && h.bestSet.reps) || 0;
            if (hkg > kg || (hkg === kg && hr > reps)) {
                kg = hkg;
                reps = hr;
                ts = h.ts || null;
                idx = i;
            }
        });
        return { kg, reps, ts, sessionsAgo: history.length - 1 - idx };
    };

    const getProgressPercent = (history) => {
        if (!history || history.length < 2) return 0;

        const first = history[0]?.bestSet?.kg || 0;
        const last = history[history.length - 1]?.bestSet?.kg || 0;

        if (!first || !last) return 0;

        return Math.round(((last - first) / first) * 100);
    };

    const getActivityCells = (state, DAYS, getExerciseKey) => {
        const values = [];

        state.weeks.forEach((weekData) => {
            DAYS.forEach((day) => {
                let done = 0;

                day.exercises.forEach((ex, ei) => {
                    const key = getExerciseKey(day.id, ei);
                    const sets = weekData[key] || [];
                    done += sets.filter((s) => s.done).length;
                });

                values.push(done);
            });
        });

        const last = values.slice(-84);

        return last.map((v) => {
            if (v === 0) return 0;
            if (v <= 3) return 1;
            if (v <= 6) return 2;
            if (v <= 10) return 3;
            return 4;
        });
    };

    const createSparklineSVG = (values, color = "#60a5fa") => {
        const width = 280;
        const height = 64;
        const padX = 6;
        const padY = 8;
    
        if (!values || !values.length) {
            return `<svg class="pr-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"></svg>`;
        }
    
        const nums = values.map((v) => Number(v) || 0);
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const range = max - min || 1;
    
        const pts = nums.map((v, i) => {
            const x = padX + (i * (width - padX * 2)) / Math.max(nums.length - 1, 1);
            const y = height - padY - ((v - min) / range) * (height - padY * 2);
            return [x, y];
        });
    
        const line = pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
        const area =
            padX + "," + (height - padY) + " " +
            line + " " +
            (width - padX) + "," + (height - padY);
    
        const last = pts[pts.length - 1];
    
        return `
            <svg class="pr-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
                        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                <polygon fill="url(#sparkFill)" points="${area}"></polygon>
                <polyline
                    fill="none"
                    stroke="${color}"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    points="${line}"
                ></polyline>
                <circle cx="${last[0]}" cy="${last[1]}" r="4" fill="${color}"></circle>
                <circle cx="${last[0]}" cy="${last[1]}" r="7" fill="${color}" fill-opacity="0.25"></circle>
            </svg>
        `;
    };

    const getActivityCalendar = (state, DAYS, getExerciseKey, getDayTimestampKey, maxCols = 28) => {
        const weeks = Array.isArray(state.weeks) ? state.weeks : [];
        const trainDays = (DAYS || []).filter((d) => d && typeof d.weekday === "number");
        const dayNames = ["ND", "PN", "WT", "ŚR", "CZ", "PT", "SB"];
        const monthShort = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];
    
        const colsLimit = Math.max(4, Math.min(28, Number(maxCols) || 28));
        const startIdx = Math.max(0, weeks.length - colsLimit);
        const slice = weeks.slice(startIdx);
        const cols = slice.length;
    
        const labels = trainDays.map((d) => dayNames[d.weekday] || "?");
    
        const colDates = slice.map((_, i) => {
            const wi = startIdx + i;
            if (!state.startSunday) return null;
            return new Date(state.startSunday + wi * 7 * 24 * 60 * 60 * 1000);
        });
    
        const monthHeaders = colDates.map((d, i) => {
            if (!d) return "";
            if (i === 0) return monthShort[d.getMonth()];
            const prev = colDates[i - 1];
            if (!prev) return monthShort[d.getMonth()];
            if (prev.getMonth() !== d.getMonth() || prev.getFullYear() !== d.getFullYear()) {
                return monthShort[d.getMonth()];
            }
            return "";
        });
    
        const levelFromDone = (done) => {
            if (done <= 0) return 0;
            if (done <= 4) return 1;
            if (done <= 10) return 2;
            if (done <= 18) return 3;
            return 4;
        };
    
        const rows = trainDays.map((day) => {
            return slice.map((weekData) => {
                if (!weekData || typeof weekData !== "object") return 0;
                let done = 0;
                (day.exercises || []).forEach((ex, ei) => {
                    const key = getExerciseKey(day.id, ei);
                    const sets = weekData[key] || [];
                    done += sets.filter((s) => s && s.done).length;
                });
                return levelFromDone(done);
            });
        });
    
        const currentCol = Math.min(
            Math.max((state.currentWeekIndex || 0) - startIdx, 0),
            Math.max(cols - 1, 0)
        );
    
        return {
            labels,
            rows,
            cols,
            monthHeaders,
            currentCol,
            startIdx
        };
    };

    const getBodyWeightSeries = (state, limit = 40) => {
        const list = Array.isArray(state.bodyWeight) ? state.bodyWeight.slice() : [];
        list.sort((a, b) => (a.ts || 0) - (b.ts || 0));
        const sliced = list.slice(-limit);
        const values = sliced.map((x) => Number(x.kg) || 0);
        const last = sliced.length ? Number(sliced[sliced.length - 1].kg) || null : null;
        const prev = sliced.length > 1 ? Number(sliced[sliced.length - 2].kg) || null : null;
        let delta = null;
        if (last !== null && prev !== null) delta = Math.round((last - prev) * 10) / 10;

        let delta30 = null;
        if (last !== null && sliced.length) {
            const now = sliced[sliced.length - 1].ts || Date.now();
            const target = now - 30 * 24 * 60 * 60 * 1000;
            let closest = null;
            sliced.forEach((x) => {
                if (x.ts <= target) closest = x;
            });
            if (closest) delta30 = Math.round((last - Number(closest.kg)) * 10) / 10;
        }

        return { values, last, delta, delta30, entries: sliced };
    };

    // Wykres wagi: linia surowych pomiarów (dziennych) + średnia krocząca.
    // Średnia liczona na powtórzeniach dziennych (średnia z pomiarów danego dnia),
    // okno: min(7 dni, liczba dostępnych dni).
    const createWeightChartSVG = (entries = []) => {
        const width = 280;
        const height = 64;
        const padX = 6;
        const padY = 8;

        const sorted = entries
            .slice()
            .filter((e) => e && e.ts && Number(e.kg) > 0)
            .sort((a, b) => (a.ts || 0) - (b.ts || 0));

        if (sorted.length < 2) {
            return `<svg class="bw-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"></svg>`;
        }

        const dayKeyOf = (ts) => {
            const d = new Date(ts);
            return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
        };

        const days = [];
        const byDay = new Map();
        sorted.forEach((e) => {
            const k = dayKeyOf(e.ts);
            if (!byDay.has(k)) {
                byDay.set(k, []);
                days.push(k);
            }
            byDay.get(k).push(Number(e.kg));
        });

        const daily = days.map((k) => {
            const arr = byDay.get(k);
            return arr.reduce((sum, v) => sum + v, 0) / arr.length;
        });

        const windowN = Math.min(7, daily.length);
        const avg = daily.map((_, i) => {
            const start = Math.max(0, i - windowN + 1);
            let sum = 0;
            for (let j = start; j <= i; j++) sum += daily[j];
            return sum / (i - start + 1);
        });

        const all = daily.concat(avg);
        const min = Math.min(...all);
        const max = Math.max(...all);
        const range = max - min || 1;

        const n = daily.length;
        const pt = (i, v) => {
            const x = padX + (i * (width - padX * 2)) / Math.max(n - 1, 1);
            const y = height - padY - ((v - min) / range) * (height - padY * 2);
            return x.toFixed(1) + "," + y.toFixed(1);
        };

        const rawPts = daily.map((v, i) => pt(i, v)).join(" ");
        const avgPts = avg.map((v, i) => pt(i, v)).join(" ");
        const lastPt = pt(n - 1, avg[n - 1]).split(",");
        const lastX = lastPt[0];
        const lastY = lastPt[1];

        return `
            <svg class="bw-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                <polyline class="bw-line-raw" points="${rawPts}"></polyline>
                <polyline class="bw-line-avg" points="${avgPts}"></polyline>
                <circle class="bw-dot-avg" cx="${lastX}" cy="${lastY}" r="3"></circle>
            </svg>
        `;
    };

    return {
        getWeekStats,
        getTotalWorkouts,
        getCurrentMonthWorkouts,
        getWeekStreak,
        getPrimaryExercises,
        getProgressPercent,
        getActivityCells,
        createSparklineSVG,
        getActivityCalendar,
        getBodyWeightSeries,
        getStagnantExercises,
        getWeeklyVolume,
        getLastPR,
        getExerciseHistory,
        createWeightChartSVG
    };
})();
