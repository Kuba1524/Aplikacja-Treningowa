window.AuthModule = (() => {
    const DOMAIN = "@kubagym.app";
    const fbAuth = firebase.auth();

    let currentUser = null;
    let emitted = false;
    const pendingReady = [];

    fbAuth.onAuthStateChanged((user) => {
        currentUser = user;
        if (!emitted) {
            emitted = true;
            pendingReady.forEach((resolve) => resolve(user));
            pendingReady.length = 0;
        }
    });

    try {
        fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    } catch (e) {
        /* domyślnie LOCAL */
    }

    const emailFor = (username) =>
        String(username || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "") + DOMAIN;

    const isUsernameValid = (username) =>
        /^[a-z0-9_]{3,20}$/i.test(String(username || "").trim());

    const isPasswordValid = (password) => (password || "").length >= 6;

    const onReady = () =>
        emitted
            ? Promise.resolve(currentUser)
            : new Promise((resolve) => pendingReady.push(resolve));

    const register = async (username, password) => {
        if (!isUsernameValid(username)) {
            throw new Error("Nazwa użytkownika: 3-20 znaków (litery, cyfry, _)");
        }
        if (!isPasswordValid(password)) {
            throw new Error("Hasło musi mieć co najmniej 6 znaków");
        }
        const cred = await fbAuth.createUserWithEmailAndPassword(emailFor(username), password);
        return cred.user;
    };

    const login = async (username, password) => {
        if (!username || !password) {
            throw new Error("Podaj nazwę użytkownika i hasło");
        }
        const cred = await fbAuth.signInWithEmailAndPassword(emailFor(username), password);
        return cred.user;
    };

    const logout = async () => fbAuth.signOut();

    const getCurrentUser = () => currentUser;

    return {
        onReady,
        register,
        login,
        logout,
        getCurrentUser,
        emailFor,
        DOMAIN
    };
})();