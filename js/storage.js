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

    const getSelectedProfileId = () => localStorage.getItem(PROFILE_KEY);

    const setSelectedProfileId = (id) => {
        localStorage.setItem(PROFILE_KEY, id);
        localStorage.setItem("user_id", id); // kompatybilność ze starym kodem
    };

    const clearSelectedProfile = () => {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem("user_id");
    };

    const getProfile = (id) => PROFILES.find((p) => p.id === id) || null;

    const storageKeyFor = (userId) => `kuba_v11_${userId}`;

    const load = async (userId, fallbackState) => {
        if (!userId) return fallbackState;

        try {
            const doc = await db.collection("users").doc(userId).get();

            if (doc.exists) {
                const data = doc.data();
                return data.state || fallbackState;
            }

            const localData = localStorage.getItem(storageKeyFor(userId));
            if (localData) return JSON.parse(localData);

            return fallbackState;
        } catch (error) {
            console.error("❌ Błąd wczytywania:", error);
            const localData = localStorage.getItem(storageKeyFor(userId));
            if (localData) return JSON.parse(localData);
            return fallbackState;
        }
    };

    const save = async (userId, state) => {
        if (!userId) return;

        try {
            await db.collection("users").doc(userId).set(
                {
                    state,
                    profileName: getProfile(userId)?.name || "",
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                },
                { merge: true }
            );
            localStorage.setItem(storageKeyFor(userId), JSON.stringify(state));
        } catch (error) {
            console.error("❌ Błąd zapisu Firebase:", error);
            localStorage.setItem(storageKeyFor(userId), JSON.stringify(state));
        }
    };

    return {
        PROFILES,
        getSelectedProfileId,
        setSelectedProfileId,
        clearSelectedProfile,
        getProfile,
        load,
        save
    };
})();
