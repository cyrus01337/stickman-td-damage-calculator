import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
    base: "stickman-td-damage-calculator",
    integrations: [react({ include: ["./src/components/*"] })],
    server: {
        port: 3000,
        host: true,
    },
    site: "https://cyrus01337.github.io",
    vite: {
        plugins: [tailwindcss()],
    },
});
