window.StorageModule = (() => {
    const STORAGE_KEY = "kuba_v11";

    const getUserId = () => {
        let userId = localStorage.getItem("user_id");
        if (!userId) {
            userId = "user_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
            localStorage.setItem("user_id", userId);
        }
        return userId;
    };

    const USER_ID = getUserId();

    const load = async (fallbackState) => {
        try {
            const doc = await db.collection("users").doc(USER_ID).get();

            if (doc.exists) {
                const data = doc.data();
                return data.state || fallbackState;
            }

            const localData = localStorage.getItem(STORAGE_KEY);
            if (localData) {
                return JSON.parse(localData);
            }

            return fallbackState;
        } catch (error) {
            console.error("❌ Błąd wczytywania:", error);

            const localData = localStorage.getItem(STORAGE_KEY);
            if (localData) {
                return JSON.parse(localData);
            }

            return fallbackState;
        }
    };

    const save = async (state) => {
        try {
            await db.collection("users").doc(USER_ID).set({
                state,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error("❌ Błąd zapisu Firebase:", error);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
    };

    return {
        STORAGE_KEY,
        USER_ID,
        load,
        save
    };
})();
