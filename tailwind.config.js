import daisyUI from "daisyui";
import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    darkMode: ["selector", "[data-theme='dark']"],
    daisyui: {
        themes: ["light", "dark"],
    },
    theme: {
        container: {
            center: true,
            padding: "2rem",
        },
        extend: {
            fontFamily: {
                sans: ["Inter Tight Variable", ...defaultTheme.fontFamily.sans],
            },
        },
        screens: {
            "2xl": { max: "1535px" },
            xl: { max: "1279px" },
            lg: { max: "1023px" },
            md: { max: "767px" },
            sm: { max: "639px" },
        },
    },
    plugins: [daisyUI],
};
