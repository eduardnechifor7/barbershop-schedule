/** @type {import('tailwindcss').Config} */
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
        },
    },
    plugins: [
        require('flowbite/plugin')
    ],
}