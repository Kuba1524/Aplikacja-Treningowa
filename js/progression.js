window.Progression = (() => {
    // System progresji: Double Progression / Reps-First (podwójna progresja w zakreślonym przedziale)
    // 1) Trzymasz ciężar i rośniesz w powtórzeniach do GÓRNEJ granicy zakresu.
    // 2) Dopiero gdy KAŻDA seria osiągnie górną granicę -> +2.5 kg i wracasz na dół zakresu.
    // Wszystkie funkcje są czyste (bez DOM), żeby dało się je testować i używać w wielu miejscach.

    const roundTo2_5 = (kg) => Math.round(kg / 2.5) * 2.5;

    const fmt = (n) => String(n).replace(".", ",");

    const pluralSets = (n) => (n === 1 ? "seria" : n >= 2 && n <= 4 ? "serie" : "serii");

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

    // Deterministic seed (po nazwie ćwiczenia), żeby komentarz nie brzmiał jak
    // ten sam szablon przy każdym ćwiczeniu, ale był stabilny w trakcie sesji.
    const seedOf = (s = "") => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return h;
    };
    const pick = (variants, seed) => variants[seed % variants.length];

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
    // Zwraca { tier, workingKg, nextKg, range, reason, targets[] }
    const computeExercisePlan = (ex, prevSets = []) => {
        const range = parseRepRange(ex && ex.reps);
        const setsCount = Math.max(1, Number(ex && ex.sets) || 1);
        const prevDone = (prevSets || []).filter(isDoneSet);
        const seed = seedOf(ex && ex.name);

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
            const reasons = [
                "Pierwszy raz z tym ćwiczeniem — dobierz ciężar, przy którym zrobisz " +
                    range.min + "–" + range.max + " czystych powtórzeń. Zapisz wynik jako bazę do następnego tygodnia.",
                "Nie ma jeszcze zapisów z poprzedniego tygodnia. Cel na dziś: trafić w " +
                    range.min + "–" + range.max + " powt. — lepiej lżej i dobić zakres, niż szarpać za ciężki ciężar."
            ];
            return mk("first", null, null, pick(reasons, seed), targets);
        }

        const working = workingWeight(prevSets);
        const allTop = prevDone.every((s) => Number(s.reps) >= range.max);

        if (allTop) {
            const next = roundTo2_5(working + 2.5);
            const targets = Array.from({ length: setsCount }, () => range.min);
            const reasons = [
                "Nowy ciężar roboczy (" + fmt(next) + " kg) — celuj w dolną granicę zakresu (" +
                    range.min + "–" + range.max + " powt.). Nie martw się, jeśli na start będzie ciężej niż zwykle — to normalne po progresie ciężaru.",
                "Górny zakres (" + range.max + " powt.) zaliczony w każdej z " + prevDone.length + " " + pluralSets(prevDone.length) +
                    ". Dokładamy 2.5 kg do " + fmt(next) + " kg i wracamy na dół zakresu: cel " + range.min + "+.",
                "Wszystkie serie dobiły " + range.max + " powt. przy " + fmt(working) + " kg. Czas na " + fmt(next) +
                    " kg — zaczynamy od nowa od " + range.min + "+ powtórzeń i znowu pniemy się w górę."
            ];
            return mk("increase", working, next, pick(reasons, seed), targets);
        }

        const targets = Array.from({ length: setsCount }, (_, i) =>
            targetRepsForSet((prevSets || [])[i], range, "catch-up") );

        // Rzeczywisty rozkład wyników z poprzedniego tygodnia, per seria.
        const perSetReps = (prevSets || []).map((s) => (isDoneSet(s) ? Number(s.reps) : null));
        const belowIdx = perSetReps.flatMap((r, i) => (r !== null && r < range.max ? [i] : []));
        const topCount = perSetReps.filter((r) => r !== null && r >= range.max).length;
        const allReps = perSetReps.filter((r) => r !== null);
        const allEqual = allReps.length > 0 && new Set(allReps).size === 1;

        let reason;
        if (allEqual) {
            const v = allReps[0];
            reason =
                "Wszystkie serie na równym poziomie (" + v + " powt.) — dziś celuj w " +
                Math.min(range.max, v + 1) + " w każdej z nich, przy tym samym ciężarze (" + fmt(working) + " kg).";
        } else if (belowIdx.length === 1) {
            const setNo = belowIdx[0] + 1;
            const r = perSetReps[belowIdx[0]];
            reason =
                "Prawie cały set na górnej granicy — zostaje dogonić tylko serię " + setNo +
                ", która była na " + r + " powt. (brak " + (range.max - r) + " do " + range.max + "). Ciężar " +
                fmt(working) + " kg bez zmian.";
        } else if (topCount === 0) {
            const list = belowIdx.map((i) => perSetReps[i]).join(", ");
            const targetsSame = belowIdx.every((i) => perSetReps[i] === perSetReps[belowIdx[0]]);
            reason = targetsSame
                ? "Żadna seria nie osiągnęła jeszcze górnej granicy (wszystkie na " + perSetReps[belowIdx[0]] +
                    " powt. przy " + fmt(working) + " kg). Dziś przynajmniej +1 powtórzenie w każdej z nich."
                : "Niejednolite wyniki (" + list + " powt.) przy " + fmt(working) +
                    " kg — żadna seria nie osiągnęła jeszcze górnej granicy. Dziś po +1 powtórzeniu w każdej z nich.";
        } else {
            const list = belowIdx.map((i) => perSetReps[i]).sort((a, b) => b - a).join(", ");
            const nBelow = belowIdx.length;
            const nAll = nBelow + topCount;
            reason =
                nBelow + " z " + nAll + " serii " +
                (nBelow === 1 ? "wymaga" : nBelow >= 2 && nBelow <= 4 ? "wymagają" : "wymaga") +
                " jeszcze +1 powtórzenia (były na " + list + " powt.), " + topCount + " " + pluralSets(topCount) +
                " już dobi" + (topCount === 1 ? "ła" : topCount >= 2 && topCount <= 4 ? "ły" : "ło") +
                " górną granicę (" + range.max +
                ") — utrzymaj te na górze, reszta ma pole do progresu. Ciężar " + fmt(working) + " kg bez zmian.";
        }
        return mk("catch-up", working, working, reason, targets);
    };

    // Podsumowanie treningu PO wykonaniu ćwiczenia — zamiast instrukcji sprzed.
    // Opisuje to, co się faktycznie wydarzyło (porównanie z poprzednim tygodniem).
    const summarizeCompleted = (ex, sets = [], prevSets = []) => {
        const range = parseRepRange(ex && ex.reps);
        const done = (sets || []).filter(isDoneSet);
        if (!done.length) return null;
        const total = done.length;

        let upRep = 0;
        let sameRep = 0;
        let downRep = 0;
        let fresh = 0;
        let newKg = 0;
        let allTop = true;

        done.forEach((s, i) => {
            const cKg = Number(s.kg);
            const cR = Number(s.reps);
            if (cR < range.max) allTop = false;
            const prev = (prevSets || [])[i];
            if (isDoneSet(prev)) {
                const pKg = Number(prev.kg);
                const pR = Number(prev.reps);
                if (cKg > pKg && cR >= range.min) newKg++;
                else if (cR > pR) upRep++;
                else if (cR === pR) sameRep++;
                else downRep++;
            } else {
                fresh++;
            }
        });

        if (allTop) {
            const next = roundTo2_5(workingWeight(sets) + 2.5);
            if (newKg) {
                return "Nowy ciężar (" + fmt(workingWeight(sets)) + " kg) zaliczony w każdej z " + total +
                    " serii, wszystkie domknięte na górnej granicy (" + range.max + " powt.) — następny krok: +2.5 kg (" +
                    fmt(next) + " kg) i znów od " + range.min + "+ powtórzeń.";
            }
            return "Wszystkie serie domknięte na górnej granicy (" + range.max + " powt.) — następny trening wchodzimy na " +
                fmt(next) + " kg, cel " + range.min + "+ powtórzeń.";
        }

        if (newKg) {
            return "W " + newKg + " z " + total + " serii wszedł nowy ciężar (" + fmt(workingWeight(sets)) +
                " kg), reszta została na poprzednim — do następnego treningu doprowadź wszystkie serie do " +
                range.max + " powt. przy nowym ciężarze.";
        }
        if (newKg || upRep || sameRep || downRep || fresh) {
            const parts = [];
            if (upRep) parts.push(upRep + " z " + total + " serii poszł" + (upRep === 1 ? "a" : upRep >= 2 && upRep <= 4 ? "y" : "o") + " w górę (+1 powt.)");
            if (fresh) parts.push(fresh + " z " + total + " serii bez wcześniejszego porównania");
            if (sameRep) parts.push(sameRep + " z " + total + " serii bez zmian");
            if (downRep) parts.push(downRep + " z " + total + " serii poniżej zeszłotygodniowego wyniku");
            return "Udało się: " + parts.join(", ") + " — ciężar zostaje, w górę pójdzie, gdy każda seria dojdzie do " +
                range.max + " powt.";
        }
        return "Wszystkie serie utrzymały poziom z poprzedniego tygodnia — stabilna, powtarzalna robota. Kolejny cel: " +
            "doprowadzić każdą serię do górnej granicy zakresu (" + range.max + " powt.).";
    };

    // Krótki status do wyświetlenia w aplikacji (bez treści tekstowej, tylko dane).
    const statusOf = (plan) => plan.tier; // 'first' | 'increase' | 'catch-up'

    return {
        parseRepRange,
        roundTo2_5,
        workingWeight,
        isDoneSet,
        computeExercisePlan,
        summarizeCompleted,
        statusOf
    };
})();
