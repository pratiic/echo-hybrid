module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "t-black": "#0F141A",
                "blue-one": "#edf5fd",
                "blue-two": "#9ACDF8",
                "blue-three": "#1C9BEF",
                "blue-four": "#428AD2",
                "gray-one": "#536471",
                "gray-two": "#e7e7e8",
                "gray-three": "#f7f9f9",
                "gray-four": "#f0f3f4",
                "gray-five": "#f7f7f7",
                "gray-six": "#efefef",
                "gray-seven": "#121212",
                "gray-eight": "#1E1E1E",
                "gray-nine": "#E2E2E2",
                "g-white": "#fcfcfc",
                "gray-ten": "#191919",
                "modal-light": "rgba(0,0,0,0.7)",
                "modal-dark": "rgba(255, 255, 255, 0.25)",
                "scrollbar-light": "rgba(0, 0, 0, 0.5)",
                "scrollbar-dark": "rgba(255, 255, 255, 0.5)",
            },
            gridTemplateColumns: {
                layout: "auto 1fr",
                list: "repeat(auto-fit, 16rem)",
                "list-sm": "repeat(auto-fit, 14rem)",
                "list-xs": "1fr 1fr",
                variants: "repeat(auto-fit, auto)",
            },
            scale: {
                103: "1.03",
            },
            keyframes: {
                alert: {
                    "0%": { transform: "scaleX(0)" },
                    "100%": { transform: "scaleX(1)" },
                },
                "categories-panel": {
                    "0%": { transform: "translateY(-100%)" },
                    "100%": { transform: "translateY(0%)" },
                },
                switch: {
                    "0%": { transform: "translateX(0px)" },
                    "35%": { transform: "translateX(20px)" },
                    "50%": { transform: "translateX(15px)" },
                    // "75%": { transform: "translateX(20px)" },
                    // "100%": { transform: "translateX(20px)" },
                },
                tooltip: {
                    "0%": { opacity: 0 },
                    "100%": { opacity: 1 },
                },
            },
            boxShadow: {
                card: "rgba(0, 0, 0, 0.06) 0px 2px 4px 0px inset",
            },
            screens: {
                1250: "1250px",
                1200: "1200px",
                1150: "1150px",
                1100: "1100px",
                1075: "1075px",
                1050: "1050px",
                1000: "1000px",
                900: "900px",
                875: "875px",
                850: "850px",
                800: "800px",
                750: "750px",
                700: "700px",
                650: "650px",
                600: "600px",
                550: "550px",
                500: "500px",
                450: "450px",
                400: "400px",
                350: "350px",
            },
            zIndex: {
                "70": "70",
                "100": "100",
            },
        },
    },
    plugins: [require("tailwind-scrollbar-hide")],
    darkMode: "class",
};
