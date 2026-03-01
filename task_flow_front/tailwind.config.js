import animate from 'tailwindcss-animate'

export default {
	darkMode: ['class'],
	content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
	theme: {
		extend: {
			colors: {
				background: '#fff',
				foreground: '#ffffff',
				card: {
					DEFAULT: '#1a1a1a',
					foreground: '#ffffff'
				},
				popover: {
					DEFAULT: '#1a1a1a',
					foreground: '#ffffff'
				},
				primary: {
					DEFAULT: '#ffffff',
					foreground: '#0a0a0a'
				},
				secondary: {
					DEFAULT: '#262626',
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#171717',
					foreground: '#a3a3a3'
				},
				accent: {
					DEFAULT: '#262626',
					foreground: '#ffffff'
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#ffffff'
				},
				border: '#262626',
				input: '#262626',
				ring: '#ffffff',

				// Priority colors
				priority: {
					low: '#22c55e',
					medium: '#eab308',
					high: '#f97316',
					urgent: '#ef4444'
				}
			},
			borderRadius: {
				lg: '12px',
				md: '8px',
				sm: '6px'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: [animate]
}
