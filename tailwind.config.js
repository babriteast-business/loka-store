/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				paper: '#F5F3EE',
				ink: '#1C2321',
				marigold: '#E7A93C',
				teal: '#1F4B4A',
				rust: '#B4552F',
				line: '#DCD8CC'
			},
			fontFamily: {
				display: ['Fraunces', 'serif'],
				body: ['"Work Sans"', 'sans-serif']
			}
		}
	},
	plugins: []
};
