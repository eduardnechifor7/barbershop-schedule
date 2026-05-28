/** @type {import('tailwindcss').Config} */
import flowbitePlugin from 'flowbite/plugin'; // Folosește import în loc de require

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "node_modules/flowbite-react/lib/esm/**/*.js",
    ],
    theme: {
        extend: {
            colors: {
                brandGold: '#D4AF37',
                darkBg: '#1A1A1A',
                grayPc: '#828282'
            },
            keyframes: {
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out forwards',
                'scale-up': 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'screen-in': 'slideUp 0.3s ease-out forwards',
                'error-shake': 'shake 0.2s ease-in-out 0s 2',
            },
        },
    },
    plugins: [
        flowbitePlugin
    ],
}