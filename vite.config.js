import { defineConfig } from "vite";

export default defineConfig({
    server: {
        port: 5173,
        open: false
    },
    build: {
        target: "ES2020",
        outDir: "dist",
        assetsDir: "assets"
    }
});