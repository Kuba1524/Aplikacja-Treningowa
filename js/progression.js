window.Progression = (() => {
    // System progresji: Double Progression / Reps-First (podwójna progresja w zakreślonym przedziale)
    // 1) Trzymasz ciężar i rośniesz w powtórzeniach do GÓRNEJ granicy zakresu.
    // 2) Dopiero gdy KAŻDA seria osiągnie górną granicę -> +2.5 kg i wracasz na dół zakresu.
    // Wszystkie funkcje są czyste (bez DOM), żeby dało się je testować i używać w wielu miejscach.

    const roundTo2_5 = (kg) => Math.round(kg / 2.5) * 2.5;

    // "6-10" / "6–10" / "8" -> {min, max}
    const parseRepRange = (raw = "") => {
        const txt = String(raw).trim().replace(/[–—]/g, "-");
        const parts = txt.split("-").map((x) => parseInt(x, 10));
        const nums = parts.filter((n) => Number.isFinite(n) && n > 0);
        if (parts.length >= 2 && nums.length === 2) {
            return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) };
        }
        if (nums.length === 1) {
            return { min: nums[0], max: nums[0] };
        }
        return { min: 8, max: 12 };
    };

    const isDoneSet = (s) => !!(s && s.done && Number(s.kg) > 0 && Number(s.reps) > 0);

    // Working weight = najcięższa zaliczona seria z poprzedniego tygodnia.
    const workingWeight = (prevSets) => {
        const done = (prevSets || []).filter(isDoneSet);
        if (!done.length) return null;
        return Math.max(...done.map((s) => Number(s.kg)));
    };

    // null = seria już osiągnęła (lub pobiła) górną granicę -> "utrzymaj",
    //        NIE pokazujemy celu liczbowego niższego niż faktyczny wynik.
    const targetRepsForSet = (prevSet, range, tier) => {
        if (tier === "increase") return range.min;
        if (tier === "first") return range.min;
        if (isDoneSet(prevSet)) {
            if (Number(prevSet.reps) >= range.max) return null; // już na górze — utrzymaj
            return Math.min(range.max, Math.max(range.min, Number(prevSet.reps) + 1));
        }
        return range.min;
    };

    // Główne wejście logiczne: plan dla ćwiczenia na dziś.
    // ex       -> { name, sets, reps } (reps w formacie "5-8")
    // prevSets -> array setów z poprzedniego tygodnia {kg, reps, done}
    // Zwraca { tier, workingKg, nextKg, range, reasons, targetReps[] }
    const computeExercisePlan = (ex, prevSets = []) => {
        const range = parseRepRange(ex && ex.reps);
        const setsCount = Math.max(1, Number(ex && ex.sets) || 1);
        const prevDone = (prevSets || []).filter(isDoneSet);

        const mk = (tier, workingKg, nextKg, reason, targets) => ({
            tier,
            workingKg,
            nextKg,
            range,
            reason,
            targets
        });

        if (!prevDone.length) {
            const targets = Array.from({ length: setsCount }, () => range.min);
            return mk(
                "first",
                null,
                null,
                "Pierwszy raz: dobierz ciężar, który pozwoli zrobić " +
                    range.min + "–" + range.max + " czystych powtórzeń.",
                targets
            );
        }

        const working = workingWeight(prevSets);
        const allTop = prevDone.every((s) => Number(s.reps) >= range.max);

        if (allTop) {
            const next = roundTo2_5(working + 2.5);
            const targets = Array.from({ length: setsCount }, () => range.min);
            return mk(
                "increase",
                working,
                next,
                "Górny zakres (" + range.max + " powt.) zaliczony w każdej serii. " +
                    "Dokładamy 2.5 kg do " + next + " kg i wracamy na dół zakresu: cel " + range.min + "+.", targets);
        }

        const targets = Array.from({ length: setsCount }, (_, i) =>
            targetRepsForSet((prevSets || [])[i], range, "catch-up") );
        const weakest = prevDone.length
            ? Math.min(...prevDone.map((s) => Number(s.reps)))
            : range.min;
        const reason =
            "Spróbuj dobić do " + range.max + " powtórzeń przy tym samym ciężarze (" + working + " kg). " +
            "Najsłabiej szło: " + weakest + " powt. Seria, która już jest na górze — po prostu utrzymaj. " +
            "Jeśli nie uda się dziś w każdej serii, to zupełnie normalne — cel zostaje na następny raz.";
        return mk("catch-up", working, working, reason, targets);
    };

    // Krótki status do wyświetlenia w aplikacji (bez treści tekstowej, tylko dane).
    const statusOf = (plan) => plan.tier; // 'first' | 'increase' | 'catch-up'

    return {
        parseRepRange,
        roundTo2_5,
        workingWeight,
        isDoneSet,
        computeExercisePlan,
        statusOf
    };
})();
