window.ExerciseLib = (() => {
    const DATA_URL =
        "https://raw.githubusercontent.com/arvids-unavailable/openGym/main/frontend/src/lib/exercises-data.js";
    const IMG_BASE =
        "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/";
    const GIF_BASE =
        "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/";
    const CACHE_KEY = "exercise_lib_v2";

    const CATEGORY_LABELS = {
        chest: "Klatka piersiowa",
        back: "Plecy",
        shoulders: "Barki",
        "upper arms": "Ramiona",
        "upper legs": "Uda",
        "lower legs": "Łydki",
        "lower arms": "Przedramiona",
        waist: "Brzuch i core",
        neck: "Kark",
        cardio: "Cardio",
        all: "Wszystkie"
    };

    const CATEGORY_ORDER = [
        "chest",
        "back",
        "shoulders",
        "upper arms",
        "upper legs",
        "lower legs",
        "lower arms",
        "waist",
        "neck",
        "cardio"
    ];

    const EQ_LABELS = {
        "body weight": "Masa ciała",
        dumbbell: "Hantle",
        barbell: "Sztanga",
        "olympic barbell": "Sztanga olimpijska",
        "ez barbell": "Sztanga łamana",
        cable: "Wyciąg",
        "leverage machine": "Maszyna",
        "smith machine": "Maszyna Smitha",
        kettlebell: "Kettlebell",
        band: "Taśma oporowa",
        "resistance band": "Taśma oporowa",
        "medicine ball": "Piłka lekarska",
        "stability ball": "Piłka gimnastyczna",
        rope: "Lina",
        "trap bar": "Sztanga trap",
        "wheel roller": "Koło do brzuszków",
        assisted: "Asysta",
        "bosu ball": "Piłka BOSU",
        "elliptical machine": "Orbitrek",
        hammer: "Młot",
        roller: "Rolka",
        "skierg machine": "Ergometr",
        "sled machine": "Sanki",
        "stationary bike": "Rower stacjonarny",
        "stepmill machine": "Stepmill",
        tire: "Opona",
        "upper body ergometer": "Ergometr górny",
        weighted: "Z obciążeniem"
    };

    let cached = null;
    let loadPromise = null;
    let lastError = null;

    const isReady = () => Array.isArray(cached);
    const getError = () => lastError;

    const findById = (id) => {
        if (!cached) return null;
        return cached.find((x) => x.id === id) || null;
    };

    const normalize = (str = "") =>
        String(str)
            .toLowerCase()
            .replace(/[^a-z0-9\u00e0-\u00ff]+/gi, " ")
            .trim();

    const imgSrc = (ex) => IMG_BASE + (ex.img || "");
    const gifSrc = (ex) => GIF_BASE + (ex.gif || "");

    const labelFor = (bp) =>
        CATEGORY_LABELS[bp] || (bp ? bp.charAt(0).toUpperCase() + bp.slice(1) : "Inne");

    const equipmentLabel = (eq) => EQ_LABELS[eq] || eq || "Brak";

    const parseData = (text) => {
        const body = String(text || "")
            .replace(/^export\s+const\s+EXDB\s*=\s*/, "")
            .replace(/;\s*$/, "")
            .trim();
        return JSON.parse(body);
    };

    const loadLibrary = () => {
        if (cached) return Promise.resolve(cached);

        if (loadPromise) return loadPromise;

        const fromLocal = (() => {
            try {
                const raw = localStorage.getItem(CACHE_KEY);
                if (raw) return JSON.parse(raw);
            } catch (e) {
                /* ignore */
            }
            return null;
        })();

        loadPromise = fetch(DATA_URL)
            .then((r) => {
                if (!r.ok) throw new Error("HTTP " + r.status);
                return r.text();
            })
            .then((text) => {
                const data = parseData(text);
                if (!Array.isArray(data) || !data.length) throw new Error("Pusta baza ćwiczeń");
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                } catch (e) {
                    /* za duże na localStorage – zostaje w pamięci */
                }
                cached = data;
                return data;
            })
            .catch((err) => {
                loadPromise = null;
                lastError = err;
                if (fromLocal) {
                    cached = fromLocal;
                    return cached;
                }
                throw err;
            });

        if (fromLocal) {
            cached = fromLocal;
        }

        return loadPromise;
    };

    const getCategories = () =>
        CATEGORY_ORDER.map((bp) => ({
            id: bp,
            label: CATEGORY_LABELS[bp]
        }));

    const searchExercises = (query = "", category = "all", limit = 200) => {
        if (!cached) return [];
        const q = normalize(query);

        const result = cached.filter((ex) => {
            if (category !== "all" && ex.bp !== category) return false;
            if (!q) return true;
            const haystack = normalize(
                ex.n + " " + (ex.tg || "") + " " + (ex.eq || "") + " " + (ex.bp || "")
            );
            return q.split(/\s+/).every((part) => haystack.includes(part));
        });

        return result.slice(0, limit);
    };

    const matchUserExercise = (libEx, userList) => {
        const name = normalize(libEx.n);
        if (!name) return null;

        let best = null;
        let bestScore = 0;

        userList.forEach((u) => {
            const un = normalize(u.name);
            if (!un) return;

            let score = 0;
            if (un === name) {
                score = 1;
            } else if (name.includes(un) || un.includes(name)) {
                score = 0.8;
            } else {
                const a = name.split(/\s+/).filter(Boolean);
                const b = un.split(/\s+/).filter(Boolean);
                if (a.length && b.length) {
                    const common = a.filter((x) => b.includes(x)).length;
                    const ratio = common / Math.max(a.length, b.length);
                    if (ratio > 0.5) score = ratio;
                }
            }

            if (score > bestScore) {
                bestScore = score;
                best = u;
            }
        });

        return best && bestScore >= 0.5 ? { user: best, score: bestScore } : null;
    };

    const getUserPlanExercises = (DAYS) => {
        const list = [];
        DAYS.forEach((day) => {
            (day.exercises || []).forEach((ex) => {
                list.push({
                    name: ex.name,
                    tag: ex.tag,
                    dayLabel: day.label,
                    dayColor: day.color
                });
            });
        });
        return list;
    };

    return {
        loadLibrary,
        getCategories,
        searchExercises,
        matchUserExercise,
        getUserPlanExercises,
        imgSrc,
        gifSrc,
        labelFor,
        equipmentLabel,
        normalize,
        isReady,
        findById,
        getError
    };
})();