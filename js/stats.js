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

    const getExerciseHistory = (state, DAYS, exerciseName, getExerciseKey) => {
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
                        history.push({
                            weekIndex,
                            bestSet,
                            topWeight,
                            totalReps,
                            doneSets
                        });
                    }
                });
            });
        });

        return history.sort((a, b) => a.weekIndex - b.weekIndex);
    };

    const getPrimaryExercises = (state, DAYS, getExerciseKey) => {
        const preferred = [
            "Bench Press",
            "Weighted Pull Ups",
            "Hip Thrust",
            "RDL",
            "Incline Dumbbell Press",
            "Hack Squat / Leg Press"
        ];

        return preferred
            .map((name) => ({
                name,
                history: getExerciseHistory(state, DAYS, name, getExerciseKey)
            }))
            .filter((item) => item.history.length > 0)
            .slice(0, 4);
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
        const width = 220;
        const height = 52;
        const padding = 4;

        if (!values.length) {
            return `<svg class="pr-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"></svg>`;
        }

        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const points = values.map((v, i) => {
            const x = padding + (i * (width - padding * 2)) / Math.max(values.length - 1, 1);
            const y = height - padding - ((v - min) / range) * (height - padding * 2);
            return [x, y];
        });

        const line = points.map((p) => p.join(",")).join(" ");

        return `
            <svg class="pr-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                <polyline
                    fill="none"
                    stroke="${color}"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    points="${line}"
                ></polyline>

                ${points.map((p, idx) => {
                    const last = idx === points.length - 1;
                    return `
                        <circle
                            cx="${p[0]}"
                            cy="${p[1]}"
                            r="${last ? 3.6 : 2.2}"
                            fill="${last ? color : "#94a3b8"}"
                        ></circle>
                    `;
                }).join("")}
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
        createSparklineSVG
    };
})();
