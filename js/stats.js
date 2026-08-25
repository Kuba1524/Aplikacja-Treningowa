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
                if (!Number.isNaN(parsed.getTime())) date = parsed;
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
