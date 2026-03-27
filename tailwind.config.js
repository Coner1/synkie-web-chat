/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{ts,tsx}"
    ],
    important: '#synkie-chat-ext-root',

    darkMode: "class",

    corePlugins: {
        preflight: false
    },

    theme: {
        fontSize: {
            xs: ['12px', { lineHeight: '16px' }],
            sm: ['14px', { lineHeight: '20px' }],
            base: ['16px', { lineHeight: '24px' }],
            lg: ['18px', { lineHeight: '28px' }],
            xl: ['20px', { lineHeight: '28px' }],
            '2xl': ['24px', { lineHeight: '32px' }],
            '3xl': ['30px', { lineHeight: '36px' }],
            '4xl': ['36px', { lineHeight: '40px' }],
            '5xl': ['48px', { lineHeight: '1' }],
            '6xl': ['60px', { lineHeight: '1' }],
            '7xl': ['72px', { lineHeight: '1' }],
            '8xl': ['96px', { lineHeight: '1' }],
            '9xl': ['128px', { lineHeight: '1' }],
        },
        spacing: {
            px: "1px",
            0: "0px",
            '0.5': "2px",
            1: "4px",
            '1.5': "6px",
            2: "8px",
            '2.5': "10px",
            3: "12px",
            '3.5': "14px",
            4: "16px",
            5: "20px",
            6: "24px",
            8: "32px",
            9: "36px",
            10: "40px",
            11: "44px",
            12: "48px",
            14: "56px",
            16: "64px",
            20: "80px",
            24: "96px",
            28: "94px",
            32: "112px",
            64: "256px"
        },

        borderRadius: {
            sm: "2px",
            DEFAULT: "4px",
            md: "6px",
            lg: "8px",
            xl: "12px",
            '2xl': "16px",
            '3xl': "24px",
            full: "9999px"
        },
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                }
            },

            animation: {
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'fade-in': 'fadeIn 0.2s ease-in',
            },

            keyframes: {
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: 0 },
                    '100%': { transform: 'translateX(0)', opacity: 1 },
                },

                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                }
            }
        },
    },

    plugins: [],
}
