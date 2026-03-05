/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                coral: {
                    50: '#FFF5F2',
                    100: '#FFF0EB',
                    200: '#F5C9BC',
                    300: '#FF9A7A',
                    400: '#E57D61',
                    500: '#D4664A',
                    600: '#B84E34',
                    700: '#8B3A27',
                },
            },
            fontFamily: {
                display: ['Fraunces', 'serif'],
                body: ['DM Sans', 'sans-serif'],
            }
        }
    }
}
