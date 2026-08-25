window.StorageModule = (() => {
    const PROFILES = [
        {
            id: "user_rt8zi8glg_1787597563228",
            name: "Kuba",
            emoji: "💪"
        },
        {
            id: "user_u2x8glbug_1787607478584",
            name: "Bartek",
            emoji: "🏋️"
        }
    ];

    const PROFILE_KEY = "selected_profile_id";

    const isValidUserId = (userId) =>
        typeof userId === "string" && userId.length > 5;

    const getSelectedProfileId = () => {
        const id = localStorage.getItem(PROFILE_KEY);
        if (!isValidUserId(id)) return null;
        if (!PROFILES.some((p) => p.id === id)) return null;
        return id;
    };

    const setSelectedProfileId = (id) => {
        if (!isValidUserId(id)) return;
        localStorage.setItem(PROFILE_KEY, id);
        localStorage.setItem("user_id", id);
    };

    const clearSelectedProfile = () => {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem("user_id");
    };

    const getProfile = (id) => PROFILES.find((p) => p.id === id) || null;

    const storageKeyFor = (userId) => "kuba_v11_" + userId;

    const safeParse = (raw) => {
        if (!raw || raw === "undefined" || raw === "null") return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    };

    const load = async (userId, fallbackState) => {
        if (!isValidUserId(userId)) return fallbackState;

        try {
            const doc = await db.collection("users").doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                return data.state || fallbackState;
            }
            const local = safeParse(localStorage.getItem(storageKeyFor(userId)));
            return local || fallbackState;
        } catch (error) {
            console.error("Błąd wczytywania:", error);
            const local = safeParse(localStorage.getItem(storageKeyFor(userId)));
            return local || fallbackState;
        }
    };

    const save = async (userId, state) => {
        if (!isValidUserId(userId)) return;

        try {
            await db.collection("users").doc(userId).set(
                {
                    state: state,
                    profileName: (getProfile(userId) && getProfile(userId).name) || "",
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                { merge: true }
            );
            localStorage.setItem(storageKeyFor(userId), JSON.stringify(state));
        } catch (error) {
            console.error("Błąd zapisu Firebase:", error);
            localStorage.setItem(storageKeyFor(userId), JSON.stringify(state));
        }
    };

    return {
        PROFILES: PROFILES,
        getSelectedProfileId: getSelectedProfileId,
        setSelectedProfileId: setSelectedProfileId,
        clearSelectedProfile: clearSelectedProfile,
        getProfile: getProfile,
        load: load,
        save: save
    };
})();
